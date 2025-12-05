import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { LogEntry, AircraftCategory } from '../types';
import FlightInfoPanel from './FlightInfoPanel';

// ============================================================================
// SPITFIRE CONFIGURATION - Set to false to disable the animated plane
// ============================================================================
const ENABLE_SPITFIRE_ANIMATION = true;

// ============================================================================
// SPITFIRE SVG - Spitfire IXe top-down silhouette
// This is isolated here for easy removal if quality is insufficient.
// Simply set ENABLE_SPITFIRE_ANIMATION to false above to disable.
// ============================================================================
const SPITFIRE_SVG = `
<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <!-- Spitfire IXe top-down silhouette - distinctive elliptical wings -->
  <g fill="#1a1a1a" stroke="#333" stroke-width="0.5">
    <!-- Fuselage -->
    <ellipse cx="30" cy="30" rx="3" ry="22" />
    <!-- Nose cone -->
    <ellipse cx="30" cy="6" rx="2" ry="4" />
    <!-- Tail -->
    <path d="M 28 50 Q 30 56 32 50 Z" />
    <!-- Main wings - distinctive elliptical Spitfire shape -->
    <ellipse cx="30" cy="26" rx="28" ry="5" />
    <!-- Wing leading edge detail -->
    <ellipse cx="30" cy="24" rx="26" ry="2" opacity="0.3"/>
    <!-- Horizontal stabilizer -->
    <ellipse cx="30" cy="48" rx="10" ry="2.5" />
    <!-- Vertical stabilizer -->
    <path d="M 30 46 L 30 54 L 32 52 L 32 46 Z" />
    <!-- Cockpit canopy -->
    <ellipse cx="30" cy="22" rx="2" ry="4" fill="#2a3a4a" stroke="none"/>
    <!-- Engine cowling detail -->
    <circle cx="30" cy="10" r="2.5" fill="#222" stroke="none"/>
    <!-- Propeller disc (motion blur effect) -->
    <ellipse cx="30" cy="4" rx="6" ry="1.5" fill="#666" opacity="0.4"/>
  </g>
</svg>
`;

