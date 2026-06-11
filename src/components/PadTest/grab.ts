import { type MutableRefObject, useEffect, useRef } from 'react'
import { type ThreeEvent, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { setPadHighlight } from './helper'
import { tlog } from '../../lib/log'

const _offset = new THREE.Vector3()
const _grabPlane = new THREE.Plane()
const _planeHit = new THREE.Vector3()
const _lastPoint = new THREE.Vector3()
const _downRaycaster = new THREE.Raycaster()
const _downDir = new THREE.Vector3(0, -1, 0)

export const PHANTOM_SURFACE_Y = 0.39468

function applyGravity(
  group: THREE.Group,
  phantomGroup: THREE.Group | null,
  delta: number,
  velocityYRef: MutableRefObject<number>
) {
  _downRaycaster.set(group.position, _downDir)
  const hits = phantomGroup ? _downRaycaster.intersectObject(phantomGroup, true) : []
  const floorY = hits.length > 0 ? PHANTOM_SURFACE_Y : 0
  if (group.position.y <= floorY) {
    velocityYRef.current = 0
    return
  }
  velocityYRef.current -= 9.8 * delta
  group.position.y += velocityYRef.current * delta
  if (group.position.y <= floorY) {
    group.position.y = floorY
    velocityYRef.current = 0
  }
}

export function useGrab(
  groupRef: MutableRefObject<THREE.Group | null>,
  phantomGroupRef: MutableRefObject<THREE.Group | null>,
  scene: THREE.Object3D,
  disabledRef: MutableRefObject<boolean>,
) {
  const { camera, gl } = useThree()
  const grabbedRef = useRef(false)
  const velocityYRef = useRef(0)

  useEffect(() => {
    function onGlobalPointerUp() {
      if (!grabbedRef.current) return
      grabbedRef.current = false
      setPadHighlight(scene, false)
    }
    globalThis.addEventListener('pointerup', onGlobalPointerUp)
    return () => globalThis.removeEventListener('pointerup', onGlobalPointerUp)
  }, [scene])

  useFrame(({ pointer, camera: cam, raycaster, gl: frameGl }, delta) => {
    if (!groupRef.current) return
    if (grabbedRef.current) {
      if (frameGl.xr.isPresenting) {
        groupRef.current.position.copy(_lastPoint).add(_offset)
      } else {
        raycaster.setFromCamera(pointer, cam)
        if (raycaster.ray.intersectPlane(_grabPlane, _planeHit)) {
          groupRef.current.position.copy(_planeHit).add(_offset)
        }
      }
    } else {
      applyGravity(groupRef.current, phantomGroupRef.current, delta, velocityYRef)
    }
  })

  function handlePointerDown(e: ThreeEvent<PointerEvent>) {
    if (disabledRef.current) return
    e.stopPropagation()
    if (!groupRef.current) return
    ;(e.target as any).setPointerCapture?.(e.pointerId)
    grabbedRef.current = true
    velocityYRef.current = 0
    _lastPoint.copy(e.point)
    _offset.copy(groupRef.current.position).sub(e.point)
    if (!gl.xr.isPresenting) {
      _grabPlane.setFromNormalAndCoplanarPoint(
        camera.getWorldDirection(new THREE.Vector3()).negate(),
        e.point
      )
    }
    setPadHighlight(scene, true)
    tlog(`[PadTest] grabbed epoint=${e.point.toArray().map(v => v.toFixed(3))} xr=${gl.xr.isPresenting} offset=${_offset.toArray().map(v => v.toFixed(3))}`)
  }

  function handlePointerMove(e: ThreeEvent<PointerEvent>) {
    if (!grabbedRef.current) return
    e.stopPropagation()
    _lastPoint.copy(e.point)
  }

  function handlePointerUp(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation()
    ;(e.target as any).releasePointerCapture?.(e.pointerId)
    grabbedRef.current = false
    setPadHighlight(scene, false)
    tlog('[PadTest] released')
  }

  return { handlePointerDown, handlePointerMove, handlePointerUp }
}
