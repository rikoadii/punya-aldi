import { useState } from 'react';
import axios from 'axios';
import { Bell, BellOff, Loader2 } from 'lucide-react';

export default function ActuatorToggle() {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleActuator = async () => {
    const newState = !isActive;
    setIsLoading(true);
    
    try {
      await axios.post('http://localhost:5000/api/v1/actuator/toggle', {
        state: newState
      });
      setIsActive(newState);
    } catch (error) {
      console.error('Failed to toggle actuator:', error);
      alert('Gagal mengirim perintah ke actuator!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Kontrol Sirine / LED</h3>
        <p className="text-sm text-slate-500 mt-1">Nyalakan peringatan manual pada perangkat di lapangan.</p>
      </div>

      <button
        onClick={toggleActuator}
        disabled={isLoading}
        className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg
          ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
          ${isActive 
            ? 'bg-rose-500 text-white shadow-rose-500/40 ring-4 ring-rose-200' 
            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
          }
        `}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={32} />
        ) : isActive ? (
          <Bell size={40} className="animate-pulse" />
        ) : (
          <BellOff size={40} />
        )}
      </button>

      <div className="mt-4 text-sm font-medium">
        Status: <span className={isActive ? "text-rose-500" : "text-slate-500"}>{isActive ? 'MENYALA' : 'MATI'}</span>
      </div>
    </div>
  );
}
