import React, { useEffect, useRef, ReactElement } from 'react';
import * as THREE from 'three';

function Home(): ReactElement {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Set up scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Moon surface vertex shader
    const vertexShader = `
      varying vec3 vNormal;
      varying vec2 vUv;
      varying float vDisplacement;

      // Pseudo-random number generator
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }
      
      void main() {
        vNormal = normal;
        vUv = uv;
        
        // Create crater displacement
        float displacement = 0.0;
        for (int i = 0; i < 5; i++) {
          vec2 craterUv = vUv * 10.0 * float(i + 1);
          float crater = smoothstep(0.9, 1.0, random(floor(craterUv)));
          displacement -= crater * 0.2;
        }
        
        vDisplacement = displacement;
        
        // Apply displacement to position
        vec3 newPosition = position + normal * displacement;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `;

    // Moon surface fragment shader
    const fragmentShader = `
      varying vec3 vNormal;
      varying vec2 vUv;
      varying float vDisplacement;

      void main() {
        vec3 baseColor = vec3(0.8, 0.8, 0.75); // Light gray color for moon surface
        vec3 craterColor = vec3(0.2, 0.2, 0.2); // Dark color for craters
        
        // Mix colors based on displacement
        vec3 finalColor = mix(baseColor, craterColor, smoothstep(-0.02, -0.01, vDisplacement));
        
        // Add simple shading based on normal
        float shading = dot(vNormal, normalize(vec3(1.0, 1.0, 1.0)));
        finalColor *= (0.5 + 0.5 * shading);
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    // Create shader material
    const material = new THREE.ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: {
        time: { value: 0 }
      },
    });

    // Create sphere geometry
    const radius = 2;
    const segments = 128; // Increased for smoother surface
    const geometry = new THREE.SphereGeometry(radius, segments, segments);

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    camera.position.z = 5;

    function animate() {
      requestAnimationFrame(animate);
      
      // Rotate the moon slowly
      mesh.rotation.y += 0.005;
      
      // Update time uniform for potential animations
      material.uniforms.time.value += 0.03;
      
      renderer.render(scene, camera);
    }
    
    let animationFrameId: number;
    function startAnimation() {
      animationFrameId = requestAnimationFrame(animate);
    }
    startAnimation();

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      // Dispose of Three.js objects
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef}></div>;
}

export default Home;
