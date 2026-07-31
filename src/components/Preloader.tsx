import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
// Replace this with your actual logo path
import ercLogo from '../assets/centerlogo.png'; 

// ─── SideRays Shader (Inlined) ──────────────────────────────────────────────
const vertexShader = `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;
uniform float iSpeed;
uniform vec3 iRayColor1;
uniform vec3 iRayColor2;
uniform float iIntensity;
uniform float iSpread;
uniform float iFlipX;
uniform float iFlipY;
uniform float iTilt;
uniform float iSaturation;
uniform float iBlend;
uniform float iFalloff;
uniform float iOpacity;

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  float cosAngle = dot(normalize(sourceToCoord), rayRefDirection);
  return clamp(
    (0.45 + 0.15 * sin(cosAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-cosAngle * seedB + iTime * speed)),
    0.0, 1.0) *
    clamp((iResolution.x - length(sourceToCoord)) / iResolution.x, 0.5, 1.0);
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  if (iFlipX > 0.5) fragCoord.x = iResolution.x - fragCoord.x;
  if (iFlipY > 0.5) fragCoord.y = iResolution.y - fragCoord.y;

  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
  vec2 rayPos = vec2(iResolution.x * 1.1, -0.5 * iResolution.y);

  float tiltRad = iTilt * 3.14159265 / 180.0;
  float cs = cos(tiltRad);
  float sn = sin(tiltRad);
  vec2 rel = coord - rayPos;
  vec2 tiltedCoord = vec2(rel.x * cs - rel.y * sn, rel.x * sn + rel.y * cs) + rayPos;

  float halfSpread = iSpread * 0.275;
  vec2 rayRefDir1 = normalize(vec2(cos(0.785398 + halfSpread), sin(0.785398 + halfSpread)));
  vec2 rayRefDir2 = normalize(vec2(cos(0.785398 - halfSpread), sin(0.785398 - halfSpread)));

  vec4 rays1 = vec4(iRayColor1, 1.0) * rayStrength(rayPos, rayRefDir1, tiltedCoord, 36.2214, 21.11349, iSpeed);
  vec4 rays2 = vec4(iRayColor2, 1.0) * rayStrength(rayPos, rayRefDir2, tiltedCoord, 22.3991, 18.0234, iSpeed * 0.2);

  vec4 color = rays1 * (1.0 - iBlend) * 0.9 + rays2 * iBlend * 0.9;
  float distanceToLight = length(fragCoord.xy - vec2(rayPos.x, iResolution.y - rayPos.y)) / iResolution.y;
  float brightness = iIntensity * 0.4 / pow(max(distanceToLight, 0.001), iFalloff);
  color.rgb *= brightness;
  float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  color.rgb = mix(vec3(gray), color.rgb, iSaturation);
  color.a = max(color.r, max(color.g, color.b)) * iOpacity;
  gl_FragColor = color;
}
`;

const SideRays = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 1;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(1);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
        iSpeed: { value: 2.5 },
        iRayColor1: { value: new THREE.Color('#EAB308') },
        iRayColor2: { value: new THREE.Color('#96c8ff') },
        iIntensity: { value: 2.0 },
        iSpread: { value: 2.0 },
        iFlipX: { value: 0 }, iFlipY: { value: 0 },
        iTilt: { value: 0 }, iSaturation: { value: 1.5 },
        iBlend: { value: 0.75 }, iFalloff: { value: 2.0 }, iOpacity: { value: 1.0 }
      },
      vertexShader, fragmentShader, transparent: true
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);
    const clock = new THREE.Clock();
    const loop = () => {
      material.uniforms.iTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return () => { renderer.dispose(); };
  }, []);
  return <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

// ─── Main Preloader ──────────────────────────────────────────────────────────
const Preloader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [startAnimation, setStartAnimation] = useState(false);

  const text = "ELECTRIFY. CODE. INNOVATE.";

  useEffect(() => {
    setStartAnimation(true);
    const triggerExit = () => {
      setIsFadingOut(true);
      setTimeout(() => setIsLoading(false), 700);
    };
    window.addEventListener('splineReady', () => setTimeout(triggerExit, 1500));
    const timer = setTimeout(triggerExit, 6000);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className={`fixed inset-0 z-[9999] bg-[#030712] flex flex-col items-center justify-center transition-all duration-700 ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <SideRays />
      
      {/* Logo */}
      <div className="relative z-10 mb-6">
        <img src={ercLogo} alt="ERC Logo" className="w-64 md:w-80 lg:w-96 h-auto drop-shadow-[0_0_35px_rgba(255,255,255,0.25)]" />
      </div>

      {/* Tagline */}
      <div className="flex flex-wrap justify-center font-heading font-bold text-lg md:text-xl tracking-[0.2em] text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)] relative z-10">
        {text.split('').map((char, index) => (
          <span key={index} style={{ transitionDelay: `${index * 50}ms` }} className={`inline-block transition-all duration-300 ${startAnimation ? 'opacity-100' : 'opacity-0'}`}>
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>

      {/* Cyan Loading Bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-cyan-500/30 w-full overflow-hidden z-20">
        <div className="h-full bg-cyan-400 w-1/3 animate-[slide_1.5s_ease-in-out_infinite]" />
      </div>

      <style>{`@keyframes slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
    </div>
  );
};

export default Preloader;