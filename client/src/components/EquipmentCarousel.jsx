import { useState, useEffect, useRef } from 'react';

const MACHINES = [
  {
    id: 1,
    image: '/images/carousel/machine-1.png',
    tag: 'Production Digital Press',
    title: 'High-Speed Color Laser Production Engine',
    description: 'Industrial digital printing press with ultra-fast output, precise color calibration, and continuous high-volume feed for books, brochures, and commercial publications.',
    badge: 'Heavy Volume Press',
    specs: ['2400 x 2400 DPI', 'Heavy GSM Support', 'Auto Duplex Output']
  },
  {
    id: 2,
    image: '/images/carousel/machine-2.png',
    tag: 'Commercial Digital Workhorse',
    title: 'Precision Multi-Function Laser Print Unit',
    description: 'Heavy duty commercial printing system delivering high-density black and vibrant CMYK colors for reports, manuals, and bulk corporate orders.',
    badge: 'Crisp CMYK Quality',
    specs: ['High Density Toner', 'Vibrant Color Gamut', 'Fast Bulk Turnaround']
  },
  {
    id: 3,
    image: '/images/carousel/machine-3.png',
    tag: 'Industrial Paper Cutter',
    title: 'Precision Hydraulic Paper Trimmer & Guillotine',
    description: 'Micro-computer controlled hydraulic paper cutter with laser-guided optics and millimeter-accurate trimming for clean, crisp book and paper edges.',
    badge: '±0.1mm Accuracy',
    specs: ['Laser Guide Optics', 'Infrared Safety Guard', 'Bulk Stack Cutting']
  },
  {
    id: 4,
    image: '/images/carousel/machine-4.png',
    tag: 'Commercial Color Press',
    title: 'Advanced Digital Production Press Engine',
    description: 'State-of-the-art digital press engine designed for high-resolution graphics, vibrant flyers, certificates, and marketing collaterals with smooth gradients.',
    badge: 'Graphic Quality',
    specs: ['Expanded Gamut', 'Smooth Gradients', 'High Reliability']
  },
  {
    id: 5,
    image: '/images/carousel/machine-5.png',
    tag: 'High-Volume Print System',
    title: 'Automated Commercial Document Press',
    description: 'High performance printing unit equipped with multi-feed trays and automated finishing for rapid turnaround on institutional and commercial projects.',
    badge: 'Multi-Tray Feed',
    specs: ['Multi-tray Capacity', 'Automated Registration', 'High Speed Delivery']
  }
];

