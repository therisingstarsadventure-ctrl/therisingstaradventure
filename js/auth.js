// The Rising Stars - Authentication & Modal Controller

document.addEventListener('DOMContentLoaded', () => {
  initAuthUI();
  bindAuthModalEvents();
});

function initAuthUI() {
  const user = window.api.getCurrentUser();
  const navLinks = document.querySelector('.nav-links');
  const mobileNavMenu = document.querySelector('.mobile-nav-menu');

  if (!navLinks || !mobileNavMenu) return;

  // Remove existing auth buttons if any
  document.querySelectorAll('.auth-btn-nav, .admin-btn-nav, .my-bookings-btn-nav').forEach(el => el.remove());

  if (user) {
    // 1. User is Logged In
    
    // Add "My Bookings" link
    const myBookingsLi = document.createElement('li');
    myBookingsLi.className = 'my-bookings-btn-nav';
    myBookingsLi.innerHTML = `<a href="#" onclick="openMyBookingsModal(event)">My Bookings</a>`;
    navLinks.appendChild(myBookingsLi);

    const mbMobile = document.createElement('a');
    mbMobile.className = 'my-bookings-btn-nav';
    mbMobile.href = '#';
    mbMobile.textContent = 'My Bookings';
    mbMobile.onclick = (e) => { openMyBookingsModal(e); toggleMobileMenuClose(); };
    mobileNavMenu.appendChild(mbMobile);

    // If Admin/Leader, add Admin Dashboard link
    if (user.role === 'ADMIN' || user.role === 'LEADER') {
      const adminLi = document.createElement('li');
      adminLi.className = 'admin-btn-nav';
      adminLi.innerHTML = `<a href="admin.html" target="_blank" style="color:var(--accent-amber); font-weight:bold;">Dashboard</a>`;
      navLinks.appendChild(adminLi);

      const adminMobile = document.createElement('a');
      adminMobile.className = 'admin-btn-nav';
      adminMobile.href = 'admin.html';
      adminMobile.target = '_blank';
      adminMobile.style.color = 'var(--accent-amber)';
      adminMobile.style.fontWeight = 'bold';
      adminMobile.textContent = 'Dashboard';
      adminMobile.onclick = () => toggleMobileMenuClose();
      mobileNavMenu.appendChild(adminMobile);
    }

    // Add Logout link
    const logoutLi = document.createElement('li');
    logoutLi.className = 'auth-btn-nav';
    logoutLi.innerHTML = `<a href="#" onclick="handleLogout(event)" class="btn btn-secondary" style="padding: 6px 15px; font-size: 0.85rem; border-radius: 4px;">Logout (${user.name.split(' ')[0]})</a>`;
    navLinks.appendChild(logoutLi);

    const logoutMobile = document.createElement('a');
    logoutMobile.className = 'auth-btn-nav';
    logoutMobile.href = '#';
    logoutMobile.textContent = `Logout (${user.name.split(' ')[0]})`;
    logoutMobile.onclick = (e) => { handleLogout(e); toggleMobileMenuClose(); };
    mobileNavMenu.appendChild(logoutMobile);

  } else {
    // 2. User is Logged Out
    const loginLi = document.createElement('li');
    loginLi.className = 'auth-btn-nav';
    loginLi.innerHTML = `<a href="#" onclick="openAuthModal(event)" class="btn btn-primary" style="padding: 6px 18px; font-size: 0.85rem; border-radius: 4px; box-shadow:none;">Login</a>`;
    navLinks.appendChild(loginLi);

    const loginMobile = document.createElement('a');
    loginMobile.className = 'auth-btn-nav';
    loginMobile.href = '#';
    loginMobile.textContent = 'Login / Signup';
    loginMobile.onclick = (e) => { openAuthModal(e); toggleMobileMenuClose(); };
    mobileNavMenu.appendChild(loginMobile);
  }
}

function toggleMobileMenuClose() {
  const burger = document.querySelector('.hamburger');
  const menu = document.querySelector('.mobile-nav-menu');
  if (burger && menu) {
    burger.classList.remove('active');
    menu.classList.remove('active');
    burger.querySelectorAll('span').forEach(s => s.style.transform = 'none');
    burger.querySelectorAll('span')[1].style.opacity = '1';
  }
}

