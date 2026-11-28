import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Users, Hash, Mail, Phone, GraduationCap, ArrowRight, CheckCircle2, AlertCircle, UserCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { MATLAB_SSO_URL } from '../config/sso';

// Assets live in src/assets. Importing them lets the bundler give a real URL,
// which is required for the font to load from inside the injected <style>.
import posterImg from '../assets/Matlab_bootcamp_poster.png';
import duneRiseFont from '../assets/Dune_Rise.ttf';

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
  Palette (sampled from the "Dune & Dusted" poster)
  space    #000000  poster background
  gold     #f2a516  title text / primary accent
  ember    #ec5a24  peak orange
  sun      #ffe2a6  sun glow / light text accent
  matlab   #2f9bf0  peak blue / focus accent
  sand     #f6ead0  body text
*/

// Google Apps Script web app URL (ends with /exec)
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyZsla04zm5HtJbLMkFlGCoTb2ug5p6phLK7TySBzBkZyO6EOKeAmdZQwkGRIjI6u3fYg/exec';

const POSTER_URL = posterImg;

const fontStyles = `
@import url('https://fonts.googleapis.com/css2?family=Michroma&family=Quicksand:wght@400;500;600;700&display=swap');

/* The poster title is set in "Dune Rise". The URL comes from the bundler via the
   import above, so it resolves correctly. Until the file is present the browser
   falls back to Michroma (closest Google Font). */
@font-face {
  font-family: 'Dune Rise';
  src: url('${duneRiseFont}') format('truetype');
  font-display: swap;
}

.dune-heading {
  font-family: 'Dune Rise', 'Michroma', system-ui, sans-serif;
  font-weight: 400;
  letter-spacing: 0.08em;
  line-height: 1.25;
  color: #f2a516;
}
.dune-body { font-family: 'Quicksand', system-ui, sans-serif; }

/* Height of your site navbar, so the form can clear it. Change to match yours. */
:root { --header-h: 1rem; }

/* Solid base colour; also what shows behind a transparent navbar. */
.poster-section { background-color: #000; }

/* Tablet / desktop: PIN the poster.
   background-attachment: fixed locks the poster to the viewport, so it stays
   perfectly still while the form scrolls over it. The background is painted
   only inside this section, so it never reaches the footer — when the form
   ends, the footer scrolls in normally. The source is 16:9, so "cover" shows
   almost the whole poster on a laptop. */
@media (min-width: 768px) {
  .poster-section {
    background-image: url('${POSTER_URL}');
    background-repeat: no-repeat;
    background-position: center var(--header-h);
    background-size: cover;
    background-attachment: fixed;
  }
}

/* Start the form well below the poster title (the title sits in the top ~25% of
   the screen). On scroll, the translucent card slides up over the pinned art. */
.poster-content { padding-top: calc(var(--header-h) + 26vh); }

/* Phones ignore background-attachment: fixed, so there the poster is a normal
   element at the top (.poster-mobile) and the form starts just below its title. */
@media (max-width: 767px) {
  .poster-content { padding-top: calc(var(--header-h) + 20vw); }
}

@keyframes dune-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes dune-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(242,165,22,0.35); } 50% { box-shadow: 0 0 0 16px rgba(242,165,22,0); } }
.dune-rise { animation: dune-rise 0.6s ease-out both; }
.dune-pulse { animation: dune-pulse 2.4s ease-out infinite; }
@media (prefers-reduced-motion: reduce) { .dune-rise, .dune-pulse { animation: none; } }
`;

