import { useCallback, useRef, useState } from 'react'
import { useGLTF, TransformControls } from '@react-three/drei'
import { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import PhantomModel from '../PhantomModel'
import AEDModel from '../AEDModel'
import { setButtonHighlight } from '../AEDButtonTest/helper'
import { useGrab, PHANTOM_SURFACE_Y } from './grab'
import { useAudioQueue } from './audio'
import { useAEDSequence } from './aedSequence'
import { useScreen } from './screen'
import { tlog } from '../../lib/log'
import type { PadTestProps } from './type'
import InstructionCard, { type CardPhase } from './InstructionCard'

// Blender → Three.js: x=x, y=z, z=-y (Blender Z-up → Three.js Y-up)
// Blender rot Z → Three.js rot Y
const PHANTOM_POS: [number, number, number] = [0, 0.21586, 0.50738]
const AED_POS: [number, number, number] = [-0.361924, 0.125587, -0.515889]
const AED_ROT: [number, number, number] = [0, 50 * (Math.PI / 180), 0]
const PAD_INIT_POS: [number, number, number] = [-0.157509, 0.117888, -0.320655]

const POWER_ON_QUEUE = [
  '/asset/voice/wav/Stay_calm_Follow_these_voice_instructions.wav',
  '/asset/voice/wav/Remove_clothing_from_patients_chest.wav',
  '/asset/voice/wav/Apply_pads_to_patients_bare_chest.wav',
]

export default function PadTest(_props: PadTestProps) {
  const { scene } = useGLTF('/asset/pad.glb')
  const { scene: boltScene } = useGLTF('/asset/BoltButton.glb')
  const { scene: powerScene } = useGLTF('/asset/PowerButton.glb')
  const { scene: layarScene } = useGLTF('/asset/layar.glb')
  const groupRef = useRef<THREE.Group | null>(null)
  const phantomGroupRef = useRef<THREE.Group | null>(null)
  const [group, setGroup] = useState<THREE.Group | null>(null)
  const [cardPhase, setCardPhase] = useState<CardPhase>('default')
  const boltActiveRef = useRef(false)
  const powerActiveRef = useRef(false)
  const powerQueueDoneRef = useRef(false)
  const padGrabDisabledRef = useRef(true)

  const { handlePointerDown, handlePointerMove, handlePointerUp } = useGrab(groupRef, phantomGroupRef, scene, padGrabDisabledRef)
  const powerAudio = useAudioQueue(POWER_ON_QUEUE, () => {
    powerQueueDoneRef.current = true
    padGrabDisabledRef.current = boltActiveRef.current
    tlog('[PadTest] power queue done — pad grab enabled')
  })
  const aedSequence = useAEDSequence()
  const screen = useScreen(layarScene)

  const setGroupRef = useCallback((el: THREE.Group | null) => {
    groupRef.current = el
    setGroup(el)
  }, [])

  function isPadOnPhantom(): boolean {
    if (!groupRef.current) return false
    return Math.abs(groupRef.current.position.y - PHANTOM_SURFACE_Y) < 0.05
  }

  function handleBoltDown(e: ThreeEvent<PointerEvent>) {
    if (!powerActiveRef.current) return
    e.stopPropagation()
    boltActiveRef.current = !boltActiveRef.current
    setButtonHighlight(boltScene, boltActiveRef.current)
    tlog(`[PadTest] BoltButton ${boltActiveRef.current ? 'on' : 'off'}`)

    if (boltActiveRef.current) {
      padGrabDisabledRef.current = true
      if (!isPadOnPhantom()) {
        tlog('[PadTest] bolt: pad not on phantom, skip AED sequence')
        return
      }
      aedSequence.start({
        onReassessment: () => setCardPhase('reassessment'),
        onDone: () => setCardPhase('done'),
      })
    } else {
      padGrabDisabledRef.current = !powerQueueDoneRef.current
      aedSequence.stop()
    }
  }

  function handlePowerDown(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation()
    powerActiveRef.current = !powerActiveRef.current
    setButtonHighlight(powerScene, powerActiveRef.current)

    if (powerActiveRef.current) {
      screen.setOn()
      powerAudio.start()
      padGrabDisabledRef.current = true
      powerQueueDoneRef.current = false
    } else {
      screen.setOff()
      powerAudio.stop()
      aedSequence.stop()
      boltActiveRef.current = false
      setButtonHighlight(boltScene, false)
      padGrabDisabledRef.current = true
      powerQueueDoneRef.current = false
      setCardPhase('default')
    }

    tlog(`[PadTest] PowerButton ${powerActiveRef.current ? 'on' : 'off'}`)
  }

  return (
    <>
      <group ref={phantomGroupRef} position={PHANTOM_POS}>
        <PhantomModel />
      </group>

      <group position={AED_POS} rotation={AED_ROT}>
        <AEDModel />
        <primitive object={layarScene} />
        <primitive object={boltScene} onPointerDown={handleBoltDown} />
        <primitive object={powerScene} onPointerDown={handlePowerDown} />
      </group>

      <group ref={setGroupRef} position={PAD_INIT_POS}>
        <primitive
          object={scene}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      </group>

      <InstructionCard phase={cardPhase} />

      {import.meta.env.DEV && group && (
        <TransformControls object={group} />
      )}
    </>
  )
}

useGLTF.preload('/asset/pad.glb')
useGLTF.preload('/asset/BoltButton.glb')
useGLTF.preload('/asset/PowerButton.glb')
useGLTF.preload('/asset/layar.glb')
