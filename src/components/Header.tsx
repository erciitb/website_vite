import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import HeaderLogo from '../assets/header.png';
import MobileMenu from '../MobileMenu';
import { useAuth } from '../hooks/useAuth';
import { SOR_SSO_URL } from '../config/sso';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSorClick = () => {
    setIsMenuOpen(false);

    if (isLoggedIn) {
      navigate('/sor');
      return;
    }

    sessionStorage.setItem('redirectAfterLogin', '/sor');
    window.location.href = SOR_SSO_URL;
  };

  // XLR8 — NO SSO / LOGIN
  const handleXlr8Click = () => {
    setIsMenuOpen(false);
    navigate('/xlr8');
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'events', path: '/events' },
    { label: 'team', path: '/team' },
    { label: 'legacy', path: '/legacy' },
    { label: 'resources', path: '/resources' },
    { label: 'contact', path: '/contact' },
    { label: 'Certificates', path: '/certificates' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-black/70 backdrop-blur-md shadow-lg border-b border-white/10'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center justify-center relative w-auto h-16"
            onClick={() => setIsMenuOpen(false)}
          >
            <img
              src={HeaderLogo}
              alt="Header Logo"
              className="w-auto h-20"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">

            {navItems.map(({ label, path }) => (
              <Link
                key={label}
                to={path}
                className="text-gray-300 hover:text-orange-500 transition-colors capitalize font-heading"
                onClick={() => setIsMenuOpen(false)}
              >
                {label}
              </Link>
            ))}

            {/* SOR */}
            <button
              onClick={handleSorClick}
              className="px-4 py-2 bg-blue-600 hover:bg-orange-700 rounded-md transition-colors font-heading text-white"
            >
              SOR
            </button>

            {/* XLR8 — Direct Access */}
            {/* <button
              onClick={handleXlr8Click}
              className="px-4 py-2 bg-blue-600 hover:bg-orange-700 rounded-md transition-colors font-heading text-white"
            >
              XLR8
            </button> */}

          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>
      </header>

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  );
};

export default Header;