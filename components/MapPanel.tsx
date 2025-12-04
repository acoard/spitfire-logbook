import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { LogEntry, AircraftCategory } from '../types';
import FlightInfoPanel from './FlightInfoPanel';

// Fix for default Leaflet icon not showing
const createIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

interface MapPanelProps {
  entries: LogEntry[];
  selectedEntry: LogEntry | null;
  onMarkerSelect: (entry: LogEntry) => void;
  shouldCenter: boolean;
  customCenter?: [number, number];
  customZoom?: number;
}

// Robust coordinate validation
const isValidCoord = (val: any): boolean => {
  return typeof val === 'number' && !isNaN(val) && isFinite(val);
};

// Component to handle map movement and responsive resizing
const MapController: React.FC<{ center: [number, number]; zoom: number; shouldCenter: boolean }> = ({ center, zoom, shouldCenter }) => {
  const map = useMap();
  useEffect(() => {
    if (shouldCenter && isValidCoord(center[0]) && isValidCoord(center[1])) {
      try {
        map.flyTo(center, zoom, { duration: 1.5 });
      } catch (e) {
        console.warn("Map flyTo failed:", e);
      }
    }
  }, [center, zoom, map, shouldCenter]);

  useEffect(() => {
    if (!map) return;
    
    const container = map.getContainer();
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    
    observer.observe(container);
    return () => {
      observer.disconnect();
    };
  }, [map]);
  return null;
};

