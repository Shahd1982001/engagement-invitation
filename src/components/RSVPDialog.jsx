import { useEffect, useRef, useState } from 'react'
import { invite } from '../config/invite.js'
import { submitRsvp } from '../services/rsvpService.js'

// نافذة تأكيد الحضور — واجهة أمامية فقط (لا تحفظ بيانات). للربط بـ Firestore عدّلي services/rsvpService.js
export default function RSVPDialog({ onClose }) {
  const max = invite.rsvp.maxCompanions
  const [f, setF] = useState({ name: '', attend: '', companions: 0 })
  const [err, setErr] = useState({}); const [status, setStatus] = useState('idle')
  const nameRef = useRef(null)
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))

  useEffect(() => {
    nameRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = async (ev) => {
    ev.preventDefault()
    const e = {}
    if (f.name.trim().length < 3) e.name = 'يرجى كتابة الاسم (٣ أحرف على الأقل).'
    if (!f.attend) e.attend = 'يرجى اختيار الحضور أو الاعتذار.'
    setErr(e); if (Object.keys(e).length) { e.name && nameRef.current?.focus(); return }
    setStatus('sending')
    try { await submitRsvp({ name: f.name.trim(), attending: f.attend === 'yes', companions: f.attend === 'yes' ? f.companions : 0 }); setStatus('done') }
    catch { setStatus('error') }
  }

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="rv-t">
        <button className="x" onClick={onClose} aria-label="إغلاق">×</button>
        <h2 id="rv-t">تأكيد الحضور</h2>
        {status === 'done' ? (
          <div role="status" className="done">
            <p>{f.attend === 'yes' ? 'تم تسجيل حضوركم، ننتظركم بكل محبة.' : 'تم تسجيل اعتذاركم، شكرًا لكم.'}</p>
            <p className="demo">نسخة تجريبية — لا يتم حفظ البيانات بصورة دائمة.</p>
            <button className="btn-gold" onClick={onClose}>إغلاق</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="g-name">الاسم الكريم</label>
              <input id="g-name" ref={nameRef} value={f.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" aria-invalid={!!err.name} aria-describedby={err.name ? 'e-n' : undefined} />
              {err.name && <p className="err" id="e-n" role="alert">{err.name}</p>}
            </div>
            <fieldset className="field">
              <legend>هل ستتشرفون بالحضور؟</legend>
              <div className="choices">
                <label className={f.attend === 'yes' ? 'on' : ''}><input type="radio" name="att" checked={f.attend === 'yes'} onChange={() => set('attend', 'yes')} />سأحضر بإذن الله</label>
                <label className={f.attend === 'no' ? 'on' : ''}><input type="radio" name="att" checked={f.attend === 'no'} onChange={() => set('attend', 'no')} />أعتذر عن الحضور</label>
              </div>
              {err.attend && <p className="err" role="alert">{err.attend}</p>}
            </fieldset>
            {f.attend === 'yes' && (
              <div className="field">
                <label htmlFor="g-c">عدد المرافقين (حتى {max})</label>
                <select id="g-c" value={f.companions} onChange={(e) => set('companions', +e.target.value)}>
                  {Array.from({ length: max + 1 }, (_, i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            )}
            <button className="btn-gold" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'جارٍ الإرسال…' : 'إرسال الرد'}</button>
            {status === 'error' && <p className="err" role="alert">تعذّر الإرسال، حاولوا مرة أخرى.</p>}
            <p className="demo">نسخة تجريبية — لا يتم حفظ البيانات بصورة دائمة.</p>
          </form>
        )}
      </div>
    </div>
  )
}
