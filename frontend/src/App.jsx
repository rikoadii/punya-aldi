import { useState, useEffect } from 'react';
import axios from 'axios';
import StatusCards from './components/StatusCards';
import TelemetryChart from './components/TelemetryChart';
import StationMap from './components/StationMap';
import ActuatorToggle from './components/ActuatorToggle';
import { ShieldAlert } from 'lucide-react';

function App() {
  const [stationData, setStationData] = useState(null);
  const [error, setError] = useState(null);

  // Polling data setiap 5 detik
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/v1/telemetry/live');
        if (response.data.success && response.data.data.length > 0) {
          // Asumsi kita menampilkan stasiun pertama
          setStationData(response.data.data[0]);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to fetch live data', err);
        setError('Gagal memuat data dari server backend.');
      }
    };

    fetchData(); // Panggilan pertama
    const intervalId = setInterval(fetchData, 5000); // Polling 5s

    return () => clearInterval(intervalId); // Cleanup
  }, []);

  const latestLog = stationData?.logs?.[0] || null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-blue-200">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">Banjir Rob Monitor</h1>
              <p className="text-xs text-slate-500 font-medium">Public Real-Time Dashboard</p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-sm text-right">
              <p className="font-semibold">{stationData?.name || 'Stasiun tidak diketahui'}</p>
              <p className="text-xs text-slate-400">Lat: {stationData?.latitude || 0}, Lng: {stationData?.longitude || 0}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* 1. Status Cards */}
        <StatusCards latestLog={latestLog} />

        {/* 2. Middle Section: Chart & Actuator */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <span className="w-1 h-5 bg-blue-500 rounded-full mr-2"></span>
              Tren Elevasi Air & Logika Fuzzy (24 Jam)
            </h2>
            <TelemetryChart data={stationData?.logs || []} />
          </div>
          
          <div className="lg:col-span-1">
            <ActuatorToggle />
          </div>
        </div>

        {/* 3. Bottom Section: Map */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <span className="w-1 h-5 bg-indigo-500 rounded-full mr-2"></span>
            Peta Lokasi Stasiun Sensor
          </h2>
          {stationData ? (
            <StationMap station={stationData} />
          ) : (
            <div className="h-[300px] bg-slate-100 rounded-xl animate-pulse"></div>
          )}
        </div>
      </main>
      
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-slate-400">
        &copy; {new Date().getFullYear()} Sistem Web Monitoring Banjir Rob (Tanpa Login). All rights reserved.
      </footer>
    </div>
  );
}

export default App;
