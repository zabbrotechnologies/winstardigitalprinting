import express from 'express';
import { ID, Query } from 'node-appwrite';
import {
  databases,
  DATABASE_ID,
  ORDERS_COLLECTION_ID,
  USERS_COLLECTION_ID,
} from '../appwriteServer.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to generate Winstar Request ID: WSR-XXXXXX
function generateRequestId() {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `WSR-${randomNum}`;
}

// GET /api/orders/admin/all — get all orders for admin
router.get('/admin/all', requireAuth, async (req, res) => {
  try {
    let orders = [];
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        ORDERS_COLLECTION_ID,
        [
          Query.limit(100),
          Query.orderDesc('created_at'),
        ]
      );
      orders = response.documents.map(doc => ({ id: doc.$id, ...doc }));
    } catch {
      const fallbackResponse = await databases.listDocuments(
        DATABASE_ID,
        ORDERS_COLLECTION_ID,
        [Query.limit(100)]
      );
      orders = fallbackResponse.documents.map(doc => ({ id: doc.$id, ...doc }));
      orders.sort((a, b) => new Date(b.created_at || b.$createdAt) - new Date(a.created_at || a.$createdAt));
    }

    try {
      const usersRes = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [Query.limit(100)]);
      const userMap = {};
      usersRes.documents.forEach(u => {
        userMap[u.userId || u.$id] = u;
      });
      orders = orders.map(ord => ({
        ...ord,
        client: userMap[ord.user_id] || { full_name: ord.customer_name || 'Guest Customer', email: ord.customer_phone || 'N/A' },
      }));
    } catch {}

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/admin/stats — overall statistics for admin dashboard
router.get('/admin/stats', requireAuth, async (req, res) => {
  try {
    const [ordersRes, agenciesRes] = await Promise.all([
      databases.listDocuments(DATABASE_ID, ORDERS_COLLECTION_ID, [Query.limit(500)]),
      databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [Query.equal('account_type', 'wholesale'), Query.limit(100)]).catch(() => ({ documents: [] })),
    ]);

    let totalOrders = 0;
    let normalOrders = 0;
    let wholesaleOrders = 0;
    let pendingOrders = 0;
    let processingOrders = 0;
    let completedOrders = 0;
    let totalRevenue = 0;

    ordersRes.documents.forEach(doc => {
      totalOrders += 1;
      if (doc.order_type === 'wholesale') {
        wholesaleOrders += 1;
      } else {
        normalOrders += 1;
      }

      if (doc.status === 'Pending') pendingOrders += 1;
      if (doc.status === 'Printing' || doc.status === 'Processing') processingOrders += 1;
      if (['Printed', 'Ready for Pickup', 'Delivered', 'Completed'].includes(doc.status)) completedOrders += 1;
      totalRevenue += parseFloat(doc.total_price || 0);
    });

    const pendingAgencies = agenciesRes.documents.filter(a => a.status === 'pending').length;

    res.json({
      totalOrders,
      normalOrders,
      wholesaleOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      totalRevenue,
      pendingAgencies,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/orders/admin/:id — admin update order status
router.patch('/admin/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowedStatuses = ['Pending', 'Confirmed', 'Printing', 'Processing', 'Ready for Pickup', 'Delivered', 'Completed', 'Cancelled'];

  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${allowedStatuses.join(', ')}` });
  }

  try {
    const updatePayload = {
      updated_at: new Date().toISOString(),
    };
    if (status) updatePayload.status = status;

    const updatedDoc = await databases.updateDocument(
      DATABASE_ID,
      ORDERS_COLLECTION_ID,
      id,
      updatePayload
    );

    res.json({ id: updatedDoc.$id, ...updatedDoc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders — get all orders for the authenticated user
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id || req.user.uid;
    let orders = [];

    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        ORDERS_COLLECTION_ID,
        [
          Query.equal('user_id', userId),
          Query.orderDesc('created_at'),
        ]
      );
      orders = response.documents.map(doc => ({ id: doc.$id, ...doc }));
    } catch {
      const fallbackResponse = await databases.listDocuments(
        DATABASE_ID,
        ORDERS_COLLECTION_ID,
        [Query.equal('user_id', userId)]
      );
      orders = fallbackResponse.documents.map(doc => ({ id: doc.$id, ...doc }));
      orders.sort((a, b) => new Date(b.created_at || b.$createdAt) - new Date(a.created_at || a.$createdAt));
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/stats — dashboard stats for the authenticated user
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id || req.user.uid;
    const response = await databases.listDocuments(
      DATABASE_ID,
      ORDERS_COLLECTION_ID,
      [Query.equal('user_id', userId)]
    );

    let totalOrders = 0;
    let activeOrders = 0;
    let completedOrders = 0;
    let totalSpending = 0;

    response.documents.forEach(doc => {
      totalOrders += 1;
      if (['Pending', 'Confirmed', 'Printing', 'Processing'].includes(doc.status)) {
        activeOrders += 1;
      }
      if (['Printed', 'Ready for Pickup', 'Delivered', 'Completed'].includes(doc.status)) {
        completedOrders += 1;
      }
      totalSpending += parseFloat(doc.total_price || 0);
    });

    res.json({ totalOrders, activeOrders, completedOrders, totalSpending });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/track/:orderId — public order tracking by ID or Request ID (WSR-XXXXXX)
router.get('/track/:orderId', async (req, res) => {
  const { orderId } = req.params;
  try {
    let doc = null;
    try {
      doc = await databases.getDocument(DATABASE_ID, ORDERS_COLLECTION_ID, orderId);
    } catch {
      const list = await databases.listDocuments(DATABASE_ID, ORDERS_COLLECTION_ID, [
        Query.equal('request_id', orderId.toUpperCase()),
      ]);
      if (list.documents && list.documents.length > 0) {
        doc = list.documents[0];
      }
    }

    if (!doc) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({
      id: doc.$id,
      request_id: doc.request_id || doc.$id,
      customer_name: doc.customer_name,
      file_name: doc.file_name,
      print_type: doc.print_type,
      service_name: doc.service_name || doc.print_type,
      copies: doc.copies,
      paper_size: doc.paper_size,
      binding: doc.binding,
      status: doc.status,
      delivery_type: doc.delivery_type,
      total_price: doc.total_price,
      created_at: doc.created_at || doc.$createdAt,
    });
  } catch (err) {
    res.status(404).json({ error: 'Order not found' });
  }
});

// POST /api/orders — create order (supports Guest, Regular, and Wholesale)
router.post('/', async (req, res) => {
  const {
    customer_name,
    customer_phone,
    service_name,
    file_name,
    file_url,
    file_id,
    print_type,
    copies,
    paper_size,
    paper_gsm,
    finish,
    fold_type,
    binding,
    double_sided,
    delivery_type, // 'pickup' | 'courier'
    delivery_address,
    order_type, // 'normal' | 'wholesale'
    total_price,
  } = req.body;

  try {
    let userId = 'guest';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Decode user ID if present
      try {
        const parts = authHeader.split(' ')[1].split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          userId = payload.userId || payload.sub || 'guest';
        }
      } catch {}
    }

    const requestId = generateRequestId();
    const now = new Date().toISOString();
    const newOrder = {
      request_id: requestId,
      user_id: userId,
      customer_name: customer_name || 'Customer',
      customer_phone: customer_phone || '',
      service_name: service_name || print_type || 'Print Service',
      file_name: file_name || 'untitled',
      file_url: file_url || '',
      file_id: file_id || '',
      print_type: print_type || 'general',
      copies: parseInt(copies) || 1,
      paper_size: paper_size || 'A4',
      paper_gsm: paper_gsm || '80 GSM',
      finish: finish || 'Standard',
      fold_type: fold_type || 'None',
      binding: binding || 'none',
      double_sided: Boolean(double_sided),
      delivery_type: delivery_type || 'pickup',
      delivery_address: delivery_address || '',
      order_type: order_type || 'normal',
      total_price: parseFloat(total_price) || 0,
      status: 'Pending',
      created_at: now,
      updated_at: now,
    };

    const doc = await databases.createDocument(
      DATABASE_ID,
      ORDERS_COLLECTION_ID,
      ID.unique(),
      newOrder
    );

    res.status(201).json({ id: doc.$id, request_id: requestId, ...doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
