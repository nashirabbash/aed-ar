import * as THREE from "three";

export function setPadHighlight(node: THREE.Object3D, grabbed: boolean) {
  node.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const mat = child.material as THREE.MeshStandardMaterial;
    mat.emissive.set(grabbed ? "#ffff00" : "#000000");
    mat.emissiveIntensity = grabbed ? 0.6 : 0;
  });
}

const SCREEN_W = 1112;
const SCREEN_H = 812; // aspect ≈ 10.8146 / 6.59533

export function createScreenCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = SCREEN_W;
  canvas.height = SCREEN_H;
  return canvas;
}

export function drawScreenOff(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
}

export function drawScreenOn(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#001a00";
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  ctx.fillStyle = "#00ff88";
  ctx.font = "bold 48px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Hello World", SCREEN_W / 2, SCREEN_H / 2);
}

export function findFirstMesh(scene: THREE.Object3D): THREE.Mesh | null {
  let found: THREE.Mesh | null = null;
  scene.traverse((child) => {
    if (!found && child instanceof THREE.Mesh) found = child;
  });
  return found;
}