/*
  Shared page shell with a PINNED poster.

  On tablet/desktop the poster is the section's own background with
  background-attachment: fixed (see .poster-section). That locks it to the
  viewport — it stays dead still while the form scrolls over it, there is no
  black gap behind the form, and it is clipped to this section so the footer
  below is never covered. When the form ends, scrolling becomes normal again.

  On phones (where fixed backgrounds are unreliable) the poster is instead a
  normal element at the top that simply scrolls away.
*/
const PosterShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <section className="poster-section relative min-h-screen w-full text-[#f6ead0]">
    <style>{fontStyles}</style>

    {/* Phone-only poster at the top */}
    <div
      className="poster-mobile md:hidden pointer-events-none absolute inset-x-0 top-0 z-0 bg-no-repeat bg-top bg-[length:100%_auto]"
      style={{ backgroundImage: `url(${POSTER_URL})`, height: '56.22vw' }}
      aria-hidden="true"
    >
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-black" />
    </div>

    {/* Form content, above the poster */}
    <div className="poster-content relative z-10 flex items-start justify-center lg:justify-start px-4 pb-16">
      <div className="w-full max-w-xl lg:max-w-none lg:w-[min(44vw,38rem)] lg:ml-[15vw]">
        {children}
      </div>
    </div>
  </section>
);

const inputBase =
  'w-full rounded-lg border bg-black/55 pl-10 pr-4 py-3 text-sm text-[#f6ead0] placeholder-[#f6ead0]/30 outline-none transition-colors duration-200 dune-body';
const inputOk = 'border-[#f2a516]/25 focus:border-[#2f9bf0] focus:ring-2 focus:ring-[#2f9bf0]/30';
const inputErr = 'border-red-400/70 focus:border-red-400 focus:ring-2 focus:ring-red-400/20';

