import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix leaflet marker icon issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function StationMap({ station }) {
  if (!station) {
    return <div className="h-64 flex items-center justify-center text-slate-400">Menunggu koordinat...</div>;
  }

  const { latitude, longitude, name } = station;
  
  // Calculate if it's live based on the last log time (e.g. within 10 minutes)
  const isLive = station.logs && station.logs.length > 0 && 
    (new Date() - new Date(station.logs[0].createdAt)) < 10 * 60 * 1000;

  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden relative border border-slate-200">
      <MapContainer center={[latitude, longitude]} zoom={13} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]}>
          <Popup>
            <div className="font-semibold text-slate-800">{name}</div>
            <div className="text-sm mt-1 flex items-center gap-2">
              Status: 
              {isLive ? (
                <span className="flex items-center text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1 animate-pulse"></span> Live</span>
              ) : (
                <span className="flex items-center text-slate-500"><span className="w-2 h-2 rounded-full bg-slate-400 mr-1"></span> Offline</span>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      
      {/* Absolute overlay for quick status */}
      <div className="absolute top-4 right-4 z-[400] bg-white px-3 py-1.5 rounded-full shadow-md text-sm font-medium flex items-center">
        {isLive ? (
          <><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span><span className="text-emerald-700">Live</span></>
        ) : (
          <><span className="w-2.5 h-2.5 rounded-full bg-slate-400 mr-2"></span><span className="text-slate-600">Offline</span></>
        )}
      </div>
    </div>
  );
}
