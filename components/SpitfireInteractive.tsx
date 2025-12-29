import React, { useState, useEffect } from 'react';
import { X, Info, ChevronRight, Gauge, Wind, Plane, Target, Cog, Thermometer, Power, Lightbulb } from 'lucide-react';

// ============================================================================
// POSITIONING CONSTANTS - Adjust these values to fine-tune overlay positions
// ============================================================================

// Propeller overlay positioning - adjust these values to align with aircraft
const PROPELLER_POSITION = {
  left: '4%',      // horizontal position from left edge
  top: '37%',        // vertical position from top  
  width: '5%',       // width of propeller area
  height: '20%',     // height of propeller area
};

// Radiator flap positioning - under the wing (use TOP positioning, not bottom)
const RADIATOR_POSITION = {
  left: '35%',       // horizontal position from left edge
  top: '59%',        // position from top (places it on the radiator housing under wing)
  width: '6%',       // width of radiator flap area
};

// ============================================================================
// TYPES
// ============================================================================

interface Hotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  icon: React.ReactNode;
  category: 'engine' | 'flight' | 'combat' | 'systems';
  content: {
    title: string;
    subtitle: string;
    description: string;
    specs?: { label: string; value: string }[];
    didYouKnow?: string;
  };
}

// ============================================================================
// HOTSPOT DATA
// ============================================================================

const hotspots: Hotspot[] = [
  {
    id: 'propeller',
    x: 3,
    y: 48,
    label: 'Propeller',
    icon: <Cog className="w-4 h-4" />,
    category: 'engine',
    content: {
      title: 'Rotol Constant-Speed Propeller',
      subtitle: "The Heart's Blade",
      description: "The four-blade Rotol propeller was a masterpiece of engineering. Unlike fixed-pitch propellers, it could automatically adjust blade angle to maintain optimal RPM regardless of airspeed or altitude, giving pilots maximum efficiency whether climbing, cruising, or diving into combat.",
      specs: [
        { label: 'Diameter', value: "10' 9\" (3.28m)" },
        { label: 'Blades', value: '4 (Jablo compressed wood)' },
        { label: 'Type', value: 'Constant-speed, hydraulic' },
        { label: 'Max RPM', value: '3,000' },
      ],
      didYouKnow: "At high speeds, the propeller tips could reach near-supersonic velocities, producing a distinctive high-pitched sound audible from the ground."
    }
  },
  {
    id: 'engine',
    x: 12,
    y: 52,
    label: 'Merlin Engine',
    icon: <Cog className="w-4 h-4" />,
    category: 'engine',
    content: {
      title: 'Rolls-Royce Merlin 66',
      subtitle: 'The Powerhouse',
      description: "The legendary Merlin engine was the beating heart of the Spitfire. This supercharged V-12 produced a distinctive roar that became the sound of British defiance. The Mk IX's two-stage, two-speed supercharger gave it exceptional high-altitude performance, allowing it to challenge the Focke-Wulf 190 on equal terms.",
      specs: [
        { label: 'Power', value: '1,720 hp at 5,750 ft' },
        { label: 'Displacement', value: '27 litres (1,647 cu in)' },
        { label: 'Configuration', value: '60° V-12, supercharged' },
        { label: 'Fuel', value: '100/130 octane' },
      ],
      didYouKnow: "Over 150,000 Merlin engines were built during WWII. The same engine also powered the Lancaster bomber, Mosquito, and the P-51 Mustang."
    }
  },
  {
    id: 'exhausts',
    x: 18,
    y: 44,
    label: 'Exhaust Stubs',
    icon: <Wind className="w-4 h-4" />,
    category: 'engine',
    content: {
      title: 'Ejector Exhaust Stubs',
      subtitle: 'Hidden Thrust',
      description: "These six individual exhaust stubs weren't just for venting gases—they were carefully angled to provide additional thrust. This 'ejector' effect contributed roughly 70 horsepower equivalent, increasing top speed by about 10 mph. At night, the exhaust flames were visible for miles, making night fighters vulnerable.",
      specs: [
        { label: 'Thrust Bonus', value: '~70 hp equivalent' },
        { label: 'Speed Increase', value: '~10 mph' },
        { label: 'Configuration', value: '6 individual stubs per side' },
      ],
      didYouKnow: "The exhaust stub design was refined through extensive wind tunnel testing at RAE Farnborough to maximize the thrust recovery effect."
    }
  },
  {
    id: 'radiator',
    x: 42,
    y: 78,
    label: 'Radiator',
    icon: <Thermometer className="w-4 h-4" />,
    category: 'systems',
    content: {
      title: 'Coolant Radiator',
      subtitle: 'Keeping Cool Under Fire',
      description: "The underwing radiator was a critical vulnerability but also an aerodynamic feature. Its ducted design actually produced a small amount of thrust through the 'Meredith Effect'—the heated air exiting faster than it entered. The adjustable flap allowed pilots to control cooling and minimize drag.",
      specs: [
        { label: 'Coolant', value: '70% water, 30% glycol' },
        { label: 'Operating Temp', value: '95-105°C normal' },
        { label: 'Flap Control', value: 'Manual lever, cockpit' },
      ],
      didYouKnow: "The Meredith Effect, theorized by F.W. Meredith in 1936, meant the radiator could offset most of its own drag at high speeds through thrust from heated exhaust air."
    }
  },
  {
    id: 'cockpit',
    x: 38,
    y: 35,
    label: 'Cockpit',
    icon: <Gauge className="w-4 h-4" />,
    category: 'flight',
    content: {
      title: 'Fighter Cockpit',
      subtitle: "The Pilot's Office",
      description: "The Spitfire cockpit was famously cramped—designed around the average 1930s British male. Tall pilots often flew with their heads touching the canopy. Yet pilots loved its responsiveness; the aircraft felt like an extension of their body. The 'office' included over 40 instruments and controls within arm's reach.",
      specs: [
        { label: 'Canopy', value: 'Malcolm hood (sliding)' },
        { label: 'Gunsight', value: 'Mk II Gyro' },
        { label: 'Instruments', value: '40+ gauges and controls' },
        { label: 'Seat', value: 'Bucket, with parachute pack' },
      ],
      didYouKnow: "The bubble canopy (Malcolm Hood) was retrofitted to many Spitfires to improve rearward visibility after combat experience showed its importance in survival."
    }
  },
  {
    id: 'wing',
    x: 48,
    y: 62,
    label: 'Elliptical Wing',
    icon: <Plane className="w-4 h-4" />,
    category: 'flight',
    content: {
      title: 'Elliptical Wing',
      subtitle: 'Beauty and Performance',
      description: "The iconic elliptical wing wasn't chosen for aesthetics—it was the most efficient shape for minimizing induced drag while maintaining structural strength. This gave the Spitfire its legendary handling: responsive, forgiving, and capable of out-turning almost any opponent. The wing held fuel, ammunition, and the retractable undercarriage.",
      specs: [
        { label: 'Span', value: "36' 10\" (11.23m)" },
        { label: 'Area', value: '242 sq ft (22.5 m²)' },
        { label: 'Loading', value: '30.4 lb/sq ft' },
        { label: 'Construction', value: 'Stressed-skin aluminium' },
      ],
      didYouKnow: "The elliptical planform provides the most efficient lift distribution, minimizing induced drag. The Heinkel He 70 mail plane inspired this design approach."
    }
  },
  {
    id: 'guns',
    x: 25,
    y: 65,
    label: 'Armament',
    icon: <Target className="w-4 h-4" />,
    category: 'combat',
    content: {
      title: 'Wing Armament',
      subtitle: 'Firepower',
      description: "The Mk IX typically carried two 20mm Hispano cannons and four .303 Browning machine guns—the 'C' wing configuration. The cannons packed devastating punch against bombers and ground targets, while the machine guns provided volume of fire for dogfighting. Pilots had about 14 seconds of total firing time.",
      specs: [
        { label: 'Cannons', value: '2× 20mm Hispano (120 rpg)' },
        { label: 'Machine Guns', value: '4× .303 Browning (350 rpg)' },
        { label: 'Convergence', value: '250 yards typical' },
        { label: 'Firing Time', value: '~14 seconds total' },
      ],
      didYouKnow: "Gun heating was essential above 20,000 feet. Without it, lubricants would freeze and weapons would jam at the moment they were needed most."
    }
  },
  {
    id: 'tail',
    x: 88,
    y: 35,
    label: 'Tail Assembly',
    icon: <Plane className="w-4 h-4" />,
    category: 'flight',
    content: {
      title: 'Tail Unit',
      subtitle: 'Stability & Control',
      description: "The tail assembly provided stability and control authority. The elevator allowed pitch control, while the rudder—critical for countering engine torque on takeoff—gave yaw control. The distinctive 'invasion stripes' were applied before D-Day so Allied gunners wouldn't shoot down their own aircraft.",
      specs: [
        { label: 'Tailplane', value: 'Metal-framed, fabric-covered' },
        { label: 'Rudder', value: 'Horn-balanced, metal' },
        { label: 'Trim', value: 'Elevator and rudder trim tabs' },
      ],
      didYouKnow: "The invasion stripes were painted in just 48 hours before D-Day. Every Allied aircraft received five alternating black and white bands, each 18 inches wide."
    }
  },
  {
    id: 'roundel',
    x: 55,
    y: 48,
    label: 'RAF Roundel',
    icon: <Target className="w-4 h-4" />,
    category: 'combat',
    content: {
      title: 'RAF Roundel & Codes',
      subtitle: 'Identity',
      description: "The Type C1 roundel (red-white-blue without yellow outline) was standard for aircraft in European camouflage. The squadron codes 'RAB' and individual letter '81' identified this specific aircraft. These markings helped in radio communication: 'RAB Red 2, bandits 3 o'clock high!'",
      specs: [
        { label: 'Type', value: 'Type C1 (no yellow)' },
        { label: 'Squadron', value: 'RAB codes' },
        { label: 'Aircraft', value: '81' },
      ],
      didYouKnow: "Squadron code letters were assigned randomly and changed periodically to prevent German intelligence from tracking specific units' movements and strength."
    }
  }
];

