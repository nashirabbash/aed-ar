import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { tlog } from '../lib/log'

interface Props {
  onPose: (pos: THREE.Vector3, quat: THREE.Quaternion) => void
  once?: boolean
}

export default function ImageTracker({ onPose, once }: Props) {
  const firedRef = useRef(false)
  const loggedRef = useRef(false)

  useFrame(({ gl }, _delta, xrFrame) => {
    if (!xrFrame) {
      if (!loggedRef.current) { tlog('[ImageTracker] no xrFrame'); loggedRef.current = true }
      return
    }
    if (once && firedRef.current) return

    const hasApi = typeof (xrFrame as any).getImageTrackingResults === 'function'
    if (!loggedRef.current) {
      tlog(`[ImageTracker] xrFrame ok, hasApi=${hasApi}, session=${gl.xr.getSession()?.constructor?.name}`)
      const session = gl.xr.getSession() as any
      tlog(`[ImageTracker] session features=${JSON.stringify(session?.enabledFeatures ?? 'n/a')}`)
      loggedRef.current = true
    }

    if (!hasApi) return

    const results = (xrFrame as any).getImageTrackingResults()
    if (results.length > 0) {
      tlog(`[ImageTracker] results=${results.length} state=${results[0].trackingState}`)
    }

    for (const result of results) {
      if (result.trackingState !== 'tracked') continue
      const refSpace = gl.xr.getReferenceSpace()
      if (!refSpace) return
      const pose = xrFrame.getPose(result.imageSpace, refSpace)
      if (!pose) return

      if (once) {
        firedRef.current = true
        tlog('[ImageTracker] marker detected — anchoring')
      } else {
        tlog('[ImageTracker] marker tracked')
      }

      const { position: p, orientation: q } = pose.transform
      onPose(
        new THREE.Vector3(p.x, p.y, p.z),
        new THREE.Quaternion(q.x, q.y, q.z, q.w),
      )
    }
  })

  return null
}