// Global modal triggers
window.openAuthModal = function(e) {
  if (e) e.preventDefault();
  const modal = document.getElementById('global-auth-modal');
  if (modal) {
    modal.classList.add('open');
    document.body.classList.add('modal-open');
    showLoginForm(); // Default view
  }
};

window.handleLogout = function(e) {
  if (e) e.preventDefault();
  window.api.clearToken();
  initAuthUI();
  // If we are on the admin page, redirect to home
  if (window.location.pathname.includes('admin.html')) {
    window.location.href = 'index.html';
  } else {
    window.location.reload();
  }
};

// Bind form toggles inside Auth Modal
function bindAuthModalEvents() {
  const modal = document.getElementById('global-auth-modal');
  const closeBtn = document.getElementById('auth-modal-close-btn');

  if (!modal || !closeBtn) return;

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('open');
      document.body.classList.remove('modal-open');
    }
  });

  // Login Form Submission
  const loginForm = document.getElementById('login-form-el');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const errorMsg = document.getElementById('login-error-msg');

      errorMsg.textContent = '';
      try {
        await window.api.login(email, password);
        modal.classList.remove('open');
        document.body.classList.remove('modal-open');
        initAuthUI();
        window.location.reload(); // Refresh to update booking forms
      } catch (err) {
        errorMsg.textContent = err.message || 'Login failed. Please check credentials.';
      }
    });
  }

  // Signup Form Submission
  const signupForm = document.getElementById('signup-form-el');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('signup-name').value;
      const email = document.getElementById('signup-email').value;
      const phone = document.getElementById('signup-phone').value;
      const password = document.getElementById('signup-password').value;
      const errorMsg = document.getElementById('signup-error-msg');

      errorMsg.textContent = '';
      try {
        await window.api.register(name, email, phone, password);
        modal.classList.remove('open');
        document.body.classList.remove('modal-open');
        initAuthUI();
        window.location.reload();
      } catch (err) {
        errorMsg.textContent = err.message || 'Registration failed.';
      }
    });
  }
}

window.showSignupForm = function() {
  document.getElementById('login-form-wrap').style.display = 'none';
  document.getElementById('signup-form-wrap').style.display = 'block';
};

window.showLoginForm = function() {
  document.getElementById('signup-form-wrap').style.display = 'none';
  document.getElementById('login-form-wrap').style.display = 'block';
};

