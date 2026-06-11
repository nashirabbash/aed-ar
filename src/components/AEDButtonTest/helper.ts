import * as THREE from 'three'

export function setButtonHighlight(scene: THREE.Object3D, active: boolean) {
  scene.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    const mat = child.material as THREE.MeshStandardMaterial
    mat.emissive.set(active ? '#00ff88' : '#000000')
    mat.emissiveIntensity = active ? 0.9 : 0
  })
}
