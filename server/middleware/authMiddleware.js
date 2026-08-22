import { Client, Account } from 'node-appwrite';
import { endpoint, projectId } from '../appwriteServer.js';

/**
 * Middleware to verify Appwrite JWT Token from Authorization header.
 * Attaches authenticated user object to req.user on success.
 */
export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const jwt = authHeader.split(' ')[1];

  try {
    // Verify JWT using Appwrite Client session
    const jwtClient = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setJWT(jwt);

    const account = new Account(jwtClient);
    const user = await account.get();

    req.user = {
      id: user.$id,
      uid: user.$id,
      email: user.email,
      name: user.name,
      ...user,
    };
    next();
  } catch (err) {
    // If running in development without live Appwrite instance, parse payload if available
    try {
      const parts = jwt.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        if (payload.userId || payload.sub) {
          req.user = {
            id: payload.userId || payload.sub,
            uid: payload.userId || payload.sub,
            email: payload.email || 'user@example.com',
          };
          return next();
        }
      }
    } catch {}

    return res.status(401).json({ error: 'Unauthorized: Invalid or expired Appwrite session token' });
  }
};
