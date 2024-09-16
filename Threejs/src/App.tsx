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
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Create plane geometry
    const geometry = new THREE.PlaneGeometry(2, 2, 128, 128);

    // Create shader material
    const vertexShader = `
      uniform float time;
      uniform vec2 mousePos;
      varying vec2 vUv;
      varying float vElevation;

      void main() {
        vUv = uv;
        vec3 pos = position;
        float distance = length(uv - mousePos)*0.5;
        float elevation = sin(distance * 40.0 - time * 2.0) * 0.15;
        elevation += sin(distance * 60.0 - time * 3.0) * 0.01;
        elevation += sin(distance * 80.0 - time * 4.0) * 0.01;
        elevation *= smoothstep(0.4, 0.0, distance);
        pos.z += elevation*0.1;
        vElevation = elevation;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 waterColor;
      varying vec2 vUv;
      varying float vElevation;

      void main() {
        vec3 color = mix(waterColor, vec3(1.0), vElevation * 2.0 + 0.5);
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        time: { value: 0 },
        mousePos: { value: new THREE.Vector2(0.5, 0.5) },
        waterColor: { value: new THREE.Color(0x0077be) }
      }
    });

    // Create mesh and add to scene
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    // Update camera position
    camera.position.z = 1.5;

    // Mouse interaction
    const mouse = new THREE.Vector2();
    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(plane);
      if (intersects.length > 0) {
        material.uniforms.mousePos.value = intersects[0].uv;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      material.uniforms.time.value += 0.01;
      controls.update();
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
      window.removeEventListener('mousemove', handleMouseMove);
      mountRef.current?.removeChild(renderer.domElement);
      controls.dispose();
    };
  }, []);

  return <div ref={mountRef} />;
};

export default App;
