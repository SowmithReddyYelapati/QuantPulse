import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { format } from 'date-fns';

interface Props {
  data: any[];
  prediction: number;
}

const StockChart = ({ data, prediction }: Props) => {
  if (!data || data.length === 0) return null;

  const chartData = data.map((item: any) => ({
    date: format(new Date(item.Date), 'MMM dd'),
    price: item.Close,
  }));

  const prices = chartData.map(d => d.price);
  const minPrice = Math.min(...prices) * 0.99;
  const maxPrice = Math.max(...prices, prediction) * 1.01;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-card border border-border-bright p-4 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-2">{label}</p>
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-primary rounded-full"></div>
            <p className="text-xl font-black text-white">${payload[0].value.toFixed(2)}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="rgba(255,255,255,0.2)" 
            fontSize={10}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis 
            domain={[minPrice, maxPrice]} 
            stroke="rgba(255,255,255,0.2)" 
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v.toFixed(0)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#6366f1"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorPrice)"
            animationDuration={1500}
          />
          <ReferenceLine 
            y={prediction} 
            stroke="#fff" 
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{ 
              value: 'AI FORECAST', 
              fill: '#fff', 
              fontSize: 8, 
              fontWeight: 900, 
              position: 'insideRight', 
              dy: -10,
              letterSpacing: '1px'
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;
