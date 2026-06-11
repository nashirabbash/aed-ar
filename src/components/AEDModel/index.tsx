import { useGLTF } from '@react-three/drei'
import { GroupProps } from '@react-three/fiber'

export default function AEDModel(props: GroupProps) {
  const { scene } = useGLTF('/asset/aed.glb')
  return <primitive object={scene} {...props} />
}

useGLTF.preload('/asset/aed.glb')
