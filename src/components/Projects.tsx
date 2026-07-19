import React, { useState, useEffect } from 'react';
import { ExternalLink, Loader2, CheckCircle, AlertTriangle, Shield, FolderGit2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwa7qRY--gt-JS0mdSgdSjgWDeKFDyV7F_yKlEHuY7hWRGEy4nbxWJvu2_RFBhZo6Nj/exec';

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  tags: string[];
  githubUrl: string;
}

const defaultProjects: Project[] = [
  {
    id: 1,
    title: 'ROBOTRACE — Autonomous Vision-Based Line Follower',
    description:
      'Develop an intelligent mobile robot capable of following a track without GPS, maps, or external guidance. Using ROS 2, computer vision, and closed-loop control, you will build a system that detects lane markings, corrects its trajectory in real time, and completes autonomous navigation challenges',
    image: 'https://res.cloudinary.com/djbm9dagt/image/upload/v1782883354/follower_mmbx7s.png',
    category: 'Beginner',
    tags: ['TurtleBot3', 'OpenCV', 'PID Control'],
    githubUrl: 'https://github.com/sachinmandal3580-rgb/ros2_line_follower.git',
  },
  {
    id: 2,
    title: 'SignalSCOUT — Autonomous Spatial Signal Mapper',
    description:
      'Build an autonomous robotic WiFi surveyor that maps an environment, navigates safely through it, collects wireless signal measurements, and generates coverage heatmaps. Implement the complete ROS 2 autonomy pipeline—from SLAM and localization to navigation, data collection, and spatial visualization.',
    image: 'https://res.cloudinary.com/djbm9dagt/image/upload/v1782883379/rssi_xvwpie.png',
    category: 'Intermediate',
    tags: ['TurtleBot3', 'SLAM', 'RSSI'],
    githubUrl: 'https://github.com/sachinmandal3580-rgb/ros2_RSSI_Heatmap.git',
  },
  {
    id: 3,
    title: 'SmartBOT — LLM-Powered Autonomous Exploration Bot',
    description:
      'Build a complete navigation stack including keyboard teleop, a hand-rolled FSM/PID navigator for obstacle avoidance, frontier-based autonomous exploration on a live SLAM Toolbox occupancy grid, and a local LLM that parses typed commands into Nav2 goals.',
    image: 'https://res.cloudinary.com/djbm9dagt/image/upload/v1782883363/llm_ujrr40.png',
    category: 'Intermediate',
    tags: ['LLM', 'ROS', 'Natural Language'],
    githubUrl: 'https://github.com/RRoy4/LLM-Controlled-Bot.git',
  },
  {
    id: 4,
    title: 'AERODrop — DIGIPIN-Based Precision Delivery Drone',
    description:
      'Develop a fully autonomous ROS 2 drone capable of navigating to DIGIPIN-based destinations, detecting targets using YOLO, and performing precision payload deliveries. Experience the complete aerial robotics stack—from flight control and perception to mission planning—in a realistic Gazebo simulation.',
    image: 'https://res.cloudinary.com/djbm9dagt/image/upload/v1782883362/drone_ar9jlz.png',
    category: 'Intermediate',
    tags: ['Yolov8', 'PID/PI control', 'Digipin'],
    githubUrl: 'https://github.com/sachinmandal3580-rgb/ros2_drone.git',
  },
  {
    id: 5,
    title: 'BraccioSORT — Vision-Guided Pick-and-Place System',
    description:
      'Build a complete vision-guided manipulation stack including camera-based object detection, pixel-to-world coordinate estimation, MoveIt-powered inverse kinematics and motion planning, gripper control, and autonomous colour-based pick-and-place sorting using a simulated Braccio robotic arm.',
    image: 'https://res.cloudinary.com/djbm9dagt/image/upload/v1782883355/arm_g9layb.png',
    category: 'Advanced',
    tags: ['6-DOF Robotic Arm', 'YOLOv8', 'Moveit'],
    githubUrl: 'https://github.com/Saarthak43/ros2_pick_n_place_braccio',
  },
  {
    id: 6,
    title: 'TerraROVER — 6-Wheeled Planetary Exploration Rover',
    description:
      'Build an intelligent Mars rover capable of autonomously exploring rugged planetary terrain using ROS 2 Jazzy. Implement the complete autonomy stack—from wheel-level control and EKF localization to Nav2 path planning and obstacle avoidance—in a realistic Gazebo simulation',
    image: 'https://res.cloudinary.com/djbm9dagt/image/upload/v1782883366/rover_fi4iwl.png',
    category: 'Advanced',
    tags: ['Rocker-Bogie', 'Ackermann Steering', 'SLAM'],
    githubUrl: 'https://github.com/sachinmandal3580-rgb/ros2_rover.git',
  },
];

