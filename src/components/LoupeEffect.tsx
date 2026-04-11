import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { toCanvas } from 'html-to-image';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uTexture;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uZoom;
uniform float uRadius;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  vec2 pixelPos = uv * uResolution;
  
  // Invert Y for mouse position because WebGL UV origin is bottom-left
  vec2 mousePos = vec2(uMouse.x, uResolution.y - uMouse.y);
  
  float dist = length(pixelPos - mousePos);

  if (dist > uRadius) {
    gl_FragColor = vec4(0.0);
    return;
  }

  // Refraction logic
  vec2 offset = (pixelPos - mousePos) * (1.0 / uZoom);
  
  // Calculate normal for a sphere
  float z = sqrt(uRadius * uRadius - dist * dist);
  vec3 normal = normalize(vec3(pixelPos - mousePos, z));
  vec3 eyeVec = normalize(vec3(offset, uRadius));

  float iorR = 1.0 / 1.15;
  float iorG = 1.0 / 1.31;
  float iorB = 1.0 / 1.45;

  vec3 refractR = refract(eyeVec, normal, iorR);
  vec3 refractG = refract(eyeVec, normal, iorG);
  vec3 refractB = refract(eyeVec, normal, iorB);

  vec2 sampleUvR = (mousePos + refractR.xy * uRadius * 0.5) / uResolution;
  vec2 sampleUvG = (mousePos + refractG.xy * uRadius * 0.5) / uResolution;
  vec2 sampleUvB = (mousePos + refractB.xy * uRadius * 0.5) / uResolution;

  // Zoom
  vec2 zoomCenter = mousePos / uResolution;
  sampleUvR = zoomCenter + (sampleUvR - zoomCenter) / uZoom;
  sampleUvG = zoomCenter + (sampleUvG - zoomCenter) / uZoom;
  sampleUvB = zoomCenter + (sampleUvB - zoomCenter) / uZoom;

  vec4 color;
  color.r = texture2D(uTexture, sampleUvR).r;
  color.g = texture2D(uTexture, sampleUvG).g;
  color.b = texture2D(uTexture, sampleUvB).b;
  color.a = 1.0;

  // Fresnel reflection
  float fresnel = pow(1.0 - dot(eyeVec, normal), 2.0);
  color.rgb += vec3(1.0) * fresnel * 0.5;

  // Subtle edge darkening
  float edge = smoothstep(uRadius - 5.0, uRadius, dist);
  color.rgb = mix(color.rgb, vec3(0.0), edge * 0.2);

  gl_FragColor = color;
}
`;

const LoupeShader = ({ texture, mouse, radius, zoom }: any) => {
  const { size } = useThree();
  
  const uniforms = useMemo(() => ({
    uTexture: { value: texture },
    uMouse: { value: new THREE.Vector2(mouse.x, mouse.y) },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
    uZoom: { value: zoom },
    uRadius: { value: radius }
  }), [texture, size, zoom, radius]);

  useFrame(() => {
    uniforms.uMouse.value.set(mouse.x, mouse.y);
    uniforms.uResolution.value.set(size.width, size.height);
  });

  return (
    <mesh>
      <planeGeometry args={[size.width, size.height]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  );
};

export default function LoupeEffect({ targetRef, theme = 'dark' }: { targetRef: React.RefObject<HTMLElement>, theme?: 'light' | 'dark' }) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [mouse, setMouse] = useState({ x: -1000, y: -1000 });
  
  // Adjust these to match the loupe image size
  const radius = 140; 
  const zoom = 1.8;

  useEffect(() => {
    const capture = async () => {
      if (!targetRef.current) return;
      
      const canvasContainer = document.getElementById('loupe-container');
      if (canvasContainer) canvasContainer.style.display = 'none';

      try {
        const canvas = await toCanvas(targetRef.current, {
          pixelRatio: window.devicePixelRatio,
          backgroundColor: theme === 'dark' ? '#0A0A0A' : '#EBEBEB',
          skipFonts: true, // Speeds up rendering if fonts are already loaded
        });
        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        setTexture(tex);
      } catch (e) {
        console.error("Failed to capture HTML", e);
      }

      if (canvasContainer) canvasContainer.style.display = 'block';
    };

    // Initial capture
    setTimeout(capture, 1000); // Wait for GSAP animations to finish

    let timeoutId: any;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(capture, 500);
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [targetRef, theme]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!texture) return null;

  return (
    <div 
      id="loupe-container"
      className="fixed inset-0 pointer-events-none z-50"
    >
      <Canvas orthographic camera={{ position: [0, 0, 1], zoom: 1 }}>
        <LoupeShader texture={texture} mouse={mouse} radius={radius} zoom={zoom} />
      </Canvas>
      
      {/* The Loupe Image Overlay */}
      <div 
        className="absolute w-[360px] h-[360px] pointer-events-none bg-no-repeat bg-contain bg-center"
        style={{
          left: mouse.x - 180,
          top: mouse.y - 180,
          // Using a high-quality transparent loupe ring placeholder.
          // Replace this URL with the actual image URL if needed.
          backgroundImage: 'url("https://cdn.pixabay.com/photo/2013/07/12/15/24/magnifying-glass-149952_1280.png")', 
          opacity: mouse.x > 0 ? 1 : 0,
          transition: 'opacity 0.2s',
          filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.3))'
        }}
      />
    </div>
  );
}
