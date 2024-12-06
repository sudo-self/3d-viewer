import * as THREE from "three";

let skyMesh, sunMesh, groundMesh;
let isSkyVisible = true;

export function createSky(scene) {
 
  const skyShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(0x87ceeb) },
      bottomColor: { value: new THREE.Color(0xffffff) },
      offset: { value: 400 },
      exponent: { value: 0.6 },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `,
    side: THREE.BackSide,
  });

  const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
  skyMesh = new THREE.Mesh(skyGeometry, skyShaderMaterial);
  scene.add(skyMesh);


  const sunGeometry = new THREE.SphereGeometry(20, 64, 64);
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffd700,
    emissive: 0xffe570,
    emissiveIntensity: 1.2,
  });
  sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
  sunMesh.position.set(100, 150, -200);
  scene.add(sunMesh);


  const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
  const groundMaterial = new THREE.MeshLambertMaterial({
    color: 0x228b22,
  });
  groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.y = -50;
  scene.add(groundMesh);


  const sunlight = new THREE.DirectionalLight(0xffd700, 1.0);
  sunlight.position.set(100, 150, -200);
  scene.add(sunlight);
}

export function toggleSkyVisibility() {
  isSkyVisible = !isSkyVisible;

  if (skyMesh && sunMesh && groundMesh) {
    skyMesh.visible = isSkyVisible;
    sunMesh.visible = isSkyVisible;
    groundMesh.visible = isSkyVisible;
  }
}









