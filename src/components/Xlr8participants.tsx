import React, { useEffect, useMemo, useState } from 'react';

import {
  Users,
  Phone,
  Mail,
  BadgeCheck,
  Car,
  Package,
  Wrench,
  Trophy,
  CheckCircle2,
  Circle,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  LogOut,
} from 'lucide-react';

import { useAuth, logout } from '../hooks/useAuth';

/* =========================================================
   APPS SCRIPT URLS
========================================================= */

const REGISTRATION_API_URL =
  'https://script.google.com/macros/s/AKfycbzzUy14kFvbJLR3I64RbgrrpJfx4XJYHmEr0Gfe8ph0pgA4u1vb-lamM34_qFrO0GBQnQ/exec';

const KIT_API_URL =
  'https://script.google.com/macros/s/AKfycbx9luLGT0Q8rAs_3TbBA-oXjsoq8acUVV07hkefGVlzFjB3n_0qtlWcecT2M3b6k7k2/exec';

/* =========================================================
   TYPES
========================================================= */

interface SSOUser {
  name: string;
  roll: string;
  department: string;
  degree: string;
  passing_year: number;
}

interface Member {
  name?: string;
  roll?: string;
  phone?: string;
  email?: string;
  role?: string;
}

interface RegistrationResponse {
  found?: boolean;
  success?: boolean;

  teamName?: string;
  vehicleNumber?: string;

  leader?: {
    name?: string;
    roll?: string;
    phone?: string;
    email?: string;
  };

  members?: Array<{
    name?: string;
    roll?: string;
    phone?: string;
    email?: string;
    leader?: boolean;
  }>;

  teamSelfieLink?: string;
  paymentScreenshotLink?: string;

  isConfirmed?: boolean;

  error?: string;
}

interface KitResponse {
  success?: boolean;
  isConfirmed?: boolean;

  teamName?: string;

  confirmedData?: {
    items?: Record<string, boolean>;
  };

  message?: string;
}

interface SlotInfo {
  status?: string;
  date?: string;
  time?: string;
  slot?: string;
  venue?: string;
  details?: string;
}

interface TeamData {
  found?: boolean;

  teamName?: string;
  vehicleNo?: string;

  registrationStatus?: string;
  registeredAt?: string;

  members?: Member[];

  logistics?: {
    electricalKit?: SlotInfo;
    mechanicalKit?: SlotInfo;
    softwareSession?: SlotInfo;
    solderingSession?: SlotInfo;
    debuggingSession?: SlotInfo;
    checkpoint?: SlotInfo;
    finalRace?: SlotInfo;
  };
}

/* =========================================================
   HELPERS
========================================================= */

const safe = (value?: string | number | null) => {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ''
  ) {
    return '—';
  }

  return String(value);
};

