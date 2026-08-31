import { useState, useEffect, useRef } from 'react';

const SLIDES = [
  {
    id: 1,
    image: '/images/carousel/machine-1.png',
    badge: 'Unit 01 · Production Press',
    title: 'Industrial Digital Production Press',
    description: 'Heavy duty high-speed laser production press for commercial publications, corporate catalogs, and large volume book printing.'
  },
  {
    id: 2,
    image: '/images/carousel/machine-2.png',
    badge: 'Unit 02 · Laser Workhorse',
    title: 'Commercial High-Speed Color Laser Printer',
    description: 'Precision digital printing system delivering high-density black and vibrant CMYK color accuracy for business reports and manuals.'
  },
  {
    id: 3,
    image: '/images/carousel/machine-3.png',
    badge: 'Unit 03 · Precision Trimmer',
    title: 'Precision Hydraulic Paper Trimmer & Guillotine',
    description: 'Laser-guided heavy duty hydraulic paper guillotine with millimeter-accurate trimming for clean, crisp book and paper edges.'
  },
  {
    id: 4,
    image: '/images/carousel/machine-4.png',
    badge: 'Unit 04 · Digital Press Engine',
    title: 'Commercial Digital Production Press Engine',
    description: 'State-of-the-art digital press engine engineered for high-resolution marketing flyers, certificates, and presentation collaterals.'
  },
  {
    id: 5,
    image: '/images/carousel/machine-5.png',
    badge: 'Unit 05 · Automated Press',
    title: 'Automated Document Printing System',
    description: 'High performance printing system with multi-tray automated continuous feed for rapid same-day bulk order turnaround.'
  }
];

export default function EquipmentCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef(null);
  const slideInterval = 4000;

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const goToSlide = (index) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    if (!isPaused) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, slideInterval);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isPaused, activeIndex]);

  return (
    <section
      className="section equipment-carousel-section"
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f8faff 50%, #fdf2f8 100%)',
        padding: '72px 0 84px',
        borderTop: '1px solid var(--surface-container-high)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div className="container" style={{ maxWidth: 1040 }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--primary-fixed)', color: 'var(--on-primary-fixed-variant)',
            padding: '6px 18px', borderRadius: 'var(--radius-full)',
            fontSize: 13, fontWeight: 700, marginBottom: 14, letterSpacing: '0.04em',
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
          <p className="body-lg" style={{ color: 'var(--on-surface-variant)', maxWidth: 620, margin: '0 auto' }}>
            Powered by high-capacity digital production presses, laser-guided cutters, and professional finishing systems.
          </p>
        </div>

        {/* Bootstrap Captions Carousel (Light Theme Optimized) */}
        <div
          id="carouselExampleCaptions"
          className="carousel slide carousel-light-theme"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Carousel Inner Items */}
          <div className="carousel-inner">
            {SLIDES.map((slide, index) => {
              const isActive = activeIndex === index;
              return (
                <div
                  key={slide.id}
                  className={`carousel-item ${isActive ? 'active' : ''}`}
                >
                  <div className="carousel-media-box">
                    <div className="carousel-unit-badge">
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>verified</span>
                      {slide.badge}
                    </div>
                    <img
                      src={slide.image}
                      className="d-block w-100 carousel-machine-img"
                      alt={slide.title}
                    />
                  </div>
                  <div className="carousel-caption">
                    <h5>{slide.title}</h5>
                    <p>{slide.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carousel Controls */}
          <button
            className="carousel-control-prev"
            type="button"
            onClick={prevSlide}
            aria-label="Previous Slide"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            onClick={nextSlide}
            aria-label="Next Slide"
          >
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>

          {/* Carousel Indicators */}
          <div className="carousel-indicators">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                type="button"
                className={activeIndex === index ? 'active' : ''}
                aria-current={activeIndex === index ? 'true' : undefined}
                aria-label={`Slide ${index + 1}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
