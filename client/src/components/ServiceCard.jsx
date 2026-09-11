export default function ServiceCard({
  icon,
  title,
  description,
  image,
  onClick,
  isExpandable = false,
  isExpanded = false,
  detailsType = null,
  onToggleExpand = null,
}) {
  const handleClick = (e) => {
    if (isExpandable && onToggleExpand) {
      onToggleExpand();
    } else if (onClick) {
      onClick(e);
    }
  };

  return (
    <div
      className={`service-card ${isExpanded ? 'is-expanded' : ''} ${isExpandable ? 'is-expandable' : ''}`}
      onClick={handleClick}
      role={isExpandable || onClick ? 'button' : undefined}
      tabIndex={isExpandable || onClick ? 0 : undefined}
      style={{
        ...(image ? {
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.88)), url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#ffffff',
          border: 'none',
        } : {}),
        cursor: isExpandable || onClick ? 'pointer' : 'default',
      }}
    >
      {/* Top Bar: Icon + Expand Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', position: 'relative', zIndex: 2 }}>
        <div className="service-icon" style={image ? { background: 'rgba(255,255,255,0.2)', color: '#ffffff', backdropFilter: 'blur(4px)', width: 'fit-content' } : {}}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>

        {isExpandable && (
          <div className="expand-indicator-badge">
            <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 16,
                transition: 'transform 0.3s ease',
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              expand_more
            </span>
          </div>
        )}
      </div>

      {/* Main Service Content (Upper Area) */}
      <div style={{ position: 'relative', zIndex: 2, marginTop: image ? 'auto' : 0 }}>
        <h3 className="headline-sm" style={{ fontSize: 20, marginBottom: 6, color: image ? '#ffffff' : 'inherit' }}>{title}</h3>
        <p className="body-md" style={{ color: image ? 'rgba(255,255,255,0.85)' : 'var(--on-surface-variant)', margin: 0 }}>{description}</p>
      </div>

      {/* Additional Details (Lower 2nd Card-Height Area) */}
      {isExpandable && (
        <div className="service-card-expanded-body">
          {detailsType === 'visiting_cards' && (
            <div className="expanded-details-inner">
              <div className="expanded-section-header">Available Materials</div>
              <ul className="expanded-materials-list">
                <li>Art Board</li>
                <li>Art Board with Lamination</li>
                <li>Metallic & Special Boards</li>
                <li>Synthetic White 125 Micron</li>
                <li>Syn. White 200 Mic / Syn. Gold & Silver 125 Mic</li>
              </ul>
            </div>
          )}

          {detailsType === 'printouts' && (
            <div className="expanded-details-inner">
              <div className="printouts-categories-grid">
                <div className="printouts-category">
                  <div className="expanded-category-header">BLACK & WHITE / GRAYSCALE</div>
                  <ul className="expanded-materials-list compact">
                    <li>Copier — 70 GSM</li>
                    <li>Copier — 80 GSM</li>
                    <li>Copier — 100 GSM</li>
                    <li>Bond — 100 GSM</li>
                    <li>Ledger Green — 80 GSM</li>
                  </ul>
                </div>
                <div className="printouts-category">
                  <div className="expanded-category-header">COLOR</div>
                  <ul className="expanded-materials-list compact">
                    <li>Paper — 100 GSM</li>
                    <li>Bond Paper — 100 GSM</li>
                    <li>Ledger Green — 80 GSM</li>
                    <li>Art Paper — 130 GSM</li>
                    <li>Art Paper — 170 GSM</li>
                    <li>Art Board — 250 GSM</li>
                    <li>Art Board — 300 GSM</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {detailsType === 'plan_printouts' && (
            <div className="expanded-details-inner">
              <div className="expanded-section-header">Available Plan Sizes</div>
              <div className="plan-sizes-list">
                <div className="plan-size-row">
                  <span className="plan-size-code">A2</span>
                  <span className="plan-size-gsm">90 GSM</span>
                </div>
                <div className="plan-size-row">
                  <span className="plan-size-code">A1</span>
                  <span className="plan-size-gsm">91 GSM</span>
                </div>
                <div className="plan-size-row">
                  <span className="plan-size-code">A0</span>
                  <span className="plan-size-gsm">92 GSM</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
