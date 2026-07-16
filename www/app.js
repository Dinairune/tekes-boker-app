const statusEl = document.getElementById('status');
const testBtn = document.getElementById('testBtn');
const dailyBtn = document.getElementById('dailyBtn');
const timeEl = document.getElementById('time');

function setStatus(msg, kind) {
  statusEl.textContent = msg;
  statusEl.className = 'status' + (kind ? ' ' + kind : '');
}

function getLN() {
  const cap = window.Capacitor;
  if (!cap || !cap.Plugins || !cap.Plugins.LocalNotifications) return null;
  return cap.Plugins.LocalNotifications;
}

async function ensurePermission(LN) {
  let perm = await LN.checkPermissions();
  if (perm.display !== 'granted') {
    perm = await LN.requestPermissions();
  }
  return perm.display === 'granted';
}

async function init() {
  const LN = getLN();
  if (!LN) {
    setStatus('נראה שזה נפתח בדפדפן ולא באפליקציה המותקנת.\nהתקן את קובץ ה-APK ופתח מהאייקון 🌅', 'err');
    return;
  }
  const ok = await ensurePermission(LN);
  setStatus(ok
    ? 'מוכן. אפשר לבדוק את ההתראות.'
    : 'צריך אישור להתראות. לחץ על כפתור ותאשר.', ok ? 'ok' : '');
}

testBtn.addEventListener('click', async () => {
  const LN = getLN();
  if (!LN) { setStatus('פתח מהאפליקציה המותקנת, לא מהדפדפן.', 'err'); return; }
  if (!(await ensurePermission(LN))) { setStatus('לא ניתן אישור להתראות.', 'err'); return; }
  const at = new Date(Date.now() + 10 * 1000);
  await LN.schedule({
    notifications: [{
      id: 101,
      title: 'בוקר טוב 🌅',
      body: 'זו התראת ניסיון — קפצה אליך לבד. ככה תרגיש האפליקציה.',
      schedule: { at }
    }]
  });
  setStatus('✅ נקבעה התראה לעוד 10 שניות.\nעכשיו — סגור את האפליקציה או נעל את המסך, וחכה. היא תקפוץ לבד.', 'ok');
});

dailyBtn.addEventListener('click', async () => {
  const LN = getLN();
  if (!LN) { setStatus('פתח מהאפליקציה המותקנת, לא מהדפדפן.', 'err'); return; }
  if (!(await ensurePermission(LN))) { setStatus('לא ניתן אישור להתראות.', 'err'); return; }
  const [h, m] = timeEl.value.split(':').map(Number);
  await LN.schedule({
    notifications: [{
      id: 202,
      title: 'בוקר טוב 🌅',
      body: 'הטקס שלך מחכה לך. קח נשימה אחת, ותתחיל.',
      schedule: { on: { hour: h, minute: m }, allowWhileIdle: true }
    }]
  });
  setStatus('✅ נקבעה תזכורת יומית ל-' + timeEl.value + '.\nהיא תחזור על עצמה כל יום — גם בלי אינטרנט, גם כשהאפליקציה סגורה.', 'ok');
});

document.addEventListener('DOMContentLoaded', init);
if (document.readyState !== 'loading') init();