// Customer bookings list
window.openMyBookingsModal = async function(e) {
  if (e) e.preventDefault();
  const modal = document.getElementById('my-bookings-modal');
  if (!modal) return;

  modal.classList.add('open');
  document.body.classList.add('modal-open');

  const container = document.getElementById('bookings-list-container');
  container.innerHTML = '<div class="booking-loading">Loading bookings...</div>';

  try {
    const bookings = await window.api.getMyBookings();
    if (bookings.length === 0) {
      container.innerHTML = '<div class="no-bookings-view">You do not have any bookings yet. Start exploring treks above!</div>';
      return;
    }

    container.innerHTML = bookings.map(b => {
      const trekName = b.trip.trek.title;
      const travelDate = new Date(b.trip.date).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
      const bookingDate = new Date(b.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
      
      let statusClass = 'booking-status-pending';
      if (b.status === 'CONFIRMED') statusClass = 'booking-status-confirmed';
      if (b.status === 'CANCELLED') statusClass = 'booking-status-cancelled';

      const payment = b.payments && b.payments.length > 0 ? b.payments[0] : null;
      let paymentStatusHTML = '';

      if (b.status === 'CANCELLED') {
        paymentStatusHTML = `<span class="pay-badge pay-cancelled">N/A</span>`;
      } else if (payment && payment.paymentStatus === 'PAID') {
        paymentStatusHTML = `<span class="pay-badge pay-paid">PAID (UPI)</span>`;
      } else {
        paymentStatusHTML = `
          <button class="pay-action-btn" onclick="openPaymentGatewayModal(${b.id}, ${b.totalAmount})">
            Pay Now (₹${b.totalAmount.toLocaleString()})
          </button>
        `;
      }

      // Generate tracking link HTML if trip is active or starting and booking is confirmed
      let trackingLinkHTML = '';
      if (b.status === 'CONFIRMED' && ['STARTING', 'ON_ROUTE', 'REACHED_DESTINATION', 'RETURNING'].includes(b.trip.status)) {
        trackingLinkHTML = `
          <div class="tracking-alert-banner">
            🟢 <strong>Live Tracking Active:</strong> Parents can follow the trek group live.
            <a href="track.html?tripId=${b.tripId}&token=${b.trip.trackingToken}" target="_blank" class="track-parent-btn">
              Open Live Map ➔
            </a>
          </div>
        `;
      } else if (b.status === 'CONFIRMED') {
        trackingLinkHTML = `
          <div class="tracking-upcoming-banner">
            🔒 <strong>Secure Parent Tracking Code:</strong> Save this link for trek day:<br>
            <code>${window.location.origin}/track.html?tripId=${b.tripId}&token=${b.trip.trackingToken}</code>
          </div>
        `;
      }

      return `
        <div class="booking-row-card">
          <div class="booking-card-main">
            <div>
              <h4 class="booking-trek-title">${trekName}</h4>
              <div class="booking-row-meta">
                <span>📅 Travel: <strong>${travelDate}</strong></span>
                <span>👥 Members: <strong>${b.members}</strong></span>
                <span>🛒 Booked On: ${bookingDate}</span>
              </div>
            </div>
            <div style="text-align: right; min-width: 150px;">
              <div style="margin-bottom: 5px;">
                Status: <span class="booking-status-badge ${statusClass}">${b.status}</span>
              </div>
              <div style="font-size: 0.95rem; font-weight: bold; color: var(--text-muted); margin-bottom: 8px;">
                ₹${b.totalAmount.toLocaleString()}
              </div>
              <div>
                ${paymentStatusHTML}
              </div>
            </div>
          </div>
          ${trackingLinkHTML}
        </div>
      `;
    }).join('');

  } catch (error) {
    container.innerHTML = `<div class="booking-error-msg">Error loading bookings: ${error.message}</div>`;
  }
};

window.closeMyBookingsModal = function() {
  const modal = document.getElementById('my-bookings-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
  }
};

// Simulation Payment Gateway Modal
let currentPayingBookingId = null;
let currentPayingAmount = 0;

window.openPaymentGatewayModal = function(bookingId, amount) {
  currentPayingBookingId = bookingId;
  currentPayingAmount = amount;
  
  const modal = document.getElementById('simulation-payment-modal');
  if (!modal) return;

  // Set values
  document.getElementById('pay-modal-amount').textContent = `₹${amount.toLocaleString()}`;
  document.getElementById('pay-txn-id').value = `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  document.getElementById('pay-error-msg').textContent = '';

  modal.classList.add('open');
  
  // Close bookings modal backdrop block (z-index ordering helper)
  const bookingsModal = document.getElementById('my-bookings-modal');
  if (bookingsModal) bookingsModal.style.zIndex = '999';
};

window.closePaymentGatewayModal = function() {
  const modal = document.getElementById('simulation-payment-modal');
  if (modal) {
    modal.classList.remove('open');
  }
  
  const bookingsModal = document.getElementById('my-bookings-modal');
  if (bookingsModal) bookingsModal.style.zIndex = '1000';
};

// Form submit handler for simulated payments
document.addEventListener('DOMContentLoaded', () => {
  const payForm = document.getElementById('payment-simulation-form');
  if (payForm) {
    payForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentPayingBookingId) return;

      const method = document.getElementById('pay-method').value;
      const txnId = document.getElementById('pay-txn-id').value;
      const errorMsg = document.getElementById('pay-error-msg');

      errorMsg.textContent = '';
      try {
        await window.api.processPayment(currentPayingBookingId, currentPayingAmount, method, txnId);
        
        // Success
        closePaymentGatewayModal();
        alert('Payment processed successfully! Booking confirmed.');
        
        // Refresh bookings modal
        openMyBookingsModal();
      } catch (err) {
        errorMsg.textContent = err.message || 'Payment simulation failed.';
      }
    });
  }
});
