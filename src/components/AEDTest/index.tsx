import { useRef, useState } from 'react'
import { useGLTF, TransformControls } from '@react-three/drei'
import { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { setEmissive } from './helper'
import { tlog } from '../../lib/log'
import type { AEDTestProps } from './type'

export default function AEDTest(_props: AEDTestProps) {
  const { scene, nodes } = useGLTF('/asset/aed.glb')
  const [group, setGroup] = useState<THREE.Group | null>(null)
  const pressedRef = useRef(false)

  const powerButton = nodes['PowerButton'] as THREE.Object3D
  const powerButton001 = nodes['PowerButton001'] as THREE.Object3D

  function handleClick(e: ThreeEvent<MouseEvent>) {
    tlog(`[AEDTest] clicked: ${e.object.name}`)

    if (e.object !== powerButton && e.object !== powerButton001) return
    e.stopPropagation()

    pressedRef.current = !pressedRef.current
    tlog(`[AEDTest] ${e.object.name} ${pressedRef.current ? 'pressed' : 'released'}`)
    setEmissive(e.object, pressedRef.current)
  }

  return (
    <>
      <group ref={setGroup} position={[0, 0, -0.6]}>
        <primitive object={scene} onClick={handleClick} />
      </group>
      {import.meta.env.DEV && group && (
        <TransformControls object={group} />
      )}
    </>
  )
}

useGLTF.preload('/asset/aed.glb')
