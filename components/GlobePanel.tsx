import React, { useRef, useMemo, useState, useEffect, Suspense, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { LogEntry, AircraftCategory } from '../types';
import FlightInfoPanel from './FlightInfoPanel';

// Convert lat/lng to 3D position on sphere
const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

// Generate arc curve between two points - moderate height
const createArcCurve = (
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number
): THREE.CubicBezierCurve3 => {
  const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const distance = start.distanceTo(end);
  
  // Moderate arc height - not too flat, not too dramatic
  const baseHeight = 0.08;
  const distanceMultiplier = 0.12;
  const heightFactor = Math.min(baseHeight + distance * distanceMultiplier, 0.35);
  
  midPoint.normalize().multiplyScalar(radius * (1 + heightFactor));
  
  // Control points for smooth curve
  const ctrl1 = start.clone().lerp(midPoint, 0.3);
  ctrl1.normalize().multiplyScalar(radius * (1 + heightFactor * 0.5));
  
  const ctrl2 = end.clone().lerp(midPoint, 0.3);
  ctrl2.normalize().multiplyScalar(radius * (1 + heightFactor * 0.5));
  
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
  const trailRef = useRef<THREE.Points>(null);
  const progressRef = useRef(Math.random());
  
  useFrame((_, delta) => {
    if (meshRef.current) {
      progressRef.current = (progressRef.current + delta * speed) % 1;
      const point = curve.getPoint(progressRef.current);
      meshRef.current.position.copy(point);
    }
  });
  
  return (
    <group>
      {/* Main particle */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.004, 6, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.95} />
      </mesh>
      {/* Particle glow */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.007, 6, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

const FlightArc: React.FC<FlightArcProps> = ({ origin, destination, color, isActive, radius, onClick }) => {
  const tubeRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const { curve } = useMemo(() => {
    const startPos = latLngToVector3(origin.lat, origin.lng, radius);
    const endPos = latLngToVector3(destination.lat, destination.lng, radius);
    const arcCurve = createArcCurve(startPos, endPos, radius);
    return { curve: arcCurve };
  }, [origin, destination, radius]);

  // Create tube geometry with varying thickness - thinner for cleaner look
  const tubeGeometry = useMemo(() => {
    const tubeRadius = isActive ? 0.002 : (hovered ? 0.0015 : 0.001);
    return new THREE.TubeGeometry(curve, 48, tubeRadius, 8, false);
  }, [curve, isActive, hovered]);

  const opacity = isActive ? 1 : (hovered ? 0.9 : 0.6);

  return (
    <group>
      {/* Shadow/depth tube underneath */}
      <mesh geometry={new THREE.TubeGeometry(curve, 48, isActive ? 0.003 : 0.0015, 8, false)}>
        <meshBasicMaterial 
          color="#000000" 
          transparent 
          opacity={0.2}
        />
      </mesh>
      
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
          emissiveIntensity={isActive ? 0.8 : 0.3}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      
      {/* Glowing outer tube for active routes */}
      {isActive && (
        <>
          <mesh geometry={new THREE.TubeGeometry(curve, 48, 0.004, 6, false)}>
            <meshBasicMaterial 
              color={color} 
              transparent 
              opacity={0.25}
            />
          </mesh>
          {/* Extra glow layer */}
          <mesh geometry={new THREE.TubeGeometry(curve, 48, 0.006, 6, false)}>
            <meshBasicMaterial 
              color={color} 
              transparent 
              opacity={0.1}
            />
          </mesh>
        </>
      )}
      
      {/* Animated particles along active routes */}
      {isActive && (
        <>
          <FlightParticle curve={curve} color={color} speed={0.35} />
          <FlightParticle curve={curve} color={color} speed={0.28} />
          <FlightParticle curve={curve} color="#ffffff" speed={0.42} />
        </>
      )}
      
      {/* Hovered highlight */}
      {hovered && !isActive && (
        <mesh geometry={new THREE.TubeGeometry(curve, 48, 0.003, 6, false)}>
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={0.3}
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
  count?: number;
  onClick?: () => void;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ 
  lat, lng, color, radius, isOrigin, isTarget, isActive, name, count, onClick 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const position = useMemo(() => latLngToVector3(lat, lng, radius), [lat, lng, radius]);
  
  // Pulsing animation for active markers
  useFrame(({ clock }) => {
    if (meshRef.current && isActive) {
      const scale = 1 + Math.sin(clock.elapsedTime * 3) * 0.15;
      meshRef.current.scale.setScalar(scale);
    }
  });

  // TINY marker sizes - much smaller for dense areas like Western Europe
  const isCluster = count && count > 1;
  const baseSize = isCluster 
    ? 0.003 + Math.min(count * 0.0005, 0.004) // Cluster: 0.003-0.007
    : (isTarget ? 0.002 : 0.0025); // Target: 0.002, Origin: 0.0025
  const markerSize = baseSize;
  const actualColor = isTarget ? '#1c1917' : color;

  return (
    <group position={position}>
      {/* Marker shadow for depth */}
      <mesh position={[0, -0.0005, 0]}>
        <sphereGeometry args={[markerSize * 1.3, 8, 8]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} />
      </mesh>
      
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        <sphereGeometry args={[markerSize * (hovered ? 1.5 : 1), 12, 12]} />
        <meshStandardMaterial 
          color={actualColor}
          emissive={actualColor}
          emissiveIntensity={isActive ? 0.8 : 0.4}
          metalness={0.3}
          roughness={0.5}
        />
      </mesh>
      
      {/* Marker pin stem - only for non-clusters, very small */}
      {!isCluster && (
        <mesh position={[0, markerSize * 1.5, 0]}>
          <cylinderGeometry args={[0.0005, 0.0005, markerSize * 2, 4]} />
          <meshStandardMaterial color={actualColor} metalness={0.5} roughness={0.5} />
        </mesh>
      )}
      
      {/* Cluster count badge - positioned just above the tiny marker */}
      {isCluster && (
        <Html
          position={[0, 0.012, 0]}
          center
          occlude
          zIndexRange={[0, 1]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-stone-900/95 text-amber-300 px-1 py-0.5 rounded-full text-[7px] font-bold font-typewriter border border-amber-700/60 min-w-[14px] text-center">
            {count}
          </div>
        </Html>
      )}
      
      {/* Tooltip on hover */}
      {hovered && (name || isCluster) && (
        <Html
          position={[0, 0.02, 0]}
          center
          occlude
          zIndexRange={[0, 1]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-stone-900/95 text-stone-100 px-2 py-1.5 rounded-lg text-[10px] font-typewriter whitespace-nowrap border border-amber-700/50 shadow-xl">
            <div className="font-bold text-amber-400">{name || 'Multiple Locations'}</div>
            {isCluster && <div className="text-amber-300 text-[9px] mt-0.5">{count} flights</div>}
            {isTarget && <div className="text-red-400 text-[9px] uppercase mt-0.5">Target</div>}
            {isOrigin && !isCluster && <div className="text-green-400 text-[9px] uppercase mt-0.5">Origin</div>}
          </div>
        </Html>
      )}
    </group>
  );
};

// Earth texture URLs - using higher resolution images
// NASA Blue Marble 8K resolution for detailed zoom
const EARTH_TEXTURE_URL = 'https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg';
const EARTH_TEXTURE_URL_HD = 'https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74393/world.topo.200412.3x5400x2700.jpg';
const EARTH_BUMP_URL = 'https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png';

// Vintage WW2 cartographic style globe using custom shader
const VintageGlobe: React.FC<{ radius: number }> = ({ radius }) => {
  const globeRef = useRef<THREE.Mesh>(null);
  const [textures, setTextures] = useState<{
    map: THREE.Texture | null;
    bump: THREE.Texture | null;
  }>({ map: null, bump: null });

  // Load earth textures
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    
    // Try HD texture first, fall back to standard if it fails
    loader.load(
      EARTH_TEXTURE_URL_HD,
      (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.anisotropy = 16; // Better quality at angles
        setTextures(prev => ({ ...prev, map: texture }));
      },
      undefined,
      // Fallback to standard resolution
      () => {
        loader.load(
          EARTH_TEXTURE_URL,
          (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            setTextures(prev => ({ ...prev, map: texture }));
          }
        );
      }
    );
    
    loader.load(
      EARTH_BUMP_URL,
      (texture) => {
        setTextures(prev => ({ ...prev, bump: texture }));
      },
      undefined,
      (error) => console.error('Error loading bump texture:', error)
    );
  }, []);

  // Custom shader material for vintage cartographic look
  const vintageMaterial = useMemo(() => {
    if (!textures.map) return null;
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: textures.map },
        uBumpMap: { value: textures.bump },
        uBumpScale: { value: 0.02 },
        uSepiaStrength: { value: 0.45 },
        uDesaturation: { value: 0.35 },
        uContrast: { value: 1.15 },
        uBrightness: { value: 0.05 },
        uVignette: { value: 0.3 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform float uSepiaStrength;
        uniform float uDesaturation;
        uniform float uContrast;
        uniform float uBrightness;
        uniform float uVignette;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vec4 texColor = texture2D(uTexture, vUv);
          vec3 color = texColor.rgb;
          
          // Increase contrast
          color = (color - 0.5) * uContrast + 0.5 + uBrightness;
          
          // Desaturate
          float luminance = dot(color, vec3(0.299, 0.587, 0.114));
          color = mix(color, vec3(luminance), uDesaturation);
          
          // Apply sepia tone (vintage map colors)
          vec3 sepia;
          sepia.r = luminance * 1.1;
          sepia.g = luminance * 0.9;
          sepia.b = luminance * 0.7;
          color = mix(color, sepia, uSepiaStrength);
          
          // Add warm tint for aged paper look
          color.r += 0.05;
          color.g += 0.02;
          color.b -= 0.03;
          
          // Vignette effect for aged look
          vec2 center = vUv - 0.5;
          float dist = length(center);
          float vignette = smoothstep(0.5, 0.2, dist);
          color = mix(color * 0.7, color, vignette * (1.0 - uVignette) + (1.0 - uVignette));
          
          // Simple lighting based on normal
          float light = dot(vNormal, normalize(vec3(1.0, 0.5, 1.0))) * 0.3 + 0.7;
          color *= light;
          
          // Clamp values
          color = clamp(color, 0.0, 1.0);
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
    
    return material;
  }, [textures.map, textures.bump]);

  // Fallback material while loading
  const fallbackMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#a8b4a0',
      metalness: 0.05,
      roughness: 0.85,
    });
  }, []);

  return (
    <mesh ref={globeRef} material={vintageMaterial || fallbackMaterial}>
      <sphereGeometry args={[radius, 64, 64]} />
    </mesh>
  );
};

// Graticule (lat/lon grid lines) - more visible for cartographic feel
const Graticule: React.FC<{ radius: number }> = ({ radius }) => {
  const graticuleGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    
    // Latitude lines (every 15 degrees for more detail)
    for (let lat = -75; lat <= 75; lat += 15) {
      for (let lng = 0; lng <= 360; lng += 3) {
        const p1 = latLngToVector3(lat, lng, radius * 1.003);
        const p2 = latLngToVector3(lat, lng + 3, radius * 1.003);
        points.push(p1, p2);
      }
    }
    
    // Longitude lines (every 15 degrees)
    for (let lng = 0; lng < 360; lng += 15) {
      for (let lat = -75; lat <= 75; lat += 3) {
        const p1 = latLngToVector3(lat, lng, radius * 1.003);
        const p2 = latLngToVector3(lat + 3, lng, radius * 1.003);
        points.push(p1, p2);
      }
    }
    
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [radius]);

  return (
    <lineSegments geometry={graticuleGeometry}>
      <lineBasicMaterial 
        color="#5a4a3a" 
        transparent 
        opacity={0.25}
        linewidth={1}
      />
    </lineSegments>
  );
};

// Atmosphere glow effects
const Atmosphere: React.FC<{ radius: number }> = ({ radius }) => {
  return (
    <group>
      <mesh scale={1.025}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial
          color="#d4a574"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </mesh>
      
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

// Globe stand/base
const GlobeStand: React.FC = () => {
  return (
    <group position={[0, -1.3, 0]}>
      <mesh rotation={[0, 0, Math.PI / 12]}>
        <torusGeometry args={[1.15, 0.02, 16, 100]} />
        <meshStandardMaterial color="#8b6914" metalness={0.8} roughness={0.3} />
      </mesh>
      
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.15, 0.015, 16, 100, Math.PI]} />
        <meshStandardMaterial color="#8b6914" metalness={0.8} roughness={0.3} />
      </mesh>
      
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.4, 16]} />
        <meshStandardMaterial color="#654321" metalness={0.6} roughness={0.4} />
      </mesh>
      
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.1, 32]} />
        <meshStandardMaterial color="#4a3728" metalness={0.5} roughness={0.5} />
      </mesh>
      
      <mesh position={[0, -0.35, 0]}>
        <torusGeometry args={[0.27, 0.015, 8, 32]} />
        <meshStandardMaterial color="#8b6914" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
};

