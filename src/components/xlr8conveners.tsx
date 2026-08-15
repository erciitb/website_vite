import React, { useState, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  CheckCircle2,
  Search,
  Loader2,
  AlertCircle,
  Users,
  User,
  Package,
  CheckSquare,
  Square,
  Send,
  AlertTriangle,
} from 'lucide-react';

// =======================================================================
// APPS SCRIPT URLS
// =======================================================================

// Registration Sheet Apps Script
// Supports:
// - Team name search
// - Roll number search
// - Vehicle number search
const SEARCH_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbz1VUbHq9eK0y9pZxSE_8_YvwmY_T2ZzKh1rB3T3QxSXH0YwughGwYHYfD-rE8SS0p6/exec';

// Kit Distribution Apps Script
const KIT_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbw0H67jJU6OomSyWXpGyL3ubbdzIMBI-S5rU185yn4rbqKtk1QjP-NR_dTY29zjdrcd/exec';

// =======================================================================
// TEAM DATA
// =======================================================================

interface TeamData {
  teamName: string;

  // Used internally for kit lookup/submission.
  // NOT displayed in the team information card.
  vehicleNumber?: string;

  leaderName: string;
  leaderRoll: string;
  leaderPhone: string;
  leaderMentor: string;
  leaderMentorPhone: string;

  p2Name: string;
  p2Roll: string;
  p2Phone: string;
  p2Mentor: string;
  p2MentorPhone: string;

  p3Name: string;
  p3Roll: string;
  p3Phone: string;
  p3Mentor: string;
  p3MentorPhone: string;

  p4Name: string;
  p4Roll: string;
  p4Phone: string;
  p4Mentor: string;
  p4MentorPhone: string;

  isConfirmed: boolean;
}

// =======================================================================
// KIT ITEMS
// =======================================================================

const kitItems = [
  { id: 'motorDriver', label: 'Motor Driver' },
  { id: 'piPico', label: 'Raspberry Pi Pico 2W' },
  { id: 'mpu6050', label: 'MPU 6050' },
  { id: 'esp01', label: 'ESP01' },
  { id: 'solderGun', label: 'Solder Gun' },
  { id: 'solderStand', label: 'Solder Gun Stand' },
  { id: 'solderWire', label: 'Soldering Wire' },
  { id: 'pcb', label: 'PCB (perforated board)' },
  { id: 'batteryHolder', label: 'Remote Battery Holder' },
  { id: 'onOffSwitch', label: 'On/Off switch' },
  { id: 'jumperWires', label: 'Jumper wires' },
  { id: 'wires1m', label: 'Wires (1m)' },
  { id: 'wireStripper', label: 'Wire Stripper' },
  { id: 'multimeter', label: 'Digital Multimeter' },
  { id: 'breadboard', label: 'Breadboard' },
  { id: 'bergPins', label: 'Berg Pins' },
  { id: 'microUsb', label: 'Micro USB Cable' },
  { id: 'screwDriver', label: 'Screw Driver' },
];

// =======================================================================
// COMPONENT
// =======================================================================

