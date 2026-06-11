import * as THREE from 'three'

export function setEmissive(node: THREE.Object3D, active: boolean) {
  node.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    const mat = child.material as THREE.MeshStandardMaterial
    mat.emissive.set(active ? '#00ff00' : '#000000')
    mat.emissiveIntensity = active ? 0.8 : 0
  })
}
