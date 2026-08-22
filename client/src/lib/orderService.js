import { supabase } from './supabase';

/**
 * Generate standard Winstar Request Tracking ID (WSR-XXXXXX)
 */
export function generateRequestId() {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `WSR-${randomNum}`;
}

const LOCAL_ORDERS_KEY = 'winstar_local_orders';
const LOCAL_AGENCIES_KEY = 'winstar_local_agencies';

export function getLocalOrders() {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalOrder(order) {
  try {
    const orders = getLocalOrders();
    orders.unshift(order);
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders.slice(0, 100)));
  } catch (err) {
    console.warn('Could not save local order:', err);
  }
}

export function getLocalAgencies() {
  try {
    const raw = localStorage.getItem(LOCAL_AGENCIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalAgency(agency) {
  try {
    const agencies = getLocalAgencies();
    const index = agencies.findIndex(a => (agency.email && a.email === agency.email) || (agency.id && a.id === agency.id));
    if (index >= 0) {
      agencies[index] = { ...agencies[index], ...agency };
    } else {
      agencies.unshift(agency);
    }
    localStorage.setItem(LOCAL_AGENCIES_KEY, JSON.stringify(agencies));
  } catch (err) {
    console.warn('Could not save local agency:', err);
  }
}

/**
 * Upload file directly to Supabase Storage ('print-files' bucket)
 */
export async function uploadPrintFile(file) {
  if (!file) return null;
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  try {
    const { data, error } = await supabase.storage
      .from('print-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('print-files')
      .getPublicUrl(filePath);

    return {
      fileId: filePath,
      fileName: file.name,
      publicUrl,
      downloadUrl: publicUrl,
      sizeOriginal: file.size,
      mimeType: file.type,
    };
  } catch (err) {
    console.warn('Supabase storage upload fallback:', err);
    const objectUrl = URL.createObjectURL(file);
    return {
      fileId: `local_${Date.now()}`,
      fileName: file.name,
      publicUrl: objectUrl,
      downloadUrl: objectUrl,
      sizeOriginal: file.size,
      mimeType: file.type,
    };
  }
}

/**
 * Create Order with Supabase & local persistence
 */
export async function createOrder(orderPayload, currentUser = null) {
  const requestId = generateRequestId();
  const now = new Date().toISOString();
  const userId = currentUser?.id || currentUser?.$id || 'guest';

  const orderData = {
    request_id: requestId,
    user_id: userId,
    customer_name: orderPayload.customer_name || currentUser?.user_metadata?.full_name || 'Customer',
    customer_phone: orderPayload.customer_phone || '',
    service_name: orderPayload.service_name || 'Print Service',
    file_name: orderPayload.file_name || 'print-file.pdf',
    file_url: orderPayload.file_url || '',
    file_id: orderPayload.file_id || '',
    print_type: orderPayload.print_type || 'bw',
    copies: parseInt(orderPayload.copies) || 1,
    paper_size: orderPayload.paper_size || 'A4',
    paper_gsm: orderPayload.paper_gsm || '80 GSM',
    binding: orderPayload.binding || 'none',
    delivery_type: orderPayload.delivery_type || 'pickup',
    delivery_address: orderPayload.delivery_address || '',
    order_type: orderPayload.order_type || 'normal',
    total_price: parseFloat(orderPayload.total_price) || 0,
    status: 'Pending',
    created_at: now,
    updated_at: now,
  };

  // 1. Save in Supabase
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (!error && data) {
      saveLocalOrder(data);
      return data;
    }
  } catch (supabaseErr) {
    console.warn('Supabase order insert notice:', supabaseErr);
  }

  // 2. Fallback to Local Storage
  const fallbackOrder = {
    id: `ord_${Date.now()}`,
    ...orderData,
  };
  saveLocalOrder(fallbackOrder);
  return fallbackOrder;
}

/**
 * Fetch orders for user
 */
export async function fetchUserOrders(userId) {
  let remoteOrders = [];

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) remoteOrders = data;
  } catch {}

  const localOrders = getLocalOrders().filter(o => o.user_id === userId || o.user_id === 'guest');
  const seen = new Set();
  const merged = [];

  [...remoteOrders, ...localOrders].forEach(ord => {
    const key = ord.request_id || ord.id;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(ord);
    }
  });

  return merged;
}

/**
 * Fetch all orders for Admin
 */
export async function fetchAllAdminOrders() {
  let remoteOrders = [];

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) remoteOrders = data;
  } catch {}

  const localOrders = getLocalOrders();
  const seen = new Set();
  const merged = [];

  [...remoteOrders, ...localOrders].forEach(ord => {
    const key = ord.request_id || ord.id;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(ord);
    }
  });

  return merged;
}

/**
 * Fetch all Wholesale Agencies with triple-fallback
 */
export async function fetchAllAgencies() {
  let remoteAgencies = [];

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or('account_type.eq.wholesale,role.eq.wholesale,status.eq.pending,status.eq.rejected')
      .order('created_at', { ascending: false });

    if (!error && data) remoteAgencies = data;
  } catch (err) {
    console.warn('Supabase agencies fetch notice:', err);
  }

  const localAgencies = getLocalAgencies();
  const seen = new Set();
  const merged = [];

  [...remoteAgencies, ...localAgencies].forEach(ag => {
    const key = ag.email || ag.id;
    if (key && !seen.has(key)) {
      seen.add(key);
      merged.push(ag);
    }
  });

  return merged;
}
