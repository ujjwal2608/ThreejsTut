import React, { useEffect, useRef, ReactElement } from 'react';
import * as THREE from 'three';

function Home(): ReactElement {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Set up scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Update vertex shader for cloth-like wave effect
    const vertexShader = `
      uniform float time;
      varying vec3 vPosition;
      
      void main() {
        vec3 pos = position;
        float wave = sin(pos.x * 5.0 + time) * cos(pos.y * 5.0 + time) * 0.1;
        pos.z += wave;
        vPosition = pos;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    // Update fragment shader for a more cloth-like appearance
    const fragmentShader = `
      varying vec3 vPosition;

      void main() {
        vec3 color = vec3(0.7, 0.8, 1.0); // Light blue base color
        float shade = 0.5 + 0.5 * (vPosition.z + 0.1); // Add shading based on z-position
        gl_FragColor = vec4(color * shade, 1.0);
      }
    `;

    // Update material to include uniforms and varying
    const material = new THREE.ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: {
        time: { value: 0 }
      },
      side: THREE.DoubleSide
    });

    // Increase the number of vertices for a smoother cloth-like effect
    const geometry = new THREE.PlaneGeometry(2, 2, 32, 32);

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    camera.position.z = 2;

    // Update animation loop
    function animate() {
      requestAnimationFrame(animate);
      
      // Update time uniform for wave animation
      material.uniforms.time.value += 0.05;
      
      renderer.render(scene, camera);
    }
    animate();

    // Clean up
    return () => {
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div>
      <h1>Home</h1>
      <div ref={mountRef}></div>
    </div>
  );
}

export default Home;