const linkClass =
  'dune-body text-sm text-[#2f9bf0] hover:text-[#7cc0f7] underline underline-offset-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2f9bf0]/50 rounded';

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
      <label htmlFor={fieldPath} className="block text-sm font-semibold text-[#f6ead0]/85 mb-2 dune-body">
        {label}
      </label>
      <div className="relative">
        <Icon
          size={17}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#f2a516]/75 pointer-events-none"
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
      <h2 className="dune-heading text-sm border-b border-[#f2a516]/20 pb-2">
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

  const cardClass =
    'rounded-2xl border border-[#f2a516]/25 bg-black/60 backdrop-blur-md shadow-[0_24px_70px_rgba(0,0,0,0.7)]';

  /* ---------- Waiting for SSO redirect ---------- */
  if (!isLoggedIn) {
    return (
      <PosterShell>
        <p className="dune-body text-center text-[#f6ead0]/75">Redirecting to IITB SSO...</p>
      </PosterShell>
    );
  }

  /* ---------- Checking existing registration ---------- */
  if (isChecking) {
    return (
      <PosterShell>
        <p className="dune-body text-center text-[#f6ead0]/75">Checking your registration...</p>
      </PosterShell>
    );
  }

  /* ---------- Already registered page ---------- */
  if (alreadyRegistered) {
    const isSelf =
      !!alreadyRegistered.roll &&
      alreadyRegistered.roll.toUpperCase() === (user?.roll ?? '').trim().toUpperCase();

    return (
      <PosterShell>
        <div className={`${cardClass} p-8 text-center dune-rise`}>
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#2f9bf0]/50 bg-[#2f9bf0]/10 text-[#2f9bf0]">
            <UserCheck size={38} />
          </div>

          <h1 className="dune-heading text-2xl sm:text-3xl mb-3">Already registered</h1>
          <p className="dune-body text-[#f6ead0]/75 mb-8">
            {isSelf ? (
              <>
                <span className="text-[#f2a516] font-semibold">{user?.name}</span>
                {` (${user?.roll}), you're already registered for the MATLAB bootcamp as part of a team. No need to register again.`}
              </>
            ) : alreadyRegistered.roll ? (
              <>
                <span className="text-[#f2a516] font-semibold">{alreadyRegistered.roll}</span>
                {' is already registered with a team. Each person can only be in one team. If this looks wrong, please contact a convener.'}
              </>
            ) : (
              'One of the roll numbers you entered is already registered with a team. If this looks wrong, please contact a convener.'
            )}
          </p>

          {alreadyRegistered.fromSubmit ? (
            <button type="button" onClick={() => setAlreadyRegistered(null)} className={linkClass}>
              Go back to the form
            </button>
          ) : (
            <Link to="/" className={`${linkClass} inline-block`}>
              Back to home
            </Link>
          )}
        </div>
      </PosterShell>
    );
  }

  /* ---------- Registration failed page ---------- */
  if (isFailed) {
    return (
      <PosterShell>
        <div className={`${cardClass} p-8 text-center dune-rise`}>
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-red-400/50 bg-red-500/10 text-red-300">
            <AlertCircle size={38} />
          </div>

          <h1 className="dune-heading text-2xl sm:text-3xl mb-3">Registration failed</h1>
          <p className="dune-body text-[#f6ead0]/75 mb-8">
            We couldn't save your details. Please contact a convener to complete your registration.
          </p>

          <button type="button" onClick={handleRetry} className={linkClass}>
            Go back to the form
          </button>
        </div>
      </PosterShell>
    );
  }

  /* ---------- Registration completed page (form is gone) ---------- */
  if (isSubmitted) {
    return (
      <PosterShell>
        <div className={`${cardClass} p-8 text-center dune-rise`}>
          <div className="dune-pulse mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#f2a516]/50 bg-[#f2a516]/10 text-[#f2a516]">
            <CheckCircle2 size={38} />
          </div>

          <h1 className="dune-heading text-2xl sm:text-3xl mb-3">Registration completed</h1>
          <p className="dune-body text-[#f6ead0]/75 mb-8">
            Team <span className="text-[#f2a516] font-semibold">{formData.teamName}</span> is registered for the MATLAB bootcamp.
            See you there.
          </p>

          <div className="rounded-xl border border-[#f2a516]/20 bg-black/50 p-5 text-left text-sm space-y-3 dune-body">
            <div className="flex justify-between gap-4">
              <span className="text-[#f6ead0]/55">Team name</span>
              <span className="text-[#f6ead0] text-right">{formData.teamName}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#f6ead0]/55">Member 1</span>
              <span className="text-[#f6ead0] text-right">
                {formData.member1.name} <span className="text-[#f6ead0]/60">({formData.member1.rollNumber})</span>
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#f6ead0]/55">Member 2</span>
              <span className="text-[#f6ead0] text-right">
                {formData.member2.name} <span className="text-[#f6ead0]/60">({formData.member2.rollNumber})</span>
              </span>
            </div>
          </div>

          <Link to="/" className={`${linkClass} mt-6 inline-block`}>
            Back to home
          </Link>
        </div>
      </PosterShell>
    );
  }

  /* ---------- Registration form ---------- */
  return (
    <PosterShell>
      <div className={`${cardClass} p-6 sm:p-8 dune-rise`}>
        {/* The poster already carries the event title, so the card only names the task */}
        <div className="mb-7 text-center">
          <h1 className="dune-heading text-xl sm:text-2xl">Team registration</h1>
          <p className="dune-body text-[#f6ead0]/70 text-sm mt-2">
            Register your team of two for the bootcamp.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          {renderField('teamName', 'Team name', Users, 'e.g. Matrix Mavericks')}

          {renderMember('member1', 'First member')}
          {renderMember('member2', 'Second member')}

          <button
            type="submit"
            disabled={isSubmitting}
            className="dune-body w-full mt-2 py-3.5 px-6 rounded-lg font-bold text-sm text-black
              bg-gradient-to-r from-[#ffcf5a] via-[#f2a516] to-[#ec5a24]
              hover:from-[#ffd97a] hover:to-[#f26a35]
              shadow-[0_0_28px_rgba(242,165,22,0.3)] hover:shadow-[0_0_38px_rgba(242,165,22,0.5)]
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2f9bf0]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black
              disabled:opacity-60 disabled:cursor-not-allowed
              transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
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
    </PosterShell>
  );
};

export default Matlab;