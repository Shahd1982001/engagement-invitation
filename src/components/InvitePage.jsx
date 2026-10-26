import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { invite } from '../config/invite.js'
import { dateParts } from '../utils/dateParts.js'
import RSVPDialog from './RSVPDialog.jsx'

function CalendarScrap({ date }) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const selectedDay = date.getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // الشبكة تبدأ يوم السبت: getDay() يحسب الأحد=0، لذا نضيف خانة فارغة واحدة
  const leadingDays = (firstDay + 1) % 7
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

function whatsappLink(d) {
  const phone = invite.whatsapp?.replace(/[^\d]/g, '')
  if (!phone) return ''
  const text = `السلام عليكم، نود تأكيد الحضور لحفل خطوبة ${invite.bride} و${invite.groom} يوم ${d.weekday} ${d.day} ${d.month} ${d.year} الساعة ${d.time} ${d.ampm}.`
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
}

export default function InvitePage({ reduce }) {
  const root = useRef(null)
  const [rsvpOpen, setRsvpOpen] = useState(false)
  const [hint, setHint] = useState(true)
  const d = dateParts(invite.dateTime, invite.timeZone)
  const calendarDate = new Date(invite.dateTime)
  const wa = whatsappLink(d)

  // ظهور تدريجي: قسم الأسماء عند الدخول، وورقة التفاصيل عند الوصول إليها بالتمرير
  useLayoutEffect(() => {
    if (reduce) return
    const ctx = gsap.context(() => {
      gsap.from('.names-content > *', {
        autoAlpha: 0, y: 20, duration: 1, stagger: 0.15, ease: 'power2.out',
      })
    }, root)
    const paper = root.current?.querySelector('.invitation-paper')
    let io
    if (paper) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.from(entry.target, { autoAlpha: 0, y: 30, duration: 1, ease: 'power2.out' })
            io.unobserve(entry.target)
          }
        })
      }, { threshold: 0.15 })
      io.observe(paper)
    }
    return () => { ctx.revert(); io?.disconnect() }
  }, [reduce])

  const onScroll = (e) => { if (e.currentTarget.scrollTop > 12) setHint(false) }

  return (
    <main className="invite-page" ref={root} onScroll={onScroll}>
      <section className="names-hero" aria-label="العروسين">
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
        </div>
        <div className={`scroll-hint${hint ? '' : ' hide'}`} aria-hidden="true">
          <span>تفاصيل الدعوة</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </section>

      <section className="details-section" aria-label="تفاصيل الدعوة">
        <div className="floating-petals" aria-hidden="true">
          <i /><i /><i /><i /><i /><i /><i /><i />
        </div>
        <div className="floral-arch floral-arch-paper" aria-hidden="true" />
        <article className="invitation-paper">
          <h1>يسعدنا دعوتكم</h1>
          <p className="paper-copy">{invite.line}</p>
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
          <div className="paper-actions">
            <button type="button" className="btn-gold" onClick={() => setRsvpOpen(true)}>تأكيد الحضور</button>
            {wa && (
              <a className="btn-line" href={wa} target="_blank" rel="noopener noreferrer">رد عبر واتساب</a>
            )}
          </div>
          <div className="paper-monogram">
            <span className="client-logo" role="img" aria-label="شعار الدعوة" />
          </div>
        </article>
      </section>
      {rsvpOpen && <RSVPDialog onClose={() => setRsvpOpen(false)} />}
    </main>
  )
}
