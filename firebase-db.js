// ═══════════════════════════════════════════════════════════════════
//  SARVOTTAM SELLS — Firebase Database Layer  (firebase-db.js)
//  v3 — INFINITE PRODUCTS FIX
//  Each product is stored as a separate Firestore document:
//    /data/products/{productId}
//  This removes the 1MB single-document limit completely.
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

// ── Safe localStorage helpers ────────────────────────────────────
function _lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; } catch(e) { return fallback; }
}
function _lsSet(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch(e) {
    // QuotaExceededError — strip images and try again
    try {
      if (key === 'ms_products' && Array.isArray(val)) {
        const slim = val.map(p => {
          const c = {...p};
          if (c.images) c.images = c.images.map(img => img && img.startsWith('data:') ? '' : img);
          if (c.imgData && c.imgData.startsWith('data:')) c.imgData = '';
          if (c.variations) c.variations = c.variations.map(v => ({
            ...v,
            images: (v.images || []).map(img => img && img.startsWith('data:') ? '' : img),
            imgData: v.imgData && v.imgData.startsWith('data:') ? '' : (v.imgData || '')
          }));
          return c;
        });
        localStorage.setItem(key, JSON.stringify(slim));
      }
    } catch(e2) {
      console.warn('[DB] localStorage full — using memory only');
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
  storeName:    localStorage.getItem('ms_storeName')    || '',
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

// ── Strip base64 images for Firestore (keeps [img] placeholder) ──
function _stripImages(p) {
  const c = JSON.parse(JSON.stringify(p));
  if (c.images)  c.images  = c.images.map(img => img && img.startsWith('data:') ? '[img]' : img);
  if (c.imgData && c.imgData.startsWith('data:')) c.imgData = '[img]';
  if (c.variations) c.variations = c.variations.map(v => ({
    ...v,
    images:  (v.images  || []).map(img => img && img.startsWith('data:') ? '[img]' : img),
    imgData: v.imgData && v.imgData.startsWith('data:') ? '[img]' : (v.imgData || '')
  }));
  return c;
}

// ── WRITE — sp() saves ALL products ─────────────────────────────
// Strategy: compare new list vs old list and do minimal Firestore writes
window.sp = (products) => {
  const previousProducts = window._SS.products;
  window._SS.products = products;
  _lsSet('ms_products', products);

  const oldIds  = new Set(previousProducts.map(p => p.id));
  const newIds  = new Set(products.map(p => p.id));

  const batch = _db.batch();

  // Upsert new or changed products
  products.forEach(p => {
    const oldP = previousProducts.find(x => x.id === p.id);
    // Always write if new, or if content changed (simple stringify diff)
    if (!oldP || JSON.stringify(oldP) !== JSON.stringify(p)) {
      const ref = _db.collection('data').doc('products').collection('items').doc(p.id);
      batch.set(ref, _stripImages(p));
    }
  });

  // Delete removed products
  previousProducts.forEach(p => {
    if (!newIds.has(p.id)) {
      const ref = _db.collection('data').doc('products').collection('items').doc(p.id);
      batch.delete(ref);
    }
  });

  batch.commit()
    .then(() => console.log('[DB] products saved ✓ (' + products.length + ' total)'))
    .catch(e => {
      console.warn('[DB] products write failed:', e.message);
      // Revert memory on failure
      window._SS.products = previousProducts;
      if (typeof window._onSpError === 'function') window._onSpError(e.message);
    });
};

// ── Settings write functions ─────────────────────────────────────
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
// Now listens to /data/products/items sub-collection (onSnapshot on collection)
window._SS.init = function(onUpdate) {
  return new Promise(resolve => {
    let pReady = false, sReady = false;
    const check = () => { if (pReady && sReady) resolve(); };

    // ── Products listener (subcollection) ────────────────────────
    _db.collection('data').doc('products').collection('items')
      .onSnapshot(snap => {
        const list = [];
        snap.forEach(doc => list.push(doc.data()));

        // ── MIGRATION: also check old single-doc format ──────────
        // If new subcollection is empty but old /data/products doc has data,
        // migrate it automatically (one-time).
        if (list.length === 0) {
          _db.collection('data').doc('products').get().then(oldDoc => {
            if (oldDoc.exists) {
              const oldList = (oldDoc.data() && oldDoc.data().list) || [];
              if (oldList.length > 0) {
                console.log('[DB] Migrating', oldList.length, 'products from old format...');
                // Fake an sp() call to migrate
                const saved = window._SS.products;
                window._SS.products = oldList;
                _lsSet('ms_products', oldList);
                window.sp(oldList); // This will write to new subcollection
                if (onUpdate) onUpdate();
              }
            }
          }).catch(() => {});
        } else {
          // Sort by product id or by a stored order if present
          list.sort((a, b) => {
            if (a._order != null && b._order != null) return a._order - b._order;
            return (a.id || '').localeCompare(b.id || '');
          });
          window._SS.products = list;
          _lsSet('ms_products', list);
        }

        if (!pReady) { pReady = true; check(); }
        else if (onUpdate) onUpdate();
      }, err => {
        console.warn('[DB] products listen:', err.message);
        pReady = true; check();
      });

    // ── Settings listener ────────────────────────────────────────
    _db.collection('data').doc('settings').onSnapshot(snap => {
      if (snap.exists) {
        const s = snap.data();
        if (s.storeName     != null) { window._SS.storeName     = s.storeName;     _lsSetStr('ms_storeName',    s.storeName); }
        if (s.announcement  != null) { window._SS.announcement  = s.announcement;  _lsSetStr('ms_announcement', s.announcement); }
        if (s.coupons       != null) { window._SS.coupons       = s.coupons;       _lsSet('ms_coupons', s.coupons); }
        if (s.waPhone       != null) { window._SS.waPhone       = s.waPhone;       _lsSetStr('ms_waPhone',      s.waPhone); }
      }
      if (!sReady) { sReady = true; check(); }
      else if (onUpdate) onUpdate();
    }, err => {
      console.warn('[DB] settings listen:', err.message);
      sReady = true; check();
    });
  });
};
