import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Users, Hash, Mail, Phone, GraduationCap, ArrowRight, CheckCircle2, AlertCircle, UserCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { MATLAB_SSO_URL } from '../config/sso';

interface MemberData {
  name: string;
  rollNumber: string;
  ldapEmail: string;
  phone: string;
  department: string;
}

interface RegistrationFormData {
  teamName: string;
  member1: MemberData;
  member2: MemberData;
}

type MemberKey = 'member1' | 'member2';
type FieldPath = 'teamName' | `${MemberKey}.${keyof MemberData}`;
type FormErrors = Partial<Record<FieldPath, string>>;

const path = (m: MemberKey, f: keyof MemberData): FieldPath => `${m}.${f}`;

const emptyMember = (): MemberData => ({
  name: '',
  rollNumber: '',
  ldapEmail: '',
  phone: '',
  department: '',
});

const ROLL_RE = /^[a-zA-Z0-9]{6,12}$/;
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@iitb\.ac\.in$/;

// Keeps just the 10 digits (drops spaces, dashes, +91 / 0 prefix)
const normalizePhone = (raw: string): string => {
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits;
};

/*
  Palette (Arrakis at dusk)
  night    #120e24  deep violet sky
  dusk     #3a1b25  horizon glow
  dune     #1a0d0c  foreground sand shadow
  sand     #f1e3c6  text
  spice    #e9a04b  primary accent (melange)
  fremen   #6cc3e8  focus / secondary accent (blue-within-blue)
*/

// Google Apps Script web app URL (ends with /exec)
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyZsla04zm5HtJbLMkFlGCoTb2ug5p6phLK7TySBzBkZyO6EOKeAmdZQwkGRIjI6u3fYg/exec';

// Deterministic star field so it doesn't reshuffle on re-render
const STARS = (() => {
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  return Array.from({ length: 160 }, () => ({
    left: rand() * 100,
    top: rand() * 100,
    size: rand() < 0.12 ? 2.5 : rand() < 0.45 ? 1.8 : 1.2,
    opacity: 0.35 + rand() * 0.65,
    twinkle: rand() < 0.75,
    delay: rand() * 5,
    duration: 2.5 + rand() * 3.5,
  }));
})();

