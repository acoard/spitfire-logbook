import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { LogEntry, AircraftCategory } from '../types';

// Convert lat/lng to 3D position on sphere
const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

// Generate arc curve between two points with configurable height
const createArcCurve = (
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
  arcHeight: number = 0.15
): THREE.CubicBezierCurve3 => {
  const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const distance = start.distanceTo(end);
  const heightFactor = Math.min(arcHeight + distance * 0.1, 0.5);
  midPoint.normalize().multiplyScalar(radius * (1 + heightFactor));
  
  // Control points for smooth curve
  const ctrl1 = start.clone().lerp(midPoint, 0.33);
  const ctrl2 = end.clone().lerp(midPoint, 0.33);
  
  return new THREE.CubicBezierCurve3(start, ctrl1, ctrl2, end);
};

interface FlightArcProps {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  color: string;
  isActive: boolean;
  radius: number;
  onClick?: () => void;
}

// Animated flight particle along the arc
const FlightParticle: React.FC<{ 
  curve: THREE.CubicBezierCurve3; 
  color: string;
  speed?: number;
}> = ({ curve, color, speed = 0.3 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef(Math.random()); // Start at random position
  
  useFrame((_, delta) => {
    if (meshRef.current) {
      progressRef.current = (progressRef.current + delta * speed) % 1;
      const point = curve.getPoint(progressRef.current);
      meshRef.current.position.copy(point);
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.008, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </mesh>
  );
};

const FlightArc: React.FC<FlightArcProps> = ({ origin, destination, color, isActive, radius, onClick }) => {
  const tubeRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const { points, curve } = useMemo(() => {
    const startPos = latLngToVector3(origin.lat, origin.lng, radius);
    const endPos = latLngToVector3(destination.lat, destination.lng, radius);
    const arcCurve = createArcCurve(startPos, endPos, radius);
    const pts = arcCurve.getPoints(64);
    return { points: pts, curve: arcCurve };
  }, [origin, destination, radius]);

  // Create tube geometry for more visible arcs
  const tubeGeometry = useMemo(() => {
    const tubeRadius = isActive ? 0.004 : (hovered ? 0.003 : 0.002);
    return new THREE.TubeGeometry(curve, 64, tubeRadius, 8, false);
  }, [curve, isActive, hovered]);

  const opacity = isActive ? 1 : (hovered ? 0.85 : 0.45);

  return (
    <group>
      {/* Main arc tube */}
      <mesh
        ref={tubeRef}
        geometry={tubeGeometry}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={opacity}
          emissive={color}
          emissiveIntensity={isActive ? 0.5 : 0.15}
          metalness={0.3}
          roughness={0.6}
        />
      </mesh>
      
      {/* Glowing outer tube for active routes */}
      {isActive && (
        <mesh geometry={new THREE.TubeGeometry(curve, 64, 0.008, 8, false)}>
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={0.15}
          />
        </mesh>
      )}
      
      {/* Animated particle along active routes */}
      {isActive && (
        <>
          <FlightParticle curve={curve} color={color} speed={0.4} />
          <FlightParticle curve={curve} color={color} speed={0.35} />
        </>
      )}
      
      {/* Hovered highlight */}
      {hovered && !isActive && (
        <mesh geometry={new THREE.TubeGeometry(curve, 64, 0.005, 8, false)}>
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={0.2}
          />
        </mesh>
      )}
    </group>
  );
};

interface LocationMarkerProps {
  lat: number;
  lng: number;
  color: string;
  radius: number;
  isOrigin?: boolean;
  isTarget?: boolean;
  isActive?: boolean;
  name?: string;
  onClick?: () => void;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ 
  lat, lng, color, radius, isOrigin, isTarget, isActive, name, onClick 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const position = useMemo(() => latLngToVector3(lat, lng, radius), [lat, lng, radius]);
  
  // Pulsing animation for active markers
  useFrame(({ clock }) => {
    if (meshRef.current && isActive) {
      const scale = 1 + Math.sin(clock.elapsedTime * 3) * 0.2;
      meshRef.current.scale.setScalar(scale);
    }
  });

  const markerSize = isTarget ? 0.018 : 0.022;
  const actualColor = isTarget ? '#1c1917' : color;

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        <sphereGeometry args={[markerSize * (hovered ? 1.3 : 1), 16, 16]} />
        <meshStandardMaterial 
          color={actualColor}
          emissive={actualColor}
          emissiveIntensity={isActive ? 0.5 : 0.2}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
      
      {/* Marker pin stem */}
      <mesh position={[0, markerSize * 1.5, 0]}>
        <cylinderGeometry args={[0.003, 0.003, markerSize * 2, 8]} />
        <meshStandardMaterial color={actualColor} metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* Tooltip on hover */}
      {hovered && name && (
        <Html
          position={[0, 0.08, 0]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-stone-900/95 text-stone-100 px-3 py-2 rounded-lg text-xs font-typewriter whitespace-nowrap border border-amber-700/50 shadow-xl">
            <div className="font-bold text-amber-400">{name}</div>
            {isTarget && <div className="text-red-400 text-[10px] uppercase mt-0.5">Target</div>}
            {isOrigin && <div className="text-green-400 text-[10px] uppercase mt-0.5">Origin</div>}
          </div>
        </Html>
      )}
    </group>
  );
};

// Vintage-style Earth globe with sepia/antique appearance
const VintageGlobe: React.FC<{ radius: number }> = ({ radius }) => {
  const globeRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const graticuleRef = useRef<THREE.LineSegments>(null);

  // Create vintage-style procedural texture with better continent shapes
  const { globeTexture, bumpTexture } = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    
    // Ocean base - vintage sepia blue
    const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    oceanGradient.addColorStop(0, '#a8c4c4');
    oceanGradient.addColorStop(0.3, '#9bb8b8');
    oceanGradient.addColorStop(0.5, '#8faaaa');
    oceanGradient.addColorStop(0.7, '#9bb8b8');
    oceanGradient.addColorStop(1, '#a8c4c4');
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add subtle wave pattern to ocean
    ctx.strokeStyle = 'rgba(120, 150, 150, 0.15)';
    ctx.lineWidth = 1;
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < canvas.width; x += 10) {
        ctx.lineTo(x, y + Math.sin(x * 0.02) * 3);
      }
      ctx.stroke();
    }
    
    // Land color (sepia brown-green)
    const landColor = '#b8a080';
    const landBorder = '#786040';
    
    // Helper to draw more realistic landmass shapes
    const drawLandmass = (points: [number, number][], fill = true) => {
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
      }
      ctx.closePath();
      if (fill) {
        ctx.fillStyle = landColor;
        ctx.fill();
      }
      ctx.strokeStyle = landBorder;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };
    
    // Europe (more detailed shape)
    drawLandmass([
      [1050, 220], [1080, 200], [1120, 210], [1160, 200], [1200, 220],
      [1220, 250], [1200, 280], [1180, 320], [1150, 350], [1120, 340],
      [1100, 360], [1060, 340], [1040, 300], [1020, 260], [1050, 220]
    ]);
    
    // UK
    drawLandmass([
      [1000, 230], [1020, 210], [1040, 220], [1030, 260], [1010, 280],
      [990, 270], [980, 240], [1000, 230]
    ]);
    
    // Scandinavia
    drawLandmass([
      [1100, 120], [1140, 100], [1180, 130], [1170, 180], [1130, 200],
      [1100, 180], [1090, 140], [1100, 120]
    ]);
    
    // Africa (larger triangular shape)
    drawLandmass([
      [1050, 380], [1100, 360], [1180, 370], [1200, 420], [1180, 520],
      [1140, 620], [1100, 680], [1050, 640], [1020, 560], [1000, 480],
      [1020, 420], [1050, 380]
    ]);
    
    // Asia (large mass)
    drawLandmass([
      [1200, 180], [1300, 150], [1450, 160], [1600, 200], [1700, 280],
      [1750, 350], [1700, 400], [1600, 420], [1500, 450], [1400, 480],
      [1320, 450], [1280, 400], [1250, 350], [1220, 280], [1200, 220], [1200, 180]
    ]);
    
    // India
    drawLandmass([
      [1380, 400], [1420, 380], [1460, 420], [1440, 500], [1400, 550],
      [1360, 520], [1350, 460], [1380, 400]
    ]);
    
    // Southeast Asia
    drawLandmass([
      [1520, 450], [1560, 430], [1600, 460], [1580, 520], [1540, 560],
      [1500, 540], [1480, 490], [1520, 450]
    ]);
    
    // North America
    drawLandmass([
      [200, 140], [350, 100], [480, 120], [550, 180], [580, 280],
      [560, 360], [500, 400], [420, 380], [340, 320], [280, 280],
      [220, 240], [180, 200], [200, 140]
    ]);
    
    // Central America
    drawLandmass([
      [380, 420], [420, 410], [450, 440], [420, 490], [380, 500],
      [350, 470], [360, 440], [380, 420]
    ]);
    
    // South America
    drawLandmass([
      [420, 520], [480, 500], [540, 540], [560, 620], [520, 720],
      [460, 800], [400, 780], [380, 700], [360, 620], [380, 560],
      [420, 520]
    ]);
    
    // Australia
    drawLandmass([
      [1620, 580], [1700, 560], [1760, 600], [1780, 680], [1720, 720],
      [1640, 700], [1600, 660], [1580, 620], [1620, 580]
    ]);
    
    // Japan
    drawLandmass([
      [1680, 300], [1700, 280], [1720, 300], [1710, 350], [1680, 360],
      [1660, 340], [1680, 300]
    ]);
    
    // Add paper texture noise
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 12;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);
    
    // Add aged stains/marks for authenticity
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const r = 30 + Math.random() * 60;
      const stainGradient = ctx.createRadialGradient(x, y, 0, x, y, r);
      stainGradient.addColorStop(0, 'rgba(100, 80, 60, 0.08)');
      stainGradient.addColorStop(1, 'rgba(100, 80, 60, 0)');
      ctx.fillStyle = stainGradient;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    
    // Add vintage vignette edges
    const vignetteGradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, canvas.height * 0.4,
      canvas.width / 2, canvas.height / 2, canvas.height * 0.9
    );
    vignetteGradient.addColorStop(0, 'rgba(0,0,0,0)');
    vignetteGradient.addColorStop(1, 'rgba(40,30,20,0.2)');
    ctx.fillStyle = vignetteGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Apply sepia filter effect
    const finalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const finalData = finalImageData.data;
    for (let i = 0; i < finalData.length; i += 4) {
      const r = finalData[i];
      const g = finalData[i + 1];
      const b = finalData[i + 2];
      
      // Subtle sepia
      finalData[i] = Math.min(255, r * 1.05 + 10);
      finalData[i + 1] = Math.min(255, g * 0.98 + 5);
      finalData[i + 2] = Math.min(255, b * 0.90);
    }
    ctx.putImageData(finalImageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    
    // Create bump map for terrain effect
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 1024;
    bumpCanvas.height = 512;
    const bumpCtx = bumpCanvas.getContext('2d')!;
    bumpCtx.fillStyle = '#808080';
    bumpCtx.fillRect(0, 0, bumpCanvas.width, bumpCanvas.height);
    
    const bumpData = bumpCtx.getImageData(0, 0, bumpCanvas.width, bumpCanvas.height);
    const bumpPixels = bumpData.data;
    for (let i = 0; i < bumpPixels.length; i += 4) {
      const noise = Math.random() * 25;
      bumpPixels[i] = 128 + noise;
      bumpPixels[i + 1] = 128 + noise;
      bumpPixels[i + 2] = 128 + noise;
    }
    bumpCtx.putImageData(bumpData, 0, 0);
    
    const bump = new THREE.CanvasTexture(bumpCanvas);
    
    return { globeTexture: texture, bumpTexture: bump };
  }, []);

  // Create graticule (lat/lon grid lines) on the globe
  const graticuleGeometry = useMemo(() => {
    const segments = 36;
    const points: THREE.Vector3[] = [];
    
    // Latitude lines (horizontal)
    for (let lat = -60; lat <= 60; lat += 30) {
      for (let lng = 0; lng <= 360; lng += 5) {
        const p1 = latLngToVector3(lat, lng, radius * 1.001);
        const p2 = latLngToVector3(lat, lng + 5, radius * 1.001);
        points.push(p1, p2);
      }
    }
    
    // Longitude lines (vertical)
    for (let lng = 0; lng < 360; lng += 30) {
      for (let lat = -80; lat <= 80; lat += 5) {
        const p1 = latLngToVector3(lat, lng, radius * 1.001);
        const p2 = latLngToVector3(lat + 5, lng, radius * 1.001);
        points.push(p1, p2);
      }
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }, [radius]);

  // Slow rotation for ambient effect
  useFrame(({ clock }) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = clock.elapsedTime * 0.015;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = clock.elapsedTime * 0.012;
    }
    if (graticuleRef.current) {
      graticuleRef.current.rotation.y = clock.elapsedTime * 0.015;
    }
  });

  return (
    <group>
      {/* Main globe */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          map={globeTexture}
          bumpMap={bumpTexture}
          bumpScale={0.015}
          metalness={0.05}
          roughness={0.85}
        />
      </mesh>
      
      {/* Graticule grid lines */}
      <lineSegments ref={graticuleRef} geometry={graticuleGeometry}>
        <lineBasicMaterial 
          color="#8b7355" 
          transparent 
          opacity={0.25}
          linewidth={1}
        />
      </lineSegments>
      
      {/* Atmosphere glow - warm sepia */}
      <mesh ref={atmosphereRef} scale={1.025}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial
          color="#d4a574"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Inner glow */}
      <mesh scale={1.015}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial
          color="#c9a86c"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Outer subtle glow for depth */}
      <mesh scale={1.05}>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshBasicMaterial
          color="#ffeedd"
          transparent
          opacity={0.02}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};

