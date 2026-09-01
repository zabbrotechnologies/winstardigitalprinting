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
    const index = orders.findIndex(o => (order.id && o.id === order.id) || (order.request_id && o.request_id === order.request_id));
    if (index >= 0) {
      orders[index] = { ...orders[index], ...order };
    } else {
      orders.unshift(order);
    }
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders.slice(0, 100)));
  } catch (err) {
    console.warn('Could not save local order:', err);
  }
}

export function updateOrderStatus(orderId, newStatus) {
  try {
    const orders = getLocalOrders();
    const index = orders.findIndex(o => o.id === orderId || o.request_id === orderId);
    if (index >= 0) {
      orders[index].status = newStatus;
      orders[index].updated_at = new Date().toISOString();
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
    }
  } catch (err) {
    console.warn('Local order status update notice:', err);
  }

  // Attempt Supabase update
  return supabase.from('orders').update({ status: newStatus }).or(`id.eq.${orderId},request_id.eq.${orderId}`)
  .then(() => true)
  .catch(err => {
    console.warn('Supabase status update fallback:', err);
    return false;
  });
}

export async function deleteOrder(orderId, isWholesale = false) {
  try {
    const orders = getLocalOrders();
    const newOrders = orders.filter(o => o.id !== orderId && o.request_id !== orderId);
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(newOrders));
  } catch (err) {
    console.warn('Local order delete notice:', err);
  }

  const tableName = 'orders';
  
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(orderId);
  let query = supabase.from(tableName).delete();
  
  if (isUuid) {
    query = query.eq('id', orderId);
  } else {
    query = query.eq('request_id', orderId);
  }

  try {
    const { error } = await query;
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Supabase delete error:', err);
    // Fallback: try by request_id if it failed
    try {
      const { error: err2 } = await supabase.from(tableName).delete().eq('request_id', orderId);
      if (!err2) return true;
    } catch(e) {}
    return false;
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

export function updateAgencyStatus(agencyId, newStatus) {
  try {
    const agencies = getLocalAgencies();
    const index = agencies.findIndex(a => a.id === agencyId || a.email === agencyId);
    if (index >= 0) {
      agencies[index].status = newStatus;
      agencies[index].updated_at = new Date().toISOString();
      localStorage.setItem(LOCAL_AGENCIES_KEY, JSON.stringify(agencies));
    }
  } catch (err) {
    console.warn('Local agency status update notice:', err);
  }

  // Attempt Supabase update on both tables
  return Promise.all([
    supabase.from('wholesale_applications').update({ status: newStatus }).or(`id.eq.${agencyId},email.eq.${agencyId}`),
    supabase.from('profiles').update({ status: newStatus }).or(`id.eq.${agencyId},email.eq.${agencyId}`)
  ])
  .then(() => true)
  .catch(err => {
    console.warn('Supabase agency update fallback:', err);
    return false;
  });
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
    console.warn('Supabase storage upload failed:', err);
    throw new Error('Failed to upload file to the server. Please check your internet connection or try again.');
  }
}

/**
 * Create Order with Supabase & local persistence
 */
