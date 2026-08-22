import express from 'express';
import { ID, Query } from 'node-appwrite';
import {
  users,
  databases,
  DATABASE_ID,
  USERS_COLLECTION_ID,
} from '../appwriteServer.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/auth/register
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
      const newUserId = ID.unique();
      const userRecord = await users.create(newUserId, email, undefined, password, full_name);
      userId = userRecord.$id;
    }

    const isWholesale = account_type === 'wholesale';
    const profileData = {
      userId,
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
    };

    try {
      await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        profileData
      );
    } catch {
      try {
        await databases.updateDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          userId,
          profileData
        );
      } catch {}
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

// GET /api/auth/agencies — get all wholesale agencies for admin verification
router.get('/agencies', requireAuth, async (req, res) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('account_type', 'wholesale'), Query.limit(100)]
    );
    res.json(response.documents.map(doc => ({ id: doc.$id, ...doc })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/auth/agencies/:id/verify — admin approve or reject wholesale agency
router.patch('/agencies/:id/verify', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved' | 'rejected' | 'pending'

  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Status must be approved, rejected, or pending' });
  }

  try {
    const updated = await databases.updateDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      id,
      {
        status,
        verified_at: new Date().toISOString(),
      }
    );
    res.json({ id: updated.$id, ...updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/profile/:userId
router.get('/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    try {
      const doc = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, userId);
      return res.json({ id: doc.$id, ...doc });
    } catch {
      const list = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
        Query.equal('userId', userId),
      ]);
      if (list.documents && list.documents.length > 0) {
        const doc = list.documents[0];
        return res.json({ id: doc.$id, ...doc });
      }
    }

    const userRecord = await users.get(userId);
    return res.json({
      id: userRecord.$id,
      full_name: userRecord.name || userRecord.email?.split('@')[0],
      email: userRecord.email,
    });
  } catch (err) {
    res.status(404).json({ error: 'Profile not found' });
  }
});

export default router;
