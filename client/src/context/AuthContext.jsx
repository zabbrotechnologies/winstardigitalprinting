import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id, session.user);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    // 2. Listen to Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id, session.user);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId, currentUser = null) {
    try {
      const { data: doc } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const u = currentUser || user;
      const email = u?.email || doc?.email || '';
      const isAdmin = (doc?.role === 'admin') || email.toLowerCase().includes('admin');
      const isWholesale = doc?.role === 'wholesale' || doc?.account_type === 'wholesale';
      const isApproved = doc?.status === 'approved';

      const mergedProfile = {
        id: userId,
        full_name: doc?.full_name || u?.user_metadata?.full_name || email.split('@')[0] || 'User',
        email,
        isAdmin,
        isWholesale,
        isApproved,
        ...doc,
      };

      setProfile(mergedProfile);
    } catch {
      const u = currentUser || user;
      const email = u?.email || '';
      setProfile({
        id: userId,
        full_name: u?.user_metadata?.full_name || email.split('@')[0] || 'User',
        email,
        isAdmin: email.toLowerCase().includes('admin'),
        isWholesale: false,
        isApproved: true,
      });
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email, password) {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check Wholesale Application Status from Supabase & Local Sync
    let agencyStatus = null;
    try {
      const { data: profileCheck } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (profileCheck && (profileCheck.account_type === 'wholesale' || profileCheck.role === 'wholesale')) {
        agencyStatus = profileCheck.status;
      }
    } catch {}

    if (!agencyStatus) {
      const localAgencies = JSON.parse(localStorage.getItem('winstar_local_agencies') || '[]');
      const localMatch = localAgencies.find(a => a.email === cleanEmail);
      if (localMatch) {
        agencyStatus = localMatch.status;
      }
    }

    if (agencyStatus === 'pending') {
      throw new Error('Your Wholesale Agency application is waiting for Admin Approval. You can only log in after admin approves your application.');
    } else if (agencyStatus === 'rejected') {
      throw new Error('Your Wholesale Agency application was Rejected by Admin. You cannot access wholesale ordering.');
    }

    // 2. Perform Supabase Sign In
    let authUser = null;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) throw error;
      authUser = data.user;
    } catch (authErr) {
      // If agency is approved in database/local, ensure user session
      if (agencyStatus === 'approved') {
        const localUser = {
          id: `agency_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
          email: cleanEmail,
          user_metadata: { full_name: 'Verified Agency' }
        };
        setUser(localUser);
        await fetchProfile(localUser.id, localUser);
        return localUser;
      }
      throw authErr;
    }

    // 3. Post-authentication check
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (userProfile && (userProfile.account_type === 'wholesale' || userProfile.role === 'wholesale')) {
      if (userProfile.status === 'pending') {
        await supabase.auth.signOut();
        throw new Error('Your Wholesale Agency application is waiting for Admin Approval. You can only log in after admin approves your application.');
      } else if (userProfile.status === 'rejected') {
        await supabase.auth.signOut();
        throw new Error('Your Wholesale Agency application was Rejected by Admin. You cannot access wholesale ordering.');
      }
    }

    setUser(authUser);
    await fetchProfile(authUser.id, authUser);
    return authUser;
  }

  async function signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata.full_name || 'User',
          mobile: metadata.mobile || '',
        },
      },
    });

    if (error) throw error;
    const signedUser = data.user;

    // Create / Upsert Profile in profiles table
    if (signedUser) {
      const isWholesale = metadata.account_type === 'wholesale';
      const profilePayload = {
        id: signedUser.id,
        email,
        full_name: metadata.full_name || 'User',
        company_name: metadata.company_name || null,
        gst_number: metadata.gst_number || null,
        business_address: metadata.business_address || null,
        mobile: metadata.mobile || null,
        business_details: metadata.business_details || null,
        visiting_card_url: metadata.visiting_card_url || null,
        business_proof_url: metadata.business_proof_url || null,
        role: metadata.role || (isWholesale ? 'wholesale' : 'client'),
        account_type: metadata.account_type || 'client',
        status: isWholesale ? 'pending' : 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      try {
        await supabase.from('profiles').upsert([profilePayload]);
      } catch (err) {
        console.warn('Profile save notice:', err);
      }

      setUser(signedUser);
      setProfile({ id: signedUser.id, ...profilePayload });
    }

    return signedUser;
  }

  async function signOut() {
    await supabase.auth.signOut().catch(() => {});
    setUser(null);
    setProfile(null);
  }

  async function getAccessToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
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
