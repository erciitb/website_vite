import React, { useEffect, useRef, useState } from 'react';
import { 
  Zap, 
  Users, 
  Cpu, 
  Wrench, 
  Flag, 
  Trophy, 
  Sparkles, 
  Calendar,
  Lock,
  Clock,
  Video,
  CheckCircle2,
  ShieldCheck,  
  User,
  GraduationCap,
  BookOpen,
  Hash
} from 'lucide-react';
import CenterLogo from '../assets/newcenterlogo.png';
import bgImage from '../assets/bg.jpeg';

import xlr81 from '../assets/xlr81.jpg'; 
import xlr82 from '../assets/xlr82.jpg';
import xlr83 from '../assets/xlr83.jpg';
import xlr84 from '../assets/xlr84.jpg';

import ProblemStatementSection from './ProblemStatement';
import ResultsSection from './ResultsSection';

// Replace this path with the actual location of your useAuth hook
import { useAuth } from '../hooks/useAuth';

interface SSOUser {
  name: string;
  roll: string;
  department: string;
  degree: string;
  passing_year: number;
}

interface ArcImageConfig {
  id: number;
  label: string;
  title: string;
  description: string;
  side: 'left' | 'right';
  start: number;
  end: number;
  image: string;
}

const SCROLL_SEQUENCE: ArcImageConfig[] = [
  { 
    id: 1, 
    label: 'The Arena Awaits', 
    title: 'IIT Bombay’s Ultimate Tech Rite of Passage',
    description: 'Step into the institute’s most legendary freshman battleground. XLR8 isn’t just a race—it’s where hundreds of squads collide, engines roar, and campus legacies are born.',
    side: 'left',  
    start: 0.000, end: 0.250,
    image: xlr81
  },
  { 
    id: 2, 
    label: 'Born in the Lab', 
    title: 'From Raw Parts to a High-Speed Beast',
    description: 'Zero robotics experience? That’s where the magic starts. Armed with ERC mentorship, late-night soldering sessions, and sheer grit, watch your first-ever bot come alive.',
    side: 'right', 
    start: 0.250, end: 0.500,
    image: xlr82
  },
  { 
    id: 3, 
    label: 'Unmatched Campus Scale', 
    title: 'The Biggest Freshman Showdown in IITB',
    description: 'Over 200+ rival squads and 800+ freshmen battling it out under one roof. With a deafening crowd of spectators packing the arena, XLR8 stands unchallenged as the largest and most electrifying technical festival track on campus.',
    side: 'left',  
    start: 0.500, end: 0.750,
    image: xlr83
  },
  { 
    id: 4, 
    label: 'Guided by the Best', 
    title: 'Build, Debug, and Iterate with ERC Seniors',
    description: 'You are never building alone. Get access to intensive hardware bootcamps and late-night troubleshooting sessions where ERC seniors help you debug fried circuits, optimize sensor calibration, and bulletproof your bot for race day.',
    side: 'right', 
    start: 0.750, end: 1.000,
    image: xlr84
  },
];

