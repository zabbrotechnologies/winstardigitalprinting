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
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.42), rgba(0, 0, 0, 0.90)), url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#ffffff',
          border: 'none',
        } : {}),
        cursor: isExpandable || onClick ? 'pointer' : 'default',
      }}
    >
      {/* Top Header Row (Icon + Expand Badge) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', position: 'relative', zIndex: 2 }}>
        <div className="service-icon" style={image ? { background: 'rgba(255,255,255,0.2)', color: '#ffffff', backdropFilter: 'blur(6px)', width: 'fit-content' } : {}}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>

        {isExpandable && (
          <div className={`expand-indicator-badge ${isExpanded ? 'active' : ''}`}>
            <span>{isExpanded ? 'Collapse' : 'Details'}</span>
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

      {/* Main Service Content (Upper 1-Card Height Area) */}
      <div style={{ position: 'relative', zIndex: 2, marginTop: image ? 'auto' : 0 }}>
        <h3 className="headline-sm" style={{ fontSize: 20, marginBottom: 6, color: image ? '#ffffff' : 'inherit', fontWeight: 700 }}>{title}</h3>
        <p className="body-md" style={{ color: image ? 'rgba(255,255,255,0.85)' : 'var(--on-surface-variant)', margin: 0, fontSize: 13.5, lineHeight: 1.4 }}>{description}</p>
      </div>

      {/* Additional Details (Lower 2nd Card-Height Area — ONLY RENDERED WHEN EXPANDED) */}
      {isExpandable && isExpanded && (
        <div className="service-card-expanded-body animate-fade-in">
          {detailsType === 'visiting_cards' && (
            <div className="expanded-details-inner">
              <div className="pro-section-header">
                <span className="material-symbols-outlined header-icon">layers</span>
                Available Substrates & Materials
              </div>
              <div className="pro-chips-grid">
                <div className="pro-chip">
                  <span className="material-symbols-outlined chip-icon">check_circle</span>
                  <span>Art Board (300 GSM)</span>
                </div>
                <div className="pro-chip">
                  <span className="material-symbols-outlined chip-icon">check_circle</span>
                  <span>Art Board with Lamination</span>
                </div>
                <div className="pro-chip">
                  <span className="material-symbols-outlined chip-icon">check_circle</span>
                  <span>Metallic & Special Boards</span>
                </div>
                <div className="pro-chip">
                  <span className="material-symbols-outlined chip-icon">check_circle</span>
                  <span>Synthetic White 125 Micron</span>
                </div>
                <div className="pro-chip">
                  <span className="material-symbols-outlined chip-icon">check_circle</span>
                  <span>Syn. White 200 Mic / Gold & Silver</span>
                </div>
              </div>
            </div>
          )}

          {detailsType === 'printouts' && (
            <div className="expanded-details-inner">
              <div className="printouts-categories-grid">
                {/* Category 1: B&W */}
                <div className="pro-category-box">
                  <div className="pro-category-header">
                    <span className="material-symbols-outlined category-icon">contrast</span>
                    BLACK & WHITE / GRAYSCALE
                  </div>
                  <div className="pro-chips-stack">
                    <div className="pro-chip-sm"><span className="chip-notation">◆</span>Copier — 70 GSM</div>
                    <div className="pro-chip-sm"><span className="chip-notation">◆</span>Copier — 80 GSM</div>
                    <div className="pro-chip-sm"><span className="chip-notation">◆</span>Copier — 100 GSM</div>
                    <div className="pro-chip-sm"><span className="chip-notation">◆</span>Bond — 100 GSM</div>
                    <div className="pro-chip-sm"><span className="chip-notation">◆</span>Ledger Green — 80 GSM</div>
                  </div>
                </div>

                {/* Category 2: Color */}
                <div className="pro-category-box">
                  <div className="pro-category-header">
                    <span className="material-symbols-outlined category-icon" style={{ color: '#f43f5e' }}>palette</span>
                    COLOR PRINTING
                  </div>
                  <div className="pro-chips-stack">
                    <div className="pro-chip-sm"><span className="chip-notation">◆</span>Paper — 100 GSM</div>
                    <div className="pro-chip-sm"><span className="chip-notation">◆</span>Bond Paper — 100 GSM</div>
                    <div className="pro-chip-sm"><span className="chip-notation">◆</span>Ledger Green — 80 GSM</div>
                    <div className="pro-chip-sm"><span className="chip-notation">◆</span>Art Paper — 130 GSM</div>
                    <div className="pro-chip-sm"><span className="chip-notation">◆</span>Art Paper — 170 GSM</div>
                    <div className="pro-chip-sm"><span className="chip-notation">◆</span>Art Board — 250 GSM</div>
                    <div className="pro-chip-sm"><span className="chip-notation">◆</span>Art Board — 300 GSM</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {detailsType === 'plan_printouts' && (
            <div className="expanded-details-inner">
              <div className="pro-section-header">
                <span className="material-symbols-outlined header-icon">aspect_ratio</span>
                Available Plan Sizes
              </div>
              <div className="pro-plan-rows">
                <div className="pro-plan-card">
                  <div className="pro-plan-badge">A2</div>
                  <div className="pro-plan-info">
                    <span className="pro-plan-gsm">90 GSM Plotter Paper</span>
                    <span className="pro-plan-tag">Standard CAD / Engineering</span>
                  </div>
                </div>
                <div className="pro-plan-card">
                  <div className="pro-plan-badge">A1</div>
                  <div className="pro-plan-info">
                    <span className="pro-plan-gsm">91 GSM Plotter Paper</span>
                    <span className="pro-plan-tag">Architectural Blueprint</span>
                  </div>
                </div>
                <div className="pro-plan-card">
                  <div className="pro-plan-badge">A0</div>
                  <div className="pro-plan-info">
                    <span className="pro-plan-gsm">92 GSM Plotter Paper</span>
                    <span className="pro-plan-tag">Jumbo Poster / Master Plan</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
