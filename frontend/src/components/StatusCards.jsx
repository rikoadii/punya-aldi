import { Activity, Waves, TrendingUp, AlertTriangle } from 'lucide-react';

export default function StatusCards({ latestLog }) {
  if (!latestLog) {
    return <div className="text-slate-500 italic">Menunggu data...</div>;
  }

  const { waterLevel, rateOfRise, fuzzyValue, status } = latestLog;

  // Tentukan warna berdasarkan status
  let statusColor = "bg-emerald-100 text-emerald-700 border-emerald-200";
  let StatusIcon = Activity;
  if (status === 'Siaga') {
    statusColor = "bg-amber-100 text-amber-700 border-amber-200";
    StatusIcon = AlertTriangle;
  } else if (status === 'Awas') {
    statusColor = "bg-rose-100 text-rose-700 border-rose-200";
    StatusIcon = AlertTriangle;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">Water Level</p>
          <h3 className="text-2xl font-bold text-slate-800">{waterLevel} <span className="text-sm font-normal text-slate-400">m</span></h3>
        </div>
        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
          <Waves size={24} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">Rate of Rise</p>
          <h3 className="text-2xl font-bold text-slate-800">{rateOfRise?.toFixed(2) || 0} <span className="text-sm font-normal text-slate-400">m/h</span></h3>
        </div>
        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500">
          <TrendingUp size={24} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">Fuzzy Value</p>
          <h3 className="text-2xl font-bold text-slate-800">{fuzzyValue}</h3>
        </div>
        <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-500">
          <Activity size={24} />
        </div>
      </div>

      <div className={`p-6 rounded-2xl shadow-sm border flex items-center justify-between ${statusColor}`}>
        <div>
          <p className="text-sm font-medium mb-1 opacity-80">Status Peringatan</p>
          <h3 className="text-2xl font-bold uppercase">{status}</h3>
        </div>
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/40">
          <StatusIcon size={24} />
        </div>
      </div>
    </div>
  );
}
