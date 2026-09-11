document.getElementById('year').textContent = new Date().getFullYear();

// ---- Offer data ----
const offerLabels = {
  mask: 'الماسك لوحده',
  duo: 'الشامبو + البلسم',
  full: 'الباقة الكاملة'
};

const offerDetails = {
  mask: { price: 599, discountPercent: 53 },
  duo: { price: 699, discountPercent: 70 },
  full: { price: 1199, discountPercent: 67 }
};

// Special fixed price when a customer orders exactly 2 of the same offer (extra bundle discount, always free shipping)
const BUNDLE_OF_2_PRICE = {
  mask: 999,
  duo: 1300,
  full: 1999
};

const FREE_SHIPPING_THRESHOLD = 1000;
const SHIPPING_FEE = 35;

const COUPON_CODE = 'KARSEELL15';
const COUPON_DISCOUNT = 0.15;

const offerField = document.getElementById('offerField');
const selectedOfferLabel = document.getElementById('selectedOfferLabel');
const allOfferCards = document.querySelectorAll('.offer-card');

// ---- Hamburger side menu ----
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sideMenu = document.getElementById('sideMenu');
const sideMenuOverlay = document.getElementById('sideMenuOverlay');
const sideMenuClose = document.getElementById('sideMenuClose');

function openSideMenu() {
  sideMenu.classList.add('is-open');
  sideMenuOverlay.classList.add('is-open');
}
function closeSideMenu() {
  sideMenu.classList.remove('is-open');
  sideMenuOverlay.classList.remove('is-open');
}
hamburgerBtn.addEventListener('click', openSideMenu);
sideMenuClose.addEventListener('click', closeSideMenu);
sideMenuOverlay.addEventListener('click', closeSideMenu);
document.querySelectorAll('.side-menu-link').forEach(function (link) {
  link.addEventListener('click', closeSideMenu);
});

// ---- Product info tabs ----
document.querySelectorAll('.info-tab-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    const target = btn.getAttribute('data-info-tab');

    document.querySelectorAll('.info-tab-btn').forEach(function (b) { b.classList.remove('is-active'); });
    btn.classList.add('is-active');

    document.querySelectorAll('.info-tab-pane').forEach(function (pane) {
      pane.classList.toggle('is-active', pane.id === 'tab-' + target);
    });
  });
});

// ---- Live viewer counter (cosmetic urgency element) ----
const liveViewersEl = document.getElementById('liveViewers');
if (liveViewersEl) {
  setInterval(function () {
    const current = parseInt(liveViewersEl.textContent, 10) || 20;
    const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
    const next = Math.min(41, Math.max(14, current + change));
    liveViewersEl.textContent = next;
  }, 4000);
}

// ---- Order summary elements ----
const orderSummary = document.getElementById('orderSummary');
const summaryOfferName = document.getElementById('summaryOfferName');
const summaryPrice = document.getElementById('summaryPrice');
const summaryDiscount = document.getElementById('summaryDiscount');
const summaryShipping = document.getElementById('summaryShipping');
const summaryTotal = document.getElementById('summaryTotal');
const couponInput = document.getElementById('couponInput');
const applyCouponBtn = document.getElementById('applyCouponBtn');
const couponMessage = document.getElementById('couponMessage');
const qtyMinus = document.getElementById('qtyMinus');
const qtyPlus = document.getElementById('qtyPlus');
const qtyValue = document.getElementById('qtyValue');

let couponApplied = false;
let quantity = 1;

function computeOrderTotals(offerKey, qty) {
  const details = offerDetails[offerKey];
  if (!details) return null;

  const isBundleOf2 = qty === 2 && BUNDLE_OF_2_PRICE[offerKey] !== undefined;
  const lineTotal = isBundleOf2 ? BUNDLE_OF_2_PRICE[offerKey] : details.price * qty;
  const shipping = isBundleOf2 ? 0 : (lineTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE);

  return { lineTotal: lineTotal, shipping: shipping, isBundleOf2: isBundleOf2, discountPercent: details.discountPercent };
}

function updateSummary(offerKey) {
  const details = offerDetails[offerKey];
  if (!details) return;

  const totals = computeOrderTotals(offerKey, quantity);

  orderSummary.hidden = false;
  summaryOfferName.textContent = offerLabels[offerKey] || offerKey;
  qtyValue.textContent = quantity;

  const lineTotal = totals.lineTotal;
  if (totals.isBundleOf2) {
    summaryPrice.textContent = lineTotal + ' جنيه (عرض عبوتين)';
  } else {
    summaryPrice.textContent = (quantity > 1
      ? details.price + ' × ' + quantity + ' = ' + lineTotal + ' جنيه'
      : lineTotal + ' جنيه');
  }

  summaryDiscount.textContent = 'خصم ' + details.discountPercent + '%';

  const shipping = totals.shipping;
  if (shipping === 0) {
    summaryShipping.textContent = 'شحن مجاني';
    summaryShipping.classList.add('summary-free');
  } else {
    summaryShipping.textContent = shipping + ' جنيه';
    summaryShipping.classList.remove('summary-free');
  }

  const subtotal = lineTotal + shipping;
  const total = couponApplied ? Math.round(subtotal * (1 - COUPON_DISCOUNT)) : subtotal;
  summaryTotal.textContent = total + ' جنيه';
}

