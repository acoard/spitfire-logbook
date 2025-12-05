import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { LogEntry, AircraftCategory } from '../types';
import FlightInfoPanel from './FlightInfoPanel';

// Fix for default Leaflet icon not showing
const createIcon = (color: string, count?: number) => {
  // If count > 1, show a badge
  if (count && count > 1) {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="position: relative;">
          <div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.5);"></div>
          <div style="
            position: absolute;
            top: -8px;
            right: -8px;
            background: #1c1917;
            color: #fef3c7;
            font-size: 10px;
            font-weight: bold;
            min-width: 16px;
            height: 16px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1.5px solid #f4f1ea;
            font-family: 'Special Elite', monospace;
            box-shadow: 0 1px 3px rgba(0,0,0,0.4);
          ">${count}</div>
        </div>
      `,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
  }
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

// Group entries by location key
interface LocationGroup {
  key: string;
  lat: number;
  lng: number;
  entries: LogEntry[];
  primaryCategory: AircraftCategory;
}

const createLocationKey = (lat: number, lng: number): string => {
  // Round to 3 decimal places to group nearby coordinates
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
};

interface MapPanelProps {
  entries: LogEntry[];
  selectedEntry: LogEntry | null;
  onMarkerSelect: (entry: LogEntry) => void;
  shouldCenter: boolean;
  customCenter?: [number, number];
  customZoom?: number;
  isTimelineCollapsed?: boolean;
  closePopoverTrigger?: number;
}

// Robust coordinate validation
const isValidCoord = (val: any): boolean => {
  return typeof val === 'number' && !isNaN(val) && isFinite(val);
};

// Component to handle map movement and responsive resizing
const MapController: React.FC<{ 
  center: [number, number]; 
  zoom: number; 
  shouldCenter: boolean;
  onMapReady?: (map: L.Map) => void;
}> = ({ center, zoom, shouldCenter, onMapReady }) => {
  const map = useMap();
  
  useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);
  
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

const MapPanel: React.FC<MapPanelProps> = React.memo(({ entries, selectedEntry, onMarkerSelect, shouldCenter, customCenter, customZoom, isTimelineCollapsed = false, closePopoverTrigger }) => {
  
  // Calculate map center based on selection with validation
  // Default to English Channel/Europe view
  const centerPosition = useMemo((): [number, number] => {
    if (customCenter) return customCenter;
    if (selectedEntry && selectedEntry.origin && isValidCoord(selectedEntry.origin.lat) && isValidCoord(selectedEntry.origin.lng)) {
      return [selectedEntry.origin.lat, selectedEntry.origin.lng];
    }
    return [50.5, 0.0];
  }, [customCenter, selectedEntry]);

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

  // Group entries by location
  const locationGroups = useMemo(() => {
    const groups = new Map<string, LocationGroup>();
    
    validEntries.forEach(entry => {
      const key = createLocationKey(entry.origin.lat, entry.origin.lng);
      
      if (groups.has(key)) {
        groups.get(key)!.entries.push(entry);
      } else {
        groups.set(key, {
          key,
          lat: entry.origin.lat,
          lng: entry.origin.lng,
          entries: [entry],
          primaryCategory: entry.aircraftCategory
        });
      }
    });
    
    // Update primary category to the most common category at this location
    groups.forEach(group => {
      // Count occurrences of each category
      const categoryCounts = new Map<AircraftCategory, number>();
      group.entries.forEach(e => {
        categoryCounts.set(e.aircraftCategory, (categoryCounts.get(e.aircraftCategory) || 0) + 1);
      });
      // Find the most common category
      let maxCount = 0;
      let mostCommon = group.entries[0].aircraftCategory;
      categoryCounts.forEach((count, cat) => {
        if (count > maxCount) {
          maxCount = count;
          mostCommon = cat;
        }
      });
      group.primaryCategory = mostCommon;
    });
    
    return Array.from(groups.values());
  }, [validEntries]);

  // State for mission selector popup
  const [activeSelectorGroup, setActiveSelectorGroup] = useState<LocationGroup | null>(null);
  
  // State for popover position (pixel coordinates relative to map container)
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null);
  
  // Ref to access the map instance for coordinate conversion
  const mapRef = React.useRef<L.Map | null>(null);
  
  // State for hover preview (highlights path without selecting)
  const [hoveredEntryId, setHoveredEntryId] = useState<string | null>(null);

  // Handle marker click - show selector if multiple missions, otherwise select directly
  const handleMarkerClick = (group: LocationGroup, e: L.LeafletMouseEvent) => {
    if (group.entries.length === 1) {
      onMarkerSelect(group.entries[0]);
    } else {
      // Get pixel position from the click event
      const containerPoint = e.containerPoint;
      setPopoverPosition({ x: containerPoint.x, y: containerPoint.y });
      setActiveSelectorGroup(group);
    }
  };

  // Handle mission selection from the popup
  const handleMissionSelect = (entry: LogEntry) => {
    onMarkerSelect(entry);
    setActiveSelectorGroup(null);
    setHoveredEntryId(null);
    setPopoverPosition(null);
  };

  // Close selector when clicking elsewhere or when selection changes
  useEffect(() => {
    if (selectedEntry) {
      setActiveSelectorGroup(null);
      setHoveredEntryId(null);
      setPopoverPosition(null);
    }
  }, [selectedEntry?.id]);

  // Close popover when triggered externally (e.g., when clicking a location link)
  useEffect(() => {
    if (closePopoverTrigger) {
      setActiveSelectorGroup(null);
      setHoveredEntryId(null);
      setPopoverPosition(null);
      // Also close any open Leaflet native popups
      if (mapRef.current) {
        mapRef.current.closePopup();
      }
    }
  }, [closePopoverTrigger]);

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={centerPosition} 
        zoom={zoomLevel} 
        style={{ height: "100%", width: "100%", background: '#e5e5e5', filter: 'sepia(0.1) contrast(1)' }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        {/* Zoom controls positioned at top-right */}
        <ZoomControl position="topright" />
        
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
        />
        
        <MapController 
          center={centerPosition} 
          zoom={zoomLevel} 
          shouldCenter={shouldCenter}
          onMapReady={(map) => { mapRef.current = map; }}
        />

        {/* Render Routes (Polylines) first so markers sit on top */}
        {validEntries.map((entry) => {
             const isActive = selectedEntry?.id === entry.id;
             const isHovered = hoveredEntryId === entry.id;
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
                            color: isHovered ? '#fff' : getColor(entry.aircraftCategory),
                            weight: isActive ? 4 : isHovered ? 5 : 2,
                            opacity: isActive ? 1 : isHovered ? 1 : 0.4,
                            dashArray: (isActive || isHovered) ? undefined : '5, 10'
                        }}
                    />
                )
             }
             return null;
        })}

        {/* Render Origin Markers (grouped by location) */}
        {locationGroups.map((group) => {
          const isGroupSelected = group.entries.some(e => selectedEntry?.id === e.id);
          const count = group.entries.length;
          
          return (
            <Marker
              key={`group-marker-${group.key}`}
              position={[group.lat, group.lng]}
              icon={createIcon(getColor(group.primaryCategory), count)}
              opacity={isGroupSelected || selectedEntry === null ? 1 : 0.6}
              zIndexOffset={isGroupSelected ? 1000 : count > 1 ? 500 : 0}
              eventHandlers={{
                  click: (e) => handleMarkerClick(group, e)
              }}
            />
          );
        })}

        {/* Render Target Markers for all entries */}
        {validEntries.map((entry) => (
          entry.target && isValidCoord(entry.target.lat) && isValidCoord(entry.target.lng) && (
            <Marker
              key={`target-${entry.id}`}
              position={[entry.target.lat, entry.target.lng]}
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
          )
        ))}
        
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

      {/* Flight Info Panel - responsive, positioned above timeline */}
      <FlightInfoPanel 
        selectedEntry={selectedEntry} 
        variant="light" 
        isTimelineCollapsed={isTimelineCollapsed}
      />

      {/* Mission Selector Popup - appears when clicking a marker with multiple missions */}
      {activeSelectorGroup && popoverPosition && (() => {
        const mapHeight = mapRef.current?.getContainer().clientHeight || window.innerHeight;
        const showBelow = popoverPosition.y < 220;

        return (
          <>
            {/* Backdrop - very subtle, click to close */}
            <div 
              className="absolute inset-0 z-[399] bg-stone-900/5 pointer-events-auto"
              onClick={() => { setActiveSelectorGroup(null); setHoveredEntryId(null); setPopoverPosition(null); }}
            />
            
            {/* Selector Panel - positioned near marker */}
            <div 
              className="absolute z-[400] bg-[#f4f1ea] rounded shadow-xl border border-stone-400 w-64 max-h-[45%] overflow-hidden pointer-events-auto"
              style={{
                // Position above/below the marker, centered horizontally
                left: `${Math.max(8, Math.min(popoverPosition.x - 128, window.innerWidth - 272))}px`,
                top: showBelow ? `${popoverPosition.y + 15}px` : `${Math.max(8, popoverPosition.y - 15)}px`,
                // Shift up by the panel's height if showing above
                transform: showBelow ? 'none' : 'translateY(-100%)',
              }}
            >
              {/* Arrow pointing to marker */}
              {!showBelow && (
                <>
                  <div 
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0"
                    style={{
                      borderLeft: '8px solid transparent',
                      borderRight: '8px solid transparent',
                      borderTop: '8px solid #a8a29e',
                    }}
                  />
                  <div 
                    className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-0 h-0"
                    style={{
                      borderLeft: '7px solid transparent',
                      borderRight: '7px solid transparent',
                      borderTop: '7px solid #f4f1ea',
                    }}
                  />
                </>
              )}
              {showBelow && (
                <>
                  <div 
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0"
                    style={{
                      borderLeft: '8px solid transparent',
                      borderRight: '8px solid transparent',
                      borderBottom: '8px solid #a8a29e',
                    }}
                  />
                  <div 
                    className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-0 h-0"
                    style={{
                      borderLeft: '7px solid transparent',
                      borderRight: '7px solid transparent',
                      borderBottom: '7px solid #f4f1ea',
                    }}
                  />
                </>
              )}
              
              {/* Header */}
              <div className="bg-stone-200/90 border-b border-stone-300 px-2.5 py-1.5 flex items-center justify-between">
                <div className="min-w-0">
                  <h3 className="font-typewriter text-[11px] font-bold text-stone-800 uppercase tracking-wide truncate">
                    {activeSelectorGroup.entries[0]?.origin.name}
                  </h3>
                  <p className="font-typewriter text-[9px] text-stone-500">
                    {activeSelectorGroup.entries.length} missions
                  </p>
                </div>
                <button
                  onClick={() => { setActiveSelectorGroup(null); setHoveredEntryId(null); setPopoverPosition(null); }}
                  className="w-5 h-5 flex items-center justify-center rounded bg-stone-300/80 hover:bg-stone-400/80 text-stone-600 hover:text-stone-800 transition-colors flex-shrink-0 ml-2"
                >
                  <span className="text-sm leading-none">&times;</span>
                </button>
              </div>
              
              {/* Mission List - compact */}
              <div className="overflow-y-auto max-h-[calc(45vh-50px)] p-1.5 space-y-1">
                {activeSelectorGroup.entries.map((entry) => {
                  const isHovered = hoveredEntryId === entry.id;
                  return (
                    <button
                      key={entry.id}
                      onClick={() => handleMissionSelect(entry)}
                      onMouseEnter={() => setHoveredEntryId(entry.id)}
                      onMouseLeave={() => setHoveredEntryId(null)}
                      className={`
                        w-full text-left px-2 py-1.5 rounded transition-all duration-100
                        ${selectedEntry?.id === entry.id 
                          ? 'bg-amber-100 border border-amber-400' 
                          : isHovered
                            ? 'bg-white border border-stone-400 shadow-sm'
                            : 'bg-white/60 border border-transparent hover:bg-white hover:border-stone-300'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        {/* Category Indicator */}
                        <span 
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getColor(entry.aircraftCategory) }}
                        />
                        
                        {/* Mission Details - single line */}
                        <div className="flex-1 min-w-0 flex items-center gap-1.5">
                          <span className="font-typewriter text-[10px] font-bold text-stone-700 flex-shrink-0">
                            {entry.date}
                          </span>
                          <span className="font-typewriter text-[10px] text-stone-500 truncate">
                            {entry.duty}
                          </span>
                          {entry.isSignificant && (
                            <span className="px-1 py-0.5 bg-red-100 text-red-600 text-[7px] font-bold rounded flex-shrink-0">
                              ★
                            </span>
                          )}
                        </div>
                        
                        {/* Hover indicator */}
                        {isHovered && (
                          <svg className="w-3 h-3 text-stone-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        );
      })()}

      {/* Map Legend Overlay - top right, below zoom controls */}
      <div className="absolute top-16 right-2 sm:top-20 sm:right-4 bg-[#f4f1ea] p-1.5 md:p-3 rounded-sm shadow-xl border md:border-2 border-stone-400 text-[9px] md:text-xs font-serif z-[100] transform md:rotate-1 block">
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
