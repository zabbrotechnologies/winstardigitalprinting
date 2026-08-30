import express from 'express';
import { supabaseAdmin, PROFILES_TABLE, WHOLESALE_TABLE } from '../supabaseServer.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/auth/register — create user in Supabase Auth + profiles table
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
    uid,
  } = req.body;

  if (!email || !full_name) {
    return res.status(400).json({ error: 'Email and full name are required' });
  }

  try {
    let userId = uid;

    if (!userId) {
      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }

      const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        user_metadata: { full_name, mobile },
        email_confirm: true,
      });

      if (authErr) throw new Error(authErr.message);
      userId = authData.user.id;
    }

    const isWholesale = account_type === 'wholesale';
    const profileData = {
      id: userId,
      email,
      full_name,
      company_name: company_name || null,
      gst_number: gst_number || null,
      business_address: business_address || null,
      mobile: mobile || null,
      business_details: business_details || null,
      visiting_card_url: visiting_card_url || null,
      business_proof_url: business_proof_url || null,
      role: isWholesale ? 'wholesale' : 'client',
      account_type: account_type || 'client',
      status: isWholesale ? 'pending' : 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: profileErr } = await supabaseAdmin.from(PROFILES_TABLE).upsert([profileData]);
    if (profileErr) console.warn('Profile save notice:', profileErr.message);

    // If wholesale, also write to dedicated table
    if (isWholesale) {
      await supabaseAdmin.from(WHOLESALE_TABLE).upsert([profileData]).catch(() => {});
    }

    res.status(201).json({
      message: 'Account registered successfully',
      userId,
      profile: { id: userId, ...profileData },
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Registration failed' });
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
        let details = {};
        if (p.business_details && typeof p.business_details === 'string' && p.business_details.startsWith('{')) {
          try { details = JSON.parse(p.business_details); } catch {}
        }
        return { ...details, ...p };
      }).filter(p => p.account_type === 'wholesale' || p.role === 'wholesale' || p.company_name);

      agencies.push(...fromProfiles);
    }

    // Deduplicate by email or id
    const seen = new Set();
    const merged = [];
    agencies.forEach(a => {
      const key = a.email || a.id;
      if (key && !seen.has(key)) { seen.add(key); merged.push(a); }
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
    await supabaseAdmin.from(WHOLESALE_TABLE).update(updatePayload).eq('id', id).catch(() => {});

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
    res.json({ id: data.id, ...data });
  } catch (err) {
    res.status(404).json({ error: 'Profile not found' });
  }
});

export default router;
