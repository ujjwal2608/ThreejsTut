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

    // Create triangle
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      1.0,  1.0,  0.0,
     -1.0,  1.0,  0.0,
      0.0, -1.0,  0.0
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    // Fragment shader
    const fragmentShader = `
      void main() {
        gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0); // Blue color
      }
    `;

    // Vertex shader (basic)
    const vertexShader = `
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    // Create shader material
    const material = new THREE.ShaderMaterial({
      fragmentShader,
      vertexShader,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    camera.position.z = 5;

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      mesh.rotation.x += 0.01;
      mesh.rotation.y += 0.01;
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