const Projects: React.FC = () => {
  // SSO & Submission Portal State
  const { user } = useAuth();
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [assignedProjectName, setAssignedProjectName] = useState<string>('');
  // NEW: tracks whether the backend says this roll number already has a submission on record
  const [alreadySubmitted, setAlreadySubmitted] = useState<boolean>(false);

  const [driveLink, setDriveLink] = useState<string>('');
  const [githubRepo, setGithubRepo] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [funAnswer, setFunAnswer] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  // 1. VERIFY REGISTRATION (matches your script: action=check & checks data.registered)
  useEffect(() => {
    if (!user?.roll) {
      setIsCheckingStatus(false);
      return;
    }

    const checkRegistration = async () => {
      try {
        setIsCheckingStatus(true);
        setErrorMessage('');

        const response = await fetch(`${SCRIPT_URL}?action=check&roll=${encodeURIComponent(user.roll)}`);
        const data = await response.json();

        if (data.registered) {
          setIsRegistered(true);
          if (data.projectName) {
            setAssignedProjectName(data.projectName);
          }
          // NEW: reflect prior-submission status returned by the script
          setAlreadySubmitted(!!data.alreadySubmitted);
        } else {
          setIsRegistered(false);
        }
      } catch (error) {
        console.error("Failed to verify registration:", error);
        setErrorMessage("Failed to connect to the verification server. Please try again later.");
        setIsRegistered(false);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkRegistration();
  }, [user?.roll]);

  // 2. SUBMIT DELIVERABLES (sends action: 'submit', rollNumber, githubLink via text/plain to avoid CORS preflight)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!user?.roll || user.roll.trim() === "" || user.roll === "N/A" || user.roll === "undefined") {
      setErrorMessage("Submission failed: Missing Roll Number. Please log out and log in again.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        action: 'submit',
        rollNumber: user.roll,
        driveLink: driveLink,
        githubLink: githubRepo, // Matched precisely to your script's 'githubLink'
        feedback: feedback,
        funAnswer: funAnswer
      };

      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      setSubmitted(true);
      setDriveLink('');
      setGithubRepo('');
      setFeedback('');
      setFunAnswer('');
    } catch (error) {
      console.error('Submission error:', error);
      setErrorMessage("Submission failed due to a network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="projects" className="py-20 bg-gray-900 relative">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 font-heading text-white">Projects</h2>
          <div className="w-24 h-1 bg-blue-500 mx-auto mb-8 rounded-full"></div>
          <p className="max-w-4xl mx-auto text-gray-300 text-lg">
            The theory is behind you—now it's time to build intelligent robots in simulation. Put
            your ROS skills to the test through immersive, hands-on projects where autonomous
            navigation, computer vision, manipulation, and AI come together to solve real-world
            robotics challenges.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {defaultProjects.map((project) => (
            <div
              key={project.id}
              className="bg-gray-800 rounded-xl overflow-hidden transition-all hover:-translate-y-2
                hover:shadow-lg hover:shadow-blue-500/10 group border border-white/5 hover:border-blue-500/20"
            >
              <div className="h-48 overflow-hidden relative bg-gray-700">
                {project.image ? (
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                    <span className="text-gray-500 text-sm">No image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-70" />
                <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                  {project.tags.filter(Boolean).map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-gray-900/80 text-xs rounded-full text-blue-400 border border-blue-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-400 transition-colors font-heading text-white leading-snug">
                  {project.title}
                </h3>
                <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                  {project.description}
                </p>
                <div className="flex items-center justify-between">
                  {/* Category */}
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400">
                    {project.category}
                  </span>

                  {/* More Info */}
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors gap-1"
                  >
                    <span>More Info</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- SUBMISSION PORTAL --- */}
        <div className="mt-24 max-w-3xl mx-auto">
          <div className="bg-gray-800 border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl">

            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4">
                <FolderGit2 size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 font-heading">Project Submission Portal</h3>
              <p className="text-gray-400 text-sm">Submit your final deliverables.</p>
            </div>

            {/* Authenticated Student Banner */}
            {user && (
              <div className="bg-gray-900 border border-white/5 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <div>
                    <span className="text-gray-400 block">Authenticated as</span>
                    <strong className="text-white text-sm font-medium">{user.name}</strong> <span className="text-blue-400 font-mono">({user.roll})</span>
                  </div>
                </div>
                <div className="text-gray-400 sm:text-right">
                  <div>Branch: <span className="text-gray-200 font-medium">{user.department || 'N/A'}</span></div>
                </div>
              </div>
            )}

            {!user ? (
              <div className="bg-gray-900 border border-white/5 rounded-xl p-8 text-center my-6">
                <Shield className="mx-auto text-blue-400 mb-3" size={36} />
                <h4 className="text-white text-lg font-semibold mb-2">Authentication Required</h4>
                <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                  Please log in using your official ITC SSO credentials to unlock the project submission form.
                </p>
              </div>
            ) : isCheckingStatus ? (
              <div className="flex flex-col items-center justify-center py-12 text-blue-400">
                <Loader2 className="animate-spin mb-4" size={32} />
                <p className="text-sm text-gray-300">Verifying registration status for <span className="font-mono text-white uppercase">{user.roll}</span>...</p>
              </div>
            ) : !isRegistered ? (
              <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-8 text-center my-6">
                <AlertTriangle className="mx-auto text-red-400 mb-3" size={36} />
                <h4 className="text-red-400 text-lg font-semibold mb-2">Access Denied</h4>
                <p className="text-gray-300 text-sm mb-4 max-w-md mx-auto">
                  Roll number <strong className="text-white font-mono uppercase">{user.roll}</strong> is not registered in the projects database.
                </p>
              </div>
            ) : submitted || alreadySubmitted ? (
              // NEW: covers both "just submitted in this session" and "already had a submission on record"
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-8 text-center my-6">
                <CheckCircle className="mx-auto text-emerald-400 mb-4" size={44} />
                <h4 className="text-emerald-400 text-xl font-bold mb-2">
                  {submitted ? 'Submission Recorded!' : 'Already Submitted'}
                </h4>
                {!submitted && (
                  <p className="text-gray-300 text-sm max-w-md mx-auto">
                    Roll number <strong className="text-white font-mono uppercase">{user.roll}</strong> has already submitted deliverables for this project. If you need to update your submission, please contact the ERC team.
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 mt-6">

                {/* Automatically populated Project Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Assigned Project Track
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={assignedProjectName}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-blue-500/30 text-blue-400 font-bold focus:outline-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Google Drive Folder <span className="text-red-400">*</span></label>
                    <input type="url" required value={driveLink} onChange={(e) => setDriveLink(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-white/10 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">GitHub Repository <span className="text-red-400">*</span></label>
                    <input type="url" required value={githubRepo} onChange={(e) => setGithubRepo(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-white/10 text-white text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Feedback</label>
                  <textarea rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-white/10 text-white text-sm" />
                </div>

                <div>
  <label className="block text-sm font-medium text-gray-300 mb-2">
    Now that you've completed SOR, how close are you to building your dream project? <span className="text-gray-500 font-normal">(Optional)</span>
  </label>
  <input
    type="text"
    value={funAnswer}
    onChange={(e) => setFunAnswer(e.target.value)}
    placeholder="Type your answer..."
    className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-white/10 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none text-sm"
  />
</div>

                {errorMessage && (
                  <p className="text-red-400 text-sm">{errorMessage}</p>
                )}

                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl disabled:opacity-60">
                  {isSubmitting ? "Submitting..." : "Submit Project"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
export default Projects;