export default function ServiceCard({ icon, title, description, onClick }) {
  return (
    <div className="service-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="service-icon">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <h3 className="headline-sm" style={{ fontSize: 20, marginBottom: 8 }}>{title}</h3>
        <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>{description}</p>
      </div>
    </div>
  );
}
