// ========================
// THE RISING STARS — JS
// ========================

// PAGE LOADER
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 1200);
});

// NAVBAR SCROLL
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// HAMBURGER MENU
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// COUNTER ANIMATION
function animateCounters() {
  document.querySelectorAll('.hstat-num').forEach(el => {
    const target = parseInt(el.dataset.target);
    const duration = 1500;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current);
      if (current >= target) clearInterval(timer);
    }, 16);
  });
}

// SCROLL REVEAL
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.trek-card, .why-card, .review-card, .dep-card, .section-header')
  .forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

// Counter fires when hero stats section is visible
const heroObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    animateCounters();
    heroObserver.disconnect();
  }
}, { threshold: 0.5 });
const heroStats = document.querySelector('.hero-stats');
if (heroStats) heroObserver.observe(heroStats);

// ========= BOOKING MODAL =========
let currentPrice = 999;
let memberCount = 1;
let basePrice = 999;

function openBooking(name, price, date) {
  document.getElementById('modalTrekName').textContent = name;
  const priceNum = parseInt(price.replace(/[^0-9]/g, ''));
  basePrice = priceNum;
  memberCount = 1;
  document.getElementById('memberCount').textContent = 1;
  updateTotal();
  if (date) {
    // parse date hint for display
  }
  document.getElementById('bookingModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('bookingModal').classList.remove('active');
  document.body.style.overflow = '';
}

function changeMember(delta) {
  memberCount = Math.max(1, Math.min(20, memberCount + delta));
  document.getElementById('memberCount').textContent = memberCount;
  updateTotal();
}

function updateTotal() {
  const total = basePrice * memberCount;
  document.getElementById('modalTotal').textContent = '₹' + total.toLocaleString('en-IN');
}

function confirmBooking() {
  const name = document.querySelector('#bookingModal input[type="text"]').value;
  const phone = document.querySelector('#bookingModal input[type="tel"]').value;
  if (!name || !phone) {
    alert('Please fill in your name and phone number.');
    return;
  }
  closeModal();
  showToast('🎉 Booking request sent! We\'ll contact you shortly on WhatsApp.');
}

// ========= TOAST =========
function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  toast.style.cssText = `
    position:fixed; bottom:90px; left:50%; transform:translateX(-50%);
    background:var(--card); border:1px solid var(--orange); color:var(--text);
    padding:14px 24px; border-radius:12px; font-size:0.88rem; font-weight:500;
    z-index:9999; animation:toastIn 0.3s ease; max-width:90vw; text-align:center;
    box-shadow:0 8px 32px rgba(0,0,0,0.5);
  `;
  document.body.appendChild(toast);
  if (!document.getElementById('toastStyle')) {
    const s = document.createElement('style');
    s.id = 'toastStyle';
    s.textContent = '@keyframes toastIn{from{opacity:0;transform:translate(-50%,12px)}to{opacity:1;transform:translate(-50%,0)}}';
    document.head.appendChild(s);
  }
  setTimeout(() => toast.remove(), 4000);
}

// ========= CONTACT FORM =========
function handleContact(e) {
  e.preventDefault();
  showToast('✅ Message sent! We\'ll get back to you within 24 hours.');
  e.target.reset();
}

// Close modal on ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});
