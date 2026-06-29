// The Rising Stars - Authentication & Modal Controller

document.addEventListener('DOMContentLoaded', () => {
  initAuthUI();
  bindAuthModalEvents();
});

function initAuthUI() {
  const user = window.api.getCurrentUser();
  const navLinks = document.querySelector('.nav-links');

  if (!navLinks) return;

  // Remove existing auth buttons if any
  document.querySelectorAll('.auth-btn-nav, .admin-btn-nav, .my-bookings-btn-nav').forEach(el => el.remove());

  if (user) {
    // 1. User is Logged In
    
    // Add "My Bookings" link
    const myBookingsLi = document.createElement('li');
    myBookingsLi.className = 'my-bookings-btn-nav';
    myBookingsLi.innerHTML = `<a href="#" onclick="openMyBookingsModal(event)">My Bookings</a>`;
    navLinks.appendChild(myBookingsLi);

    // If Admin/Leader, add Admin Dashboard link
    if (user.role === 'ADMIN' || user.role === 'LEADER') {
      const adminLi = document.createElement('li');
      adminLi.className = 'admin-btn-nav';
      adminLi.innerHTML = `<a href="admin.html" target="_blank" style="color:var(--accent-amber); font-weight:bold;">Dashboard</a>`;
      navLinks.appendChild(adminLi);
    }

    // Add Logout link
    const logoutLi = document.createElement('li');
    logoutLi.className = 'auth-btn-nav';
    logoutLi.innerHTML = `<a href="#" onclick="handleLogout(event)" class="btn btn-secondary" style="padding: 6px 15px; font-size: 0.85rem; border-radius: 4px;">Logout (${user.name.split(' ')[0]})</a>`;
    navLinks.appendChild(logoutLi);

  } else {
    // 2. User is Logged Out
    const loginLi = document.createElement('li');
    loginLi.className = 'auth-btn-nav';
    loginLi.innerHTML = `<a href="#" onclick="openAuthModal(event)" class="btn btn-primary" style="padding: 6px 18px; font-size: 0.85rem; border-radius: 4px; box-shadow:none;">Login / Signup</a>`;
    navLinks.appendChild(loginLi);
  }
}