export async function createOrder(orderPayload, currentUser = null) {
  const isWholesale = orderPayload.order_type === 'wholesale';
  const tableName = 'orders';
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const requestId = isWholesale ? `WG-WSR-${randomNum}` : `WSR-${randomNum}`;
  const now = new Date().toISOString();
  const userId = currentUser?.id || currentUser?.$id || null;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId || '');

  // 1. Format service name
  let serviceName = orderPayload.service_name || 'Print Service';
  if (isWholesale && (orderPayload.media_type || orderPayload.media_category)) {
    serviceName = [orderPayload.media_type, orderPayload.media_category].filter(Boolean).join(' - ');
  }

  // 2. Format print specifications & finishing
  let printType = orderPayload.print_type || (orderPayload.double_sided ? 'Both Sides' : 'Single Side');
  if (orderPayload.color) {
    printType = `${orderPayload.color} (${orderPayload.double_sided ? 'Front & Back' : 'Single Side'})`;
  }

  const finishingParts = [];
  if (orderPayload.thermal_lamination?.type || orderPayload.lamination?.type) {
    finishingParts.push(`Lamination: ${orderPayload.thermal_lamination?.type || orderPayload.lamination?.type}`);
  }
  if (orderPayload.cutting?.type) {
    finishingParts.push(`Cutting: ${orderPayload.cutting?.type}`);
  }
  if (orderPayload.sticker?.type) {
    finishingParts.push(`Sticker: ${orderPayload.sticker?.type}`);
  }
  const finishingSummary = finishingParts.join(', ');

  let bindingVal = orderPayload.binding || 'None';
  if (finishingSummary) {
    bindingVal = finishingSummary;
  }

  // 3. Format customer name & contact
  let customerName = orderPayload.customer_name || currentUser?.user_metadata?.full_name || 'Customer';
  const email = orderPayload.customer_email || currentUser?.email;
  if (email && !customerName.includes(email)) {
    customerName = `${customerName} (${email})`;
  }

  // 4. Format delivery address & customer instructions
  let deliveryAddress = orderPayload.delivery_address || '';
  if (orderPayload.message_text) {
    if (orderPayload.delivery_type === 'courier') {
      deliveryAddress = (deliveryAddress || 'Courier Delivery') + ' | Note: ' + orderPayload.message_text;
    } else {
      deliveryAddress = 'Store Pickup | Note: ' + orderPayload.message_text;
    }
  }

  let paperGsm = orderPayload.paper_gsm || '80 GSM';
  if (orderPayload.sheet_type && !orderPayload.paper_gsm) {
    paperGsm = orderPayload.sheet_type;
  }

  // Database payload with strict schema adherence
  const dbPayload = {
    request_id: requestId,
    user_id: isUuid ? userId : null,
    customer_name: customerName,
    customer_phone: orderPayload.customer_phone || '',
    service_name: serviceName,
    file_name: orderPayload.file_name || 'print-file.pdf',
    file_url: orderPayload.file_url || null,
    file_id: orderPayload.file_id || null,
    print_type: printType,
    copies: parseInt(orderPayload.copies) || 1,
    paper_size: orderPayload.paper_size || 'A4',
    paper_gsm: String(paperGsm),
    binding: bindingVal,
    delivery_type: orderPayload.delivery_type || 'pickup',
    delivery_address: deliveryAddress,
    order_type: orderPayload.order_type || 'normal',
    total_price: parseFloat(orderPayload.total_price) || 0,
    status: 'Pending',
    created_at: now,
    updated_at: now,
  };

  const fullOrderData = {
    ...orderPayload,
    ...dbPayload,
    message_text: orderPayload.message_text || '',
    customer_email: email || '',
  };

  // 1. Save in Supabase
  try {
    const { data, error } = await supabase
      .from(tableName)
      .insert([dbPayload])
      .select()
      .single();

    if (!error && data) {
      const mergedOrder = { ...fullOrderData, ...data };
      saveLocalOrder(mergedOrder);
      return mergedOrder;
    }
    if (error) {
      console.warn('Supabase order insert notice:', error);
    }
  } catch (supabaseErr) {
    console.warn('Supabase order insert error:', supabaseErr);
  }

  // 2. Fallback to Local Storage
  const fallbackOrder = {
    id: `ord_${Date.now()}`,
    ...fullOrderData,
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
    const { data: normalData, error: err1 } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!err1 && normalData) remoteOrders.push(...normalData);
  } catch (err) {
    console.warn('Orders fetch notice:', err);
  }

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
    const { data: normalData, error: err1 } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!err1 && normalData) remoteOrders.push(...normalData);
  } catch (err) {
    console.warn('Admin orders fetch notice:', err);
  }

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
 * Fetch all Wholesale Agencies with robust fallback
 */
export async function fetchAllAgencies() {
  let remoteAgencies = [];

  // 1. Try dedicated wholesale_applications table
  try {
    const { data, error } = await supabase
      .from('wholesale_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      remoteAgencies.push(...data);
    }
  } catch (err) {
    console.warn('wholesale_applications fetch notice:', err);
  }

  // 2. Try profiles table (extract direct columns or parsed business_details)
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const agenciesFromProfiles = data
        .map(p => {
          let details = {};
          if (p.business_details && typeof p.business_details === 'string' && p.business_details.startsWith('{')) {
            try { details = JSON.parse(p.business_details); } catch {}
          }
          return {
            ...details,
            ...p,
            id: p.id,
            email: p.email || details.email || '',
            full_name: p.full_name || details.full_name || 'Agency Applicant',
            company_name: p.company_name || details.company_name || 'Agency',
            mobile: p.mobile || details.mobile || '',
            gst_number: p.gst_number || details.gst_number || '',
            business_address: p.business_address || details.business_address || '',
            visiting_card_url: p.visiting_card_url || details.visiting_card_url || null,
            business_proof_url: p.business_proof_url || details.business_proof_url || null,
            status: p.status || details.status || 'pending',
            created_at: p.created_at || details.created_at || new Date().toISOString(),
          };
        })
        .filter(p => p.account_type === 'wholesale' || p.role === 'wholesale' || p.status === 'pending' || p.company_name);

      remoteAgencies.push(...agenciesFromProfiles);
    }
  } catch (err) {
    console.warn('profiles fetch notice:', err);
  }

  // 3. Merge with local storage agencies
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
