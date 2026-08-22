import express from 'express';
import { supabaseAdmin, ORDERS_TABLE, PROFILES_TABLE } from '../supabaseServer.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

function generateRequestId() {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `WSR-${randomNum}`;
}

// GET /api/orders/admin/all — all orders for admin
router.get('/admin/all', requireAuth, async (req, res) => {
  try {
    const { data: orders, error } = await supabaseAdmin
      .from(ORDERS_TABLE)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw new Error(error.message);

    // Enrich with profile data where available
    let enriched = orders || [];
    try {
      const { data: profiles } = await supabaseAdmin.from(PROFILES_TABLE).select('id, full_name, email, mobile');
      if (profiles && profiles.length > 0) {
        const profileMap = {};
        profiles.forEach(p => { profileMap[p.id] = p; });
        enriched = enriched.map(o => ({
          ...o,
          client: profileMap[o.user_id] || { full_name: o.customer_name || 'Guest', email: '' },
        }));
      }
    } catch {}

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/admin/stats — dashboard stats
router.get('/admin/stats', requireAuth, async (req, res) => {
  try {
    const { data: orders } = await supabaseAdmin.from(ORDERS_TABLE).select('status, order_type, total_price').limit(1000);
    const { data: agencies } = await supabaseAdmin.from(PROFILES_TABLE).select('status, account_type, role').limit(500);

    let totalOrders = 0, normalOrders = 0, wholesaleOrders = 0;
    let pendingOrders = 0, processingOrders = 0, completedOrders = 0, totalRevenue = 0;

    (orders || []).forEach(doc => {
      totalOrders++;
      if (doc.order_type === 'wholesale') wholesaleOrders++; else normalOrders++;
      if (doc.status === 'Pending') pendingOrders++;
      if (doc.status === 'Printing' || doc.status === 'Processing') processingOrders++;
      if (['Printed', 'Ready for Pickup', 'Delivered', 'Completed'].includes(doc.status)) completedOrders++;
      totalRevenue += parseFloat(doc.total_price || 0);
    });

    const pendingAgencies = (agencies || []).filter(a =>
      (a.account_type === 'wholesale' || a.role === 'wholesale') && a.status === 'pending'
    ).length;

    res.json({ totalOrders, normalOrders, wholesaleOrders, pendingOrders, processingOrders, completedOrders, totalRevenue, pendingAgencies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/orders/admin/:id — update order status
router.patch('/admin/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowedStatuses = ['Pending', 'Confirmed', 'Printing', 'Processing', 'Ready for Pickup', 'Delivered', 'Completed', 'Cancelled'];

  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${allowedStatuses.join(', ')}` });
  }

  try {
    const updatePayload = { updated_at: new Date().toISOString() };
    if (status) updatePayload.status = status;

    const { data, error } = await supabaseAdmin
      .from(ORDERS_TABLE)
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders — user's own orders
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabaseAdmin
      .from(ORDERS_TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/stats — user dashboard stats
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabaseAdmin
      .from(ORDERS_TABLE)
      .select('status, total_price')
      .eq('user_id', userId);

    if (error) throw new Error(error.message);

    let totalOrders = 0, activeOrders = 0, completedOrders = 0, totalSpending = 0;
    (data || []).forEach(doc => {
      totalOrders++;
      if (['Pending', 'Confirmed', 'Printing', 'Processing'].includes(doc.status)) activeOrders++;
      if (['Printed', 'Ready for Pickup', 'Delivered', 'Completed'].includes(doc.status)) completedOrders++;
      totalSpending += parseFloat(doc.total_price || 0);
    });

    res.json({ totalOrders, activeOrders, completedOrders, totalSpending });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/track/:orderId — public order tracking
router.get('/track/:orderId', async (req, res) => {
  const { orderId } = req.params;
  try {
    let doc = null;

    // Try by UUID id
    const { data: byId } = await supabaseAdmin.from(ORDERS_TABLE).select('*').eq('id', orderId).maybeSingle();
    if (byId) { doc = byId; }

    // Try by request_id (WSR-XXXXXX)
    if (!doc) {
      const { data: byReqId } = await supabaseAdmin
        .from(ORDERS_TABLE)
        .select('*')
        .eq('request_id', orderId.toUpperCase())
        .maybeSingle();
      if (byReqId) doc = byReqId;
    }

    if (!doc) return res.status(404).json({ error: 'Order not found' });

    res.json({
      id: doc.id,
      request_id: doc.request_id || doc.id,
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
      created_at: doc.created_at,
    });
  } catch (err) {
    res.status(404).json({ error: 'Order not found' });
  }
});

// POST /api/orders — create order
router.post('/', async (req, res) => {
  const {
    customer_name, customer_phone, service_name, file_name, file_url, file_id,
    print_type, copies, paper_size, paper_gsm, finish, fold_type, binding,
    double_sided, delivery_type, delivery_address, order_type, total_price,
  } = req.body;

  try {
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const parts = authHeader.split(' ')[1].split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          userId = payload.sub || payload.userId || null;
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
      print_type: print_type || 'bw',
      copies: parseInt(copies) || 1,
      paper_size: paper_size || 'A4',
      paper_gsm: paper_gsm || '80 GSM',
      binding: binding || 'none',
      delivery_type: delivery_type || 'pickup',
      delivery_address: delivery_address || '',
      order_type: order_type || 'normal',
      total_price: parseFloat(total_price) || 0,
      status: 'Pending',
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabaseAdmin.from(ORDERS_TABLE).insert([newOrder]).select().single();
    if (error) throw new Error(error.message);

    res.status(201).json({ id: data.id, request_id: requestId, ...data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
