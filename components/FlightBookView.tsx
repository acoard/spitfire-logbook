import React, { useState, useMemo } from 'react';
import { FLIGHT_LOG } from '../services/flightData';
import { LogEntry, Phase } from '../types';
import PilotProfileModal from './PilotProfileModal';
import WorkspaceLayout from './WorkspaceLayout';

const FlightBookView: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterPhase, setFilterPhase] = useState<Phase | 'ALL'>('ALL');
  const [shouldCenterMap, setShouldCenterMap] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showSignificantOnly, setShowSignificantOnly] = useState(false);

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
      />
    </>
  );
};

export default FlightBookView;

