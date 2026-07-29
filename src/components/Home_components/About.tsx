import React, { useState, useEffect, useRef, useCallback, useMemo, Component } from 'react';
import Spline from '@splinetool/react-spline';

/* ============================================================================
   COVERFLOW GALLERY — premium, smooth, hardware-accelerated presentation
   ========================================================================== */

interface GalleryImage {
  url: string;
  alt: string;
}

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

interface BreakpointConfig {
  visibleSide: number; // images visible on EACH side of center
  spacing: number;     // px translateX per step
  centerScale: number;
  sideScale: number;
  rotation: number;    // deg
}

const BREAKPOINT_CONFIG: Record<Breakpoint, BreakpointConfig> = {
  desktop: { visibleSide: 2, spacing: 215, centerScale: 1.12, sideScale: 0.90, rotation: 28 },
  tablet: { visibleSide: 2, spacing: 165, centerScale: 1.12, sideScale: 0.90, rotation: 24 },
  mobile: { visibleSide: 2, spacing: 85, centerScale: 1.12, sideScale: 0.90, rotation: 18 },
};

// ─── useBreakpoint ──────────────────────────────────────────────────────────
function useBreakpoint(): Breakpoint {
  const getBp = (): Breakpoint => {
    if (typeof window === 'undefined') return 'desktop';
    const w = window.innerWidth;
    if (w < 640) return 'mobile';
    if (w < 1024) return 'tablet';
    return 'desktop';
  };
  const [bp, setBp] = useState<Breakpoint>(getBp);
  useEffect(() => {
    const onResize = () => setBp(getBp());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return bp;
}

// ─── useReducedMotion ───────────────────────────────────────────────────────
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);
  return reduced;
}

// ─── circular index math ────────────────────────────────────────────────────
function wrapIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}
function circularOffset(from: number, to: number, length: number): number {
  let diff = (to - from) % length;
  if (diff > length / 2) diff -= length;
  if (diff < -length / 2) diff += length;
  return diff;
}

// ─── useCoverflow: core state machine ──────────────────────────────────────
function useCoverflow(itemCount: number, autoplayDelay: number, autoplayEnabled: boolean) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  const goTo = useCallback((index: number) => setActiveIndex(wrapIndex(index, itemCount)), [itemCount]);
  const next = useCallback(() => setActiveIndex((i) => wrapIndex(i + 1, itemCount)), [itemCount]);
  const prev = useCallback(() => setActiveIndex((i) => wrapIndex(i - 1, itemCount)), [itemCount]);

  useEffect(() => {
    if (!autoplayEnabled || isPaused || itemCount <= 1) return;
    timerRef.current = window.setInterval(() => {
      setActiveIndex((i) => wrapIndex(i + 1, itemCount));
    }, autoplayDelay);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [autoplayEnabled, isPaused, autoplayDelay, itemCount]);

  return { activeIndex, goTo, next, prev, isPaused, setIsPaused };
}

// ─── useSwipeAndDrag: pointer / touch / wheel ──────────────────────────────
function useSwipeAndDrag(
  ref: React.RefObject<HTMLElement>,
  onNext: () => void,
  onPrev: () => void,
  onDragStateChange: (dragging: boolean) => void,
  threshold = 60
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let dragging = false;
    let consumed = false;
    let startX = 0;
    let wheelCooldown = false;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      consumed = false;
      startX = e.clientX;
      onDragStateChange(true);
      el.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging || consumed) return;
      const delta = e.clientX - startX;
      if (Math.abs(delta) > threshold) {
        consumed = true;
        if (delta < 0) onNext();
        else onPrev();
      }
    };
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      onDragStateChange(false);
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (wheelCooldown) return;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 8) return;
      wheelCooldown = true;
      if (delta > 0) onNext();
      else onPrev();
      window.setTimeout(() => { wheelCooldown = false; }, 350);
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);
    el.addEventListener('pointerleave', endDrag);
    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', endDrag);
      el.removeEventListener('pointercancel', endDrag);
      el.removeEventListener('pointerleave', endDrag);
      el.removeEventListener('wheel', onWheel);
    };
  }, [ref, onNext, onPrev, onDragStateChange, threshold]);
}