// Create Spitfire DivIcon for Leaflet
const createSpitfireIcon = (rotation: number) => {
  return L.divIcon({
    className: 'spitfire-icon',
    html: `<div style="
      transform: rotate(${rotation}deg);
      width: 40px;
      height: 40px;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
      transition: transform 0.1s ease-out;
    ">${SPITFIRE_SVG}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

// ============================================================================
// MARKER ICONS
// ============================================================================

// Standard marker for inactive flights
const createIcon = (color: string, size: number = 14) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background-color: ${color}; 
      width: ${size}px; 
      height: ${size}px; 
      border-radius: 50%; 
      border: 2px solid white; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

// Pulsing marker for active origin
const createPulsingIcon = (color: string) => {
  return L.divIcon({
    className: 'pulsing-marker',
    html: `
      <div class="pulse-ring" style="--pulse-color: ${color}"></div>
      <div class="pulse-core" style="background-color: ${color}"></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Diamond marker for target locations
const createDiamondIcon = (color: string, isActive: boolean) => {
  const size = isActive ? 18 : 12;
  return L.divIcon({
    className: isActive ? 'diamond-marker-active' : 'diamond-marker',
    html: `
      ${isActive ? '<div class="diamond-pulse" style="--diamond-color: ' + color + '"></div>' : ''}
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        transform: rotate(45deg);
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.5);
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

// Grouped marker for locations with multiple missions
const createGroupedIcon = (color: string, count: number, hasSelectedEntry: boolean) => {
  const size = 18;
  return L.divIcon({
    className: 'grouped-marker',
    html: `
      <div style="position: relative;">
        <div style="
          background-color: ${color}; 
          width: ${size}px; 
          height: ${size}px; 
          border-radius: 50%; 
          border: 2px solid white; 
          box-shadow: 0 2px 6px rgba(0,0,0,0.5);
          opacity: ${hasSelectedEntry ? 0.6 : 1};
        "></div>
        <div style="
          position: absolute;
          top: -8px;
          right: -10px;
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
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

// ============================================================================
// LOCATION GROUPING
// ============================================================================

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
}

// Robust coordinate validation
const isValidCoord = (val: any): boolean => {
  return typeof val === 'number' && !isNaN(val) && isFinite(val);
};

// ============================================================================
// ANIMATION UTILITIES
// ============================================================================

// Calculate bearing between two points (for plane rotation)
const calculateBearing = (start: [number, number], end: [number, number]): number => {
  const startLat = start[0] * Math.PI / 180;
  const startLng = start[1] * Math.PI / 180;
  const endLat = end[0] * Math.PI / 180;
  const endLng = end[1] * Math.PI / 180;
  
  const dLng = endLng - startLng;
  
  const x = Math.sin(dLng) * Math.cos(endLat);
  const y = Math.cos(startLat) * Math.sin(endLat) - 
            Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);
  
  let bearing = Math.atan2(x, y) * 180 / Math.PI;
  return (bearing + 360) % 360;
};

// Interpolate position along a path
const interpolateAlongPath = (
  pathPoints: [number, number][],
  progress: number // 0 to 1
): { position: [number, number]; bearing: number } => {
  if (pathPoints.length < 2) {
    return { position: pathPoints[0], bearing: 0 };
  }
  
  // Calculate total path length
  let totalLength = 0;
  const segmentLengths: number[] = [];
  
  for (let i = 0; i < pathPoints.length - 1; i++) {
    const dx = pathPoints[i + 1][0] - pathPoints[i][0];
    const dy = pathPoints[i + 1][1] - pathPoints[i][1];
    const length = Math.sqrt(dx * dx + dy * dy);
    segmentLengths.push(length);
    totalLength += length;
  }
  
  // Find position at progress
  const targetDistance = progress * totalLength;
  let accumulatedDistance = 0;
  
  for (let i = 0; i < segmentLengths.length; i++) {
    if (accumulatedDistance + segmentLengths[i] >= targetDistance) {
      // Interpolate within this segment
      const segmentProgress = (targetDistance - accumulatedDistance) / segmentLengths[i];
      const lat = pathPoints[i][0] + (pathPoints[i + 1][0] - pathPoints[i][0]) * segmentProgress;
      const lng = pathPoints[i][1] + (pathPoints[i + 1][1] - pathPoints[i][1]) * segmentProgress;
      const bearing = calculateBearing(pathPoints[i], pathPoints[i + 1]);
      
      return { position: [lat, lng], bearing };
    }
    accumulatedDistance += segmentLengths[i];
  }
  
  // At the end
  const lastIdx = pathPoints.length - 1;
  return { 
    position: pathPoints[lastIdx], 
    bearing: calculateBearing(pathPoints[lastIdx - 1], pathPoints[lastIdx])
  };
};

// ============================================================================
// ANIMATED SPITFIRE COMPONENT
// ============================================================================

interface AnimatedSpitfireProps {
  pathPoints: [number, number][];
  isActive: boolean;
}

const AnimatedSpitfire: React.FC<AnimatedSpitfireProps> = ({ pathPoints, isActive }) => {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  const ANIMATION_DURATION = 8000; // 8 seconds per loop
  
  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }
    
    const elapsed = timestamp - startTimeRef.current;
    const progress = (elapsed % ANIMATION_DURATION) / ANIMATION_DURATION;
    
    const { position, bearing } = interpolateAlongPath(pathPoints, progress);
    
    if (markerRef.current) {
      markerRef.current.setLatLng(position);
      markerRef.current.setIcon(createSpitfireIcon(bearing));
    }
    
    animationRef.current = requestAnimationFrame(animate);
  }, [pathPoints]);
  
  useEffect(() => {
    if (!isActive || pathPoints.length < 2 || !ENABLE_SPITFIRE_ANIMATION) {
      return;
    }
    
    // Create marker
    const initialPos = interpolateAlongPath(pathPoints, 0);
    markerRef.current = L.marker(initialPos.position, {
      icon: createSpitfireIcon(initialPos.bearing),
      zIndexOffset: 2000
    }).addTo(map);
    
    // Start animation
    startTimeRef.current = 0;
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
    };
  }, [map, pathPoints, isActive, animate]);
  
  return null;
};

