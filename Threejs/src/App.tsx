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

    // Water wave vertex shader
    const vertexShader = `
      uniform float time;
      varying vec2 vUv;
      varying float vElevation;
      
      void main() {
        vUv = uv;
        vec3 pos = position;
        
        float elevation = sin(pos.x * 3.0 + time * 0.7) * 0.1
                        + sin(pos.y * 4.0 + time * 0.8) * 0.1;
        
        vElevation = elevation;
        pos.z += elevation;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    // Water wave fragment shader
    const fragmentShader = `
      uniform float time;
      varying vec2 vUv;
      varying float vElevation;

      void main() {
        vec3 waterDeep = vec3(0.0, 0.2, 0.5);
        vec3 waterShallow = vec3(0.0, 0.5, 0.8);
        
        float mixStrength = (vElevation + 0.1) * 5.0;
        vec3 waterColor = mix(waterDeep, waterShallow, mixStrength);
        
        float edge = 1.0 - smoothstep(0.8, 0.95, length(vUv * 2.0 - 1.0));
        
        gl_FragColor = vec4(waterColor, edge);
      }
    `;

    // Create shader material
    const material = new THREE.ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: {
        time: { value: 0 }
      },
      transparent: true,
    });

    // Create circular plane geometry
    const radius = 2;
    const segments = 128;
    const geometry = new THREE.CircleGeometry(radius, segments);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2; // Rotate to lay flat
    scene.add(mesh);

    camera.position.set(0, 3, 3);
    camera.lookAt(0, 0, 0);

    function animate() {
      requestAnimationFrame(animate);
      
      // Update time uniform for wave animation
      material.uniforms.time.value += 0.03;
      
      renderer.render(scene, camera);
    }
    animate();

    // Clean up
    return () => {
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef}></div>;
}

export default Home;