// Ambient dust particles
const AmbientParticles: React.FC = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 150;
  
  const { positions, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
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
      particlesRef.current.rotation.y = clock.elapsedTime * 0.008;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial color="#d4a574" size={0.006} transparent opacity={0.35} sizeAttenuation />
    </points>
  );
};

// Rotating globe group
interface RotatingGlobeGroupProps {
  radius: number;
  children: React.ReactNode;
  autoRotate: boolean;
}

const RotatingGlobeGroup: React.FC<RotatingGlobeGroupProps> = ({ radius, children, autoRotate }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.015;
    }
  });

  return (
    <group ref={groupRef}>
      <VintageGlobe radius={radius} />
      <Graticule radius={radius} />
      {children}
    </group>
  );
};

// Camera controller - allows MORE zoom
const CameraController: React.FC<{ 
  selectedEntry: LogEntry | null;
  shouldCenter: boolean;
  onZoomChange: (zoom: number) => void;
}> = ({ selectedEntry, shouldCenter, onZoomChange }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  
  useFrame(() => {
    if (controlsRef.current) {
      const distance = camera.position.length();
      onZoomChange(distance);
    }
  });
  
  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      minDistance={1.2}  // Allow very close zoom for detailed viewing
      maxDistance={4}
      autoRotate={false}
      dampingFactor={0.08}
      enableDamping
      rotateSpeed={0.5}
      zoomSpeed={1.0}    // Faster zoom
    />
  );
};

