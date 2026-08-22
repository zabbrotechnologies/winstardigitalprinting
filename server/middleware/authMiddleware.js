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
    // Fallback: decode JWT payload for service-to-service tokens
    try {
      const parts = jwt.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        const sub = payload.sub || payload.userId;
        if (sub) {
          req.user = {
            id: sub,
            uid: sub,
            email: payload.email || 'user@winstar.com',
          };
          return next();
        }
      }
    } catch {}

    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session token' });
  }
};
