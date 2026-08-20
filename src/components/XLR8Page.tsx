import React, { useEffect, useRef, useState } from 'react';

import {
  Zap,
  Users,
  Cpu,
  Wrench,
  Flag,
  Trophy,
  CheckCircle2,
  Lock,
  LogOut,
  Gauge,
  ChevronRight,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

import { Link, useNavigate } from 'react-router-dom';

import CenterLogo from '../assets/newcenterlogo.png';
import bgImage from '../assets/bg.jpeg';

import xlr81 from '../assets/xlr81.jpg';
import xlr82 from '../assets/xlr82.jpg';
import xlr83 from '../assets/xlr83.jpg';
import xlr84 from '../assets/xlr84.jpg';

import { useAuth, logout } from '../hooks/useAuth';
import { XLR8_SSO_URL } from '../config/sso';

/* =========================================================
   SSO USER
========================================================= */

interface SSOUser {
  name: string;
  roll: string;
  department: string;
  degree: string;
  passing_year: number;
}

/* =========================================================
   FINAL XLR8 REGISTRATION API
========================================================= */

const FINAL_REG_CHECK_URL =
  'https://script.google.com/macros/s/AKfycbzzUy14kFvbJLR3I64RbgrrpJfx4XJYHmEr0Gfe8ph0pgA4u1vb-lamM34_qFrO0GBQnQ/exec';

/* =========================================================
   SCROLL GALLERY
========================================================= */

interface ArcImageConfig {
  id: number;
  label: string;
  title: string;
  description: string;
  side: 'left' | 'right';
  start: number;
  end: number;
  image: string;
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
    description:
      'Step into the institute’s most legendary freshman battleground. XLR8 isn’t just a race—it’s where hundreds of squads collide, engines roar, and campus legacies are born.',
    side: 'left',
    start: 0.0,
    end: 0.25,
    image: xlr81,
    badgeBg: 'bg-cyan-500/10',
    badgeText: 'text-cyan-400',
    badgeBorder: 'border-cyan-500/20',
    cardBorder: 'border-cyan-500/50',
  },
  {
    id: 2,
    label: 'Born in the Lab',
    title: 'From Raw Parts to a High-Speed Beast',
    description:
      'Zero robotics experience? That’s where the magic starts. Armed with ERC mentorship, late-night soldering sessions, and sheer grit, watch your first-ever bot come alive.',
    side: 'right',
    start: 0.25,
    end: 0.5,
    image: xlr82,
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-500/20',
    cardBorder: 'border-amber-500/50',
  },
  {
    id: 3,
    label: 'Unmatched Campus Scale',
    title: 'The Biggest Freshman Showdown in IITB',
    description:
      'Over 200+ rival squads and 800+ freshmen battling it out under one roof. With a deafening crowd of spectators packing the arena, XLR8 stands unchallenged as the largest and most electrifying technical festival track on campus.',
    side: 'left',
    start: 0.5,
    end: 0.75,
    image: xlr83,
    badgeBg: 'bg-purple-500/10',
    badgeText: 'text-purple-400',
    badgeBorder: 'border-purple-500/20',
    cardBorder: 'border-purple-500/50',
  },
  {
    id: 4,
    label: 'Guided by the Best',
    title: 'Build, Debug, and Iterate with ERC Seniors',
    description:
      'You are never building alone. Get access to intensive hardware bootcamps and late-night troubleshooting sessions where ERC seniors help you debug fried circuits, optimize sensor calibration, and bulletproof your bot for race day.',
    side: 'right',
    start: 0.75,
    end: 1.0,
    image: xlr84,
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/20',
    cardBorder: 'border-emerald-500/50',
  },
];