// ─── useKeyboardNav ─────────────────────────────────────────────────────────
function useKeyboardNav(ref: React.RefObject<HTMLElement>, onNext: () => void, onPrev: () => void) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); onNext(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); onPrev(); }
    };
    el.addEventListener('keydown', onKeyDown);
    return () => el.removeEventListener('keydown', onKeyDown);
  }, [ref, onNext, onPrev]);
}

// ─── GalleryCard ────────────────────────────────────────────────────────────
const GalleryCard: React.FC<{ 
  image: GalleryImage; 
  absOffset: number; 
  onClick?: () => void;
  brightness: number;
  saturate: number;
}> = React.memo(({ image, absOffset, onClick, brightness, saturate }) => {
  const isCenter = absOffset === 0;
  
  return (
    <div
      onClick={onClick}
      role={isCenter ? undefined : 'button'}
      aria-hidden={!isCenter}
      tabIndex={-1}
      className={`relative h-[220px] w-[300px] rounded-2xl transition-transform duration-[780ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform transform-gpu
        sm:h-[280px] sm:w-[380px] md:h-[320px] md:w-[440px] lg:h-[360px] lg:w-[500px]
        ${isCenter ? 'cursor-default' : 'cursor-pointer'}`}
      style={{
        perspective: '1200px',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Image container — no hover scaling, just the base image */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl w-full h-full transform-gpu will-change-transform">
        <img
          src={image.url}
          alt={image.alt}
          loading="lazy"
          draggable={false}
          className="h-full w-full object-cover transition-[filter] duration-[780ms] ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu"
          style={{
            filter: isCenter 
              ? 'brightness(1) saturate(1)' 
              : `brightness(${brightness}) saturate(${saturate})`,
          }}
        />
      </div>
    </div>
  );
});
GalleryCard.displayName = 'GalleryCard';

// ─── NavButton ──────────────────────────────────────────────────────────────
const NavButton: React.FC<{ direction: 'prev' | 'next'; onClick: () => void }> = ({ direction, onClick }) => (
  <button
    onClick={onClick}
    aria-label={direction === 'prev' ? 'Previous image' : 'Next image'}
    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10
      bg-white/5 text-gray-300 backdrop-blur-sm transition-all duration-300
      hover:border-blue-400/30 hover:bg-white/10 hover:text-white
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {direction === 'prev' ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
    </svg>
  </button>
);

// ─── CoverflowGallery ───────────────────────────────────────────────────────
const CoverflowGallery: React.FC<{ images: GalleryImage[]; autoplayDelay?: number }> = ({
  images,
  autoplayDelay = 4000,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const bp = useBreakpoint();
  const cfg = BREAKPOINT_CONFIG[bp];
  const reducedMotion = useReducedMotion();
  const itemCount = images.length;

  const { activeIndex, goTo, next, prev, isPaused, setIsPaused } = useCoverflow(itemCount, autoplayDelay, !reducedMotion);
  useSwipeAndDrag(trackRef, next, prev, setIsPaused);
  useKeyboardNav(trackRef, next, prev);

  // Render exactly what's visible plus one buffer ring (no more) to keep
  // the number of simultaneously-animated 3D layers low — fewer overlapping
  // transformed/filtered elements = fewer dropped frames.
  const renderRange = cfg.visibleSide + 1;
  const visibleItems = useMemo(() => {
    const items: { image: GalleryImage; index: number; offset: number }[] = [];
    for (let o = -renderRange; o <= renderRange; o++) {
      const index = wrapIndex(activeIndex + o, itemCount);
      const offset = circularOffset(activeIndex, index, itemCount);
      items.push({ image: images[index], index, offset });
    }
    return items;
  }, [activeIndex, itemCount, images, renderRange]);

  const SMOOTH_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const SMOOTH_DURATION = 780; // ms
  // Only transform + opacity animate here — both are compositor-only
  // properties the GPU can handle without triggering repaint/layout,
  // unlike `filter`, which we no longer animate on the wrapping layer.
  const transitionStyle = reducedMotion
    ? 'none'
    : `transform ${SMOOTH_DURATION}ms ${SMOOTH_EASE}, opacity ${SMOOTH_DURATION}ms ${SMOOTH_EASE}`;

  const activeImage = images[activeIndex];

  return (
    <div className="relative w-full overflow-visible">
      <style>{`
        @keyframes coverflow-pill-progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 h-[550px] w-[750px] rounded-full blur-[130px] transition-transform duration-[780ms] ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu will-change-transform"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.14) 0%, rgba(249,115,22,0.09) 45%, transparent 70%)',
            transform: `translate3d(calc(-50% + ${(activeIndex % 2 === 0 ? 30 : -30)}px), calc(-50% + ${(activeIndex % 3 === 0 ? 20 : -20)}px), 0)`,
          }}
        />
      </div>

      <div
        ref={trackRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="ERC highlights gallery"
        tabIndex={0}
        onPointerEnter={(e) => { if (e.pointerType === 'mouse') setIsPaused(true); }}
        onPointerLeave={(e) => { if (e.pointerType === 'mouse') setIsPaused(false); }}
        className="relative flex h-[320px] items-center justify-center outline-none overflow-visible
          sm:h-[400px] md:h-[460px] lg:h-[500px]
          focus-visible:ring-2 focus-visible:ring-blue-400/60 rounded-2xl"
        style={{ perspective: '1200px', touchAction: 'pan-y', transformStyle: 'preserve-3d' }}
      >
        {visibleItems.map(({ image, index, offset }) => {
          const absOffset = Math.abs(offset);
          
          let opacity = 1.0;
          let scale = 1.12;
          let translateZ = 140;
          let translateY = -10;
          let brightness = 1.0;
          let saturate = 1.0;

          // No `blur` variable anymore — depth is conveyed with opacity/
          // scale/brightness/saturate only, which are far cheaper to
          // animate across several overlapping layers than filter blur.
          if (absOffset === 0) {
            opacity = 1.0; scale = 1.12; translateZ = 140; translateY = -10; brightness = 1.0; saturate = 1.0;
          } else if (absOffset === 1) {
            opacity = 0.90; scale = 0.90; translateZ = 40; translateY = 8; brightness = 0.75; saturate = 0.45;
          } else if (absOffset === 2) {
            opacity = 0.55; scale = 0.75; translateZ = -20; translateY = 18; brightness = 0.7; saturate = 0.4;
          } else {
            opacity = 0.25; scale = 0.60; translateZ = -60; translateY = 28; brightness = 0.65; saturate = 0.35;
          }

          const translateX = offset * cfg.spacing;
          const rotateY = offset === 0 ? 0 : -Math.sign(offset) * cfg.rotation;
          const zIndex = 100 - absOffset;

          return (
            <div
              key={index}
              className="absolute select-none will-change-transform transform-gpu"
              style={{
                transform: `translate3d(${translateX}px, ${translateY}px, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity,
                zIndex,
                transition: transitionStyle,
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <GalleryCard 
                image={image} 
                absOffset={absOffset} 
                onClick={() => (offset === 0 ? undefined : goTo(index))}
                brightness={brightness}
                saturate={saturate}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-center gap-6">
        <NavButton direction="prev" onClick={prev} />
        <div className="flex gap-2 items-center h-4" role="tablist" aria-label="Slide indicators">
          {images.map((_, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={i}
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`relative h-1.5 rounded-full overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isActive ? 'w-10 bg-white/10' : 'w-1.5 bg-gray-600 hover:bg-gray-400'
                }`}
              >
                {isActive && (
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-blue-400 to-orange-400 origin-left transform-gpu"
                    style={{
                      animation: `coverflow-pill-progress ${autoplayDelay}ms linear forwards`,
                      animationPlayState: isPaused ? 'paused' : 'running',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
        <NavButton direction="next" onClick={next} />
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {activeIndex + 1} of {itemCount}: {activeImage.alt}
      </p>
    </div>
  );
};

/* ============================================================================
   ABOUT SECTION — wrapper container showcasing component implementation
   ========================================================================== */

class SplineErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.warn('Spline failed to load (WebGL not supported):', error.message);
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

const galleryImages: GalleryImage[] = [
  { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/1.jpg', alt: 'ERC Event A' },
  { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/2.jpg', alt: 'ERC Event B' },
  { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/3.jpg', alt: 'ERC Event C' },
  { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/4.jpg', alt: 'ERC Event D' },
  { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/5.jpg', alt: 'ERC Event E' },
  { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/6.jpg', alt: 'ERC Event F' },
  { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/7.jpg', alt: 'ERC Event G' },
  { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/8.jpg', alt: 'ERC Event H' },
  { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/9.jpg', alt: 'ERC Event I' },
  { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/10.jpg', alt: 'ERC Event J' },
  { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/11.jpg', alt: 'ERC Event K' },
  { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/12.jpg', alt: 'ERC Event L' },
  { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/13.jpg', alt: 'ERC Event M' },
  { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/14.jpg', alt: 'ERC Event N' },
  { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/15.jpg', alt: 'ERC Event O' },
  { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/16.jpg', alt: 'ERC Event P' },
  { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/17.jpg', alt: 'ERC Event Q' },
  { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/18.jpg', alt: 'ERC Event R' },
  { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/19.jpg', alt: 'ERC Event S' },
  { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/20.jpg', alt: 'ERC Event T' },
  // { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/21.jpg', alt: 'ERC Event U' },
  // { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/22.jpg', alt: 'ERC Event V' },
  // { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/23.jpg', alt: 'ERC Event W' },
  // { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/24.jpg', alt: 'ERC Event AA' },
  // { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/25.jpg', alt: 'ERC Event AB' },
  // { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/26.jpg', alt: 'ERC Event AC' },
  // { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/27.jpg', alt: 'ERC Event AD' },
  // { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/28.jpg', alt: 'ERC Event X' },
  // { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/29.jpg', alt: 'ERC Event Y' },
  // { url: 'https://res.cloudinary.com/djbm9dagt/image/upload/f_auto,q_auto,w_1200/v1780110702/30.jpg', alt: 'ERC Event Z' },


];

const About = () => {
  const [splineLoaded, setSplineLoaded] = useState(false);

  return (
    <section id="about" className="py-20 bg-gray-900/70">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl mb-4 font-heading font-bold
            bg-gradient-to-r from-yellow-300 to-orange-500
            bg-[length:200%_200%] bg-clip-text text-transparent
            animate-gradient-x">
            ELECTRIFY. CODE. INNOVATE.
          </h1>
          <div className="w-24 h-1 bg-blue-500 mx-auto mb-8"></div>
          <p className="max-w-3xl mx-auto text-gray-300 text-lg">
            The Electronics & Robotics Club, IIT Bombay is a vibrant community of passionate students united by a love for circuits, robotics, and innovation. Open to all skill levels, the club hosts competitions, workshops, and discussions throughout the year to promote hands-on learning and creative problem-solving.
          </p>
        </div>

        <div className="mt-16 bg-gradient-to-r from-blue-600/20 to-orange-600/20 p-8 rounded-xl border border-blue-500/20">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
              <h2 className="text-2xl font-bold mb-4 font-heading">Our Vision</h2>
              <p className="text-gray-300 mb-4 text-lg">
                Our club envisions being the cornerstone of the Electronics and Robotics community — a space where curiosity meets creativity.
              </p>
              <p className="text-gray-300 text-lg">
                We aim to empower students to build impactful solutions through hands-on innovation and collaboration.
              </p>
            </div>

            <div className="w-64 h-64 rounded-full bg-gray-900 overflow-hidden shadow-lg relative">
              <div className="absolute inset-0 animate-spin-slow border border-yellow-400/30 rounded-full" />
              <SplineErrorBoundary>
                {!splineLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="w-8 h-8 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
                  </div>
                )}
                <Spline
                  scene="https://prod.spline.design/uP8FxAJpRdIs-ei6/scene.splinecode"
                  className="w-full h-full relative z-10"
                  onLoad={() => setSplineLoaded(true)}
                />
              </SplineErrorBoundary>
            </div>
          </div>
        </div>

        <div className="mt-24">
          <h3 className="text-3xl font-heading text-center text-gray-100 mb-4">HIGHLIGHTS GALLERY</h3>
          <div className="w-24 h-1 bg-blue-500 mx-auto mb-8"></div>
          <CoverflowGallery images={galleryImages} autoplayDelay={4000} />
        </div>
      </div>
    </section>
  );
};

export default About;