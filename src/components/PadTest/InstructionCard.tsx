import { Text, Billboard } from "@react-three/drei";

// Blender (-238.542, 0, 88.2649) cm → Three.js x=x, y=z, z=-y
const POS: [number, number, number] = [-1.38542, 0.882649, 0];

export type CardPhase = 'default' | 'reassessment' | 'done'

const CONTENT: Record<CardPhase, { title: string; body: string }> = {
  default: {
    title: 'Langkah-langkah AED',
    body: [
      '1. Nyalakan AED — tekan tombol Power',
      '2. Tempelkan pad ke dada pasien yang terbuka',
      '3. Tekan tombol Bolt — jangan sentuh pasien',
      '4. AED analisis ritme & kirim kejutan listrik',
      '5. Mulai CPR — kompresi dada 100–120x/menit',
    ].join('\n'),
  },
  reassessment: {
    title: 'Reassessment',
    body: [
      'Menghentikan CPR...',
      'AED menganalisis ritme jantung kembali.',
      'Jangan sentuh pasien.',
    ].join('\n'),
  },
  done: {
    title: 'Selesai',
    body: 'Pasien selamat.',
  },
}

interface Props {
  phase?: CardPhase
}

export default function InstructionCard({ phase = 'default' }: Props) {
  const { title, body } = CONTENT[phase]

  return (
    <Billboard position={POS}>
      <mesh>
        <planeGeometry args={[1.05, 0.52]} />
        <meshBasicMaterial color="#0d1b2a" transparent opacity={0.88} />
      </mesh>

      <Text
        position={[0, 0.18, 0.005]}
        fontSize={0.048}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {title}
      </Text>

      <Text
        position={[-0.48, 0.02, 0.005]}
        fontSize={0.034}
        color="#cce4ff"
        anchorX="left"
        anchorY="top"
        maxWidth={0.96}
        lineHeight={1.5}
      >
        {body}
      </Text>
    </Billboard>
  );
}
