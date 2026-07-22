import React from 'react';
import { ExternalLink, Award, Clock } from 'lucide-react';

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

        {/* --- SUBMISSION PORTAL CLOSED BANNER --- */}
        <div className="mt-24 max-w-3xl mx-auto">
          <div className="bg-gray-800 border border-white/10 rounded-2xl p-8 sm:p-12 shadow-2xl text-center relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Award size={32} />
            </div>
            
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 font-heading">
              Submissions Are Now Closed
            </h3>
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-900/80 border border-white/10 text-gray-300 text-xs font-medium mb-6">
              <Clock size={14} className="text-blue-400" />
              <span>Deadline Passed</span>
            </div>

            <p className="text-gray-300 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-8">
              Thank you to everyone who participated in SOR and pushed their robotics skills to the absolute limit! Our evaluation team is currently reviewing your repositories and simulations.
            </p>

            <div className="border-t border-white/10 pt-6">
              <p className="text-gray-400 text-sm">
                Missed the deadline or need to update a critical submission?{' '}
                <span className="text-gray-200 font-medium">Please reach out directly to the ERC team.</span>
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Projects;