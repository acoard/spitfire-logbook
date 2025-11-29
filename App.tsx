import React, { useState, useMemo, useEffect } from 'react';
import { FLIGHT_LOG } from './services/flightData';
import { LogEntry, Phase } from './types';
import PilotProfileModal from './components/PilotProfileModal';
import WorkspaceLayout from './components/WorkspaceLayout';
import LoadingScreen from './components/LoadingScreen';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterPhase, setFilterPhase] = useState<Phase | 'ALL'>('ALL');
  const [shouldCenterMap, setShouldCenterMap] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Temporary loading simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000); // 5 seconds delay

    return () => clearTimeout(timer);
  }, []);

  const filteredEntries = useMemo(() => {
    if (filterPhase === 'ALL') return FLIGHT_LOG;
    return FLIGHT_LOG.filter((entry) => entry.phase === filterPhase);
  }, [filterPhase]);

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
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-stone-900 font-sans">
      {isLoading && <LoadingScreen />}
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
      />
    </div>
  );
};

export default App;