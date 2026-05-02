import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LineChart, LayoutDashboard, User, Bell, 
  CheckCircle, AlertTriangle, LogOut, TrendingUp, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  notifOpen: boolean;
  setNotifOpen: (open: boolean) => void;
}

const Navbar = ({ notifOpen, setNotifOpen }: NavbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_name');
    navigate('/login');
  };

  const notifications = [
    { id: 1, type: 'success', title: 'Prediction Hit', message: 'AAPL target reached', time: '2m ago', icon: <CheckCircle size={14} className="text-success" /> },
    { id: 2, type: 'warning', title: 'Volatility', message: 'High volume in TSLA', time: '15m ago', icon: <AlertTriangle size={14} className="text-warning" /> },
  ];

  if (isAuthPage) return null;

  return (
    <nav className="navbar">
      <div className="container flex justify-between items-center h-full">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-all duration-300">
            <TrendingUp size={22} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-white leading-none">QuantPulse</span>
            <span className="text-[10px] font-bold text-muted tracking-widest uppercase">Institutional</span>
          </div>
        </Link>
        
        <div className="flex items-center gap-8">
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
              <Link 
                to="/" 
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${isActive('/') ? 'bg-white text-black shadow-lg' : 'text-secondary hover:text-white'}`}
              >
                <LayoutDashboard size={14} />
                Dashboard
              </Link>
              <Link 
                to="/analytics" 
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${isActive('/analytics') ? 'bg-white text-black shadow-lg' : 'text-secondary hover:text-white'}`}
              >
                <LineChart size={14} />
                Analytics
              </Link>
            </div>
          )}

          <div className="flex items-center gap-4 border-l border-white/10 pl-8">
            {isAuthenticated ? (
              <>
                <div className="relative">
                  <button 
                    onClick={() => setNotifOpen(!notifOpen)}
                    className={`p-2.5 rounded-xl transition-all relative ${notifOpen ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-secondary hover:text-white hover:bg-white/5'}`}
                  >
                    <Bell size={18} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-secondary rounded-full border-2 border-bg-main"></span>
                  </button>

                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        className="absolute right-0 top-full mt-4 w-80 bg-bg-card border border-border-bright rounded-2xl shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted">Intelligent Alerts</h3>
                          <button className="text-[10px] font-bold text-primary hover:opacity-80">Mark all as read</button>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.map((notif) => (
                            <div key={notif.id} className="p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer group">
                              <div className="flex gap-4">
                                <div className="mt-1 p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">{notif.icon}</div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <p className="text-xs font-bold text-white">{notif.title}</p>
                                    <span className="text-[9px] font-bold text-muted">{notif.time}</span>
                                  </div>
                                  <p className="text-[11px] text-secondary mt-1 leading-relaxed">{notif.message}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="p-3 bg-white/5 border-t border-white/5 text-center">
                          <button className="text-[10px] font-bold text-muted hover:text-white transition-colors">View All Notifications</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-1">
                  <Link to="/settings" className={`p-2.5 rounded-xl text-secondary hover:text-white hover:bg-white/5 transition-all ${isActive('/settings') ? 'text-white bg-white/10' : ''}`}>
                    <Settings size={18} />
                  </Link>
                  <Link to="/profile" className={`p-2.5 rounded-xl text-secondary hover:text-white hover:bg-white/5 transition-all ${isActive('/profile') ? 'text-white bg-white/10' : ''}`}>
                    <User size={18} />
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="p-2.5 text-secondary hover:text-danger-color hover:bg-danger-glow rounded-xl transition-all ml-1"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="px-4 py-2 text-sm font-bold text-secondary hover:text-white transition-colors">Sign In</Link>
                <Link to="/register" className="btn btn-primary py-2 px-6 text-xs font-bold">Join QuantPulse</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