// ============================================================================
// MAP CONTROLLER
// ============================================================================

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

// ============================================================================
// HOVERABLE POLYLINE COMPONENT
// ============================================================================

interface HoverablePolylineProps {
  positions: [number, number][];
  color: string;
  isActive: boolean;
  onClick: () => void;
}

const HoverablePolyline: React.FC<HoverablePolylineProps> = ({ positions, color, isActive, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  if (isActive) {
    // Active route: glow effect + main line
    return (
      <>
        {/* Glow layer - wider, semi-transparent */}
        <Polyline
          positions={positions}
          pathOptions={{
            color: color,
            weight: 14,
            opacity: 0.25,
            lineCap: 'round',
            lineJoin: 'round'
          }}
          className="route-glow"
        />
        {/* Main active line */}
        <Polyline
          positions={positions}
          pathOptions={{
            color: color,
            weight: 5,
            opacity: 1,
            lineCap: 'round',
            lineJoin: 'round'
          }}
        />
      </>
    );
  }
  
  // Inactive route with hover effect
  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color: color,
        weight: 1.5,
        opacity: isHovered ? 0.5 : 0.12,
        dashArray: '5, 10'
      }}
      eventHandlers={{
        mouseover: () => setIsHovered(true),
        mouseout: () => setIsHovered(false),
        click: onClick
      }}
    />
  );
};

// ============================================================================
// MAIN MAP PANEL COMPONENT
// ============================================================================