const MapPanel: React.FC<MapPanelProps> = React.memo(({ entries, selectedEntry, onMarkerSelect, shouldCenter, customCenter, customZoom }) => {
  
  // Calculate map center based on selection with validation
  // Default to English Channel/Europe view
  let centerPosition: [number, number] = customCenter || [50.5, 0.0]; 

  if (!customCenter && selectedEntry && selectedEntry.origin && isValidCoord(selectedEntry.origin.lat) && isValidCoord(selectedEntry.origin.lng)) {
    centerPosition = [selectedEntry.origin.lat, selectedEntry.origin.lng];
  }

  const zoomLevel = customZoom || (selectedEntry ? 7 : 5);

  const getColor = (cat: AircraftCategory) => {
    switch (cat) {
      case AircraftCategory.TRAINING: return '#EAB308'; // yellow-500
      case AircraftCategory.FIGHTER: return '#DC2626'; // red-600
      case AircraftCategory.TRANSPORT: return '#3B82F6'; // blue-500
      default: return '#64748B';
    }
  };

  // Pre-filter entries to ensure we ONLY render valid data
  const validEntries = useMemo(() => {
    return entries.filter(entry => 
      entry.origin && 
      isValidCoord(entry.origin.lat) && 
      isValidCoord(entry.origin.lng)
    );
  }, [entries]);

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={centerPosition} 
        zoom={zoomLevel} 
        style={{ height: "100%", width: "100%", background: '#e5e5e5', filter: 'sepia(0.1) contrast(1)' }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        {/* Zoom controls positioned at bottom-left to avoid toggle overlap */}
        <ZoomControl position="bottomleft" />
        
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
        />
        
        <MapController center={centerPosition} zoom={zoomLevel} shouldCenter={shouldCenter} />

        {/* Render Routes (Polylines) first so markers sit on top */}
        {validEntries.map((entry) => {
             const isActive = selectedEntry?.id === entry.id;
             const pathPoints: [number, number][] = [[entry.origin.lat, entry.origin.lng]];
             
             // Add target point if it exists
             if (entry.target && isValidCoord(entry.target.lat) && isValidCoord(entry.target.lng)) {
                 pathPoints.push([entry.target.lat, entry.target.lng]);
             }

             // Add destination point if it exists and differs from last point
             if (entry.destination && isValidCoord(entry.destination.lat) && isValidCoord(entry.destination.lng)) {
                 const lastPoint = pathPoints[pathPoints.length - 1];
                 if (lastPoint[0] !== entry.destination.lat || lastPoint[1] !== entry.destination.lng) {
                     pathPoints.push([entry.destination.lat, entry.destination.lng]);
                 }
             }

             // Only draw if we have more than 1 point (i.e. a line)
             if (pathPoints.length > 1) {
                return (
                    <Polyline 
                        key={`line-${entry.id}`}
                        positions={pathPoints}
                        pathOptions={{ 
                            color: getColor(entry.aircraftCategory),
                            weight: isActive ? 4 : 2,
                            opacity: isActive ? 1 : 0.4,
                            dashArray: isActive ? undefined : '5, 10'
                        }}
                    />
                )
             }
             return null;
        })}

        {/* Render Markers */}
        {validEntries.map((entry) => {
          return (
            <React.Fragment key={`group-${entry.id}`}>
                {/* Origin Marker */}
                <Marker
                  key={`marker-${entry.id}`}
                  position={[entry.origin.lat, entry.origin.lng]}
                  icon={createIcon(getColor(entry.aircraftCategory))}
                  opacity={selectedEntry?.id === entry.id || selectedEntry === null ? 1 : 0.6}
                  zIndexOffset={selectedEntry?.id === entry.id ? 1000 : 0}
                  eventHandlers={{
                      click: () => {
                          onMarkerSelect(entry);
                      }
                  }}
                >
                  <Popup className="font-serif">
                    <div className="p-1 min-w-[150px]">
                      <h3 className="font-bold text-sm border-b pb-1 mb-1 text-stone-800">{entry.origin.name}</h3>
                      <div className="text-xs text-stone-600 space-y-1">
                        <p><span className="font-semibold">Date:</span> {entry.date}</p>
                        <p><span className="font-semibold">Aircraft:</span> {entry.aircraftType}</p>
                        <p><span className="font-semibold">Duty:</span> {entry.duty}</p>
                        {entry.isSignificant && (
                             <p className="text-red-700 font-bold mt-1 bg-red-50 p-1 border border-red-100 text-center uppercase text-[10px]">High Priority Event</p>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {/* Target Marker (only for selected entry or significant ones to avoid clutter?) 
                    Decided: Show for all valid targets to visualize the missions. */}
                {entry.target && isValidCoord(entry.target.lat) && isValidCoord(entry.target.lng) && (
                    <Marker
                        key={`target-${entry.id}`}
                        position={[entry.target.lat, entry.target.lng]}
                        // Use a distinct color (black/dark grey) for targets
                        icon={createIcon('#1c1917')} 
                        opacity={selectedEntry?.id === entry.id ? 1 : 0.5}
                        zIndexOffset={selectedEntry?.id === entry.id ? 1000 : 0}
                        eventHandlers={{
                            click: () => { onMarkerSelect(entry); }
                        }}
                    >
                        <Popup className="font-serif">
                            <div className="p-1">
                                <h3 className="font-bold text-sm border-b pb-1 mb-1 text-stone-800">
                                    {entry.target.name} {entry.targetIsApproximate && "(Approx)"}
                                </h3>
                                <p className="text-xs font-semibold text-red-800">Mission Target</p>
                            </div>
                        </Popup>
                    </Marker>
                )}
            </React.Fragment>
          );
        })}
        
        {/* Destination Marker for selected entry if different */}
        {selectedEntry && 
         selectedEntry.destination && 
         isValidCoord(selectedEntry.destination.lat) && 
         isValidCoord(selectedEntry.destination.lng) && (
             (selectedEntry.origin.lat !== selectedEntry.destination.lat || selectedEntry.origin.lng !== selectedEntry.destination.lng) && (
                <Marker
                    position={[selectedEntry.destination.lat, selectedEntry.destination.lng]}
                    icon={createIcon(getColor(selectedEntry.aircraftCategory))}
                    zIndexOffset={1001}
                >
                     <Popup className="font-serif">
                        <div className="p-1">
                            <h3 className="font-bold text-sm border-b pb-1 mb-1">{selectedEntry.destination.name}</h3>
                            <p className="text-xs">Destination</p>
                        </div>
                    </Popup>
                </Marker>
             )
        )}

      </MapContainer>

      {/* Flight Info Panel - responsive and always visible */}
      <div className="absolute left-2 right-2 sm:left-4 sm:right-auto top-20 sm:top-16 z-[200] max-w-xs sm:max-w-none">
        <FlightInfoPanel selectedEntry={selectedEntry} variant="light" />
      </div>

      {/* Map Legend Overlay - responsive positioning and sizing */}
      <div className="absolute bottom-2 right-2 md:bottom-6 md:right-6 bg-[#f4f1ea] p-1.5 md:p-3 rounded-sm shadow-xl border md:border-2 border-stone-400 text-[9px] md:text-xs font-serif z-[400] transform md:rotate-1 block">
        <h4 className="font-bold mb-1 md:mb-2 text-stone-800 border-b border-stone-300 pb-0.5 md:pb-1 text-[8px] md:text-xs">
          <span className="hidden md:inline">MAP KEY</span>
          <span className="md:hidden">KEY</span>
        </h4>
        <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-1.5">
            <span className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500 border border-stone-600 shadow-sm flex-shrink-0"></span>
            <span className="font-typewriter text-stone-700 hidden md:inline">TRAINING</span>
            <span className="font-typewriter text-stone-700 md:hidden">TRN</span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-1.5">
            <span className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-600 border border-stone-600 shadow-sm flex-shrink-0"></span>
            <span className="font-typewriter text-stone-700 hidden md:inline">COMBAT</span>
            <span className="font-typewriter text-stone-700 md:hidden">OPS</span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
            <span className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-blue-500 border border-stone-600 shadow-sm flex-shrink-0"></span>
            <span className="font-typewriter text-stone-700 hidden md:inline">TRANSPORT</span>
            <span className="font-typewriter text-stone-700 md:hidden">TRP</span>
        </div>
      </div>
    </div>
  );
});

export default MapPanel;
