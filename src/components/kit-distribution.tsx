import React, { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { CheckSquare, Square, Package, Send, User, Users, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

// Replace with your actual script URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxWhfkYMs2Y4wQ5eaPVl2dSI9vbbyEyyka1n_PdIOYEx14ERiJgeLYtThtrpecTuRf3/exec";
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

export default function KitDistribution() {
  const { user } = useAuth();
  
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(
    kitItems.reduce((acc, item) => ({ ...acc, [item.id]: false }), {})
  );
  
  const [teamName, setTeamName] = useState<string>('');
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(true);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [isTeamLeader, setIsTeamLeader] = useState<boolean | null>(null);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchStatus = async () => {
      try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          redirect: 'follow',
          body: JSON.stringify({
            action: 'fetchStatus',
            rollNumber: user.roll,
          }),
        });

        const result = await response.json();

        console.log("🚨 SERVER RESPONSE:", result);
        
        if (result.success === true && result.teamName && result.teamName !== "Team Not Found") {
          setTeamName(result.teamName);
          setIsTeamLeader(true); 
          
          if (result.isConfirmed) {
            setIsConfirmed(true);
            if (result.confirmedData) {
              setCheckedItems(result.confirmedData.items);
            }
          }
        } else {
          setIsTeamLeader(false);
          if (result.message) console.error("Auth Blocked Reason:", result.message);
        }
      } catch (error) {
        console.error("Failed to fetch kit status:", error);
        setIsTeamLeader(false);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    fetchStatus();
  }, [user]);

  const handleToggle = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAll = () => {
    const allSelected = Object.values(checkedItems).every(Boolean);
    const newState = kitItems.reduce((acc, item) => ({ ...acc, [item.id]: !allSelected }), {});
    setCheckedItems(newState);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);
    
    const payload = {
      action: "kitDistribution",
      rollNumber: user?.roll,
      items: checkedItems
    };

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        redirect: 'follow',
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        setIsConfirmed(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert(`Submission failed: ${result.message || result.error}`);
      }
    } catch (error) {
      alert('An error occurred while communicating with the server.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-200">
        <p>Please log in via SSO to access Kit Distribution.</p>
      </div>
    );
  }

  if (isCheckingStatus) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-200 space-y-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium">Verifying Team Leader Status...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans pb-24 pt-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 border-b border-slate-800 pb-6 text-center">
          <h1 className="text-3xl font-bold text-slate-100">
            Electrical Kit Distribution
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Verify and confirm hardware items for your team.</p>
        </div>

        {isTeamLeader !== true ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 max-w-md mx-auto text-center shadow-lg mt-12">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-100 mb-2">Access Denied</h2>
            <p className="text-slate-400 text-sm mb-6">
              Only the registered <span className="text-white font-bold">Team Leader</span> is allowed to fill the kit distribution form.
            </p>
            <div className="px-4 py-3 bg-slate-900 rounded text-sm font-mono text-slate-400 border border-slate-700">
              Authenticated as: <span className="text-slate-200">{user.roll}</span>
            </div>
          </div>
        ) : isConfirmed ? (
          /* ALREADY CONFIRMED STATE */
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col items-center text-center border-b border-slate-700 pb-8 mb-8">
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-slate-100 mb-2">Distribution Confirmed</h2>
              <p className="text-slate-400">
                Team <span className="text-slate-200 font-semibold">{teamName}</span> has successfully claimed their hardware kit.
              </p>
              <div className="mt-4 px-4 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-slate-400 font-mono">
                Issued to: <span className="text-slate-200">{user.roll}</span>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-slate-400" /> Recorded Components
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {kitItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-md bg-slate-900/50 border border-slate-800">
                  {checkedItems[item.id] ? (
                    <CheckSquare className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-600" />
                  )}
                  <span className={checkedItems[item.id] ? 'text-slate-300 text-sm' : 'text-slate-600 text-sm line-through'}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* DISTRIBUTION FORM STATE */
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center gap-5">
              <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-slate-400 shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
                  <Users className="w-3.5 h-3.5" /> 
                  {teamName}
                </div>
                <p className="text-slate-100 font-bold text-lg leading-tight">
                  {user?.name || "Loading..."}
                </p>
                <p className="text-slate-400 text-sm mt-0.5">
                  {user?.roll ? `${user.roll} • ${user.department} • ${user.degree}` : "Fetching details..."}
                </p>
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-900/50 rounded-lg p-4 flex gap-3 text-yellow-500/90">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed">
                <strong className="font-semibold text-yellow-500">Notice:</strong> Please verify all hardware components carefully. If any component is missing, inform the conveners immediately before submitting this form.
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-slate-400" />
                  <h2 className="text-lg font-bold text-slate-100">Components</h2>
                </div>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors bg-slate-700/50 hover:bg-slate-700 px-3 py-1.5 rounded"
                >
                  {Object.values(checkedItems).every(Boolean) ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {kitItems.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-md cursor-pointer border transition-colors select-none ${
                      checkedItems[item.id]
                        ? 'bg-blue-900/20 border-blue-900/50 text-blue-100'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800 hover:border-slate-700'
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
                      checked={checkedItems[item.id]}
                      onChange={() => handleToggle(item.id)}
                    />
                    <span className="text-sm font-medium">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white font-medium transition-colors"
              >
                {loading ? 'Confirming...' : 'Submit Confirmation'}
                <Send className="w-4 h-4" />
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}