interface GlobePanelProps {
  entries: LogEntry[];
  selectedEntry: LogEntry | null;
  onMarkerSelect: (entry: LogEntry) => void;
  shouldCenter: boolean;
  isTimelineCollapsed?: boolean;
}

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

// Clustering algorithm
interface MarkerCluster {
  lat: number;
  lng: number;
  entries: LogEntry[];
  color: string;
  name: string;
}

const clusterMarkers = (entries: LogEntry[], clusterRadius: number): MarkerCluster[] => {
  const clusters: MarkerCluster[] = [];
  const processed = new Set<string>();
  
  for (const entry of entries) {
    if (!entry.origin || processed.has(entry.id)) continue;
    
    const nearbyEntries = entries.filter(e => {
      if (!e.origin || processed.has(e.id)) return false;
      if (e.id === entry.id) return true;
      
      const latDiff = Math.abs(e.origin.lat - entry.origin.lat);
      const lngDiff = Math.abs(e.origin.lng - entry.origin.lng);
      return latDiff < clusterRadius && lngDiff < clusterRadius;
    });
    
    nearbyEntries.forEach(e => processed.add(e.id));
    
    const avgLat = nearbyEntries.reduce((sum, e) => sum + e.origin!.lat, 0) / nearbyEntries.length;
    const avgLng = nearbyEntries.reduce((sum, e) => sum + e.origin!.lng, 0) / nearbyEntries.length;
    
    const categoryCount: Record<string, number> = {};
    nearbyEntries.forEach(e => {
      categoryCount[e.aircraftCategory] = (categoryCount[e.aircraftCategory] || 0) + 1;
    });
    const dominantCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0][0] as AircraftCategory;
    
    const names = nearbyEntries.map(e => e.origin?.name).filter(Boolean);
    const nameCount: Record<string, number> = {};
    names.forEach(n => { if (n) nameCount[n] = (nameCount[n] || 0) + 1; });
    const dominantName = Object.entries(nameCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Multiple Locations';
    
    clusters.push({
      lat: avgLat,
      lng: avgLng,
      entries: nearbyEntries,
      color: getColor(dominantCategory),
      name: nearbyEntries.length > 1 ? `${dominantName} area` : dominantName
    });
  }
  
  return clusters;
};

