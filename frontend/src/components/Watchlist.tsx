import { useState } from 'react';
import { Plus, Trash2, Star, Activity } from 'lucide-react';

interface Props {
  currentSymbol: string;
  onSelect: (symbol: string) => void;
}

const Watchlist = ({ currentSymbol, onSelect }: Props) => {
  const [watchlist, setWatchlist] = useState<string[]>(['AAPL', 'TSLA', 'MSFT', 'BTC-USD']);
  const [newSymbol, setNewSymbol] = useState('');

  const addSymbol = () => {
    if (newSymbol && !watchlist.includes(newSymbol.toUpperCase())) {
      setWatchlist([...watchlist, newSymbol.toUpperCase()]);
      setNewSymbol('');
    }
  };

  const removeSymbol = (s: string) => {
    setWatchlist(watchlist.filter(item => item !== s));
  };

  return (
    <div className="card glass">
      <div className="flex justify-between items-center mb-6">
        <h3 className="heading-3 flex items-center gap-2 text-sm">
          <Star className="text-warning-color fill-warning-color" size={16} />
          Market Watch
        </h3>
        <span className="text-[10px] font-black text-muted tracking-widest uppercase">{watchlist.length} Assets</span>
      </div>

      <div className="flex gap-2 mb-6">
        <input 
          type="text" 
          placeholder="Ticker" 
          className="input h-10 text-xs"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addSymbol()}
        />
        <button onClick={addSymbol} className="btn btn-primary h-10 w-10 p-0 rounded-lg">
          <Plus size={18} />
        </button>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {watchlist.map((s, index) => (
          <div 
            key={s}
            className={`flex justify-between items-center p-4 rounded-xl cursor-pointer transition-all border ${currentSymbol === s ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/5' : 'bg-white/5 border-transparent hover:border-white/10'}`}
            onClick={() => onSelect(s)}
          >
            <div className="flex items-center gap-4">
              <div className={`w-1.5 h-1.5 rounded-full ${index % 2 === 0 ? 'bg-success-color shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-danger-color shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
              <div className="flex flex-col">
                <span className="font-black text-sm tracking-tight text-white">{s}</span>
                <span className="text-[9px] font-bold text-muted uppercase">Nasdaq</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className={`text-[11px] font-black ${index % 2 === 0 ? 'text-success-color' : 'text-danger-color'}`}>
                  {index % 2 === 0 ? '▲ +1.2%' : '▼ -0.5%'}
                </span>
                <Activity size={12} className="text-muted opacity-30" />
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  removeSymbol(s);
                }}
                className="p-1.5 text-muted hover:text-danger-color hover:bg-danger-glow rounded-md transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Watchlist;
