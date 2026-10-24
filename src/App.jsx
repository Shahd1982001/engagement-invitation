import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import IntroRingBox from './components/IntroRingBox.jsx'
import InvitePage from './components/InvitePage.jsx'
import useReducedMotion from './hooks/useReducedMotion.js'

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
      {stage === 'intro' ? <IntroRingBox veilRef={veil} reduce={reduce} onDone={() => setStage('page')} /> : <InvitePage reduce={reduce} />}
      <div className="veil" ref={veil} aria-hidden="true" />
    </>
  )
}
