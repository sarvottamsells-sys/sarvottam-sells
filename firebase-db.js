// ═══════════════════════════════════════════════════════════════════
//  SARVOTTAM SELLS — Firebase Database Layer  (firebase-db.js)
//  v2 — Fixes localStorage quota errors; images only in Firestore
// ═══════════════════════════════════════════════════════════════════

const _FB_CONFIG = {
  apiKey: "AIzaSyAw5xXPF4APSrbz0PdD0FxqJb3S5oxxRng",
  authDomain: "sarvottam-sells.firebaseapp.com",
  projectId: "sarvottam-sells",
  storageBucket: "sarvottam-sells.firebasestorage.app",
  messagingSenderId: "576668802157",
  appId: "1:576668802157:web:832a9e83aeb00a859bf364"
};

// Initialize Firebase
if (!firebase.apps.length) firebase.initializeApp(_FB_CONFIG);
const _db = firebase.firestore();

// ── Safe localStorage helpers (won't crash if storage full) ──────
function _lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; } catch(e) { return fallback; }
}
function _lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {
    // QuotaExceededError — clear old cache and try again with images stripped
    try {
      // Strip images from products before caching
      if (key === 'ms_products' && Array.isArray(val)) {
        const slim = val.map(p => {
          const c = {...p};
          if (c.images) c.images = c.images.map(img => img.startsWith('data:') ? '' : img);
          if (c.variations) c.variations = c.variations.map(v => ({...v, img: v.img && v.img.startsWith('data:') ? '' : v.img}));
          return c;
        });
        localStorage.setItem(key, JSON.stringify(slim));
      }
    } catch(e2) {
      // Give up on localStorage — Firestore is source of truth anyway
      console.warn('[DB] localStorage full, using memory only');
    }
  }
}
function _lsSetStr(key, val) {
  try { localStorage.setItem(key, val); } catch(e) {}
}

// ── Local Cache ──────────────────────────────────────────────────
window._SS = {
  products:     _lsGet('ms_products', []),
  coupons:      _lsGet('ms_coupons', []),
  storeName:    localStorage.getItem('ms_storeName')   || '',
  announcement: localStorage.getItem('ms_announcement') || '',
  waPhone:      localStorage.getItem('ms_waPhone')      || '',
};

// ── READ (sync from cache — always instant) ──────────────────────
window.gp  = () => window._SS.products;
window.gc  = () => window._SS.coupons;
window.gsn = () => {
  const C = typeof SITE_CONFIG !== 'undefined' ? SITE_CONFIG : {};
  return window._SS.storeName || C.brandName || 'MyStore';
};

// ── WRITE (update cache + save to Firestore) ─────────────────────
window.sp = (products) => {
  window._SS.products = products;
  _lsSet('ms_products', products);   // images stripped if too big
  _db.collection('data').doc('products')
    .set({ list: JSON.parse(JSON.stringify(products)) })  // full data with images to Firestore
    .then(() => console.log('[DB] products saved to Firestore ✓'))
    .catch(e => console.warn('[DB] products write:', e.message));
};

window.scc = (coupons) => {
  window._SS.coupons = coupons;
  _lsSet('ms_coupons', coupons);
  _db.collection('data').doc('settings')
    .set({ coupons }, { merge: true })
    .catch(e => console.warn('[DB] coupons write:', e.message));
};

window.ssn = (name) => {
  window._SS.storeName = name;
  _lsSetStr('ms_storeName', name);
  _db.collection('data').doc('settings')
    .set({ storeName: name }, { merge: true })
    .catch(e => console.warn('[DB] storeName write:', e.message));
};

window.setAnn = (text) => {
  window._SS.announcement = text;
  _lsSetStr('ms_announcement', text);
  _db.collection('data').doc('settings')
    .set({ announcement: text }, { merge: true })
    .catch(e => console.warn('[DB] announcement write:', e.message));
};

window.setWA = (phone) => {
  window._SS.waPhone = phone;
  _lsSetStr('ms_waPhone', phone);
  _db.collection('data').doc('settings')
    .set({ waPhone: phone }, { merge: true })
    .catch(e => console.warn('[DB] waPhone write:', e.message));
};

// ── REAL-TIME SYNC ────────────────────────────────────────────────
window._SS.init = function(onUpdate) {
  return new Promise(resolve => {
    let pReady = false, sReady = false;
    const check = () => { if (pReady && sReady) resolve(); };

    // Products listener
    _db.collection('data').doc('products').onSnapshot(snap => {
      if (snap.exists) {
        const list = snap.data().list || [];
        window._SS.products = list;
        _lsSet('ms_products', list);   // safe set — strips images if needed
      }
      if (!pReady) { pReady = true; check(); }
      else if (onUpdate) onUpdate();
    }, err => {
      console.warn('[DB] products listen:', err.message);
      pReady = true; check();
    });

    // Settings listener
    _db.collection('data').doc('settings').onSnapshot(snap => {
      if (snap.exists) {
        const s = snap.data();
        if (s.storeName     != null) { window._SS.storeName = s.storeName; _lsSetStr('ms_storeName', s.storeName); }
        if (s.announcement  != null) { window._SS.announcement = s.announcement; _lsSetStr('ms_announcement', s.announcement); }
        if (s.coupons       != null) { window._SS.coupons = s.coupons; _lsSet('ms_coupons', s.coupons); }
        if (s.waPhone       != null) { window._SS.waPhone = s.waPhone; _lsSetStr('ms_waPhone', s.waPhone); }
      }
      if (!sReady) { sReady = true; check(); }
      else if (onUpdate) onUpdate();
    }, err => {
      console.warn('[DB] settings listen:', err.message);
      sReady = true; check();
    });
  });
};
