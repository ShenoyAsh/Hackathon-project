import { Link, useLocation } from 'react-router-dom';
import { Leaf, Menu, User, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { language, setLanguage } = useLanguage();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/report', label: 'Report' },
    { to: '/profile', label: 'Profile' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform duration-300">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className={`text-xl font-display font-bold tracking-tight transition-colors ${isScrolled ? 'text-gray-900' : 'text-gray-900'}`}>
              GreenPulse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-1 py-1 text-sm font-semibold transition-colors duration-300 group
                  ${location.pathname === link.to
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-primary-600'}`}
              >
                {link.label}
                <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-primary-500 rounded-full transform origin-left transition-transform duration-300 ${location.pathname === link.to ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
              </Link>
            ))}

            {/* User Menu */}
            <Link
              to="/profile"
              className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 hover:border-primary-200 hover:text-primary-600 transition-all shadow-sm hover:shadow-md"
            >
              <User className="w-5 h-5 text-gray-600" />
            </Link>

            {/* Language Switcher */}
            <button
              onClick={() => {
                const langs = ['en', 'es', 'hi'];
                const nextIndex = (langs.indexOf(language) + 1) % langs.length;
                setLanguage(langs[nextIndex]);
              }}
              className="px-3 py-1 rounded-full border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors uppercase"
            >
              {language}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white/50 hover:bg-white text-gray-700 hover:text-primary-600 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fade-in bg-white/95 backdrop-blur-xl rounded-b-2xl shadow-xl absolute left-0 right-0 px-4">
            <div className="flex flex-col gap-2">
              {/* Mobile Language Switcher */}
              <div className="flex items-center gap-2 px-4 py-2">
                <Globe className="w-5 h-5 text-gray-500" />
                <div className="flex gap-2">
                  {['en', 'es', 'hi'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`px-2 py-1 rounded text-xs font-bold uppercase ${language === lang ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-3 rounded-xl font-medium transition-colors duration-200
                    ${location.pathname === link.to
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
// ...existing code...