const normalizeStatus = (value?: string) => {
  if (!value) return 'To Be Announced';

  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getInitials = (name?: string) => {
  if (!name) return 'P';

  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

/* =========================================================
   LOGISTICS
========================================================= */

const LOGISTICS = [
  {
    key: 'electricalKit',
    label: 'Electrical Kit',
    icon: Package,
    accent: 'amber',
  },
  {
    key: 'mechanicalKit',
    label: 'Mechanical Kit',
    icon: Package,
    accent: 'cyan',
  },
  {
    key: 'solderingSession',
    label: 'Soldering Session',
    icon: Wrench,
    accent: 'rose',
  },
  {
    key: 'finalRace',
    label: 'Final Race',
    icon: Trophy,
    accent: 'purple',
  },
];

/* =========================================================
   ACCENTS
========================================================= */

const accentClasses = {
  amber: {
    border: 'border-amber-500/25',
    iconBg: 'bg-amber-500/10',
    iconBorder: 'border-amber-500/25',
    icon: 'text-amber-400',
    glow: 'shadow-[0_0_25px_rgba(245,158,11,0.06)]',
  },

  cyan: {
    border: 'border-cyan-500/25',
    iconBg: 'bg-cyan-500/10',
    iconBorder: 'border-cyan-500/25',
    icon: 'text-cyan-400',
    glow: 'shadow-[0_0_25px_rgba(6,182,212,0.06)]',
  },

  rose: {
    border: 'border-rose-500/25',
    iconBg: 'bg-rose-500/10',
    iconBorder: 'border-rose-500/25',
    icon: 'text-rose-400',
    glow: 'shadow-[0_0_25px_rgba(244,63,94,0.06)]',
  },

  purple: {
    border: 'border-purple-500/25',
    iconBg: 'bg-purple-500/10',
    iconBorder: 'border-purple-500/25',
    icon: 'text-purple-400',
    glow: 'shadow-[0_0_25px_rgba(168,85,247,0.06)]',
  },
};

/* =========================================================
   COMPONENT
========================================================= */

const XLR8ParticipantDashboard: React.FC = () => {
  const { user, isLoggedIn } = useAuth() as {
    user: SSOUser | null;
    isLoggedIn: boolean;
  };

  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  /* =======================================================
     FETCH TEAM DATA
  ======================================================= */

  const fetchTeamData = async () => {
    if (!user?.roll) return;

    try {
      setError('');

      const registrationURL =
        `${REGISTRATION_API_URL}?roll=${encodeURIComponent(
          user.roll.trim().toLowerCase()
        )}`;

      const response = await fetch(registrationURL, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(
          `Registration API returned ${response.status}`
        );
      }

      const data: RegistrationResponse =
        await response.json();

      console.log(
        'XLR8 registration response:',
        data
      );

      if (!data.found) {
        setTeam(null);

        setError(
          'No XLR8 registration was found for your roll number.'
        );

        return;
      }

      /* =====================================================
         MEMBERS
      ===================================================== */

      const members: Member[] = Array.isArray(
        data.members
      )
        ? data.members
            .filter(
              (member) =>
                member?.name &&
                member?.roll
            )
            .map((member, index) => ({
              name: member.name,
              roll: member.roll,
              phone: member.phone,
              email: member.email,

              role: member.leader
                ? 'Team Leader'
                : `Member ${index + 1}`,
            }))
        : [];

      /* =====================================================
         KIT BACKEND
      ===================================================== */

      try {
        const kitResponse =
          await fetch(KIT_API_URL, {
            method: 'POST',

            headers: {
              'Content-Type':
                'text/plain;charset=utf-8',
            },

            redirect: 'follow',

            body: JSON.stringify({
              action: 'fetchStatus',

              rollNumber:
                user.roll.trim(),

              vehicleNumber:
                data.vehicleNumber || '',
            }),
          });

        if (kitResponse.ok) {
          const kitData: KitResponse =
            await kitResponse.json();

          console.log(
            'XLR8 kit response:',
            kitData
          );
        }
      } catch (kitError) {
        console.warn(
          'Kit status could not be loaded:',
          kitError
        );
      }

      /* =====================================================
         BUILD TEAM
      ===================================================== */

      const resolvedTeam: TeamData = {
        found: true,

        teamName:
          data.teamName || '—',

        vehicleNo:
          data.vehicleNumber ||
          'Not Assigned',

        registrationStatus: 'Completed',

        registeredAt: '',

        members,

        logistics: {
          electricalKit: {
            status: 'To Be Announced',
          },

          mechanicalKit: {
            status: 'To Be Announced',
          },

          softwareSession: {
            status: 'To Be Announced',
          },

          solderingSession: {
            status: 'To Be Announced',
          },

          debuggingSession: {
            status: 'To Be Announced',
          },

          checkpoint: {
            status: 'To Be Announced',
          },

          finalRace: {
            status: 'To Be Announced',
          },
        },
      };

      setTeam(resolvedTeam);

    } catch (err) {
      console.error(
        'Failed to fetch XLR8 participant data:',
        err
      );

      setTeam(null);

      setError(
        'Unable to load your XLR8 registration details. Please try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (
      isLoggedIn &&
      user?.roll
    ) {
      fetchTeamData();
    } else {
      setLoading(false);
    }
  }, [
    isLoggedIn,
    user?.roll,
  ]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTeamData();
  };

  /* =======================================================
     MEMBERS
  ======================================================= */

  const members = useMemo(() => {
    if (
      team?.members &&
      team.members.length > 0
    ) {
      return team.members;
    }

    return [];
  }, [team]);

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    logout();
  };

  /* =======================================================
     AUTH GUARD
  ======================================================= */

  if (
    !isLoggedIn ||
    !user
  ) {
    return (
      <div className="min-h-screen bg-[#070D18] text-white flex items-center justify-center px-4 pt-32">

        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center">

          <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center">

            <ShieldCheck className="w-8 h-8 text-cyan-400" />

          </div>

          <h1 className="text-3xl font-bold font-heading">
            Participant Login Required
          </h1>

          <p className="text-base text-slate-400 mt-3 leading-relaxed">
            Please login using your ITC SSO account to access your XLR8 participant dashboard.
          </p>

          <button
            onClick={() => {
              window.location.href = '/xlr8';
            }}
            className="
              mt-6
              w-full
              rounded-xl
              bg-cyan-500
              hover:bg-cyan-400
              text-slate-950
              font-bold
              text-base
              py-3.5
              transition
            "
          >
            Return to XLR8
          </button>

        </div>
      </div>
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070D18] text-white flex items-center justify-center pt-32">

        <div className="text-center">

          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center mx-auto">

            <RefreshCw
              className="w-7 h-7 text-cyan-400 animate-spin"
            />

          </div>

          <p className="mt-5 text-base text-slate-400 font-mono">
            LOADING...
          </p>

        </div>

      </div>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <main
      className="
        min-h-screen
        bg-[#070D18]
        text-white
        font-body
        overflow-x-hidden
        pt-[125px]
        sm:pt-[145px]
      "
    >

      {/* ===================================================
          BACKGROUND
      =================================================== */}

      <div className="fixed inset-0 pointer-events-none z-0">

        <div
          className="
            absolute
            inset-0
            bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)]
            bg-[size:4rem_4rem]
          "
        />

        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[140px]" />

        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[140px]" />

      </div>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div
        className="
          relative
          z-10
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          pb-16
        "
      >

        {/* =================================================
            TOP BAR
        ================================================= */}

        <header
          className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            justify-between
            gap-5
            mb-8
          "
        >

          <div>

            <div className="flex items-center gap-2">

              <span
                className="
                  text-[22px]
                  sm:text-[24px]
                  font-mono
                  tracking-[0.25em]
                  text-cyan-400
                  uppercase
                "
              >
                XLR8 2026
              </span>

            </div>

            <h1
              className="
                text-3xl
                sm:text-4xl
                lg:text-5xl
                font-extrabold
                font-heading
                mt-2
                tracking-tight
              "
            >
              Participant Dashboard
            </h1>

            <p
              className="
                text-base
                sm:text-lg
                text-slate-400
                mt-2
              "
            >
              Your team, kits, sessions and race information in one place.
            </p>

          </div>

          <div className="flex items-center gap-2">

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="
                inline-flex
                items-center
                gap-2
                px-4
                py-3
                rounded-xl
                bg-slate-900
                border
                border-slate-800
                hover:border-cyan-500/30
                text-base
                text-slate-300
                hover:text-cyan-400
                transition
              "
            >

              <RefreshCw
                className={`w-5 h-5 ${
                  refreshing
                    ? 'animate-spin'
                    : ''
                }`}
              />

              <span className="hidden sm:inline">
                Refresh
              </span>

            </button>

            <button
              onClick={handleLogout}
              className="
                inline-flex
                items-center
                gap-2
                px-4
                py-3
                rounded-xl
                bg-rose-500/5
                border
                border-rose-500/20
                text-base
                text-rose-400
                hover:bg-rose-500
                hover:text-white
                transition
              "
            >

              <LogOut className="w-5 h-5" />

              <span className="hidden sm:inline">
                Logout
              </span>

            </button>

          </div>

        </header>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            className="
              mb-7
              rounded-xl
              border
              border-amber-500/20
              bg-amber-500/5
              px-5
              py-4
              flex
              items-start
              gap-3
            "
          >

            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />

            <div className="flex-1">

              <p className="text-sm sm:text-base text-amber-200/80">
                {error}
              </p>

              <button
                onClick={handleRefresh}
                className="
                  mt-2
                  text-sm
                  font-semibold
                  text-amber-400
                  hover:text-amber-300
                "
              >
                Try again →
              </button>

            </div>

          </div>
        )}

        {/* =================================================
            TEAM CARD
        ================================================= */}

        <section
          className="
            rounded-2xl
            bg-slate-900/80
            border
            border-slate-800
            shadow-2xl
            overflow-hidden
            mb-7
          "
        >

          {/* HEADER */}

          <div
            className="
              px-6
              sm:px-8
              py-6
              border-b
              border-slate-800
              bg-slate-950/30
            "
          >

            <div
              className="
                flex
                flex-col
                lg:flex-row
                lg:items-center
                justify-between
                gap-6
              "
            >

              <div className="flex items-center gap-4">

                <div
                  className="
                    w-16
                    h-16
                    rounded-2xl
                    bg-cyan-500/10
                    border
                    border-cyan-500/25
                    flex
                    items-center
                    justify-center
                  "
                >

                  <Users className="w-8 h-8 text-cyan-400" />

                </div>

                <div>

                  <p
                    className="
                      text-[11px]
                      font-mono
                      tracking-[0.2em]
                      text-cyan-400
                      uppercase
                    "
                  >
                    Registered Team
                  </p>

                  <h2
                    className="
                      text-3xl
                      sm:text-4xl
                      font-bold
                      font-heading
                      mt-1
                    "
                  >
                    {safe(team?.teamName)}
                  </h2>

                </div>

              </div>

              <div className="flex flex-wrap gap-3">

                {/* REGISTRATION */}

                <div
                  className="
                    px-4
                    py-3
                    rounded-lg
                    bg-emerald-500/5
                    border
                    border-emerald-500/20
                  "
                >

                  <p
                    className="
                      text-[10px]
                      text-slate-500
                      uppercase
                      font-mono
                    "
                  >
                    Registration
                  </p>

                  <p
                    className="
                      text-sm
                      font-bold
                      text-emerald-400
                      mt-1
                      flex
                      items-center
                      gap-1.5
                    "
                  >

                    <CheckCircle2 className="w-4 h-4" />

                    COMPLETED

                  </p>

                </div>

                {/* VEHICLE */}

                <div
                  className="
                    px-4
                    py-3
                    rounded-lg
                    bg-slate-950/70
                    border
                    border-slate-800
                  "
                >

                  <p
                    className="
                      text-[10px]
                      text-slate-500
                      uppercase
                      font-mono
                    "
                  >
                    Vehicle
                  </p>

                  <p
                    className="
                      text-sm
                      font-bold
                      text-white
                      mt-1
                      font-mono
                      flex
                      items-center
                      gap-1.5
                    "
                  >

                    <Car className="w-4 h-4 text-cyan-400" />

                    {safe(team?.vehicleNo)}

                  </p>

                </div>

                {/* USER ROLL */}

                <div
                  className="
                    px-4
                    py-3
                    rounded-lg
                    bg-slate-950/70
                    border
                    border-slate-800
                  "
                >

                  <p
                    className="
                      text-[10px]
                      text-slate-500
                      uppercase
                      font-mono
                    "
                  >
                    Roll Number
                  </p>

                  <p
                    className="
                      text-sm
                      font-bold
                      text-white
                      mt-1
                      font-mono
                      flex
                      items-center
                      gap-1.5
                    "
                  >

                    <BadgeCheck className="w-4 h-4 text-cyan-400" />

                    {safe(user.roll)}

                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              TEAM MEMBERS
          ================================================= */}

          <div className="p-6 sm:p-8">

            <div
              className="
                flex
                items-center
                justify-between
                mb-5
              "
            >

              <div>

                <h3
                  className="
                    text-2xl
                    sm:text-3xl
                    font-bold
                    mt-1
                  "
                >
                  Team Members
                </h3>

              </div>

            </div>

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                xl:grid-cols-4
                gap-4
              "
            >

              {members.map(
                (
                  member,
                  index
                ) => (

                  <div
                    key={`${member.roll}-${index}`}
                    className="
                      rounded-xl
                      bg-slate-950/60
                      border
                      border-slate-800
                      p-5
                      hover:border-cyan-500/20
                      transition
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-3
                        mb-5
                      "
                    >

                      <div
                        className="
                          w-12
                          h-12
                          rounded-xl
                          bg-slate-800
                          border
                          border-slate-700
                          flex
                          items-center
                          justify-center
                          text-base
                          font-bold
                          text-cyan-400
                        "
                      >
                        {getInitials(
                          member.name
                        )}
                      </div>

                      <div className="min-w-0">

                        <p
                          className="
                            text-lg
                            sm:text-xl
                            font-bold
                            text-white
                            truncate
                          "
                        >
                          {safe(
                            member.name
                          )}
                        </p>

                        <p
                          className="
                            text-sm
                            sm:text-base
                            font-mono
                            text-cyan-400
                            uppercase
                          "
                        >
                          {member.role ||
                            (index === 0
                              ? 'Team Leader'
                              : `Member ${index + 1}`)}
                        </p>

                      </div>

                    </div>

                    <div className="space-y-3">

                      <div
                        className="
                          flex
                          items-center
                          gap-2
                          text-sm
                        "
                      >

                        <BadgeCheck className="w-4 h-4 text-cyan-400/70" />

                        <span
                          className="
                            font-mono
                            text-slate-400
                          "
                        >
                          {safe(
                            member.roll
                          )}
                        </span>

                      </div>

                      {member.phone && (
                        <a
                          href={`tel:${member.phone}`}
                          className="
                            flex
                            items-center
                            gap-2
                            text-sm
                            text-slate-400
                            hover:text-cyan-400
                            transition
                          "
                        >

                          <Phone className="w-4 h-4 text-slate-500" />

                          {member.phone}

                        </a>
                      )}

                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="
                            flex
                            items-center
                            gap-2
                            text-sm
                            text-slate-400
                            hover:text-cyan-400
                            transition
                            truncate
                          "
                        >

                          <Mail className="w-4 h-4 text-slate-500 shrink-0" />

                          <span className="truncate">
                            {member.email}
                          </span>

                        </a>
                      )}

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        </section>

        {/* =================================================
            KITS & SLOTS
        ================================================= */}

        <section className="space-y-4">

          <div className="px-1 mb-3">

            <h2
              className="
                text-2xl
                sm:text-3xl
                font-bold
                font-heading
                mt-1
              "
            >
              Kits & Slots
            </h2>

            <p
              className="
                text-sm
                sm:text-base
                text-slate-500
                mt-1.5
              "
            >
              Your collection, session and race details.
            </p>

          </div>

          {LOGISTICS.map(
            (item) => {

              const Icon = item.icon;

              const info =
                team?.logistics?.[
                  item.key as keyof NonNullable<
                    TeamData['logistics']
                  >
                ];

              const accent =
                accentClasses[
                  item.accent as keyof typeof accentClasses
                ];

              const status =
                normalizeStatus(
                  info?.status
                );

              return (
                <div
                  key={item.key}
                  className={`
                    rounded-2xl
                    bg-slate-900/80
                    border
                    ${accent.border}
                    ${accent.glow}
                    p-5
                    sm:p-6
                    transition
                    hover:-translate-y-0.5
                  `}
                >

                  {/* HEADER */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-4
                        min-w-0
                      "
                    >

                      <div
                        className={`
                          w-12
                          h-12
                          rounded-xl
                          ${accent.iconBg}
                          border
                          ${accent.iconBorder}
                          flex
                          items-center
                          justify-center
                          shrink-0
                        `}
                      >

                        <Icon
                          className={`
                            w-6
                            h-6
                            ${accent.icon}
                          `}
                        />

                      </div>

                      <div className="min-w-0">

                        <h3
                          className="
                            text-base
                            sm:text-lg
                            font-bold
                            text-white
                            truncate
                          "
                        >
                          {item.label}
                        </h3>

                      </div>

                    </div>

                    <span
                      className="
                        shrink-0
                        text-[10px]
                        sm:text-xs
                        font-semibold
                        uppercase
                        tracking-wide
                        px-3
                        py-1.5
                        rounded-md
                        bg-indigo-500/5
                        text-indigo-400
                        border
                        border-indigo-500/15
                      "
                    >
                      TO BE ANNOUNCED
                    </span>

                  </div>

                  {/* DETAILS */}

                  <div
                    className="
                      mt-5
                      rounded-xl
                      bg-slate-950/70
                      border
                      border-slate-800
                      p-4
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >

                      <Circle className="w-5 h-5 text-slate-600" />

                      <div>

                        <p
                          className="
                            text-sm
                            sm:text-base
                            font-semibold
                            text-slate-300
                          "
                        >
                          To Be Announced
                        </p>

                      </div>

                    </div>

                  </div>

                </div>
              );
            }
          )}

        </section>

      </div>

    </main>
  );
};

export default XLR8ParticipantDashboard;