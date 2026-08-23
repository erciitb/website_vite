import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Users,
  Phone,
  Mail,
  BadgeCheck,
  Package,
  Wrench,
  Trophy,
  CheckCircle2,
  Circle,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  LogOut,
  Clock3,
  MapPin,
  CalendarDays,
} from 'lucide-react';

import {
  useAuth,
  logout,
} from '../hooks/useAuth';


/* =========================================================
   APPS SCRIPT URLS
========================================================= */

const REGISTRATION_API_URL =
  'https://script.google.com/macros/s/AKfycbzzUy14kFvbJLR3I64RbgrrpJfx4XJYHmEr0Gfe8ph0pgA4u1vb-lamM34_qFrO0GBQnQ/exec';

const KIT_API_URL =
  'https://script.google.com/macros/s/AKfycbyOlqOWSh4HX5F4yNeh3m0xvAfxrKMbbnfWX0dpElqCMcE5MlTzqODTfY29lLewQZra/exec';

const SLOT_API_URL =
  'https://script.google.com/macros/s/AKfycbwHjNet27vQPH9fJ5_cKq2F6wkQNoEw71eOr2ITXn86tSTvQZFBIBQ-IyppulcurbPD/exec';

const SOLDERING_API_URL =
  'https://script.google.com/macros/s/AKfycbykNEARK6caFV7Plb9jYuoFDgpSqzL1nf1N1eiEChftLqrB09w_jZYU1CbOZ3RymYzy/exec';

const MENTOR_API_URL =
  'https://script.google.com/macros/s/AKfycbyIorhus3R2IweNMBIZskgS9QDQlo4cA71gwvY_mxsKVGkG7C9NHfBI0NEpAH7TfANU/exec';


/* =========================================================
   FIXED DATES
========================================================= */

const ELECTRICAL_KIT_DATE =
  'August 22';

const SOLDERING_SESSION_DATE =
  'August 23';


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
    vehicleNumber?: string;
    rollNumber?: string;
    total?: number;
    items?: Record<
      string,
      boolean
    >;
  };

  message?: string;
}


interface SlotResponse {
  success?: boolean;
  found?: boolean;

  vehicleNumber?: string;

  teamName?: string;

  teamLeader?: string;

  rollNumber?: string;

  slot?: string;

  time?: string;

  date?: string;

  venue?: string;

  details?: string;

  status?: string;

  message?: string;
}


interface MentorResponse {
  success?: boolean;
  found?: boolean;

  teamName?: string;
  vehicleNumber?: string;

  mentor?: string;
  mentorName?: string;
  contactNo?: string;
  mentorContact?: string;

  poc?: string;
  pocName?: string;
  pocContact?: string;

  message?: string;
}


interface SlotInfo {
  status?: string;

  date?: string;

  time?: string;

  slot?: string;

  venue?: string;

  details?: string;

  total?: number;

  items?: Record<
    string,
    boolean
  >;
}


interface MentorInfo {
  mentorName?: string;

  mentorContact?: string;

  pocName?: string;

  pocContact?: string;
}


interface TeamData {
  found?: boolean;

  teamName?: string;

  vehicleNo?: string;

  registrationStatus?: string;

  registeredAt?: string;

  members?: Member[];

  mentor?: MentorInfo;

  logistics?: {
    electricalKit?: SlotInfo;

    softwareSession?: SlotInfo;

    mechanicalKit?: SlotInfo;

    solderingSession?: SlotInfo;

    debuggingSession?: SlotInfo;

    checkpoint?: SlotInfo;

    finalRace?: SlotInfo;
  };
}


/* =========================================================
   KIT COMPONENT LABELS
========================================================= */

const KIT_COMPONENT_LABELS:
  Record<string, string> = {

  motorDriver:
    'Motor Driver',

  piPico:
    'Raspberry Pi Pico W',

  mpu6050:
    'MPU 6050',

  esp01:
    'ESP01',

  buckConverter:
    'Buck Converter',

  solderGun:
    'Solder Gun',

  solderStand:
    'Solder Gun Stand',

  solderWire:
    'Soldering Wire',

  pcb:
    'PCB (Perforated Board)',

  batteryHolder:
    'Remote Battery Holder',

  onOffSwitch:
    'On/Off Switch',

  jumperWires:
    'Jumper Wires',

  wires1m:
    'Wires (1m)',

  wireStripper:
    'Wire Stripper',

  multimeter:
    'Digital Multimeter',

  breadboard:
    'Breadboard',

  bergPins:
    'Berg Pins',

  microUsb:
    'Micro USB Cable',

  screwDriver:
    'Black Tape',
};


