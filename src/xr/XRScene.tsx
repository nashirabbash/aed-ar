import AEDTest from '../components/AEDTest'
import PadTest from '../components/PadTest'
import AEDButtonTest from '../components/AEDButtonTest'
import MarkerTest from '../components/MarkerTest'

type SimMode = 'menu' | 'aed' | 'rjp' | 'pad-test' | 'aed-button-test' | 'marker-test'

interface Props {
  mode: SimMode
}

export default function XRScene({ mode }: Props) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 4, 2]} intensity={1} />

      {mode === 'aed' && <AEDTest />}
      {mode === 'pad-test' && <PadTest />}
      {mode === 'aed-button-test' && <AEDButtonTest />}
      {mode === 'marker-test' && <MarkerTest />}
    </>
  )
}
