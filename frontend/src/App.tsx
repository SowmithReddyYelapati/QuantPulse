import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard.tsx';
import Analytics from './pages/Analytics.tsx';
import Profile from './pages/Profile.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import Navbar from './components/Navbar.tsx';
import Settings from './pages/Settings.tsx';
import './App.css';

const TICKERS = [
  { label: 'AAPL',    price: '$189.43', change: '+1.2%',  up: true  },
  { label: 'TSLA',    price: '$168.22', change: '-0.5%',  up: false },
  { label: 'MSFT',    price: '$421.33', change: '+0.8%',  up: true  },
  { label: 'AMZN',    price: '$184.50', change: '+2.1%',  up: true  },
  { label: 'NVDA',    price: '$877.35', change: '+3.4%',  up: true  },
  { label: 'GOOGL',   price: '$174.11', change: '-0.3%',  up: false },
  { label: 'META',    price: '$492.60', change: '+1.7%',  up: true  },
  { label: 'BTC-USD', price: '$64,231', change: '+3.4%',  up: true  },
  { label: 'ETH-USD', price: '$3,122',  change: '-1.2%',  up: false },
  { label: 'SPY',     price: '$524.80', change: '+0.6%',  up: true  },
];

const MarketTicker = () => {
  const location = useLocation();
  if (['/login', '/register'].includes(location.pathname)) return null;

  return (
    <div className="ticker-container">
      <div className="ticker-track">
        {[...TICKERS, ...TICKERS].map((t, i) => (
          <span key={i} className="flex items-center gap-2 text-xs font-bold">
            <span className="text-muted">{t.label}</span>
            <span className="text-primary">{t.price}</span>
            <span className={t.up ? 'text-success' : 'text-danger'}>{t.change}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

// --- Protected Route Wrapper ---
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// --- Auth Route Wrapper (Redirects if already logged in) ---
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
};

const AppLayout = () => {
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();
  const isAuth = ['/login', '/register'].includes(location.pathname);

  return (
    <div className={`app-container ${isAuth ? 'auth-mode' : ''}`}>
      <Navbar notifOpen={notifOpen} setNotifOpen={setNotifOpen} />
      <main className="main-content">
        <Routes>
          {/* Protected Routes */}
          <Route path="/"          element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
          <Route path="/profile"   element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/settings"  element={<PrivateRoute><Settings /></PrivateRoute>} />

          {/* Auth Routes */}
          <Route path="/login"     element={<AuthRoute><Login /></AuthRoute>} />
          <Route path="/register"  element={<AuthRoute><Register /></AuthRoute>} />
          
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <MarketTicker />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
