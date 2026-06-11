import { useGLTF } from '@react-three/drei'
import { GroupProps } from '@react-three/fiber'

export default function PadModel(props: GroupProps) {
  const { scene } = useGLTF('/asset/pad.glb')
  return <primitive object={scene} {...props} />
}

useGLTF.preload('/asset/pad.glb')
