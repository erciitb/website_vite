import React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock3,
  Lock,
  Package,
  Wrench,
  Cpu,
  Code2,
  Trophy,
  CalendarDays,
  MapPin,
  Zap,
  AlertCircle,
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';

interface SSOUser {
  name: string;
  roll: string;
  department: string;
  degree: string;
  passing_year: number;
}

type Status = 'completed' | 'current' | 'upcoming' | 'locked';

interface ProgressStep {
  id: number;
  title: string;
  description: string;
  status: Status;
  icon: React.ReactNode;
}

const XLR8Participants: React.FC = () => {
  const { user, isLoggedIn } = useAuth() as {
    user: SSOUser | null;
    isLoggedIn: boolean;
  };

  // ============================================================
  // PARTICIPANT DATA
  // ============================================================
  // TEMPORARY VALUES FOR NOW.
  // Later these can be fetched from Google Sheets/API
  // using user.roll as the participant identifier.
  // ============================================================

  const participant = {
    registration: true,

    kit: {
      status: 'pending' as 'collected' | 'pending',
      collectionDate: 'Not assigned',
      venue: 'Tinkerers Laboratory, DSSE Building',
    },

    soldering: {
      status: 'scheduled' as
        | 'completed'
        | 'scheduled'
        | 'pending',
      slot: 'Slot B',
      date: '16 August 2026',
      time: '4:00 PM – 6:00 PM',
      venue: 'Tinkerers Laboratory, DSSE Building',
    },

    software: {
      status: 'upcoming' as
        | 'completed'
        | 'upcoming'
        | 'pending',
      date: 'To be announced',
    },

    race: {
      status: 'upcoming' as
        | 'completed'
        | 'upcoming'
        | 'pending',
      slot: 'To be announced',
      venue: 'To be announced',
    },
  };

  // ============================================================
  // PROGRESS TIMELINE
  // ============================================================

  const progressSteps: ProgressStep[] = [
    {
      id: 1,
      title: 'Registration',
      description:
        'Team registration and participant verification',
      status: participant.registration
        ? 'completed'
        : 'current',
      icon: <Zap className="w-5 h-5" />,
    },

    {
      id: 2,
      title: 'Kit Collection',
      description:
        'Collect your XLR8 hardware kit',
      status:
        participant.kit.status === 'collected'
          ? 'completed'
          : 'current',
      icon: <Package className="w-5 h-5" />,
    },

    {
      id: 3,
      title: 'Hardware Session',
      description:
        'Build and wire your bot',
      status:
        participant.kit.status === 'collected'
          ? 'upcoming'
          : 'locked',
      icon: <Cpu className="w-5 h-5" />,
    },

    {
      id: 4,
      title: 'Soldering Session',
      description:
        'Complete your assigned soldering slot',
      status:
        participant.soldering.status === 'completed'
          ? 'completed'
          : participant.soldering.status === 'scheduled'
          ? 'current'
          : 'upcoming',
      icon: <Wrench className="w-5 h-5" />,
    },

    {
      id: 5,
      title: 'Software Session',
      description:
        'Program and test your bot',
      status:
        participant.software.status === 'completed'
          ? 'completed'
          : 'upcoming',
      icon: <Code2 className="w-5 h-5" />,
    },

    {
      id: 6,
      title: 'Bot Testing',
      description:
        'Test your bot before race day',
      status: 'upcoming',
      icon: <Wrench className="w-5 h-5" />,
    },

    {
      id: 7,
      title: 'Final Race',
      description:
        'Enter the XLR8 arena',
      status:
        participant.race.status === 'completed'
          ? 'completed'
          : 'upcoming',
      icon: <Trophy className="w-5 h-5" />,
    },
  ];

  // ============================================================
  // OVERALL PROGRESS
  // ============================================================

  const completedSteps = progressSteps.filter(
    (step) => step.status === 'completed'
  ).length;

  const progressPercentage = Math.round(
    (completedSteps / progressSteps.length) * 100
  );

  // ============================================================
  // STATUS BADGE
  // ============================================================

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            COMPLETED
          </span>
        );

      case 'current':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-950/60 text-cyan-400 border border-cyan-500/20">
            <Clock3 className="w-3.5 h-3.5" />
            IN PROGRESS
          </span>
        );

      case 'upcoming':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-950/60 text-indigo-400 border border-indigo-500/20">
            <Circle className="w-3.5 h-3.5" />
            UPCOMING
          </span>
        );

      case 'locked':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-500 border border-slate-700">
            <Lock className="w-3.5 h-3.5" />
            LOCKED
          </span>
        );
    }
  };

  // ============================================================
  // AUTH GUARD
  // ============================================================

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen bg-[#080D18] text-white flex items-center justify-center px-4">

        <div className="text-center max-w-md">

          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-slate-900 border border-rose-500/30 flex items-center justify-center">
            <Lock className="w-7 h-7 text-rose-400" />
          </div>

          <h1 className="text-3xl font-bold font-heading mb-3">
            Participant Portal Locked
          </h1>

          <p className="text-slate-400 mb-7">
            Please log in through the XLR8 portal to access
            your participant dashboard.
          </p>

          <a
            href="/xlr8"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to XLR8
          </a>

        </div>

      </div>
    );
  }

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-[#080D18] text-white overflow-hidden">

      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div className="fixed inset-0 pointer-events-none">

        <div className="absolute top-[-200px] left-[-150px] w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full" />

        <div className="absolute bottom-[-200px] right-[-150px] w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full" />

      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 pb-8">

        {/* ====================================================
            TOP BAR
        ==================================================== */}

        <div className="flex items-center justify-between mb-8">

          <a
            href="/xlr8"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />

            <span className="text-sm font-medium">
              Back to XLR8
            </span>
          </a>

          <div className="flex items-center gap-2">

            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />

            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
              Participant Portal
            </span>

          </div>

        </div>

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="mb-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">

            <div>

              <p className="text-cyan-400 text-large font-mono uppercase tracking-[0.25em] mb-2">
                XLR8 2026
              </p>

              <h1 className="text-4xl sm:text-5xl font-extrabold font-heading tracking-tight">
                Participant Dashboard
              </h1>

              <p className="text-slate-400 mt-3 max-w-2xl">
                Track your XLR8 journey, assigned slots,
                kit status, sessions and final race
                information.
              </p>

            </div>

            {/* USER */}

            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800">

              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">

                {user.name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() || 'P'}

              </div>

              <div>

                <p className="text-sm font-bold text-white">
                  {user.name}
                </p>

                <p className="text-xs font-mono text-slate-500">
                  {user.roll}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ====================================================
            OVERALL PROGRESS
        ==================================================== */}

        <div className="rounded-2xl bg-slate-900/80 border border-indigo-500/20 p-6 sm:p-8 shadow-[0_0_40px_rgba(99,102,241,0.08)] mb-6">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">

            <div>

              <p className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-1">
                Overall Progress
              </p>

              <h2 className="text-2xl font-bold">
                Your XLR8 Journey
              </h2>

            </div>

            <div className="text-right">

              <span className="text-3xl font-extrabold text-cyan-400">
                {progressPercentage}%
              </span>

              <p className="text-xs text-slate-500 font-mono">
                {completedSteps}/{progressSteps.length} COMPLETE
              </p>

            </div>

          </div>

          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">

            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-700"
              style={{
                width: `${progressPercentage}%`,
              }}
            />

          </div>

        </div>

        {/* ====================================================
            QUICK STATUS CARDS
        ==================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          {/* KIT */}

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 hover:border-cyan-500/30 transition">

            <div className="flex items-center justify-between mb-4">

              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-cyan-400" />
              </div>

              {participant.kit.status === 'collected' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Clock3 className="w-5 h-5 text-amber-400" />
              )}

            </div>

            <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">
              Hardware Kit
            </p>

            <h3 className="text-xl font-bold mt-1">
              {participant.kit.status === 'collected'
                ? 'Collected'
                : 'Pending'}
            </h3>

            <p className="text-xs text-slate-500 mt-2">
              {participant.kit.collectionDate}
            </p>

          </div>

          {/* SOLDERING */}

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 hover:border-rose-500/30 transition">

            <div className="flex items-center justify-between mb-4">

              <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-rose-400" />
              </div>

              <span className="text-xs font-mono text-rose-400">
                {participant.soldering.slot}
              </span>

            </div>

            <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">
              Soldering
            </p>

            <h3 className="text-xl font-bold mt-1">
              {participant.soldering.status === 'scheduled'
                ? 'Scheduled'
                : 'Pending'}
            </h3>

            <p className="text-xs text-slate-500 mt-2">
              {participant.soldering.date}
            </p>

          </div>

          {/* SOFTWARE */}

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 hover:border-emerald-500/30 transition">

            <div className="flex items-center justify-between mb-4">

              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Code2 className="w-5 h-5 text-emerald-400" />
              </div>

              <Clock3 className="w-5 h-5 text-slate-600" />

            </div>

            <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">
              Software
            </p>

            <h3 className="text-xl font-bold mt-1">
              Upcoming
            </h3>

            <p className="text-xs text-slate-500 mt-2">
              {participant.software.date}
            </p>

          </div>

          {/* RACE */}

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 hover:border-purple-500/30 transition">

            <div className="flex items-center justify-between mb-4">

              <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-purple-400" />
              </div>

              <span className="text-xs font-mono text-purple-400">
                RACE
              </span>

            </div>

            <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">
              Final Race
            </p>

            <h3 className="text-xl font-bold mt-1">
              Upcoming
            </h3>

            <p className="text-xs text-slate-500 mt-2">
              {participant.race.slot}
            </p>

          </div>

        </div>

        {/* ====================================================
            MAIN CONTENT
        ==================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ==================================================
              PROGRESS TIMELINE
          ================================================== */}

          <div className="lg:col-span-2 rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8">

            <div className="mb-8">

              <p className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">
                Mission Timeline
              </p>

              <h2 className="text-2xl font-bold">
                XLR8 Progress
              </h2>

            </div>

            <div className="relative">

              <div className="absolute left-[20px] top-5 bottom-5 w-px bg-slate-800" />

              <div className="space-y-7">

                {progressSteps.map((step) => (

                  <div
                    key={step.id}
                    className="relative flex gap-5"
                  >

                    {/* STEP ICON */}

                    <div
                      className={`
                        relative z-10 w-10 h-10 shrink-0 rounded-xl
                        flex items-center justify-center border
                        ${
                          step.status === 'completed'
                            ? 'bg-emerald-950 border-emerald-500/30 text-emerald-400'
                            : step.status === 'current'
                            ? 'bg-cyan-950 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                            : step.status === 'upcoming'
                            ? 'bg-slate-900 border-slate-700 text-slate-500'
                            : 'bg-slate-950 border-slate-800 text-slate-700'
                        }
                      `}
                    >
                      {step.icon}
                    </div>

                    {/* STEP CONTENT */}

                    <div className="flex-1 pb-1">

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">

                        <h3
                          className={`font-bold ${
                            step.status === 'locked'
                              ? 'text-slate-600'
                              : 'text-white'
                          }`}
                        >
                          {step.title}
                        </h3>

                        {getStatusBadge(step.status)}

                      </div>

                      <p className="text-sm text-slate-500 mt-1">
                        {step.description}
                      </p>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* ==================================================
              RIGHT SIDE
          ================================================== */}

          <div className="space-y-6">

            {/* SOLDERING SLOT */}

            <div className="rounded-2xl bg-slate-900 border border-rose-500/20 p-6">

              <div className="flex items-center gap-3 mb-5">

                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-rose-400" />
                </div>

                <div>

                  <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                    Assigned Slot
                  </p>

                  <h3 className="font-bold text-lg">
                    Soldering Session
                  </h3>

                </div>

              </div>

              <div className="space-y-3">

                <div className="flex items-center gap-3 text-sm">
                  <CalendarDays className="w-4 h-4 text-rose-400" />

                  <span className="text-slate-300">
                    {participant.soldering.date}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Clock3 className="w-4 h-4 text-rose-400" />

                  <span className="text-slate-300">
                    {participant.soldering.time}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-rose-400" />

                  <span className="text-slate-300">
                    {participant.soldering.venue}
                  </span>
                </div>

              </div>

            </div>

            {/* FINAL RACE */}

            <div className="rounded-2xl bg-slate-900 border border-purple-500/20 p-6">

              <div className="flex items-center gap-3 mb-5">

                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-purple-400" />
                </div>

                <div>

                  <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                    Race Status
                  </p>

                  <h3 className="font-bold text-lg">
                    Final Race
                  </h3>

                </div>

              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">

                <p className="text-sm font-semibold text-slate-300">
                  {participant.race.slot}
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Race slot will appear here once assigned.
                </p>

              </div>

            </div>

            {/* NOTICE */}

            <div className="rounded-2xl bg-amber-950/20 border border-amber-500/20 p-5">

              <div className="flex gap-3">

                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />

                <div>

                  <h3 className="font-bold text-amber-300 mb-1">
                    Participant Notice
                  </h3>

                  <p className="text-sm text-amber-200/60 leading-relaxed">
                    Keep checking this dashboard for updates
                    to your session slots, kit collection and
                    race information.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between gap-3 text-xs text-slate-600 font-mono">

          <span>
            XLR8 // ELECTRONICS & ROBOTICS CLUB // IIT BOMBAY
          </span>

          <span>
            PARTICIPANT ID: {user.roll}
          </span>

        </div>

      </div>

    </div>
  );
};

export default XLR8Participants;