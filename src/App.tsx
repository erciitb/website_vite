import React, { Suspense, lazy } from 'react';
import ScrollToTop from './components/ScrollToTop';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import SOR from './components/SOR';
import ProtectedRoute from './components/ProtectedRoute';
import Session1 from './components/Session1';
import Session2 from './components/Session2';
import Session3 from './components/Session3';
import Session4 from './components/Session4';
import Session5 from './components/Session5.tsx';
import Projects from './components/Projects.tsx';
import Preloader from './components/Preloader.tsx'
import Xlr8registration from './components/Xlr8registration.tsx';
import Xlr8Conveners from './components/xlr8conveners.tsx';


const XLR8Page = lazy(() => import('./components/XLR8Page.tsx'));
const Events = lazy(() => import('./components/Events'));
const Team = lazy(() => import('./components/Team'));
const Resources = lazy(() => import('./components/Resources'));
const Contact = lazy(() => import('./components/Contact'));
const LegacyPage = lazy(() => import('./components/LegacyPage'));
const BlogViewer = lazy(() => import('./components/BlogViewer.tsx'));
const CertificatePortal = lazy(() => import('./components/CertificatePortal.tsx'));
const Callback = lazy(() => import('./components/Callback.tsx'));


function App() {
  return (
    <Router>
      <ScrollToTop />
      
      <Preloader />
      
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <main>
          <Suspense
            fallback={
              <div className="flex min-h-[50vh] items-center justify-center text-gray-300">
                Loading...
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/blog/:slug" element={<BlogViewer />} />
              <Route path="/events" element={<Events />} />
              <Route path="/team" element={<Team />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/legacy" element={<LegacyPage />} />
              <Route path="/certificates" element={<CertificatePortal />} />
              <Route path="/xlr8" element={<XLR8Page />} />
              <Route path="/callback" element={<Callback />} />
              <Route path="/sor" element={<ProtectedRoute><SOR /></ProtectedRoute>} />
              <Route path="/session1" element={<Session1 />} />
              <Route path="/session2" element={<Session2 />} />
              <Route path="/session3" element={<Session3 />} />
              <Route path="/session4" element={<Session4 />} />
              <Route path="/session5" element={<Session5 />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/xlr8registration" element={<Xlr8registration />} />
              <Route path="/xlr8conveners" element={<Xlr8Conveners />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;