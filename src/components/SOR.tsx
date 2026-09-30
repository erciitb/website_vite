import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Download, GraduationCap, CheckCircle2, Clock } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { useAuth, logout } from '../hooks/useAuth';

interface TimelineItem {
  date: string;
  title: string;
  description: string;
  gradient: string;
  glow: string;
  link?: string;
}

const timelineData: TimelineItem[] = [
  {
    date: '5th June',
    title: 'Intro to Mechatronics',
    description:
      'Master the core anatomy of robotics by navigating coordinate frames and applying spatial mathematical transformations. Solve forward and inverse kinematics to bridge mechanical design with software control, culminating in custom URDF exports from Fusion.',
    gradient: 'from-blue-400 to-cyan-500',
    glow: 'group-hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]',
    link: '/session1',
  },
  {
    date: '9th June',
    title: 'Mechatronics: From Perception to Action',
    description:
      'Master robotic system dynamics and inertia to understand the physical forces driving your hardware. Bridge the gap between theory and reality by pairing advanced sensor integration with practical PID control, perfectly closing the crucial sense-act loop.',
    gradient: 'from-purple-400 to-violet-600',
    glow: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]',
    link: '/session2',
  },
  {
    date: '13th June',
    title: 'Introduction to ROS',
    description:
      'Get started with the Robot Operating System (ROS). Learn nodes, topics, services, packages, and build your first simulated robot in Gazebo while visualizing data using RViz.',
    gradient: 'from-pink-400 to-purple-600',
    glow: 'group-hover:shadow-[0_0_30px_rgba(217,70,239,0.4)]',
    link: '/session3',
  },
  {
    date: '19th June',
    title: 'Sensors and Perception',
    description:
      'Bridge the gap between hardware and software through advanced sensor integration. Dive into machine perception using OpenCV, empowering your robots to accurately interpret and react to dynamic visual environments.',
    gradient: 'from-orange-400 to-red-500',
    glow: 'group-hover:shadow-[0_0_30px_rgba(249,115,22,0.4)]',
    link: '/session4',
  },
  {
    date: '26th June',
    title: 'SLAM and Manipulation',
    description:
      'Master autonomous navigation by applying Simultaneous Localization and Mapping (SLAM) in unknown environments. Alongside mobile tracking, learn essential kinematics to control and maneuver simple robotic arms for real-world tasks.',
    gradient: 'from-emerald-400 to-green-600',
    glow: 'group-hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]',
    link: '/session5',
  },
  {
    date: '6th July - 20th July',
    title: 'Projects',
    description:
      'Apply everything learnt to build and deploy a comprehensive robotics project from scratch. Projects include an LLM-controlled bot, delivery drone, robotic arm sorting system, and spatial signal mapper.',
    gradient: 'from-yellow-400 to-amber-500',
    glow: 'group-hover:shadow-[0_0_30px_rgba(251,191,36,0.4)]',
    link: '/projects',
  },
];

const BASIC_CERTIFICATE_TEMPLATE_URL = '/certificate_basic.png';

const ADVANCED_CERTIFICATE_TEMPLATE_URL = '/certificate_advanced.png';

// Font used to render the student's name on the certificate. Self-hosted
// via @font-face in index.css (public/Fineday/Fineday/Fineday-StyleOne.ttf).
const CERTIFICATE_NAME_FONT = 'Fineday Style One';

// Font used for the Advanced certificate's project title. Self-hosted via
// @font-face in index.css (public/Quattrocento/Quattrocento-Bold.ttf).
const CERTIFICATE_PROJECT_FONT = 'Quattrocento';

// Layout measured directly off certificate_basic.png (2000x1414). If the
// template image is ever replaced, re-measure this.
const BASIC_TEMPLATE_NAME_Y = 710;

// Layout measured directly off certificate_advanced.png (900x1600). If the
// template image is ever replaced, re-measure these.
const ADVANCED_TEMPLATE_NAME_Y = 640;
const ADVANCED_TEMPLATE_PROJECT_CENTER_Y = 882;
const ADVANCED_TEMPLATE_PROJECT_MAX_WIDTH = 680;
const ADVANCED_TEMPLATE_PROJECT_FONT_SIZE = 26;
const ADVANCED_TEMPLATE_PROJECT_LINE_HEIGHT = 30;
const ADVANCED_TEMPLATE_GOLD = '#D4AF37';

