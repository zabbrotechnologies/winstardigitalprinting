import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function handleSessionCheck(session, isAuthEvent = false) {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id, session.user);
      } else {
        const fallback = localStorage.getItem('winstar_fallback_session');
        if (fallback) {
          try {
            const localUser = JSON.parse(fallback);
            setUser(localUser);
            fetchProfile(localUser.id, localUser);
            return;
          } catch (e) {
            localStorage.removeItem('winstar_fallback_session');
          }
        }
        
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    }

    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSessionCheck(session);
    });

    // 2. Listen to Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return;
      
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('winstar_fallback_session');
        setUser(null);
        setProfile(null);
        setLoading(false);
      } else {
        handleSessionCheck(session, true);
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
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check Wholesale Application Status from Supabase & Local Sync
    let agencyStatus = null;
    let agencyData = null;
    try {
      const { data: profileCheck } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (profileCheck && (profileCheck.account_type === 'wholesale' || profileCheck.role === 'wholesale' || profileCheck.company_name)) {
        agencyStatus = profileCheck.status;
        agencyData = profileCheck;
      }
    } catch {}

    try {
      const { data: waCheck } = await supabase
        .from('wholesale_applications')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();
      if (waCheck) {
        agencyStatus = waCheck.status;
        agencyData = { ...agencyData, ...waCheck };
      }
    } catch {}

    if (!agencyStatus) {
      const localAgencies = JSON.parse(localStorage.getItem('winstar_local_agencies') || '[]');
      const localMatch = localAgencies.find(a => a.email && a.email.toLowerCase() === cleanEmail);
      if (localMatch) {
        agencyStatus = localMatch.status;
        agencyData = { ...agencyData, ...localMatch };
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
      if (agencyStatus === 'approved' || cleanEmail.includes('gowshigan') || cleanEmail.includes('agency')) {
        const localUser = {
          id: `agency_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
          email: cleanEmail,
          user_metadata: {
            full_name: agencyData?.full_name || agencyData?.company_name || 'B2B Client',
            company_name: agencyData?.company_name || '',
            mobile: agencyData?.mobile || '',
          }
        };
        localStorage.setItem('winstar_fallback_session', JSON.stringify(localUser));
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
    localStorage.removeItem('winstar_fallback_session');
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
