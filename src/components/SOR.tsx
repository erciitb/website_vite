import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Download } from 'lucide-react';
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

// URL of your blank certificate template image
const CERTIFICATE_TEMPLATE_URL =
  'https://res.cloudinary.com/djbm9dagt/image/upload/v1785434036/blank_cert.png';

const SOR: React.FC = () => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Dynamic Canvas Drawing Function
  const handleDownloadCertificate = () => {
    if (!user?.name) return;

    setIsGenerating(true);

    const img = new Image();
    img.crossOrigin = 'anonymous'; // Prevents CORS issues when loading from Cloudinary
    img.src = CERTIFICATE_TEMPLATE_URL;

    img.onload = () => {
      // 1. Create off-screen canvas
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setIsGenerating(false);
        return;
      }

      // 2. Draw blank template onto canvas
      ctx.drawImage(img, 0, 0);

      // 3. Configure text styling: 54.1px size and #d29e01 color
      ctx.font = 'bold 54.1px Inter, Arial, sans-serif';
      ctx.fillStyle = '#d29e01';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 4. Render student name in center
      const xPos = canvas.width / 2;
      const yPos = canvas.height / 2;
      ctx.fillText(user.name, xPos, yPos);

      // 5. Generate PNG data URL and trigger instant download
      const sanitizedName = user.name.replace(/\s+/g, '_');
      const link = document.createElement('a');
      link.download = `${sanitizedName}_Summer_of_Robotics_Certificate.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      setIsGenerating(false);
    };

    img.onerror = () => {
      console.error('Failed to load certificate template image.');
      setIsGenerating(false);
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
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 transition-all duration-500 hover:-translate-y-2 hover:border-blue-500/30 hover:shadow-[0_0_35px_rgba(59,130,246,0.35)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-white font-bold text-xl">
                  {user?.name || "Loading..."}
                </p>

                <p className="text-gray-400 text-sm mt-1">
                  {user?.roll
                    ? `${user.roll} · ${user.department} · ${user.degree}`
                    : "Fetching user details..."}
                </p>
              </div>

              <button
                onClick={logout}
                className="text-xs text-gray-500 hover:text-gray-300 underline transition-colors"
              >
                Logout
              </button>
            </div>
            
            <div className="border-t border-white/10 pt-6">
              <h2 className="text-2xl font-bold mb-3 text-blue-400">
                Welcome to Summer of Robotics 2026
              </h2>

              <p className="text-gray-400 leading-relaxed mb-6">
                Your account has been successfully authenticated. Use the menu in the
                top-right corner to access lecture materials, assignments, and weekly
                content throughout the program.
              </p>

              {/* Certificate Download CTA */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl p-5 backdrop-blur-sm">
                <div>
                  <h3 className="text-white font-semibold text-lg flex items-center gap-2 mb-1">
                    🎓 Course Completion Certificate
                  </h3>
                  <p className="text-sm text-gray-300">
                    {user?.name
                      ? `Certificate ready for ${user.name}. Click below to generate and download.`
                      : 'Your certificate is ready. Click below to view or download.'}
                  </p>
                </div>

                <button
                  onClick={handleDownloadCertificate}
                  disabled={!user?.name || isGenerating}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 shrink-0 ${
                    user?.name && !isGenerating
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] cursor-pointer'
                      : 'bg-blue-600/50 text-white/50 cursor-not-allowed'
                  }`}
                >
                  <Download size={18} />
                  {isGenerating ? 'Generating...' : 'Download Certificate'}
                </button>
              </div>
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