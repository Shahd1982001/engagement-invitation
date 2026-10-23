export const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
export function dateParts(iso, tz) {
  const date = new Date(iso)
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(date).map((x) => [x.type, x.value]))
  const h = +p.hour % 24, min = String(+p.minute).padStart(2, '0')
  return {
    day: +p.day, month: MONTHS[+p.month - 1], year: +p.year,
    weekday: new Intl.DateTimeFormat('ar', { weekday: 'long', timeZone: tz }).format(date),
    time: `${h % 12 || 12}:${min}`, ampm: h >= 12 ? 'مساءً' : 'صباحًا',
  }
}
