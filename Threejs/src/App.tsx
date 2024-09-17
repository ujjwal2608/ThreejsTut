import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const App: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Replace plane geometry with sphere geometry
    const geometry = new THREE.SphereGeometry(1, 64, 64);

    // Shader code
    const vertexShader = `
      varying vec2 vUv;
      varying float vElevation;

      // Improved random function
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      void main() {
        vUv = uv;
        
        // Create a grid effect
        vec2 gridUv = floor(vUv * 10.0) / 10.0;
        
        // Generate random elevation
        float elevation = random(gridUv) ; // Reduced strength for subtler effect
        
       
        
        vElevation = elevation; // Pass elevation to fragment shader
        vec3 newPosition = vec3(position.x,position.y,position.z+elevation*0.1);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `;

    const fragmentShader = `
      varying vec2 vUv;
      varying float vElevation;
       float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }
      void main() {
        // vec3 color = vec3(vUv.x,vUv.x, vUv.x); pattern3-brighness from left to right
        // vec3 color = vec3(vUv.y);pattern4 brightness from top to bottom
        // vec3 color = vec3(1.0-vUv.y); pattern5 brightness from bottom to top
        // vec3 color = vec3(vUv.y*10.0); pattern6 brightness from top to bottom with sudden jump
        // vec3 color = vec3(sin(vUv.y*40.0));pattern7 black and white stripes with sine wave
        //vec3 color = vec3(mod(vUv.x*10.0,1.0));pattern8-black and white stripes with modulous function increaee than sudden decrease
        //vec3 color = vec3(step(0.0,sin(vUv.y*70.0)));//pattern9 sharp black and white stripes with step function
        //the step[ threshold must be 1 ] so to equal white and black stripes widgth
        //proper controll over frequency
        //float stripeFrequency = 10.0;
        // float stripeWidth = 0.5; // Adjust this value to control the width of the black stripes (0.5 to 1.0)  
        // float pattern = smoothstep(stripeWidth, stripeWidth +0.1, 0.5 + 0.5 * sin(vUv.y * stripeFrequency * 3.14159));
        // vec3 color = vec3(pattern);

        //vec3 color = vec3(step(0.0,cos(vUv.y*40.0)*sin(vUv.x*40.0)));//square boxes with sine wave and cosine wave
          
        //vec3 color = vec3(step(0.9,mod(vUv.y*10.0,1.0))+step(0.9,mod(vUv.x*10.0,1.0)));//mod is use to make white boundaries
        //vec3 color = vec3(step(0.2,mod(vUv.y*10.0,1.0))*step(0.2,mod(vUv.x*10.0,1.0)));//dots pattern-threshold of step determines the thicknes and hight od dots
        
        // float strength = 1.0;
        // float barX = step(0.4,mod(vUv.x*10.0,1.0));
        // float barY = step(0.8,mod(vUv.y*10.0,1.0));
        // float widthDots = barX * barY;
        // float barX2 = step(0.8,mod(vUv.x*10.0+0.2,1.0));
        // float barY2 = step(0.4,mod(vUv.y*10.0-0.2,1.0));
        // float heightDots = (barX2 * barY2);
        // strength = heightDots+widthDots;


        //vec3 color = vec3(smoothstep(0.0,0.4,mod(vUv.x*10.0,1.0)));
        
        //absolute
        // vec3 color = vec3(abs(vUv.x-0.5));
        // vec3 color2 = vec3(abs(vUv.y-0.5));
        // vec3 color3 = vec3(abs(vUv.x-0.5));
        //  vec3 color4 = vec3(abs(vUv.y-0.5));
        //  vec3 color5 = color3+color4-color3*color4*2.0;


        //min
        //vec3 color = vec3(step(0.4,max(abs(vUv.x-0.5),abs(vUv.y-0.5))));

        //floor
       //vec3 color = vec3(floor(vUv.x*10.0)/10.0);
      //vec3 color = vec3(floor(max(vUv.x * 10.0, vUv.y * 10.0)) / 10.0);
      //vec3 color = vec3((floor(vUv.x * 10.0) / 10.0)*(floor(vUv.y * 10.0) / 10.0));
        vec2 gridUv = vec2(
        floor(vUv.x * 20.0) / 20.0,
        floor(vUv.y * 20.0) / 20.0
        );
float stength = random(gridUv);
        gl_FragColor = vec4(stength,stength,stength, 1.0);
      }
    `;

    // Create shader material
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    // Create mesh and add to scene
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    // Update camera position
    camera.position.z = 2;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
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
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      controls.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100vh" }} />;
};

export default App;
