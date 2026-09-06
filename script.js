document.getElementById('year').textContent = new Date().getFullYear();

// ---- Offer data ----
const offerLabels = {
  mask: 'الماسك لوحده',
  duo: 'الشامبو + البلسم',
  full: 'الباقة الكاملة'
};

const offerDetails = {
  mask: { price: 599, shipping: 35, discountPercent: 53 },
  duo: { price: 699, shipping: 35, discountPercent: 70 },
  full: { price: 1199, shipping: 0, discountPercent: 67 }
};

const COUPON_CODE = 'KARSEELL15';
const COUPON_DISCOUNT = 0.15;

const offerField = document.getElementById('offerField');
const selectedOfferLabel = document.getElementById('selectedOfferLabel');
const allOfferCards = document.querySelectorAll('.offer-card');

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

let couponApplied = false;

function updateSummary(offerKey) {
  const details = offerDetails[offerKey];
  if (!details) return;

  orderSummary.hidden = false;
  summaryOfferName.textContent = offerLabels[offerKey] || offerKey;
  summaryPrice.textContent = details.price + ' جنيه';
  summaryDiscount.textContent = 'خصم ' + details.discountPercent + '%';

  if (details.shipping === 0) {
    summaryShipping.textContent = 'شحن مجاني';
    summaryShipping.classList.add('summary-free');
  } else {
    summaryShipping.textContent = details.shipping + ' جنيه';
    summaryShipping.classList.remove('summary-free');
  }

  const subtotal = details.price + details.shipping;
  const total = couponApplied ? Math.round(subtotal * (1 - COUPON_DISCOUNT)) : subtotal;
  summaryTotal.textContent = total + ' جنيه';
}

document.querySelectorAll('.choose-offer').forEach(function (btn) {
  btn.addEventListener('click', function (e) {
    const card = btn.closest('.offer-card');
    const offerKey = card.getAttribute('data-offer');

    // move the highlighted/selected border to the clicked offer
    allOfferCards.forEach(function (c) { c.classList.remove('selected'); });
    card.classList.add('selected');

    offerField.value = offerKey;
    selectedOfferLabel.textContent = offerLabels[offerKey] || offerKey;

    updateSummary(offerKey);
  });
});

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

  const details = offerDetails[offerField.value] || { price: null, shipping: null, discountPercent: null };
  const subtotal = (details.price !== null && details.shipping !== null) ? details.price + details.shipping : null;
  const total = (subtotal !== null && couponApplied) ? Math.round(subtotal * (1 - COUPON_DISCOUNT)) : subtotal;

  const data = {
    offer: offerField.value,
    offerLabel: offerLabels[offerField.value] || offerField.value,
    price: details.price,
    discountPercent: details.discountPercent,
    shipping: details.shipping,
    couponApplied: couponApplied,
    total: total,
    name: form.name.value.trim(),
    phone: form.phone.value.trim(),
    governorate: form.governorate.value,
    address: form.address.value.trim(),
    timestamp: new Date().toISOString()
  };

  // send the order to the connected Google Sheet
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx4w8oiz_lXrGTJijUuUzwCXSZkkmhsejhJjCfHoD3YK6qVxQVc1QEgWcqI5af7o2tiaQ/exec';
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