function selectOffer(offerKey) {
  const card = document.querySelector('.offer-card[data-offer="' + offerKey + '"]');
  if (!card) return;

  // reset quantity whenever a different offer is chosen
  if (offerField.value !== offerKey) {
    quantity = 1;
  }

  // move the highlighted/selected border to the chosen offer
  allOfferCards.forEach(function (c) { c.classList.remove('selected'); });
  card.classList.add('selected');

  offerField.value = offerKey;
  selectedOfferLabel.textContent = offerLabels[offerKey] || offerKey;

  if (typeof fbq === 'function') {
    fbq('track', 'InitiateCheckout', {
      content_name: offerLabels[offerKey] || offerKey,
      value: offerDetails[offerKey] ? offerDetails[offerKey].price : undefined,
      currency: 'EGP'
    });
  }

  updateSummary(offerKey);
}

document.querySelectorAll('.choose-offer').forEach(function (btn) {
  btn.addEventListener('click', function (e) {
    const card = btn.closest('.offer-card');
    selectOffer(card.getAttribute('data-offer'));
  });
});

// ---- Quantity stepper ----
qtyMinus.addEventListener('click', function () {
  if (quantity > 1) {
    quantity -= 1;
    updateSummary(offerField.value);
  }
});

qtyPlus.addEventListener('click', function () {
  quantity += 1;
  updateSummary(offerField.value);
});

// ---- Hero CTA buttons: jump straight to a specific offer, pre-selected ----
function goToOffer(offerKey) {
  selectOffer(offerKey);
  const card = document.querySelector('.offer-card[data-offer="' + offerKey + '"]');
  if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  return false; // prevent the default anchor jump so the smooth scroll above is the only one that runs
}

// ---- Coupon ----
applyCouponBtn.addEventListener('click', function () {
  if (!offerField.value) {
    couponMessage.textContent = 'اختاري عرض الأول قبل ما تفعّلي الكود.';
    couponMessage.className = 'coupon-message error';
    return;
  }

  const entered = couponInput.value.trim().toUpperCase();

  if (entered === COUPON_CODE) {
    couponApplied = true;
    couponMessage.textContent = 'تم تفعيل الكود بنجاح، خصم إضافي 15% 🎉';
    couponMessage.className = 'coupon-message success';
  } else {
    couponApplied = false;
    couponMessage.textContent = 'الكود غير صحيح أو منتهي الصلاحية.';
    couponMessage.className = 'coupon-message error';
  }

  updateSummary(offerField.value);
});

// ---- Order form ----
const form = document.getElementById('orderForm');
const formMessage = document.getElementById('formMessage');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  if (!offerField.value) {
    formMessage.textContent = 'من فضلك اختاري عرض من فوق الأول قبل تأكيد الطلب.';
    formMessage.className = 'form-message error';
    document.getElementById('offers').scrollIntoView({ behavior: 'smooth' });
    return;
  }

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const totals = computeOrderTotals(offerField.value, quantity);
  const lineTotal = totals ? totals.lineTotal : null;
  const shipping = totals ? totals.shipping : null;
  const discountPercent = totals ? totals.discountPercent : null;
  const subtotal = (lineTotal !== null && shipping !== null) ? lineTotal + shipping : null;
  const total = (subtotal !== null && couponApplied) ? Math.round(subtotal * (1 - COUPON_DISCOUNT)) : subtotal;

  const data = {
    eventId: 'order_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
    offer: offerField.value,
    // quantity is folded into the label so it shows up in the Google Sheet without needing to edit the Apps Script
    offerLabel: (offerLabels[offerField.value] || offerField.value) + (quantity > 1 ? ' (الكمية: ' + quantity + ')' : ''),
    quantity: quantity,
    price: lineTotal,
    discountPercent: discountPercent,
    shipping: shipping,
    couponApplied: couponApplied,
    total: total,
    name: form.name.value.trim(),
    phone: form.phone.value.trim(),
    governorate: form.governorate.value,
    address: form.address.value.trim(),
    timestamp: new Date().toISOString()
  };

  // send the order to the connected Google Sheet
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzyvclP3ma7KSbrA05xGojVDf470S8plyetSRo1OEWbOBsWG-ZnwE41rWmrLUz6tiLo/exec';
  const payload = JSON.stringify(data);

  console.log('Order submitted:', data);

  // save the order data locally in case you want to prefill/reference it on the thank-you page later
  try { sessionStorage.setItem('karseellLastOrder', payload); } catch (err) {}

  // sendBeacon is built for exactly this case: firing a request right before navigating away,
  // without the browser cancelling it mid-flight the way it can with a plain fetch().
  let sent = false;
  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: 'text/plain;charset=UTF-8' });
    sent = navigator.sendBeacon(GOOGLE_SCRIPT_URL, blob);
  }

  if (sent) {
    window.location.href = 'thankyou.html';
  } else {
    // fallback: wait for the fetch to actually finish before leaving the page
    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: payload
    }).catch(function (err) {
      console.error('Failed to send order to Google Sheet:', err);
    }).finally(function () {
      window.location.href = 'thankyou.html';
    });
  }
});