// Globe stand/base for museum feel
const GlobeStand: React.FC = () => {
  return (
    <group position={[0, -1.3, 0]}>
      {/* Meridian ring */}
      <mesh rotation={[0, 0, Math.PI / 12]}>
        <torusGeometry args={[1.15, 0.02, 16, 100]} />
        <meshStandardMaterial 
          color="#8b6914" 
          metalness={0.8} 
          roughness={0.3}
        />
      </mesh>
      
      {/* Support arc */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.15, 0.015, 16, 100, Math.PI]} />
        <meshStandardMaterial 
          color="#8b6914" 
          metalness={0.8} 
          roughness={0.3}
        />
      </mesh>
      
      {/* Vertical post */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.4, 16]} />
        <meshStandardMaterial 
          color="#654321" 
          metalness={0.6} 
          roughness={0.4}
        />
      </mesh>
      
      {/* Base */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.1, 32]} />
        <meshStandardMaterial 
          color="#4a3728" 
          metalness={0.5} 
          roughness={0.5}
        />
      </mesh>
      
      {/* Base detail ring */}
      <mesh position={[0, -0.35, 0]}>
        <torusGeometry args={[0.27, 0.015, 8, 32]} />
        <meshStandardMaterial 
          color="#8b6914" 
          metalness={0.8} 
          roughness={0.3}
        />
      </mesh>
    </group>
  );
};

