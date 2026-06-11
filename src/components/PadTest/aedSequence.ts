import { useEffect, useRef } from 'react'
import { tlog } from '../../lib/log'

const V = (path: string) => `/asset/voice/wav/${path}`

type QueueItem = string | number | (() => void)

const MAIN_SEQUENCE: QueueItem[] = [
  V('Analyzing_heart_rhythm.wav'),
  V('Do_not_touch_the_patient.wav'),
  10000,
  V('Shock_advised.wav'),
  V('Stand_clear.wav'),
  V('Delivering_shock.wav'),
  V('Shock_delivered.wav'),
  2000,
  V('It_is_safe_to_touch_the_patient.wav'),
  V('Begin_CPR_now.wav'),
  V('Give_chest_compressions.wav'),
  120000,
  V('Stop_CPR.wav'),
  V('Analyzing_heart_rhythm.wav'),
  V('Do_not_touch_the_patient.wav'),
  10000,
  V('No_shock_advised.wav'),
  V('Begin_CPR_now.wav'),
  120000,
  // onReassessment injected here
]

const REASSESSMENT_SEQUENCE: QueueItem[] = [
  V('Stop_CPR.wav'),
  V('Analyzing_heart_rhythm.wav'),
  V('Do_not_touch_the_patient.wav'),
  // onDone injected here
]

function playSequence(queue: QueueItem[], audio: HTMLAudioElement): () => void {
  let i = 0
  let cancelled = false
  let tid: ReturnType<typeof setTimeout> | null = null

  function next() {
    if (cancelled || i >= queue.length) return
    const item = queue[i++]
    if (typeof item === 'number') {
      tid = setTimeout(next, item)
    } else if (typeof item === 'function') {
      item()
      next()
    } else {
      audio.src = item
      audio.load()
      audio.onended = next
      audio.play().catch(() => next())
      tlog(`[AED] playing ${item.split('/').pop()}`)
    }
  }

  next()

  return () => {
    cancelled = true
    if (tid !== null) clearTimeout(tid)
    audio.onended = null
    audio.pause()
    audio.src = ''
  }
}

interface AEDCallbacks {
  onReassessment?: () => void
  onDone?: () => void
}

export function useAEDSequence() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const cancelRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio
    return () => { audio.pause(); audio.src = '' }
  }, [])

  function start(callbacks?: AEDCallbacks) {
    if (!audioRef.current) return
    const queue: QueueItem[] = [
      ...MAIN_SEQUENCE,
      ...(callbacks?.onReassessment ? [callbacks.onReassessment] : []),
      ...REASSESSMENT_SEQUENCE,
      ...(callbacks?.onDone ? [callbacks.onDone] : []),
    ]
    cancelRef.current = playSequence(queue, audioRef.current)
    tlog('[PadTest] AED sequence started')
  }

  function stop() {
    cancelRef.current?.()
    cancelRef.current = null
    tlog('[PadTest] AED sequence stopped')
  }

  return { start, stop }
}
