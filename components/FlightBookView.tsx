import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FLIGHT_LOG } from '../services/flightData';
import { LogEntry, Phase, Coordinate } from '../types';
import PilotProfileModal from './PilotProfileModal';
import WorkspaceLayout from './WorkspaceLayout';

const FlightBookView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterPhase, setFilterPhase] = useState<Phase | 'ALL'>('ALL');
  const [shouldCenterMap, setShouldCenterMap] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showSignificantOnly, setShowSignificantOnly] = useState(false);
  const [flyToCoordinate, setFlyToCoordinate] = useState<Coordinate | null>(null);
  const [flyToZoom, setFlyToZoom] = useState<number | null>(null);
  const flyToTimeoutRef = useRef<number | null>(null);
  const [closePopoverTrigger, setClosePopoverTrigger] = useState(0);

  // Handle URL parameters for deep linking
  useEffect(() => {
    const entryId = searchParams.get('entryId');
    if (entryId) {
      // Find the entry to ensure it exists and maybe switch phase if needed
      const entry = FLIGHT_LOG.find(e => e.id === entryId);
      if (entry) {
        setSelectedId(entryId);
        setShouldCenterMap(true);
        // Optional: switch filter if entry is hidden?
        // For now, let's just select it.
      }
    }
  }, [searchParams]);

  const customMapCenter = useMemo(() => {
    // Priority: flyToCoordinate > URL params
    if (flyToCoordinate) {
      return [flyToCoordinate.lat, flyToCoordinate.lng] as [number, number];
    }
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');
    if (!isNaN(lat) && !isNaN(lng)) {
      return [lat, lng] as [number, number];
    }
    return undefined;
  }, [searchParams, flyToCoordinate]);

  const customMapZoom = useMemo(() => {
    // Priority: flyToZoom > URL params
    if (flyToZoom !== null) return flyToZoom;
    const zoom = parseInt(searchParams.get('zoom') || '');
    if (!isNaN(zoom)) return zoom;
    return undefined;
  }, [searchParams, flyToZoom]);

  const filteredEntries = useMemo(() => {
    let result = FLIGHT_LOG;
    if (filterPhase !== 'ALL') {
      result = result.filter((entry) => entry.phase === filterPhase);
    }
    if (showSignificantOnly) {
      result = result.filter(e => e.isSignificant || e.historicalNote);
    }
    return result;
  }, [filterPhase, showSignificantOnly]);

  // Derived state
  const selectedEntry = useMemo(
    () => FLIGHT_LOG.find((e) => e.id === selectedId) || null,
    [selectedId]
  );

  const handleLogbookSelect = (entry: LogEntry) => {
    setSelectedId(entry.id);
    setShouldCenterMap(true);
  };

  const handleMarkerSelect = (entry: LogEntry) => {
    // Cancel any pending flyTo timeout to prevent zoom changes
    if (flyToTimeoutRef.current) {
      clearTimeout(flyToTimeoutRef.current);
      flyToTimeoutRef.current = null;
    }
    // Clear flyTo state immediately
    setFlyToCoordinate(null);
    setFlyToZoom(null);
    setSelectedId(entry.id);
    setShouldCenterMap(false);
  };

  const handleFlyToCoordinate = (coord: Coordinate) => {
    // Cancel any existing timeout
    if (flyToTimeoutRef.current) {
      clearTimeout(flyToTimeoutRef.current);
    }
    // Close any open popovers on the map
    setClosePopoverTrigger(prev => prev + 1);
    setFlyToCoordinate(coord);
    setFlyToZoom(10); // Zoom in close when clicking a location link
    setShouldCenterMap(true);
    // Clear the flyTo state after animation completes (1.5s) to prevent re-triggering
    flyToTimeoutRef.current = window.setTimeout(() => {
      setFlyToCoordinate(null);
      setFlyToZoom(null);
      setShouldCenterMap(false); // Prevent flying back to selectedEntry.origin
      flyToTimeoutRef.current = null;
    }, 1600);
  };

  return (
    <>
      <PilotProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <WorkspaceLayout
        entries={filteredEntries}
        selectedEntry={selectedEntry}
        selectedId={selectedId}
        filterPhase={filterPhase}
        setFilterPhase={setFilterPhase}
        onLogbookSelect={handleLogbookSelect}
        onMarkerSelect={handleMarkerSelect}
        shouldCenterMap={shouldCenterMap}
        onOpenProfile={() => setIsProfileOpen(true)}
        showSignificantOnly={showSignificantOnly}
        setShowSignificantOnly={setShowSignificantOnly}
        customMapCenter={customMapCenter}
        customMapZoom={customMapZoom}
        onFlyToCoordinate={handleFlyToCoordinate}
        closePopoverTrigger={closePopoverTrigger}
      />
    </>
  );
};

export default FlightBookView;

