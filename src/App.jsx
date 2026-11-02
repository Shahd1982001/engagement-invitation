import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import useReducedMotion from './hooks/useReducedMotion.js'

// تحميل ثلاثي الأبعاد (three.js) عند الحاجة فقط لتسريع أول تحميل للصفحة
const IntroRingBox = lazy(() => import('./components/IntroRingBox.jsx'))
const InvitePage = lazy(() => import('./components/InvitePage.jsx'))

function IntroFallback() {
  return (
    <section className="intro" aria-label="جارٍ تجهيز الدعوة">
      <p className="intro-hint show">جارٍ تجهيز الدعوة…</p>
    </section>
  )
}

export default function App() {
  const [stage, setStage] = useState('intro')
  const veil = useRef(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (stage !== 'page') return
    const t = gsap.to(veil.current, { opacity: 0, duration: reduce ? 0.6 : 2.2, delay: 0.3, ease: 'power2.inOut' })
    return () => t.kill()
  }, [stage, reduce])

  return (
    <>
      <Suspense fallback={<IntroFallback />}>
        {stage === 'intro'
          ? <IntroRingBox veilRef={veil} reduce={reduce} onDone={() => setStage('page')} />
          : <InvitePage reduce={reduce} />}
      </Suspense>
      <div className="veil" ref={veil} aria-hidden="true" />
      <aside className="music-player" aria-label="موسيقى الدعوة">
        <iframe
          title="موسيقى الدعوة: Golden Brown"
          src="https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fcallum-tigwell%2Fgolden-brown-ending-part&color=%234a0a1c&auto_play=true&show_comments=false&show_user=true&show_reposts=false&visual=false"
          allow="autoplay"
          scrolling="no"
        />
      </aside>
    </>
  )
}
