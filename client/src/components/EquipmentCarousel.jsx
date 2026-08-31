import { useState, useEffect, useRef } from 'react';

const SLIDES = [
  {
    id: 1,
    image: '/images/carousel/machine-1.png',
    title: 'Industrial Digital Production Press',
    description: 'High-speed laser production press for heavy bulk printing, corporate catalogs, and commercial publications.'
  },
  {
    id: 2,
    image: '/images/carousel/machine-2.png',
    title: 'High-Speed Commercial Color Laser Printer',
    description: 'Commercial digital workhorse delivering sharp text and vibrant CMYK color accuracy for reports and manuals.'
  },
  {
    id: 3,
    image: '/images/carousel/machine-3.png',
    title: 'Precision Hydraulic Paper Trimmer & Guillotine',
    description: 'Laser-guided heavy duty paper cutter with millimeter accuracy for clean, crisp book and paper trimming.'
  },
  {
    id: 4,
    image: '/images/carousel/machine-4.png',
    title: 'Commercial Digital Production Press Engine',
    description: 'Advanced digital press engine designed for high-resolution graphics, marketing flyers, brochures, and certificates.'
  },
  {
    id: 5,
    image: '/images/carousel/machine-5.png',
    title: 'Automated Document Printing System',
    description: 'Heavy duty commercial printing system with multi-tray automated feed and rapid turnaround for bulk print orders.'
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
    <section className="section carousel-showcase-section" style={{ background: '#0F172A', color: '#ffffff', padding: '64px 0 80px' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255, 255, 255, 0.1)', color: '#38bdf8',
            padding: '6px 18px', borderRadius: 'var(--radius-full)',
            fontSize: 13, fontWeight: 700, marginBottom: 14, letterSpacing: '0.04em',
            border: '1px solid rgba(56, 189, 248, 0.2)'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>precision_manufacturing</span>
            Our Printing Machinery & Infrastructure
          </div>
          <h2 className="headline-lg" style={{ color: '#ffffff', marginBottom: 12, fontWeight: 800 }}>
            State-of-the-Art <span style={{
              background: 'linear-gradient(90deg, #38bdf8 0%, #ec4899 50%, #fbbf24 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Machinery & Technology</span>
          </h2>
          <p className="body-lg" style={{ color: '#94a3b8', maxWidth: 620, margin: '0 auto' }}>
            Powered by high-capacity digital production presses and laser-guided finishing systems.
          </p>
        </div>

        {/* Bootstrap Captions Carousel Layout */}
        <div
          id="carouselExampleCaptions"
          className="carousel slide"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
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
                    <img
                      src={slide.image}
                      className="d-block w-100"
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
        </div>
      </div>
    </section>
  );
}
