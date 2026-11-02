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
    </>
  )
}