function toggleMobileMenuClose() {
  const burger = document.querySelector('.hamburger');
  const menu = document.querySelector('.nav-links');
  if (burger && menu) {
    burger.classList.remove('active');
    menu.classList.remove('open');
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
      if (['CONFIRMED', 'CHECKED_IN', 'ON_TRIP'].includes(b.status)) statusClass = 'booking-status-confirmed';
      if (b.status === 'COMPLETED') statusClass = 'booking-status-completed';
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

      // Generate tracking link HTML if trip is active and booking is confirmed
      let trackingLinkHTML = '';
      const isBooked = ['CONFIRMED', 'CHECKED_IN', 'ON_TRIP'].includes(b.status);
      const isLiveTrip = ['STARTING', 'ON_ROUTE', 'REACHED_DESTINATION', 'RETURNING'].includes(b.trip.status);

      if (isBooked && isLiveTrip) {
        trackingLinkHTML = `
          <div class="tracking-alert-banner">
            🟢 <strong>Live Tracking Active:</strong> Parents can follow the trek group live.
            <a href="track.html?tripId=${b.tripId}&token=${b.trip.trackingToken}" target="_blank" class="track-parent-btn">
              Open Live Map ➔
            </a>
          </div>
        `;
      } else if (isBooked) {
        trackingLinkHTML = `
          <div class="tracking-upcoming-banner">
            🔒 <strong>Secure Parent Tracking Code:</strong> Save this link for trek day:<br>
            <code>${window.location.origin}/track.html?tripId=${b.tripId}&token=${b.trip.trackingToken}</code>
          </div>
        `;
      }

      // Invoice & Photo Downloads for Completed departures
      let completedActionsHTML = '';
      if (b.status === 'COMPLETED') {
        completedActionsHTML = `
          <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; gap: 10px;">
            <button class="pay-action-btn" style="background:rgba(255,255,255,0.03); color:#fff; border:1px solid var(--glass-border);" onclick="downloadInvoice(${b.id}, '${trekName}', '${travelDate}', ${b.members}, ${b.totalAmount})">
              📄 Download Invoice
            </button>
            <button class="pay-action-btn" style="background:var(--primary); color:#000;" onclick="viewTripPhotosPopup('${b.tripId}')">
              🖼️ Download Trip Photos
            </button>
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
          ${completedActionsHTML}
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
  document.getElementById('payment-amount-val').textContent = `₹${amount.toLocaleString('en-IN')}`;
  document.getElementById('payment-booking-id').textContent = `#${bookingId}`;

  modal.classList.add('open');
  
  // Bind simple actions
  document.getElementById('btn-payment-success').onclick = async () => {
    try {
      const txnId = `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      await window.api.processPayment(bookingId, amount, 'UPI', txnId);
      modal.classList.remove('open');
      alert('Payment processed successfully! Booking confirmed.');
      
      // Refresh
      openMyBookingsModal();
    } catch (err) {
      alert('Payment failed: ' + err.message);
    }
  };

  document.getElementById('btn-payment-failed').onclick = () => {
    modal.classList.remove('open');
    alert('Payment transaction cancelled.');
  };
};

window.closePaymentGatewayModal = function() {
  const modal = document.getElementById('simulation-payment-modal');
  if (modal) {
    modal.classList.remove('open');
  }
};

// Invoice Generator
window.downloadInvoice = function(bookingId, trekName, travelDate, members, amount) {
  const invoiceWindow = window.open('', '_blank');
  
  const invoiceHtml = `
    <html>
    <head>
      <title>Invoice - Booking #${bookingId}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 40px; }
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #FF8A00; padding-bottom: 20px; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #FF8A00; }
        .meta { text-align: right; }
        .table { width: 100%; border-collapse: collapse; margin-top: 30px; }
        .table th { background: #f8f8f8; text-align: left; padding: 12px; border-bottom: 2px solid #eee; }
        .table td { padding: 12px; border-bottom: 1px solid #eee; }
        .total { text-align: right; font-size: 1.25rem; font-weight: bold; margin-top: 30px; }
        .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
        @media print {
          body { padding: 0; }
          .invoice-box { border: none; box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <div class="header">
          <div>
            <div class="logo">THE RISING STARS</div>
            <div>Maharashtra's #1 Adventure Company</div>
            <div>info@therisingstarsadventures.org</div>
          </div>
          <div class="meta">
            <div><strong>Invoice ID:</strong> #TRS-${bookingId}</div>
            <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</div>
          </div>
        </div>
        
        <h3>Booking Roster Confirmation</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Adventure Description</th>
              <th>Date of Travel</th>
              <th>Heads</th>
              <th>Total Amount Paid</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${trekName}</strong></td>
              <td>${travelDate}</td>
              <td>${members} Pax</td>
              <td>₹${amount.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="total">Total Paid: ₹${amount.toLocaleString()}</div>
        
        <div class="footer">
          Thank you for choosing The Rising Stars. Adventure begins where comfort ends!<br>
          This is a system generated e-invoice. No signature required.
        </div>
      </div>
      <script>window.print();<\/script>
    </body>
    </html>
  `;
  
  invoiceWindow.document.write(invoiceHtml);
  invoiceWindow.document.close();
};

// Completed trip photos visualizer popup
window.viewTripPhotosPopup = async function(tripId) {
  try {
    const photos = await window.api.getTripPhotos(tripId);
    
    // Create floating modal overlay dynamically
    const overlay = document.createElement('div');
    overlay.className = 'auth-modal-overlay open';
    overlay.style.zIndex = '2000';
    
    if (photos.length === 0) {
      overlay.innerHTML = `
        <div class="auth-modal-content" style="max-width: 400px; text-align: center; padding: 40px 30px;">
          <h2 style="font-family:'Poppins'; margin-bottom:15px;">Trip Memories</h2>
          <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:20px;">
            The trip leader has not uploaded memory photos for this departure yet. Please check back later!
          </p>
          <button class="btn" onclick="this.closest('.auth-modal-overlay').remove()">Close Window</button>
        </div>
      `;
    } else {
      overlay.innerHTML = `
        <div class="auth-modal-content" style="max-width: 550px; padding: 30px;">
          <button class="auth-modal-close" onclick="this.closest('.auth-modal-overlay').remove()">&times;</button>
          <h2 style="font-family:'Poppins'; font-weight:800; font-size:1.8rem; margin-bottom:5px;">Adventure Memories</h2>
          <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:20px;">
            Here are the photos from your completed trek departure! Right click and save to download them.
          </p>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; max-height:350px; overflow-y:auto; padding-right:5px;">
            ${photos.map(p => `
              <a href="${p.url}" target="_blank" style="display:block;">
                <img src="${p.url}" style="width:100%; border-radius:6px; border:1px solid rgba(255,255,255,0.05); display:block; transition:transform 0.3s;" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    document.body.appendChild(overlay);
  } catch (err) {
    alert('Failed to load photos: ' + err.message);
  }
};