const SemicircularScrollGallery: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [radius, setRadius] = useState(350);

  useEffect(() => {
    const updateRadius = () => {
      const w = window.innerWidth;
      setRadius(Math.min(Math.max(w * 0.28, 160), 380));
    };
    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScrollableHeight = rect.height - window.innerHeight;
      
      if (totalScrollableHeight <= 0) return;

      const currentScroll = -rect.top;
      const progress = Math.min(Math.max(currentScroll / totalScrollableHeight, 0), 1);
      
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getEffectiveProgress = (t: number): number => {
    const holdStart = 0.30;  
    const holdEnd = 0.70;    
    if (t < holdStart) {
      return (t / holdStart) * 0.5;
    } else if (t <= holdEnd) {
      return 0.5;
    } else {
      return 0.5 + ((t - holdEnd) / (1 - holdEnd)) * 0.5;
    }
  };

  const getImageStyle = (item: ArcImageConfig): React.CSSProperties => {
    if (scrollProgress < item.start || scrollProgress > item.end) {
      return { opacity: 0, pointerEvents: 'none', transform: 'translate3d(-9999px, 0, 0)' };
    }

    const t = (scrollProgress - item.start) / (item.end - item.start);

    const effectiveT = getEffectiveProgress(t);
    const angle = -Math.PI / 2 + effectiveT * Math.PI;

    const xOffset = radius * Math.cos(angle);
    const yOffset = radius * Math.sin(angle);

    const x = item.side === 'left' ? xOffset : -xOffset;
    const y = yOffset;

    let opacity = 1;
    if (t < 0.12) opacity = t / 0.12;
    else if (t > 0.88) opacity = (1 - t) / 0.12;

    const scale = 0.75 + 0.25 * Math.sin(effectiveT * Math.PI);

    const baseTransform = item.side === 'left' ? 'translate(-50%, -50%)' : 'translate(50%, -50%)';

    return {
      opacity,
      transform: `${baseTransform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
      transition: 'transform 75ms linear, opacity 75ms linear',
      willChange: 'transform, opacity',
      position: 'absolute',
      left: item.side === 'left' ? '0px' : 'auto',
      right: item.side === 'right' ? '0px' : 'auto',
      top: '50%',
      zIndex: 20,
    };
  };

  const getTextStyle = (item: ArcImageConfig): React.CSSProperties => {
    if (scrollProgress < item.start || scrollProgress > item.end) {
      return { opacity: 0, pointerEvents: 'none' };
    }

    const t = (scrollProgress - item.start) / (item.end - item.start);

    let opacity = 0;
    let translateY = 15;

    if (t >= 0.18 && t <= 0.82) {
      if (t < 0.30) {
        const fadeInT = (t - 0.18) / 0.12;
        opacity = fadeInT;
        translateY = 15 * (1 - fadeInT);
      } else if (t > 0.70) {
        const fadeOutT = (0.82 - t) / 0.12;
        opacity = fadeOutT;
        translateY = -15 * (1 - fadeOutT);
      } else {
        opacity = 1;
        translateY = 0;
      }
    }

    return {
      opacity,
      transform: `translateY(calc(-50% + ${translateY}px))`,
      transition: 'transform 75ms linear, opacity 75ms linear',
      willChange: 'transform, opacity',
      position: 'absolute',
      left: item.side === 'right' ? '8%' : 'auto',
      right: item.side === 'left' ? '8%' : 'auto',
      top: '50%',
      zIndex: 30,
    };
  };

  const renderRoadTrack = (side: 'left' | 'right') => {
    const isLeft = side === 'left';
    const basePosStyle: React.CSSProperties = {
      position: 'absolute',
      top: '50%',
      left: isLeft ? '0px' : 'auto',
      right: !isLeft ? '0px' : 'auto',
      transform: isLeft ? 'translate(-50%, -50%)' : 'translate(50%, -50%)',
      borderRadius: '9999px',
      pointerEvents: 'none',
    };

    return (
      <div key={`road-${side}`} className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          style={{
            ...basePosStyle,
            width: `${(radius + 32) * 2}px`,
            height: `${(radius + 32) * 2}px`,
            borderWidth: '64px',
            borderColor: '#0f172a', 
            borderStyle: 'solid',
            boxShadow: '0 0 30px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,0,0,0.8)',
          }}
        />
        <div
          style={{
            ...basePosStyle,
            width: `${(radius + 32) * 2}px`,
            height: `${(radius + 32) * 2}px`,
            borderWidth: '2px',
            borderColor: '#3b82f6', 
            borderStyle: 'solid',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)',
          }}
        />
        <div
          style={{
            ...basePosStyle,
            width: `${(radius - 32) * 2}px`,
            height: `${(radius - 32) * 2}px`,
            borderWidth: '2px',
            borderColor: '#3b82f6', 
            borderStyle: 'solid',
          }}
        />
        <div
          style={{
            ...basePosStyle,
            width: `${radius * 2}px`,
            height: `${radius * 2}px`,
            borderWidth: '2px',
            borderColor: '#3b82f6', 
            borderStyle: 'dashed',
          }}
        />
      </div>
    );
  };

  return (
    <section 
      ref={containerRef} 
      className="relative w-full bg-[#0B1120] text-white" 
      style={{ height: '500vh' }} 
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center">
        
        {renderRoadTrack('left')}
        {renderRoadTrack('right')}

        <div className="absolute inset-0 pointer-events-none">
          {SCROLL_SEQUENCE.map((item) => (
            <React.Fragment key={item.id}>
              
              <div
                style={getImageStyle(item)}
                className="w-[320px] sm:w-[460px] md:w-[580px] h-[220px] sm:h-[320px] md:h-[380px] bg-slate-900 border-2 border-blue-500/60 rounded-2xl shadow-2xl p-2 sm:p-3 pointer-events-auto overflow-hidden backdrop-blur-md"
              >
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover rounded-xl border border-white/5 shadow-inner"
                />
              </div>

              <div
                style={getTextStyle(item)}
                className="w-[280px] sm:w-[340px] md:w-[420px] p-6 rounded-2xl bg-slate-900 border border-slate-700/60 backdrop-blur-md shadow-2xl pointer-events-auto"
              >
                <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold tracking-wider uppercase mb-3 border border-blue-500/20">
                  TRACK PROTOCOL • 0{item.id}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold font-heading text-white mb-3 tracking-wide">
                  {item.title}
                </h3>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                  {item.description}
                </p>
              </div>

            </React.Fragment>
          ))}
        </div>

      </div>
    </section>
  );
};

interface TimelineEvent {
  id: number;
  phase: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'current' | 'upcoming';
  accentColor: string;
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 1,
    phase: 'PHASE 01',
    title: 'XLR8 Oreo',
    description: 'Form your team and register through the official portal to participate in XLR8.',
    icon: <Users className="w-6 h-6 text-blue-400" />,
    status: 'upcoming',
    accentColor: 'from-blue-600 to-blue-400',
  },
  {
    id: 2,
    phase: 'PHASE 02',
    title: 'Hardware Session',
    description: 'Session to design, build, and wire the hardware that brings your bot to life. (Electrical and mechanical).',
    icon: <Cpu className="w-6 h-6 text-blue-400" />,
    status: 'upcoming',
    accentColor: 'from-blue-600 to-blue-400',
  },
  {
    id: 3,
    phase: 'PHASE 03',
    title: 'Soldering Session',
    description: 'A practical session where you’ll learn the essential techniques and skills needed to solder with confidence.',
    icon: <Wrench className="w-6 h-6 text-blue-400" />,
    status: 'upcoming',
    accentColor: 'from-blue-600 to-blue-400',
  },
  {
    id: 4,
    phase: 'PHASE 04',
    title: 'Software Session',
    description: 'Hands-on workshop where you’ll learn to write and upload code to control your bot’s movements and actions.',
    icon: <Flag className="w-6 h-6 text-blue-400" />,
    status: 'upcoming',
    accentColor: 'from-blue-600 to-blue-400',
  },
  {
    id: 5,
    phase: 'PHASE 05',
    title: 'XLR8 Main Event',
    description: 'Race your bot through a challenging obstacle course and compete with the best teams!',
    icon: <Trophy className="w-6 h-6 text-blue-400" />,
    status: 'upcoming',
    accentColor: 'from-blue-600 to-blue-400',
  },
];

const TimelineSection: React.FC = () => {
  return (
    <section className="relative w-full py-24 bg-[#0B1120] text-white overflow-hidden font-body">
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold font-heading tracking-tight mb-4 text-white">
            The <span className="text-blue-400">XLR8</span> Roadmap
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            The technical schedule from initial team assembly to the high-speed arena finale.
          </p>
        </div>

        <div className="relative">
          {TIMELINE_EVENTS.map((event, index) => {
            const isEven = index % 2 === 1; 

            return (
              <div key={event.id} className="relative mb-12 md:mb-16 last:mb-0">
                
                <div
                  className={`flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12 relative z-10 ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  
                  <div className="flex items-center justify-center shrink-0 w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 shadow-xl relative group">
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      {event.icon}
                    </div>
                    <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400 shadow">
                      0{event.id}
                    </span>
                  </div>

                  <div
                    className={`w-full md:w-[calc(50%-4rem)] p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl relative group hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden ${
                      isEven ? 'md:text-right' : 'md:text-left'
                    }`}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 rounded-t-2xl" />

                    <div
                      className={`flex flex-wrap items-center gap-3 mb-3 mt-1 ${
                        isEven ? 'md:justify-end' : 'md:justify-start'
                      }`}
                    >
                      <span className="text-xs font-mono font-bold tracking-wider text-blue-400 uppercase bg-blue-950/60 px-3 py-1 rounded-full border border-blue-800/50">
                        {event.phase}
                      </span>

                      {event.status === 'completed' && (
                        <span className="text-[11px] font-semibold tracking-wide text-blue-400 bg-blue-950/40 px-2.5 py-0.5 rounded border border-blue-800/40">
                          ✓ COMPLETED
                        </span>
                      )}
                      {event.status === 'current' && (
                        <span className="text-[11px] font-semibold tracking-wide text-blue-400 bg-blue-950/40 px-2.5 py-0.5 rounded border border-blue-800/40">
                          ● IN PROGRESS
                        </span>
                      )}
                      {event.status === 'upcoming' && (
                        <span className="text-[11px] font-semibold tracking-wide text-slate-400 bg-slate-800/50 px-2.5 py-0.5 rounded border border-slate-700/40">
                          ○ UPCOMING
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl font-bold font-heading text-white mb-3 tracking-wide group-hover:text-blue-400 transition-colors">
                      {event.title}
                    </h3>

                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                      {event.description}
                    </p>

                  </div>

                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

const ComingSoonSection: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date('2026-08-15T00:00:00').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-24 bg-[#0B1120] text-white overflow-hidden flex items-center justify-center font-body border-t border-slate-800 px-4">
      
      <div className="relative z-10 w-full max-w-4xl p-1 rounded-3xl bg-slate-800 shadow-2xl">
        <div className="rounded-[22px] bg-slate-900 p-8 sm:p-12 md:p-16 text-center relative overflow-hidden border border-slate-800">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono tracking-widest uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>TARGET DATE • AUGUST 15</span>
          </div>

          <h3 className="text-4xl sm:text-6xl md:text-7xl font-black font-heading tracking-tight mb-4 uppercase text-white">
            XLR8 <span className="text-blue-400">Coming Soon</span>
          </h3>

          <p className="text-slate-300 text-base sm:text-lg max-w-lg mx-auto mb-10 font-light">
            The institute’s ultimate robotic battleground is charging up. Assemble your squad and stand by for the drop.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
            
            <div className="relative p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl md:text-6xl font-black font-mono text-white tracking-tight">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[11px] font-mono text-blue-400 uppercase tracking-widest mt-1 font-semibold">Days</span>
            </div>

            <div className="relative p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl md:text-6xl font-black font-mono text-white tracking-tight">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[11px] font-mono text-blue-400 uppercase tracking-widest mt-1 font-semibold">Hours</span>
            </div>

            <div className="relative p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl md:text-6xl font-black font-mono text-white tracking-tight">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[11px] font-mono text-blue-400 uppercase tracking-widest mt-1 font-semibold">Minutes</span>
            </div>

            <div className="relative p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl md:text-6xl font-black font-mono text-blue-400 tracking-tight">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[11px] font-mono text-blue-400 uppercase tracking-widest mt-1 font-semibold">Seconds</span>
            </div>

          </div>

        </div>
      </div>

    </section>
  );
};

const XLR8 = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { user, isLoggedIn } = useAuth() as { user: SSOUser | null; isLoggedIn: boolean };

  return (
    <>
    <section
      ref={heroRef}
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat py-20"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(rgb(0, 0, 0), rgb(15, 23, 42))',
          opacity: 0.85, 
        }}
      />

      <div className="container mx-auto px-4 z-10 font-body">
        <div className="max-w-3xl mx-auto text-center">
          
          <img src={CenterLogo} alt="Footer Logo" className="block mx-auto w-auto h-auto" />
          <br />

          <p className="text-xl text-slate-300 mb-8">
            Gear up for our club’s flagship event, recognized as the institute’s biggest technical event, bringing together students to compete, learn, and excel.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
             <a
              href="https://erc-xlr8.notion.site/xlr8-home-25"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-md transition-all text-lg font-medium font-heading text-white shadow-lg hover:shadow-blue-500/25"
            >
              XLR8 Info
            </a>
          </div>

          {/* LARGE UNICOLOUR PARTICIPANT DASHBOARD CARD WITH BLUE GLOW */}
          {isLoggedIn && user && (
            <div className="w-full max-w-3xl mx-auto text-left">
              {/* Card Container with Subtle Blue Glow */}
              <div className="rounded-2xl bg-slate-900 border border-blue-500/30 p-6 sm:p-8 relative overflow-hidden shadow-[0_0_35px_rgba(59,130,246,0.25)] hover:shadow-[0_0_50px_rgba(59,130,246,0.35)] transition-shadow duration-500">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
                  <div className="flex items-center gap-4">
                    {/* User Initials Avatar */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800 border border-blue-500/40 flex items-center justify-center font-bold text-2xl sm:text-3xl text-blue-400 tracking-wider font-heading shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                      {user.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase() || 'P'}
                    </div>

                    <div>
                      {/* SSO Verified Tag */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-950/50 border border-blue-500/30 text-blue-400 text-xs font-mono font-medium mb-1.5">
                        <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>IITB SSO Authenticated</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-wide">
                        {user.name}
                      </h3>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 pt-2 sm:pt-0">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
                      Account Status
                    </span>
                    <div className="flex items-center gap-2 mt-1 px-3 py-1.5 rounded-lg bg-blue-950/40 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.15)]">
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-semibold text-slate-200 tracking-wide">
                        Verified Participant
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3.5 hover:border-blue-500/30 transition-colors">
                    <Hash className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-mono text-slate-400 uppercase font-semibold">Roll Number</p>
                      <p className="text-base font-bold text-white font-mono mt-0.5">{user.roll}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3.5 hover:border-blue-500/30 transition-colors">
                    <BookOpen className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-mono text-slate-400 uppercase font-semibold">Department</p>
                      <p className="text-base font-semibold text-white mt-0.5">{user.department}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3.5 hover:border-blue-500/30 transition-colors">
                    <GraduationCap className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-mono text-slate-400 uppercase font-semibold">Degree</p>
                      <p className="text-base font-semibold text-white mt-0.5">{user.degree}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3.5 hover:border-blue-500/30 transition-colors">
                    <Calendar className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-mono text-slate-400 uppercase font-semibold">Passing Year</p>
                      <p className="text-base font-bold text-white font-mono mt-0.5">Class of {user.passing_year}</p>
                    </div>
                  </div>

                </div>

              </div>

              {/* REGISTER NOW BUTTON */}
              <div className="mt-6 flex justify-center">
                <a
                  href="/xlr8registration"
                  className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold font-heading text-lg rounded-xl shadow-[0_0_25px_rgba(59,130,246,0.4)] hover:shadow-[0_0_35px_rgba(59,130,246,0.6)] transition-all duration-300 flex items-center justify-center gap-3 border border-blue-400/40 hover:-translate-y-0.5"
                >
                  <Zap className="w-5 h-5 fill-current text-blue-200" />
                  <span>Register Now</span>
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
      
    </section>
    
    <SemicircularScrollGallery />

    <section className="py-12 bg-[#0B1120] text-white">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h2 className="text-3xl font-heading mb-6 border-b-4 border-blue-600 inline-block">XLR8 2025 After Movie</h2>

        <div className="p-1 rounded-3xl bg-slate-800 shadow-lg">
          <div className="rounded-2xl bg-[#0B1120] p-1">
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col items-center justify-center relative">
              <div className="flex flex-col items-center text-slate-400">
                <Video className="w-12 h-12 text-blue-400 mb-3" />
                <span className="text-sm font-mono tracking-widest text-slate-300 uppercase">
                  Footage Processing...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <TimelineSection />

    <ComingSoonSection />
    </>
  );
};

export default XLR8;