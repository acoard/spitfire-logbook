import React, { useState } from 'react';
import LogbookPanel from './LogbookPanel';
import ContextPanel from './ContextPanel';
import MapViewToggle from './MapViewToggle';
import MapTimelineScrubber from './MapTimelineScrubber';
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
  customMapCenter?: [number, number];
  customMapZoom?: number;
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
  setShowSignificantOnly,
  customMapCenter,
  customMapZoom
}) => {
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState(false);
  
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
        <div className="relative h-full w-full">
          <MapViewToggle
            entries={entries}
            selectedEntry={selectedEntry}
            onMarkerSelect={onMarkerSelect}
            shouldCenter={shouldCenterMap}
            customCenter={customMapCenter}
            customZoom={customMapZoom}
            isTimelineCollapsed={isTimelineCollapsed}
          />
          <MapTimelineScrubber
            entries={entries}
            selectedEntryId={selectedId}
            onEntrySelect={onLogbookSelect}
            collapsed={isTimelineCollapsed}
            onToggleCollapse={() => setIsTimelineCollapsed(!isTimelineCollapsed)}
          />
        </div>
      )}
    />
  );
};

export default WorkspaceLayout;