const fontStyles = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Hanken+Grotesk:wght@400;500;600&display=swap');
.dune-heading {
  font-family: 'Cinzel', 'Times New Roman', serif;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1.2;
  padding-bottom: 0.1em;
  background: linear-gradient(180deg, #fff1d0 0%, #f2cd8e 55%, #e9a04b 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}
.dune-body { font-family: 'Hanken Grotesk', system-ui, sans-serif; }
@keyframes dune-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes dune-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(233,160,75,0.35); } 50% { box-shadow: 0 0 0 16px rgba(233,160,75,0); } }
.dune-rise { animation: dune-rise 0.6s ease-out both; }
.dune-pulse { animation: dune-pulse 2.4s ease-out infinite; }
@keyframes dune-twinkle { 0%,100% { opacity: var(--star-o); } 50% { opacity: 0.12; } }
.dune-twinkle { animation: dune-twinkle var(--star-d) ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .dune-rise, .dune-pulse, .dune-twinkle { animation: none; } }
`;

// Craters are placed in % of the moon's size: x/y = top-left, s = diameter
interface Crater { x: number; y: number; s: number }

const Moon: React.FC<{
  className: string;
  background: string;
  glow: string;
  craters: Crater[];
}> = ({ className, background, glow, craters }) => (
  <div
    className={`absolute rounded-full overflow-hidden ${className}`}
    style={{ background, boxShadow: glow }}
  >
    {craters.map((c, i) => (
      <span
        key={i}
        className="absolute rounded-full"
        style={{
          left: `${c.x}%`,
          top: `${c.y}%`,
          width: `${c.s}%`,
          aspectRatio: '1 / 1',
          background:
            'radial-gradient(circle at 60% 60%, rgba(110,84,50,0.42) 0%, rgba(130,100,62,0.3) 65%, rgba(150,120,80,0.12) 100%)',
          boxShadow:
            'inset 1px 1px 2px rgba(70,48,24,0.45), 0.5px 0.5px 1px rgba(255,246,222,0.45)',
        }}
      />
    ))}
    {/* soft shading on one side so the moon reads as a sphere */}
    <span
      className="absolute inset-0 rounded-full"
      style={{
        background:
          'radial-gradient(circle at 30% 30%, transparent 45%, rgba(40,25,20,0.35) 100%)',
      }}
    />
  </div>
);

const BIG_MOON_CRATERS: Crater[] = [
  { x: 18, y: 22, s: 20 },
  { x: 55, y: 14, s: 12 },
  { x: 62, y: 46, s: 24 },
  { x: 28, y: 58, s: 14 },
  { x: 44, y: 72, s: 10 },
  { x: 74, y: 24, s: 8 },
  { x: 12, y: 46, s: 8 },
  { x: 78, y: 70, s: 9 },
];

const SMALL_MOON_CRATERS: Crater[] = [
  { x: 20, y: 25, s: 26 },
  { x: 58, y: 20, s: 16 },
  { x: 50, y: 56, s: 28 },
  { x: 18, y: 62, s: 14 },
];

const DuneBackdrop: React.FC = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    {/* Sky: violet night fading into a burnt horizon */}
    <div
      className="absolute inset-0"
      style={{
        background:
          'linear-gradient(180deg, #0b0919 0%, #120e24 35%, #2a1530 62%, #4a2224 82%, #6b3320 100%)',
      }}
    />

    {/* Stars */}
    <div className="absolute inset-x-0 top-0 h-[75%]">
      {STARS.map((st, idx) => (
        <span
          key={idx}
          className={`absolute rounded-full bg-[#f6ead0] ${st.twinkle ? 'dune-twinkle' : ''}`}
          style={
            {
              left: `${st.left}%`,
              top: `${st.top}%`,
              width: st.size,
              height: st.size,
              opacity: st.opacity,
              boxShadow: st.size > 2 ? '0 0 6px rgba(246,234,208,0.7)' : undefined,
              animationDelay: `${st.delay}s`,
              '--star-o': st.opacity,
              '--star-d': `${st.duration}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>

    {/* Arrakis' two moons */}
    <Moon
      className="top-[15%] right-[12%] h-16 w-16 sm:h-24 sm:w-24"
      background="radial-gradient(circle at 35% 35%, #f6ead0 0%, #d9c39a 55%, #a88d63 100%)"
      glow="0 0 60px rgba(241,227,198,0.25)"
      craters={BIG_MOON_CRATERS}
    />
    <Moon
      className="top-[27%] right-[27%] h-8 w-8 sm:h-11 sm:w-11"
      background="radial-gradient(circle at 35% 35%, #efd9b0 0%, #c4a87a 60%, #8f7650 100%)"
      glow="0 0 30px rgba(241,227,198,0.18)"
      craters={SMALL_MOON_CRATERS}
    />

    {/* Sun-glow on the horizon */}
    <div
      className="absolute bottom-0 left-1/2 h-[420px] w-[900px] -translate-x-1/2 blur-[90px]"
      style={{
        background:
          'radial-gradient(ellipse at 50% 100%, rgba(233,160,75,0.42) 0%, rgba(200,90,40,0.15) 50%, transparent 75%)',
      }}
    />

    {/* Dunes */}
    <svg
      className="absolute bottom-0 left-0 w-full h-[34%] min-h-[180px]"
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
    >
      <path
        d="M0 200 C 180 120, 340 150, 520 190 C 700 230, 820 110, 1020 120 C 1200 130, 1320 190, 1440 150 L1440 320 L0 320 Z"
        fill="#3a1b1c"
        opacity="0.85"
      />
      <path
        d="M0 250 C 220 190, 380 240, 600 230 C 820 220, 960 160, 1160 190 C 1300 210, 1380 240, 1440 230 L1440 320 L0 320 Z"
        fill="#241112"
      />
      <path
        d="M0 290 C 260 250, 480 290, 720 280 C 960 270, 1180 250, 1440 285 L1440 320 L0 320 Z"
        fill="#150a0a"
      />
    </svg>
  </div>
);

const inputBase =
  'w-full rounded-lg border bg-[#120a12]/70 pl-10 pr-4 py-3 text-sm text-[#f1e3c6] placeholder-[#f1e3c6]/30 outline-none transition-colors duration-200 dune-body';
const inputOk = 'border-[#e9a04b]/25 focus:border-[#6cc3e8] focus:ring-2 focus:ring-[#6cc3e8]/25';
const inputErr = 'border-red-400/70 focus:border-red-400 focus:ring-2 focus:ring-red-400/20';

const Matlab: React.FC = () => {
  const { user, isLoggedIn } = useAuth();

  const [formData, setFormData] = useState<RegistrationFormData>({
    teamName: '',
    member1: emptyMember(),
    member2: emptyMember(),
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  // roll = the roll number found in the sheet; fromSubmit = found when submitting (not on page load)
  const [alreadyRegistered, setAlreadyRegistered] = useState<{ roll: string; fromSubmit: boolean } | null>(null);

  // Not logged in (e.g. opened /matlab directly) -> send through ITC SSO
  useEffect(() => {
    if (!isLoggedIn) {
      sessionStorage.setItem('redirectAfterLogin', '/matlab');
      window.location.href = MATLAB_SSO_URL;
    }
  }, [isLoggedIn]);

  // After SSO login, check whether the logged-in roll number is already in the sheet
  // (the script looks in both the Member 1 and Member 2 roll columns)
  useEffect(() => {
    if (!isLoggedIn || !user?.roll) {
      setIsChecking(false);
      return;
    }

    let cancelled = false;
    const roll = user.roll.trim().toUpperCase();

    fetch(`${SCRIPT_URL}?roll=${encodeURIComponent(roll)}`, {
      method: 'GET',
      cache: 'no-store',
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled && data.registered) setAlreadyRegistered({ roll, fromSubmit: false });
      })
      .catch((err) => {
        // If the check fails we still show the form; the script rejects
        // duplicates on submit as well.
        console.error('Failed to check existing registration:', err);
      })
      .finally(() => {
        if (!cancelled) setIsChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, user?.roll]);

  const getValue = (fieldPath: FieldPath): string => {
    if (fieldPath === 'teamName') return formData.teamName;
    const [m, f] = fieldPath.split('.') as [MemberKey, keyof MemberData];
    return formData[m][f];
  };

  const handleChange = (fieldPath: FieldPath, value: string) => {
    setFormData((prev) => {
      if (fieldPath === 'teamName') return { ...prev, teamName: value };
      const [m, f] = fieldPath.split('.') as [MemberKey, keyof MemberData];
      return { ...prev, [m]: { ...prev[m], [f]: value } };
    });
    if (errors[fieldPath]) {
      setErrors((prev) => ({ ...prev, [fieldPath]: undefined }));
    }
  };

  const validateMember = (m: MemberKey, member: MemberData, errs: FormErrors) => {
    if (!member.name.trim()) errs[path(m, 'name')] = 'Please enter the full name.';

    const roll = member.rollNumber.trim();
    if (!roll) errs[path(m, 'rollNumber')] = 'Roll number is required.';
    else if (!ROLL_RE.test(roll)) errs[path(m, 'rollNumber')] = 'Enter a valid IITB roll number (e.g., 25B1042).';

    const email = member.ldapEmail.trim().toLowerCase();
    if (!email) errs[path(m, 'ldapEmail')] = 'LDAP email is required.';
    else if (!EMAIL_RE.test(email)) errs[path(m, 'ldapEmail')] = 'Use the official @iitb.ac.in LDAP email.';

    if (!member.phone.trim()) errs[path(m, 'phone')] = 'Phone number is required.';
    else if (!/^[6-9]\d{9}$/.test(normalizePhone(member.phone))) errs[path(m, 'phone')] = 'Enter a valid 10-digit phone number.';

    if (!member.department.trim()) errs[path(m, 'department')] = 'Please enter the department.';
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.teamName.trim()) newErrors.teamName = 'Please enter a team name.';

    validateMember('member1', formData.member1, newErrors);
    validateMember('member2', formData.member2, newErrors);

    const r1 = formData.member1.rollNumber.trim().toUpperCase();
    const r2 = formData.member2.rollNumber.trim().toUpperCase();
    if (r1 && r1 === r2 && !newErrors['member2.rollNumber']) {
      newErrors['member2.rollNumber'] = 'Both members must have different roll numbers.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const cleanMember = (m: MemberData): MemberData => ({
    name: m.name.trim(),
    rollNumber: m.rollNumber.trim().toUpperCase(),
    ldapEmail: m.ldapEmail.trim().toLowerCase(),
    phone: normalizePhone(m.phone),
    department: m.department.trim(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const payload: RegistrationFormData = {
      teamName: formData.teamName.trim(),
      member1: cleanMember(formData.member1),
      member2: cleanMember(formData.member2),
    };

    try {
      // text/plain avoids a CORS preflight, which Apps Script web apps don't handle
      const res = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      if (result.error === 'ALREADY_REGISTERED') {
        setAlreadyRegistered({ roll: String(result.roll || ''), fromSubmit: true });
        return;
      }
      if (!result.success) throw new Error(result.error || 'Sheet write failed');

      setFormData(payload);
      setIsSubmitted(true);
    } catch (err) {
      console.error('MATLAB registration failed:', err);
      setIsFailed(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setIsFailed(false);
  };

  const renderField = (
    fieldPath: FieldPath,
    label: string,
    Icon: React.ElementType,
    placeholder: string,
    type: string = 'text',
    extraClass: string = ''
  ) => (
    <div>
      <label htmlFor={fieldPath} className="block text-sm font-medium text-[#f1e3c6]/85 mb-2 dune-body">
        {label}
      </label>
      <div className="relative">
        <Icon
          size={17}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#e9a04b]/70 pointer-events-none"
        />
        <input
          id={fieldPath}
          type={type}
          placeholder={placeholder}
          value={getValue(fieldPath)}
          onChange={(e) => handleChange(fieldPath, e.target.value)}
          aria-invalid={!!errors[fieldPath]}
          className={`${inputBase} ${errors[fieldPath] ? inputErr : inputOk} ${extraClass}`}
        />
      </div>
      {errors[fieldPath] && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-300 dune-body">
          <AlertCircle size={13} /> {errors[fieldPath]}
        </p>
      )}
    </div>
  );

  const renderMember = (m: MemberKey, title: string) => (
    <div className="space-y-5">
      <h2 className="dune-body text-sm font-semibold tracking-wide text-[#e9a04b] border-b border-[#e9a04b]/20 pb-2">
        {title}
      </h2>
      {renderField(path(m, 'name'), 'Full name', User, 'Aarav Sharma')}
      <div className="grid gap-5 sm:grid-cols-2">
        {renderField(path(m, 'rollNumber'), 'Roll number', Hash, '25B1042', 'text', 'uppercase placeholder:normal-case')}
        {renderField(path(m, 'ldapEmail'), 'LDAP email', Mail, '25b1042@iitb.ac.in', 'email')}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {renderField(path(m, 'phone'), 'Phone number', Phone, '9876543210', 'tel')}
        {renderField(path(m, 'department'), 'Department', GraduationCap, 'e.g. Mechanical Engineering')}
      </div>
    </div>
  );

  /* ---------- Waiting for SSO redirect ---------- */
  if (!isLoggedIn) {
    return (
      <section className="relative min-h-screen w-full flex items-center justify-center px-4 overflow-hidden text-[#f1e3c6]">
        <style>{fontStyles}</style>
        <DuneBackdrop />
        <p className="relative z-10 dune-body text-[#f1e3c6]/70">Redirecting to IITB SSO...</p>
      </section>
    );
  }

  /* ---------- Checking existing registration ---------- */
  if (isChecking) {
    return (
      <section className="relative min-h-screen w-full flex items-center justify-center px-4 overflow-hidden text-[#f1e3c6]">
        <style>{fontStyles}</style>
        <DuneBackdrop />
        <p className="relative z-10 dune-body text-[#f1e3c6]/70">Checking your registration...</p>
      </section>
    );
  }

  /* ---------- Already registered page ---------- */
  if (alreadyRegistered) {
    const isSelf =
      !!alreadyRegistered.roll &&
      alreadyRegistered.roll.toUpperCase() === (user?.roll ?? '').trim().toUpperCase();

    return (
      <section className="relative min-h-screen w-full flex items-center justify-center px-4 pt-36 pb-16 sm:pt-40 overflow-hidden text-[#f1e3c6]">
        <style>{fontStyles}</style>
        <DuneBackdrop />

        <div className="relative z-10 w-full max-w-md text-center dune-rise">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#6cc3e8]/50 bg-[#6cc3e8]/10 text-[#6cc3e8]">
            <UserCheck size={38} />
          </div>

          <h1 className="dune-heading text-3xl sm:text-5xl mb-3">
            Already registered
          </h1>
          <p className="dune-body text-[#f1e3c6]/70 mb-8">
            {isSelf ? (
              <>
                <span className="text-[#e9a04b] font-semibold">{user?.name}</span>
                {` (${user?.roll}), you're already registered for the MATLAB bootcamp as part of a team. No need to register again.`}
              </>
            ) : alreadyRegistered.roll ? (
              <>
                <span className="text-[#e9a04b] font-semibold">{alreadyRegistered.roll}</span>
                {' is already registered with a team. Each person can only be in one team. If this looks wrong, please contact a convener.'}
              </>
            ) : (
              'One of the roll numbers you entered is already registered with a team. If this looks wrong, please contact a convener.'
            )}
          </p>

          {alreadyRegistered.fromSubmit ? (
            <button
              type="button"
              onClick={() => setAlreadyRegistered(null)}
              className="dune-body text-sm text-[#6cc3e8] hover:text-[#9fdcf5] underline underline-offset-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6cc3e8]/50 rounded"
            >
              Go back to the form
            </button>
          ) : (
            <Link
              to="/"
              className="dune-body inline-block text-sm text-[#6cc3e8] hover:text-[#9fdcf5] underline underline-offset-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6cc3e8]/50 rounded"
            >
              Back to home
            </Link>
          )}
        </div>
      </section>
    );
  }

  /* ---------- Registration failed page ---------- */
  if (isFailed) {
    return (
      <section className="relative min-h-screen w-full flex items-center justify-center px-4 pt-36 pb-16 sm:pt-40 overflow-hidden text-[#f1e3c6]">
        <style>{fontStyles}</style>
        <DuneBackdrop />

        <div className="relative z-10 w-full max-w-md text-center dune-rise">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-red-400/50 bg-red-500/10 text-red-300">
            <AlertCircle size={38} />
          </div>

          <h1 className="dune-heading text-3xl sm:text-5xl mb-3">
            Registration failed
          </h1>
          <p className="dune-body text-[#f1e3c6]/70 mb-8">
            We couldn't save your details. Please contact a convener to complete your registration.
          </p>

          <button
            type="button"
            onClick={handleRetry}
            className="dune-body text-sm text-[#6cc3e8] hover:text-[#9fdcf5] underline underline-offset-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6cc3e8]/50 rounded"
          >
            Go back to the form
          </button>
        </div>
      </section>
    );
  }

  /* ---------- Registration completed page (form is gone) ---------- */
  if (isSubmitted) {
    return (
      <section className="relative min-h-screen w-full flex items-center justify-center px-4 pt-36 pb-16 sm:pt-40 overflow-hidden text-[#f1e3c6]">
        <style>{fontStyles}</style>
        <DuneBackdrop />

        <div className="relative z-10 w-full max-w-md text-center dune-rise">
          <div className="dune-pulse mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#e9a04b]/50 bg-[#e9a04b]/10 text-[#e9a04b]">
            <CheckCircle2 size={38} />
          </div>

          <h1 className="dune-heading text-3xl sm:text-5xl mb-3">
            Registration completed
          </h1>
          <p className="dune-body text-[#f1e3c6]/70 mb-8">
            Team <span className="text-[#e9a04b] font-semibold">{formData.teamName}</span> is registered for the MATLAB bootcamp.
            See you there.
          </p>

          <div className="rounded-2xl border border-[#e9a04b]/25 bg-[#120a12]/70 backdrop-blur-md p-5 text-left text-sm space-y-3 dune-body shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between gap-4">
              <span className="text-[#f1e3c6]/50">Team name</span>
              <span className="text-[#f1e3c6] text-right">{formData.teamName}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#f1e3c6]/50">Member 1</span>
              <span className="text-[#f1e3c6] text-right">
                {formData.member1.name} <span className="font-mono text-[#f1e3c6]/60">({formData.member1.rollNumber})</span>
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#f1e3c6]/50">Member 2</span>
              <span className="text-[#f1e3c6] text-right">
                {formData.member2.name} <span className="font-mono text-[#f1e3c6]/60">({formData.member2.rollNumber})</span>
              </span>
            </div>
          </div>

          <Link
            to="/"
            className="dune-body mt-6 inline-block text-sm text-[#6cc3e8] hover:text-[#9fdcf5] underline underline-offset-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6cc3e8]/50 rounded"
          >
            Back to home
          </Link>
        </div>
      </section>
    );
  }

  /* ---------- Registration form ---------- */
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center px-4 pt-36 pb-16 sm:pt-40 overflow-hidden text-[#f1e3c6]">
      <style>{fontStyles}</style>
      <DuneBackdrop />

      <div className="relative z-10 w-full max-w-2xl dune-rise">
        <div className="text-center mb-8">
          <h1 className="dune-heading text-3xl sm:text-5xl">
            MATLAB Bootcamp Registration
          </h1>

          <p className="dune-body text-[#f1e3c6]/65 text-sm sm:text-base max-w-md mx-auto mt-4">
            Register your team of two for the MATLAB bootcamp.
          </p>
        </div>

        <div className="rounded-2xl border border-[#e9a04b]/25 bg-[#150c14]/75 backdrop-blur-md p-6 sm:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.6)]">
          <form onSubmit={handleSubmit} noValidate className="space-y-8">
            {renderField('teamName', 'Team name', Users, 'e.g. Matrix Mavericks')}

            {renderMember('member1', 'First member')}
            {renderMember('member2', 'Second member')}

            <button
              type="submit"
              disabled={isSubmitting}
              className="dune-body w-full mt-2 py-3.5 px-6 rounded-lg font-semibold text-sm text-[#1a0d0c]
                bg-gradient-to-r from-[#f3c277] via-[#e9a04b] to-[#d9763a]
                hover:from-[#f7cf8f] hover:to-[#e58a45]
                shadow-[0_0_28px_rgba(233,160,75,0.3)] hover:shadow-[0_0_38px_rgba(233,160,75,0.5)]
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6cc3e8]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#150c14]
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#1a0d0c]/30 border-t-[#1a0d0c] rounded-full animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Register for MATLAB</span>
                  <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Matlab;