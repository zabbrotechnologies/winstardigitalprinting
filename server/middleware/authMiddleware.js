import { supabaseAdmin } from '../supabaseServer.js';

/**
 * Middleware to verify Supabase JWT Token from Authorization header.
 * Attaches authenticated user object to req.user on success.
 */
export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const jwt = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(jwt);

    if (error || !user) {
      throw new Error(error?.message || 'Invalid token');
    }

    req.user = {
      id: user.id,
      uid: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email,
      ...user,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session token' });
  }
};

/**
 * Middleware to enforce Admin role. Must be used after requireAuth.
 */
export const requireAdmin = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Unauthorized: No user found' });
  }

  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role, account_type')
      .eq('id', req.user.id)
      .single();

    if (error || !profile) {
      return res.status(403).json({ error: 'Forbidden: Profile not found' });
    }

    if (profile.role !== 'admin' && profile.account_type !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    next();
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
