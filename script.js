// تهيئة AOS
AOS.init({ 
  duration: 800, 
  once: true, 
  easing: 'ease-out-cubic' 
});

// ===== تهيئة Firebase =====
// استبدل هذه المعلومات بمشروع Firebase الخاص بك
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// تهيئة Firebase
let db;
try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

// ===== دالة عرض Toast =====
function showToast(message, isSuccess = true) {
  const toast = document.getElementById('liveToast');
  toast.style.display = 'block';
  toast.textContent = message || (isSuccess ? '✅ تم الإرسال بنجاح' : '❌ حدث خطأ');
  toast.style.background = isSuccess ? 'var(--secondary)' : '#ef4444';
  
  setTimeout(() => {
    toast.style.display = 'none';
  }, 4000);
}

// ===== دالة حفظ البيانات في Firebase =====
async function saveToFirestore(collectionName, data) {
  // إذا لم يتم تهيئة Firebase بنجاح
  if (!db) {
    console.log('⚠️ Firebase not initialized -模拟保存:', { collectionName, data });
    showToast('✅ تم التسجيل (بيئة تجريبية)', true);
    return true;
  }
  
  try {
    // إضافة توقيت للبيانات
    const dataWithTimestamp = {
      ...data,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      userAgent: navigator.userAgent
    };
    
    // حفظ في Firestore
    await db.collection(collectionName).add(dataWithTimestamp);
    console.log(`✅ Data saved to ${collectionName}:`, data);
    showToast('✅ تم الحفظ بنجاح في Firebase', true);
    return true;
  } catch (error) {
    console.error('❌ Error saving to Firestore:', error);
    showToast('❌ فشل الحفظ: ' + error.message, false);
    return false;
  }
}

// ===== إضافة مستمعين للنماذج =====
document.addEventListener('DOMContentLoaded', function() {
  
  // منع الإرسال التقليدي لجميع النماذج
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
    });
  });
  
  // ===== نموذج العميل المبكر =====
  const clientForm = document.getElementById('clientFormElement');
  if (clientForm) {
    clientForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const name = document.getElementById('clientName')?.value.trim();
      const phone = document.getElementById('clientPhone')?.value.trim();
      const email = document.getElementById('clientEmail')?.value.trim();
      const agree = document.getElementById('clientAgree')?.checked;
      
      // التحقق من الحقول
      if (!name || !phone || !email || !agree) {
        showToast('❌ الرجاء ملء جميع الحقول والموافقة على الشروط', false);
        return;
      }
      
      // التحقق من البريد الإلكتروني
      if (!email.includes('@') || !email.includes('.')) {
        showToast('❌ الرجاء إدخال بريد إلكتروني صحيح', false);
        return;
      }
      
      // حفظ البيانات
      const success = await saveToFirestore('early_clients', {
        name,
        phone,
        email,
        agree: true,
        formType: 'عميل مبكر'
      });
      
      if (success) {
        // إعادة تعيين النموذج
        document.getElementById('clientName').value = '';
        document.getElementById('clientPhone').value = '';
        document.getElementById('clientEmail').value = '';
        document.getElementById('clientAgree').checked = false;
      }
    });
  }
  
  // ===== نموذج السائق =====
  const driverForm = document.getElementById('driverFormElement');
  if (driverForm) {
    driverForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const name = document.getElementById('driverName')?.value.trim();
      const phone = document.getElementById('driverPhone')?.value.trim();
      const city = document.getElementById('driverCity')?.value;
      const id = document.getElementById('driverId')?.value.trim();
      
      if (!name || !phone || !city || !id) {
        showToast('❌ الرجاء ملء جميع الحقول', false);
        return;
      }
      
      if (city === '') {
        showToast('❌ الرجاء اختيار المدينة', false);
        return;
      }
      
      const success = await saveToFirestore('drivers', {
        name,
        phone,
        city,
        idNumber: id,
        formType: 'سائق'
      });
      
      if (success) {
        document.getElementById('driverName').value = '';
        document.getElementById('driverPhone').value = '';
        document.getElementById('driverId').value = '';
        document.getElementById('driverCity').value = '';
      }
    });
  }
  
  // ===== نموذج مزود الخدمة =====
  const providerForm = document.getElementById('providerFormElement');
  if (providerForm) {
    providerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const name = document.getElementById('providerName')?.value.trim();
      const phone = document.getElementById('providerPhone')?.value.trim();
      const type = document.getElementById('providerType')?.value;
      const city = document.getElementById('providerCity')?.value.trim();
      
      if (!name || !phone || !type || !city) {
        showToast('❌ الرجاء ملء جميع الحقول', false);
        return;
      }
      
      if (type === '') {
        showToast('❌ الرجاء اختيار نوع الخدمة', false);
        return;
      }
      
      const success = await saveToFirestore('service_providers', {
        name,
        phone,
        serviceType: type,
        city,
        formType: 'مزود خدمة'
      });
      
      if (success) {
        document.getElementById('providerName').value = '';
        document.getElementById('providerPhone').value = '';
        document.getElementById('providerCity').value = '';
        document.getElementById('providerType').value = '';
      }
    });
  }
  
  // ===== نموذج التواصل =====
  const contactForm = document.getElementById('contactFormElement');
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const name = document.getElementById('contactName')?.value.trim();
      const email = document.getElementById('contactEmail')?.value.trim();
      const message = document.getElementById('contactMsg')?.value.trim();
      
      if (!name || !email || !message) {
        showToast('❌ الرجاء ملء جميع الحقول', false);
        return;
      }
      
      if (!email.includes('@') || !email.includes('.')) {
        showToast('❌ الرجاء إدخال بريد إلكتروني صحيح', false);
        return;
      }
      
      const success = await saveToFirestore('contacts', {
        name,
        email,
        message,
        formType: 'تواصل'
      });
      
      if (success) {
        document.getElementById('contactName').value = '';
        document.getElementById('contactEmail').value = '';
        document.getElementById('contactMsg').value = '';
      }
    });
  }
  
  // ===== روابط التنقل السلس =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});