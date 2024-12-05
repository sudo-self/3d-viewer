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
  "/max90.glb",
  (gltf) => {
    currentModel = gltf.scene;
    currentModel.position.set(0, 0, 2);
    currentModel.rotation.y = Math.PI / 2;
    scene.add(currentModel);
    modelUrl = "/max90.glb";
    modelFileSize = gltf.scene ? new Blob([gltf]).size : 0;
    updateInfoPanel();
  },
  undefined,
  (error) => console.error("Error loading the model:", error),
);


const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.50;
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
inputElement.style.top = "50px";
inputElement.style.left = "45%";
inputElement.style.padding = "10px";
inputElement.style.border = "none";
inputElement.style.borderRadius = "8px";
inputElement.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
inputElement.style.color = "#fff";
inputElement.style.cursor = "pointer";
document.body.appendChild(inputElement);

inputElement.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file && file.name.endsWith(".glb")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      const blob = new Blob([arrayBuffer], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);

      if (currentModel) scene.remove(currentModel);

      loader.load(
        url,
        (gltf) => {
          currentModel = gltf.scene;
          currentModel.position.set(0, 0, 2);
          currentModel.rotation.y = Math.PI;
          scene.add(currentModel);
          modelUrl = url;
          modelFileSize = blob.size;
          updateInfoPanel();
        },
        undefined,
        (error) => console.error("Error loading the model:", error),
      );
    };
    reader.readAsArrayBuffer(file);
  }
});


function createControlPanel() {
  const panel = document.createElement("div");
  panel.style.position = "absolute";
  panel.style.top = "10px";
  panel.style.right = "10px";
  panel.style.zIndex = 1000;
  panel.style.padding = "10px";
  panel.style.color = "#fff";
  document.body.appendChild(panel);

  addButton(panel, "Rotate X", () => currentModel && (currentModel.rotation.x += Math.PI / 2));
  addButton(panel, "Rotate Y", () => currentModel && (currentModel.rotation.y += Math.PI / 2));
  addButton(panel, "Rotate Z", () => currentModel && (currentModel.rotation.z += Math.PI / 2));
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
  button.style.marginBottom = "10px";
  button.style.padding = "15px";
  button.style.fontSize = "18px";
  button.style.border = "none";
  button.style.borderRadius = "20px";
  button.style.backgroundColor = "#7249d6";
  button.style.color = "#fff";
  button.style.cursor = "pointer";
  button.style.width = "100%";
  button.addEventListener("click", onClick);
  parent.appendChild(button);
}


function createLightPanel() {
  const panel = document.createElement("div");
  panel.style.position = "absolute";
  panel.style.top = "280px";
  panel.style.right = "10px";
  panel.style.zIndex = 1000;
  panel.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  panel.style.padding = "20px";
  panel.style.color = "#fff";
  panel.style.borderRadius = "20px";

  const label = document.createElement("div");
  label.textContent = "Directional Light";
  label.style.marginBottom = "10px";
  panel.appendChild(label);

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = "5";
  slider.value = directionalLight.intensity;
  slider.step = "0.1";
  slider.style.width = "100%";
  slider.addEventListener("input", (event) => {
    directionalLight.intensity = parseFloat(event.target.value);
  });
  panel.appendChild(slider);

  document.body.appendChild(panel);
}


function createInfoPanel() {
  const panel = document.createElement("div");
  panel.style.position = "absolute";
  panel.style.top = "460px";
  panel.style.right = "10px";
  panel.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  panel.style.padding = "20px";
  panel.style.color = "white";
  panel.style.borderRadius = "10px";
  panel.style.whiteSpace = "pre-wrap";
  panel.style.maxHeight = "70vh";
  panel.style.overflowY = "auto";
  panel.style.width = "300px";
  document.body.appendChild(panel);
  return panel;
}

function updateInfoPanel() {
  if (currentModel) {
    infoPanel.textContent = JSON.stringify(
      {
        url: modelUrl || "N/A",
        position: currentModel.position.toArray(),
        scale: currentModel.scale.toArray(),
        rotation: currentModel.rotation.toArray(),
      },
      null,
      2,
    );
  }
}


const footer = document.createElement("footer");
footer.style.position = "absolute";
footer.style.bottom = "0";
footer.style.width = "100%";
footer.style.textAlign = "center";
footer.style.padding = "20px";
footer.style.cursor = "pointer";
footer.style.textDecoration = "none";
footer.textContent = "sudo-3d.vercel.app";


function updateFooterTextColor() {
  const bodyBackgroundColor = window.getComputedStyle(document.body).backgroundColor;
  const isWhiteBackground = bodyBackgroundColor === "rgb(255, 255, 255)";
  footer.style.color = isWhiteBackground ? "black" : "white";
}

footer.addEventListener("click", () => {
  window.location.href = "https://sudo-3d.vercel.app";
});

document.body.appendChild(footer);


function toggleBackgroundColor() {
  isBlackBackground = !isBlackBackground;
  document.body.style.backgroundColor = isBlackBackground ? "black" : "white";
  renderer.setClearColor(isBlackBackground ? 0x000000 : 0xffffff, 1);
  updateFooterTextColor();
}

const toggleBackgroundButton = document.createElement("button");
toggleBackgroundButton.textContent = "Background";
toggleBackgroundButton.style.position = "absolute";
toggleBackgroundButton.style.top = "385px";
toggleBackgroundButton.style.right = "10px";
toggleBackgroundButton.style.zIndex = 1000;
toggleBackgroundButton.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
toggleBackgroundButton.style.color = "#fff";
toggleBackgroundButton.style.padding = "10px";
document.body.appendChild(toggleBackgroundButton);

let isBlackBackground = true;
toggleBackgroundButton.addEventListener("click", () => {
  toggleBackgroundColor();
});


updateFooterTextColor();


const controlsPanel = createControlPanel();
const lightPanel = createLightPanel();
const infoPanel = createInfoPanel();


function animate() {
  controls.update();
  updateInfoPanel();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();


