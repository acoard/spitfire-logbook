# Map Timeline Scrubber - Implementation Plan

## Overview

An interactive timeline scrubber component that overlays the map view, allowing users to navigate through Robin Glen's RAF journey chronologically. The timeline shows key moments from 1940-1946 and syncs with map markers/locations.

> **Important**: This component must be implemented as a **map-agnostic overlay**. It should sit on top of any map component (Leaflet, Mapbox, Google Maps, or custom implementations) without direct dependencies on the underlying map library. Communication with the map should happen through props/callbacks.

---

## Architecture

### Component Hierarchy

```
┌─────────────────────────────────────────────────────┐
│                   MapContainer                       │
│  ┌───────────────────────────────────────────────┐  │
│  │            Any Map Component                   │  │
│  │         (Leaflet / Mapbox / etc)              │  │
│  │                                               │  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │         MapTimelineScrubber (Overlay)         │  │  ← Our component
│  │  ════●════●●●●●●●●●●════●●●●●●●●════●════    │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Key Principle: Map Agnostic

The timeline scrubber should:
- **NOT** import or depend on any map library (no Leaflet, no Mapbox SDK)
- Receive current map state via props (center, zoom, visible markers)
- Emit navigation events via callbacks (onSeek, onMarkerSelect)
- Parent component handles translating these events to map actions

```tsx
// ✅ Good: Map-agnostic interface
interface MapTimelineScrubberProps {
  markers: TimelineMarker[];
  currentDate: Date | null;
  onDateChange: (date: Date) => void;
  onMarkerSelect: (markerId: string, coordinates: { lat: number; lng: number }) => void;
  // ... styling props
}

// ❌ Bad: Coupled to Leaflet
interface BadProps {
  map: L.Map; // Direct Leaflet dependency
  leafletMarkers: L.Marker[];
}
```

---

## Visual Design

### Layout (Fixed Bottom Overlay)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                              MAP VIEW                                   │
│                                                                         │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ ╔═════════════════════════════════════════════════════════════════════╗ │
│ ║  1940    '41    '42    '43    '44    '45    '46                     ║ │
│ ║  ──●──────────────────●●●●●●●●●●●●●●●●●●●●──────●●●●●●●●●●──●───    ║ │
│ ║      Training         │ D-Day │ Combat │ Honor │   India   │Return ║ │
│ ║                            ▲                                        ║ │
│ ║                   June 6, 1944 · D-Day Beach Head Patrol            ║ │
│ ╚═════════════════════════════════════════════════════════════════════╝ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Vintage Aesthetic (Matching HeroJourney)

**Materials & Textures:**
- Background: Aged brass/leather strip effect
- Timeline track: Engraved metal look, like cockpit instrumentation
- Chapter regions: Subtle sepia-toned bands

**Markers:**
| Significance | Style | Size |
|-------------|-------|------|
| Milestone | Brass rivet with glow | 12-14px |
| Major | Copper dot | 8-10px |
| Minor | Tarnished brass | 6px |

**Typography:**
- Dates: `font-typewriter` (Special Elite)
- Labels: `font-old-print` (Old Standard TT)
- All text in sepia/amber tones

**Current Position Indicator:**
- Small Spitfire silhouette pointing down
- Or vintage compass needle
- Subtle drop shadow

---

## Data Model

```typescript
interface TimelineMarker {
  id: string;
  date: Date;
  dateDisplay: string; // "June 6, 1944"
  title: string;
  subtitle?: string;
  significance: 'milestone' | 'major' | 'minor';
  chapterId: string;
  location?: {
    name: string;
    coordinates: { lat: number; lng: number };
  };
  logbookEntryId?: string;
}

interface TimelineChapter {
  id: string;
  name: string;
  color: string; // Sepia-toned colors
  startDate: Date;
  endDate: Date;
}

interface MapTimelineScrubberProps {
  // Data
  markers: TimelineMarker[];
  chapters: TimelineChapter[];
  
  // Current State (controlled component)
  currentMarkerId?: string;
  currentDate?: Date;
  
  // Callbacks
  onMarkerSelect: (marker: TimelineMarker) => void;
  onDateChange: (date: Date) => void;
  onChapterChange?: (chapter: TimelineChapter) => void;
  