const Xlr8Conveners = () => {
  const { user, isLoggedIn } = useAuth();

  // =====================================================================
  // SEARCH STATE
  // =====================================================================

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<TeamData | null>(null);
  const [error, setError] = useState('');

  // =====================================================================
  // KIT STATE
  // =====================================================================

  const [isFetchingKit, setIsFetchingKit] = useState(false);
  const [isKitConfirmed, setIsKitConfirmed] = useState(false);
  const [isSubmittingKit, setIsSubmittingKit] = useState(false);

  const [checkedItems, setCheckedItems] = useState<
    Record<string, boolean>
  >(() =>
    kitItems.reduce<Record<string, boolean>>((acc, item) => {
      acc[item.id] = false;
      return acc;
    }, {})
  );

  // =====================================================================
  // LOGIN CHECK
  // =====================================================================

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-6">
        <div className="bg-[#111827] border border-slate-800/80 rounded-3xl p-8 text-center shadow-2xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />

          <h1 className="text-2xl font-bold text-white mb-2">
            Access Denied
          </h1>

          <p className="text-slate-400">
            Please log in to access the Convener dashboard.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================================
  // GET INITIALS
  // =====================================================================

  const getInitials = (name: string) => {
    if (!name) return '??';

    return name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // =====================================================================
  // EMPTY KIT STATE
  // =====================================================================

  const resetKitItems = () => {
    setCheckedItems(
      kitItems.reduce<Record<string, boolean>>((acc, item) => {
        acc[item.id] = false;
        return acc;
      }, {})
    );
  };

  // =====================================================================
  // FETCH KIT STATUS
  // =====================================================================

  const fetchKitStatus = async (
    rollNumber: string,
    vehicleNumber?: string
  ) => {
    setIsFetchingKit(true);

    try {
      const response = await fetch(KIT_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        redirect: 'follow',
        body: JSON.stringify({
          action: 'fetchStatus',
          rollNumber: rollNumber || '',
          vehicleNumber: vehicleNumber || '',
        }),
      });

      const result = await response.json();

      console.log('Kit status response:', result);

      if (result.success && result.isConfirmed) {
        setIsKitConfirmed(true);

        if (
          result.confirmedData &&
          result.confirmedData.items &&
          typeof result.confirmedData.items === 'object'
        ) {
          setCheckedItems(result.confirmedData.items);
        }
      } else {
        setIsKitConfirmed(false);
        resetKitItems();
      }
    } catch (err) {
      console.error('Failed to fetch kit status:', err);

      setIsKitConfirmed(false);
      resetKitItems();
    } finally {
      setIsFetchingKit(false);
    }
  };

  // =====================================================================
  // CONVERT ROLL / VEHICLE SEARCH RESPONSE
  //
  // Expected Apps Script response:
  //
  // {
  //   found: true,
  //   teamName: "...",
  //   vehicleNumber: "...",
  //   leader: {...},
  //   members: [...]
  // }
  //
  // =====================================================================

  const convertFoundResponseToTeam = (
    data: any
  ): TeamData | null => {
    if (!data || !data.found) {
      return null;
    }

    const members = Array.isArray(data.members)
      ? data.members
      : [];

    const leader = data.leader || members[0] || {};
    const p2 = members[1] || {};
    const p3 = members[2] || {};
    const p4 = members[3] || {};

    return {
      teamName: data.teamName || '',

      vehicleNumber: data.vehicleNumber || '',

      // Leader
      leaderName: leader.name || '',
      leaderRoll: leader.roll || '',
      leaderPhone: leader.phone || '',
      leaderMentor: leader.mentor || '',
      leaderMentorPhone: leader.mentorPhone || '',

      // Participant 2
      p2Name: p2.name || '',
      p2Roll: p2.roll || '',
      p2Phone: p2.phone || '',
      p2Mentor: p2.mentor || '',
      p2MentorPhone: p2.mentorPhone || '',

      // Participant 3
      p3Name: p3.name || '',
      p3Roll: p3.roll || '',
      p3Phone: p3.phone || '',
      p3Mentor: p3.mentor || '',
      p3MentorPhone: p3.mentorPhone || '',

      // Participant 4
      p4Name: p4.name || '',
      p4Roll: p4.roll || '',
      p4Phone: p4.phone || '',
      p4Mentor: p4.mentor || '',
      p4MentorPhone: p4.mentorPhone || '',

      isConfirmed:
        data.isConfirmed === true ||
        String(data.isConfirmed).toLowerCase() === 'true',
    };
  };

  // =====================================================================
  // CONVERT TEAM NAME SEARCH RESPONSE
  // =====================================================================

  const convertTeamResponseToTeam = (
    data: any
  ): TeamData | null => {
    if (!data || !data.success || !data.team) {
      return null;
    }

    const team = data.team;

    return {
      teamName: team.teamName || '',
      vehicleNumber: team.vehicleNumber || '',

      leaderName: team.leaderName || '',
      leaderRoll: team.leaderRoll || '',
      leaderPhone: team.leaderPhone || '',
      leaderMentor: team.leaderMentor || '',
      leaderMentorPhone: team.leaderMentorPhone || '',

      p2Name: team.p2Name || '',
      p2Roll: team.p2Roll || '',
      p2Phone: team.p2Phone || '',
      p2Mentor: team.p2Mentor || '',
      p2MentorPhone: team.p2MentorPhone || '',

      p3Name: team.p3Name || '',
      p3Roll: team.p3Roll || '',
      p3Phone: team.p3Phone || '',
      p3Mentor: team.p3Mentor || '',
      p3MentorPhone: team.p3MentorPhone || '',

      p4Name: team.p4Name || '',
      p4Roll: team.p4Roll || '',
      p4Phone: team.p4Phone || '',
      p4Mentor: team.p4Mentor || '',
      p4MentorPhone: team.p4MentorPhone || '',

      isConfirmed:
        team.isConfirmed === true ||
        String(team.isConfirmed).toLowerCase() === 'true',
    };
  };

  // =====================================================================
  // MAIN SEARCH
  //
  // 1. Team Name
  // 2. Roll Number
  // 3. Vehicle Number
  //
  // =====================================================================

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();

    const query = searchQuery.trim();

    if (!query) return;

    setIsSearching(true);
    setError('');
    setSearchResult(null);
    setIsKitConfirmed(false);
    resetKitItems();

    try {
      let team: TeamData | null = null;

      // ===============================================================
      // STEP 1 — TEAM NAME
      // ===============================================================

      try {
        const response = await fetch(
          `${SEARCH_SCRIPT_URL}?action=search&teamName=${encodeURIComponent(
            query
          )}`
        );

        if (!response.ok) {
          throw new Error(
            `Team search HTTP error: ${response.status}`
          );
        }

        const data = await response.json();

        team = convertTeamResponseToTeam(data);
      } catch (err) {
        console.warn('Team name search failed:', err);
      }

      // ===============================================================
      // STEP 2 — ROLL NUMBER
      // ===============================================================

      if (!team) {
        try {
          const response = await fetch(
            `${SEARCH_SCRIPT_URL}?roll=${encodeURIComponent(query)}`
          );

          if (!response.ok) {
            throw new Error(
              `Roll search HTTP error: ${response.status}`
            );
          }

          const data = await response.json();

          team = convertFoundResponseToTeam(data);
        } catch (err) {
          console.warn('Roll number search failed:', err);
        }
      }

      // ===============================================================
      // STEP 3 — VEHICLE NUMBER
      // ===============================================================

      if (!team) {
        try {
          const response = await fetch(
            `${SEARCH_SCRIPT_URL}?vehicle=${encodeURIComponent(query)}`
          );

          if (!response.ok) {
            throw new Error(
              `Vehicle search HTTP error: ${response.status}`
            );
          }

          const data = await response.json();

          team = convertFoundResponseToTeam(data);
        } catch (err) {
          console.warn('Vehicle number search failed:', err);
        }
      }

      // ===============================================================
      // NOTHING FOUND
      // ===============================================================

      if (!team) {
        setError(
          'No team, roll number, or vehicle number found matching that search.'
        );

        return;
      }

      // ===============================================================
      // TEAM FOUND
      // ===============================================================

      console.log('Final team data:', team);

      setSearchResult(team);

      // ===============================================================
      // FETCH KIT STATUS
      //
      // Both roll + vehicle are sent.
      // ===============================================================

      await fetchKitStatus(
        team.leaderRoll,
        team.vehicleNumber
      );
    } catch (err) {
      console.error('Search error:', err);

      setError(
        'Failed to fetch data. Ensure your Apps Script is correctly configured.'
      );
    } finally {
      setIsSearching(false);
    }
  };

  // =====================================================================
  // TOGGLE KIT ITEM
  // =====================================================================

  const handleToggle = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // =====================================================================
  // SELECT / DESELECT ALL
  // =====================================================================

  const handleSelectAll = () => {
    const allSelected =
      Object.values(checkedItems).every(Boolean);

    const newState =
      kitItems.reduce<Record<string, boolean>>(
        (acc, item) => {
          acc[item.id] = !allSelected;
          return acc;
        },
        {}
      );

    setCheckedItems(newState);
  };

  // =====================================================================
  // KIT SUBMISSION
  // =====================================================================

  const handleKitSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!searchResult) return;

    setIsSubmittingKit(true);

    const payload = {
      action: 'kitDistribution',
      rollNumber: searchResult.leaderRoll,
      vehicleNumber: searchResult.vehicleNumber || '',
      items: checkedItems,
    };

    console.log('Kit submission:', payload);

    try {
      const response = await fetch(KIT_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        redirect: 'follow',
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      console.log(
        'Kit submission response:',
        result
      );

      if (result.success) {
        setIsKitConfirmed(true);
      } else {
        alert(
          `Kit Submission failed: ${
            result.message ||
            result.error ||
            'Unknown error'
          }`
        );
      }
    } catch (error) {
      console.error(error);

      alert(
        'An error occurred while confirming the kit.'
      );
    } finally {
      setIsSubmittingKit(false);
    }
  };

  // =====================================================================
  // PARTICIPANT CARD
  // =====================================================================

  const ParticipantCard = ({
    title,
    name,
    roll,
    phone,
    mentor,
    mentorPhone,
    isLeader = false,
  }: {
    title: string;
    name: string;
    roll: string;
    phone: string;
    mentor: string;
    mentorPhone: string;
    isLeader?: boolean;
  }) => {
    if (!name || name === 'N/A') {
      return (
        <div className="bg-[#0b1120] border border-slate-800/60 rounded-xl p-4 flex flex-col gap-2">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            {title}
          </h3>

          <p className="text-slate-600 italic">
            No details provided
          </p>
        </div>
      );
    }

    return (
      <div
        className={`bg-[#0b1120] border ${
          isLeader
            ? 'border-blue-500/30'
            : 'border-slate-800/60'
        } rounded-xl p-4 flex flex-col gap-3`}
      >
        <div className="flex items-center gap-2">
          <User
            className={`w-4 h-4 ${
              isLeader
                ? 'text-blue-400'
                : 'text-slate-400'
            }`}
          />

          <h3
            className={`text-sm font-bold uppercase tracking-wider ${
              isLeader
                ? 'text-blue-400'
                : 'text-slate-300'
            }`}
          >
            {title}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
          {/* NAME */}

          <div>
            <span className="text-slate-500 text-xs block">
              Name
            </span>

            <span className="text-slate-200">
              {name || 'N/A'}
            </span>
          </div>

          {/* ROLL */}

          <div>
            <span className="text-slate-500 text-xs block">
              Roll
            </span>

            <span className="text-slate-200">
              {roll || 'N/A'}
            </span>
          </div>

          {/* PHONE */}

          <div>
            <span className="text-slate-500 text-xs block">
              Phone
            </span>

            <span className="text-slate-200">
              {phone || 'N/A'}
            </span>
          </div>

          {/* SEPARATOR */}

          <div className="col-span-2 border-t border-slate-800/60 mt-1 pt-2" />

          {/* MENTOR */}

          <div>
            <span className="text-slate-500 text-xs block">
              ISMP Mentor
            </span>

            <span className="text-slate-200">
              {mentor || 'N/A'}
            </span>
          </div>

          {/* MENTOR PHONE */}

          <div>
            <span className="text-slate-500 text-xs block">
              Mentor Phone
            </span>

            <span className="text-slate-200">
              {mentorPhone || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // =====================================================================
  // UI
  // =====================================================================

  return (
    <div className="min-h-screen bg-[#0f172a] pt-32 pb-16 px-6 sm:px-12 flex flex-col items-center gap-8">

      {/* ===============================================================
          AUTH CARD
      =============================================================== */}

      <div className="bg-[#111827] border border-slate-800/80 rounded-3xl p-8 w-full max-w-4xl shadow-2xl">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 shrink-0 rounded-2xl bg-[#1e293b] flex items-center justify-center text-4xl font-bold text-blue-400 border border-slate-700 shadow-[0_0_25px_rgba(59,130,246,0.15)]">
              {getInitials(user?.name || '')}
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-[2.5rem] leading-none font-bold text-white tracking-tight">
                {user?.name}
              </h1>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 mt-4 md:mt-0">
            <span className="text-[11px] font-bold text-slate-400 tracking-[0.2em] uppercase">
              Account Status
            </span>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700/80 bg-[#1e293b]/50 text-slate-200 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              Convener
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-slate-800/60 my-8" />
      </div>

      {/* ===============================================================
          TEAM SEARCH
      =============================================================== */}

      <div className="bg-[#111827] border border-slate-800/80 rounded-3xl p-8 w-full max-w-4xl shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-blue-400" />

          <h2 className="text-2xl font-bold text-white tracking-tight">
            Team Lookup Database
          </h2>
        </div>

        {/* SEARCH FORM */}

        <form
          onSubmit={handleSearch}
          className="flex gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              placeholder="Enter Team Name, Roll Number or Vehicle Number..."
              className="w-full bg-[#0b1120] border border-slate-700 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={
              isSearching ||
              !searchQuery.trim()
            }
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
          >
            {isSearching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Search'
            )}
          </button>
        </form>

        {/* ERROR */}

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-3 mb-6">
            <AlertCircle className="w-5 h-5" />

            <p className="text-sm font-medium">
              {error}
            </p>
          </div>
        )}

        {/* =============================================================
            SEARCH RESULT
        ============================================================= */}

        {searchResult && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">

            {/* TEAM DETAILS */}

            <div>
              <div className="border-b border-slate-800 pb-4 mb-6">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">
                  Found Team
                </span>

                <h3 className="text-3xl font-bold text-blue-400">
                  {searchResult.teamName}
                </h3>
              </div>

              {/* PARTICIPANTS */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ParticipantCard
                  title="Participant 1 (Leader)"
                  name={searchResult.leaderName}
                  roll={searchResult.leaderRoll}
                  phone={searchResult.leaderPhone}
                  mentor={searchResult.leaderMentor}
                  mentorPhone={
                    searchResult.leaderMentorPhone
                  }
                  isLeader={true}
                />

                <ParticipantCard
                  title="Participant 2"
                  name={searchResult.p2Name}
                  roll={searchResult.p2Roll}
                  phone={searchResult.p2Phone}
                  mentor={searchResult.p2Mentor}
                  mentorPhone={
                    searchResult.p2MentorPhone
                  }
                />

                <ParticipantCard
                  title="Participant 3"
                  name={searchResult.p3Name}
                  roll={searchResult.p3Roll}
                  phone={searchResult.p3Phone}
                  mentor={searchResult.p3Mentor}
                  mentorPhone={
                    searchResult.p3MentorPhone
                  }
                />

                <ParticipantCard
                  title="Participant 4"
                  name={searchResult.p4Name}
                  roll={searchResult.p4Roll}
                  phone={searchResult.p4Phone}
                  mentor={searchResult.p4Mentor}
                  mentorPhone={
                    searchResult.p4MentorPhone
                  }
                />
              </div>

              {/* REGISTRATION STATUS */}

              <div
                className={`mt-6 flex items-center justify-center p-4 rounded-xl border ${
                  searchResult.isConfirmed
                    ? 'bg-green-900/20 border-green-500/40 text-green-400'
                    : 'bg-orange-900/20 border-orange-500/40 text-orange-400'
                }`}
              >
                {searchResult.isConfirmed ? (
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5" />

                    <span className="text-sm font-bold tracking-widest uppercase">
                      Registration Confirmed
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />

                    <span className="text-sm font-bold tracking-widest uppercase">
                      Pending Registration Confirmation
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="h-px w-full bg-slate-800/60" />

            {/* =========================================================
                KIT DISTRIBUTION
            ========================================================= */}

            <div>
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-6 h-6 text-blue-400" />

                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Electrical Kit Distribution
                </h3>
              </div>

              {/* LOADING */}

              {isFetchingKit ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />

                  <span className="ml-3 text-slate-400 font-medium">
                    Checking kit status...
                  </span>
                </div>
              ) : isKitConfirmed ? (

                /* =====================================================
                   KIT ALREADY DISTRIBUTED
                ===================================================== */

                <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-6">
                  <div className="flex flex-col items-center text-center border-b border-slate-700/80 pb-6 mb-6">
                    <CheckCircle2 className="w-14 h-14 text-green-500 mb-3" />

                    <h4 className="text-xl font-bold text-slate-100">
                      Kit Already Distributed
                    </h4>

                    <p className="text-slate-400 text-sm mt-1">
                      Components have been handed over to{' '}
                      <span className="text-slate-200 font-semibold">
                        {searchResult.teamName}
                      </span>
                      .
                    </p>
                  </div>

                  <h5 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-400" />
                    Recorded Components
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {kitItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-[#0b1120] border border-slate-700/50"
                      >
                        {checkedItems[item.id] ? (
                          <CheckSquare className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600" />
                        )}

                        <span
                          className={
                            checkedItems[item.id]
                              ? 'text-slate-300 text-sm'
                              : 'text-slate-600 text-sm line-through'
                          }
                        >
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (

                /* =====================================================
                   KIT DISTRIBUTION FORM
                ===================================================== */

                <form
                  onSubmit={handleKitSubmit}
                  className="space-y-6"
                >
                  <div className="bg-yellow-900/10 border border-yellow-900/40 rounded-xl p-4 flex gap-3 text-yellow-500/90">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />

                    <p className="text-sm leading-relaxed">
                      <strong className="font-semibold text-yellow-500">
                        Convener Notice:
                      </strong>{' '}
                      Verify all hardware components carefully before handing them to the team.
                    </p>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/80">
                      <h4 className="text-md font-bold text-slate-200">
                        Select Items to Distribute
                      </h4>

                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors bg-blue-900/20 hover:bg-blue-900/40 px-3 py-1.5 rounded-lg border border-blue-900/30"
                      >
                        {Object.values(checkedItems).every(
                          Boolean
                        )
                          ? 'Deselect All'
                          : 'Select All'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {kitItems.map((item) => (
                        <label
                          key={item.id}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-colors select-none ${
                            checkedItems[item.id]
                              ? 'bg-blue-900/20 border-blue-500/30 text-blue-100'
                              : 'bg-[#0b1120] border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex-shrink-0">
                            {checkedItems[item.id] ? (
                              <CheckSquare className="w-5 h-5 text-blue-500" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-500" />
                            )}
                          </div>

                          <input
                            type="checkbox"
                            className="hidden"
                            checked={
                              checkedItems[item.id]
                            }
                            onChange={() =>
                              handleToggle(item.id)
                            }
                          />

                          <span className="text-sm font-medium">
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* SUBMIT */}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingKit}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-white font-medium transition-colors shadow-lg shadow-blue-900/20"
                    >
                      {isSubmittingKit ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        'Confirm Kit Distribution'
                      )}

                      {!isSubmittingKit && (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Xlr8Conveners;