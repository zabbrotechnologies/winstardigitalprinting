export default function StatCard({ icon, label, value, iconBg, iconColor }) {
  return (
    <div className="card-glass stat-card">
      <div
        className="stat-icon-wrap"
        style={{ backgroundColor: iconBg || 'var(--primary-fixed)', color: iconColor || 'var(--primary-container)' }}
      >
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  );
}