/* =========================================================
   HELPERS
========================================================= */

const safe = (
  value?: string | number | null
) => {

  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ''
  ) {

    return '—';

  }

  return String(value);

};


const getInitials = (
  name?: string
) => {

  if (!name) {
    return 'P';
  }

  return name
    .trim()
    .split(/\s+/)
    .map(
      part => part[0]
    )
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

    label:
      'Electrical Kit Collection',

    icon:
      Package,

    accent:
      'amber',
  },

  {
    key: 'softwareSession',

    label:
      'Software Session',

    icon:
      Clock3,

    accent:
      'cyan',
  },

  {
    key: 'solderingSession',

    label:
      'Soldering Session',

    icon:
      Wrench,

    accent:
      'rose',
  },

  {
    key: 'mechanicalKit',

    label:
      'Mechanical Kit Collection',

    icon:
      Package,

    accent:
      'cyan',
  },

  {
    key: 'finalRace',

    label:
      'Final Race',

    icon:
      Trophy,

    accent:
      'purple',
  },

];


/* =========================================================
   ACCENTS
========================================================= */

const accentClasses = {

  amber: {

    border:
      'border-amber-500/25',

    iconBg:
      'bg-amber-500/10',

    iconBorder:
      'border-amber-500/25',

    icon:
      'text-amber-400',

    glow:
      'shadow-[0_0_25px_rgba(245,158,11,0.06)]',

  },

  cyan: {

    border:
      'border-cyan-500/25',

    iconBg:
      'bg-cyan-500/10',

    iconBorder:
      'border-cyan-500/25',

    icon:
      'text-cyan-400',

    glow:
      'shadow-[0_0_25px_rgba(6,182,212,0.06)]',

  },

  rose: {

    border:
      'border-rose-500/25',

    iconBg:
      'bg-rose-500/10',

    iconBorder:
      'border-rose-500/25',

    icon:
      'text-rose-400',

    glow:
      'shadow-[0_0_25px_rgba(244,63,94,0.06)]',

  },

  purple: {

    border:
      'border-purple-500/25',

    iconBg:
      'bg-purple-500/10',

    iconBorder:
      'border-purple-500/25',

    icon:
      'text-purple-400',

    glow:
      'shadow-[0_0_25px_rgba(168,85,247,0.06)]',

  },

};


/* =========================================================
   COMPONENT
========================================================= */

