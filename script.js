document.getElementById('year').textContent = new Date().getFullYear();

// ---- Offer selection ----
const offerLabels = {
  mask: 'الماسك لوحده',
  duo: 'الشامبو + البلسم',
  full: 'الباقة الكاملة'
};

const offerDetails = {
  mask: { price: 599, shipping: 35 },
  duo: { price: 699, shipping: 35 },
  full: { price: 1199, shipping: 0 }
};

const offerField = document.getElementById('offerField');
const selectedOfferLabel = document.getElementById('selectedOfferLabel');

const allOfferCards = document.querySelectorAll('.offer-card');

document.querySelectorAll('.choose-offer').forEach(function (btn) {
  btn.addEventListener('click', function (e) {
    const card = btn.closest('.offer-card');
    const offerKey = card.getAttribute('data-offer');

    // move the highlighted/selected border to the clicked offer
    allOfferCards.forEach(function (c) { c.classList.remove('selected'); });
    card.classList.add('selected');

    offerField.value = offerKey;
    selectedOfferLabel.textContent = offerLabels[offerKey] || offerKey;
  });
});

// ---- Order form ----
const form = document.getElementById('orderForm');
const formMessage = document.getElementById('formMessage');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const details = offerDetails[offerField.value] || { price: null, shipping: null };

  const data = {
    offer: offerField.value,
    offerLabel: offerLabels[offerField.value] || offerField.value,
    price: details.price,
    shipping: details.shipping,
    total: (details.price !== null && details.shipping !== null) ? details.price + details.shipping : null,
    name: form.name.value.trim(),
    phone: form.phone.value.trim(),
    governorate: form.governorate.value,
    address: form.address.value.trim(),
    timestamp: new Date().toISOString()
  };

  // TODO: replace this with a fetch() call to your Google Apps Script Web App URL
  // once it's ready, e.g.:
  //
  // fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
  //   method: 'POST',
  //   body: JSON.stringify(data)
  // });

  console.log('Order submitted:', data);

  formMessage.textContent = 'تم استلام طلبك بنجاح، هنتواصل معاكِ قريبًا لتأكيد الطلب.';
  formMessage.className = 'form-message success';
  form.reset();
  offerField.value = 'full';
  selectedOfferLabel.textContent = offerLabels.full;
});
