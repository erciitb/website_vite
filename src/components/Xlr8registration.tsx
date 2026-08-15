import React, { useState, FormEvent, ChangeEvent } from 'react';
import aditya from '../assets/aditya_qr.jpeg';
import {
  Users,
  User,
  Camera,
  Receipt,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Send,
} from 'lucide-react';

// Replace with your actual deployed Google Apps Script Web App URLs.
// The same form data is POSTed to all three in parallel.
const GOOGLE_SCRIPT_URLS = [
  'https://script.google.com/macros/s/AKfycbyKa8OrzJkB7xJUrvQq-hVC0cp0RwF5xbXJFhmVLjo1POBAAT30y4a6oRMl3s62EURVrA/exec',
  'https://script.google.com/macros/s/AKfycbxNbC45lJPHcLnGfK0Y6U0g8nS6cJ8KqsK3VKIv7WIxQYDFwFVWGQXxdsACijo1gVSb7g/exec',
];

interface FormData {
  // Team
  teamName: string;

  // Leader
  leaderName: string;
  leaderRollNumber: string;
  leaderPhone: string;
  leaderEmail: string;
  leaderMentorName: string;
  leaderMentorPhone: string;

  // Participant 2
  p2Name: string;
  p2RollNumber: string;
  p2Phone: string;
  p2MentorName: string;
  p2MentorPhone: string;

  // Participant 3
  p3Name: string;
  p3RollNumber: string;
  p3Phone: string;
  p3MentorName: string;
  p3MentorPhone: string;

  // Participant 4
  p4Name: string;
  p4RollNumber: string;
  p4Phone: string;
  p4MentorName: string;
  p4MentorPhone: string;

  // Submission Links
  teamSelfieLink: string;
  paymentScreenshotLink: string;
}

const initialFormData: FormData = {
  teamName: '',

  leaderName: '',
  leaderRollNumber: '',
  leaderPhone: '',
  leaderEmail: '',
  leaderMentorName: '',
  leaderMentorPhone: '',

  p2Name: '',
  p2RollNumber: '',
  p2Phone: '',
  p2MentorName: '',
  p2MentorPhone: '',

  p3Name: '',
  p3RollNumber: '',
  p3Phone: '',
  p3MentorName: '',
  p3MentorPhone: '',

  p4Name: '',
  p4RollNumber: '',
  p4Phone: '',
  p4MentorName: '',
  p4MentorPhone: '',

  teamSelfieLink: '',
  paymentScreenshotLink: '',
};

