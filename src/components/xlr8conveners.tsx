import React, { useState, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  ShieldCheck, CheckCircle2, Hash, BookOpen, GraduationCap, 
  Calendar, Search, Loader2, AlertCircle, Users, User
} from 'lucide-react';

// Using your provided script URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxpJnY17ZSx-CJQcUv9PAthDB2KpXqdn6kVCdfYnyke4ggEEY3MjPJzzEHRv2u96ZmI/exec"
// Type for the expected search result
interface TeamData {
  teamName: string;
  leaderName: string;
  leaderRoll: string;
  leaderPhone: string;
  leaderMentor: string;
  leaderMentorPhone: string;
  p2Name: string; p2Roll: string; p2Phone: string; p2Mentor: string; p2MentorPhone: string;
  p3Name: string; p3Roll: string; p3Phone: string; p3Mentor: string; p3MentorPhone: string;
  p4Name: string; p4Roll: string; p4Phone: string; p4Mentor: string; p4MentorPhone: string;
  isConfirmed: boolean;
}

const Xlr8Conveners = () => {
  const { user, isLoggedIn } = useAuth();
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<TeamData | null>(null);
  const [error, setError] = useState('');

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0f172a] pt-32 px-8 flex justify-center items-start">
        <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-6 py-4 rounded-lg">
          Access Denied: Please log in.
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError('');
    setSearchResult(null);

    try {
      // Calls the doGet function of your Apps Script
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=search&teamName=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (data.success && data.team) {
        setSearchResult(data.team);
      } else {
        setError('No team found with that name.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data. Ensure your Apps Script has a doGet function.');
    } finally {
      setIsSearching(false);
    }
  };

  // Helper component to render participant blocks
  const ParticipantCard = ({ title, name, roll, phone, mentor, mentorPhone, isLeader = false }: any) => {
    if (!name || name === 'N/A' || name === '') {
      return (
        <div className="bg-[#0b1120] border border-slate-800/60 rounded-xl p-4 flex flex-col gap-2">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</h3>
          <p className="text-slate-600 italic">No details provided</p>
        </div>
      );
    }

    return (
      <div className={`bg-[#0b1120] border ${isLeader ? 'border-blue-500/30' : 'border-slate-800/60'} rounded-xl p-4 flex flex-col gap-3`}>
        <div className="flex items-center gap-2">
          <User className={`w-4 h-4 ${isLeader ? 'text-blue-400' : 'text-slate-400'}`} />
          <h3 className={`text-sm font-bold uppercase tracking-wider ${isLeader ? 'text-blue-400' : 'text-slate-300'}`}>
            {title}
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
          <div><span className="text-slate-500 text-xs block">Name</span><span className="text-slate-200">{name}</span></div>
          <div><span className="text-slate-500 text-xs block">Roll</span><span className="text-slate-200">{roll}</span></div>
          <div><span className="text-slate-500 text-xs block">Phone</span><span className="text-slate-200">{phone}</span></div>
          <div className="col-span-2 border-t border-slate-800/60 mt-2 pt-2"></div>
          <div><span className="text-slate-500 text-xs block">ISMP Mentor</span><span className="text-slate-200">{mentor || 'N/A'}</span></div>
          <div><span className="text-slate-500 text-xs block">Mentor Phone</span><span className="text-slate-200">{mentorPhone || 'N/A'}</span></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f172a] pt-32 pb-16 px-6 sm:px-12 flex flex-col items-center gap-8">
      
      {/* Existing Auth Card */}
      <div className="bg-[#111827] border border-slate-800/80 rounded-3xl p-8 w-full max-w-4xl shadow-2xl">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 shrink-0 rounded-2xl bg-[#1e293b] flex items-center justify-center text-4xl font-bold text-blue-400 border border-slate-700 shadow-[0_0_25px_rgba(59,130,246,0.15)]">
              {getInitials(user?.name || '')}
            </div>
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-blue-900/60 bg-blue-900/20 text-blue-400 text-[13px] font-medium w-fit">
                <ShieldCheck className="w-4 h-4" />
                IITB SSO Authenticated
              </div>
              <h1 className="text-[2.5rem] leading-none font-bold text-white tracking-tight">
                {user?.name}
              </h1>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 mt-4 md:mt-0">
            <span className="text-[11px] font-bold text-slate-400 tracking-[0.2em] uppercase">Account Status</span>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700/80 bg-[#1e293b]/50 text-slate-200 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 text-blue-400" /> Verified Participant
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-slate-800/60 my-8"></div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#0b1120] border border-slate-800/60 rounded-xl p-4 flex flex-col gap-1">
            <Hash className="w-5 h-5 text-blue-500/80 mb-1" />
            <span className="text-[10px] font-bold text-slate-500 tracking-[0.15em] uppercase">Roll Number</span>
            <span className="text-lg font-bold text-white">{user?.roll}</span>
          </div>
          <div className="bg-[#0b1120] border border-slate-800/60 rounded-xl p-4 flex flex-col gap-1">
            <BookOpen className="w-5 h-5 text-blue-500/80 mb-1" />
            <span className="text-[10px] font-bold text-slate-500 tracking-[0.15em] uppercase">Department</span>
            <span className="text-lg font-bold text-white truncate">{user?.department}</span>
          </div>
          <div className="bg-[#0b1120] border border-slate-800/60 rounded-xl p-4 flex flex-col gap-1">
            <GraduationCap className="w-5 h-5 text-blue-500/80 mb-1" />
            <span className="text-[10px] font-bold text-slate-500 tracking-[0.15em] uppercase">Degree</span>
            <span className="text-lg font-bold text-white">{user?.degree || 'B.Tech'}</span>
          </div>
          <div className="bg-[#0b1120] border border-slate-800/60 rounded-xl p-4 flex flex-col gap-1">
            <Calendar className="w-5 h-5 text-blue-500/80 mb-1" />
            <span className="text-[10px] font-bold text-slate-500 tracking-[0.15em] uppercase">Passing Year</span>
            <span className="text-lg font-bold text-white">{user?.passing_year ? `Class of ${user.passing_year}` : 'Class of 2029'}</span>
          </div>
        </div>
      </div>

      {/* NEW: Team Search Dashboard Widget */}
      <div className="bg-[#111827] border border-slate-800/80 rounded-3xl p-8 w-full max-w-4xl shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white tracking-tight">Team Lookup Database</h2>
        </div>

        <form onSubmit={handleSearch} className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter exact Team Name to search..."
              className="w-full bg-[#0b1120] border border-slate-700 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
          <button 
            type="submit"
            disabled={isSearching || !searchQuery}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
          >
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
          </button>
        </form>

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-3 mb-6">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {searchResult && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Found Team</span>
              <h3 className="text-3xl font-bold text-blue-400">{searchResult.teamName}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ParticipantCard 
                title="Participant 1 (Leader)" 
                name={searchResult.leaderName} 
                roll={searchResult.leaderRoll} 
                phone={searchResult.leaderPhone} 
                mentor={searchResult.leaderMentor} 
                mentorPhone={searchResult.leaderMentorPhone}
                isLeader={true}
              />
              <ParticipantCard 
                title="Participant 2" 
                name={searchResult.p2Name} roll={searchResult.p2Roll} phone={searchResult.p2Phone} 
                mentor={searchResult.p2Mentor} mentorPhone={searchResult.p2MentorPhone}
              />
              <ParticipantCard 
                title="Participant 3" 
                name={searchResult.p3Name} roll={searchResult.p3Roll} phone={searchResult.p3Phone} 
                mentor={searchResult.p3Mentor} mentorPhone={searchResult.p3MentorPhone}
              />
              <ParticipantCard 
                title="Participant 4" 
                name={searchResult.p4Name} roll={searchResult.p4Roll} phone={searchResult.p4Phone} 
                mentor={searchResult.p4Mentor} mentorPhone={searchResult.p4MentorPhone}
              />
            </div>

            {/* NEW: Confirmation Status Banner */}
            <div className={`mt-6 flex items-center justify-center p-5 rounded-xl border ${
              searchResult.isConfirmed 
                ? 'bg-green-900/20 border-green-500/40 text-green-400' 
                : 'bg-orange-900/20 border-orange-500/40 text-orange-400'
            }`}>
              {searchResult.isConfirmed ? (
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="text-lg font-bold tracking-widest uppercase">Team Confirmed</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6" />
                  <span className="text-lg font-bold tracking-widest uppercase">Pending Confirmation</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Xlr8Conveners;