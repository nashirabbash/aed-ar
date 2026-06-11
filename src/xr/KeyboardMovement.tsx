import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { tlog } from '../lib/log'

const SPEED = 2 // m/s
const _dir = new THREE.Vector3()
const _right = new THREE.Vector3()
const _forward = new THREE.Vector3()

export default function KeyboardMovement() {
  const { camera } = useThree()
  const keys = useRef<Record<string, boolean>>({})

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const k = e.key.toLowerCase()
      keys.current[k] = true
      tlog(`[KB] down key="${e.key}" code="${e.code}" target=${(e.target as HTMLElement)?.tagName}`)
    }
    function onKeyUp(e: KeyboardEvent) {
      const k = e.key.toLowerCase()
      keys.current[k] = false
      tlog(`[KB] up key="${e.key}"`)
    }
    globalThis.addEventListener('keydown', onKeyDown)
    globalThis.addEventListener('keyup', onKeyUp)
    tlog('[KB] listeners attached')
    return () => {
      globalThis.removeEventListener('keydown', onKeyDown)
      globalThis.removeEventListener('keyup', onKeyUp)
      tlog('[KB] listeners removed')
    }
  }, [])

  useFrame((_, delta) => {
    const k = keys.current
    if (!k.w && !k.a && !k.s && !k.d && !k['['] && !k[']']) return

    _dir.set(0, 0, 0)

    camera.getWorldDirection(_forward)
    _forward.y = 0
    _forward.normalize()

    _right.crossVectors(_forward, new THREE.Vector3(0, 1, 0)).normalize()

    if (k.w) _dir.addScaledVector(_forward, 1)
    if (k.s) _dir.addScaledVector(_forward, -1)
    if (k.d) _dir.addScaledVector(_right, 1)
    if (k.a) _dir.addScaledVector(_right, -1)
    if (k[']']) _dir.y += 1
    if (k['[']) _dir.y -= 1

    if (_dir.lengthSq() > 0) {
      _dir.normalize()
      camera.position.addScaledVector(_dir, SPEED * delta)
      tlog(`[KB] move pos=${camera.position.toArray().map(v => v.toFixed(3))} keys=${Object.keys(k).filter(key => k[key]).join(',')}`)
    }
  })

  return null
}
