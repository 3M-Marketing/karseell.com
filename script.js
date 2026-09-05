document.getElementById('year').textContent = new Date().getFullYear();

// ---- Offer selection ----
const offerLabels = {
  mask: 'الماسك لوحده',
  duo: 'الشامبو + البلسم',
  full: 'الباقة الكاملة'
};

const offerField = document.getElementById('offerField');
const selectedOfferLabel = document.getElementById('selectedOfferLabel');

document.querySelectorAll('.choose-offer').forEach(function (btn) {
  btn.addEventListener('click', function (e) {
    const card = btn.closest('.offer-card');
    const offerKey = card.getAttribute('data-offer');
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

  const data = {
    offer: offerField.value,
    offerLabel: offerLabels[offerField.value] || offerField.value,
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
