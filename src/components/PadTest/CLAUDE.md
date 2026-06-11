# PadTest Component

Simulasi penempatan pad AED ke pasien (phantom) + alur suara AED.

## File Structure

| File | Isi |
|------|-----|
| `index.tsx` | Komposisi semua hook + JSX + button handlers (`handleBoltDown`, `handlePowerDown`) |
| `grab.ts` | `useGrab` — grab pad dengan tangan/mouse, gravity, pointer capture. Export `PHANTOM_SURFACE_Y` |
| `audio.ts` | `useAudioQueue` — antrian suara saat power on: Stay calm → Remove clothing → Apply pads |
| `aedSequence.ts` | `useAEDSequence` — urutan suara AED lengkap dengan jeda (setTimeout). `playSequence` internal |
| `screen.ts` | `useScreen` — setup canvas texture di mesh layar AED, `setOn`/`setOff` |
| `helper.ts` | `setPadHighlight`, `createScreenCanvas`, `drawScreenOn`, `drawScreenOff`, `findFirstMesh` |
| `type.ts` | `PadTestProps` |

## Key Constants

- `PHANTOM_SURFACE_Y = 0.39468` — Y world position permukaan phantom (Blender Z 39.468cm → Three.js Y)
- `PAD_INIT_POS` — posisi awal pad saat scene mount
- `AED_SEQUENCE` (di `aedSequence.ts`) — array `string | number`: string = path WAV, number = delay ms

## Logic Flow

1. **Power ON** → `screen.setOn()` + `powerAudio.start()` (3 file WAV berurutan)
2. **Pad ditempatkan** → grab pad, lepas di atas phantom → gravity mendarat di `PHANTOM_SURFACE_Y`
3. **Bolt clicked** + pad di phantom (`isPadOnPhantom()`) → `aedSequence.start()`
4. **Bolt clicked lagi** / **Power OFF** → `aedSequence.stop()` (cancel timeout + pause audio)

## Pad On Phantom Check

```ts
Math.abs(groupRef.current.position.y - PHANTOM_SURFACE_Y) < 0.05
```

## Voice Assets

`/asset/voice/wav/` — semua file WAV. Nama file = teks suara dengan underscore.

## Grab System

XR mode: pakai `e.point` dari pointer events (bukan `gl.xr.getController` — controller di (0,0,0) saat hand tracking).
Desktop mode: grab plane projection via raycaster.
Pointer capture dipakai agar `onPointerMove` tetap fire saat ray keluar dari mesh.
