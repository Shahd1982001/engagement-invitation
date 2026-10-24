import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { invite } from '../config/invite.js'
import { dateParts } from '../utils/dateParts.js'
import Monogram from './Monogram.jsx'

function CalendarScrap({ date }) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const selectedDay = date.getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leadingDays = firstDay
  const days = Array.from({ length: leadingDays + daysInMonth }, (_, index) => {
    const day = index - leadingDays + 1
    return day > 0 ? day : null
  })
  const weekdays = ['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج']

  return (
    <div className="calendar-grid" aria-label={`تقويم ${date.toLocaleDateString('ar-LY', { month: 'long', year: 'numeric' })}`}>
      {weekdays.map((day) => <span className="calendar-weekday" key={day}>{day}</span>)}
      {days.map((day, index) => (
        <span className={day === selectedDay ? 'calendar-day selected' : 'calendar-day'} key={`${day}-${index}`}>
          {day || ''}
        </span>
      ))}
    </div>
  )
}

export default function InvitePage({ reduce }) {
  const root = useRef(null)
  const [scene, setScene] = useState('names')
  const d = dateParts(invite.dateTime, invite.timeZone)
  const calendarDate = new Date(invite.dateTime)

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
          <div className="floating-petals" aria-hidden="true">
            <i /><i /><i /><i /><i /><i /><i /><i />
          </div>
          <div className="names-content">
            <div className="scene-logo">
              <span className="client-logo" role="img" aria-label="شعار الدعوة" />
            </div>
            <p className="scene-kicker">دعوة خطوبة</p>
            <h1><span>{invite.bride}</span><i aria-hidden="true">&amp;</i><span>{invite.groom}</span></h1>
            <p className="engagement-quote">
              <span>بسم الله الرحمن الرحيم</span>
              <span>وبالحب تبدأ أجمل الحكايات، وعلى درب المودة نخطو أولى خطواتنا</span>
            </p>
            <button className="scene-next" onClick={() => setScene('letter')}>تفاصيل الدعوة</button>
          </div>
        </section>
      ) : (
        <section className="letter-scene" aria-label="تفاصيل الدعوة">
          <div className="floating-petals" aria-hidden="true">
            <i /><i /><i /><i /><i /><i /><i /><i />
          </div>
          <div className="floral-arch floral-arch-paper" aria-hidden="true" />
          <article className="invitation-paper">
            <h1>يسعدنا دعوتكم</h1>
            <p className="paper-copy">لحضور حفل خطوبتنا</p>
            <div className="scraps" aria-label="تفاصيل المناسبة">
              <div className="scrap date-scrap">
                <small className="calendar-month">{d.month} {d.year}</small>
                <CalendarScrap date={calendarDate} />
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
            <div className="paper-monogram">
              <span className="client-logo" role="img" aria-label="شعار الدعوة" />
            </div>
          </article>
          <button className="scene-back" onClick={() => setScene('names')}>الرجوع</button>
        </section>
      )}
    </main>
  )
}
