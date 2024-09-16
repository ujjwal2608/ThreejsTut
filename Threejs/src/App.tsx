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

    // Water wave vertex shader
    const vertexShader = `
      uniform float time;
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vUv = uv;
        vec3 pos = position;
        float wave1 = sin(pos.x * 2.0 + time * 0.8) * 0.1;
        float wave2 = sin(pos.y * 1.8 + time * 0.6) * 0.1;
        pos.z += wave1 + wave2;
        vPosition = pos;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    // Water wave fragment shader
    const fragmentShader = `
      uniform float time;
      varying vec2 vUv;
      varying vec3 vPosition;

      void main() {
        vec3 waterColor = vec3(0.0, 0.4, 0.8);
        vec3 foamColor = vec3(1.0, 1.0, 1.0);
        
        float wave = sin(vUv.x * 10.0 + vUv.y * 10.0 + time) * 0.5 + 0.5;
        float foam = smoothstep(0.4, 0.6, wave);
        
        vec3 finalColor = mix(waterColor, foamColor, foam);
        float brightness = 0.7 + 0.3 * sin(vPosition.x * 5.0 + vPosition.y * 5.0 + time * 2.0);
        
        gl_FragColor = vec4(finalColor * brightness, 0.9);
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

    // Create plane geometry
    const geometry = new THREE.PlaneGeometry(5, 5, 128, 128);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 3; // Tilt the plane for a better view
    scene.add(mesh);

    camera.position.z = 3;
    camera.position.y = 2;
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