// The six Advanced-track project description pages (static PNGs, same
// 900x1600 size as certificate_advanced.png, no text drawn on them). Matching
// is done by checking whether the sheet's Project text contains the key
// (case/punctuation-insensitive), so "SmartBOT — LLM-..." still matches
// "smartbot".
const ADVANCED_PROJECT_PAGES: { key: string; file: string }[] = [
  { key: 'signalscout', file: '/1.png' },
  { key: 'smartbot', file: '/2.png' },
  { key: 'aerodrop', file: '/3.png' },
  { key: 'bracciosort', file: '/4.png' },
  { key: 'terrarover', file: '/5.png' },
  { key: 'robotrace', file: '/6.png' },
];

function findAdvancedProjectPage(projectText: string): string | null {
  const normalized = projectText.toLowerCase().replace(/[^a-z0-9]/g, '');
  const match = ADVANCED_PROJECT_PAGES.find((p) => normalized.includes(p.key));
  return match ? match.file : null;
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// Builds the final 2-page Advanced certificate: page 1 is the canvas render
// above (name + project title on certificate_advanced.png), page 2 is the
// matching project description image, used as-is.
async function buildAdvancedCertificatePdf(page1Canvas: HTMLCanvasElement, projectText: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  const page1Png = dataUrlToUint8Array(page1Canvas.toDataURL('image/png'));
  const page1Image = await pdfDoc.embedPng(page1Png);
  const page1 = pdfDoc.addPage([page1Image.width, page1Image.height]);
  page1.drawImage(page1Image, { x: 0, y: 0, width: page1Image.width, height: page1Image.height });

  const page2Url = findAdvancedProjectPage(projectText);
  if (page2Url) {
    const page2Bytes = await fetch(page2Url).then((r) => {
      if (!r.ok) throw new Error(`Failed to fetch ${page2Url}: ${r.status}`);
      return r.arrayBuffer();
    });
    const page2Image = await pdfDoc.embedPng(page2Bytes);
    const page2 = pdfDoc.addPage([page2Image.width, page2Image.height]);
    page2.drawImage(page2Image, { x: 0, y: 0, width: page2Image.width, height: page2Image.height });
  } else if (projectText) {
    console.warn(`No matching project page found for project text: "${projectText}"`);
  }

  return pdfDoc.save();
}

// Greedily wraps text to fit maxWidth, breaking on word boundaries.
function wrapCertificateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(candidate).width > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) lines.push(current);
  return lines;
}

// Google Apps Script web app that checks the "Basic Certificate" and
// "Advanced Certificate" sheets for a roll number. See
// google-apps-script/certificate-eligibility.gs for the script + setup steps.
const CERTIFICATE_CHECK_URL =
  'https://script.google.com/macros/s/AKfycbyF7l48KyaJNWcB8bdfkTaWG1_tXZDesVXmRgdsLN_3M7rb7Ln3De77dq2wSkB6diWsFw/exec';
type CertificateType = 'basic' | 'advanced';

interface CertEligibility {
  basic: boolean;
  basicName: string;
  advanced: boolean;
  advancedName: string;
  advancedProject: string;
}

