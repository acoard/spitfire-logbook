import React from 'react';
import LogbookPanel from './LogbookPanel';
import ContextPanel from './ContextPanel';
import MapPanel from './MapPanel';
import { ResizableLayout } from './ResizableLayout';
import { LogEntry, Phase } from '../types';

interface WorkspaceLayoutProps {
  entries: LogEntry[];
  selectedEntry: LogEntry | null;
  selectedId: string | null;
  filterPhase: Phase | 'ALL';
  setFilterPhase: (phase: Phase | 'ALL') => void;
  onLogbookSelect: (entry: LogEntry) => void;
  onMarkerSelect: (entry: LogEntry) => void;
  shouldCenterMap: boolean;
  onOpenProfile: () => void;
  showSignificantOnly: boolean;
  setShowSignificantOnly: (show: boolean) => void;
}

const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  entries,
  selectedEntry,
  selectedId,
  filterPhase,
  setFilterPhase,
  onLogbookSelect,
  onMarkerSelect,
  shouldCenterMap,
  onOpenProfile,
  showSignificantOnly,
  setShowSignificantOnly
}) => {
  
  return (
    <ResizableLayout
      mobileConfig={{
        sidebarTopTitle: "Flight Logbook",
        sidebarBottomTitle: "Mission Details",
        mainTitle: "Map Overview"
      }}
      expandSidebarBottomTrigger={!!selectedId}
      sidebarTop={
        <LogbookPanel
          entries={entries}
          selectedId={selectedId}
          onSelect={onLogbookSelect}
          filterPhase={filterPhase}
          setFilterPhase={setFilterPhase}
          onOpenProfile={onOpenProfile}
          showSignificantOnly={showSignificantOnly}
          setShowSignificantOnly={setShowSignificantOnly}
        />
      }
      sidebarBottom={
        <ContextPanel selectedEntry={selectedEntry} />
      }
      mainContent={() => (
        <MapPanel
          entries={entries}
          selectedEntry={selectedEntry}
          onMarkerSelect={onMarkerSelect}
          shouldCenter={shouldCenterMap}
        />
      )}
    />
  );
};

export default WorkspaceLayout;
