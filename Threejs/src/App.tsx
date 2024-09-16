import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const App: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Add smooth damping effect
    controls.dampingFactor = 0.05;

    // Update geometry creation
    const geometry = new THREE.SphereGeometry(1, 32, 32);

    // Update random attribute creation
    const count = geometry.attributes.position.count;
    const randomValues = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      randomValues[i] = Math.random();
    }
    geometry.setAttribute('random', new THREE.BufferAttribute(randomValues, 1));

    // Create basic shader material
    const vertexShader = `
      attribute float random;
      varying float vRandom;
      uniform float time;
      varying float elevation;
      void main() {
        vRandom = random;
        vec3 pos = position;
        pos.z +=  sin(time + random * 10.0) * 0.1;
        elevation = pos.z;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;
    const fragmentShader = `
      varying float vRandom;
      varying float elevation;
      void main() {
        gl_FragColor = vec4(1.0, elevation,0, 1.0);
      }
    `;
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        time: { value: 0 }
      }
    });

    // Create mesh and add to scene
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Update camera position
    camera.position.z = 3;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      material.uniforms.time.value += 0.01;
      controls.update(); // Update controls in the animation loop
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      controls.dispose(); // Dispose of controls when component unmounts
    };
  }, []);

  return <div ref={mountRef} />;
};

export default App;