const MapPanel: React.FC<MapPanelProps> = React.memo(({ entries, selectedEntry, onMarkerSelect, shouldCenter, customCenter, customZoom, isTimelineCollapsed = false }) => {
  
  // Calculate map center based on selection with validation
  let centerPosition: [number, number] = customCenter || [50.5, 0.0]; 

  if (!customCenter && selectedEntry && selectedEntry.origin && isValidCoord(selectedEntry.origin.lat) && isValidCoord(selectedEntry.origin.lng)) {
    centerPosition = [selectedEntry.origin.lat, selectedEntry.origin.lng];
  }

  const zoomLevel = customZoom || (selectedEntry ? 7 : 5);

  // Enhanced colors - brighter/more saturated for active
  const getColor = (cat: AircraftCategory, isActive: boolean = false) => {
    if (isActive) {
      switch (cat) {
        case AircraftCategory.TRAINING: return '#facc15'; // brighter yellow
        case AircraftCategory.FIGHTER: return '#ef4444'; // brighter red
        case AircraftCategory.TRANSPORT: return '#60a5fa'; // brighter blue
        default: return '#94a3b8';
      }
    }
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

  // Group entries by location for multi-mission markers
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
      const categoryCounts = new Map<AircraftCategory, number>();
      group.entries.forEach(e => {
        categoryCounts.set(e.aircraftCategory, (categoryCounts.get(e.aircraftCategory) || 0) + 1);
      });
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

  // Build path for active route (for animation)
  const activeRoutePath = useMemo((): [number, number][] | null => {
    if (!selectedEntry) return null;
    
    const pathPoints: [number, number][] = [];
    
    if (selectedEntry.origin && isValidCoord(selectedEntry.origin.lat) && isValidCoord(selectedEntry.origin.lng)) {
      pathPoints.push([selectedEntry.origin.lat, selectedEntry.origin.lng]);
    }
    
    if (selectedEntry.target && isValidCoord(selectedEntry.target.lat) && isValidCoord(selectedEntry.target.lng)) {
      pathPoints.push([selectedEntry.target.lat, selectedEntry.target.lng]);
    }
    
    if (selectedEntry.destination && isValidCoord(selectedEntry.destination.lat) && isValidCoord(selectedEntry.destination.lng)) {
      const lastPoint = pathPoints[pathPoints.length - 1];
      if (!lastPoint || lastPoint[0] !== selectedEntry.destination.lat || lastPoint[1] !== selectedEntry.destination.lng) {
        pathPoints.push([selectedEntry.destination.lat, selectedEntry.destination.lng]);
      }
    }
    
    return pathPoints.length >= 2 ? pathPoints : null;
  }, [selectedEntry]);

  return (
    <div className="h-full w-full relative z-0">
      {/* Inject CSS for animations */}
      <style>{`
        /* Pulsing marker animation */
        .pulsing-marker {
          position: relative;
        }
        .pulse-ring {
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid var(--pulse-color);
          animation: pulse-ring 1.5s ease-out infinite;
        }
        .pulse-core {
          position: absolute;
          top: 4px;
          left: 4px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.5);
        }
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        /* Diamond marker animation */
        .diamond-marker-active {
          position: relative;
        }
        .diamond-pulse {
          position: absolute;
          width: 18px;
          height: 18px;
          background-color: var(--diamond-color);
          transform: rotate(45deg);
          animation: diamond-pulse 1.5s ease-out infinite;
        }
        @keyframes diamond-pulse {
          0% {
            transform: rotate(45deg) scale(1);
            opacity: 0.6;
          }
          100% {
            transform: rotate(45deg) scale(2);
            opacity: 0;
          }
        }
        
        /* Route glow effect */
        .route-glow {
          filter: blur(4px);
        }
        
        /* Spitfire icon styling */
        .spitfire-icon {
          background: transparent !important;
          border: none !important;
        }
        
        /* Mission list popup styling */
        .mission-list-popup .leaflet-popup-content-wrapper {
          background: #f4f1ea;
          border-radius: 4px;
          padding: 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        }
        .mission-list-popup .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
        .mission-list-popup .leaflet-popup-tip {
          background: #f4f1ea;
        }
      `}</style>
      
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
        
        <MapController center={centerPosition} zoom={zoomLevel} shouldCenter={shouldCenter} />

        {/* Render Routes (Polylines) - inactive first, then active on top */}
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
          if (pathPoints.length > 1 && !isActive) {
            return (
              <HoverablePolyline
                key={`line-${entry.id}`}
                positions={pathPoints}
                color={getColor(entry.aircraftCategory, false)}
                isActive={false}
                onClick={() => onMarkerSelect(entry)}
              />
            );
          }
          return null;
        })}
        
        {/* Active route rendered last (on top) */}
        {selectedEntry && (() => {
          const pathPoints: [number, number][] = [[selectedEntry.origin.lat, selectedEntry.origin.lng]];
          
          if (selectedEntry.target && isValidCoord(selectedEntry.target.lat) && isValidCoord(selectedEntry.target.lng)) {
            pathPoints.push([selectedEntry.target.lat, selectedEntry.target.lng]);
          }
          
          if (selectedEntry.destination && isValidCoord(selectedEntry.destination.lat) && isValidCoord(selectedEntry.destination.lng)) {
            const lastPoint = pathPoints[pathPoints.length - 1];
            if (lastPoint[0] !== selectedEntry.destination.lat || lastPoint[1] !== selectedEntry.destination.lng) {
              pathPoints.push([selectedEntry.destination.lat, selectedEntry.destination.lng]);
            }
          }
          
          if (pathPoints.length > 1) {
            return (
              <HoverablePolyline
                key={`line-active-${selectedEntry.id}`}
                positions={pathPoints}
                color={getColor(selectedEntry.aircraftCategory, true)}
                isActive={true}
                onClick={() => {}}
              />
            );
          }
          return null;
        })()}

        {/* Animated Spitfire on active route */}
        {activeRoutePath && ENABLE_SPITFIRE_ANIMATION && (
          <AnimatedSpitfire
            pathPoints={activeRoutePath}
            isActive={!!selectedEntry}
          />
        )}

        {/* Render Origin Markers - grouped by location */}
        {locationGroups.map((group) => {
          const isGroupSelected = group.entries.some(e => selectedEntry?.id === e.id);
          
          // Skip if the selected entry is in this group (rendered separately with pulsing)
          if (isGroupSelected) return null;
          
          const count = group.entries.length;
          
          if (count === 1) {
            // Single entry - render normal small marker
            const entry = group.entries[0];
            return (
              <React.Fragment key={`group-${group.key}`}>
                <Marker
                  position={[group.lat, group.lng]}
                  icon={createIcon(getColor(entry.aircraftCategory, false), 10)}
                  opacity={selectedEntry ? 0.6 : 0.8}
                  eventHandlers={{
                    click: () => onMarkerSelect(entry)
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
                          <p className="text-red-700 font-bold mt-1 bg-red-50 p-1 border border-red-100 text-center uppercase text-[10px]">★ Significant</p>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {/* Target Marker - diamond shape */}
                {entry.target && isValidCoord(entry.target.lat) && isValidCoord(entry.target.lng) && (
                  <Marker
                    position={[entry.target.lat, entry.target.lng]}
                    icon={createDiamondIcon('#1c1917', false)}
                    opacity={0.5}
                    eventHandlers={{
                      click: () => onMarkerSelect(entry)
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
          }
          
          // Multiple entries - render grouped marker with mission list popup
          return (
            <Marker
              key={`group-${group.key}`}
              position={[group.lat, group.lng]}
              icon={createGroupedIcon(getColor(group.primaryCategory, false), count, !!selectedEntry)}
              zIndexOffset={500}
            >
              <Popup className="mission-list-popup" maxWidth={280} minWidth={220}>
                <div className="p-0">
                  <div className="bg-stone-200/90 px-2.5 py-1.5 border-b border-stone-300 -mx-[1px] -mt-[1px] rounded-t">
                    <h3 className="font-typewriter text-[11px] font-bold text-stone-800 uppercase tracking-wide">
                      {group.entries[0]?.origin.name}
                    </h3>
                    <p className="font-typewriter text-[9px] text-stone-500">{count} missions from this location</p>
                  </div>
                  <div className="py-1.5 px-1 max-h-[200px] overflow-y-auto">
                    {group.entries.map((entry) => (
                      <button
                        key={entry.id}
                        onClick={() => onMarkerSelect(entry)}
                        className="w-full text-left px-2 py-1.5 rounded transition-all duration-100 bg-white/60 border border-transparent hover:bg-amber-50 hover:border-amber-300 mb-1 last:mb-0 group"
                      >
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getColor(entry.aircraftCategory, false) }}
                          />
                          <div className="flex-1 min-w-0 flex items-center gap-1.5">
                            <span className="font-typewriter text-[10px] font-bold text-stone-700 flex-shrink-0">
                              {entry.date}
                            </span>
                            <span className="font-typewriter text-[10px] text-stone-500 truncate">
                              {entry.duty}
                            </span>
                            {entry.isSignificant && (
                              <span className="px-1 py-0.5 bg-red-100 text-red-600 text-[7px] font-bold rounded flex-shrink-0">★</span>
                            )}
                          </div>
                          <svg className="w-3 h-3 text-stone-300 group-hover:text-amber-500 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {/* Active entry markers - rendered on top */}
        {selectedEntry && (() => {
          // Find if the selected entry is part of a multi-mission location
          const selectedLocationKey = createLocationKey(selectedEntry.origin.lat, selectedEntry.origin.lng);
          const selectedGroup = locationGroups.find(g => g.key === selectedLocationKey);
          const isMultiMission = selectedGroup && selectedGroup.entries.length > 1;
          
          return (
          <React.Fragment key={`group-active-${selectedEntry.id}`}>
            {/* Active Origin Marker - pulsing */}
            <Marker
              position={[selectedEntry.origin.lat, selectedEntry.origin.lng]}
              icon={createPulsingIcon(getColor(selectedEntry.aircraftCategory, true))}
              zIndexOffset={1000}
            >
              {isMultiMission && selectedGroup ? (
                // Multi-mission popup - show all missions at this location
                <Popup className="mission-list-popup" maxWidth={280} minWidth={220}>
                  <div className="p-0">
                    <div className="bg-stone-200/90 px-2.5 py-1.5 border-b border-stone-300 -mx-[1px] -mt-[1px] rounded-t">
                      <h3 className="font-typewriter text-[11px] font-bold text-stone-800 uppercase tracking-wide">
                        {selectedEntry.origin.name}
                      </h3>
                      <p className="font-typewriter text-[9px] text-stone-500">{selectedGroup.entries.length} missions from this location</p>
                    </div>
                    <div className="py-1.5 px-1 max-h-[200px] overflow-y-auto">
                      {selectedGroup.entries.map((entry) => {
                        const isCurrentlySelected = entry.id === selectedEntry.id;
                        return (
                          <button
                            key={entry.id}
                            onClick={() => onMarkerSelect(entry)}
                            className={`w-full text-left px-2 py-1.5 rounded transition-all duration-100 mb-1 last:mb-0 group ${
                              isCurrentlySelected 
                                ? 'bg-amber-100 border border-amber-400' 
                                : 'bg-white/60 border border-transparent hover:bg-amber-50 hover:border-amber-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span 
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: getColor(entry.aircraftCategory, isCurrentlySelected) }}
                              />
                              <div className="flex-1 min-w-0 flex items-center gap-1.5">
                                <span className="font-typewriter text-[10px] font-bold text-stone-700 flex-shrink-0">
                                  {entry.date}
                                </span>
                                <span className="font-typewriter text-[10px] text-stone-500 truncate">
                                  {entry.duty}
                                </span>
                                {entry.isSignificant && (
                                  <span className="px-1 py-0.5 bg-red-100 text-red-600 text-[7px] font-bold rounded flex-shrink-0">★</span>
                                )}
                              </div>
                              {isCurrentlySelected ? (
                                <span className="text-[8px] font-typewriter text-amber-600 flex-shrink-0">ACTIVE</span>
                              ) : (
                                <svg className="w-3 h-3 text-stone-300 group-hover:text-amber-500 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </Popup>
              ) : (
                // Single mission popup
                <Popup className="font-serif">
                  <div className="p-1 min-w-[150px]">
                    <h3 className="font-bold text-sm border-b pb-1 mb-1 text-stone-800">{selectedEntry.origin.name}</h3>
                    <div className="text-xs text-stone-600 space-y-1">
                      <p><span className="font-semibold">Date:</span> {selectedEntry.date}</p>
                      <p><span className="font-semibold">Aircraft:</span> {selectedEntry.aircraftType}</p>
                      <p><span className="font-semibold">Duty:</span> {selectedEntry.duty}</p>
                      {selectedEntry.isSignificant && (
                        <p className="text-red-700 font-bold mt-1 bg-red-50 p-1 border border-red-100 text-center uppercase text-[10px]">High Priority Event</p>
                      )}
                    </div>
                  </div>
                </Popup>
              )}
            </Marker>

            {/* Active Target Marker - pulsing diamond */}
            {selectedEntry.target && isValidCoord(selectedEntry.target.lat) && isValidCoord(selectedEntry.target.lng) && (
              <Marker
                position={[selectedEntry.target.lat, selectedEntry.target.lng]}
                icon={createDiamondIcon('#dc2626', true)}
                zIndexOffset={1000}
              >
                <Popup className="font-serif">
                  <div className="p-1">
                    <h3 className="font-bold text-sm border-b pb-1 mb-1 text-stone-800">
                      {selectedEntry.target.name} {selectedEntry.targetIsApproximate && "(Approx)"}
                    </h3>
                    <p className="text-xs font-semibold text-red-800">Mission Target</p>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Destination Marker if different from origin */}
            {selectedEntry.destination && 
             isValidCoord(selectedEntry.destination.lat) && 
             isValidCoord(selectedEntry.destination.lng) && 
             (selectedEntry.origin.lat !== selectedEntry.destination.lat || 
              selectedEntry.origin.lng !== selectedEntry.destination.lng) && (
              <Marker
                position={[selectedEntry.destination.lat, selectedEntry.destination.lng]}
                icon={createIcon(getColor(selectedEntry.aircraftCategory, true), 16)}
                zIndexOffset={1001}
              >
                <Popup className="font-serif">
                  <div className="p-1">
                    <h3 className="font-bold text-sm border-b pb-1 mb-1">{selectedEntry.destination.name}</h3>
                    <p className="text-xs">Destination</p>
                  </div>
                </Popup>
              </Marker>
            )}
          </React.Fragment>
          );
        })()}

      </MapContainer>

      {/* Flight Info Panel - responsive, positioned above timeline */}
      <FlightInfoPanel 
        selectedEntry={selectedEntry} 
        variant="light" 
        isTimelineCollapsed={isTimelineCollapsed}
      />

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
