// نسخة تجريبية: لا يتم حفظ أي بيانات.
// لاحقًا: استبدلي المحتوى بـ addDoc(collection(db,'rsvps'), data) من Firebase Firestore
// دون تغيير واجهة RSVPForm (الدالة تستقبل كائنًا وتُرجع Promise).
export async function submitRsvp(data) {
  await new Promise((r) => setTimeout(r, 700))
  return { ok: true, saved: false, data }
}
