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
  // Multi-color properties
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  cardBorder: string;
}

const SCROLL_SEQUENCE: ArcImageConfig[] = [
  { 
    id: 1, 
    label: 'The Arena Awaits', 
    title: 'IIT Bombay’s Ultimate Tech Rite of Passage',
    description: 'Step into the institute’s most legendary freshman battleground. XLR8 isn’t just a race—it’s where hundreds of squads collide, engines roar, and campus legacies are born.',
    side: 'left',  
    start: 0.000, end: 0.250,
    image: xlr81,
    badgeBg: 'bg-cyan-500/10', badgeText: 'text-cyan-400', badgeBorder: 'border-cyan-500/20', cardBorder: 'border-cyan-500/50'
  },
  { 
    id: 2, 
    label: 'Born in the Lab', 
    title: 'From Raw Parts to a High-Speed Beast',
    description: 'Zero robotics experience? That’s where the magic starts. Armed with ERC mentorship, late-night soldering sessions, and sheer grit, watch your first-ever bot come alive.',
    side: 'right', 
    start: 0.250, end: 0.500,
    image: xlr82,
    badgeBg: 'bg-amber-500/10', badgeText: 'text-amber-400', badgeBorder: 'border-amber-500/20', cardBorder: 'border-amber-500/50'
  },
  { 
    id: 3, 
    label: 'Unmatched Campus Scale', 
    title: 'The Biggest Freshman Showdown in IITB',
    description: 'Over 200+ rival squads and 800+ freshmen battling it out under one roof. With a deafening crowd of spectators packing the arena, XLR8 stands unchallenged as the largest and most electrifying technical festival track on campus.',
    side: 'left',  
    start: 0.500, end: 0.750,
    image: xlr83,
    badgeBg: 'bg-purple-500/10', badgeText: 'text-purple-400', badgeBorder: 'border-purple-500/20', cardBorder: 'border-purple-500/50'
  },
  { 
    id: 4, 
    label: 'Guided by the Best', 
    title: 'Build, Debug, and Iterate with ERC Seniors',
    description: 'You are never building alone. Get access to intensive hardware bootcamps and late-night troubleshooting sessions where ERC seniors help you debug fried circuits, optimize sensor calibration, and bulletproof your bot for race day.',
    side: 'right', 
    start: 0.750, end: 1.000,
    image: xlr84,
    badgeBg: 'bg-emerald-500/10', badgeText: 'text-emerald-400', badgeBorder: 'border-emerald-500/20', cardBorder: 'border-emerald-500/50'
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
        {/* Deep Tire Base (Solid dark rubber) */}
        <div
          style={{
            ...basePosStyle,
            width: `${(radius + 45) * 2}px`,
            height: `${(radius + 45) * 2}px`,
            borderWidth: '90px',
            borderColor: '#0a0a0a', 
            borderStyle: 'solid',
            boxShadow: '0 0 40px rgba(0,0,0,0.95), inset 0 0 40px rgba(0,0,0,0.95)',
          }}
        />
        
        {/* Outer Tire Treads (Using thick dashed lines for tread blocks) */}
        <div
          style={{
            ...basePosStyle,
            width: `${(radius + 42) * 2}px`,
            height: `${(radius + 42) * 2}px`,
            borderWidth: '84px',
            borderColor: '#171717', 
            borderStyle: 'dashed',
            opacity: 0.9,
          }}
        />

        {/* Center Tread Groove */}
        <div
          style={{
            ...basePosStyle,
            width: `${(radius + 2) * 2}px`,
            height: `${(radius + 2) * 2}px`,
            borderWidth: '4px',
            borderColor: '#050505', 
            borderStyle: 'solid',
          }}
        />

        {/* Inner Metallic Rim Edge */}
        <div
          style={{
            ...basePosStyle,
            width: `${(radius - 45) * 2}px`,
            height: `${(radius - 45) * 2}px`,
            borderWidth: '12px',
            borderColor: '#475569', // Slate-600 for an alloy wheel look
            borderStyle: 'solid',
            boxShadow: '0 0 15px rgba(0,0,0,0.9), inset 0 0 20px rgba(0,0,0,0.9)',
          }}
        />

        {/* Rim Inner Lip Detailing */}
        <div
          style={{
            ...basePosStyle,
            width: `${(radius - 57) * 2}px`,
            height: `${(radius - 57) * 2}px`,
            borderWidth: '2px',
            borderColor: '#334155', // Slate-700
            borderStyle: 'solid',
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
                className={`w-[320px] sm:w-[460px] md:w-[580px] h-[220px] sm:h-[320px] md:h-[380px] bg-slate-900 border-2 ${item.cardBorder} rounded-2xl shadow-2xl p-2 sm:p-3 pointer-events-auto overflow-hidden backdrop-blur-md`}
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
                <div className={`inline-block px-3 py-1 rounded-full ${item.badgeBg} ${item.badgeText} text-xs font-semibold tracking-wider uppercase mb-3 border ${item.badgeBorder}`}>
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
  // Styling properties
  tagBg: string;
  tagText: string;
  tagBorder: string;
  topBar: string;
  hoverBorder: string;
  titleHover: string;
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 1,
    phase: 'PHASE 01',
    title: 'XLR8 Oreo',
    description: 'Form your team and register through the official portal to participate in XLR8.',
    icon: <Users className="w-6 h-6 text-cyan-400" />,
    status: 'upcoming',
    tagBg: 'bg-cyan-950/60', tagText: 'text-cyan-400', tagBorder: 'border-cyan-800/50',
    topBar: 'bg-cyan-500', hoverBorder: 'hover:border-cyan-500/40', titleHover: 'group-hover:text-cyan-400'
  },
  {
    id: 2,
    phase: 'PHASE 02',
    title: 'Hardware Session',
    description: 'Session to design, build, and wire the hardware that brings your bot to life. (Electrical and mechanical).',
    icon: <Cpu className="w-6 h-6 text-amber-400" />,
    status: 'upcoming',
    tagBg: 'bg-amber-950/60', tagText: 'text-amber-400', tagBorder: 'border-amber-800/50',
    topBar: 'bg-amber-500', hoverBorder: 'hover:border-amber-500/40', titleHover: 'group-hover:text-amber-400'
  },
  {
    id: 3,
    phase: 'PHASE 03',
    title: 'Soldering Session',
    description: 'A practical session where you’ll learn the essential techniques and skills needed to solder with confidence.',
    icon: <Wrench className="w-6 h-6 text-rose-400" />,
    status: 'upcoming',
    tagBg: 'bg-rose-950/60', tagText: 'text-rose-400', tagBorder: 'border-rose-800/50',
    topBar: 'bg-rose-500', hoverBorder: 'hover:border-rose-500/40', titleHover: 'group-hover:text-rose-400'
  },
  {
    id: 4,
    phase: 'PHASE 04',
    title: 'Software Session',
    description: 'Hands-on workshop where you’ll learn to write and upload code to control your bot’s movements and actions.',
    icon: <Flag className="w-6 h-6 text-emerald-400" />,
    status: 'upcoming',
    tagBg: 'bg-emerald-950/60', tagText: 'text-emerald-400', tagBorder: 'border-emerald-800/50',
    topBar: 'bg-emerald-500', hoverBorder: 'hover:border-emerald-500/40', titleHover: 'group-hover:text-emerald-400'
  },
  {
    id: 5,
    phase: 'PHASE 05',
    title: 'XLR8 Main Event',
    description: 'Race your bot through a challenging obstacle course and compete with the best teams!',
    icon: <Trophy className="w-6 h-6 text-purple-400" />,
    status: 'upcoming',
    tagBg: 'bg-purple-950/60', tagText: 'text-purple-400', tagBorder: 'border-purple-800/50',
    topBar: 'bg-purple-500', hoverBorder: 'hover:border-purple-500/40', titleHover: 'group-hover:text-purple-400'
  },
];

const TimelineSection: React.FC = () => {
  return (
    <section className="relative w-full py-24 bg-[#0B1120] text-white overflow-hidden font-body">
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold font-heading tracking-tight mb-4 text-white">
            The <span className="text-cyan-400">XLR8</span> Roadmap
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
                    className={`w-full md:w-[calc(50%-4rem)] p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl relative group ${event.hoverBorder} transition-all duration-300 hover:-translate-y-1 overflow-hidden ${
                      isEven ? 'md:text-right' : 'md:text-left'
                    }`}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1 ${event.topBar} rounded-t-2xl`} />

                    <div
                      className={`flex flex-wrap items-center gap-3 mb-3 mt-1 ${
                        isEven ? 'md:justify-end' : 'md:justify-start'
                      }`}
                    >
                      <span className={`text-xs font-mono font-bold tracking-wider uppercase px-3 py-1 rounded-full border ${event.tagBg} ${event.tagText} ${event.tagBorder}`}>
                        {event.phase}
                      </span>

                      {event.status === 'completed' && (
                        <span className={`text-[11px] font-semibold tracking-wide px-2.5 py-0.5 rounded border ${event.tagBg} ${event.tagText} ${event.tagBorder}`}>
                          ✓ COMPLETED
                        </span>
                      )}
                      {event.status === 'current' && (
                        <span className={`text-[11px] font-semibold tracking-wide px-2.5 py-0.5 rounded border ${event.tagBg} ${event.tagText} ${event.tagBorder}`}>
                          ● IN PROGRESS
                        </span>
                      )}
                      {event.status === 'upcoming' && (
                        <span className="text-[11px] font-semibold tracking-wide text-slate-400 bg-slate-800/50 px-2.5 py-0.5 rounded border border-slate-700/40">
                          ○ UPCOMING
                        </span>
                      )}
                    </div>

                    <h3 className={`text-2xl font-bold font-heading text-white mb-3 tracking-wide transition-colors ${event.titleHover}`}>
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

/* 
const ComingSoonSection: React.FC = () => {
  // Commented out as requested
  // ...
}; 
*/

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
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-md transition-all text-lg font-medium font-heading text-white shadow-lg hover:shadow-indigo-500/25"
            >
              XLR8 Info
            </a>
          </div>

          {/* LARGE MULTI-COLOUR PARTICIPANT DASHBOARD CARD */}
          {isLoggedIn && user && (
            <div className="w-full max-w-3xl mx-auto text-left">
              {/* Card Container with Indigo Glow */}
              <div className="rounded-2xl bg-slate-900 border border-indigo-500/30 p-6 sm:p-8 relative overflow-hidden shadow-[0_0_35px_rgba(99,102,241,0.2)] hover:shadow-[0_0_50px_rgba(99,102,241,0.3)] transition-shadow duration-500">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
                  <div className="flex items-center gap-4">
                    {/* User Initials Avatar (Cyan Theme) */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800 border border-cyan-500/40 flex items-center justify-center font-bold text-2xl sm:text-3xl text-cyan-400 tracking-wider font-heading shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                      {user.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase() || 'P'}
                    </div>

                    <div>
                      {/* SSO Verified Tag (Emerald Theme) */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium mb-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
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
                    <div className="flex items-center gap-2 mt-1 px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-semibold text-slate-200 tracking-wide">
                        Verified Participant
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Grid (Multi-color Icons) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3.5 hover:border-cyan-500/30 transition-colors">
                    <Hash className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-mono text-slate-400 uppercase font-semibold">Roll Number</p>
                      <p className="text-base font-bold text-white font-mono mt-0.5">{user.roll}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3.5 hover:border-amber-500/30 transition-colors">
                    <BookOpen className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-mono text-slate-400 uppercase font-semibold">Department</p>
                      <p className="text-base font-semibold text-white mt-0.5">{user.department}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3.5 hover:border-purple-500/30 transition-colors">
                    <GraduationCap className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-mono text-slate-400 uppercase font-semibold">Degree</p>
                      <p className="text-base font-semibold text-white mt-0.5">{user.degree}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3.5 hover:border-rose-500/30 transition-colors">
                    <Calendar className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-mono text-slate-400 uppercase font-semibold">Passing Year</p>
                      <p className="text-base font-bold text-white font-mono mt-0.5">Class of {user.passing_year}</p>
                    </div>
                  </div>

                </div>

              </div>

              {/* ACTION BUTTONS WRAPPER */}
              <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                
                {/* Gradient Register Button */}
                <a
                  href="/xlr8registration"
                  className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white font-bold font-heading text-lg rounded-xl shadow-[0_0_25px_rgba(244,63,94,0.4)] hover:shadow-[0_0_35px_rgba(244,63,94,0.6)] transition-all duration-300 flex items-center justify-center gap-3 border border-rose-300/30 hover:-translate-y-0.5"
                >
                  <Zap className="w-5 h-5 fill-current text-white" />
                  <span>Register Now</span>
                </a>

                {(user.roll.toLowerCase() === '25b2254' || user.roll.toLowerCase() == '25b2134' || user.roll.toLowerCase() == '25b2465' || user.roll.toLowerCase() == '25b2149' || user.roll.toLowerCase() == '25b2203' || user.roll.toLowerCase() == '25b0325' || user.roll.toLowerCase() == '25b3973' || user.roll.toLowerCase() == '25b0661' || user.roll.toLowerCase() == '25b3907' || user.roll.toLowerCase() == '25b1308' || user.roll.toLowerCase() == '24b3949' || user.roll.toLowerCase() == '24b2471') && (
                  <a
                    href="/xlr8conveners"
                    className="w-full sm:w-auto px-10 py-4 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold font-heading text-lg rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.15)] hover:shadow-[0_0_35px_rgba(6,182,212,0.25)] transition-all duration-300 flex items-center justify-center gap-3 border border-cyan-800 hover:-translate-y-0.5"
                  >
                    <Lock className="w-5 h-5 text-cyan-400" />
                    <span>Convener Portal</span>
                  </a>
                )}

              </div>

            </div>
          )}

        </div>
      </div>
      
    </section>
    
    <SemicircularScrollGallery />

    <section className="py-12 bg-[#0B1120] text-white">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h2 className="text-3xl font-heading mb-6 border-b-4 border-rose-500 inline-block">XLR8 2025 After Movie</h2>

        <div className="p-1 rounded-3xl bg-slate-800 shadow-lg">
          <div className="rounded-2xl bg-[#0B1120] p-1">
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col items-center justify-center relative">
              <div className="flex flex-col items-center text-slate-400">
                <Video className="w-12 h-12 text-rose-500 mb-3" />
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

    {/* <ComingSoonSection /> */}
    </>
  );
};

export default XLR8;