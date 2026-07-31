import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';

import itsp from '../assets/itsp_banner.png';
import sor from '../assets/sor_banner.png';

const eventsData = [
  {
    id: 1,
    title: 'ITSP Bootcamp 2026',
    date: '24 May 2026',
    time: '2:00 PM onwards',
    location: 'MS Teams',
    description:
      'The ITSP Bootcamp introduced participants to embedded systems, sensors, microcontrollers, and IoT development while exploring tools like Gazebo, Proteus, MATLAB, and Simulink — making it the perfect launchpad for hardware and robotics projects.',
    image: itsp,
    seats: 'Completed',
    slidesLink: 'https://bit.ly/ITSPBootcamp2026-resources',
  },
];

const Events = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const navigate = useNavigate();

  const handleSubscribe = async () => {
    if (!email) return;
    try {
      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbwdx14INhNr5HoY491xHHaRuZjliY-FYyGofc3TrNHsGoNmqZQDpNtqKBDxxiA4p_NLfA/exec',
        {
          method: 'POST',
          body: new URLSearchParams({ email }),
        }
      );
      if (response.ok) {
        setSubscribed(true);
        setEmail('');
        setTimeout(() => setSubscribed(false), 3000);
      }
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  return (
    <section id="events" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">

        {/* ── Section Header ── */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-heading mb-4 text-white">Events</h2>
          <div className="w-24 h-1 bg-blue-500 mx-auto mb-8"></div>
          <p className="max-w-3xl mx-auto text-gray-300 text-lg">
            Join us for workshops, competitions, and social gatherings...
          </p>
        </div>
         
        {/* ── XLR8 Event ── */}
        <div className="bg-gradient-to-br from-blue-900/30 to-orange-900/30 rounded-xl overflow-hidden border border-blue-500/20 mb-8">
          <div className="flex flex-col md:flex-row items-stretch">
            <div className="md:w-1/2 p-8">
              <div className="inline-flex items-center mb-4 px-3 py-1 bg-blue-500/20 rounded-full">
                <Calendar size={16} className="text-blue-400 mr-2" />
                <span className="text-sm text-blue-400">Featured Event</span>
              </div>

              <h3 className="text-2xl font-bold mb-3 font-heading text-white">
                XLR8 2026
              </h3>

              <div className="flex items-center text-gray-300 mb-2">
                <Calendar size={16} className="mr-2 text-gray-400" />
                <span>3 Weeks Competition</span>
              </div>

              <div className="flex items-center text-gray-300 mb-4">
                <MapPin size={16} className="mr-2 text-gray-400" />
                <span>IIT Bombay</span>
              </div>

              <p className="text-gray-300 mb-6">
              XLR8 is our annual high-speed robotics competition, where student-built racing bots, 
              go head-to-head in an electrifying test of speed, precision, and engineering excellence.
              From razor-sharp turns to full-throttle straights, every lap pushes innovation to its limits. 
              Each year, the event attracts over <span className="font-bold">900 enthusiastic participants</span> 
              from across the campus, transforming the arena into a celebration of robotics, creativity, and 
              competition. Beyond the thrill of racing, participants leave with <span className="font-bold">new 
              skills, lasting friendships, and unforgettable memories</span>. As the <span className="font-bold">
              largest technical event in the institute</span>, XLR8 is more than a race—it's where passion meets
              performance, and every lap tells a story.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/xlr8registration"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-md transition-all inline-flex items-center"
                >
                  Coming Soon...
                </Link>
              </div>
            </div>

            <div className="md:w-1/2 h-64 md:h-auto relative bg-gray-950/50 flex items-center justify-center">
              <img
                src='https://res.cloudinary.com/djbm9dagt/image/upload/v1785300687/XLR8card.jpg'
                alt="XLR8 2026"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* ── Summer of Robotics Event ── */}
        <div className="bg-gradient-to-br from-blue-900/30 to-orange-900/30 rounded-xl overflow-hidden border border-blue-500/20 mb-8">
          <div className="flex flex-col md:flex-row items-stretch">
            <div className="md:w-1/2 p-8">
              <div className="inline-flex items-center mb-4 px-3 py-1 bg-blue-500/20 rounded-full">
                <Calendar size={16} className="text-blue-400 mr-2" />
                <span className="text-sm text-blue-400">Flagship Event</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 font-heading text-white">Summer of Robotics</h3>
              <div className="flex items-center text-gray-300 mb-2">
                <Calendar size={16} className="mr-2 text-gray-400" />
                <span>6 Weeks Bootcamp</span>
              </div>
              <div className="flex items-center text-gray-300 mb-2">
                <Clock size={16} className="mr-2 text-gray-400" />
                <span>Registrations closed</span>
              </div>
              <div className="flex items-center text-gray-300 mb-4">
                <MapPin size={16} className="mr-2 text-gray-400" />
                <span>MS Teams</span>
              </div>
              <p className="text-gray-300 mb-6">
                Summer of Robotics is ERC's flagship robotics bootcamp where ideas turn into intelligent machines.
                Dive into the complete robotics pipeline — from robot anatomy, CAD modelling, and URDF design to
                ROS2 simulations in Gazebo. Build autonomous systems using SLAM, OpenCV, YOLOv8, MoveIt, RSSI
                heatmaps, and Ollama-powered robotics AI while working on exciting real-world projects throughout
                the program.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/sor"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-md transition-all inline-flex items-center"
                >
                  Details
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Events Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventsData.map((event) => (
            <div
              key={event.id}
              className={`h-full rounded-xl overflow-hidden transition-all group text-left ${
                event.seats === 'Completed'
                  ? 'bg-white/10 backdrop-blur-md border border-white/20'
                  : 'bg-gray-900 hover:shadow-lg hover:shadow-blue-500/10'
              }`}
            >
              <div className="h-48 relative bg-gray-950/50 flex items-center justify-center overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6 flex flex-col justify-between h-[calc(100%-12rem)]">
                <div>
                  <h3 className="text-xl font-semibold mb-3 font-heading text-white">{event.title}</h3>
                  <div className="flex items-center text-gray-300 mb-2">
                    <Calendar size={16} className="mr-2 text-gray-400" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center text-gray-300 mb-2">
                    <Clock size={16} className="mr-2 text-gray-400" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center text-gray-300 mb-3">
                    <MapPin size={16} className="mr-2 text-gray-400" />
                    <span>{event.location}</span>
                  </div>
                  <p className="text-gray-400 mb-4">{event.description}</p>
                </div>
                
                <div className="flex items-center justify-between pt-4 mt-auto border-t border-white/5">
                  <div className="flex items-center text-gray-300">
                    <Users size={16} className="mr-2 text-gray-400" />
                    <span>{event.seats}</span>
                  </div>
                  {event.seats === 'Completed' ? (
                    <div className="flex items-center gap-4">
                      {event.slidesLink && (
                        <a
                          href={event.slidesLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors font-medium inline-flex items-center gap-1 relative z-10"
                        >
                          Slides & Recordings
                          <ArrowRight size={14} />
                        </a>
                      )}
                    </div>
                  ) : (
                    <button className="text-blue-400 hover:text-blue-300 transition-colors font-medium relative z-10">
                      Register
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Newsletter Section ── */}
        <div className="mt-12 p-6 bg-blue-900/30 rounded-xl border border-gray-700 text-center mb-20">
          <h3 className="text-xl font-semibold mb-4 text-white">Stay Updated on All Events</h3>
          <p className="text-gray-300 mb-6">
            Subscribe to our newsletter to receive notifications...
          </p>
          <div className="flex flex-col sm:flex-row max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="px-4 py-3 bg-gray-900 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 border border-gray-700 mb-2 sm:mb-0 sm:flex-1 text-white"
            />
            <button
              onClick={handleSubscribe}
              disabled={subscribed}
              className={`px-6 py-3 transition-colors sm:rounded-l-none rounded-md font-medium ${
                subscribed
                  ? 'bg-orange-600 text-white cursor-default'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {subscribed ? 'Subscribed!' : 'Subscribe'}
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Events;