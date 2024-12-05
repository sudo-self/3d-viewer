import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const loader = new GLTFLoader();

let currentModel = null;
let modelUrl = null;
let modelFileSize = null;

loader.load(
  "max90.glb",
  function (gltf) {
    currentModel = gltf.scene;
    currentModel.position.set(0, 0, 2);
    currentModel.rotation.y = Math.PI / 2;
    scene.add(currentModel);
    modelUrl = "max90.glb";
    modelFileSize = gltf.scene ? new Blob([gltf]).size : 0;
    updateInfoPanel();
  },
  undefined,
  function (error) {
    console.error("Error loading the model:", error);
  },
);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
camera.position.z = 5;

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const inputElement = document.createElement("input");
inputElement.type = "file";
inputElement.accept = ".glb";
inputElement.style.position = "absolute";
inputElement.style.top = "10px";
inputElement.style.left = "10px";
document.body.appendChild(inputElement);

inputElement.addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (file && file.name.endsWith(".glb")) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const arrayBuffer = e.target.result;
      const blob = new Blob([arrayBuffer], {
        type: "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);

      if (currentModel) {
        scene.remove(currentModel);
      }

      loader.load(
        url,
        function (gltf) {
          currentModel = gltf.scene;
          currentModel.position.set(0, 0, 2);
          currentModel.rotation.y = Math.PI;
          scene.add(currentModel);
          modelUrl = url;
          modelFileSize = blob.size;
          updateInfoPanel();
        },
        undefined,
        function (error) {
          console.error("Error loading the model:", error);
        },
      );
    };
    reader.readAsArrayBuffer(file);
  }
});

const controlsPanel = createControlPanel();
const lightPanel = createLightPanel();
const infoPanel = createInfoPanel();

function createControlPanel() {
  const panel = document.createElement("div");
  panel.style.position = "absolute";
  panel.style.top = "10px";
  panel.style.right = "10px";
  panel.style.zIndex = 1000;
  panel.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  panel.style.padding = "10px";
  panel.style.color = "#fff";
  document.body.appendChild(panel);

  addButton(panel, "Rotate X", () => {
    if (currentModel) currentModel.rotation.x += Math.PI / 2;
  });
  addButton(panel, "Rotate Y", () => {
    if (currentModel) currentModel.rotation.y += Math.PI / 2;
  });
  addButton(panel, "Rotate Z", () => {
    if (currentModel) currentModel.rotation.z += Math.PI / 2;
  });
  addButton(panel, "Reset Model", () => {
    if (currentModel) {
      currentModel.rotation.set(0, Math.PI, 0);
      currentModel.position.set(0, 0, 2);
    }
  });

  return panel;
}

function addButton(parent, text, onClick) {
  const button = document.createElement("button");
  button.textContent = text;
  button.style.marginBottom = "5px";
  parent.appendChild(button);
  button.addEventListener("click", onClick);
}

function createLightPanel() {
  const panel = document.createElement("div");
  panel.style.position = "absolute";
  panel.style.top = "100px";
  panel.style.right = "10px";
  panel.style.zIndex = 1000;
  panel.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  panel.style.padding = "10px";
  panel.style.color = "#fff";
  document.body.appendChild(panel);

  const label = document.createElement("div");
  label.textContent = "Directional Light Intensity";
  label.style.marginBottom = "5px";
  panel.appendChild(label);

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = "100";
  slider.value = directionalLight.intensity;
  slider.step = "0.1";
  panel.appendChild(slider);

  slider.addEventListener("input", (event) => {
    directionalLight.intensity = parseFloat(event.target.value);
  });

  return panel;
}

function createInfoPanel() {
  const panel = document.createElement("div");
  panel.style.position = "absolute";
  panel.style.top = "170px";
  panel.style.right = "10px";
  panel.style.zIndex = 1000;
  panel.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  panel.style.padding = "15px";
  panel.style.color = "#fff";
  panel.style.fontFamily = "Courier New, monospace";
  panel.style.fontSize = "14px";
  panel.style.whiteSpace = "pre-wrap";
  panel.style.maxWidth = "300px";
  panel.style.borderRadius = "8px";
  panel.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.5)";
  panel.style.overflow = "auto";
  document.body.appendChild(panel);
  return panel;
}

function updateInfoPanel() {
  if (currentModel) {
    const modelData = {
      url: modelUrl || "N/A",
      position: [
        currentModel.position.x.toFixed(2),
        currentModel.position.y.toFixed(2),
        currentModel.position.z.toFixed(2),
      ],
      scale: [
        currentModel.scale.x.toFixed(2),
        currentModel.scale.y.toFixed(2),
        currentModel.scale.z.toFixed(2),
      ],
      rotationY: currentModel.rotation.y.toFixed(2),
      rotationX: currentModel.rotation.x.toFixed(2),
    };

    infoPanel.textContent = JSON.stringify(modelData, null, 2);
  }
}

function animate() {
  controls.update();
  updateInfoPanel();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

const toggleBackgroundButton = document.createElement("button");
toggleBackgroundButton.textContent = "Toggle Background";
toggleBackgroundButton.style.position = "absolute";
toggleBackgroundButton.style.top = "40px";
toggleBackgroundButton.style.left = "20px";
toggleBackgroundButton.style.zIndex = 1000;
toggleBackgroundButton.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
toggleBackgroundButton.style.color = "#fff";
toggleBackgroundButton.style.padding = "10px";
document.body.appendChild(toggleBackgroundButton);

let isBlackBackground = true;
toggleBackgroundButton.addEventListener("click", () => {
  isBlackBackground = !isBlackBackground;
  document.body.style.backgroundColor = isBlackBackground ? "black" : "white";
  renderer.setClearColor(isBlackBackground ? 0x000000 : 0xffffff, 1);

  const footer = document.getElementById("footer");
  footer.style.color = isBlackBackground ? "white" : "black";
});

animate();