const GlobePanel: React.FC<GlobePanelProps> = ({ entries, selectedEntry, onMarkerSelect, shouldCenter, isTimelineCollapsed = false }) => {
  const GLOBE_RADIUS = 1;
  const [zoomLevel, setZoomLevel] = useState(2.5);
  
  const validEntries = useMemo(() => {
    return entries.filter(entry => 
      entry.origin && isValidCoord(entry.origin.lat) && isValidCoord(entry.origin.lng)
    );
  }, [entries]);

  // More aggressive clustering at distance, less when close
  const clusterRadius = useMemo(() => {
    if (zoomLevel < 1.3) return 0.5;  // Very close - almost no clustering
    if (zoomLevel < 1.5) return 1;
    if (zoomLevel < 1.8) return 2;
    if (zoomLevel < 2.2) return 4;
    if (zoomLevel < 2.8) return 6;
    return 10;
  }, [zoomLevel]);
  
  const clusteredMarkers = useMemo(() => {
    return clusterMarkers(validEntries, clusterRadius);
  }, [validEntries, clusterRadius]);

  const routeEntries = useMemo(() => {
    return validEntries.filter(entry => {
      const hasDestination = entry.destination && 
        isValidCoord(entry.destination.lat) && isValidCoord(entry.destination.lng) &&
        (entry.origin.lat !== entry.destination.lat || entry.origin.lng !== entry.destination.lng);
      const hasTarget = entry.target && isValidCoord(entry.target.lat) && isValidCoord(entry.target.lng);
      return hasDestination || hasTarget;
    });
  }, [validEntries]);
  
  const handleZoomChange = useCallback((zoom: number) => {
    setZoomLevel(zoom);
  }, []);

  const autoRotate = !selectedEntry;

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
          <ambientLight intensity={0.5} color="#f5e6d3" />
          <directionalLight position={[5, 3, 5]} intensity={0.9} color="#ffeedd" castShadow />
          <directionalLight position={[-3, -1, -3]} intensity={0.25} color="#d4a574" />
          <pointLight position={[0, 2, 0]} intensity={0.35} color="#ffd700" />
          
          <Stars radius={100} depth={50} count={1200} factor={2.5} saturation={0.05} fade speed={0.3} />
          
          <AmbientParticles />
          <Atmosphere radius={GLOBE_RADIUS} />
          <GlobeStand />
          
          <RotatingGlobeGroup radius={GLOBE_RADIUS} autoRotate={autoRotate}>
            {/* Flight arcs */}
            {routeEntries.map((entry) => {
              const isActive = selectedEntry?.id === entry.id;
              const color = getColor(entry.aircraftCategory);
              const routes: React.ReactElement[] = [];
              
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
            
            {/* Clustered location markers */}
            {clusteredMarkers.map((cluster, idx) => {
              const isActive = cluster.entries.some(e => selectedEntry?.id === e.id);
              
              return (
                <LocationMarker
                  key={`cluster-${idx}`}
                  lat={cluster.lat}
                  lng={cluster.lng}
                  color={cluster.color}
                  radius={GLOBE_RADIUS}
                  isOrigin
                  isActive={isActive}
                  name={cluster.name}
                  count={cluster.entries.length}
                  onClick={() => onMarkerSelect(cluster.entries[0])}
                />
              );
            })}
            
            {/* Target markers */}
            {validEntries.map((entry) => {
              if (!entry.target || !isValidCoord(entry.target.lat) || !isValidCoord(entry.target.lng)) {
                return null;
              }
              const isActive = selectedEntry?.id === entry.id;
              const color = getColor(entry.aircraftCategory);
              
              return (
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
            })}
          </RotatingGlobeGroup>
          
          <CameraController 
            selectedEntry={selectedEntry} 
            shouldCenter={shouldCenter} 
            onZoomChange={handleZoomChange}
          />
        </Suspense>
      </Canvas>
      
      {/* Title plaque */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 hidden sm:block">
        <div className="bg-gradient-to-b from-amber-900/90 to-amber-950/95 px-6 py-2 rounded border-2 border-amber-700/60 shadow-xl">
          <h2 className="text-amber-200/90 text-xs font-typewriter uppercase tracking-[0.4em] text-center">
            Flight Operations • 1944-1946
          </h2>
        </div>
      </div>
      
      {/* Flight Info Panel - using shared component, positioned above timeline on mobile */}
      <FlightInfoPanel 
        selectedEntry={selectedEntry} 
        variant="dark" 
        isTimelineCollapsed={isTimelineCollapsed}
      />
      
      {/* Legend */}
      <div className="absolute bottom-6 right-6 bg-stone-900/90 p-3 rounded-lg border border-amber-700/40 text-xs font-typewriter z-20 shadow-xl hidden sm:block">
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
      <div className="absolute top-16 sm:top-20 right-4 sm:right-6 z-20">
        <div className="bg-stone-900/80 px-3 py-2 rounded-lg border border-amber-700/30 text-center">
          <div className="text-amber-400 text-xl sm:text-2xl font-bold font-typewriter">{validEntries.length}</div>
          <div className="text-stone-400 text-[8px] sm:text-[9px] font-typewriter uppercase tracking-wider">Flights</div>
        </div>
      </div>
      
      {/* Instructions - hidden on mobile */}
      <div className="absolute bottom-6 left-6 bg-stone-900/80 px-3 py-2 rounded border border-amber-700/30 text-[10px] font-typewriter text-stone-400 z-20 hidden sm:block">
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
          <span>Click for details</span>
        </div>
      </div>
    </div>
  );
};

export default GlobePanel;
