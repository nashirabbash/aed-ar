import { useEffect, useRef } from 'react'
import { tlog } from '../../lib/log'

export function useAudioQueue(queue: string[], onDone?: () => void) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const indexRef = useRef(0)
  const queueRef = useRef(queue)
  const onDoneRef = useRef(onDone)

  useEffect(() => {
    const audio = new Audio()
    function playNext() {
      const idx = indexRef.current
      if (idx >= queueRef.current.length) {
        tlog('[PadTest] audio queue done')
        onDoneRef.current?.()
        return
      }
      audio.src = queueRef.current[idx]
      audio.load()
      audio.play().catch(e => tlog(`[PadTest] play #${idx} failed: ${e}`))
      tlog(`[PadTest] playing #${idx}`)
    }
    audio.addEventListener('ended', () => {
      indexRef.current += 1
      playNext()
    })
    audioRef.current = audio
    return () => { audio.pause(); audio.src = '' }
  }, [])

  function start() {
    if (!audioRef.current) return
    indexRef.current = 0
    audioRef.current.src = queue[0]
    audioRef.current.load()
    audioRef.current.play().catch(e => tlog(`[PadTest] queue start failed: ${e}`))
    tlog('[PadTest] audio queue started')
  }

  function stop() {
    if (!audioRef.current) return
    audioRef.current.pause()
    audioRef.current.currentTime = 0
    indexRef.current = 0
    tlog('[PadTest] audio queue stopped')
  }

  return { start, stop }
}
