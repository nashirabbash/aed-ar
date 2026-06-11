import { useGLTF } from '@react-three/drei'
import { GroupProps } from '@react-three/fiber'

export default function PhantomModel(props: GroupProps) {
  const { scene } = useGLTF('/asset/phantom.glb')
  return <primitive object={scene} {...props} />
}

useGLTF.preload('/asset/phantom.glb')
