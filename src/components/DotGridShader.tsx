import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  uniform float uTheme;
  varying vec2 vUv;

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    float aspect = uResolution.x / uResolution.y;
    vec2 gridUv = uv;
    gridUv.x *= aspect;
    
    // Grid parameters
    float gridSize = 25.0; // Less dense
    gridUv *= gridSize;
    vec2 cell = fract(gridUv);                
    vec2 id = floor(gridUv);                  
    
    // Distance from center of cell (using max(abs(x), abs(y)) for squares)
    vec2 centered = abs(cell - 0.5);
    float distToCenter = max(centered.x, centered.y);
    
    // === INTERACTIVE WAVE / RIPPLE ===
    vec2 toMouse = uv - uMouse;
    toMouse.x *= aspect; 
    float mouseDist = length(toMouse);
    
    // Wave effect
    float wave = sin(mouseDist * 8.0 - uTime * 2.0); // Smoother wave
    float influence = smoothstep(1.2, 0.0, mouseDist); // Wider influence
    
    // Global movement with power function for varied sizes
    float n1 = sin(id.x * 0.3 + uTime * 0.5);
    float n2 = cos(id.y * 0.3 + uTime * 0.4);
    float combinedNoise = (n1 * n2) * 0.5 + 0.5; // 0 to 1
    
    // Power function makes most values small, and some spike up
    float sizeVariation = pow(combinedNoise, 5.0);
    
    // Combine for size
    float baseSize = 0.03 + sizeVariation * 0.4; // Base is tiny, spikes up to 0.43
    float activeSize = baseSize + (wave * influence * 0.25);
    float size = clamp(activeSize, 0.0, 0.45); // Max size is 0.45
    
    // Draw the square
    float dot = 1.0 - step(size, distToCenter);
    
    // Theme colors
    vec3 lightBg = vec3(0.92, 0.92, 0.92);
    vec3 lightDot = vec3(0.8, 0.8, 0.8);
    vec3 darkBg = vec3(0.04, 0.04, 0.04);
    vec3 darkDot = vec3(0.25, 0.25, 0.25);
    
    vec3 bgColor = mix(lightBg, darkBg, uTheme);
    vec3 dotColor = mix(lightDot, darkDot, uTheme);
    
    vec3 color = mix(bgColor, dotColor, dot);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

const ShaderPlane = ({ theme }: { theme: 'light' | 'dark' }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const targetMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const currentMouse = useRef(new THREE.Vector2(0.5, 0.5));

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
    uTheme: { value: theme === 'dark' ? 1.0 : 0.0 }
  }), [size]);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTheme.value = theme === 'dark' ? 1.0 : 0.0;
    }
  }, [theme]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.current.x = e.clientX / window.innerWidth;
      targetMouse.current.y = 1.0 - (e.clientY / window.innerHeight);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
      
      currentMouse.current.lerp(targetMouse.current, 0.05); // Smoother lerp
      materialRef.current.uniforms.uMouse.value.copy(currentMouse.current);
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

export default function DotGridShader({ theme = 'dark' }: { theme?: 'light' | 'dark' }) {
  return (
    <div className="w-full h-full absolute inset-0 z-10 pointer-events-none">
      <Canvas orthographic camera={{ position: [0, 0, 1], left: -1, right: 1, top: 1, bottom: -1 }}>
        <ShaderPlane theme={theme} />
      </Canvas>
    </div>
  );
}
