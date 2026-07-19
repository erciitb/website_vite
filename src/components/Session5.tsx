import React from "react";
import { Calendar, Clock, ExternalLink, Presentation, Video, Github } from "lucide-react";
import session5Image from "../assets/Mechatronics5_SOR.png"; 

const Session5 = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-4">
            <h2 className="text-6xl font-bold text-green-500">
              SLAM & Manipulation
            </h2>
          </div>

          <p className="max-w-4xl mx-auto text-gray-400 text-lg leading-relaxed">
            Step into the world of advanced robotics. Learn how mobile robots map and navigate unknown environments using SLAM, and dive into the mechanics of robotic arms to master precise object manipulation and physical interaction.
          </p>
        </div>

        <div className="space-y-8">
          {/* Session 5 Info Card */}
          <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-green-500/40 hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]">
            <div className="flex flex-col lg:flex-row">
              <div className="w-full lg:w-2/3 p-8 order-2 lg:order-1">
                <h2 className="text-3xl font-bold mb-4">
                  Session 5 — SLAM & Manipulation
                </h2>
                <h3 className="text-green-400 font-semibold mb-3">
                  What You'll Explore
                </h3>

                <p className="text-gray-300 leading-relaxed mb-8">
                  With perception in place, it’s time to take action. This session covers two core pillars of autonomous systems: Simultaneous Localization and Mapping (SLAM) for mobile bots, and spatial control for robotic arm manipulation. We will explore how a mobile base continuously builds a map of an unknown environment to navigate autonomously, and then shift gears to learn how a robotic arm calculates joint movements to precisely reach, grasp, and manipulate target objects in 3D space.
                </p>
                
                <div className="flex flex-col gap-3 text-gray-300 mb-6">
                  <div className="flex items-center">
                    <Calendar size={18} className="mr-3 text-green-400" />
                    <span>26th June 2026</span>
                  </div>

                  <div className="flex items-center">
                    <Clock size={18} className="mr-3 text-green-400" />
                    <span>7:00 PM</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap gap-4 mt-2">
                  <a
                    href="https://canva.link/6rjg8zlincawyjw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 px-6 py-3 rounded-xl transition-colors font-medium shadow-lg shadow-green-500/20"
                  >
                    <Presentation size={18} />
                    Slides
                  </a>

                  <a
                    href="https://drive.google.com/file/d/1KGl3R60BPMzC_WJKPE_qGenZzFR8ebBd/view?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 px-6 py-3 rounded-xl transition-colors font-medium shadow-lg shadow-green-500/20"
                  >
                    <Video size={18} />
                    Recording
                  </a>

                  <a
                    href="https://github.com/RRoy4/Session5"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-green-500/30 text-green-300 px-6 py-3 rounded-xl transition-colors font-medium"
                  >
                    <Github size={18} />
                    Session Resources & Code
                  </a>
                </div>
              </div>

              <div 
                className="w-full lg:w-1/3 order-1 lg:order-2 min-h-[300px] lg:min-h-full bg-contain bg-center bg-no-repeat border-b lg:border-b-0 lg:border-l border-white/10"
                style={{ backgroundImage: `url(${session5Image})` }}
              >
              </div>
            </div>
          </div>

          {/* Assignment Section */}
          <div className="max-w-3xl mx-auto mt-8 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md text-center transition-all duration-300 hover:border-green-500/30 hover:shadow-[0_0_35px_rgba(34,197,94,0.25)]">
            <h2 className="text-3xl font-bold mb-6">
              Session 5 Assignment
            </h2>

            <a
              href="https://drive.google.com/file/d/1F62--5iz1uxiv3F-om_Mc8OOMPbz6KIJ/view?usp=sharing" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-500 px-8 py-4 rounded-xl font-semibold text-lg transition-colors mb-8"
            >
              <ExternalLink size={20} />
              Click Here to Access Assignment
            </a>

            {/* DEADLINE PASSED BANNER */}
            <div className="max-w-xl mx-auto">
              <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-8 shadow-lg">
                <div className="flex justify-center mb-3">
                  <div className="bg-red-500/20 p-3 rounded-full">
                    <Clock size={28} className="text-red-400" />
                  </div>
                </div>
                <h3 className="text-gray-200 text-xl font-semibold mb-2">
                  Submission Deadline Passed
                </h3>
                <p className="text-gray-400">
                  We are no longer accepting submissions for this assignment. Thank you to everyone who participated!
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Session5;
