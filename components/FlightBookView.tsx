import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FLIGHT_LOG } from '../services/flightData';
import { LogEntry, Phase } from '../types';
import PilotProfileModal from './PilotProfileModal';
import WorkspaceLayout from './WorkspaceLayout';

const FlightBookView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterPhase, setFilterPhase] = useState<Phase | 'ALL'>('ALL');
  const [shouldCenterMap, setShouldCenterMap] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showSignificantOnly, setShowSignificantOnly] = useState(false);

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
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');
    if (!isNaN(lat) && !isNaN(lng)) {
      return [lat, lng] as [number, number];
    }
    return undefined;
  }, [searchParams]);

  const customMapZoom = useMemo(() => {
    const zoom = parseInt(searchParams.get('zoom') || '');
    if (!isNaN(zoom)) return zoom;
    return undefined;
  }, [searchParams]);

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
    setSelectedId(entry.id);
    setShouldCenterMap(false);
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
      />
    </>
  );
};

export default FlightBookView;