export default function EquipmentCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const timerRef = useRef(null);
  const slideDuration = 4500; // 4.5 seconds

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % MACHINES.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + MACHINES.length) % MACHINES.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, slideDuration);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, currentIndex]);

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    setTouchStartX(null);
  };

  const currentMachine = MACHINES[currentIndex];

  return (
    <section 
      className="equipment-section"
      style={{
        padding: '72px 0 80px',
        background: 'linear-gradient(180deg, #ffffff 0%, #f4f7fc 100%)',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid var(--surface-container-high)',
        borderBottom: '1px solid var(--surface-container-high)',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative ambient background blobs */}
      <div style={{
        position: 'absolute', top: -50, right: '10%', width: 350, height: 350,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,159,227,0.08) 0%, rgba(255,255,255,0) 70%)',
        pointerEvents: 'none', filter: 'blur(40px)'
      }} />
      <div style={{
        position: 'absolute', bottom: -50, left: '10%', width: 350, height: 350,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,0,126,0.08) 0%, rgba(255,255,255,0) 70%)',
        pointerEvents: 'none', filter: 'blur(40px)'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--primary-fixed)', color: 'var(--on-primary-fixed-variant)',
            padding: '6px 18px', borderRadius: 'var(--radius-full)',
            fontSize: 13, fontWeight: 700, marginBottom: 16, letterSpacing: '0.04em',
            boxShadow: '0 2px 8px rgba(183,0,17,0.08)'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>precision_manufacturing</span>
            Our Printing Machinery & Infrastructure
          </div>
          <h2 className="headline-lg" style={{ marginBottom: 12, fontWeight: 800 }}>
            State-of-the-Art <span style={{ 
              background: 'linear-gradient(90deg, #009FE3 0%, #E6007E 50%, #FFB600 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Machinery & Technology</span>
          </h2>
          <p className="body-lg" style={{ color: 'var(--on-surface-variant)', maxWidth: 640, margin: '0 auto' }}>
            Powered by high-capacity digital production presses, laser-guided cutters, and professional finishing systems for commercial-grade speed and clarity.
          </p>
        </div>

        {/* Carousel Showcase Container */}
        <div 
          className="carousel-container"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 16px 40px rgba(18, 28, 42, 0.08), 0 2px 8px rgba(18, 28, 42, 0.04)',
            border: '1px solid rgba(217, 227, 246, 0.8)',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Top Progress bar indicator */}
          <div style={{
            height: 4,
            width: '100%',
            background: 'var(--surface-container-high)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div 
              key={currentIndex}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #009FE3, #E6007E)',
                width: '100%',
                animation: isPaused ? 'none' : `progressAnim ${slideDuration}ms linear infinite`,
              }}
            />
          </div>

          {/* Active Featured Slide */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            minHeight: '440px',
            gap: 32,
            padding: '36px 40px'
          }}>
            {/* Left: Machine Image with Glow Frame */}
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle, #f8faff 0%, #edf2fa 100%)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              minHeight: '340px',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', top: 16, left: 16,
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(6px)',
                color: '#ffffff',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: 12,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#f59e0b' }}>verified</span>
                <span>{currentMachine.badge}</span>
              </div>

              <img 
                key={currentMachine.image}
                src={currentMachine.image} 
                alt={currentMachine.title}
                style={{
                  maxHeight: '320px',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  display: 'block',
                  filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.15))',
                  transition: 'transform 0.4s ease',
                  animation: 'fadeIn 0.5s ease-in-out'
                }}
              />
            </div>

            {/* Right: Machine Information & Specs */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                color: '#0284c7', fontSize: 13, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', marginBottom: 10
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>settings</span>
                {currentMachine.tag} · Unit {currentIndex + 1} of {MACHINES.length}
              </div>

              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(22px, 2.2vw, 28px)',
                fontWeight: 800,
                color: '#0F172A',
                marginBottom: 14,
                lineHeight: 1.2
              }}>
                {currentMachine.title}
              </h3>

              <p style={{
                fontSize: 15,
                lineHeight: 1.65,
                color: 'var(--on-surface-variant)',
                marginBottom: 24
              }}>
                {currentMachine.description}
              </p>

              {/* Spec Chips */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
                {currentMachine.specs.map((spec, i) => (
                  <div 
                    key={i} 
                    style={{
                      background: 'var(--surface-container-low)',
                      border: '1px solid var(--surface-container-high)',
                      color: 'var(--on-surface)',
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 13,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 15, color: 'var(--primary)' }}>check_circle</span>
                    {spec}
                  </div>
                ))}
              </div>

              {/* Navigation Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={prevSlide}
                    aria-label="Previous Machine"
                    className="btn"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--surface-container-low)',
                      border: '1px solid var(--surface-container-high)',
                      color: 'var(--on-surface)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--primary)';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--surface-container-low)';
                      e.currentTarget.style.color = 'var(--on-surface)';
                    }}
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>

                  <button
                    onClick={nextSlide}
                    aria-label="Next Machine"
                    className="btn"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--surface-container-low)',
                      border: '1px solid var(--surface-container-high)',
                      color: 'var(--on-surface)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--primary)';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--surface-container-low)';
                      e.currentTarget.style.color = 'var(--on-surface)';
                    }}
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>

                {/* Indicators / Dots */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {MACHINES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToSlide(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      style={{
                        width: currentIndex === idx ? 28 : 10,
                        height: 10,
                        borderRadius: 'var(--radius-full)',
                        background: currentIndex === idx ? 'var(--primary)' : 'var(--surface-container-highest)',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    />
                  ))}
                </div>

                {/* Auto-play Status indicator */}
                <span style={{
                  fontSize: 12,
                  color: 'var(--on-surface-variant)',
                  marginLeft: 'auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <span 
                    style={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      background: isPaused ? '#f59e0b' : '#10b981',
                      display: 'inline-block' 
                    }} 
                  />
                  {isPaused ? 'Paused (Hovered)' : 'Auto-advancing'}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Thumbnails Strip */}
          <div style={{
            background: 'var(--surface-container-low)',
            padding: '16px 24px',
            borderTop: '1px solid var(--surface-container-high)',
            display: 'flex',
            gap: 14,
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}>
            {MACHINES.map((machine, idx) => {
              const isActive = currentIndex === idx;
              return (
                <div
                  key={machine.id}
                  onClick={() => goToSlide(idx)}
                  role="button"
                  tabIndex={0}
                  style={{
                    flex: '1 0 160px',
                    minWidth: '150px',
                    background: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)',
                    borderRadius: 'var(--radius)',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    border: isActive ? '2px solid var(--primary)' : '1px solid var(--surface-container-high)',
                    boxShadow: isActive ? '0 4px 12px rgba(183,0,17,0.12)' : 'none',
                    transition: 'all 0.2s ease',
                    opacity: isActive ? 1 : 0.75,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.opacity = '0.75';
                  }}
                >
                  <img
                    src={machine.image}
                    alt={machine.title}
                    style={{
                      width: 44,
                      height: 44,
                      objectFit: 'contain',
                      borderRadius: 4,
                      background: '#f1f5f9',
                      padding: 2
                    }}
                  />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden'
                    }}>
                      Unit {idx + 1}
                    </div>
                    <div style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#0F172A',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden'
                    }}>
                      {machine.tag}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
