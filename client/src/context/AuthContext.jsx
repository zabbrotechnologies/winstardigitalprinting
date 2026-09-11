import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initSession() {
      try {
        // 1. Initial Supabase Session Check
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id, session.user);
          return;
        }

        // 2. Fallback to persisted backend session
        const savedUserStr = localStorage.getItem('winstar_auth_user');
        if (savedUserStr) {
          try {
            const savedUser = JSON.parse(savedUserStr);
            if (savedUser && savedUser.id) {
              setUser(savedUser);
              await fetchProfile(savedUser.id, savedUser);
              return;
            }
          } catch (e) {
            localStorage.removeItem('winstar_auth_user');
          }
        }
      } catch (err) {
        console.warn('Session init error:', err);
      } finally {
        setLoading(false);
      }
    }

    initSession();

    // Listen to Supabase Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return;
      
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('winstar_auth_token');
        localStorage.removeItem('winstar_auth_user');
        localStorage.removeItem('winstar_fallback_session');
        setUser(null);
        setProfile(null);
        setLoading(false);
      } else if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id, session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId, currentUser = null) {
    try {
      const u = currentUser || user;
      const rawEmail = (u?.email || '').trim().toLowerCase();

      // 1. Fetch from profiles table by ID and/or by Email
      let doc = null;
      try {
        const { data: byId } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        doc = byId;
      } catch {}

      if (!doc && rawEmail) {
        try {
          const { data: byEmail } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', rawEmail)
            .maybeSingle();
          doc = byEmail;
        } catch {}
      }

      const email = rawEmail || (doc?.email || '').trim().toLowerCase();

      // 2. Fetch all registered details from wholesale_applications by Email
      let wholesaleDoc = null;
      if (email) {
        try {
          const { data: waData } = await supabase
            .from('wholesale_applications')
            .select('*')
            .eq('email', email)
            .maybeSingle();
          if (waData) wholesaleDoc = waData;
        } catch (e) {}
      }

      // 3. Fetch from local storage sync
      let localAgency = null;
      try {
        const localAgencies = JSON.parse(localStorage.getItem('winstar_local_agencies') || '[]');
        localAgency = localAgencies.find(a => (a.email && a.email.toLowerCase() === email) || a.id === userId);
      } catch (e) {}

      let parsedDetails = {};
      const rawDetails = doc?.business_details || localAgency?.business_details;
      if (rawDetails && typeof rawDetails === 'string' && rawDetails.startsWith('{')) {
         try { parsedDetails = JSON.parse(rawDetails); } catch {}
      }

      const company_name = wholesaleDoc?.company_name || doc?.company_name || parsedDetails?.company_name || localAgency?.company_name || '';
      const mobile = wholesaleDoc?.mobile || doc?.mobile || parsedDetails?.mobile || localAgency?.mobile || u?.user_metadata?.mobile || '';
      const full_name = wholesaleDoc?.full_name || doc?.full_name || parsedDetails?.full_name || localAgency?.full_name || u?.user_metadata?.full_name || company_name || email.split('@')[0] || 'User';
      const business_address = wholesaleDoc?.business_address || doc?.business_address || parsedDetails?.business_address || localAgency?.business_address || '';
      const gst_number = wholesaleDoc?.gst_number || doc?.gst_number || parsedDetails?.gst_number || localAgency?.gst_number || '';

      const isAdmin = (doc?.role === 'admin') || email.toLowerCase().includes('admin');
      const isWholesale = doc?.role === 'wholesale' || doc?.account_type === 'wholesale' || parsedDetails.role === 'wholesale' || parsedDetails.account_type === 'wholesale' || !!company_name || !!wholesaleDoc || String(userId).startsWith('agency_');
      
      let actualStatus = wholesaleDoc?.status || doc?.status || parsedDetails.status || localAgency?.status || 'approved';
      const isApproved = actualStatus === 'approved';

      const mergedProfile = {
        id: userId,
        email,
        full_name,
        company_name,
        mobile,
        phone: mobile,
        business_address,
        gst_number,
        isAdmin,
        isWholesale,
        isApproved,
        ...parsedDetails,
        ...localAgency,
        ...wholesaleDoc,
        ...doc,
        company_name,
        mobile,
        phone: mobile,
        status: actualStatus,
      };

      setProfile(mergedProfile);
    } catch {
      const u = currentUser || user;
      const email = (u?.email || '').trim().toLowerCase();
      let localAgency = null;
      try {
        const localAgencies = JSON.parse(localStorage.getItem('winstar_local_agencies') || '[]');
        localAgency = localAgencies.find(a => (a.email && a.email.toLowerCase() === email) || a.id === userId);
      } catch (e) {}

      const company_name = localAgency?.company_name || '';
      const mobile = localAgency?.mobile || u?.user_metadata?.mobile || '';
      const full_name = localAgency?.full_name || u?.user_metadata?.full_name || company_name || email.split('@')[0] || 'User';

      setProfile({
        id: userId,
        full_name,
        company_name,
        mobile,
        phone: mobile,
        business_address: localAgency?.business_address || '',
        gst_number: localAgency?.gst_number || '',
        email,
        isAdmin: email.toLowerCase().includes('admin'),
        isWholesale: true,
        isApproved: true,
        status: 'approved',
      });
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email, password) {
    if (!email || !email.trim()) {
      throw new Error('Email address is required');
    }
    if (!password) {
      throw new Error('Password is required');
    }

    const cleanEmail = email.trim().toLowerCase();

    // Call Backend Login API
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Invalid email or password. Please check your credentials and try again.');
    }

    if (!data.user) {
      throw new Error('Login failed. Please verify your credentials.');
    }

    // Persist session
    if (data.token) {
      localStorage.setItem('winstar_auth_token', data.token);
    }
    localStorage.setItem('winstar_auth_user', JSON.stringify(data.user));

    setUser(data.user);
    if (data.profile) {
      setProfile(data.profile);
    } else {
      await fetchProfile(data.user.id, data.user);
    }

    return data.user;
  }

  async function signUp(email, password, metadata = {}) {
    if (!email || !email.trim()) {
      throw new Error('Email address is required');
    }
    if (!password || password.length < 6) {
      throw new Error('Password is required and must be at least 6 characters long');
    }

    const cleanEmail = email.trim().toLowerCase();

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        password,
        full_name: metadata.full_name || 'User',
        company_name: metadata.company_name || null,
        gst_number: metadata.gst_number || null,
        business_address: metadata.business_address || null,
        mobile: metadata.mobile || null,
        business_details: metadata.business_details || null,
        visiting_card_url: metadata.visiting_card_url || null,
        business_proof_url: metadata.business_proof_url || null,
        account_type: metadata.account_type || 'client',
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed. Please check your details.');
    }

    if (data.profile) {
      const userObj = { id: data.userId, email: cleanEmail, ...data.profile };
      setUser(userObj);
      setProfile(data.profile);
      localStorage.setItem('winstar_auth_user', JSON.stringify(userObj));
    }

    return { id: data.userId, email: cleanEmail, ...(data.profile || {}) };
  }

  async function signOut() {
    localStorage.removeItem('winstar_auth_token');
    localStorage.removeItem('winstar_auth_user');
    localStorage.removeItem('winstar_fallback_session');
    await supabase.auth.signOut().catch(() => {});
    setUser(null);
    setProfile(null);
  }

  async function getAccessToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || localStorage.getItem('winstar_auth_token') || null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        getAccessToken,
        refreshProfile: () => user && fetchProfile(user.id, user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
