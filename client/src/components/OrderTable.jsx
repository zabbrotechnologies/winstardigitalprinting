function StatusChip({ status }) {
  const classMap = {
    Pending: 'chip chip-pending',
    Processing: 'chip chip-processing',
    Printed: 'chip chip-printed',
    Delivered: 'chip chip-delivered',
  };
  return <span className={classMap[status] || 'chip'}>{status}</span>;
}

export default function OrderTable({ orders, loading }) {
  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '64px 24px',
        color: 'var(--on-surface-variant)',
        background: 'var(--surface-container-low)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 48, marginBottom: 16, display: 'block', opacity: 0.4 }}>inbox</span>
        <p className="body-md">No orders yet. Start by placing a print request!</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>File Name</th>
            <th>Type</th>
            <th>Copies</th>
            <th>Size</th>
            <th>Status</th>
            <th>Total</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--on-surface-variant)' }}>
                {order.request_id ? order.request_id : `#${order.id.slice(0, 8)}`}
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--primary-container)' }}>description</span>
                  <span style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {order.file_name}
                  </span>
                </div>
              </td>
              <td style={{ textTransform: 'capitalize' }}>{order.print_type}</td>
              <td>{order.copies}</td>
              <td>{order.paper_size}</td>
              <td><StatusChip status={order.status} /></td>
              <td style={{ fontWeight: 600 }}>₹{parseFloat(order.total_price || 0).toFixed(2)}</td>
              <td style={{ color: 'var(--on-surface-variant)', fontSize: 13 }}>
                {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