const XLR8ParticipantDashboard:
  React.FC =
  () => {

  const {
    user,
    isLoggedIn,
  } = useAuth() as {
    user:
      SSOUser | null;

    isLoggedIn:
      boolean;
  };


  const [
    team,
    setTeam,
  ] = useState<TeamData | null>(
    null
  );


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState('');


  const [
    showComponents,
    setShowComponents,
  ] = useState(false);


  /* =======================================================
     FETCH TEAM DATA
  ======================================================= */

  const fetchTeamData =
    async () => {

      if (!user?.roll) {
        return;
      }


      try {

        setError('');


        /* ===================================================
           REGISTRATION API
        =================================================== */

        const registrationURL =
          `${REGISTRATION_API_URL}?roll=${encodeURIComponent(
            user.roll.trim().toLowerCase()
          )}`;


        const response =
          await fetch(
            registrationURL,
            {
              method:
                'GET',

              headers: {
                Accept:
                  'application/json',
              },

              cache:
                'no-store',
            }
          );


        if (!response.ok) {

          throw new Error(
            `Registration API returned ${response.status}`
          );

        }


        const data:
          RegistrationResponse =
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


        /* ===================================================
           MEMBERS
        =================================================== */

        const members:
          Member[] =
          Array.isArray(
            data.members
          )
            ? data.members
                .filter(
                  member =>
                    member?.name &&
                    member?.roll
                )
                .map(
                  (
                    member,
                    index
                  ) => ({

                    name:
                      member.name,

                    roll:
                      member.roll,

                    phone:
                      member.phone,

                    email:
                      member.email,

                    role:
                      member.leader
                        ? 'Team Leader'
                        : `Member ${index + 1}`,

                  })
                )
            : [];


        /* ===================================================
           VEHICLE NUMBER

           Comes from registration API.
        =================================================== */

        const vehicleNumber =
          String(
            data.vehicleNumber ||
            ''
          ).trim();


        /* ===================================================
           ELECTRICAL KIT DEFAULT
        =================================================== */

        let electricalKit:
          SlotInfo = {

            status:
              'Kit Not Collected',

            date:
              ELECTRICAL_KIT_DATE,

            time:
              '',

            venue:
              '',

          };


        /* ===================================================
           SOFTWARE SESSION

           No longer fetched from any API — the session has
           already happened, so it's always shown as
           Completed with no date/time/venue.
        =================================================== */

        const softwareSession:
          SlotInfo = {

            status:
              'Completed',

          };


        /* ===================================================
           SOLDERING SESSION DEFAULT

           DATE = AUGUST 23

           TIME + VENUE COME FROM THE DEDICATED
           SOLDERING-SLOT SHEET (SEPARATE API), WHICH
           HANDLES MERGED TIME-SLOT CELLS ACROSS
           VEHICLE-NUMBER RANGES.
        =================================================== */

        let solderingSession:
          SlotInfo = {

            status:
              'To Be Announced',

            date:
              SOLDERING_SESSION_DATE,

            time:
              '',

            venue:
              '',

          };


        /* ===================================================
           MENTOR ALLOTMENT DEFAULT

           TEAM NAME / VEHICLE NO. / MENTOR / CONTACT NO. /
           POC NAME & CONTACT COME FROM A DEDICATED
           MENTOR-ALLOTMENT SHEET (SEPARATE API), ALSO KEYED
           BY VEHICLE NUMBER AND ALSO EXPECTED TO USE
           MERGED-RANGE CELLS ACROSS VEHICLE-NUMBER RANGES.
        =================================================== */

        let mentor:
          MentorInfo = {

            mentorName:
              '',

            mentorContact:
              '',

            pocName:
              '',

            pocContact:
              '',

          };


        /* ===================================================
           SLOT API

           Uses vehicle number from registration API.
           Only feeds the electrical kit slot now.
        =================================================== */

        if (vehicleNumber) {

          try {

            const slotURL =
              `${SLOT_API_URL}?vehicle=${encodeURIComponent(
                vehicleNumber
              )}`;


            const slotResponse =
              await fetch(
                slotURL,
                {
                  method:
                    'GET',

                  headers: {
                    Accept:
                      'application/json',
                  },

                  cache:
                    'no-store',
                }
              );


            if (!slotResponse.ok) {

              throw new Error(
                `Slot API returned ${slotResponse.status}`
              );

            }


            const slotData:
              SlotResponse =
              await slotResponse.json();


            console.log(
              'XLR8 slot response:',
              slotData
            );


            /* =================================================
               SLOT FOUND
            ================================================= */

            if (
              slotData.success &&
              slotData.found
            ) {

              const slotTime =
                slotData.time ||
                slotData.slot ||
                '';


              const slotVenue =
                slotData.venue ||
                'To Be Announced';


              /* =============================================
                 ELECTRICAL KIT

                 SAME SLOT SHEET DATA
              ============================================= */

              electricalKit = {

                status:
                  'Slot Assigned',

                date:
                  ELECTRICAL_KIT_DATE,

                time:
                  slotTime,

                venue:
                  slotVenue,

                details:
                  slotData.details ||
                  '',

              };

            }

          } catch (
            slotError
          ) {

            console.warn(
              'Slot API error:',
              slotError
            );

          }


          /* =================================================
             SOLDERING SLOT API

             Separate Apps Script / sheet from the
             electrical slot data above.
             Also keyed by vehicle number, and expected to
             resolve merged-range cells (e.g. one slot
             covering MH 03 ER 0001–0008) to the specific
             vehicle being queried.
          ================================================= */

          try {

            const solderingURL =
              `${SOLDERING_API_URL}?vehicle=${encodeURIComponent(
                vehicleNumber
              )}`;


            const solderingResponse =
              await fetch(
                solderingURL,
                {
                  method:
                    'GET',

                  headers: {
                    Accept:
                      'application/json',
                  },

                  cache:
                    'no-store',
                }
              );


            if (!solderingResponse.ok) {

              throw new Error(
                `Soldering slot API returned ${solderingResponse.status}`
              );

            }


            const solderingData:
              SlotResponse =
              await solderingResponse.json();


            console.log(
              'XLR8 soldering slot response:',
              solderingData
            );


            if (
              solderingData.success &&
              solderingData.found
            ) {

              const solderingTime =
                solderingData.time ||
                solderingData.slot ||
                '';


              const solderingVenue =
                solderingData.venue ||
                'To Be Announced';


              solderingSession = {

                status:
                  'Slot Assigned',

                date:
                  SOLDERING_SESSION_DATE,

                time:
                  solderingTime,

                venue:
                  solderingVenue,

                details:
                  solderingData.details ||
                  '',

              };

            }

          } catch (
            solderingError
          ) {

            console.warn(
              'Soldering slot API error:',
              solderingError
            );

          }


          /* =================================================
             MENTOR ALLOTMENT API

             Separate Apps Script / sheet from all of the
             above. Keyed by vehicle number, and expected to
             resolve merged-range cells (mentor / POC assigned
             to a block of vehicle numbers) down to the
             specific vehicle being queried.
          ================================================= */

          try {

            const mentorURL =
              `${MENTOR_API_URL}?vehicle=${encodeURIComponent(
                vehicleNumber
              )}`;


            const mentorResponse =
              await fetch(
                mentorURL,
                {
                  method:
                    'GET',

                  headers: {
                    Accept:
                      'application/json',
                  },

                  cache:
                    'no-store',
                }
              );


            if (!mentorResponse.ok) {

              throw new Error(
                `Mentor API returned ${mentorResponse.status}`
              );

            }


            const mentorData:
              MentorResponse =
              await mentorResponse.json();


            console.log(
              'XLR8 mentor response:',
              mentorData
            );


            if (
              mentorData.success &&
              mentorData.found
            ) {

              const mentorName =
                mentorData.mentorName ||
                mentorData.mentor ||
                '';


              const mentorContact =
                mentorData.mentorContact ||
                mentorData.contactNo ||
                '';


              let pocName =
                mentorData.pocName ||
                '';


              let pocContact =
                mentorData.pocContact ||
                '';


              /* =============================================
                 If the sheet's "POC Name & Contact" column
                 comes back as one combined string instead of
                 separate fields, split it on the first run of
                 digits so the phone number renders on its own
                 line under the POC's name.
              ============================================= */

              if (
                !pocName &&
                !pocContact &&
                mentorData.poc
              ) {

                const pocMatch =
                  mentorData.poc.match(
                    /^(.*?)[\s,–-]*([\d][\d\s+-]{6,}\d)\s*$/
                  );


                if (pocMatch) {

                  pocName =
                    pocMatch[1].trim();

                  pocContact =
                    pocMatch[2]
                      .replace(/\s+/g, '')
                      .trim();

                } else {

                  pocName =
                    mentorData.poc.trim();

                }

              }


              mentor = {

                mentorName:
                  mentorName,

                mentorContact:
                  mentorContact,

                pocName:
                  pocName,

                pocContact:
                  pocContact,

              };

            }

          } catch (
            mentorError
          ) {

            console.warn(
              'Mentor API error:',
              mentorError
            );

          }

        }


        /* ===================================================
           KIT API
        =================================================== */

        try {

          const kitResponse =
            await fetch(
              KIT_API_URL,
              {
                method:
                  'POST',

                headers: {
                  'Content-Type':
                    'text/plain;charset=utf-8',
                },

                redirect:
                  'follow',

                body:
                  JSON.stringify({

                    action:
                      'fetchStatus',

                    rollNumber:
                      user.roll.trim(),

                    vehicleNumber:
                      vehicleNumber,

                  }),

              }
            );


          if (
            kitResponse.ok
          ) {

            const kitData:
              KitResponse =
              await kitResponse.json();


            console.log(
              'XLR8 kit response:',
              kitData
            );


            /* =================================================
               KIT COLLECTED
            ================================================= */

            if (
              kitData.success &&
              kitData.isConfirmed &&
              kitData.confirmedData
            ) {

              const items =
                kitData
                  .confirmedData
                  .items || {};


              const total =
                kitData
                  .confirmedData
                  .total ??
                Object.values(
                  items
                ).filter(
                  Boolean
                ).length;


              electricalKit = {

                status:
                  'Kit Collected',

                date:
                  ELECTRICAL_KIT_DATE,

                time:
                  electricalKit.time ||
                  '',

                venue:
                  electricalKit.venue ||
                  '',

                total:
                  total,

                items:
                  items,

                details:
                  'Electrical kit collected successfully.',

              };

            }

          }

        } catch (
          kitError
        ) {

          console.warn(
            'Kit API error:',
            kitError
          );

        }


        /* ===================================================
           BUILD TEAM
        =================================================== */

        const resolvedTeam:
          TeamData = {

            found:
              true,

            teamName:
              data.teamName ||
              '—',

            vehicleNo:
              vehicleNumber ||
              'Not Assigned',

            registrationStatus:
              'Completed',

            registeredAt:
              '',

            members:
              members,

            mentor:
              mentor,

            logistics: {

              electricalKit:
                electricalKit,

              softwareSession:
                softwareSession,

              mechanicalKit: {

                status:
                  'To Be Announced',

              },

              solderingSession:
                solderingSession,

              debuggingSession: {

                status:
                  'To Be Announced',

              },

              checkpoint: {

                status:
                  'To Be Announced',

              },

              finalRace: {

                status:
                  'To Be Announced',

              },

            },

          };


        setTeam(
          resolvedTeam
        );


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

  useEffect(
    () => {

      if (
        isLoggedIn &&
        user?.roll
      ) {

        fetchTeamData();

      } else {

        setLoading(false);

      }

    },
    [
      isLoggedIn,
      user?.roll,
    ]
  );


  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh =
    async () => {

      setRefreshing(true);

      await fetchTeamData();

    };


  /* =======================================================
     MEMBERS
  ======================================================= */

  const members =
    useMemo(
      () => {

        if (
          team?.members &&
          team.members.length > 0
        ) {

          return team.members;

        }

        return [];

      },
      [team]
    );


  /* =======================================================
     MENTOR
  ======================================================= */

  const hasMentorInfo =
    Boolean(
      team?.mentor?.mentorName ||
      team?.mentor?.pocName
    );


  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout =
    () => {

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

      <div
        className="
          min-h-screen
          bg-[#070D18]
          text-white
          flex
          items-center
          justify-center
          px-4
          pt-32
        "
      >

        <div
          className="
            w-full
            max-w-md
            rounded-2xl
            border
            border-slate-800
            bg-slate-900/80
            p-8
            text-center
          "
        >

          <div
            className="
              mx-auto
              mb-5
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

            <ShieldCheck
              className="
                w-8
                h-8
                text-cyan-400
              "
            />

          </div>


          <h1
            className="
              text-3xl
              font-bold
              font-heading
            "
          >
            Participant Login Required
          </h1>


          <p
            className="
              text-base
              text-slate-400
              mt-3
              leading-relaxed
            "
          >
            Please login using your ITC SSO account to access your XLR8 participant dashboard.
          </p>


          <button
            onClick={() => {
              window.location.href =
                '/xlr8';
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

      <div
        className="
          min-h-screen
          bg-[#070D18]
          text-white
          flex
          items-center
          justify-center
          pt-32
        "
      >

        <div
          className="
            text-center
          "
        >

          <div
            className="
              w-14
              h-14
              rounded-2xl
              bg-cyan-500/10
              border
              border-cyan-500/25
              flex
              items-center
              justify-center
              mx-auto
            "
          >

            <RefreshCw
              className="
                w-7
                h-7
                text-cyan-400
                animate-spin
              "
            />

          </div>


          <p
            className="
              mt-5
              text-base
              text-slate-400
              font-mono
            "
          >
            LOADING...
          </p>

        </div>

      </div>

    );

  }


  /* =======================================================
     MAIN PAGE
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
          NO GRID
      =================================================== */}

      <div
        className="
          fixed
          inset-0
          pointer-events-none
          z-0
        "
      >

        <div
          className="
            absolute
            top-0
            left-1/4
            w-[500px]
            h-[500px]
            bg-cyan-500/5
            rounded-full
            blur-[140px]
          "
        />

        <div
          className="
            absolute
            bottom-0
            right-1/4
            w-[500px]
            h-[500px]
            bg-purple-500/5
            rounded-full
            blur-[140px]
          "
        />

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


          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <button
              onClick={
                handleRefresh
              }
              disabled={
                refreshing
              }
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
                className={`
                  w-5
                  h-5
                  ${
                    refreshing
                      ? 'animate-spin'
                      : ''
                  }
                `}
              />

              <span
                className="
                  hidden
                  sm:inline
                "
              >
                Refresh
              </span>

            </button>


            <button
              onClick={
                handleLogout
              }
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

              <LogOut
                className="
                  w-5
                  h-5
                "
              />

              <span
                className="
                  hidden
                  sm:inline
                "
              >
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

            <AlertCircle
              className="
                w-5
                h-5
                text-amber-400
                shrink-0
                mt-0.5
              "
            />


            <div
              className="
                flex-1
              "
            >

              <p
                className="
                  text-sm
                  sm:text-base
                  text-amber-200/80
                "
              >
                {error}
              </p>


              <button
                onClick={
                  handleRefresh
                }
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

              <div
                className="
                  flex
                  items-center
                  gap-4
                "
              >

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

                  <Users
                    className="
                      w-8
                      h-8
                      text-cyan-400
                    "
                  />

                </div>


                <div>

                  <h2
                    className="
                      text-3xl
                      sm:text-4xl
                      font-bold
                      font-heading
                      text-cyan-400
                      mt-1
                    "
                  >
                    {safe(
                      team?.teamName
                    )}
                  </h2>

                </div>

              </div>


              <div
                className="
                  flex
                  flex-wrap
                  gap-3
                "
              >

              {/* MECHANICAL KIT REGISTRATION */}

              <button
                type="button"
                onClick={() => {
                  window.location.href =
                    `/Xlr8registration?vehicleNo=${encodeURIComponent(
                      team?.vehicleNo || ''
                    )}&teamName=${encodeURIComponent(
                      team?.teamName || ''
                    )}`;
                }}    
                  className="
                  px-4
                  py-3
                  rounded-lg
                  bg-amber-500/5
                  border
                  border-amber-500/20
                  text-left
                  transition-all
                  hover:border-amber-400/40
                  hover:bg-amber-500/10
                  cursor-pointer
                "
              >
                <p
                  className="
                    text-sm
                    font-bold
                    text-amber-400
                    mt-1
                    flex
                    items-center
                    gap-1.5
                  "
                >
                  REGISTER FOR MECHANICAL KIT
                </p>
              </button>
              
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
                    "
                  >
                    {safe(
                      team?.vehicleNo
                    )}
                  </p>

                </div>


                {/* ROLL NUMBER */}

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
                    "
                  >
                    {safe(
                      user.roll
                    )}
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              MENTOR & POC
          ================================================= */}

          {hasMentorInfo && (

          <div
            className="
              px-6
              sm:px-8
              pt-6
            "
          >

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-4
              "
            >

              {/* MENTOR CARD */}

              <div
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

                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.15em]
                    font-mono
                    text-slate-500
                  "
                >
                  Mentor
                </p>


                <p
                  className="
                    text-lg
                    sm:text-xl
                    font-bold
                    text-white
                    mt-1
                  "
                >
                  {safe(
                    team?.mentor?.mentorName
                  )}
                </p>


                {team?.mentor?.mentorContact && (

                  <a
                    href={
                      `tel:${team.mentor.mentorContact}`
                    }
                    className="
                      flex
                      items-center
                      gap-2
                      text-sm
                      text-slate-400
                      hover:text-cyan-400
                      transition
                      mt-2
                    "
                  >

                    <Phone
                      className="
                        w-4
                        h-4
                        text-slate-500
                      "
                    />

                    {team.mentor.mentorContact}

                  </a>

                )}

              </div>


              {/* POC CARD */}

              <div
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

                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.15em]
                    font-mono
                    text-slate-500
                  "
                >
                  POC
                </p>


                <p
                  className="
                    text-lg
                    sm:text-xl
                    font-bold
                    text-white
                    mt-1
                  "
                >
                  {safe(
                    team?.mentor?.pocName
                  )}
                </p>


                {team?.mentor?.pocContact && (

                  <a
                    href={
                      `tel:${team.mentor.pocContact}`
                    }
                    className="
                      flex
                      items-center
                      gap-2
                      text-sm
                      text-slate-400
                      hover:text-cyan-400
                      transition
                      mt-2
                    "
                  >

                    <Phone
                      className="
                        w-4
                        h-4
                        text-slate-500
                      "
                    />

                    {team.mentor.pocContact}

                  </a>

                )}

              </div>

            </div>

          </div>

          )}

          {/* =================================================
              TEAM MEMBERS
          ================================================= */}

          <div
            className="
              p-6
              sm:p-8
            "
          >

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
                    key={
                      `${member.roll}-${index}`
                    }
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


                      <div
                        className="
                          min-w-0
                        "
                      >

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
                          "
                        >
                          {member.role ||
                            (
                              index === 0
                                ? 'Team Leader'
                                : `Member ${index + 1}`
                            )}
                        </p>

                      </div>

                    </div>


                    <div
                      className="
                        space-y-3
                      "
                    >

                      <div
                        className="
                          flex
                          items-center
                          gap-2
                          text-sm
                        "
                      >

                        <BadgeCheck
                          className="
                            w-4
                            h-4
                            text-cyan-400/70
                          "
                        />

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
                          href={
                            `tel:${member.phone}`
                          }
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

                          <Phone
                            className="
                              w-4
                              h-4
                              text-slate-500
                            "
                          />

                          {member.phone}

                        </a>

                      )}


                      {member.email && (

                        <a
                          href={
                            `mailto:${member.email}`
                          }
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

                          <Mail
                            className="
                              w-4
                              h-4
                              text-slate-500
                              shrink-0
                            "
                          />

                          <span
                            className="
                              truncate
                            "
                          >
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

        <section
          className="
            space-y-4
          "
        >

          <div
            className="
              px-1
              mb-3
            "
          >

            <h2
              className="
                text-2xl
                sm:text-3xl
                font-bold
                font-heading
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
            item => {

              const Icon =
                item.icon;


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


              const isElectricalKit =
                item.key ===
                'electricalKit';


              const isSoftwareSession =
                item.key ===
                'softwareSession';


              const isSolderingSession =
                item.key ===
                'solderingSession';


              const isCollected =
                isElectricalKit &&
                info?.status ===
                  'Kit Collected';


              const hasSlot =
                isElectricalKit ||
                isSolderingSession
                  ? Boolean(
                      info?.time ||
                      info?.slot
                    )
                  : false;


              const collectedItems =
                isCollected
                  ? Object.entries(
                      info?.items || {}
                    ).filter(
                      ([, value]) =>
                        Boolean(value)
                    )
                  : [];


              return (

                <div
                  key={
                    item.key
                  }
                  className={`
                    rounded-2xl
                    bg-slate-900/80
                    border
                    ${accent.border}
                    ${accent.glow}
                    p-5
                    sm:p-6
                    transition-all
                    duration-200
                    hover:shadow-[0_0_30px_rgba(255,255,255,0.035)]
                  `}
                >


                  {/* =================================================
                      HEADER
                  ================================================= */}

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


                      <div
                        className="
                          min-w-0
                        "
                      >

                        <h3
                          className="
                            text-base
                            sm:text-lg
                            font-bold
                            text-white
                          "
                        >
                          {item.label}
                        </h3>

                      </div>

                    </div>


                    {/* STATUS */}

                    {isCollected ? (

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
                          border
                          bg-emerald-500/10
                          text-emerald-400
                          border-emerald-500/20
                        "
                      >
                        COLLECTED
                      </span>

                    ) : isElectricalKit ? (

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
                          border
                          bg-rose-500/10
                          text-rose-400
                          border-rose-500/20
                        "
                      >
                        NOT COLLECTED
                      </span>

                    ) : isSoftwareSession ? (

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
                          border
                          bg-emerald-500/10
                          text-emerald-400
                          border-emerald-500/20
                        "
                      >
                        COMPLETED
                      </span>

                    ) : (

                      <span
                        className={`
                          shrink-0
                          text-[10px]
                          sm:text-xs
                          font-semibold
                          uppercase
                          tracking-wide
                          px-3
                          py-1.5
                          rounded-md
                          border

                          ${
                            hasSlot
                              ? `
                                bg-cyan-500/10
                                text-cyan-400
                                border-cyan-500/20
                              `
                              : `
                                bg-indigo-500/5
                                text-indigo-400
                                border-indigo-500/15
                              `
                          }
                        `}
                      >

                        {hasSlot
                          ? 'SLOT ASSIGNED'
                          : 'TO BE ANNOUNCED'}

                      </span>

                    )}

                  </div>


                  {/* =================================================
                      ELECTRICAL KIT — COLLECTED
                  ================================================= */}

                  {isElectricalKit &&
                  isCollected ? (

                    <div
                      className="
                        mt-5
                        space-y-4
                      "
                    >

                      <div
                        className="
                          rounded-xl
                          bg-emerald-500/5
                          border
                          border-emerald-500/15
                          p-4
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
                            gap-3
                          "
                        >

                          <button
                            type="button"
                            onClick={() => {
                              setShowComponents(
                                prev => !prev
                              );
                            }}
                            className="
                              shrink-0
                              text-xs
                              sm:text-sm
                              font-semibold
                              px-4
                              py-2
                              rounded-md
                              border
                              border-emerald-500/30
                              text-emerald-300
                              hover:bg-emerald-500/20
                              transition
                            "
                          >
                            {showComponents
                              ? 'Hide Components List'
                              : 'Show Components List'}
                          </button>

                        </div>


                        <div
                          className="
                            text-right
                            shrink-0
                          "
                        >

                          <p
                            className="
                              text-[10px]
                              uppercase
                              tracking-wider
                              font-mono
                              text-slate-500
                            "
                          >
                            Total Components
                          </p>


                          <p
                            className="
                              text-2xl
                              font-bold
                              text-white
                            "
                          >
                            {safe(
                              info?.total ??
                              collectedItems.length
                            )}
                          </p>

                        </div>

                      </div>


                      {/* COMPONENTS */}

                      {showComponents && (

                      <div>

                        <p
                          className="
                            text-[10px]
                            uppercase
                            tracking-[0.15em]
                            font-mono
                            text-slate-500
                            mb-3
                          "
                        >
                          Collected Components
                        </p>


                        <div
                          className="
                            grid
                            grid-cols-1
                            sm:grid-cols-2
                            lg:grid-cols-3
                            gap-2
                          "
                        >

                          {collectedItems.length >
                          0 ? (

                            collectedItems.map(
                              ([key]) => (

                                <div
                                  key={
                                    key
                                  }
                                  className="
                                    flex
                                    items-center
                                    gap-2.5
                                    rounded-lg
                                    bg-slate-950/70
                                    border
                                    border-slate-800
                                    px-3
                                    py-2.5
                                  "
                                >

                                  <CheckCircle2
                                    className="
                                      w-4
                                      h-4
                                      text-emerald-400
                                      shrink-0
                                    "
                                  />


                                  <span
                                    className="
                                      text-sm
                                      text-slate-300
                                    "
                                  >

                                    {
                                      KIT_COMPONENT_LABELS[
                                        key
                                      ] ||
                                      key
                                    }

                                  </span>

                                </div>

                              )
                            )

                          ) : (

                            <p
                              className="
                                text-sm
                                text-slate-500
                              "
                            >
                              No component details available.
                            </p>

                          )}

                        </div>

                      </div>

                      )}

                    </div>


                  ) : isElectricalKit ? (


                    /* =================================================
                       ELECTRICAL KIT — NOT COLLECTED
                    ================================================= */

                    <div
                      className="
                        mt-5
                        rounded-xl
                        bg-rose-500/5
                        border
                        border-rose-500/15
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

                        <AlertCircle
                          className="
                            w-6
                            h-6
                            text-rose-400
                            shrink-0
                          "
                        />


                        <div>

                          <p
                            className="
                              text-base
                              sm:text-lg
                              font-bold
                              text-rose-400
                            "
                          >
                            YOU HAVEN'T COLLECTED YOUR ELECTRICAL KIT YET
                          </p>


                          <p
                            className="
                              text-sm
                              text-slate-400
                              mt-1
                            "
                          >
                            Please contact any convenors to collect your kit.
                          </p>

                        </div>

                      </div>

                    </div>


                  ) : isSoftwareSession ? (


                    /* =================================================
                       SOFTWARE SESSION — COMPLETED

                       No date/time/venue is fetched or shown;
                       the COMPLETED badge above is the only
                       indicator for this card.
                    ================================================= */

                    null


                  ) : (


                    /* =================================================
                       SOLDERING + OTHER SESSION CARDS
                    ================================================= */

                    <div
                      className="
                        mt-5
                      "
                    >

                      {hasSlot ? (

                        <div
                          className="
                            grid
                            grid-cols-1
                            sm:grid-cols-3
                            gap-6
                          "
                        >

                          {/* =================================================
                              DATE
                          ================================================= */}

                          <div
                            className="
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

                              <CalendarDays
                                className="
                                  w-6
                                  h-6
                                  text-cyan-400
                                  shrink-0
                                "
                              />


                              <div
                                className="
                                  min-w-0
                                "
                              >

                                <p
                                  className="
                                    text-xl
                                    sm:text-[1.35rem]
                                    font-bold
                                    text-white
                                    mt-1
                                  "
                                >
                                  {safe(
                                    info?.date
                                  )}
                                </p>

                              </div>

                            </div>

                          </div>


                          {/* =================================================
                              TIME
                          ================================================= */}

                          <div
                            className="
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

                              <Clock3
                                className="
                                  w-6
                                  h-6
                                  text-cyan-400
                                  shrink-0
                                "
                              />


                              <div
                                className="
                                  min-w-0
                                "
                              >

                                <p
                                  className="
                                    text-xl
                                    sm:text-[1.35rem]
                                    font-bold
                                    text-white
                                    mt-1
                                  "
                                >
                                  {safe(
                                    info?.time ||
                                    info?.slot
                                  )}
                                </p>

                              </div>

                            </div>

                          </div>


                          {/* =================================================
                              VENUE
                          ================================================= */}

                          <div
                            className="
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

                              <MapPin
                                className="
                                  w-6
                                  h-6
                                  text-cyan-400
                                  shrink-0
                                "
                              />


                              <div
                                className="
                                  min-w-0
                                "
                              >

                                <p
                                  className="
                                    text-xl
                                    sm:text-[1.35rem]
                                    font-bold
                                    text-white
                                    mt-1
                                    leading-snug
                                  "
                                >
                                  {safe(
                                    info?.venue
                                  )}
                                </p>

                              </div>

                            </div>

                          </div>

                        </div>


                      ) : (

                        <div
                          className="
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

                            <Circle
                              className="
                                w-5
                                h-5
                                text-slate-600
                              "
                            />


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

                      )}

                    </div>

                  )}

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