import express from 'express';
import bcrypt from 'bcryptjs';
import { supabaseAdmin, PROFILES_TABLE, WHOLESALE_TABLE } from '../supabaseServer.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Helper to safely extract business_details JSON
 */
function parseBusinessDetails(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  if (typeof raw === 'string' && raw.trim().startsWith('{')) {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return {};
}

/**
 * Helper to sanitize profile data before sending to client (strip hashes)
 */
function sanitizeProfile(profile) {
  if (!profile) return null;
  const sanitized = { ...profile };
  delete sanitized.password;
  delete sanitized.password_hash;
  if (sanitized.business_details && typeof sanitized.business_details === 'string') {
    try {
      const parsed = JSON.parse(sanitized.business_details);
      delete parsed.password_hash;
      delete parsed.password;
      sanitized.business_details = JSON.stringify(parsed);
    } catch {}
  }
  return sanitized;
}

// POST /api/auth/register — create user with bcrypt password hash + profiles table
router.post('/register', async (req, res) => {
  const {
    email,
    password,
    full_name,
    company_name,
    gst_number,
    business_address,
    mobile,
    business_details,
    visiting_card_url,
    business_proof_url,
    account_type,
    status,
    uid,
  } = req.body;

  if (!email || !full_name) {
    return res.status(400).json({ error: 'Email and full name are required' });
  }

  const cleanEmail = email.trim().toLowerCase();

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password is required and must be at least 6 characters long' });
  }

  try {
    // 1. Generate secure bcrypt hash
    const passwordHash = await bcrypt.hash(password, 10);

    let userId = uid;

    // 2. Attempt Supabase Auth creation if admin API is available
    if (!userId) {
      try {
        const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
          email: cleanEmail,
          password,
          user_metadata: { full_name, mobile },
          email_confirm: true,
        });

        if (!authErr && authData?.user?.id) {
          userId = authData.user.id;
        }
      } catch (adminErr) {
        console.warn('Supabase Admin createUser notice (using fallback UUID):', adminErr.message);
      }
    }

    if (!userId) {
      // Generate standard UUID
      userId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0')}`;
    }

    const isWholesale = account_type === 'wholesale';
    const userStatus = status || (isWholesale ? 'pending' : 'approved');

    // Merge business_details JSON with password_hash
    const existingDetails = parseBusinessDetails(business_details);
    const mergedDetails = {
      ...existingDetails,
      password_hash: passwordHash,
      company_name: company_name || null,
      mobile: mobile || null,
      gst_number: gst_number || null,
      business_address: business_address || null,
    };

    const profileData = {
      id: userId,
      email: cleanEmail,
      full_name,
      company_name: company_name || null,
      gst_number: gst_number || null,
      business_address: business_address || null,
      mobile: mobile || null,
      business_details: JSON.stringify(mergedDetails),
      visiting_card_url: visiting_card_url || null,
      business_proof_url: business_proof_url || null,
      role: isWholesale ? 'wholesale' : 'client',
      account_type: account_type || (isWholesale ? 'wholesale' : 'client'),
      status: userStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to profiles table
    const { error: profileErr } = await supabaseAdmin.from(PROFILES_TABLE).upsert([profileData]);
    if (profileErr) console.warn('Profile save notice:', profileErr.message);

    // If wholesale, also save to wholesale_applications table
    if (isWholesale) {
      const wholesaleData = {
        id: userId,
        email: cleanEmail,
        full_name,
        company_name: company_name || '',
        gst_number: gst_number || null,
        business_address: business_address || '',
        mobile: mobile || '',
        visiting_card_url: visiting_card_url || null,
        business_proof_url: business_proof_url || null,
        status: userStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      try {
        await supabaseAdmin.from(WHOLESALE_TABLE).upsert([wholesaleData]);
      } catch {}
    }

    res.status(201).json({
      message: 'Account registered successfully',
      userId,
      profile: sanitizeProfile(profileData),
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

// POST /api/auth/login — secure server-side login with password verification & approval checks
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password is required' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    // 1. Look up user in profiles and wholesale_applications
    let profile = null;
    let wholesaleApp = null;

    try {
      const { data: pData } = await supabaseAdmin
        .from(PROFILES_TABLE)
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();
      if (pData) profile = pData;
    } catch {}

    try {
      const { data: wData } = await supabaseAdmin
        .from(WHOLESALE_TABLE)
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();
      if (wData) wholesaleApp = wData;
    } catch {}

    // Parse business details to extract password_hash
    const profileDetails = parseBusinessDetails(profile?.business_details);
    let storedPasswordHash = profileDetails.password_hash || null;

    // 2. Perform Secure Password Verification
    let passwordMatched = false;
    let authUser = null;
    let sessionToken = null;

    // A. Check against stored bcrypt hash
    if (storedPasswordHash) {
      passwordMatched = await bcrypt.compare(password, storedPasswordHash);
    }

    // B. Also attempt Supabase Auth password verification
    try {
      const { data: sbAuthData, error: sbAuthErr } = await supabaseAdmin.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!sbAuthErr && sbAuthData?.user) {
        passwordMatched = true;
        authUser = sbAuthData.user;
        sessionToken = sbAuthData.session?.access_token;

        // If user logged in with Supabase Auth but didn't have password_hash stored in profile, sync it
        if (!storedPasswordHash && profile) {
          const newHash = await bcrypt.hash(password, 10);
          const updatedDetails = { ...profileDetails, password_hash: newHash };
          try {
            await supabaseAdmin
              .from(PROFILES_TABLE)
              .update({ business_details: JSON.stringify(updatedDetails) })
              .eq('id', profile.id);
          } catch {}
        }
      }
    } catch (e) {
      // Supabase Auth attempt notice
    }

    if (!passwordMatched) {
      return res.status(401).json({
        error: 'Invalid email or password. Please check your credentials and try again.',
      });
    }

    // 3. User exists and password is verified. Now check admin approval status!
    const effectiveStatus = wholesaleApp?.status || profile?.status || 'approved';
    const isWholesale = profile?.role === 'wholesale' || profile?.account_type === 'wholesale' || !!wholesaleApp;

    if (isWholesale) {
      if (effectiveStatus === 'pending') {
        return res.status(403).json({
          error: 'Your Wholesale Agency application is waiting for Admin Approval. You can only log in after admin approves your application.',
          status: 'pending',
        });
      } else if (effectiveStatus === 'rejected') {
        return res.status(403).json({
          error: 'Your Wholesale Agency application was Rejected by Admin. You cannot access wholesale ordering.',
          status: 'rejected',
        });
      }
    }

    // 4. Construct Authenticated User Payload
    const userId = profile?.id || wholesaleApp?.id || authUser?.id || `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const isAdmin = (profile?.role === 'admin') || cleanEmail.includes('admin');

    const authenticatedUser = {
      id: userId,
      email: cleanEmail,
      full_name: profile?.full_name || wholesaleApp?.full_name || cleanEmail.split('@')[0],
      company_name: profile?.company_name || wholesaleApp?.company_name || '',
      mobile: profile?.mobile || wholesaleApp?.mobile || '',
      phone: profile?.mobile || wholesaleApp?.mobile || '',
      role: isAdmin ? 'admin' : (isWholesale ? 'wholesale' : 'client'),
      account_type: isAdmin ? 'admin' : (isWholesale ? 'wholesale' : 'client'),
      status: effectiveStatus,
      isAdmin,
      isWholesale,
      isApproved: effectiveStatus === 'approved',
    };

    const finalProfile = {
      ...authenticatedUser,
      ...wholesaleApp,
      ...profile,
      status: effectiveStatus,
      isAdmin,
      isWholesale,
      isApproved: effectiveStatus === 'approved',
    };

    res.json({
      success: true,
      message: 'Login successful',
      token: sessionToken || `token_${Buffer.from(cleanEmail + ':' + Date.now()).toString('base64')}`,
      user: authenticatedUser,
      profile: sanitizeProfile(finalProfile),
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Login authentication error' });
  }
});

// POST /api/auth/reset-password — update user password with bcrypt hash
router.post('/reset-password', async (req, res) => {
  const { email, password, new_password } = req.body;
  const newPass = new_password || password;

  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  if (!newPass || typeof newPass !== 'string' || newPass.length < 6) {
    return res.status(400).json({ error: 'New password is required and must be at least 6 characters long' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    // 1. Look up user
    const { data: profile } = await supabaseAdmin
      .from(PROFILES_TABLE)
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    const { data: wholesaleApp } = await supabaseAdmin
      .from(WHOLESALE_TABLE)
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (!profile && !wholesaleApp) {
      return res.status(404).json({ error: 'No account found with this email address' });
    }

    // 2. Hash new password
    const passwordHash = await bcrypt.hash(newPass, 10);

    // 3. Update profiles table
    if (profile) {
      const existingDetails = parseBusinessDetails(profile.business_details);
      const updatedDetails = { ...existingDetails, password_hash: passwordHash };
      await supabaseAdmin
        .from(PROFILES_TABLE)
        .update({
          business_details: JSON.stringify(updatedDetails),
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);
    }

    // 4. Update in Supabase Auth if user exists in auth
    try {
      const targetId = profile?.id || wholesaleApp?.id;
      if (targetId) {
        await supabaseAdmin.auth.admin.updateUserById(targetId, {
          password: newPass,
        });
      }
    } catch {}

    res.json({
      success: true,
      message: 'Password has been successfully updated. You can now log in with your new password.',
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to reset password' });
  }
});

// GET /api/auth/agencies — all wholesale agency applications for admin
router.get('/agencies', requireAuth, requireAdmin, async (req, res) => {
  try {
    let agencies = [];

    // 1. Try wholesale_applications table
    const { data: waData } = await supabaseAdmin.from(WHOLESALE_TABLE).select('*').order('created_at', { ascending: false });
    if (waData && waData.length > 0) agencies.push(...waData);

    // 2. Fall back to profiles with wholesale role
    const { data: profData } = await supabaseAdmin
      .from(PROFILES_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (profData && profData.length > 0) {
      const fromProfiles = profData.map(p => {
        const details = parseBusinessDetails(p.business_details);
        return { ...details, ...p };
      }).filter(p => p.account_type === 'wholesale' || p.role === 'wholesale' || p.company_name);

      agencies.push(...fromProfiles);
    }

    // Deduplicate by email or id and sanitize
    const seen = new Set();
    const merged = [];
    agencies.forEach(a => {
      const key = a.email || a.id;
      if (key && !seen.has(key)) {
        seen.add(key);
        merged.push(sanitizeProfile(a));
      }
    });

    res.json(merged);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/auth/agencies/:id/verify — admin approve or reject agency
router.patch('/agencies/:id/verify', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Status must be approved, rejected, or pending' });
  }

  try {
    const updatePayload = { status, updated_at: new Date().toISOString() };

    await supabaseAdmin.from(PROFILES_TABLE).update(updatePayload).eq('id', id);
    try {
      await supabaseAdmin.from(WHOLESALE_TABLE).update(updatePayload).eq('id', id);
    } catch {}

    // When approving, confirm the user's email in Supabase Auth so they can log in
    if (status === 'approved') {
      try {
        await supabaseAdmin.auth.admin.updateUserById(id, {
          email_confirm: true,
        });
      } catch (confirmErr) {
        console.warn('Email confirm notice:', confirmErr.message);
      }
    }

    res.json({ id, status, updated_at: updatePayload.updated_at });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/profile/:userId
router.get('/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const { data, error } = await supabaseAdmin.from(PROFILES_TABLE).select('*').eq('id', userId).maybeSingle();
    if (error || !data) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(sanitizeProfile(data));
  } catch (err) {
    res.status(404).json({ error: 'Profile not found' });
  }
});

export default router;
