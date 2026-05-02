import { useState, useEffect } from 'react';
import axios from 'axios';
import StockChart from '../components/StockChart.tsx';
import Watchlist from '../components/Watchlist.tsx';
import { Search, Activity, Info, Brain, ChevronRight, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { BACKEND_URL } from '../config/api';

const Dashboard = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStockData = async (targetSymbol: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/stocks/quote/${targetSymbol}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError("Market data feed unavailable for this symbol.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData(symbol);
    const interval = setInterval(() => fetchStockData(symbol), 30000);
    return () => clearInterval(interval);
  }, [symbol]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      setSymbol(searchQuery.toUpperCase());
    }
  };

  const userName = localStorage.getItem('user_name') || 'Trader';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="container py-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-2">
            <span className="status-badge status-success flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-success-color rounded-full animate-pulse"></span>
              Market Live
            </span>
            <span className="text-xs font-bold text-muted">Last sync: {new Date().toLocaleTimeString()}</span>
          </div>
          <h1 className="heading-1 text-gradient">Hello, {userName}</h1>
          <p className="text-secondary text-lg">Current market sentiment is <span className="text-white font-bold">Bullish</span>. AI recommends caution.</p>
        </motion.div>
        
        <motion.form 
          variants={itemVariants}
          onSubmit={handleSearch} 
          className="w-full lg:w-[480px] flex items-center gap-3"
        >
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-white transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search ticker or asset..." 
              className="input pl-12 h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary h-12 px-8">
            <Zap size={16} />
            Analyze
          </button>
        </motion.form>
      </header>

      {error && (
        <motion.div 
          variants={itemVariants}
          className="p-4 bg-danger-glow border border-danger/20 rounded-xl flex items-center gap-3 mb-8 text-danger text-sm font-bold"
        >
          <Info size={18} />
          {error}
        </motion.div>
      )}

      {loading && !data ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="h-32 bg-white/5 rounded-2xl animate-pulse"></div>
            <div className="h-[500px] bg-white/5 rounded-2xl animate-pulse"></div>
          </div>
          <div className="h-full bg-white/5 rounded-2xl animate-pulse"></div>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Real-time Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="stat-card">
                <span className="stat-label">Live Price</span>
                <p className="stat-value">${data.current_price.toFixed(2)}</p>
                <span className="stat-sub text-muted">USD · REAL TIME</span>
              </div>

              {(() => {
                const pred = data.predictions?.ensemble ?? data.predicted_price;
                const delta = pred - data.current_price;
                const up = delta >= 0;
                return (
                  <div className="stat-card">
                    <span className="stat-label">AI Projection</span>
                    <p className={`stat-value ${up ? 'text-success-color' : 'text-danger-color'}`}>${pred.toFixed(2)}</p>
                    <span className={`stat-sub ${up ? 'text-success-color' : 'text-danger-color'}`}>
                      {up ? '▲' : '▼'} {up ? '+' : ''}{((delta/data.current_price)*100).toFixed(2)}%
                    </span>
                  </div>
                );
              })()}

              <div className="stat-card">
                <span className="stat-label">AI Sentiment</span>
                <div className="mt-2">
                  <span className={`badge ${data.trading_signal?.includes('Buy') ? 'badge-success' : 'badge-danger'}`}>
                    {data.trading_signal || 'Hold'}
                  </span>
                </div>
              </div>

              <div className="stat-card">
                <span className="stat-label">Conviction</span>
                <p className="stat-value">{data.confidence_score?.toFixed(0)}%</p>
                <div className="progress-bar mt-2">
                  <motion.div
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${data.confidence_score}%` }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Main Visualizer */}
            <motion.div variants={itemVariants} className="card h-[540px] flex flex-col p-0 overflow-hidden">
              <div className="p-6 flex justify-between items-center" style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                <div>
                  <div className="section-title">
                    <span className="section-icon"><TrendingUp size={15} /></span>
                    Predictive Matrix
                  </div>
                  <p className="text-xs text-secondary mt-1">Stochastic analysis of {symbol}</p>
                </div>
                <div className="flex bg-white/5 p-1 rounded-xl" style={{border:'1px solid rgba(255,255,255,0.06)'}}>
                  <button className="px-4 py-1.5 text-[10px] font-bold text-white bg-white/10 rounded-lg">Real-time</button>
                  <button className="px-4 py-1.5 text-[10px] font-bold text-secondary transition-colors hover:text-white">Historical</button>
                </div>
              </div>
              <div className="flex-1 p-6">
                <StockChart data={data.historical} prediction={data.predicted_price} />
              </div>
            </motion.div>
          </div>

          {/* Side Panels */}
          <div className="space-y-8">
            <motion.div variants={itemVariants}>
              <Watchlist currentSymbol={symbol} onSelect={setSymbol} />
            </motion.div>
            
            <motion.div variants={itemVariants} className="card border-accent/20 bg-accent-glow">
              <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                <Brain size={18} className="text-accent" />
                Ensemble Intelligence
              </h4>
              <p className="text-xs text-secondary leading-relaxed mb-6">
                Cross-validated LSTM & Random Forest architecture processing 40+ technical indicators.
              </p>
              
              {data.predictions && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-white/5 group hover:border-accent/40 transition-colors">
                    <span className="text-[10px] font-black text-muted uppercase tracking-widest">Neural LSTM</span>
                    <span className="text-sm font-bold text-white">${data.predictions.lstm.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-white/5 group hover:border-accent/40 transition-colors">
                    <span className="text-[10px] font-black text-muted uppercase tracking-widest">Forest Vector</span>
                    <span className="text-sm font-bold text-white">${data.predictions.random_forest.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="card group cursor-pointer hover:border-accent/40">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-white text-sm">Portfolio Strategy</h4>
                <ChevronRight size={16} className="text-muted group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                Suggested allocation: <span className="text-white font-bold">12.5%</span> of active capital based on current {symbol} volatility.
              </p>
            </motion.div>
          </div>
        </div>
      ) : (
        <motion.div variants={itemVariants} className="text-center py-32 bg-white/5 rounded-3xl border border-white/5 border-dashed">
          <Activity size={48} className="mx-auto text-muted mb-4 opacity-50" />
          <h2 className="heading-3 mb-2">No Active Intelligence</h2>
          <p className="text-secondary font-medium">Initialize an asset analysis to view predictive matrix.</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Dashboard;