const SOR: React.FC = () => {
  const { user } = useAuth();
  const [generatingType, setGeneratingType] = useState<CertificateType | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [eligibility, setEligibility] = useState<CertEligibility | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Look up certificate eligibility from the two Google Sheet tabs
  useEffect(() => {
    if (!user?.roll) {
      setEligibility(null);
      return;
    }

    let cancelled = false;
    setCheckingEligibility(true);

    const roll = user.roll.trim().toLowerCase();

    fetch(`${CERTIFICATE_CHECK_URL}?roll=${encodeURIComponent(roll)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Eligibility API returned ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;
        setEligibility({
          basic: Boolean(data.basicEligible),
          basicName: typeof data.basicName === 'string' ? data.basicName : '',
          advanced: Boolean(data.advancedEligible),
          advancedName: typeof data.advancedName === 'string' ? data.advancedName : '',
          advancedProject: typeof data.advancedProject === 'string' ? data.advancedProject : '',
        });
      })
      .catch((error) => {
        console.error('Failed to check certificate eligibility:', error);
        if (!cancelled) {
          setEligibility({ basic: false, basicName: '', advanced: false, advancedName: '', advancedProject: '' });
        }
      })
      .finally(() => {
        if (!cancelled) setCheckingEligibility(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.roll]);

  // Dynamic Canvas Drawing Function
  const handleDownloadCertificate = (certType: CertificateType) => {
    if (!user?.name) return;

    setDownloadError(null);
    setGeneratingType(certType);

    const templateUrl =
      certType === 'advanced'
        ? ADVANCED_CERTIFICATE_TEMPLATE_URL
        : BASIC_CERTIFICATE_TEMPLATE_URL;

    const img = new Image();
    img.crossOrigin = 'anonymous'; // Harmless for same-origin /public assets, needed if a template is ever hosted elsewhere
    img.src = templateUrl;

    img.onload = async () => {
      // 1. Create off-screen canvas
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setGeneratingType(null);
        return;
      }

      // 2. Draw blank template onto canvas
      ctx.drawImage(img, 0, 0);

      // Prefer the name as entered in the matching sheet (Basic/Advanced
      // Certificate's Name column) over the SSO name, since organizers may
      // have corrected spelling/capitalization there.
      const sheetName = certType === 'advanced' ? eligibility?.advancedName : eligibility?.basicName;
      const displayName = sheetName?.trim() || user.name;

      // 3. Configure text styling: signature-style script font, gold gradient
      // Force the webfont to load before drawing — canvas silently falls back to a
      // default font if it isn't ready yet, instead of waiting for it.
      const nameFontSize = certType === 'advanced' ? 80 : 130;
      await document.fonts.load(`${nameFontSize}px "${CERTIFICATE_NAME_FONT}"`);
      ctx.font = `${nameFontSize}px "${CERTIFICATE_NAME_FONT}", cursive`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 4. Render student name, filled with a gold gradient (basic: vertical
      // 180deg #997300->#ffc000, advanced: horizontal 90deg shine)
      const xPos = canvas.width / 2;
      const yPos = certType === 'advanced' ? ADVANCED_TEMPLATE_NAME_Y : BASIC_TEMPLATE_NAME_Y;
      const textWidth = ctx.measureText(displayName).width;

      let gradient: CanvasGradient;
      if (certType === 'advanced') {
        gradient = ctx.createLinearGradient(xPos - textWidth / 2, yPos, xPos + textWidth / 2, yPos);
        gradient.addColorStop(0, '#af7c30');
        gradient.addColorStop(0.5, '#fbf4b2');
        gradient.addColorStop(1, '#af7c30');
      } else {
        gradient = ctx.createLinearGradient(xPos, yPos - nameFontSize / 2, xPos, yPos + nameFontSize / 2);
        gradient.addColorStop(0, '#997300');
        gradient.addColorStop(1, '#ffc000');
      }

      ctx.fillStyle = gradient;
      ctx.fillText(displayName, xPos, yPos);

      // 4b. Advanced certificates also print the project title from the sheet
      if (certType === 'advanced') {
        const project = eligibility?.advancedProject?.trim();

        if (project) {
          await document.fonts.load(`bold ${ADVANCED_TEMPLATE_PROJECT_FONT_SIZE}px "${CERTIFICATE_PROJECT_FONT}"`);
          ctx.font = `bold ${ADVANCED_TEMPLATE_PROJECT_FONT_SIZE}px "${CERTIFICATE_PROJECT_FONT}", serif`;
          ctx.fillStyle = ADVANCED_TEMPLATE_GOLD;

          const lines = wrapCertificateText(ctx, project.toUpperCase(), ADVANCED_TEMPLATE_PROJECT_MAX_WIDTH);
          const blockHeight = (lines.length - 1) * ADVANCED_TEMPLATE_PROJECT_LINE_HEIGHT;
          const startY = ADVANCED_TEMPLATE_PROJECT_CENTER_Y - blockHeight / 2;

          lines.forEach((line, i) => {
            ctx.fillText(line, xPos, startY + i * ADVANCED_TEMPLATE_PROJECT_LINE_HEIGHT);
          });
        }
      }

      // 5. Basic downloads as a single PNG. Advanced becomes a 2-page PDF:
      // page 1 is this canvas render, page 2 is the matching project page.
      const sanitizedName = displayName.replace(/\s+/g, '_');

      if (certType === 'advanced') {
        try {
          const pdfBytes = await buildAdvancedCertificatePdf(canvas, eligibility?.advancedProject || '');
          const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `${sanitizedName}_Summer_of_Robotics_Advanced_Certificate.pdf`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Failed to build the Advanced certificate PDF:', error);
          setDownloadError('Something went wrong while building your certificate. Please try again.');
        }
      } else {
        const link = document.createElement('a');
        link.download = `${sanitizedName}_Summer_of_Robotics_Basic_Certificate.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }

      setGeneratingType(null);
    };

    img.onerror = () => {
      console.error('Failed to load certificate template image.');
      setDownloadError('Failed to load the certificate template. Please try again.');
      setGeneratingType(null);
    };
  };

  useEffect(() => {
    const closeMenu = () => setMenuOpen(false);

    if (menuOpen) {
      document.addEventListener('click', closeMenu);
    }

    return () => {
      document.removeEventListener('click', closeMenu);
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-gray-900 text-white py-20 px-4 sm:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="fixed top-24 right-8 z-[9999]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/10 hover:bg-blue-500/5 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300"
          >
            {menuOpen ? <X size={25} /> : <Menu size={30} />}
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
              <div className="px-4 py-3 border-b border-white/10 text-sm font-semibold text-blue-400">
                Bootcamp Sessions
              </div>

              <Link to="/session1" className="block px-5 py-3 hover:bg-white/10 transition">
                Session 1 • Intro to Mechatronics
              </Link>

              <Link to="/session2" className="block px-5 py-3 hover:bg-white/10 transition">
                Session 2 • Mechatronics: From Perception to Action
              </Link>

              <Link to="/session3" className="block px-5 py-3 hover:bg-white/10 transition">
                Session 3 • Intro to ROS
              </Link>

              <Link to="/session4" className="block px-5 py-3 hover:bg-white/10 transition cursor-default">
                Session 4 • Sensors and Perception
              </Link>

              <Link to="/session5" className="block px-5 py-3 hover:bg-white/10 transition cursor-default">
                Session 5 • SLAM and Manipulation
              </Link>

              <Link to="/projects" className="block px-5 py-3 hover:bg-white/10 transition cursor-default">
                Project Phase • Final Build
              </Link>
            </div>
          )}
        </div>

        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold font-heading mb-6 text-blue-500">
            Summer of Robotics
          </h1>
          <div className="w-24 h-1 bg-blue-500 mx-auto mb-6 rounded-full"></div>
        </div>

        <div className="mb-20">
          <div className="relative bg-white/5 border border-white/10 rounded-2xl p-8 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-blue-500/30 hover:shadow-[0_0_35px_rgba(59,130,246,0.35)]">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative flex items-center justify-between mb-6">
              <div>
                <p className="text-white font-bold text-2xl">
                  {user?.name ? `Hello, ${user.name}` : "Loading..."}
                </p>

                {user?.roll ? (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {user.roll}
                    </span>
                  </div>
                ) : (
                  <p className="text-gray-400 text-base mt-1">Fetching user details...</p>
                )}
              </div>

              <button
                onClick={logout}
                className="text-xs text-gray-500 hover:text-gray-300 underline transition-colors shrink-0"
              >
                Logout
              </button>
            </div>

            <div className="relative border-t border-white/10 pt-6">
              <h2 className="text-3xl font-bold mb-3 text-blue-400">
                Welcome to Summer of Robotics 2026
              </h2>

              <p className="text-gray-400 text-lg leading-relaxed mb-1">
                Thank you for being a part of this journey, getting hands-on with ROS 2, navigating simulation
                challenges, and making this bootcamp a memorable experience. We hope you gained
                valuable skills, discovered new possibilities in robotics,and enjoyed the journey as much as we enjoyed putting it together.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Keep Exploring, Keep Building, Keep Simulating!
              </p>

              {/* Certificate Download CTA */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 bg-white/5 border border-blue-500/30 rounded-xl p-5 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                    <GraduationCap size={22} className="text-blue-300" />
                  </div>

                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">
                      Course Completion Certificate
                    </h3>
                    <p className="text-sm text-gray-300 flex items-center gap-1.5">
                      {checkingEligibility ? (
                        <>
                          <Clock size={14} className="text-gray-400 shrink-0" />
                          Checking your certificate eligibility...
                        </>
                      ) : !eligibility || (!eligibility.basic && !eligibility.advanced) ? (
                        "Sorry, you're not eligible for a certificate."
                      ) : eligibility.basic && eligibility.advanced ? (
                        <>
                          <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                          {`Congrats ${user?.name}! You're eligible for both the Basic and Advanced certificates.`}
                        </>
                      ) : eligibility.advanced ? (
                        <>
                          <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                          {`Congrats ${user?.name}! You're eligible for the Advanced certificate.`}
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                          {`Congrats ${user?.name}! You're eligible for the Basic certificate.`}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {eligibility && (eligibility.basic || eligibility.advanced) && (
                  <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
                    {eligibility.basic && (
                      <button
                        onClick={() => handleDownloadCertificate('basic')}
                        disabled={!user?.name || generatingType !== null}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                        className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-colors duration-300 shrink-0 outline-none focus:outline-none active:bg-blue-700 ${
                          user?.name && generatingType === null
                            ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                            : 'bg-blue-600/50 text-white/50 cursor-not-allowed'
                        }`}
                      >
                        <Download size={18} />
                        {generatingType === 'basic' ? 'Downloading...' : 'Basic Certificate'}
                      </button>
                    )}

                    {eligibility.advanced && (
                      <button
                        onClick={() => handleDownloadCertificate('advanced')}
                        disabled={!user?.name || generatingType !== null}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                        className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-colors duration-300 shrink-0 outline-none focus:outline-none active:bg-orange-700 ${
                          user?.name && generatingType === null
                            ? 'bg-orange-600 hover:bg-orange-500 text-white cursor-pointer'
                            : 'bg-orange-600/50 text-white/50 cursor-not-allowed'
                        }`}
                      >
                        <Download size={18} />
                        {generatingType === 'advanced' ? 'Downloading...' : 'Advanced Certificate'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {downloadError && (
                <p className="text-sm text-red-400 mt-3">{downloadError}</p>
              )}
            </div>
          </div>
        </div>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-3">
            Learning Roadmap
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Follow a structured journey from robot mechanics and simulation to perception,
            navigation, and a full-fledged robotics project.
          </p>
        </div>

        <div className="relative border-l-2 border-gray-800 ml-4 md:ml-0 md:border-none">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-orange-500 -translate-x-1/2 rounded-full opacity-50"></div>

          <div className="space-y-12">
            {timelineData.map((item, index) => {
              const cardContent = (
                <div
                  className={`p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 transform transition-all duration-500 ease-out group-hover:-translate-y-2 ${item.glow}`}
                >
                  <span
                    className={`inline-block px-4 py-1 rounded-full text-sm font-bold mb-4 bg-gradient-to-r ${item.gradient} text-gray-950`}
                  >
                    {item.date}
                  </span>

                  <h3 className="text-2xl font-bold text-gray-100 mb-3">
                    {item.title}
                  </h3>

                  <p className="text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );

              return (
                <div
                  key={index}
                  className={`relative flex flex-col md:flex-row items-center group ${
                    index % 2 === 0 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  <div className="absolute left-[-9px] md:left-1/2 md:-translate-x-1/2 w-5 h-5 rounded-full bg-gray-900 border-4 border-gray-700 group-hover:border-white transition-colors duration-300 z-10 shadow-[0_0_10px_rgba(255,255,255,0.2)] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.8)]"></div>

                  {item.link ? (
                    <Link
                      to={item.link}
                      className={`ml-8 md:ml-0 md:w-1/2 ${
                        index % 2 === 0 ? 'md:pl-12' : 'md:pr-12'
                      } block cursor-pointer`}
                    >
                      {cardContent}
                    </Link>
                  ) : (
                    <div
                      className={`ml-8 md:ml-0 md:w-1/2 ${
                        index % 2 === 0 ? 'md:pl-12' : 'md:pr-12'
                      } block cursor-default`}
                    >
                      {cardContent}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOR;