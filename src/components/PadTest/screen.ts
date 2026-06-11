import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { createScreenCanvas, drawScreenOff, drawScreenOn, findFirstMesh } from './helper'

export function useScreen(layarScene: THREE.Object3D) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const textureRef = useRef<THREE.CanvasTexture | null>(null)
  const meshRef = useRef<THREE.Mesh | null>(null)

  useEffect(() => {
    const mesh = findFirstMesh(layarScene)
    if (!mesh) return
    const canvas = createScreenCanvas()
    const texture = new THREE.CanvasTexture(canvas)
    texture.rotation = -Math.PI / 2
    texture.center.set(0.5, 0.5)
    drawScreenOff(canvas)
    texture.needsUpdate = true
    canvasRef.current = canvas
    textureRef.current = texture
    meshRef.current = mesh
    const mat = mesh.material as THREE.MeshStandardMaterial
    mat.emissiveMap = texture
    mat.emissive.set('#ffffff')
    mat.emissiveIntensity = 0
    mat.needsUpdate = true
    return () => { texture.dispose() }
  }, [layarScene])

  function setOn() {
    if (!canvasRef.current || !textureRef.current || !meshRef.current) return
    drawScreenOn(canvasRef.current)
    textureRef.current.needsUpdate = true
    ;(meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 1
  }

  function setOff() {
    if (!canvasRef.current || !textureRef.current || !meshRef.current) return
    drawScreenOff(canvasRef.current)
    textureRef.current.needsUpdate = true
    ;(meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0
  }

  return { setOn, setOff }
}
