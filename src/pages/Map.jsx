import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';

// Componente para invalidar el tamaño del mapa una vez renderizado el contenedor
const MapInvalidator = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

// Solución al problema de carga de iconos por defecto de Leaflet en Vite/Vite builds
const customMarkerIcon = new L.DivIcon({
  html: `<div class="w-6 h-6 rounded-full bg-primary border-2 border-white shadow-lg flex items-center justify-center text-white"><span class="material-symbols-outlined text-[14px]">sports_soccer</span></div>`,
  className: 'custom-leaflet-marker',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

const Map = () => {
  const [stadiums, setStadiums] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null);

  const loadMapData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [stadiumsRes, matchesRes] = await Promise.all([
        api.get('/stadiums'),
        api.get('/matches')
      ]);
      setStadiums(stadiumsRes.data);
      setMatches(matchesRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar los datos del mapa y sedes.');
      setRequestId(err.response?.data?.requestId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-140px)]">
      
      {/* Cabecera */}
      <div className="border-b border-outline-variant pb-2">
        <h2 className="font-display-lg text-display-lg font-bold text-primary mb-1">Mapa de Sedes Oficiales</h2>
        <p className="font-body-sm text-on-surface-variant">Explora los estadios y los partidos asignados a cada sede geográfica.</p>
      </div>

      {/* Alertas de error */}
      {error && (
        <div className="p-3 bg-error-container text-on-error-container border border-error rounded-lg flex gap-2">
          <span className="material-symbols-outlined">error</span>
          <div>
            <span>{error}</span>
            {requestId && <span className="block text-[10px] opacity-75">ID Soporte: {requestId}</span>}
          </div>
        </div>
      )}

      {/* Contenedor del Mapa */}
      <div className="flex-1 rounded-xl overflow-hidden border border-outline-variant shadow-lg relative min-h-[400px]">
        <MapContainer 
          center={[37.0902, -95.7129]} // Centrado en Norte América (USA, México, Canadá)
          zoom={4} 
          style={{ width: '100%', height: '100%' }}
        >
          <MapInvalidator />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {stadiums.map((stadium) => {
            // Filtrar partidos que se juegan en esta sede
            const stadiumMatches = matches.filter((m) => m.stadium?.id === stadium.id);

            return (
              <Marker 
                key={stadium.id} 
                position={[stadium.latitude, stadium.longitude]}
                icon={customMarkerIcon}
              >
                <Popup>
                  <div className="p-1 font-body-sm text-on-surface flex flex-col gap-2 max-w-xs">
                    <div>
                      <h4 className="font-label-bold text-sm text-primary mb-0.5">{stadium.name}</h4>
                      <p className="text-[11px] text-on-surface-variant uppercase font-bold">{stadium.city}, {stadium.country}</p>
                    </div>

                    <div className="border-t border-outline-variant/50 pt-2 flex flex-col gap-1.5">
                      <span className="font-label-bold text-[10px] text-on-surface-variant uppercase tracking-wider block">Partidos Agendados ({stadiumMatches.length})</span>
                      {stadiumMatches.length === 0 ? (
                        <span className="text-[11px] text-outline-variant italic">No hay partidos registrados aún en esta sede.</span>
                      ) : (
                        <ul className="flex flex-col gap-1 max-h-24 overflow-y-auto pr-1">
                          {stadiumMatches.map((m) => {
                            const dateStr = new Date(m.startsAt).toLocaleDateString(undefined, { 
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                            });
                            return (
                              <li key={m.id} className="text-[11px] bg-surface-container-low border border-outline-variant/30 p-1 rounded flex justify-between gap-2">
                                <span className="font-bold">{m.homeTeam?.fifaCode} vs {m.awayTeam?.fifaCode}</span>
                                <span className="text-[9px] opacity-75">{dateStr}</span>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

    </div>
  );
};

export default Map;