const categoryColors = {
  engine: { bg: 'bg-orange-500', border: 'border-orange-400', text: 'text-orange-400', glow: 'shadow-orange-500/50' },
  flight: { bg: 'bg-sky-500', border: 'border-sky-400', text: 'text-sky-400', glow: 'shadow-sky-500/50' },
  combat: { bg: 'bg-red-500', border: 'border-red-400', text: 'text-red-400', glow: 'shadow-red-500/50' },
  systems: { bg: 'bg-emerald-500', border: 'border-emerald-400', text: 'text-emerald-400', glow: 'shadow-emerald-500/50' },
};

// ============================================================================
// COCKPIT GAUGE COMPONENT
// ============================================================================

interface GaugeProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  size?: 'sm' | 'md' | 'lg';
  warningThreshold?: number;
  dangerThreshold?: number;
}

const CockpitGauge: React.FC<GaugeProps> = ({ 
  label, value, max, unit, size = 'md', warningThreshold, dangerThreshold 
}) => {
  const angle = (value / max) * 270 - 135;
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
  };
  const needleHeight = { sm: 'h-6', md: 'h-8', lg: 'h-10' };
  
  const isWarning = warningThreshold && value >= warningThreshold && (!dangerThreshold || value < dangerThreshold);
  const isDanger = dangerThreshold && value >= dangerThreshold;
  
  const needleColor = isDanger ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-green-400';
  
  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizeClasses[size]} rounded-full bg-stone-950 border-2 border-stone-600 shadow-lg overflow-hidden`}>
        {/* Gauge face */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-b from-stone-800 to-stone-900 border border-stone-700">
          {/* Tick marks */}
          {[...Array(11)].map((_, i) => {
            const markAngle = (i / 10) * 270 - 135;
            const isMajor = i % 2 === 0;
            return (
              <div
                key={i}
                className={`absolute origin-bottom ${isMajor ? 'w-0.5 h-2 bg-stone-400' : 'w-px h-1.5 bg-stone-600'}`}
                style={{
                  left: '50%',
                  bottom: '50%',
                  transform: `translateX(-50%) rotate(${markAngle}deg) translateY(-${size === 'lg' ? 38 : size === 'md' ? 30 : 24}px)`,
                }}
              />
            );
          })}
        </div>
        
        {/* Danger zone arc */}
        {dangerThreshold && (
          <div 
            className="absolute inset-2 rounded-full"
            style={{
              background: `conic-gradient(from ${135 + (dangerThreshold/max) * 270}deg, rgba(239,68,68,0.3) 0deg, rgba(239,68,68,0.3) ${((max - dangerThreshold)/max) * 270}deg, transparent ${((max - dangerThreshold)/max) * 270}deg)`,
            }}
          />
        )}
        
        {/* Needle */}
        <div
          className={`absolute w-1 ${needleHeight[size]} ${needleColor} rounded-full origin-bottom transition-transform duration-500`}
          style={{
            left: '50%',
            bottom: '50%',
            transform: `translateX(-50%) rotate(${angle}deg)`,
            boxShadow: isDanger ? '0 0 8px rgba(239,68,68,0.8)' : 'none',
          }}
        />
        
        {/* Center cap */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-stone-600 border border-stone-500 shadow-inner" />
        </div>
        
        {/* Value display */}
        <div className="absolute bottom-1 left-0 right-0 text-center">
          <span className={`text-[8px] font-mono ${isDanger ? 'text-red-400' : 'text-stone-400'}`}>
            {Math.round(value)}{unit}
          </span>
        </div>
      </div>
      <span className="text-[10px] text-stone-500 mt-1 uppercase tracking-wider font-mono">{label}</span>
    </div>
  );
};

// ============================================================================
// COCKPIT PANEL COMPONENT
// ============================================================================

// ============================================================================
// THROTTLE QUADRANT LEVER COMPONENT
// ============================================================================

interface LeverProps {
  label: string;
  value: number; // 0-100
  onChange: (value: number) => void;
  color: 'red' | 'blue' | 'amber';
  disabled?: boolean;
}

const ThrottleLever: React.FC<LeverProps> = ({ label, value, onChange, color, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = React.useRef<HTMLDivElement>(null);
  
  const colorClasses = {
    red: { knob: 'bg-red-600', track: 'from-red-900 to-red-700', glow: 'shadow-red-500/30' },
    blue: { knob: 'bg-sky-600', track: 'from-sky-900 to-sky-700', glow: 'shadow-sky-500/30' },
    amber: { knob: 'bg-amber-600', track: 'from-amber-900 to-amber-700', glow: 'shadow-amber-500/30' },
  };
  const colors = colorClasses[color];
  
  const calculateValue = (clientY: number) => {
    if (!trackRef.current || disabled) return;
    const rect = trackRef.current.getBoundingClientRect();
    const y = clientY - rect.top;
    const percentage = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100));
    onChange(Math.round(percentage));
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    calculateValue(e.clientY);
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      calculateValue(e.clientY);
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Add/remove global mouse listeners for dragging
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);
  
  return (
    <div className={`flex flex-col items-center ${disabled ? 'opacity-40' : ''}`}>
      <span className="text-[9px] text-stone-500 uppercase tracking-wider mb-1">{label}</span>
      <div 
        ref={trackRef}
        className={`relative w-6 h-32 bg-gradient-to-b ${colors.track} rounded-lg border border-stone-600 
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} select-none`}
        onMouseDown={handleMouseDown}
      >
        {/* Track markings */}
        {[0, 25, 50, 75, 100].map(mark => (
          <div 
            key={mark}
            className="absolute left-0 right-0 h-px bg-stone-500/50"
            style={{ bottom: `${mark}%` }}
          >
            <span className="absolute -left-4 -translate-y-1/2 text-[7px] text-stone-600">
              {mark === 100 ? 'MAX' : mark === 0 ? 'MIN' : ''}
            </span>
          </div>
        ))}
        
        {/* Lever knob */}
        <div 
          className={`absolute left-1/2 -translate-x-1/2 w-8 h-4 ${colors.knob} rounded border border-white/20 
            shadow-lg ${colors.glow} ${isDragging ? '' : 'transition-all duration-150'} 
            ${disabled ? 'cursor-not-allowed' : 'cursor-grab'} ${isDragging ? 'cursor-grabbing' : ''}`}
          style={{ bottom: `calc(${value}% - 8px)` }}
        >
          <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-0.5 bg-white/30 rounded" />
        </div>
      </div>
      <span className="text-[10px] text-stone-400 mt-1 font-mono">{value}%</span>
    </div>
  );
};

// ============================================================================
// DIRECTIONAL GYRO (HEADING INDICATOR) COMPONENT
// ============================================================================

interface HeadingIndicatorProps {
  heading: number; // 0-360
}

const HeadingIndicator: React.FC<HeadingIndicatorProps> = ({ heading }) => {
  // Compass cardinal directions
  const cardinals = [
    { deg: 0, label: 'N' },
    { deg: 30, label: '3' },
    { deg: 60, label: '6' },
    { deg: 90, label: 'E' },
    { deg: 120, label: '12' },
    { deg: 150, label: '15' },
    { deg: 180, label: 'S' },
    { deg: 210, label: '21' },
    { deg: 240, label: '24' },
    { deg: 270, label: 'W' },
    { deg: 300, label: '30' },
    { deg: 330, label: '33' },
  ];
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24 rounded-full bg-stone-950 border-2 border-stone-600 shadow-lg overflow-hidden">
        {/* Outer ring */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-b from-stone-800 to-stone-900 border border-stone-700">
          {/* Rotating compass card */}
          <div 
            className="absolute inset-2 rounded-full transition-transform duration-300"
            style={{ transform: `rotate(${-heading}deg)` }}
          >
            {/* Cardinal and intercardinal markings */}
            {cardinals.map(({ deg, label }) => (
              <div
                key={deg}
                className="absolute left-1/2 top-1/2 origin-center"
                style={{ transform: `translate(-50%, -50%) rotate(${deg}deg)` }}
              >
                <span 
                  className={`absolute left-1/2 -translate-x-1/2 text-[8px] font-bold
                    ${label === 'N' ? 'text-amber-400' : label === 'S' || label === 'E' || label === 'W' ? 'text-stone-300' : 'text-stone-500'}`}
                  style={{ 
                    top: '2px',
                    transform: `rotate(${-deg}deg)` 
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
            
            {/* Tick marks every 10 degrees */}
            {[...Array(36)].map((_, i) => {
              const deg = i * 10;
              const isMajor = deg % 30 === 0;
              return (
                <div
                  key={deg}
                  className="absolute left-1/2 top-0 origin-bottom"
                  style={{ 
                    transform: `translateX(-50%) rotate(${deg}deg)`,
                    height: '50%',
                  }}
                >
                  <div className={`${isMajor ? 'w-0.5 h-2' : 'w-px h-1'} bg-stone-500 mx-auto`} />
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Fixed aircraft symbol (lubber line) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Aircraft shape */}
          <div className="relative">
            <div className="w-1 h-6 bg-amber-500 rounded-sm" />
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-amber-500 rounded" />
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-2 h-0.5 bg-amber-500 rounded" />
          </div>
        </div>
        
        {/* Top lubber mark */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 
          border-l-[6px] border-r-[6px] border-t-[8px] 
          border-l-transparent border-r-transparent border-t-amber-500" />
      </div>
      <span className="text-[10px] text-stone-500 mt-1 uppercase tracking-wider font-mono">
        HDG {Math.round(heading).toString().padStart(3, '0')}°
      </span>
    </div>
  );
};

interface CockpitPanelProps {
  isEngineRunning: boolean;
  radiatorOpen: boolean;
  throttle: number;
  propPitch: number;
  gaugeValues: {
    rpm: number;
    boost: number;
    coolantTemp: number;
    oilTemp: number;
    oilPressure: number;
    fuel: number;
    speed: number;
    altitude: number;
    climbRate: number;
    heading: number;
  };
  onToggleEngine: () => void;
  onToggleRadiator: () => void;
  onThrottleChange: (value: number) => void;
  onPropPitchChange: (value: number) => void;
}

const CockpitPanel: React.FC<CockpitPanelProps> = ({
  isEngineRunning,
  radiatorOpen,
  throttle,
  propPitch,
  gaugeValues,
  onToggleEngine,
  onToggleRadiator,
  onThrottleChange,
  onPropPitchChange,
}) => {
  const showTempWarning = isEngineRunning && gaugeValues.coolantTemp > 100 && !radiatorOpen;
  const showBoostWarning = isEngineRunning && throttle > propPitch + 20;
  
  return (
    <div className="w-full bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 rounded-2xl border border-stone-700 shadow-2xl overflow-hidden">
      {/* Panel header */}
      <div className="bg-stone-950/80 border-b border-stone-700 px-4 py-2 flex items-center justify-between">
        <h3 className="text-stone-400 text-xs uppercase tracking-[0.2em] font-mono">
          Instrument Panel
        </h3>
        <div className="flex items-center gap-2">
          {isEngineRunning && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 text-[10px] uppercase tracking-wider">Engine Running</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Temperature warning */}
      {showTempWarning && (
        <div className="bg-red-500/20 border-b border-red-500/50 px-4 py-2">
          <p className="text-red-400 text-xs text-center animate-pulse font-mono">
            ⚠ COOLANT TEMPERATURE HIGH — OPEN RADIATOR FLAP ⚠
          </p>
        </div>
      )}
      
      {/* Boost warning - throttle ahead of RPM */}
      {showBoostWarning && (
        <div className="bg-amber-500/20 border-b border-amber-500/50 px-4 py-2">
          <p className="text-amber-400 text-xs text-center font-mono">
            ⚠ INCREASE PROP RPM BEFORE THROTTLE — Risk of over-boosting! ⚠
          </p>
        </div>
      )}
      
      <div className="p-4 md:p-6">
        {/* Main cockpit layout - Throttle on left, instruments center/right */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left side - Throttle Quadrant and Controls */}
          <div className="flex flex-col items-center lg:items-start gap-4 lg:border-r lg:border-stone-700/50 lg:pr-6">
            {/* Throttle Quadrant */}
            <div className="flex flex-col items-center">
              <span className="text-stone-500 text-[10px] uppercase tracking-[0.2em] mb-3">Throttle Quadrant</span>
              <div className="flex items-end gap-4 px-4 py-3 bg-stone-950/50 rounded-xl border border-stone-700">
                <ThrottleLever 
                  label="Prop RPM" 
                  value={propPitch} 
                  onChange={onPropPitchChange}
                  color="blue"
                  disabled={!isEngineRunning}
                />
                <ThrottleLever 
                  label="Throttle" 
                  value={throttle} 
                  onChange={onThrottleChange}
                  color="red"
                  disabled={!isEngineRunning}
                />
              </div>
              {/* Hint text */}
              <p className="text-stone-600 text-[9px] mt-2 max-w-[160px] text-center leading-relaxed">
                Tip: Increase Prop RPM before Throttle
              </p>
            </div>
            
            {/* Engine and Radiator controls */}
            <div className="flex flex-col gap-2 w-full">
              {/* Engine starter button */}
              <button
                onClick={onToggleEngine}
                className={`relative group flex items-center gap-3 px-4 py-2 rounded-xl border-2 transition-all duration-300 ${
                  isEngineRunning
                    ? 'bg-red-500/20 border-red-500 shadow-lg shadow-red-500/30'
                    : 'bg-stone-800/80 border-stone-600 hover:border-amber-500/50 hover:bg-stone-700/50'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isEngineRunning 
                    ? 'bg-red-500 shadow-lg shadow-red-500/50' 
                    : 'bg-stone-700 group-hover:bg-amber-500/20'
                }`}>
                  <Power className={`w-3.5 h-3.5 ${isEngineRunning ? 'text-white' : 'text-stone-400 group-hover:text-amber-400'}`} />
                </div>
                <div className="text-left">
                  <p className={`text-[11px] font-medium uppercase tracking-wider ${
                    isEngineRunning ? 'text-red-400' : 'text-stone-300'
                  }`}>
                    {isEngineRunning ? 'Stop' : 'Start'}
                  </p>
                </div>
              </button>
              
              {/* Radiator lever */}
              <div className="flex items-center justify-between gap-2 px-3 py-2 bg-stone-800/50 rounded-xl border border-stone-700">
                <span className="text-stone-500 text-[9px] uppercase tracking-wider">Rad</span>
                <button
                  onClick={onToggleRadiator}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                    radiatorOpen 
                      ? 'bg-emerald-500/30 border-2 border-emerald-500' 
                      : 'bg-stone-700 border-2 border-stone-600'
                  }`}
                >
                  <div 
                    className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300 ${
                      radiatorOpen 
                        ? 'left-6 bg-emerald-400 shadow-lg shadow-emerald-500/50' 
                        : 'left-0.5 bg-stone-500'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
          
          {/* Right side - Instruments */}
          <div className="flex-1 space-y-4">
            {/* Panel label */}
            <div className="text-center">
              <span className="text-stone-600 text-[10px] uppercase tracking-[0.3em]">Blind Flying Panel</span>
            </div>
            
            {/* Flight Instruments - 2x2 grid */}
            <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700/50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 items-center justify-items-center">
                {/* Airspeed */}
                <div className="flex flex-col items-center">
                  <CockpitGauge 
                    label="Airspeed" 
                    value={gaugeValues.speed} 
                    max={460} 
                    unit=" mph" 
                    size="lg"
                  />
                </div>
                {/* Altitude */}
                <div className="flex flex-col items-center">
                  <CockpitGauge 
                    label="Altitude" 
                    value={gaugeValues.altitude} 
                    max={45000} 
                    unit=" ft" 
                    size="lg"
                  />
                </div>
                {/* Climb Rate */}
                <div className="flex flex-col items-center">
                  <CockpitGauge 
                    label="Climb" 
                    value={Math.abs(gaugeValues.climbRate)} 
                    max={5000} 
                    unit={gaugeValues.climbRate >= 0 ? '↑' : '↓'} 
                    size="lg"
                  />
                </div>
                {/* Heading - Custom directional gyro */}
                <div className="flex flex-col items-center">
                  <HeadingIndicator heading={gaugeValues.heading} />
                </div>
              </div>
            </div>
          
            {/* Engine Instruments - separate panel below */}
            <div className="text-center">
              <span className="text-stone-600 text-[10px] uppercase tracking-[0.3em]">Engine Instruments</span>
            </div>
          
            <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700/50">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
                {/* RPM */}
                <div className="flex flex-col items-center">
                  <CockpitGauge 
                    label="RPM" 
                    value={gaugeValues.rpm} 
                    max={3600} 
                    unit="" 
                    size="md"
                    dangerThreshold={3200}
                  />
                </div>
                {/* Boost */}
                <div className="flex flex-col items-center">
                  <CockpitGauge 
                    label="Boost" 
                    value={gaugeValues.boost} 
                    max={18} 
                    unit=" psi" 
                    size="md"
                    warningThreshold={12}
                    dangerThreshold={15}
                  />
                </div>
                {/* Coolant Temp - critical! */}
                <div className="flex flex-col items-center">
                  <CockpitGauge 
                    label="Coolant" 
                    value={gaugeValues.coolantTemp} 
                    max={130} 
                    unit="°C" 
                    size="md"
                    warningThreshold={100}
                    dangerThreshold={110}
                  />
                </div>
                {/* Oil Temp */}
                <div className="flex flex-col items-center">
                  <CockpitGauge 
                    label="Oil Temp" 
                    value={gaugeValues.oilTemp} 
                    max={120} 
                    unit="°C" 
                    size="md"
                    warningThreshold={90}
                    dangerThreshold={105}
                  />
                </div>
                {/* Oil Pressure */}
                <div className="flex flex-col items-center">
                  <CockpitGauge 
                    label="Oil Press" 
                    value={gaugeValues.oilPressure} 
                    max={100} 
                    unit=" psi" 
                    size="md"
                    warningThreshold={30}
                  />
                </div>
                {/* Fuel */}
                <div className="flex flex-col items-center">
                  <CockpitGauge 
                    label="Fuel" 
                    value={gaugeValues.fuel} 
                    max={85} 
                    unit=" gal" 
                    size="md"
                    warningThreshold={20}
                    dangerThreshold={10}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SpitfireInteractive: React.FC = () => {
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);
  const [isEngineRunning, setIsEngineRunning] = useState(false);
  const [radiatorOpen, setRadiatorOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [introComplete, setIntroComplete] = useState(false);
  
  // Throttle quadrant controls
  const [throttle, setThrottle] = useState(0);       // 0-100%
  const [propPitch, setPropPitch] = useState(0);     // 0-100% (controls prop RPM)
  
  // Gauge values that animate when engine is running
  const [gaugeValues, setGaugeValues] = useState({
    rpm: 0,
    boost: 0,
    coolantTemp: 15,
    oilTemp: 15,
    oilPressure: 0,
    fuel: 85,
    speed: 0,
    altitude: 0,
    climbRate: 0,
    heading: 270, // Start facing west
  });

  // Simulate engine gauge movements based on throttle and prop pitch
  useEffect(() => {
    if (isEngineRunning) {
      const interval = setInterval(() => {
        setGaugeValues(prev => {
          // Spitfire IX specs:
          // - Max speed: 408 mph at 25,000 ft
          // - Service ceiling: 43,000 ft
          // - Rate of climb: 4,580 ft/min at sea level, decreasing with altitude
          // - Stall speed: ~73 mph (clean)
          
          // RPM is controlled by prop pitch lever (idle ~800, max ~3000)
          const idleRpm = 800;
          const maxRpm = 3000;
          const targetRpm = idleRpm + (propPitch / 100) * (maxRpm - idleRpm);
          const newRpm = prev.rpm + (targetRpm - prev.rpm) * 0.3 + (Math.random() - 0.5) * 50;
          
          // Boost is controlled by throttle, but limited by RPM
          const maxBoostAtRpm = (propPitch / 100) * 12;
          const requestedBoost = (throttle / 100) * 12;
          const actualBoost = Math.min(requestedBoost, maxBoostAtRpm + 3) + (Math.random() - 0.5) * 0.5;
          
          // ========================================
          // FLIGHT DYNAMICS
          // ========================================
          
          // Maximum ceiling is 43,000 ft
          const serviceCeiling = 43000;
          
          // Thrust/power output (0-1) based on throttle and RPM efficiency
          const powerOutput = (throttle / 100) * (propPitch / 100);
          
          // Altitude effect on performance (decreases at higher altitude)
          const altitudeFactor = Math.max(0, 1 - (prev.altitude / serviceCeiling));
          
          // Target airspeed: builds with power, max ~408 mph at optimal altitude
          // More power = more speed, but also altitude affects this
          const maxSpeed = 408;
          const minFlyingSpeed = 75; // Roughly stall speed
          const targetSpeed = powerOutput > 0.1 
            ? minFlyingSpeed + powerOutput * (maxSpeed - minFlyingSpeed) * (0.7 + 0.3 * altitudeFactor)
            : 0;
          
          // Smooth speed changes
          const newSpeed = prev.speed + (targetSpeed - prev.speed) * 0.05 + (Math.random() - 0.5) * 2;
          
          // Climb rate: Max ~4,580 ft/min at sea level, decreases with altitude
          // Only climb if we have excess power (throttle > what's needed for level flight)
          const maxClimbRate = 4580;
          const excessPower = Math.max(0, powerOutput - 0.3); // Need 30% power for level flight
          const targetClimbRate = excessPower * maxClimbRate * altitudeFactor;
          
          // At service ceiling, climb rate goes to 0
          const climbCeiling = prev.altitude >= serviceCeiling ? 0 : targetClimbRate;
          
          // Smooth climb rate changes
          const newClimbRate = prev.climbRate + (climbCeiling - prev.climbRate) * 0.1;
          
          // Update altitude based on climb rate (ft/min -> ft per 200ms tick)
          const altitudeChange = newClimbRate * (200 / 60000);
          const newAltitude = Math.max(0, Math.min(serviceCeiling, prev.altitude + altitudeChange));
          
          // Slow heading drift (simulates slight yaw)
          const headingDrift = (Math.random() - 0.5) * 0.5;
          const newHeading = (prev.heading + headingDrift + 360) % 360;
          
          // Temperature rises with throttle, faster when radiator closed
          const heatGeneration = (throttle / 100) * 2;
          const cooling = radiatorOpen ? 1.5 : 0.3;
          const targetCoolant = 60 + (throttle / 100) * 40 + (radiatorOpen ? 0 : 20);
          const newCoolant = prev.coolantTemp + (targetCoolant - prev.coolantTemp) * 0.1 + heatGeneration - cooling;
          
          // Oil temp and pressure scale with RPM
          const targetOilTemp = 50 + (propPitch / 100) * 30;
          const targetOilPressure = 30 + (propPitch / 100) * 45;
          
          // Fuel consumption scales with throttle
          const fuelConsumption = 0.005 + (throttle / 100) * 0.03;
          
          return {
            rpm: Math.max(idleRpm, Math.min(maxRpm + 200, newRpm)),
            boost: Math.max(0, actualBoost),
            coolantTemp: Math.max(15, Math.min(130, newCoolant)),
            oilTemp: targetOilTemp + (Math.random() - 0.5) * 5,
            oilPressure: targetOilPressure + (Math.random() - 0.5) * 5,
            fuel: Math.max(0, prev.fuel - fuelConsumption),
            speed: Math.max(0, newSpeed),
            altitude: newAltitude,
            climbRate: Math.round(newClimbRate),
            heading: newHeading,
          };
        });
      }, 200);
      return () => clearInterval(interval);
    } else {
      // Engine off - gradual cooldown
      const cooldown = setInterval(() => {
        setGaugeValues(prev => ({
          rpm: Math.max(0, prev.rpm - 100),
          boost: Math.max(0, prev.boost - 0.5),
          coolantTemp: Math.max(15, prev.coolantTemp - 1),
          oilTemp: Math.max(15, prev.oilTemp - 0.5),
          oilPressure: Math.max(0, prev.oilPressure - 5),
          fuel: prev.fuel,
          speed: Math.max(0, prev.speed - 5),
          altitude: Math.max(0, prev.altitude - 100), // Descend when engine off
          climbRate: prev.altitude > 0 ? -500 : 0,
          heading: prev.heading,
        }));
      }, 200);
      return () => clearInterval(cooldown);
    }
  }, [isEngineRunning, radiatorOpen, throttle, propPitch]);
  
  // Reset levers when engine stops
  useEffect(() => {
    if (!isEngineRunning) {
      setThrottle(0);
      setPropPitch(0);
    }
  }, [isEngineRunning]);

  // Intro animation
  useEffect(() => {
    const timer = setTimeout(() => setIntroComplete(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const toggleEngine = () => setIsEngineRunning(!isEngineRunning);
  const toggleRadiator = () => setRadiatorOpen(!radiatorOpen);

  return (
    <div className="h-full w-full overflow-auto bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 relative">
      {/* Background atmospheric effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header 
        className={`relative z-10 pt-8 pb-6 px-6 text-center transition-all duration-1000 ${
          introComplete ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
        }`}
      >
        <h1 className="text-4xl md:text-5xl font-light text-stone-100 tracking-[0.3em] uppercase mb-2"
            style={{ fontFamily: "'Cinzel', serif" }}>
          The Spitfire
        </h1>
        <p className="text-stone-400 tracking-[0.2em] uppercase text-sm mb-1">
          Supermarine Spitfire Mk IX
        </p>
        <p className="text-amber-500/80 text-xs tracking-widest">
          Interactive Technical Exploration
        </p>
      </header>

      {/* Main interactive area */}
      <main className="relative z-10 container mx-auto px-4 pb-8">
        {/* Category filter */}
        <div 
          className={`flex flex-wrap items-center justify-center gap-2 mb-6 transition-all duration-1000 delay-300 ${
            introComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="text-stone-500 text-xs uppercase tracking-wider mr-2">Filter:</span>
          {(['engine', 'flight', 'combat', 'systems'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(filterCategory === cat ? null : cat)}
              className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider transition-all duration-300 border ${
                filterCategory === cat
                  ? `${categoryColors[cat].bg} border-transparent text-white`
                  : `bg-transparent ${categoryColors[cat].border} ${categoryColors[cat].text} hover:bg-white/5`
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Aircraft display */}
        <div 
          className={`relative mx-auto max-w-6xl transition-all duration-1000 delay-500 ${
            introComplete ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          {/* Spotlight effect */}
          <div className="absolute -inset-20 bg-gradient-radial from-amber-500/10 via-transparent to-transparent opacity-50 pointer-events-none" />
          
          {/* Main aircraft image with overlays */}
          <div className="relative">
            {/* The Spitfire image */}
            <img
              src="/spitfire-side.png"
              alt="Supermarine Spitfire Mk IX side profile"
              className="w-full h-auto relative z-10"
              style={{
                filter: 'drop-shadow(0 0 60px rgba(0,0,0,0.8))',
              }}
            />

            {/* Animated propeller overlay */}
            <div 
              className="absolute z-20 transition-all duration-500"
              style={{ 
                left: PROPELLER_POSITION.left, 
                top: PROPELLER_POSITION.top,
                width: PROPELLER_POSITION.width,
                height: PROPELLER_POSITION.height,
              }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <g 
                  style={{ 
                    transformOrigin: '50% 50%',
                    animation: isEngineRunning ? 'spin 0.08s linear infinite' : 'none',
                  }}
                >
                  {/* Propeller blades - 4 blade Rotol */}
                  <ellipse cx="50" cy="12" rx="6" ry="38" fill="rgba(50,50,50,0.95)" 
                    style={{ filter: isEngineRunning ? 'blur(1px)' : 'none' }} />
                  <ellipse cx="50" cy="88" rx="6" ry="38" fill="rgba(50,50,50,0.95)"
                    style={{ filter: isEngineRunning ? 'blur(1px)' : 'none' }} />
                  <ellipse cx="12" cy="50" rx="38" ry="6" fill="rgba(50,50,50,0.95)"
                    style={{ filter: isEngineRunning ? 'blur(1px)' : 'none' }} />
                  <ellipse cx="88" cy="50" rx="38" ry="6" fill="rgba(50,50,50,0.95)"
                    style={{ filter: isEngineRunning ? 'blur(1px)' : 'none' }} />
                  {/* Spinner cone */}
                  <circle cx="50" cy="50" r="10" fill="#3a3a3a" stroke="#2a2a2a" strokeWidth="2" />
                </g>
                {/* Motion blur disc when running */}
                {isEngineRunning && (
                  <circle cx="50" cy="50" r="48" fill="rgba(80,80,80,0.25)" />
                )}
              </svg>
            </div>

            {/* Radiator flap - visible opening animation */}
            <div 
              className="absolute z-20 transition-all duration-500"
              style={{ 
                left: RADIATOR_POSITION.left, 
                top: RADIATOR_POSITION.top,
                width: RADIATOR_POSITION.width,
              }}
            >
              {/* Radiator scoop visualization */}
              <div className="relative">
                {/* The flap itself */}
                <div 
                  className={`relative transition-all duration-500 overflow-visible`}
                  style={{
                    transformOrigin: 'top center',
                  }}
                >
                  {/* Radiator intake outline - always visible */}
                  <div 
                    className={`w-full h-4 rounded-sm transition-all duration-500 ${
                      radiatorOpen 
                        ? 'bg-stone-900/80 border-2 border-emerald-500/60' 
                        : 'bg-stone-700/40 border border-stone-600/40'
                    }`}
                  />
                  
                  {/* Open flap - drops down */}
                  <div 
                    className={`absolute top-full left-0 right-0 transition-all duration-500 origin-top ${
                      radiatorOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
                    }`}
                  >
                    {/* Flap angled down */}
                    <div 
                      className="h-5 bg-gradient-to-b from-stone-500 to-stone-600 rounded-b border-x border-b border-stone-600"
                      style={{
                        transform: 'perspective(80px) rotateX(-30deg)',
                        boxShadow: '0 3px 6px rgba(0,0,0,0.6)',
                      }}
                    />
                    
                    {/* Airflow indicator - horizontal, matching aircraft direction */}
                    <div className="absolute top-0 -left-2 -right-2 h-full flex flex-col justify-around pointer-events-none overflow-hidden">
                      {[0, 1, 2].map(i => (
                        <div 
                          key={i}
                          className="h-0.5 w-8 bg-gradient-to-r from-emerald-400/60 via-emerald-400/30 to-transparent rounded-full"
                          style={{
                            animation: `airflowHorizontal 0.5s ease-out infinite`,
                            animationDelay: `${i * 0.12}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Exhaust glow when engine running */}
            {isEngineRunning && (
              <div 
                className="absolute z-5"
                style={{ 
                  left: '14%', 
                  top: '40%',
                  width: '6%',
                  height: '8%',
                }}
              >
                <div className="w-full h-full bg-orange-500/40 blur-lg animate-pulse" />
              </div>
            )}

            {/* Hotspots */}
            {hotspots.map((hotspot, index) => {
              const colors = categoryColors[hotspot.category];
              const isFiltered = filterCategory && filterCategory !== hotspot.category;
              const isHovered = hoveredHotspot === hotspot.id;
              const isSelected = selectedHotspot?.id === hotspot.id;
              
              return (
                <button
                  key={hotspot.id}
                  className={`absolute z-30 group transition-all duration-300 ${
                    isFiltered ? 'opacity-20 pointer-events-none' : 'opacity-100'
                  }`}
                  style={{
                    left: `${hotspot.x}%`,
                    top: `${hotspot.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onClick={() => setSelectedHotspot(hotspot)}
                  onMouseEnter={() => setHoveredHotspot(hotspot.id)}
                  onMouseLeave={() => setHoveredHotspot(null)}
                  aria-label={`Learn about ${hotspot.label}`}
                >
                  {/* Pulse ring */}
                  <div 
                    className={`absolute inset-0 rounded-full ${colors.bg} animate-ping opacity-25`}
                    style={{ animationDuration: '2s' }}
                  />
                  
                  {/* Hotspot dot */}
                  <div 
                    className={`relative w-6 h-6 rounded-full ${colors.bg} border-2 border-white/50 
                      flex items-center justify-center transition-all duration-300
                      shadow-lg ${colors.glow} ${isHovered || isSelected ? 'scale-125' : 'scale-100'}`}
                  >
                    {hotspot.icon}
                  </div>

                  {/* Label tooltip */}
                  <div 
                    className={`absolute left-1/2 -translate-x-1/2 -top-10 px-3 py-1 rounded-lg 
                      bg-stone-900/95 border ${colors.border} whitespace-nowrap transition-all duration-300
                      ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
                  >
                    <span className={`text-xs font-medium ${colors.text}`}>{hotspot.label}</span>
                    <div className={`absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 
                      bg-stone-900 border-r ${colors.border} border-b rotate-45`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cockpit Panel - Always visible, full width */}
        <div 
          className={`mt-8 max-w-5xl mx-auto transition-all duration-1000 delay-700 ${
            introComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <CockpitPanel
            isEngineRunning={isEngineRunning}
            radiatorOpen={radiatorOpen}
            throttle={throttle}
            propPitch={propPitch}
            gaugeValues={gaugeValues}
            onToggleEngine={toggleEngine}
            onToggleRadiator={toggleRadiator}
            onThrottleChange={setThrottle}
            onPropPitchChange={setPropPitch}
          />
        </div>

        {/* Information section */}
        <section 
          className={`mt-8 max-w-4xl mx-auto transition-all duration-1000 delay-1000 ${
            introComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-stone-800/30 backdrop-blur-sm rounded-xl border border-stone-700/50 p-6">
              <h3 className="text-amber-500 text-sm uppercase tracking-widest mb-2">Speed</h3>
              <p className="text-3xl font-light text-stone-100">408 <span className="text-lg text-stone-500">mph</span></p>
              <p className="text-stone-500 text-xs mt-1">Maximum at 25,000 ft</p>
            </div>
            <div className="bg-stone-800/30 backdrop-blur-sm rounded-xl border border-stone-700/50 p-6">
              <h3 className="text-amber-500 text-sm uppercase tracking-widest mb-2">Ceiling</h3>
              <p className="text-3xl font-light text-stone-100">43,000 <span className="text-lg text-stone-500">ft</span></p>
              <p className="text-stone-500 text-xs mt-1">Service ceiling</p>
            </div>
            <div className="bg-stone-800/30 backdrop-blur-sm rounded-xl border border-stone-700/50 p-6">
              <h3 className="text-amber-500 text-sm uppercase tracking-widest mb-2">Climb</h3>
              <p className="text-3xl font-light text-stone-100">4,100 <span className="text-lg text-stone-500">ft/min</span></p>
              <p className="text-stone-500 text-xs mt-1">Rate of climb</p>
            </div>
          </div>

          <div className="mt-8 bg-stone-800/20 backdrop-blur-sm rounded-xl border border-stone-700/30 p-6">
            <div className="flex items-start gap-4">
              <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-stone-200 font-medium mb-2">Explore the Aircraft</h3>
                <p className="text-stone-400 text-sm leading-relaxed">
                  Click on the glowing hotspots to learn about each component of the Spitfire Mk IX. 
                  Use the cockpit controls below to start the engine and control the radiator flap.
                  Watch how the instruments respond and observe the propeller spin and radiator open on the aircraft above.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Detail panel modal */}
      {selectedHotspot && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedHotspot(null)}
        >
          <div 
            className="relative max-w-2xl w-full bg-stone-900/95 backdrop-blur-md rounded-2xl border border-stone-700 
              shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
            style={{
              animation: 'slideUp 0.3s ease-out',
            }}
          >
            {/* Header */}
            <div className={`p-6 border-b border-stone-700/50`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs uppercase tracking-wider mb-2 
                    ${categoryColors[selectedHotspot.category].bg}/20 ${categoryColors[selectedHotspot.category].text} 
                    border ${categoryColors[selectedHotspot.category].border}/50`}>
                    {selectedHotspot.icon}
                    {selectedHotspot.category}
                  </div>
                  <h2 className="text-2xl font-light text-stone-100">{selectedHotspot.content.title}</h2>
                  <p className="text-stone-400 italic">{selectedHotspot.content.subtitle}</p>
                </div>
                <button
                  onClick={() => setSelectedHotspot(null)}
                  className="p-2 rounded-lg hover:bg-stone-800 transition-colors text-stone-400 hover:text-stone-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-stone-300 leading-relaxed mb-6">
                {selectedHotspot.content.description}
              </p>

              {selectedHotspot.content.specs && (
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {selectedHotspot.content.specs.map((spec, i) => (
                    <div key={i} className="bg-stone-800/50 rounded-lg p-3 border border-stone-700/30">
                      <p className="text-stone-500 text-xs uppercase tracking-wider">{spec.label}</p>
                      <p className="text-stone-200 font-medium">{spec.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {selectedHotspot.content.didYouKnow && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <p className="text-amber-500 text-xs uppercase tracking-wider">Did You Know?</p>
                  </div>
                  <p className="text-amber-200/90 text-sm">{selectedHotspot.content.didYouKnow}</p>
                </div>
              )}
            </div>

            {/* Navigation hint */}
            <div className="px-6 pb-4 flex items-center justify-between text-stone-500 text-xs">
              <span>Click anywhere outside to close</span>
              <div className="flex items-center gap-1">
                <span>Explore more</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes airflow {
          0% {
            opacity: 0;
            transform: translateY(0);
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(20px);
          }
        }
        
        @keyframes airflowHorizontal {
          0% {
            opacity: 0;
            transform: translateX(-10px);
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(30px);
          }
        }
      `}</style>
    </div>
  );
};

export default SpitfireInteractive;