  // Display options
  showChapterLabels?: boolean;
  showDateLabel?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  
  // Styling
  className?: string;
  height?: number; // px, default 80
}
```

---

## Features by Phase

### Phase 1: MVP

**Core Functionality:**
- [x] Fixed bottom overlay positioning
- [x] Display timeline from 1940-1946
- [x] Render markers at correct positions
- [x] Click marker → callback with coordinates
- [x] Show current position indicator
- [x] Display current date/title label

**Styling:**
- [x] Vintage brass/leather background
- [x] Different marker sizes by significance
- [x] Chapter color bands
- [x] Responsive (works on mobile)

### Phase 2: Enhanced Interaction

**Navigation:**
- [ ] Drag scrubbing (click and drag to scrub through time)
- [ ] Keyboard navigation (arrow keys)
- [ ] Touch swipe on mobile

**Visual Polish:**
- [ ] Hover tooltips with moment details
- [ ] Smooth animations on position change
- [ ] Chapter transition effects

**State Sync:**
- [ ] Bi-directional sync with map markers
- [ ] Highlight active marker on map
- [ ] Pan/zoom map to marker location

### Phase 3: Advanced Features

**Playback:**
- [ ] Auto-play mode (animate through timeline)
- [ ] Play/pause controls (vintage film reel style)
- [ ] Speed control: 1x, 2x, "reading pace"

**Zoom:**
- [ ] Pinch/scroll to zoom into time periods
- [ ] Double-tap to zoom to D-Day week detail
- [ ] Show individual days when zoomed

**Extras:**
- [ ] Sound effects (subtle click on milestone)
- [ ] Minimap showing event density
- [ ] "Jump to chapter" dropdown

---

## Component Structure

```
components/
├── MapTimelineScrubber/
│   ├── index.tsx                 # Main export
│   ├── MapTimelineScrubber.tsx   # Container component
│   ├── TimelineTrack.tsx         # The horizontal line with markers
│   ├── TimelineMarker.tsx        # Individual marker dot
│   ├── ChapterRegion.tsx         # Background chapter bands
│   ├── PositionIndicator.tsx     # Current position needle/plane
│   ├── DateLabel.tsx             # Current date display
│   ├── types.ts                  # TypeScript interfaces
│   └── styles.css                # Component-specific styles
```

---

## Integration Example

```tsx
// In MapPanel.tsx or similar
import { MapTimelineScrubber } from './MapTimelineScrubber';
import { timelineMarkers, timelineChapters } from '../data/timeline';

const MapPanel = () => {
  const [selectedMarker, setSelectedMarker] = useState<TimelineMarker | null>(null);
  const mapRef = useRef<MapInstance>(null);

  const handleMarkerSelect = (marker: TimelineMarker) => {
    setSelectedMarker(marker);
    
    // Pan map to location - this is where map-specific code lives
    if (marker.location && mapRef.current) {
      mapRef.current.panTo(marker.location.coordinates);
      mapRef.current.setZoom(10);
    }
  };

  return (
    <div className="relative h-full">
      {/* Any map component */}
      <LeafletMap ref={mapRef} />
      {/* Or: <MapboxMap ref={mapRef} /> */}
      {/* Or: <GoogleMap ref={mapRef} /> */}
      
      {/* Timeline overlay - map agnostic */}
      <MapTimelineScrubber
        markers={timelineMarkers}
        chapters={timelineChapters}
        currentMarkerId={selectedMarker?.id}
        onMarkerSelect={handleMarkerSelect}
        onDateChange={(date) => console.log('Date changed:', date)}
        className="absolute bottom-0 left-0 right-0"
      />
    </div>
  );
};
```

---

## Mobile Considerations

### Touch Interactions
- **Tap marker**: Select and show tooltip
- **Swipe horizontally**: Navigate between chapters
- **Long press**: Show expanded details
- **Pinch**: Zoom timeline (Phase 3)

### Layout Adaptations
- Reduce height on small screens (60px vs 80px)
- Hide chapter labels, show only on tap
- Larger touch targets for markers (min 44px tap area)
- Consider collapsible drawer pattern

### Performance
- Virtualize markers if > 50 visible
- Debounce drag/scroll events
- Use CSS transforms for animations (GPU accelerated)

---

## Accessibility

- **Keyboard navigation**: Tab to markers, Enter to select, Arrow keys to navigate
- **Screen reader**: Announce marker labels, current position
- **Reduced motion**: Respect `prefers-reduced-motion`
- **Focus indicators**: Visible focus ring on markers
- **ARIA labels**: Proper labeling for all interactive elements

---

## Future Enhancements

1. **Flight path animation**: Show animated plane icon traveling the route
2. **Weather overlay**: Historical weather data for key dates
3. **Comparison mode**: Show two pilots' timelines overlaid
4. **Share moment**: Deep link to specific moment in timeline
5. **3D globe view**: Timeline wraps around a 3D earth visualization

---

## Open Questions

- [ ] Should the timeline auto-scroll to follow map pan/zoom?
- [ ] How to handle overlapping markers (same date)?
- [ ] Should clicking empty space on timeline do anything?
- [ ] Integration with logbook view - same data source?