export default function XLR8Registration() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [errors, setErrors] = useState<
    Partial<Record<keyof FormData, string>>
  >({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    const phoneRegex = /^\+?[0-9\s-]{8,15}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Team
    if (!formData.teamName.trim()) {
      newErrors.teamName = 'Team name is required';
    }

    // Leader
    if (!formData.leaderName.trim()) {
      newErrors.leaderName = 'Leader name is required';
    }

    if (!formData.leaderRollNumber.trim()) {
      newErrors.leaderRollNumber = 'Roll number is required';
    }

    if (!formData.leaderPhone.trim()) {
      newErrors.leaderPhone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.leaderPhone.trim())) {
      newErrors.leaderPhone = 'Enter a valid phone number';
    }

    if (!formData.leaderEmail.trim()) {
      newErrors.leaderEmail = 'Email is required';
    } else if (!emailRegex.test(formData.leaderEmail.trim())) {
      newErrors.leaderEmail = 'Enter a valid email address';
    }

    if (!formData.leaderMentorName.trim()) {
      newErrors.leaderMentorName = 'ISMP Mentor Name is required';
    }

    if (!formData.leaderMentorPhone.trim()) {
      newErrors.leaderMentorPhone =
        'ISMP Mentor Phone Number is required';
    } else if (!phoneRegex.test(formData.leaderMentorPhone.trim())) {
      newErrors.leaderMentorPhone = 'Enter a valid phone number';
    }

    // Participant 2
    if (!formData.p2Name.trim()) {
      newErrors.p2Name = 'Name is required';
    }

    if (!formData.p2RollNumber.trim()) {
      newErrors.p2RollNumber = 'Roll number is required';
    }

    if (!formData.p2Phone.trim()) {
      newErrors.p2Phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.p2Phone.trim())) {
      newErrors.p2Phone = 'Enter a valid phone number';
    }

    if (!formData.p2MentorName.trim()) {
      newErrors.p2MentorName = 'ISMP Mentor Name is required';
    }

    if (!formData.p2MentorPhone.trim()) {
      newErrors.p2MentorPhone =
        'ISMP Mentor Phone Number is required';
    } else if (!phoneRegex.test(formData.p2MentorPhone.trim())) {
      newErrors.p2MentorPhone = 'Enter a valid phone number';
    }

    // Participant 3
    if (!formData.p3Name.trim()) {
      newErrors.p3Name = 'Name is required';
    }

    if (!formData.p3RollNumber.trim()) {
      newErrors.p3RollNumber = 'Roll number is required';
    }

    if (!formData.p3Phone.trim()) {
      newErrors.p3Phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.p3Phone.trim())) {
      newErrors.p3Phone = 'Enter a valid phone number';
    }

    if (!formData.p3MentorName.trim()) {
      newErrors.p3MentorName = 'ISMP Mentor Name is required';
    }

    if (!formData.p3MentorPhone.trim()) {
      newErrors.p3MentorPhone =
        'ISMP Mentor Phone Number is required';
    } else if (!phoneRegex.test(formData.p3MentorPhone.trim())) {
      newErrors.p3MentorPhone = 'Enter a valid phone number';
    }

    // Participant 4
    if (!formData.p4Name.trim()) {
      newErrors.p4Name = 'Name is required';
    }

    if (!formData.p4RollNumber.trim()) {
      newErrors.p4RollNumber = 'Roll number is required';
    }

    if (!formData.p4Phone.trim()) {
      newErrors.p4Phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.p4Phone.trim())) {
      newErrors.p4Phone = 'Enter a valid phone number';
    }

    if (!formData.p4MentorName.trim()) {
      newErrors.p4MentorName = 'ISMP Mentor Name is required';
    }

    if (!formData.p4MentorPhone.trim()) {
      newErrors.p4MentorPhone =
        'ISMP Mentor Phone Number is required';
    } else if (!phoneRegex.test(formData.p4MentorPhone.trim())) {
      newErrors.p4MentorPhone = 'Enter a valid phone number';
    }

    // Submission links
    if (!formData.teamSelfieLink.trim()) {
      newErrors.teamSelfieLink = 'Team Selfie link is required';
    } else if (!formData.teamSelfieLink.startsWith('http')) {
      newErrors.teamSelfieLink =
        'Must be a valid URL starting with http:// or https://';
    }

    if (!formData.paymentScreenshotLink.trim()) {
      newErrors.paymentScreenshotLink =
        'Payment Screenshot link is required';
    } else if (!formData.paymentScreenshotLink.startsWith('http')) {
      newErrors.paymentScreenshotLink =
        'Must be a valid URL starting with http:// or https://';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /**
   * POSTs the form data to a single Apps Script URL and normalizes the
   * outcome. Never throws — network errors and non-2xx responses are
   * captured as a failed outcome instead of rejecting.
   */
  const submitToSheet = async (
    url: string
  ): Promise<{ ok: boolean; reason?: string }> => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        redirect: 'follow',
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        return { ok: true };
      }

      return {
        ok: false,
        reason: result.message || result.error || 'Unknown error',
      };
    } catch (err) {
      return { ok: false, reason: String(err) };
    }
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!validate()) {
      const firstError =
        document.querySelector('.border-red-500');

      if (firstError) {
        firstError.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }

      return;
    }

    setLoading(true);

    try {
      const outcomes = await Promise.all(
        GOOGLE_SCRIPT_URLS.map((url) => submitToSheet(url))
      );

      const failures = outcomes.filter((o) => !o.ok);

      if (failures.length === 0) {
        console.log('XLR8 Registration Submitted Data:', formData);
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        console.error('Submission failed:', failures);
        alert(`Submission failed: ${failures[0].reason}`);
      }
    } catch (error) {
      alert(
        'An error occurred while submitting the form.'
      );

      console.error(
        'Network/Submission Error:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const getSectionStatus = (
    fields: (keyof FormData)[]
  ) => {
    const filledCount = fields.filter(
      (field) =>
        formData[field].trim().length > 0
    ).length;

    if (filledCount === 0) return 'empty';

    if (filledCount === fields.length)
      return 'complete';

    return 'partial';
  };

  const sections = [
    {
      id: 'sec-team',
      label: 'Team Details',
      fields: ['teamName'] as (keyof FormData)[],
    },
    {
      id: 'sec-leader',
      label: 'Leader',
      fields: [
        'leaderName',
        'leaderRollNumber',
        'leaderPhone',
        'leaderEmail',
        'leaderMentorName',
        'leaderMentorPhone',
      ] as (keyof FormData)[],
    },
    {
      id: 'sec-p2',
      label: 'Participant 2',
      fields: [
        'p2Name',
        'p2RollNumber',
        'p2Phone',
        'p2MentorName',
        'p2MentorPhone',
      ] as (keyof FormData)[],
    },
    {
      id: 'sec-p3',
      label: 'Participant 3',
      fields: [
        'p3Name',
        'p3RollNumber',
        'p3Phone',
        'p3MentorName',
        'p3MentorPhone',
      ] as (keyof FormData)[],
    },
    {
      id: 'sec-p4',
      label: 'Participant 4',
      fields: [
        'p4Name',
        'p4RollNumber',
        'p4Phone',
        'p4MentorName',
        'p4MentorPhone',
      ] as (keyof FormData)[],
    },
    {
      id: 'sec-sub',
      label: 'Submission',
      fields: [
        'teamSelfieLink',
        'paymentScreenshotLink',
      ] as (keyof FormData)[],
    },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);

    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const inputClass = (
    field: keyof FormData
  ) =>
    `w-full rounded-xl bg-gray-900/60 border ${
      errors[field]
        ? 'border-red-500'
        : 'border-white/10'
    } text-white placeholder-gray-500 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all outline-none`;

  const renderError = (
    field: keyof FormData
  ) => {
    if (!errors[field]) return null;

    return (
      <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
        <AlertCircle className="w-3.5 h-3.5" />
        {errors[field]}
      </p>
    );
  };

  return (
    <div className="relative min-h-screen bg-gray-900 text-white font-sans antialiased selection:bg-blue-500 selection:text-white pb-24 overflow-hidden">

      {/* Background Effects */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[500px] bg-blue-600/10 blur-[120px] rounded-full z-0" />

      <div className="pointer-events-none absolute top-1/3 -right-20 w-96 h-96 bg-indigo-500/10 blur-[140px] rounded-full z-0" />

      <div className="pointer-events-none absolute bottom-10 -left-20 w-96 h-96 bg-blue-500/10 blur-[140px] rounded-full z-0" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28">

        {/* Header */}
        <div className="text-center max-w-8xl mx-auto mb-12">

          <h1 className="text-5xl md:text-6xl font-bold font-heading mb-6 tracking-tight">
            Welcome to{' '}
            <span className="text-blue-500">
              XLR8 !
            </span>
          </h1>

          <div className="w-24 h-1 bg-blue-500 mx-auto mb-6 rounded-full" />

          <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
            Feel the adrenaline and race for glory in
            XLR8, ERC's flagship high-speed robotics
            competition. Join 900+ participants to
            design, build, and race robots where every
            millisecond counts. Whether you're a
            beginner or a seasoned competitor, XLR8 is
            your chance to innovate, compete, and
            experience robotics at full throttle.
          </p>

          <p className="text-base sm:text-lg text-gray-400 leading-relaxed mt-2">
            Register your team below and claim your spot
            on the starting grid!
          </p>
        </div>

        {/* Progress Navigation */}
        <div className="mb-12 overflow-x-auto pb-4 scrollbar-none">

          <div className="flex items-center justify-between min-w-[650px] bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">

            {sections.map((sec, idx) => {
              const status =
                getSectionStatus(sec.fields);

              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() =>
                    scrollToSection(sec.id)
                  }
                  className="flex items-center gap-2 group focus:outline-none"
                >

                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      status === 'complete'
                        ? 'bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.6)]'
                        : status === 'partial'
                        ? 'bg-blue-900/60 text-blue-300 border border-blue-500/50'
                        : 'bg-gray-800 text-gray-500 border border-white/5 group-hover:border-white/20'
                    }`}
                  >
                    {status === 'complete' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      idx + 1
                    )}
                  </div>

                  <span
                    className={`text-xs sm:text-sm font-semibold transition-colors ${
                      status === 'complete'
                        ? 'text-blue-400'
                        : status === 'partial'
                        ? 'text-gray-200'
                        : 'text-gray-500 group-hover:text-gray-300'
                    }`}
                  >
                    {sec.label}
                  </span>

                  {idx < sections.length - 1 && (
                    <div className="w-6 sm:w-10 h-[1px] bg-white/10 mx-1 sm:mx-2" />
                  )}

                </button>
              );
            })}

          </div>
        </div>

        {/* Success */}
        {submitted ? (

          <div className="max-w-2xl mx-auto bg-blue-900/20 border border-blue-500/30 rounded-2xl p-8 backdrop-blur-md text-center shadow-[0_0_35px_rgba(59,130,246,0.2)] animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="w-16 h-16 bg-blue-500/20 border border-blue-500/50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-400">

              <CheckCircle2 className="w-10 h-10" />

            </div>

            <h2 className="text-2xl font-bold font-heading text-white mb-2">
              Registration Submitted!
            </h2>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
              Thank you for registering team{' '}
              <span className="text-blue-400 font-semibold">
                {formData.teamName}
              </span>{' '}
              for XLR8. Your details have been
              recorded successfully.
            </p>

          </div>

        ) : (

          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-8"
          >

            {/* TEAM DETAILS */}
            <div
              id="sec-team"
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 transition-all duration-500 hover:-translate-y-2 hover:border-blue-500/30 hover:shadow-[0_0_35px_rgba(59,130,246,0.35)]"
            >

              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">

                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Users className="w-6 h-6" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white">
                    Team Details
                  </h2>

                  <p className="text-xs sm:text-sm text-gray-400">
                    Enter your official team name
                  </p>
                </div>

              </div>

              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                Team Name{' '}
                <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="teamName"
                value={formData.teamName}
                onChange={handleChange}
                placeholder="Be creative :)"
                className={inputClass('teamName')}
              />

              {renderError('teamName')}

            </div>

            {/* LEADER */}
            <div
              id="sec-leader"
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 transition-all duration-500 hover:-translate-y-2 hover:border-blue-500/30 hover:shadow-[0_0_35px_rgba(59,130,246,0.35)]"
            >

              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">

                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <User className="w-6 h-6" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white">
                    Participant 1 (Team Leader)
                  </h2>

                  <p className="text-xs sm:text-sm text-gray-400">
                    Primary point of contact for the team
                  </p>
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Leader Name{' '}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="leaderName"
                    value={formData.leaderName}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className={inputClass('leaderName')}
                  />

                  {renderError('leaderName')}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Roll Number{' '}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="leaderRollNumber"
                    value={formData.leaderRollNumber}
                    onChange={handleChange}
                    placeholder="e.g. 26BXXXX"
                    className={inputClass(
                      'leaderRollNumber'
                    )}
                  />

                  {renderError('leaderRollNumber')}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Phone Number{' '}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="tel"
                    name="leaderPhone"
                    value={formData.leaderPhone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className={inputClass(
                      'leaderPhone'
                    )}
                  />

                  {renderError('leaderPhone')}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Email ID{' '}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="email"
                    name="leaderEmail"
                    value={formData.leaderEmail}
                    onChange={handleChange}
                    placeholder="Provide active email"
                    className={inputClass(
                      'leaderEmail'
                    )}
                  />

                  {renderError('leaderEmail')}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    ISMP Mentor Name{' '}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="leaderMentorName"
                    value={formData.leaderMentorName}
                    onChange={handleChange}
                    placeholder="Mentor Full Name"
                    className={inputClass(
                      'leaderMentorName'
                    )}
                  />

                  {renderError(
                    'leaderMentorName'
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    ISMP Mentor Phone Number{' '}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="tel"
                    name="leaderMentorPhone"
                    value={formData.leaderMentorPhone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className={inputClass(
                      'leaderMentorPhone'
                    )}
                  />

                  {renderError(
                    'leaderMentorPhone'
                  )}
                </div>

              </div>
            </div>

            {/* PARTICIPANT 2 */}
            <div
              id="sec-p2"
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 transition-all duration-500 hover:-translate-y-2 hover:border-blue-500/30 hover:shadow-[0_0_35px_rgba(59,130,246,0.35)]"
            >

              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">

                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <User className="w-6 h-6" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white">
                    Participant 2
                  </h2>

                  <p className="text-xs sm:text-sm text-gray-400">
                    Team member details
                  </p>
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="p2Name"
                    value={formData.p2Name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className={inputClass('p2Name')}
                  />

                  {renderError('p2Name')}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Roll Number{' '}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="p2RollNumber"
                    value={formData.p2RollNumber}
                    onChange={handleChange}
                    placeholder="e.g. 26BXXXX"
                    className={inputClass(
                      'p2RollNumber'
                    )}
                  />

                  {renderError('p2RollNumber')}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Phone Number{' '}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="tel"
                    name="p2Phone"
                    value={formData.p2Phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className={inputClass(
                      'p2Phone'
                    )}
                  />

                  {renderError('p2Phone')}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    ISMP Mentor Name{' '}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="p2MentorName"
                    value={formData.p2MentorName}
                    onChange={handleChange}
                    placeholder="Mentor Full Name"
                    className={inputClass(
                      'p2MentorName'
                    )}
                  />

                  {renderError('p2MentorName')}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    ISMP Mentor Phone Number{' '}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="tel"
                    name="p2MentorPhone"
                    value={formData.p2MentorPhone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className={inputClass(
                      'p2MentorPhone'
                    )}
                  />

                  {renderError(
                    'p2MentorPhone'
                  )}
                </div>

              </div>
            </div>

            {/* PARTICIPANT 3 */}
            <div
              id="sec-p3"
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 transition-all duration-500 hover:-translate-y-2 hover:border-blue-500/30 hover:shadow-[0_0_35px_rgba(59,130,246,0.35)]"
            >

              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">

                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <User className="w-6 h-6" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white">
                    Participant 3
                  </h2>

                  <p className="text-xs sm:text-sm text-gray-400">
                    Team member details
                  </p>
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="p3Name"
                    value={formData.p3Name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className={inputClass('p3Name')}
                  />

                  {renderError('p3Name')}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Roll Number{' '}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="p3RollNumber"
                    value={formData.p3RollNumber}
                    onChange={handleChange}
                    placeholder="e.g. 26BXXXX"
                    className={inputClass(
                      'p3RollNumber'
                    )}
                  />

                  {renderError('p3RollNumber')}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Phone Number{' '}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="tel"
                    name="p3Phone"
                    value={formData.p3Phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className={inputClass(
                      'p3Phone'
                    )}
                  />

                  {renderError('p3Phone')}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    ISMP Mentor Name{' '}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="p3MentorName"
                    value={formData.p3MentorName}
                    onChange={handleChange}
                    placeholder="Mentor Full Name"
                    className={inputClass(
                      'p3MentorName'
                    )}
                  />

                  {renderError('p3MentorName')}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    ISMP Mentor Phone Number{' '}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="tel"
                    name="p3MentorPhone"
                    value={formData.p3MentorPhone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className={inputClass(
                      'p3MentorPhone'
                    )}
                  />

                  {renderError(
                    'p3MentorPhone'
                  )}
                </div>

              </div>
            </div>

            {/* PARTICIPANT 4 */}
            <div
              id="sec-p4"
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 transition-all duration-500 hover:-translate-y-2 hover:border-blue-500/30 hover:shadow-[0_0_35px_rgba(59,130,246,0.35)]"
            >

              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">

                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <User className="w-6 h-6" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white">
                    Participant 4
                  </h2>

                  <p className="text-xs sm:text-sm text-gray-400">
                    Team member details
                  </p>
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="p4Name"
                    value={formData.p4Name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className={inputClass('p4Name')}
                  />

                  {renderError('p4Name')}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Roll Number{' '}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="p4RollNumber"
                    value={formData.p4RollNumber}
                    onChange={handleChange}
                    placeholder="e.g. 26BXXXX"
                    className={inputClass(
                      'p4RollNumber'
                    )}
                  />

                  {renderError('p4RollNumber')}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Phone Number{' '}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="tel"
                    name="p4Phone"
                    value={formData.p4Phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className={inputClass(
                      'p4Phone'
                    )}
                  />

                  {renderError('p4Phone')}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    ISMP Mentor Name{' '}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="p4MentorName"
                    value={formData.p4MentorName}
                    onChange={handleChange}
                    placeholder="Mentor Full Name"
                    className={inputClass(
                      'p4MentorName'
                    )}
                  />

                  {renderError('p4MentorName')}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    ISMP Mentor Phone Number{' '}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="tel"
                    name="p4MentorPhone"
                    value={formData.p4MentorPhone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className={inputClass(
                      'p4MentorPhone'
                    )}
                  />

                  {renderError(
                    'p4MentorPhone'
                  )}
                </div>

              </div>
            </div>

            {/* KIT & PAYMENT DETAILS */}
            <div className="bg-amber-500/5 backdrop-blur-md border border-amber-400/25 rounded-2xl p-5 sm:p-6">

              <div className="flex items-start gap-3">

                <div className="shrink-0 text-xl sm:text-2xl">
                  ⚠️
                </div>

                <div className="min-w-0">

                  <h3 className="text-base sm:text-lg font-bold text-amber-300 mb-3 font-heading">
                    IMPORTANT — KIT & PAYMENT DETAILS
                  </h3>

                  <ul className="space-y-2.5 text-sm sm:text-base text-gray-300 leading-relaxed">

                    <li>
                      •{' '}
                      <strong className="text-white">
                        Electrical Kit:
                      </strong>{' '}
                      You will receive the electrical kit
                      first. Payment for the kit will need
                      to be completed as instructed.
                    </li>

                    <li>
                      •{' '}
                      <strong className="text-white">
                        Mechanical Kit:
                      </strong>{' '}
                      The mechanical kit will be provided
                      at a later stage.
                    </li>

                    <li>
                      •{' '}
                      <strong className="text-white">
                        Electrical Kit Payment:
                      </strong>{' '}
                      Please use{' '}
                      <strong className="text-white">
                        the QR code below
                      </strong>{' '}
                      to make the{' '}
                      <strong className="text-amber-300">
                        ₹1,800 payment
                      </strong>.
                    </li>

                    <li>
                      • After completing the payment,
                      proceed to the{' '}
                      <strong className="text-white">
                        submission link
                      </strong>{' '}
                      below.
                    </li>

                  </ul>

                </div>
              </div>
            </div>

            {/* PAYMENT SCANNERS */}
            <div className="w-full flex justify-center">
              <div className="w-full max-w-sm bg-slate-900/60 border border-cyan-400/20 rounded-2xl p-5 flex flex-col items-center">

                <p className="text-sm font-semibold text-cyan-300 mb-4">
                  Pay Rs. 1,800 using the QR code below
                </p>

                <img
                  src={aditya}
                  alt="Scanner 1 - ₹1,800 Payment"
                  className="w-full max-w-xs rounded-xl object-contain"
                />

              </div>
            </div>

            {/* SUBMISSION LINKS */}
            <div
              id="sec-sub"
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 transition-all duration-500 hover:-translate-y-2 hover:border-blue-500/30 hover:shadow-[0_0_35px_rgba(59,130,246,0.35)]"
            >

              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">

                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <LinkIcon className="w-6 h-6" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white">
                    Submission Links
                  </h2>

                  <p className="text-xs sm:text-sm text-gray-400">
                    Provide drive links for verification
                  </p>
                </div>

              </div>

              <div className="space-y-6">

                {/* TEAM SELFIE */}
                <div>

                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2 flex items-center gap-1.5">

                    <Camera className="w-4 h-4 text-blue-400" />

                    Team Selfie Google Drive Link{' '}
                    <span className="text-red-500">
                      *
                    </span>

                  </label>

                  <input
                    type="url"
                    name="teamSelfieLink"
                    value={formData.teamSelfieLink}
                    onChange={handleChange}
                    placeholder="Drive link with selfie uploaded"
                    className={inputClass(
                      'teamSelfieLink'
                    )}
                  />

                  <p className="mt-1.5 text-xs text-gray-400 flex items-center gap-1">

                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />

                    Make sure the Drive link is accessible
                    to 'Anyone with the link'.

                  </p>

                  {renderError(
                    'teamSelfieLink'
                  )}

                </div>

                {/* PAYMENT SCREENSHOT */}
                <div>

                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2 flex items-center gap-1.5">

                    <Receipt className="w-4 h-4 text-blue-400" />

                    Payment Screenshot Google Drive Link{' '}
                    <span className="text-red-500">
                      *
                    </span>

                  </label>

                  <input
                    type="url"
                    name="paymentScreenshotLink"
                    value={
                      formData.paymentScreenshotLink
                    }
                    onChange={handleChange}
                    placeholder="Drive link with payment confirmation screenshot uploaded"
                    className={inputClass(
                      'paymentScreenshotLink'
                    )}
                  />

                  <p className="mt-1.5 text-xs text-gray-400 flex items-center gap-1">

                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />

                    Make sure the Drive link is accessible
                    to 'Anyone with the link'.

                  </p>

                  {renderError(
                    'paymentScreenshotLink'
                  )}

                </div>

              </div>
            </div>

            {/* SUBMIT */}
            <div className="pt-4 text-center">

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold text-base transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-[0.98] border border-blue-500/30"
              >

                <span>
                  {loading
                    ? 'Submitting...'
                    : 'Submit XLR8 Registration'}
                </span>

                <Send className="w-5 h-5" />

              </button>

            </div>

          </form>
        )}
      </div>
    </div>
  );
}