/* =========================================================
   SEMICIRCULAR SCROLL GALLERY
========================================================= */

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

    return () => {
      window.removeEventListener('resize', updateRadius);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();

      const totalScrollableHeight =
        rect.height - window.innerHeight;

      if (totalScrollableHeight <= 0) return;

      const currentScroll = -rect.top;

      const progress = Math.min(
        Math.max(
          currentScroll / totalScrollableHeight,
          0
        ),
        1
      );

      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const getEffectiveProgress = (t: number): number => {
    const holdStart = 0.3;
    const holdEnd = 0.7;

    if (t < holdStart) {
      return (t / holdStart) * 0.5;
    }

    if (t <= holdEnd) {
      return 0.5;
    }

    return (
      0.5 +
      ((t - holdEnd) / (1 - holdEnd)) * 0.5
    );
  };

  const getImageStyle = (
    item: ArcImageConfig
  ): React.CSSProperties => {
    if (
      scrollProgress < item.start ||
      scrollProgress > item.end
    ) {
      return {
        opacity: 0,
        pointerEvents: 'none',
        transform: 'translate3d(-9999px, 0, 0)',
      };
    }

    const t =
      (scrollProgress - item.start) /
      (item.end - item.start);

    const effectiveT = getEffectiveProgress(t);

    const angle =
      -Math.PI / 2 +
      effectiveT * Math.PI;

    const xOffset =
      radius * Math.cos(angle);

    const yOffset =
      radius * Math.sin(angle);

    const x =
      item.side === 'left'
        ? xOffset
        : -xOffset;

    const y = yOffset;

    let opacity = 1;

    if (t < 0.12) {
      opacity = t / 0.12;
    } else if (t > 0.88) {
      opacity = (1 - t) / 0.12;
    }

    const scale =
      0.75 +
      0.25 *
        Math.sin(
          effectiveT * Math.PI
        );

    const baseTransform =
      item.side === 'left'
        ? 'translate(-50%, -50%)'
        : 'translate(50%, -50%)';

    return {
      opacity,
      transform:
        `${baseTransform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
      transition:
        'transform 75ms linear, opacity 75ms linear',
      willChange: 'transform, opacity',
      position: 'absolute',
      left:
        item.side === 'left'
          ? '0px'
          : 'auto',
      right:
        item.side === 'right'
          ? '0px'
          : 'auto',
      top: '50%',
      zIndex: 20,
    };
  };

  const getTextStyle = (
    item: ArcImageConfig
  ): React.CSSProperties => {
    if (
      scrollProgress < item.start ||
      scrollProgress > item.end
    ) {
      return {
        opacity: 0,
        pointerEvents: 'none',
      };
    }

    const t =
      (scrollProgress - item.start) /
      (item.end - item.start);

    let opacity = 0;
    let translateY = 15;

    if (t >= 0.18 && t <= 0.82) {
      if (t < 0.3) {
        const fadeInT =
          (t - 0.18) / 0.12;

        opacity = fadeInT;
        translateY =
          15 * (1 - fadeInT);
      } else if (t > 0.7) {
        const fadeOutT =
          (0.82 - t) / 0.12;

        opacity = fadeOutT;
        translateY =
          -15 * (1 - fadeOutT);
      } else {
        opacity = 1;
        translateY = 0;
      }
    }

    return {
      opacity,
      transform:
        `translateY(calc(-50% + ${translateY}px))`,
      transition:
        'transform 75ms linear, opacity 75ms linear',
      willChange: 'transform, opacity',
      position: 'absolute',
      left:
        item.side === 'right'
          ? '8%'
          : 'auto',
      right:
        item.side === 'left'
          ? '8%'
          : 'auto',
      top: '50%',
      zIndex: 30,
    };
  };

  const renderRoadTrack = (
    side: 'left' | 'right'
  ) => {
    const isLeft = side === 'left';

    const basePosStyle: React.CSSProperties = {
      position: 'absolute',
      top: '50%',
      left: isLeft
        ? '0px'
        : 'auto',
      right: !isLeft
        ? '0px'
        : 'auto',
      transform: isLeft
        ? 'translate(-50%, -50%)'
        : 'translate(50%, -50%)',
      borderRadius: '9999px',
      pointerEvents: 'none',
    };

    return (
      <div
        key={`road-${side}`}
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        <div
          style={{
            ...basePosStyle,
            width: `${(radius + 45) * 2}px`,
            height: `${(radius + 45) * 2}px`,
            borderWidth: '90px',
            borderColor: '#0a0a0a',
            borderStyle: 'solid',
            boxShadow:
              '0 0 40px rgba(0,0,0,0.95), inset 0 0 40px rgba(0,0,0,0.95)',
          }}
        />

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

        <div
          style={{
            ...basePosStyle,
            width: `${(radius - 45) * 2}px`,
            height: `${(radius - 45) * 2}px`,
            borderWidth: '12px',
            borderColor: '#475569',
            borderStyle: 'solid',
            boxShadow:
              '0 0 15px rgba(0,0,0,0.9), inset 0 0 20px rgba(0,0,0,0.9)',
          }}
        />

        <div
          style={{
            ...basePosStyle,
            width: `${(radius - 57) * 2}px`,
            height: `${(radius - 57) * 2}px`,
            borderWidth: '2px',
            borderColor: '#334155',
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
                <div
                  className={`inline-block px-3 py-1 rounded-full ${item.badgeBg} ${item.badgeText} text-xs font-semibold tracking-wider uppercase mb-3 border ${item.badgeBorder}`}
                >
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

/* =========================================================
   TIMELINE
========================================================= */

interface TimelineEvent {
  id: number;
  phase: string;
  title: string;
  date: string;
  description: string;
  icon: React.ReactNode;
  status:
    | 'completed'
    | 'current'
    | 'upcoming';
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
    date: '15 AUG',
    description:
      'Form your team, understand the challenge, and get ready for your XLR8 journey.',
    icon: <Users className="w-6 h-6 text-cyan-400" />,
    status: 'completed',
    tagBg: 'bg-cyan-950/60',
    tagText: 'text-cyan-400',
    tagBorder: 'border-cyan-800/50',
    topBar: 'bg-cyan-500',
    hoverBorder: 'hover:border-cyan-500/40',
    titleHover: 'group-hover:text-cyan-400',
  },
  {
    id: 2,
    phase: 'PHASE 02',
    title: 'Software Session',
    date: '22 AUG',
    description:
      'Learn the fundamentals of programming your bot and get it moving with the right code.',
    icon: <Cpu className="w-6 h-6 text-amber-400" />,
    status: 'upcoming',
    tagBg: 'bg-amber-950/60',
    tagText: 'text-amber-400',
    tagBorder: 'border-amber-800/50',
    topBar: 'bg-amber-500',
    hoverBorder: 'hover:border-amber-500/40',
    titleHover: 'group-hover:text-amber-400',
  },
  {
    id: 3,
    phase: 'PHASE 03',
    title: 'Soldering Session',
    date: '23 AUG',
    description:
      'Get hands-on with your electronics and learn the essential soldering skills needed to build your bot.',
    icon: <Wrench className="w-6 h-6 text-rose-400" />,
    status: 'upcoming',
    tagBg: 'bg-rose-950/60',
    tagText: 'text-rose-400',
    tagBorder: 'border-rose-800/50',
    topBar: 'bg-rose-500',
    hoverBorder: 'hover:border-rose-500/40',
    titleHover: 'group-hover:text-rose-400',
  },
  {
    id: 4,
    phase: 'PHASE 04',
    title: 'Debugging Session',
    date: '29 AUG',
    description:
      'Troubleshoot your bot, fix hardware and software issues, and get expert help to make sure everything is race-ready.',
    icon: <Flag className="w-6 h-6 text-emerald-400" />,
    status: 'upcoming',
    tagBg: 'bg-emerald-950/60',
    tagText: 'text-emerald-400',
    tagBorder: 'border-emerald-800/50',
    topBar: 'bg-emerald-500',
    hoverBorder: 'hover:border-emerald-500/40',
    titleHover: 'group-hover:text-emerald-400',
  },
  {
    id: 5,
    phase: 'PHASE 05',
    title: 'Checkpoint',
    date: '30 AUG',
    description:
      'Time for a progress check. Show us what you have built, assess your team’s progress, and make sure your bot is on track for the final showdown.',
    icon: <CheckCircle2 className="w-6 h-6 text-blue-400" />,
    status: 'upcoming',
    tagBg: 'bg-blue-950/60',
    tagText: 'text-blue-400',
    tagBorder: 'border-blue-800/50',
    topBar: 'bg-blue-500',
    hoverBorder: 'hover:border-blue-500/40',
    titleHover: 'group-hover:text-blue-400',
  },
  {
    id: 6,
    phase: 'PHASE 06',
    title: 'XLR8 Main Event',
    date: '05–06 SEP',
    description:
      'The final showdown. Put your bot to the test, take on the obstacle course, and race against the best teams on campus.',
    icon: <Trophy className="w-6 h-6 text-purple-400" />,
    status: 'upcoming',
    tagBg: 'bg-purple-950/60',
    tagText: 'text-purple-400',
    tagBorder: 'border-purple-800/50',
    topBar: 'bg-purple-500',
    hoverBorder: 'hover:border-purple-500/40',
    titleHover: 'group-hover:text-purple-400',
  },
];

/* =========================================================
   TIMELINE SECTION
========================================================= */

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
            From team formation and technical sessions to the final high-speed showdown.
          </p>

        </div>

        <div className="relative">

          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/30 via-slate-700 to-purple-500/30 -translate-x-1/2" />

          {TIMELINE_EVENTS.map((event, index) => {
            const isEven = index % 2 === 1;
            const isCompleted =
              event.status === 'completed';

            return (
              <div
                key={event.id}
                className="relative mb-12 md:mb-16 last:mb-0"
              >
                <div
                  className={`flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12 relative z-10 ${
                    isEven
                      ? 'md:flex-row-reverse'
                      : ''
                  }`}
                >

                  <div
                    className={`flex items-center justify-center shrink-0 w-16 h-16 rounded-2xl bg-slate-900 border ${
                      isCompleted
                        ? 'border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
                        : 'border-slate-700 shadow-xl'
                    } relative group`}
                  >
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      {event.icon}
                    </div>

                    <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400 shadow">
                      0{event.id}
                    </span>

                    {isCompleted && (
                      <span className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0B1120] flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </span>
                    )}
                  </div>

                  <div
                    className={`w-full md:w-[calc(50%-4rem)] p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl relative group ${event.hoverBorder} transition-all duration-300 hover:-translate-y-1 overflow-hidden ${
                      isEven
                        ? 'md:text-right'
                        : 'md:text-left'
                    }`}
                  >
                    <div
                      className={`absolute top-0 left-0 right-0 h-1 ${event.topBar} rounded-t-2xl`}
                    />

                    <div
                      className={`flex flex-wrap items-center gap-3 mb-3 mt-1 ${
                        isEven
                          ? 'md:justify-end'
                          : 'md:justify-start'
                      }`}
                    >
                      <span
                        className={`text-xs font-mono font-bold tracking-wider uppercase px-3 py-1 rounded-full border ${event.tagBg} ${event.tagText} ${event.tagBorder}`}
                      >
                        {event.phase}
                      </span>

                      <span className="text-xs font-mono font-bold tracking-wider text-white bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                        {event.date}
                      </span>

                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          COMPLETED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded border border-slate-700/40">
                          <span className="text-slate-500">○</span>
                          UPCOMING
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-2xl font-bold font-heading text-white mb-3 tracking-wide transition-colors ${event.titleHover}`}
                    >
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

/* =========================================================
   MAIN XLR8 PAGE
========================================================= */

const XLR8: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  /*
    React Router navigation for internal routes.
    This prevents a full page reload when opening
    participant / convener portals.
  */
  const navigate = useNavigate();

  const {
    user,
    isLoggedIn,
  } = useAuth() as {
    user: SSOUser | null;
    isLoggedIn: boolean;
  };

  type RegistrationStatus =
    | 'idle'
    | 'checking'
    | 'registered'
    | 'not_registered'
    | 'error';

  const [
    registrationStatus,
    setRegistrationStatus,
  ] = useState<RegistrationStatus>('idle');

  const [
    registeredTeamName,
    setRegisteredTeamName,
  ] = useState('');

  const [
    registeredVehicleNo,
    setRegisteredVehicleNo,
  ] = useState('');

  /* =======================================================
     CHECK REGISTRATION
  ======================================================= */

  const checkFinalRegistration = async () => {
    if (!user?.roll) {
      setRegistrationStatus('idle');
      return;
    }

    setRegistrationStatus('checking');

    try {
      const roll = user.roll
        .trim()
        .toLowerCase();

      const response = await fetch(
        `${FINAL_REG_CHECK_URL}?roll=${encodeURIComponent(roll)}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        throw new Error(
          `Registration API returned ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        'XLR8 Registration API Response:',
        data
      );

      if (data.found === true) {
        setRegisteredTeamName(
          data.teamName || ''
        );

        setRegisteredVehicleNo(
          data.vehicleNumber || ''
        );

        setRegistrationStatus(
          'registered'
        );
      } else {
        setRegisteredTeamName('');
        setRegisteredVehicleNo('');

        setRegistrationStatus(
          'not_registered'
        );
      }
    } catch (error) {
      console.error(
        'XLR8 registration verification failed:',
        error
      );

      setRegistrationStatus('error');
    }
  };

  /* =======================================================
     AUTO CHECK AFTER LOGIN
  ======================================================= */

  useEffect(() => {
    if (isLoggedIn && user?.roll) {
      checkFinalRegistration();
    } else {
      setRegistrationStatus('idle');
      setRegisteredTeamName('');
      setRegisteredVehicleNo('');
    }
  }, [isLoggedIn, user?.roll]);

  /* =======================================================
     CONVENER CHECK
  ======================================================= */

  const isConvener =
    !!user &&
    [
      '25b2254',
      '25b2234',
      '25b2465',
      '25b2149',
      '25b2203',
      '25b0325',
      '25b3973',
      '25b0661',
      '25b3905',
      '25b1308',
      '24b3949',
      '24b2471',
    ].includes(
      user.roll.toLowerCase()
    );

  /* =======================================================
     PARTICIPANT DASHBOARD
  ======================================================= */

  const handleParticipantDashboard = () => {
    /*
      NOT LOGGED IN:
      External SSO redirect is intentional.
      Do NOT use React Router for this.
    */
    if (!isLoggedIn) {
      sessionStorage.setItem(
        'redirectAfterLogin',
        '/xlr8participants'
      );

      window.location.href = XLR8_SSO_URL;

      return;
    }

    /*
      LOGGED IN + REGISTERED:
      Internal route -> React Router navigation.
      No full page reload.
    */
    if (
      registrationStatus ===
      'registered'
    ) {
      navigate('/xlr8participants');
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        ref={heroRef}
        id="hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat py-20"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >

        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(rgb(0, 0, 0), rgb(15, 23, 42))',
            opacity: 0.85,
          }}
        />

        <div className="container mx-auto px-4 z-10 font-body">

          <div className="max-w-5xl mx-auto text-center">

            {/* LOGO */}

            <img
              src={CenterLogo}
              alt="XLR8 Logo"
              className="block mx-auto w-auto h-auto"
            />

            <br />

            {/* DESCRIPTION */}

            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Gear up for our club’s flagship event,
              recognized as the institute’s biggest
              technical event, bringing together
              students to compete, learn, and excel.
            </p>

            {/* =================================================
                LOGGED-IN USER
            ================================================= */}

            {isLoggedIn && user && (
              <div className="w-full max-w-5xl mx-auto text-left">

                <div className="rounded-2xl bg-slate-900 border border-indigo-500/30 p-6 sm:p-8 relative overflow-hidden shadow-[0_0_35px_rgba(99,102,241,0.2)]">

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                    <div className="flex items-center gap-4">

                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800 border border-cyan-500/40 flex items-center justify-center font-bold text-2xl sm:text-3xl text-cyan-400 tracking-wider font-heading shrink-0">
                        {user.name
                          ?.split(' ')
                          .map(
                            (n) => n[0]
                          )
                          .join('')
                          .slice(0, 2)
                          .toUpperCase() ||
                          'P'}
                      </div>

                      <div>
                        <span className="text-sm font-mono text-slate-400 tracking-wider font-semibold block mb-0.5">
                          Hello,
                        </span>

                        <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-wide">
                          {user.name}
                        </h3>
                      </div>

                    </div>

                    {/* LOGOUT */}

                    <div className="flex flex-col sm:items-end gap-3 shrink-0">

                      <div className="flex items-center justify-end gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30">

                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />

                        <span className="text-xs font-semibold text-slate-200 tracking-wide">
                          Logged In
                        </span>

                      </div>

                      <button
                        type="button"
                        onClick={logout}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all duration-200 text-sm font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>

                    </div>

                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">

                      <p className="text-xs font-mono text-slate-400 uppercase font-semibold">
                        Roll Number
                      </p>

                      <p className="text-base font-bold text-white font-mono mt-0.5">
                        {user.roll}
                      </p>

                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">

                      <p className="text-xs font-mono text-slate-400 uppercase font-semibold">
                        Department
                      </p>

                      <p className="text-base font-semibold text-white mt-0.5">
                        {user.department}
                      </p>

                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* =================================================
                REGISTRATION SECTION
            ================================================= */}

            <div className="mt-8 w-full max-w-5xl mx-auto">

              {/* =================================================
                  LOGGED IN
              ================================================= */}

              {isLoggedIn && user ? (

                <>

                  {/* CHECKING */}

                  {registrationStatus ===
                    'checking' && (
                    <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/80 p-6 flex items-center justify-center gap-3">

                      <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />

                      <span className="text-sm text-slate-300">
                        Checking XLR8 registration...
                      </span>

                    </div>
                  )}

                  {/* =================================================
                      REGISTERED
                  ================================================= */}

                  {registrationStatus ===
                    'registered' && (
                    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-950/10 shadow-[0_0_40px_rgba(16,185,129,0.08)] p-5 sm:p-6">

                      {/* HEADER */}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                        <div className="flex items-center gap-4">

                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/30">

                            <ShieldCheck className="w-7 h-7 text-emerald-400" />

                          </div>

                          <div className="text-left">

                            <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-white">
                              Registration Confirmed
                            </h3>

                            <p className="text-xs sm:text-sm text-slate-500 mt-1">

                              Roll Number:{' '}

                              <span className="font-mono text-slate-300">
                                {user.roll}
                              </span>

                            </p>

                          </div>

                        </div>

                      </div>

                      <div className="my-5 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

                      {/* TEAM + VEHICLE */}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        {/* TEAM */}

                        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">

                          <Users className="w-5 h-5 text-cyan-400 mb-3" />

                          <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                            Registered Team
                          </p>

                          <p className="text-base font-bold text-white mt-1">
                            {registeredTeamName ||
                              'Team Registered'}
                          </p>

                        </div>

                        {/* VEHICLE */}

                        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">

                          <Zap className="w-5 h-5 text-amber-400 mb-3" />

                          <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                            Vehicle No.
                          </p>

                          <p className="text-base font-bold text-white mt-1 font-mono">
                            {registeredVehicleNo ||
                              'Not Assigned'}
                          </p>

                        </div>

                      </div>

                      {/* =================================================
                          PARTICIPANT DASHBOARD
                      ================================================= */}

                      <Link
                        to="/xlr8participants"
                        className="group relative mt-4 block w-full overflow-hidden rounded-xl border border-cyan-400/30 bg-cyan-500/[0.04] hover:bg-cyan-500/[0.08] hover:border-cyan-400/60 transition-all duration-300 text-left"
                      >

                        <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between gap-4">

                          <div className="flex items-center gap-4">

                            <div className="w-11 h-11 rounded-xl bg-cyan-400/10 border border-cyan-400/25 flex items-center justify-center">

                              <Gauge className="w-5 h-5 text-cyan-300" />

                            </div>

                            <div>

                              <h4 className="text-base sm:text-lg font-bold text-white">
                                Open Participant Dashboard
                              </h4>

                              <p className="text-xs text-slate-500 mt-1">
                                Kits • Slots • Sessions • Team • Mentor • POC • Final Race
                              </p>

                            </div>

                          </div>

                          <div className="w-9 h-9 rounded-lg border border-cyan-400/30 bg-cyan-400/5 flex items-center justify-center shrink-0">

                            <ChevronRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />

                          </div>

                        </div>

                      </Link>

                    </div>
                  )}

                  {/* =================================================
                      NOT REGISTERED
                  ================================================= */}

                  {registrationStatus ===
                    'not_registered' && (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-950/10 p-6 sm:p-7">

                      <div className="flex items-start gap-4">

                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">

                          <AlertCircle className="w-6 h-6 text-amber-400" />

                        </div>

                        <div className="text-left">

                          <h3 className="text-lg sm:text-xl font-bold text-amber-300">
                            Well... you missed it. 💀
                          </h3>

                          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                            You're not registered for
                            XLR8. While the registered
                            teams are busy building,
                            debugging and preparing for
                            the final showdown, you're
                            watching from the sidelines. 🥲🏁
                          </p>

                          <p className="text-xs text-slate-600 mt-3">
                            If you think this is a mistake,
                            contact the ERC XLR8 team.
                          </p>

                        </div>

                      </div>

                    </div>
                  )}

                  {/* =================================================
                      ERROR
                  ================================================= */}

                  {registrationStatus ===
                    'error' && (
                    <div className="rounded-2xl border border-rose-500/30 bg-rose-950/10 p-6">

                      <div className="flex items-center gap-4">

                        <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />

                        <div className="text-left flex-1">

                          <h3 className="text-base font-bold text-rose-300">
                            Couldn't verify your registration
                          </h3>

                          <p className="text-xs text-slate-500 mt-1">
                            Please try again.
                          </p>

                        </div>

                        <button
                          type="button"
                          onClick={
                            checkFinalRegistration
                          }
                          className="px-4 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-semibold transition"
                        >
                          Try Again
                        </button>

                      </div>

                    </div>
                  )}

                </>

              ) : (

                /* =================================================
                   LOGGED OUT
                ================================================= */

                <button
                  type="button"
                  onClick={
                    handleParticipantDashboard
                  }
                  className="group relative block w-full overflow-hidden rounded-2xl border border-cyan-400/30 bg-slate-950/80 shadow-[0_0_40px_rgba(6,182,212,0.10)] hover:border-cyan-400/60 transition-all duration-500 text-left"
                >

                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />

                  <div className="relative z-10 p-5 sm:p-6 flex items-center justify-between gap-5">

                    <div className="flex items-center gap-4">

                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center">

                        <Gauge className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-300" />

                      </div>

                      <div className="text-left">

                        <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-white tracking-wide">
                          Participant Dashboard
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                          Login with ITC SSO to check your XLR8 registration.
                        </p>

                      </div>

                    </div>

                    <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">

                      <span className="hidden sm:block">
                        Login & Check
                      </span>

                      <div className="w-9 h-9 rounded-lg border border-cyan-400/30 bg-cyan-400/5 flex items-center justify-center">

                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />

                      </div>

                    </div>

                  </div>

                </button>
              )}

              {/* =================================================
                  CONVENER PORTAL
              ================================================= */}

              {isConvener && (
                <Link
                  to="/xlr8conveners"
                  className="mt-4 w-full px-8 py-4 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold font-heading text-lg rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-3 border border-cyan-800/60 hover:border-cyan-500/70"
                >

                  <Lock className="w-5 h-5 text-cyan-400" />

                  <span>
                    Convener Portal
                  </span>

                </Link>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SCROLL GALLERY
      ===================================================== */}

      <SemicircularScrollGallery />

      {/* =====================================================
          AFTERMOVIE
      ===================================================== */}

      <section className="py-12 bg-[#0B1120] text-white">

        <div className="max-w-5xl mx-auto text-center px-4">

          <h2 className="text-3xl font-heading mb-6 border-b-4 border-rose-500 inline-block">
            XLR8 2025 Aftermovie
          </h2>

          <div className="p-1 rounded-3xl bg-slate-800 shadow-lg">

            <div className="rounded-2xl bg-[#0B1120] p-1">

              <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800">

                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/NaWnMilkoWo"
                  title="XLR8 2025 After Movie"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          TIMELINE
      ===================================================== */}

      <TimelineSection />
    </>
  );
};

export default XLR8;