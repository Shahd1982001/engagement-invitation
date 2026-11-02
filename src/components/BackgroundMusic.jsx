import { useEffect, useRef, useState } from 'react'

const musicUrl = '/assets/The_stranglers_-_Golden_brown_looped_slowed_reverb_(mp3.pm).mp3'

export default function BackgroundMusic() {
  const audio = useRef(null)
  const manuallyPaused = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const player = audio.current
    player.volume = 0.75

    const tryPlay = () => {
      if (manuallyPaused.current || !player.paused || player.error) return
      player.play().catch(() => {
        // Some browsers require a gesture; the next interaction will retry.
      })
    }
    const onGesture = (event) => {
      // The music button handles its own gesture, including an explicit pause.
      if (event.target instanceof Element && event.target.closest('.music-toggle')) return
      tryPlay()
    }

    tryPlay()
    window.addEventListener('pointerdown', onGesture)
    window.addEventListener('keydown', onGesture)
    return () => {
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('keydown', onGesture)
      player.pause()
    }
  }, [])

  const toggle = () => {
    const player = audio.current
    if (!player.paused) {
      manuallyPaused.current = true
      player.pause()
    } else {
      manuallyPaused.current = false
      player.play().catch(() => {})
    }
  }

  return (
    <>
      <audio ref={audio} src={musicUrl} preload="metadata" loop
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
        onError={() => { setPlaying(false); setFailed(true) }} />
      <button type="button" className={`music-toggle${playing ? ' playing' : ''}`}
        onClick={toggle} aria-label={failed ? 'الموسيقى غير متاحة' : playing ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى'}
        aria-pressed={playing} title={failed ? 'الموسيقى غير متاحة' : playing ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى'}>
        {playing ? '♫' : '♪'}
      </button>
    </>
  )
}
