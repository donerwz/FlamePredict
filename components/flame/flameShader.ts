/**
 * Flame shader: a deformed sphere shell with noise flicker, rendered with
 * additive blending. Qualitative by design — the mappings follow trends
 * reported in the PSI investigations (see WhatTheDataSays), not measurements.
 *
 * Physics-to-visual mapping (PLAN §4 Phase 6):
 * - uG (gravity): sphere (0g) → teardrop (1g); flicker amplitude ∝ g, so the
 *   0g flame is eerily steady (buoyant instability vanishes in freefall).
 * - uFlow (airflow): stretches the flame downstream and compacts its section.
 * - uSoot: blue (soot-free) → yellow-orange (sooty).
 * - uBright (O₂): higher O₂ burns brighter and slightly smaller.
 * - uIntensity: extinction dimmer (quiescent 21% O₂ at 0g self-extinguishes — BRE).
 */

export const flameVertexShader = /* glsl */ `
uniform float uTime;
uniform float uG;
uniform float uFlow;
uniform float uAspect;
uniform float uSpread;

varying vec3 vNormalV;
varying float vHeight;

float hash(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}
float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n000 = hash(i);
  float n100 = hash(i + vec3(1.0, 0.0, 0.0));
  float n010 = hash(i + vec3(0.0, 1.0, 0.0));
  float n110 = hash(i + vec3(1.0, 1.0, 0.0));
  float n001 = hash(i + vec3(0.0, 0.0, 1.0));
  float n101 = hash(i + vec3(1.0, 0.0, 1.0));
  float n011 = hash(i + vec3(0.0, 1.0, 1.0));
  float n111 = hash(i + vec3(1.0, 1.0, 1.0));
  return mix(
    mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),
    mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y),
    f.z
  );
}

void main() {
  vec3 p = position; // unit sphere
  float h = clamp(p.y * 0.5 + 0.5, 0.0, 1.0); // 0 base .. 1 tip
  vHeight = h;

  // Teardrop: taper the tip and elongate vertically as gravity rises.
  float taper = 1.0 - uG * 0.65 * pow(h, 1.6);
  p.xz *= taper * uSpread;
  p.y *= (1.0 + uG * 0.9) * uAspect;

  // Airflow (+x downstream): stretches the tip, compacts the cross-section.
  p.x += uFlow * 1.4 * pow(h, 2.0);
  p.xz *= 1.0 - uFlow * 0.22;

  // Flicker: noise displacement whose amplitude scales with gravity.
  float amp = 0.05 + uG * 0.24;
  float n = noise(position * 2.6 + vec3(0.0, -uTime * (0.6 + uG * 2.2), 0.0)) - 0.5;
  p += normal * n * amp;

  p.y += uG * 0.22; // 1g flames sit a little taller over the fuel

  vNormalV = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

export const flameFragmentShader = /* glsl */ `
uniform float uSoot;
uniform float uIntensity;
uniform float uBright;

varying vec3 vNormalV;
varying float vHeight;

void main() {
  // Hollow-shell look: the rim (grazing normals) glows brightest, like the
  // thin reaction zone of a microgravity diffusion flame.
  float rim = pow(1.0 - abs(normalize(vNormalV).z), 1.4);

  vec3 blue = vec3(0.33, 0.60, 1.00);
  vec3 orange = vec3(1.00, 0.52, 0.14);
  vec3 core = vec3(1.00, 0.95, 0.85);

  vec3 col = mix(blue, orange, uSoot);
  // 1g flames are bluest at the base; keep a slight vertical ramp.
  col = mix(col * 0.85 + blue * 0.15, col, vHeight);

  float body = mix(0.30, 1.0, rim);
  float tipFade = 1.0 - pow(vHeight, 3.0) * 0.25;
  float a = body * tipFade * uIntensity;

  vec3 c = mix(col, core, pow(rim, 3.0) * 0.55) * (0.75 + uBright * 0.65);
  gl_FragColor = vec4(c * a, a);
}
`;
