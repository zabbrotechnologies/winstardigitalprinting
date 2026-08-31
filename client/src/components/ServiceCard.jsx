export default function ServiceCard({ icon, title, description, image, onClick }) {
  return (
    <div 
      className="service-card" 
      onClick={onClick} 
      role={onClick ? "button" : undefined} 
      tabIndex={onClick ? 0 : undefined}
      style={{
        ...(image ? {
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.8)), url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#ffffff',
          border: 'none',
          minHeight: '220px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
        } : {}),
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div className="service-icon" style={image ? { background: 'rgba(255,255,255,0.2)', color: '#ffffff', backdropFilter: 'blur(4px)', width: 'fit-content' } : {}}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div style={{ position: 'relative', zIndex: 2, marginTop: image ? 'auto' : 0 }}>
        <h3 className="headline-sm" style={{ fontSize: 20, marginBottom: 8, color: image ? '#ffffff' : 'inherit' }}>{title}</h3>
        <p className="body-md" style={{ color: image ? 'rgba(255,255,255,0.85)' : 'var(--on-surface-variant)' }}>{description}</p>
      </div>
    </div>
  );
}
