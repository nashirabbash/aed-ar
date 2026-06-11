import { useRef, useState } from 'react'
import { useGLTF, TransformControls } from '@react-three/drei'
import { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { setButtonHighlight } from './helper'
import { tlog } from '../../lib/log'
import type { AEDButtonTestProps } from './type'

export default function AEDButtonTest(_props: AEDButtonTestProps) {
  const { scene: aedScene } = useGLTF('/asset/aed.glb')
  const { scene: boltScene } = useGLTF('/asset/BoltButton.glb')
  const { scene: powerScene } = useGLTF('/asset/PowerButton.glb')

  const [group, setGroup] = useState<THREE.Group | null>(null)
  const boltActiveRef = useRef(false)
  const powerActiveRef = useRef(false)

  function handleBoltDown(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation()
    boltActiveRef.current = !boltActiveRef.current
    setButtonHighlight(boltScene, boltActiveRef.current)
    tlog(`[AEDButtonTest] BoltButton ${boltActiveRef.current ? 'on' : 'off'}`)
  }

  function handlePowerDown(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation()
    powerActiveRef.current = !powerActiveRef.current
    setButtonHighlight(powerScene, powerActiveRef.current)
    tlog(`[AEDButtonTest] PowerButton ${powerActiveRef.current ? 'on' : 'off'}`)
  }

  return (
    <>
      <group ref={setGroup} position={[0, 0, -0.6]}>
        <primitive object={aedScene} />
        <primitive object={boltScene} onPointerDown={handleBoltDown} />
        <primitive object={powerScene} onPointerDown={handlePowerDown} />
      </group>
      {import.meta.env.DEV && group && (
        <TransformControls object={group} />
      )}
    </>
  )
}

useGLTF.preload('/asset/aed.glb')
useGLTF.preload('/asset/BoltButton.glb')
useGLTF.preload('/asset/PowerButton.glb')
