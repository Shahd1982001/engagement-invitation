import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { invite } from '../config/invite.js'
import { dateParts } from '../utils/dateParts.js'
import Monogram from './Monogram.jsx'

export default function InvitePage({ reduce, ringArrived = false }) {
  const root = useRef(null)
  const [scene, setScene] = useState('names')
  const d = dateParts(invite.dateTime, invite.timeZone)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root.current)
      const items = scene === 'names' ? '.names-scene > *' : '.letter-scene > *'
      gsap.from(q(items), {
        autoAlpha: 0,
        y: reduce ? 0 : 20,
        duration: reduce ? 0.45 : 1,
        stagger: reduce ? 0 : 0.15,
        ease: 'power2.out',
      })
    }, root)
    return () => ctx.revert()
  }, [scene, reduce])

  return (
    <main className={`invite-scenes ${scene}`} ref={root}>
      {scene === 'names' ? (
        <section className="names-scene" aria-label="العروسين">
          <div className="floral-arch" aria-hidden="true" />
          {ringArrived && <div className="arrived-ring" aria-hidden="true"><span /></div>}
          <div className="scene-logo"><Monogram a={invite.brideLatin} b={invite.groomLatin} /></div>
          <p className="scene-kicker">دعوة خطوبة</p>
          <h1><span>{invite.bride}</span><i aria-hidden="true">&amp;</i><span>{invite.groom}</span></h1>
          <p className="scene-line">{invite.line}</p>
          <div className="scene-people">
            <img className="scene-person bride" src="/assets/bride.png" alt="العروس" />
            <img className="scene-person groom" src="/assets/groom.png" alt="العريس" />
          </div>
          <button className="scene-next" onClick={() => setScene('letter')}>تفاصيل الدعوة</button>
        </section>
      ) : (
        <section className="letter-scene" aria-label="تفاصيل الدعوة">
          <div className="floral-arch floral-arch-paper" aria-hidden="true" />
          <div className="flower flower-one" aria-hidden="true">✿</div>
          <div className="flower flower-two" aria-hidden="true">❀</div>
          <article className="invitation-paper">
            <p className="paper-kicker">بسم الله الرحمن الرحيم</p>
            <h1>يسعدنا دعوتكم</h1>
            <p className="paper-copy">{invite.line}</p>
            <div className="scraps" aria-label="تفاصيل المناسبة">
              <div className="scrap date-scrap">
                <small>{d.weekday}</small>
                <strong>{d.day}</strong>
                <span>{d.month} {d.year}</span>
              </div>
              <div className="scrap time-scrap">
                <small>الوقت</small>
                <strong>{d.time}</strong>
                <span>{d.ampm}</span>
              </div>
              <div className="scrap place-scrap">
                <small>المكان</small>
                <strong>{invite.placeName}</strong>
                <span>{invite.city}</span>
                <a href={invite.mapsUrl} target="_blank" rel="noopener noreferrer">موقع المكان</a>
              </div>
            </div>
            <div className="paper-monogram"><Monogram a={invite.brideLatin} b={invite.groomLatin} /></div>
          </article>
          <button className="scene-back" onClick={() => setScene('names')}>الرجوع</button>
        </section>
      )}
    </main>
  )
}
