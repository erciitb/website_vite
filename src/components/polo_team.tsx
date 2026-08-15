import React, { useState, FormEvent } from 'react';
import {
  User,
  Hash,
  Phone,
  UserCheck,
  HelpCircle,
  Users,
  Send,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

// REPLACE THIS WITH YOUR NEW GOOGLE SCRIPT URL
const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzsfUSwct4FuRd71B7I1DEzQnEkSDY9ydJi-VJ8H8B5bws3CqGHuI8K60QAELinBRj-/exec';

export default function TeammateFinder() {
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    phone: '',
    mentorName: '',
    mentorPhone: '',

    // Vibe Check Questions
    q1_zombie: '',
    q2_aliens: '',
    q3_giraffe: '',
    q4_conspiracy: '',
    q5_food_crime: '',

    teammatesNeeded: '1',
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    let { name, value } = e.target;

    // Automatically uppercase roll number
    if (name === 'rollNumber') {
      value = value.toUpperCase();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Check registration status once roll number loses focus
  const handleRollNumberBlur = async () => {
    const roll = formData.rollNumber.trim();

    if (!roll || roll.length < 3) return;

    setIsCheckingStatus(true);

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        redirect: 'follow',
        body: JSON.stringify({
          action: 'checkStatus',
          rollNumber: roll,
        }),
      });

      const result = await response.json();

      if (result.success && result.isRegistered) {
        setIsAlreadyRegistered(true);
      } else {
        setIsAlreadyRegistered(false);
      }
    } catch (err) {
      console.error('Failed to check registration status:', err);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError('');

    // Strict validation
    if (!formData.rollNumber.startsWith('26B')) {
      setError(
        'Registration restricted: Roll number must start with "26B".'
      );

      setIsSubmitting(false);

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      return;
    }

    try {
      const payload = {
        action: 'submitForm',
        ...formData,
      };

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        redirect: 'follow',
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);

        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      } else {
        setError(
          `Submission failed: ${
            result.message || 'Unknown error'
          }`
        );

        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
    } catch (err) {
      console.error(err);

      setError(
        'A network error occurred. Please try submitting again.'
      );

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // ALREADY REGISTERED SCREEN
  // ============================================================

  if (isAlreadyRegistered) {
    return (
      <div className="min-h-screen bg-[#0f172a] pt-32 pb-16 px-6 flex justify-center items-start">
        <div className="bg-[#111827] border border-slate-800/80 rounded-3xl p-10 w-full max-w-2xl shadow-2xl text-center animate-in fade-in slide-in-from-bottom-4">
          <div className="w-20 h-20 bg-blue-500/20 border border-blue-500/50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-400">
            <Users className="w-10 h-10" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">
            Request Already Submitted
          </h2>

          <p className="text-slate-400 text-lg leading-relaxed">
            You have already submitted a request for teammate matching.
            Our team is currently reviewing your preferences and will
            reach out to you once a suitable team has been identified.
          </p>

          <div className="mt-8 px-4 py-3 bg-[#0b1120] border border-slate-800 rounded-xl text-sm font-mono text-slate-400 inline-block">
            Registered Roll Number:{' '}
            <span className="text-slate-200">
              {formData.rollNumber}
            </span>
          </div>

          <button
            onClick={() => {
              setIsAlreadyRegistered(false);
              setFormData((prev) => ({
                ...prev,
                rollNumber: '',
              }));
            }}
            className="mt-6 block mx-auto text-sm text-blue-400 hover:text-blue-300 underline"
          >
            Use a different roll number
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // SUCCESS SCREEN
  // ============================================================

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#0f172a] pt-32 pb-16 px-6 flex justify-center items-start">
        <div className="bg-[#111827] border border-slate-800/80 rounded-3xl p-10 w-full max-w-2xl shadow-2xl text-center animate-in fade-in slide-in-from-bottom-4">
          <div className="w-20 h-20 bg-green-500/20 border border-green-500/50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">
            Registration Successful
          </h2>

          <p className="text-slate-400 text-lg leading-relaxed">
            Your registration has been successfully recorded. We will
            review your responses and pair you with a suitable team
            based on your profile and preferences. Our team will
            contact you shortly.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN FORM
  // ============================================================

  return (
    <div className="min-h-screen bg-[#0f172a] pt-28 pb-24 px-4 sm:px-6 lg:px-8 font-sans text-slate-200">
      <div className="max-w-4xl mx-auto">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-bold tracking-widest uppercase mb-4">
            <Sparkles className="w-4 h-4" />
            Matchmaking Protocol
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Solo Participant Registration
          </h1>

          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Looking for a squad? Fill out your details and answer a few
            quick questions so we can find your perfect match.
          </p>
        </div>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-3 mb-8 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0" />

            <p className="text-sm font-medium">
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ====================================================
              SECTION 1: PERSONAL INFORMATION
          ==================================================== */}

          <div className="bg-[#111827] border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
              <User className="w-6 h-6 text-blue-400" />

              <h2 className="text-2xl font-bold text-white">
                Personal Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* FULL NAME */}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Full Name
                </label>

                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

                  <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full bg-[#0b1120] border border-slate-700/80 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* ROLL NUMBER */}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Roll Number
                </label>

                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

                  <input
                    required
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    onBlur={handleRollNumberBlur}
                    type="text"
                    placeholder="26B..."
                    pattern="^26[bB].*"
                    title='Roll number must start with "26B"'
                    className="w-full bg-[#0b1120] border border-slate-700/80 text-white rounded-xl py-3 pl-12 pr-12 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />

                  {isCheckingStatus && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 animate-spin" />
                  )}
                </div>
              </div>

              {/* PHONE */}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Phone Number
                </label>

                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

                  <input
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    type="tel"
                    placeholder="Enter phone number"
                    className="w-full bg-[#0b1120] border border-slate-700/80 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="md:col-span-2 border-t border-slate-800/60 my-2"></div>

              {/* MENTOR NAME */}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  ISMP Mentor Name
                </label>

                <div className="relative">
                  <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

                  <input
                    required
                    name="mentorName"
                    value={formData.mentorName}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter mentor name"
                    className="w-full bg-[#0b1120] border border-slate-700/80 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* MENTOR PHONE */}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  ISMP Mentor Phone
                </label>

                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

                  <input
                    required
                    name="mentorPhone"
                    value={formData.mentorPhone}
                    onChange={handleChange}
                    type="tel"
                    placeholder="Enter mentor phone"
                    className="w-full bg-[#0b1120] border border-slate-700/80 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* ====================================================
              SECTION 2: VIBE CHECK
          ==================================================== */}

          <div className="bg-[#111827] border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">

            <div className="flex items-center gap-3 mb-2">
              <HelpCircle className="w-6 h-6 text-purple-400" />

              <h2 className="text-2xl font-bold text-white">
                Quick Vibe Check
              </h2>
            </div>

            <p className="text-slate-400 text-sm mb-8 pb-4 border-b border-slate-800">
              No right answers here 😎 Pick what feels most like you.
              We'll use your choices to get a sense of your squad
              compatibility.
            </p>

            <div className="space-y-8">

              {/* QUESTION 1 */}

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-200 block">
                  1. Spider-Man 🕷️ or Batman 🦇?
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  <label
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      formData.q1_zombie === 'Spider-Man'
                        ? 'border-purple-500 bg-purple-500/10 text-white'
                        : 'border-slate-700/80 bg-[#0b1120] text-slate-300 hover:border-purple-500/50'
                    }`}
                  >
                    <input
                      required
                      type="radio"
                      name="q1_zombie"
                      value="Spider-Man"
                      checked={formData.q1_zombie === 'Spider-Man'}
                      onChange={handleChange}
                      className="sr-only"
                    />

                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🕷️</span>
                      <span className="font-semibold">
                        Spider-Man
                      </span>
                    </div>
                  </label>

                  <label
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      formData.q1_zombie === 'Batman'
                        ? 'border-purple-500 bg-purple-500/10 text-white'
                        : 'border-slate-700/80 bg-[#0b1120] text-slate-300 hover:border-purple-500/50'
                    }`}
                  >
                    <input
                      required
                      type="radio"
                      name="q1_zombie"
                      value="Batman"
                      checked={formData.q1_zombie === 'Batman'}
                      onChange={handleChange}
                      className="sr-only"
                    />

                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🦇</span>
                      <span className="font-semibold">
                        Batman
                      </span>
                    </div>
                  </label>

                </div>
              </div>

              {/* QUESTION 2 */}

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-200 block">
                  2. Your bot suddenly stops working. You…
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {[
                    {
                      value: 'Start debugging',
                      emoji: '🔧',
                      text: 'Start debugging',
                    },
                    {
                      value: 'Restart it and pray',
                      emoji: '🙏',
                      text: 'Restart it and pray',
                    },
                    {
                      value: 'Blame the wiring',
                      emoji: '💀',
                      text: 'Blame the wiring',
                    },
                    {
                      value: 'Call a teammate',
                      emoji: '😭',
                      text: 'Call a teammate',
                    },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`cursor-pointer rounded-xl border p-4 transition-all ${
                        formData.q2_aliens === option.value
                          ? 'border-purple-500 bg-purple-500/10 text-white'
                          : 'border-slate-700/80 bg-[#0b1120] text-slate-300 hover:border-purple-500/50'
                      }`}
                    >
                      <input
                        required
                        type="radio"
                        name="q2_aliens"
                        value={option.value}
                        checked={formData.q2_aliens === option.value}
                        onChange={handleChange}
                        className="sr-only"
                      />

                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {option.emoji}
                        </span>

                        <span className="font-semibold">
                          {option.text}
                        </span>
                      </div>
                    </label>
                  ))}

                </div>
              </div>

              {/* QUESTION 3 */}

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-200 block">
                  3. Night Owl 🌙 or Early Bird 🌅?
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  <label
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      formData.q3_giraffe === 'Night Owl'
                        ? 'border-purple-500 bg-purple-500/10 text-white'
                        : 'border-slate-700/80 bg-[#0b1120] text-slate-300 hover:border-purple-500/50'
                    }`}
                  >
                    <input
                      required
                      type="radio"
                      name="q3_giraffe"
                      value="Night Owl"
                      checked={formData.q3_giraffe === 'Night Owl'}
                      onChange={handleChange}
                      className="sr-only"
                    />

                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🌙</span>
                      <span className="font-semibold">
                        Night Owl
                      </span>
                    </div>
                  </label>

                  <label
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      formData.q3_giraffe === 'Early Bird'
                        ? 'border-purple-500 bg-purple-500/10 text-white'
                        : 'border-slate-700/80 bg-[#0b1120] text-slate-300 hover:border-purple-500/50'
                    }`}
                  >
                    <input
                      required
                      type="radio"
                      name="q3_giraffe"
                      value="Early Bird"
                      checked={formData.q3_giraffe === 'Early Bird'}
                      onChange={handleChange}
                      className="sr-only"
                    />

                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🌅</span>
                      <span className="font-semibold">
                        Early Bird
                      </span>
                    </div>
                  </label>

                </div>
              </div>

              {/* QUESTION 4 */}

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-200 block">
                  4. In a team, you're usually…
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {[
                    {
                      value: 'The Leader',
                      emoji: '🫡',
                      text: 'The Leader',
                    },
                    {
                      value: 'The Ideas Person',
                      emoji: '💡',
                      text: 'The Ideas Person',
                    },
                    {
                      value: 'The Technical One',
                      emoji: '🔧',
                      text: 'The Technical One',
                    },
                    {
                      value: 'The One Keeping Everyone Sane',
                      emoji: '🗿',
                      text: 'The One Keeping Everyone Sane',
                    },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`cursor-pointer rounded-xl border p-4 transition-all ${
                        formData.q4_conspiracy === option.value
                          ? 'border-purple-500 bg-purple-500/10 text-white'
                          : 'border-slate-700/80 bg-[#0b1120] text-slate-300 hover:border-purple-500/50'
                      }`}
                    >
                      <input
                        required
                        type="radio"
                        name="q4_conspiracy"
                        value={option.value}
                        checked={
                          formData.q4_conspiracy === option.value
                        }
                        onChange={handleChange}
                        className="sr-only"
                      />

                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {option.emoji}
                        </span>

                        <span className="font-semibold">
                          {option.text}
                        </span>
                      </div>
                    </label>
                  ))}

                </div>
              </div>

              {/* QUESTION 5 */}

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-200 block">
                  5. Your squad gets a free day after XLR8. What are you choosing?
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {[
                    {
                      value: 'Gaming',
                      emoji: '🎮',
                      text: 'Gaming',
                    },
                    {
                      value: 'Movies',
                      emoji: '🎬',
                      text: 'Movies',
                    },
                    {
                      value: 'Food Hunt',
                      emoji: '🍕',
                      text: 'Food Hunt',
                    },
                    {
                      value: 'Just Sleep',
                      emoji: '😴',
                      text: 'Just Sleep',
                    },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`cursor-pointer rounded-xl border p-4 transition-all ${
                        formData.q5_food_crime === option.value
                          ? 'border-purple-500 bg-purple-500/10 text-white'
                          : 'border-slate-700/80 bg-[#0b1120] text-slate-300 hover:border-purple-500/50'
                      }`}
                    >
                      <input
                        required
                        type="radio"
                        name="q5_food_crime"
                        value={option.value}
                        checked={
                          formData.q5_food_crime === option.value
                        }
                        onChange={handleChange}
                        className="sr-only"
                      />

                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {option.emoji}
                        </span>

                        <span className="font-semibold">
                          {option.text}
                        </span>
                      </div>
                    </label>
                  ))}

                </div>
              </div>

            </div>
          </div>

          {/* ====================================================
              SECTION 3: TEAM REQUIREMENTS
          ==================================================== */}

          <div className="bg-[#111827] border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">

            <div className="flex flex-col md:flex-row items-center justify-between gap-6">

              <div className="flex-1 w-full space-y-2">

                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-400" />

                  <label className="text-sm font-bold text-white uppercase tracking-wider block">
                    How many teammates do you need?
                  </label>
                </div>

                <select
                  required
                  name="teammatesNeeded"
                  value={formData.teammatesNeeded}
                  onChange={handleChange}
                  className="w-full md:w-64 bg-[#0b1120] border border-slate-700/80 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="1">
                    I need 1 teammate
                  </option>

                  <option value="2">
                    I need 2 teammates
                  </option>

                  <option value="3">
                    I need 3 teammates
                  </option>

                  <option value="Adopt Me">
                    Adopt me into any team
                  </option>
                </select>

              </div>

              {/* SUBMIT BUTTON */}

              <div className="w-full md:w-auto pt-6 md:pt-0">

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Request
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>

              </div>

            </div>
          </div>

        </form>
      </div>
    </div>
  );
}