import { useState } from 'react'
import * as THREE from 'three'
import ImageTracker from '../../xr/ImageTracker'

export default function MarkerTest() {
  const [pose, setPose] = useState<{ pos: THREE.Vector3; quat: THREE.Quaternion } | null>(null)

  return (
    <>
      <ImageTracker
        once
        onPose={(pos, quat) => setPose({ pos, quat })}
      />
      {pose && (
        <mesh position={pose.pos} quaternion={pose.quat}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial color="hotpink" />
        </mesh>
      )}
    </>
  )
}
