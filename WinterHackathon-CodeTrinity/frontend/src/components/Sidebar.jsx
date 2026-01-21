import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, CheckSquare, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/report', label: 'Report Issue', icon: FileText },
    { path: '/review', label: 'Review Reports', icon: CheckSquare },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="w-64 h-screen sticky top-0 bg-white/60 backdrop-blur-xl border-r border-white/50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50">
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 px-2 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-500 to-teal-400 shadow-lg shadow-primary-500/30 flex items-center justify-center">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <h2 className="text-xl font-display font-bold text-gray-900 tracking-tight">GreenPulse</h2>
        </motion.div>

        <nav className="flex flex-col gap-2.5">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 group
                    ${isActive
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/25'
                      : 'text-gray-600 hover:bg-white/80 hover:shadow-sm hover:text-primary-600'}`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform duration-300 
                      ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                  />
                  <span className="font-medium tracking-wide">{item.label}</span>

                  {/* Active indicator dot */}
                  {isActive && (
                    <motion.span
                      layoutId="activeDot"
                      className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Decorative background element */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none"
      >
        <div className="bg-gradient-to-r from-primary-200 to-secondary-200 h-[1px] w-full mb-6"></div>
        <p className="text-xs text-center text-gray-400 font-display">© 2024 CodeTrinity</p>
      </motion.div>
    </aside>
  );
}
