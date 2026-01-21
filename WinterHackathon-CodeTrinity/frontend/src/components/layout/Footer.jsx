import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Github, Linkedin, Mail } from 'lucide-react';
import Container from './Container';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Twitter',
      href: 'https://twitter.com/greenpulse',
      icon: Twitter,
    },
    {
      name: 'GitHub',
      href: 'https://github.com/yourusername/greenpulse',
      icon: Github,
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/company/greenpulse',
      icon: Linkedin,
    },
    {
      name: 'Email',
      href: 'mailto:contact@greenpulse.app',
      icon: Mail,
    },
  ];

  const footerLinks = [
    {
      title: 'Platform',
      links: [
        { name: 'Report Issue', href: '/report' },
        { name: 'Live Dashboard', href: '/dashboard' },
        { name: 'Impact Map', href: '/map' },
      ],
    },
    {
      title: 'Community',
      links: [
        { name: 'Voting Forum', href: '/voting' },
        { name: 'Collaboration', href: '/collaboration' },
        { name: 'Join Us', href: '/auth' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Impact Data', href: '/impact' },
        { name: 'Privacy Policy', href: '#' },
        { name: 'Terms of Service', href: '#' },
      ],
    },
  ];

  return (
    <footer className="relative bg-white pt-20 pb-12 overflow-hidden border-t border-gray-100">
      {/* Decorative gradient top border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-400 opacity-50"></div>

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-display font-bold text-lg">GP</span>
              </div>
              <span className="text-2xl font-display font-bold text-gray-900 tracking-tight">GreenPulse</span>
            </Link>
            <p className="text-gray-500 leading-relaxed max-w-xs">
              Empowering citizens to take direct action against climate change through localized reporting and community collaboration.
            </p>
            <div className="flex space-x-4 pt-2">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition-all duration-300 hover:-translate-y-1"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
            {footerLinks.map((section) => (
              <div key={section.title} className="space-y-6">
                <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase font-display">
                  {section.title}
                </h3>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-gray-500 hover:text-primary-600 transition-colors duration-200 flex items-center group"
                      >
                        <span className="w-0 group-hover:w-2 h-0.5 bg-primary-500 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            &copy; {currentYear} GreenPulse. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <span>Built for Winter Hackathon</span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span>CodeTrinity</span>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