// Ambient dust particles for atmosphere
const AmbientParticles: React.FC = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 200;
  
  const { positions, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Distribute particles in a sphere around the globe
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 1.5 + Math.random() * 1.5;
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      
      sz[i] = 0.5 + Math.random() * 1.5;
    }
    
    return { positions: pos, sizes: sz };
  }, []);
  
  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.elapsedTime * 0.01;
      particlesRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.05) * 0.05;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#d4a574"
        size={0.008}
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
};

// Camera controller with auto-rotation and smooth focus
const CameraController: React.FC<{ 
  selectedEntry: LogEntry | null;
  shouldCenter: boolean;
}> = ({ selectedEntry, shouldCenter }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const targetRotationRef = useRef<{ x: number; y: number } | null>(null);
  
  useEffect(() => {
    if (selectedEntry && shouldCenter && selectedEntry.origin && controlsRef.current) {
      // Calculate the angle to view the selected location
      const lat = selectedEntry.origin.lat;
      const lng = selectedEntry.origin.lng;
      
      // Convert to spherical coordinates for camera positioning
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      
      // Store target rotation for smooth interpolation
      targetRotationRef.current = { x: phi, y: theta };
    }
  }, [selectedEntry, shouldCenter]);
  
  useFrame(() => {
    if (targetRotationRef.current && controlsRef.current) {
      // Smooth rotation towards target - handled by OrbitControls damping
      targetRotationRef.current = null;
    }
  });
  
  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      minDistance={1.4}
      maxDistance={4}
      autoRotate={!selectedEntry}
      autoRotateSpeed={0.25}
      dampingFactor={0.08}
      enableDamping
      rotateSpeed={0.5}
      zoomSpeed={0.8}
    />
  );
};

