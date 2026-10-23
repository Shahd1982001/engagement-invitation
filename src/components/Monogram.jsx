// شعار تجريبي: الحرفان الأولان من الاسمين داخل حلقة ذهبية رفيعة (استبدليه بشعار العميل)
export default function Monogram({ a, b }) {
  return (
    <svg className="mono" viewBox="0 0 120 120" role="img" aria-label={`شعار ${a} و ${b}`}>
      <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="300 40" />
      <circle cx="92" cy="26" r="3" fill="currentColor" />
      <text x="40" y="70" textAnchor="middle" fontSize="44" fontStyle="italic" fill="currentColor" fontFamily="'Cormorant Garamond',serif">{a}</text>
      <text x="62" y="78" textAnchor="middle" fontSize="22" fill="currentColor" opacity=".8" fontFamily="'Cormorant Garamond',serif">&amp;</text>
      <text x="82" y="82" textAnchor="middle" fontSize="44" fontStyle="italic" fill="currentColor" fontFamily="'Cormorant Garamond',serif">{b}</text>
    </svg>
  )
}
