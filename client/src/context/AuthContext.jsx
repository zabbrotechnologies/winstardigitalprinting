import { createContext, useContext, useEffect, useState } from 'react';
import { ID, Query } from 'appwrite';
import {
  account,
  databases,
  DATABASE_ID,
  USERS_COLLECTION_ID,
} from '../lib/appwrite';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    checkCurrentUser();
  }, []);

  async function checkCurrentUser() {
    try {
      const currentAccount = await account.get();
      setUser(currentAccount);
      await fetchProfile(currentAccount.$id, currentAccount);
    } catch {
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProfile(userId, currentUser = null) {
    try {
      const doc = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, userId);
      const u = currentUser || user;
      const isAdmin = (doc?.role === 'admin') || (doc?.email?.toLowerCase().includes('admin')) || (u?.email?.toLowerCase().includes('admin')) || (u?.labels?.includes('admin'));
      const isWholesale = doc?.role === 'wholesale' || doc?.account_type === 'wholesale';
      const isApproved = doc?.status === 'approved';
      setProfile({ id: doc.$id, isAdmin, isWholesale, isApproved, ...doc });
    } catch {
      try {
        const response = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
          Query.equal('userId', userId),
        ]);
        if (response.documents && response.documents.length > 0) {
          const doc = response.documents[0];
          const u = currentUser || user;
          const isAdmin = (doc?.role === 'admin') || (doc?.email?.toLowerCase().includes('admin')) || (u?.email?.toLowerCase().includes('admin')) || (u?.labels?.includes('admin'));
          const isWholesale = doc?.role === 'wholesale' || doc?.account_type === 'wholesale';
          const isApproved = doc?.status === 'approved';
          setProfile({ id: doc.$id, isAdmin, isWholesale, isApproved, ...doc });
          return;
        }
      } catch {}

      const u = currentUser || user;
      const isAdmin = (u?.email?.toLowerCase().includes('admin')) || (u?.labels?.includes('admin'));
      const basicProfile = {
        id: userId,
        userId: userId,
        full_name: u?.name || u?.email?.split('@')[0] || 'User',
        email: u?.email,
        isAdmin,
        isWholesale: false,
        isApproved: true,
      };
      setProfile(basicProfile);
    }
  }

  async function signIn(email, password) {
    try {
      await account.deleteSession('current').catch(() => {});
    } catch {}

    await account.createEmailPasswordSession(email, password);
    const currentAccount = await account.get();
    setUser(currentAccount);
    await fetchProfile(currentAccount.$id, currentAccount);
    return currentAccount;
  }

  async function signUp(email, password, metadata) {
    const userId = ID.unique();
    await account.create(userId, email, password, metadata.full_name || 'User');
    
    await account.createEmailPasswordSession(email, password);
    const currentAccount = await account.get();
    setUser(currentAccount);

    const isWholesale = metadata.account_type === 'wholesale';
    const profilePayload = {
      userId: currentAccount.$id,
      email,
      full_name: metadata.full_name,
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
    };

    try {
      await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        currentAccount.$id,
        profilePayload
      );
    } catch {
      try {
        await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: currentAccount.$id, ...profilePayload }),
        });
      } catch {}
    }

    setProfile({ id: currentAccount.$id, ...profilePayload });
    return currentAccount;
  }

  async function signOut() {
    try {
      await account.deleteSession('current');
    } catch {}
    setUser(null);
    setProfile(null);
  }

  async function getAccessToken() {
    try {
      const jwtResponse = await account.createJWT();
      return jwtResponse.jwt;
    } catch {
      return null;
    }
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
        refreshProfile: () => user && fetchProfile(user.$id, user),
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
