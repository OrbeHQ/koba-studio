import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Brand palette — same colors as BrandList
const BRAND_COLORS: [number, number, number][] = [
  [1.0, 0.420, 0.169],   // #FF6B2B  orange
  [0.306, 0.804, 0.769],  // #4ECDC4  teal
  [0.486, 0.361, 0.988],  // #7C5CFC  purple
  [1.0, 0.2, 0.4],        // #FF3366  hot pink
  [0.0, 0.761, 1.0],      // #00C2FF  electric blue
  [1.0, 0.722, 0.0],      // #FFB800  amber
];

function hexToVec3(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ];
}

function pickRandomBrandColor(): [number, number, number] {
  return BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)];
}

const vertexShader = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uTheme;
  uniform float uMouseHover;
  uniform vec3 uBrandColor;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    float aspect = uResolution.x / uResolution.y;

    // Grid — solid sizing
    float gridSize = 36.0;
    vec2 gridUv = vec2(uv.x * aspect, uv.y) * gridSize;
    vec2 cell = fract(gridUv);
    vec2 id = floor(gridUv);

    vec2 cUv = uv * vec2(aspect, 1.0);
    float t = uTime * 0.20; 

    // === ORGANIC MORPHING CONTINENTS (FBM) ===
    // This creates shapes that natively morph into entirely different weird things 
    // rather than circles merging together. Slowed down heavily for elegance.
    
    // Layer 1: Massive underlying foundation blobs 
    float n1 = noise(cUv * 1.5 + vec2(t * 0.8, t * 0.5));
    
    // Layer 2: Medium frequency details that warp the foundation into irregular shapes
    float n2 = noise(cUv * 3.5 - vec2(t * 0.5, t * 0.7));
    
    // Layer 3: High frequency micro-wobbles on the edges
    float n3 = noise(cUv * 7.0 + vec2(-t * 0.3, t * 0.4));
    
    // Combine layers: field output remains strictly normalized between 0.0 and 1.0
    float field = n1 * 0.60 + n2 * 0.30 + n3 * 0.10;

    // === STRICT PHOTO-MATCHED POSTERIZATION ===
    // Based securely on the exact image attached. 
    // Gradients are removed. It uses strict, mathematically stepped thresholds to build 
    // solid plateaus of completely identical, uniform dot sizes without messy bridging.

    float minRadius = 0.07;
    float medRadius = 0.18;
    float maxRadius = 0.34; 
    
    // Threshold 1: Tiny empty grid instantly snapping to Medium plateaus.
    // Everything under 0.45 stays perfectly tiny and unclustered.
    float stepMed = smoothstep(0.42, 0.46, field);
    
    // Threshold 2: Medium plateaus instantly snapping to dense Big cores.
    // The vast span between 0.46 and 0.62 ensures Medium dots dominate a huge physical area.
    float stepCore = smoothstep(0.62, 0.66, field);

    // Apply the absolute solid steps
    float radius = mix(minRadius, medRadius, stepMed);
    radius = mix(radius, maxRadius, stepCore);

    // Dynamic phase
    float dotPhase = hash(id) * 6.283;
    radius += sin(uTime * 1.5 + dotPhase) * 0.008;
    radius = clamp(radius, 0.05, 0.35);

    // Square dot shape
    vec2 d = abs(cell - 0.5);
    float shape = max(d.x, d.y);
    float aa = 0.008;
    float dot = 1.0 - smoothstep(radius - aa, radius + aa, shape);

    // Colors: black on light, white on dark — blend to brand color on hover
    vec3 color = mix(vec3(0.0), vec3(1.0), uTheme);
    color = mix(color, uBrandColor, uMouseHover);

    gl_FragColor = vec4(color, dot);
  }
`;

interface ShaderPlaneProps {
  theme: 'light' | 'dark';
  brandColor: string | null;
}

function ShaderPlane({ theme, brandColor }: ShaderPlaneProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size, gl } = useThree();
  const hoverTarget = useRef(false);
  const localColorRef = useRef<[number, number, number]>(pickRandomBrandColor());

  const uniformsRef = useRef({
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
    uTheme: { value: theme === 'dark' ? 1.0 : 0.0 },
    uMouseHover: { value: 0.0 },
    uBrandColor: { value: new THREE.Vector3(...pickRandomBrandColor()) },
  });

  // On direct canvas hover — pick a new random brand color each enter
  useEffect(() => {
    const c = gl.domElement;
    const enter = () => {
      hoverTarget.current = true;
      // If no external brand color, pick a random one for this hover
      if (!brandColor) {
        localColorRef.current = pickRandomBrandColor();
      }
    };
    const leave = () => { hoverTarget.current = false; };
    c.addEventListener('mouseenter', enter);
    c.addEventListener('mouseleave', leave);
    return () => { c.removeEventListener('mouseenter', enter); c.removeEventListener('mouseleave', leave); };
  }, [gl, brandColor]);

  useFrame((state) => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uResolution.value.set(size.width, size.height);
    u.uTheme.value = theme === 'dark' ? 1.0 : 0.0;

    // Determine the active color: external brand color takes priority, else local random
    const targetColor = brandColor ? hexToVec3(brandColor) : localColorRef.current;
    const bc = u.uBrandColor.value;
    bc.x += (targetColor[0] - bc.x) * 0.12;
    bc.y += (targetColor[1] - bc.y) * 0.12;
    bc.z += (targetColor[2] - bc.z) * 0.12;

    // Hover activation: from brand list OR direct canvas hover
    const isActive = brandColor ? 1 : (hoverTarget.current ? 1 : 0);
    u.uMouseHover.value += (isActive - u.uMouseHover.value) * 0.08;
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniformsRef.current}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

interface DotGridShaderProps {
  theme?: 'light' | 'dark';
  brandColor?: string | null;
}

export default function DotGridShader({ theme = 'light', brandColor = null }: DotGridShaderProps) {
  return (
    <div className="w-full h-full absolute inset-0 z-10">
      <Canvas
        orthographic
        camera={{ position: [0, 0, 1], left: -1, right: 1, top: 1, bottom: -1 }}
        gl={{ alpha: true, premultipliedAlpha: false, preserveDrawingBuffer: true }}
        style={{ background: 'transparent' }}
      >
        <ShaderPlane theme={theme} brandColor={brandColor} />
      </Canvas>
    </div>
  );
}
