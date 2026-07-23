import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap } from 'react-leaflet';
import { Shield, Clock, Activity, Bed, Zap } from 'lucide-react';

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    // Force Leaflet to recalculate size after mount and after a slight delay
    // to ensure CSS layouts have finished settling
    map.invalidateSize();
    const timeout = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(timeout);
  }, [map]);
  return null;
}

const HOSPITALS = [
  { id: 1, name: 'Central Stroke Center', lat: 51.501, lng: -0.119, dtn: 35, rate: 24, size: 8, beds: 120, angels: 'Diamond' },
  { id: 2, name: 'East General Hospital', lat: 51.518, lng: -0.059, dtn: 42, rate: 18, size: 6, beds: 95, angels: 'Platinum' },
  { id: 3, name: 'South Regional Hospital', lat: 51.466, lng: -0.093, dtn: 28, rate: 29, size: 9, beds: 150, angels: 'Diamond' },
  { id: 4, name: 'West Community Clinic', lat: 51.426, lng: -0.176, dtn: 55, rate: 14, size: 7, beds: 110, angels: 'Gold' },
  { id: 5, name: 'North University Medical', lat: 51.524, lng: -0.134, dtn: 40, rate: 21, size: 8, beds: 130, angels: 'Platinum' },
];

const CONNECTIONS = [
  [HOSPITALS[0], HOSPITALS[1]],
  [HOSPITALS[0], HOSPITALS[2]],
  [HOSPITALS[2], HOSPITALS[3]],
  [HOSPITALS[0], HOSPITALS[4]],
];

const getDtnColor = (dtn: number) => {
  if (dtn <= 30) return '#4ade80'; // success
  if (dtn <= 45) return '#fbbf24'; // warning
  return '#f87171'; // critical
};

const getBadgeClass = (dtn: number) => {
  if (dtn <= 30) return 'bg-success/20 text-success border border-success/30';
  if (dtn <= 45) return 'bg-warning/20 text-warning border border-warning/30';
  return 'bg-critical/20 text-critical border border-critical/30';
};

const getAngelsColor = (status: string) => {
  switch (status) {
    case 'Diamond': return 'text-cyan glow-cyan';
    case 'Platinum': return 'text-slate-300';
    case 'Gold': return 'text-yellow-400';
    default: return 'text-slate-500';
  }
};

export default function StrokeUnitMapInner() {
  return (
    <>
      <MapContainer 
        center={[51.48, -0.12]} 
        zoom={11} 
        style={{ height: '100%', minHeight: '500px', width: '100%', background: '#030712' }}
        zoomControl={false}
      >
        <MapResizer />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Connection Lines */}
        {CONNECTIONS.map((conn, idx) => (
          <Polyline 
            key={`conn-${idx}`}
            positions={[[conn[0].lat, conn[0].lng], [conn[1].lat, conn[1].lng]]}
            pathOptions={{ color: '#38BDF8', weight: 1.5, dashArray: '5, 8', opacity: 0.4 }}
          />
        ))}

        {HOSPITALS.map((hospital) => {
          const color = getDtnColor(hospital.dtn);
          
          return (
            <React.Fragment key={hospital.id}>
              {/* Outer Glow Halo */}
              <CircleMarker
                center={[hospital.lat, hospital.lng]}
                radius={hospital.size * 2.5}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.15,
                  color: 'transparent',
                  weight: 0
                }}
              />
              
              {/* Inner Core Marker */}
              <CircleMarker
                center={[hospital.lat, hospital.lng]}
                radius={hospital.size}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.9,
                  color: '#030712',
                  weight: 2
                }}
              >
                <Popup className="premium-map-popup">
                  <div className="p-1 min-w-[220px] font-sans">
                    <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-cyan" />
                      {hospital.name}
                    </h3>
                    
                    <div className="space-y-4">
                      {/* DTN Metric */}
                      <div className="flex justify-between items-center bg-slate-800/40 p-2 rounded-lg border border-slate-700/50">
                        <span className="text-slate-400 text-sm flex items-center gap-1">
                          <Clock className="w-3 h-3" /> DTN Time
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold font-mono ${getBadgeClass(hospital.dtn)}`}>
                          {hospital.dtn}m
                        </span>
                      </div>

                      {/* Thrombolysis Rate */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400 flex items-center gap-1"><Activity className="w-3 h-3" /> Rate</span>
                          <span className="text-white font-mono">{hospital.rate}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-cyan rounded-full shadow-[0_0_8px_#38BDF8]" 
                            style={{ width: `${hospital.rate}%` }}
                          />
                        </div>
                      </div>

                      {/* Footer Metrics */}
                      <div className="flex justify-between items-center pt-2 border-t border-slate-700/50 text-sm">
                        <div className="flex items-center gap-1 text-slate-300">
                          <Bed className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="font-mono">{hospital.beds}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className={`w-3.5 h-3.5 ${getAngelsColor(hospital.angels)}`} />
                          <span className={`font-semibold ${getAngelsColor(hospital.angels)}`}>{hospital.angels}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            </React.Fragment>
          );
        })}
      </MapContainer>
      
      {/* Required Leaflet Popup CSS overrides to make them look good with dark mode */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-popup-content-wrapper {
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(56, 189, 248, 0.2);
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.8), 0 0 20px rgba(56, 189, 248, 0.1);
          border-radius: 12px;
          color: white;
        }
        .leaflet-popup-tip {
          background: rgba(15, 23, 42, 0.85);
          border-right: 1px solid rgba(56, 189, 248, 0.2);
          border-bottom: 1px solid rgba(56, 189, 248, 0.2);
        }
        .leaflet-container a.leaflet-popup-close-button {
          color: #94a3b8;
          padding: 8px;
        }
        .leaflet-container a.leaflet-popup-close-button:hover {
          color: #38bdf8;
        }
        /* Fix missing tile background issue */
        .leaflet-container {
          background: transparent !important;
        }
      `}} />
    </>
  );
}