interface GlobePanelProps {
  entries: LogEntry[];
  selectedEntry: LogEntry | null;
  onMarkerSelect: (entry: LogEntry) => void;
  shouldCenter: boolean;
}

// Validation helper
const isValidCoord = (val: any): boolean => {
  return typeof val === 'number' && !isNaN(val) && isFinite(val);
};

const getColor = (cat: AircraftCategory) => {
  switch (cat) {
    case AircraftCategory.TRAINING: return '#EAB308';
    case AircraftCategory.FIGHTER: return '#DC2626';
    case AircraftCategory.TRANSPORT: return '#3B82F6';
    default: return '#64748B';
  }
};

const GlobePanel: React.FC<GlobePanelProps> = ({ 
  entries, 
  selectedEntry, 
  onMarkerSelect, 
  shouldCenter 
}) => {
  const GLOBE_RADIUS = 1;
  
  // Filter entries with valid coordinates
  const validEntries = useMemo(() => {
    return entries.filter(entry => 
      entry.origin && 
      isValidCoord(entry.origin.lat) && 
      isValidCoord(entry.origin.lng)
    );
  }, [entries]);

  // Get entries with routes (origin -> destination or origin -> target)
  const routeEntries = useMemo(() => {
    return validEntries.filter(entry => {
      const hasDestination = entry.destination && 
        isValidCoord(entry.destination.lat) && 
        isValidCoord(entry.destination.lng) &&
        (entry.origin.lat !== entry.destination.lat || entry.origin.lng !== entry.destination.lng);
      const hasTarget = entry.target && 
        isValidCoord(entry.target.lat) && 
        isValidCoord(entry.target.lng);
      return hasDestination || hasTarget;
    });
  }, [validEntries]);

  return (
    <div className="h-full w-full relative globe-container">
      {/* Vintage frame overlay */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute inset-2 border-4 border-amber-900/30 rounded-lg" />
        <div className="absolute inset-4 border border-amber-800/20 rounded" />
      </div>
      
      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-amber-700/40 pointer-events-none z-10" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-amber-700/40 pointer-events-none z-10" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-amber-700/40 pointer-events-none z-10" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-amber-700/40 pointer-events-none z-10" />
      
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 50 }}
        style={{ background: 'linear-gradient(180deg, #1a1510 0%, #2d241b 50%, #1a1510 100%)' }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          {/* Ambient lighting for vintage feel */}
          <ambientLight intensity={0.4} color="#f5e6d3" />
          <directionalLight 
            position={[5, 3, 5]} 
            intensity={0.8} 
            color="#ffeedd"
            castShadow
          />
          <directionalLight 
            position={[-3, -1, -3]} 
            intensity={0.2} 
            color="#d4a574"
          />
          <pointLight position={[0, 2, 0]} intensity={0.3} color="#ffd700" />
          
          {/* Starfield background - subtle for vintage feel */}
          <Stars 
            radius={100} 
            depth={50} 
            count={1500} 
            factor={2.5} 
            saturation={0.05} 
            fade 
            speed={0.3}
          />
          
          {/* Ambient dust particles */}
          <AmbientParticles />
          
          {/* The globe */}
          <VintageGlobe radius={GLOBE_RADIUS} />
          
          {/* Globe stand */}
          <GlobeStand />
          
          {/* Flight arcs */}
          {routeEntries.map((entry) => {
            const isActive = selectedEntry?.id === entry.id;
            const color = getColor(entry.aircraftCategory);
            const routes: React.ReactElement[] = [];
            
            // Origin to target arc
            if (entry.target && isValidCoord(entry.target.lat) && isValidCoord(entry.target.lng)) {
              routes.push(
                <FlightArc
                  key={`arc-target-${entry.id}`}
                  origin={{ lat: entry.origin.lat, lng: entry.origin.lng }}
                  destination={{ lat: entry.target.lat, lng: entry.target.lng }}
                  color={color}
                  isActive={isActive}
                  radius={GLOBE_RADIUS}
                  onClick={() => onMarkerSelect(entry)}
                />
              );
            }
            
            // Target to destination or origin to destination
            if (entry.destination && isValidCoord(entry.destination.lat) && isValidCoord(entry.destination.lng)) {
              const fromPoint = entry.target && isValidCoord(entry.target.lat) 
                ? { lat: entry.target.lat, lng: entry.target.lng }
                : { lat: entry.origin.lat, lng: entry.origin.lng };
                
              if (fromPoint.lat !== entry.destination.lat || fromPoint.lng !== entry.destination.lng) {
                routes.push(
                  <FlightArc
                    key={`arc-dest-${entry.id}`}
                    origin={fromPoint}
                    destination={{ lat: entry.destination.lat, lng: entry.destination.lng }}
                    color={color}
                    isActive={isActive}
                    radius={GLOBE_RADIUS}
                    onClick={() => onMarkerSelect(entry)}
                  />
                );
              }
            }
            
            return routes;
          })}
          
          {/* Location markers */}
          {validEntries.map((entry) => {
            const isActive = selectedEntry?.id === entry.id;
            const color = getColor(entry.aircraftCategory);
            const markers: React.ReactElement[] = [];
            
            // Origin marker
            markers.push(
              <LocationMarker
                key={`marker-origin-${entry.id}`}
                lat={entry.origin.lat}
                lng={entry.origin.lng}
                color={color}
                radius={GLOBE_RADIUS}
                isOrigin
                isActive={isActive}
                name={entry.origin.name}
                onClick={() => onMarkerSelect(entry)}
              />
            );
            
            // Target marker
            if (entry.target && isValidCoord(entry.target.lat) && isValidCoord(entry.target.lng)) {
              markers.push(
                <LocationMarker
                  key={`marker-target-${entry.id}`}
                  lat={entry.target.lat}
                  lng={entry.target.lng}
                  color={color}
                  radius={GLOBE_RADIUS}
                  isTarget
                  isActive={isActive}
                  name={entry.target.name}
                  onClick={() => onMarkerSelect(entry)}
                />
              );
            }
            
            return markers;
          })}
          
          {/* Camera controls */}
          <CameraController selectedEntry={selectedEntry} shouldCenter={shouldCenter} />
        </Suspense>
      </Canvas>
      
      {/* Title plaque */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-gradient-to-b from-amber-900/90 to-amber-950/95 px-6 py-2 rounded border-2 border-amber-700/60 shadow-xl">
          <h2 className="text-amber-200/90 text-xs font-typewriter uppercase tracking-[0.4em] text-center">
            Flight Operations • 1944-1946
          </h2>
        </div>
      </div>
      
      {/* Selected Flight Info Panel */}
      {selectedEntry && (
        <div className="absolute top-20 left-6 z-20 max-w-xs animate-in slide-in-from-left duration-300">
          <div className="bg-gradient-to-br from-stone-900/95 to-stone-950/98 backdrop-blur-sm rounded-lg border-2 border-amber-700/50 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-amber-900/40 px-4 py-2 border-b border-amber-700/30">
              <div className="flex items-center gap-2">
                <span 
                  className="w-3 h-3 rounded-full animate-pulse" 
                  style={{ backgroundColor: getColor(selectedEntry.aircraftCategory) }}
                />
                <span className="text-amber-300 text-[10px] font-typewriter uppercase tracking-wider">
                  {selectedEntry.phase}
                </span>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <div className="text-amber-400/80 text-[9px] font-typewriter uppercase tracking-wider mb-0.5">Date</div>
                <div className="text-stone-200 text-sm font-typewriter">{selectedEntry.date}</div>
              </div>
              
              <div>
                <div className="text-amber-400/80 text-[9px] font-typewriter uppercase tracking-wider mb-0.5">Aircraft</div>
                <div className="text-stone-200 text-sm font-typewriter">{selectedEntry.aircraftType}</div>
              </div>
              
              <div>
                <div className="text-amber-400/80 text-[9px] font-typewriter uppercase tracking-wider mb-0.5">Mission</div>
                <div className="text-stone-200 text-sm font-typewriter">{selectedEntry.duty}</div>
              </div>
              
              <div className="pt-2 border-t border-amber-700/20">
                <div className="text-amber-400/80 text-[9px] font-typewriter uppercase tracking-wider mb-0.5">Route</div>
                <div className="text-stone-300 text-xs font-typewriter space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">●</span>
                    <span>{selectedEntry.origin.name}</span>
                  </div>
                  {selectedEntry.target && (
                    <div className="flex items-center gap-2">
                      <span className="text-red-400">◆</span>
                      <span>{selectedEntry.target.name}</span>
                    </div>
                  )}
                  {selectedEntry.destination && selectedEntry.destination.name !== selectedEntry.origin.name && (
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400">●</span>
                      <span>{selectedEntry.destination.name}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedEntry.isSignificant && (
                <div className="mt-2 px-2 py-1.5 bg-red-900/30 rounded border border-red-700/40">
                  <span className="text-red-400 text-[9px] font-typewriter uppercase tracking-wider">
                    ★ Significant Event
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute bottom-6 right-6 bg-stone-900/90 p-3 rounded-lg border border-amber-700/40 text-xs font-typewriter z-20 shadow-xl">
        <h4 className="font-bold mb-2 text-amber-400/90 border-b border-amber-700/30 pb-1 uppercase tracking-wider text-[10px]">
          Flight Routes
        </h4>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm shadow-yellow-500/50"></span>
          <span className="text-stone-300">Training</span>
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-3 h-3 rounded-full bg-red-600 shadow-sm shadow-red-500/50"></span>
          <span className="text-stone-300">Combat</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></span>
          <span className="text-stone-300">Transport</span>
        </div>
      </div>
      
      {/* Flight count */}
      <div className="absolute top-20 right-6 z-20">
        <div className="bg-stone-900/80 px-3 py-2 rounded-lg border border-amber-700/30 text-center">
          <div className="text-amber-400 text-2xl font-bold font-typewriter">{validEntries.length}</div>
          <div className="text-stone-400 text-[9px] font-typewriter uppercase tracking-wider">Flights</div>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-6 left-6 bg-stone-900/80 px-3 py-2 rounded border border-amber-700/30 text-[10px] font-typewriter text-stone-400 z-20">
        <div className="flex items-center gap-2">
          <span className="text-amber-500">⟳</span>
          <span>Drag to rotate</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-amber-500">⊕</span>
          <span>Scroll to zoom</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-amber-500">◉</span>
          <span>Click route for details</span>
        </div>
      </div>
    </div>
  );
};

export default GlobePanel;
