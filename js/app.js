// The Rising Stars - Core Application & Scroll Controller
let activeTreksData = TREKS_DATA;

document.addEventListener('DOMContentLoaded', () => {
  // Hook up newsletter form
  initNewsletterForm();
  
  // Register GSAP ScrollTrigger if loaded
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Initialize luxury cursor & animations
  initCustomCursor();
  initHeroCinematic();

  // Initialize all modular elements
  initMobileMenu();
  initSunScroll();
  initStatsCounter();
  initFeaturedTreksFilter();
  initTrekDetailModal();
  initRealStoriesLightbox();
  initHorizontalGallery();
  initTestimonialsCarousel();
  initTrustBlocksDraw();
  setupSmoothScrolling();
  initStarDustTrail();
  initScrollReveals();
});


/* --- MOBILE BURGER MENU CONTROLLER --- */
function initMobileMenu() {
  const burger = document.querySelector('.hamburger');
  const menu = document.querySelector('.mobile-nav-menu');
  const links = document.querySelectorAll('.mobile-nav-menu a');

  if (!burger || !menu) return;

  burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    menu.classList.toggle('active');
    
    // Animate hamburger lines
    const spans = burger.querySelectorAll('span');
    if (burger.classList.contains('active')) {
      spans[0].style.transform = 'rotate(45deg) translate(6px, 5deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(6px, -5deg)';
    } else {
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    }
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('active');
      menu.classList.remove('active');
      burger.querySelectorAll('span').forEach(s => s.style.transform = 'none');
      burger.querySelectorAll('span')[1].style.opacity = '1';
    });
  });
}

/* --- SUN SCROLL PHYSICS ENGINE --- */
function initSunScroll() {
  const skyBg = document.querySelector('.sky-scroll-bg');
  if (!skyBg) return;

  // Let's define the sky colors for different stages of the scroll
  // Colors represent: [sky-color-top, sky-color-bottom, stars-opacity, mountain-tint]
  const skyStages = [
    { pct: 0.0, top: '#030305', bottom: '#0b0c13', stars: 0.95, mountain: '#070709', scale: 1.0 },   // 0%: Night
    { pct: 0.25, top: '#120d24', bottom: '#090710', stars: 0.80, mountain: '#0c0b12', scale: 1.05 }, // 25%: Deep Twilight
    { pct: 0.50, top: '#cf3c00', bottom: '#f59e0b', stars: 0.00, mountain: '#120703', scale: 1.15 }, // 50%: Sunrise Orange
    { pct: 0.75, top: '#ea580c', bottom: '#fbbf24', stars: 0.00, mountain: '#1a0d03', scale: 1.25 }, // 75%: Warm Dawn Amber
    { pct: 1.00, top: '#1a365d', bottom: '#3b82f6', stars: 0.00, mountain: '#091524', scale: 1.30 }  // 100%: Afternoon Mountain Blue
  ];

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    
    // Percent scroll calculated between 0 and 1
    const scrollPct = Math.min(Math.max(scrollTop / docHeight, 0), 1);

    // 1. Find sky stages to interpolate between
    let lowerStage = skyStages[0];
    let upperStage = skyStages[skyStages.length - 1];

    for (let i = 0; i < skyStages.length - 1; i++) {
      if (scrollPct >= skyStages[i].pct && scrollPct <= skyStages[i + 1].pct) {
        lowerStage = skyStages[i];
        upperStage = skyStages[i + 1];
        break;
      }
    }

    // Interpolation ratio between stages
    const range = upperStage.pct - lowerStage.pct;
    const ratio = range === 0 ? 0 : (scrollPct - lowerStage.pct) / range;

    // Interpolate colors helper
    const interpolateColor = (color1, color2, factor) => {
      const hex = c => {
        const s = c.toString(16);
        return s.length === 1 ? '0' + s : s;
      };
      
      const r1 = parseInt(color1.substring(1, 3), 16);
      const g1 = parseInt(color1.substring(3, 5), 16);
      const b1 = parseInt(color1.substring(5, 7), 16);

      const r2 = parseInt(color2.substring(1, 3), 16);
      const g2 = parseInt(color2.substring(3, 5), 16);
      const b2 = parseInt(color2.substring(5, 7), 16);

      const r = Math.round(r1 + factor * (r2 - r1));
      const g = Math.round(g1 + factor * (g2 - g1));
      const b = Math.round(b1 + factor * (b2 - b1));

      return `#${hex(r)}${hex(g)}${hex(b)}`;
    };

    // Calculate dynamic values
    const currentTop = interpolateColor(lowerStage.top, upperStage.top, ratio);
    const currentBottom = interpolateColor(lowerStage.bottom, upperStage.bottom, ratio);
    const currentMountain = interpolateColor(lowerStage.mountain, upperStage.mountain, ratio);
    const currentStars = lowerStage.stars + ratio * (upperStage.stars - lowerStage.stars);
    const currentScale = lowerStage.scale + ratio * (upperStage.scale - lowerStage.scale);

    // Calculate Sun vertical coordinate (translateY)
    // Starts low at 85% viewport, rises up to 10% viewport height
    const sunYPercent = 85 - (scrollPct * 75); 
    const sunGlowRadius = 30 + (scrollPct * 40); // Glow widens

    // Update CSS variables globally
    document.documentElement.style.setProperty('--sky-color-top', currentTop);
    document.documentElement.style.setProperty('--sky-color-bottom', currentBottom);
    document.documentElement.style.setProperty('--mountains-tint', currentMountain);
    document.documentElement.style.setProperty('--stars-opacity', currentStars);
    document.documentElement.style.setProperty('--sun-scale', currentScale);
    document.documentElement.style.setProperty('--sun-y', `${sunYPercent}%`);
    document.documentElement.style.setProperty('--sun-glow', `${sunGlowRadius}px`);
  });
}

/* --- STATS BAR NUMBER COUNT-UP --- */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-num');
  if (statNumbers.length === 0) return;

  const runCounter = (el) => {
    const targetAttr = el.getAttribute('data-target');
    const isFloat = targetAttr.includes('.');
    const target = parseFloat(targetAttr);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000; // ms
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing out function (quad)
      const easeProgress = progress * (2 - progress);
      const currentVal = easeProgress * target;
      
      let formattedVal;
      if (isFloat) {
        // Show one decimal place for decimals
        formattedVal = currentVal.toFixed(1);
      } else {
        formattedVal = Math.floor(currentVal).toLocaleString();
      }

      el.textContent = formattedVal + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = (isFloat ? target.toFixed(1) : Math.floor(target).toLocaleString()) + suffix;
      }
    };

    requestAnimationFrame(update);
  };

  // Intersection Observer to trigger counter when visible
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(num => observer.observe(num));
  } else {
    // Fallback if observer is not supported
    statNumbers.forEach(num => {
      const target = num.getAttribute('data-target');
      const suffix = num.getAttribute('data-suffix') || '';
      num.textContent = target + suffix;
    });
  }
}

/* --- FEATURED TREKS FILTER TABS GRID --- */
function initFeaturedTreksFilter() {
  const tabs = document.querySelectorAll('.filter-tab');
  const grid = document.getElementById('featured-treks-grid');
  if (!grid) return;

  // Render initial grid from activeTreksData
  renderTrekCards(activeTreksData);

  // Attempt to fetch from API in background, update grid dynamically on load
  window.api.getPackages()
    .then(packages => {
      if (packages && packages.length > 0) {
        activeTreksData = packages.map(p => {
          let gallery = [];
          try {
            gallery = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
          } catch(e) {
            gallery = [p.images || 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=600&q=80'];
          }
          return {
            id: p.id,
            name: p.title,
            zone: p.zone,
            zoneLabel: p.zone === 'maharashtra' ? 'Sahyadris' : p.zone === 'mp' ? 'Satpura' : 'Himalayas',
            difficulty: p.difficulty || 'Easy',
            duration: p.duration || '1 Day',
            elevation: p.elevation || 'N/A',
            price: `₹${p.price.toLocaleString('en-IN')}`,
            gallery: gallery,
            meetingPoint: p.meetingPoint,
            bestSeason: p.bestSeason,
            description: p.description
          };
        });
        renderTrekCards(activeTreksData);
      }
    })
    .catch(err => {
      console.warn('Backend is offline. Running frontend on static local TREKS_DATA.', err);
    });

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Toggle tab active
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');
      
      // Filter list
      let filteredData = activeTreksData;
      if (filter !== 'all') {
        if (['mp', 'maharashtra', 'himachal'].includes(filter)) {
          // Filter by zone
          filteredData = activeTreksData.filter(t => t.zone === filter);
        } else {
          // Filter by tag (e.g. waterfall, snow, jungle)
          filteredData = activeTreksData.filter(t => t.tags && t.tags.some(tag => tag.toLowerCase() === filter.toLowerCase()));
        }
      }

      // Animate grid change
      if (typeof gsap !== 'undefined') {
        gsap.to(grid.children, {
          opacity: 0,
          scale: 0.8,
          duration: 0.3,
          stagger: 0.05,
          onComplete: () => {
            renderTrekCards(filteredData);
            gsap.fromTo(grid.children, 
              { opacity: 0, scale: 0.8, y: 20 },
              { opacity: 1, scale: 1, y: 0, duration: 0.4, stagger: 0.05 }
            );
          }
        });
      } else {
        renderTrekCards(filteredData);
      }
    });
  });
}

function renderTrekCards(data) {
  const grid = document.getElementById('featured-treks-grid');
  if (!grid) return;

  if (data.length === 0) {
    grid.innerHTML = '<div class="no-treks">No treks found in this category.</div>';
    return;
  }

  const getVideoSrc = (zone) => {
    if (zone === 'maharashtra') return 'https://assets.mixkit.co/videos/preview/mixkit-small-waterfall-in-a-lush-forest-42867-large.mp4';
    if (zone === 'mp') return 'https://assets.mixkit.co/videos/preview/mixkit-wind-blowing-through-green-forest-canopy-42848-large.mp4';
    return 'https://assets.mixkit.co/videos/preview/mixkit-mountain-peaks-covered-in-snow-42844-large.mp4';
  };

  const getTerrainSvg = (diff) => {
    const diffLower = diff.toLowerCase();
    if (diffLower === 'beginner' || diffLower === 'easy') {
      return `<svg viewBox="0 0 240 35"><path d="M0,35 Q30,28 60,32 T120,25 T180,33 T240,30" fill="none" stroke="var(--accent-green)" stroke-width="2"></path></svg>`;
    } else if (diffLower === 'moderate') {
      return `<svg viewBox="0 0 240 35"><path d="M0,35 Q25,20 50,30 T100,10 T150,25 T200,8 T240,30" fill="none" stroke="var(--accent-amber)" stroke-width="2"></path></svg>`;
    } else {
      return `<svg viewBox="0 0 240 35"><path d="M0,35 L20,30 L40,10 L60,25 L95,2 L120,18 L160,5 L190,22 L220,1 L240,30" fill="none" stroke="#ff5252" stroke-width="2"></path></svg>`;
    }
  };

  grid.innerHTML = data.map(trek => `
    <div class="trek-card" onclick="openTrekDetailModal('${trek.id}')">
      <div class="trek-card-img" style="background-image: url('${trek.gallery[0]}')"></div>
      <div class="trek-card-video-wrap">
        <video class="trek-card-hover-video" loop muted playsinline preload="none">
          <source src="${getVideoSrc(trek.zone)}" type="video/mp4">
        </video>
      </div>
      <div class="trek-card-gradient"></div>
      <div class="trek-card-content">
        <div class="trek-badge-row">
          <span class="trek-zone-tag">${trek.zoneLabel}</span>
          <span class="trek-difficulty-badge ${trek.difficulty.toLowerCase()}">${trek.difficulty}</span>
        </div>
        <h3 class="trek-card-title">${trek.name}</h3>
        <div class="trek-meta-grid">
          <div class="trek-meta-item">⏱️ <span>${trek.duration}</span></div>
          <div class="trek-meta-item">🏔️ <span>${trek.elevation}</span></div>
        </div>
        <div class="trek-terrain-graph">
          <span class="trek-terrain-lbl">Terrain Contour</span>
          ${getTerrainSvg(trek.difficulty)}
        </div>
        <div class="trek-card-action">
          <span class="trek-card-price">${trek.price}</span>
          <button class="trek-card-btn">Explore ➔</button>
        </div>
      </div>
    </div>
  `).join('');

  // Setup hover video triggers
  const cards = grid.querySelectorAll('.trek-card');
  cards.forEach(card => {
    const video = card.querySelector('.trek-card-hover-video');
    if (!video) return;

    card.addEventListener('mouseenter', () => {
      video.style.opacity = '0.35';
      video.setAttribute('preload', 'auto');
      video.play().catch(() => {});
    });

    card.addEventListener('mouseleave', () => {
      video.style.opacity = '0';
      video.pause();
      video.currentTime = 0;
    });
  });

  // Re-run magnetic elements check on dynamic content changes (like filters)
  if (typeof window.dispatchEvent !== 'undefined') {
    window.dispatchEvent(new Event('contentChanged'));
  }

  // Initialize 3D Tilt
  initCardTilt();
}

function initCardTilt() {
  const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches || 
                        ('ontouchstart' in window) || 
                        (navigator.maxTouchPoints > 0);
  if (isTouchDevice) return;

  const cards = document.querySelectorAll('.trek-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      
      // Calculate rotation angles (max 10 degrees for elegant subtle premium feel)
      const rotateY = ((x - xc) / xc) * 10;
      const rotateX = ((yc - y) / yc) * 10;

      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        ease: "power2.out",
        duration: 0.5,
        overwrite: "auto"
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        ease: "power2.out",
        duration: 0.5,
        overwrite: "auto"
      });
    });
  });
}

/* --- GLOBAL DETAIL DRAWER/MODAL CONTROLLER --- */
let activeSlideIndex = 0;
let modalGalleryImages = [];

function initTrekDetailModal() {
  const modal = document.getElementById('global-trek-modal');
  const closeBtn = document.getElementById('modal-close-btn');

  if (!modal || !closeBtn) return;

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
  });

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('open');
      document.body.classList.remove('modal-open');
    }
  });

  // Expose function globally
  window.openTrekDetailModal = async function(trekId) {
    // 1. Find trek in either backend-loaded treks or static fallback
    const trek = activeTreksData.find(t => t.id === trekId);
    if (!trek) return;

    // Close map drawers first to clean up overlays
    if (window.trekMapInstance) {
      window.trekMapInstance.closeDetailsDrawer();
    }

    // Populate static trek details
    document.getElementById('modal-title').textContent = trek.name || trek.title;
    document.getElementById('modal-zone-tag').textContent = trek.zoneLabel;
    
    const diffBadge = document.getElementById('modal-difficulty-badge');
    diffBadge.className = `trek-difficulty-badge ${trek.difficulty.toLowerCase()}`;
    diffBadge.textContent = trek.difficulty;

    document.getElementById('modal-long-desc').textContent = trek.longDescription || trek.description;
    document.getElementById('spec-duration').textContent = trek.duration;
    document.getElementById('spec-elevation').textContent = trek.elevation;
    document.getElementById('spec-group').textContent = trek.groupSize;
    document.getElementById('spec-season').textContent = trek.bestSeason ? trek.bestSeason.split(" ")[0] : 'All';
    document.getElementById('spec-meeting').textContent = trek.meetingPoint;

    // Construct image gallery slides
    modalGalleryImages = trek.gallery || [];
    activeSlideIndex = 0;
    renderModalGallery();

    // Render Altitude/Difficulty Custom Chart
    renderModalChart(trek);

    // Build timeline day itinerary list
    const timelineContainer = document.getElementById('modal-timeline');
    const timelineData = Array.isArray(trek.timeline) ? trek.timeline : (typeof trek.timeline === 'string' ? JSON.parse(trek.timeline) : []);
    timelineContainer.innerHTML = timelineData.map(item => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <span class="timeline-day">${item.day}</span>
        <h4 class="timeline-title">${item.title}</h4>
        <p class="timeline-desc">${item.desc}</p>
      </div>
    `).join('');

    // Inclusions & Exclusions Checkmarks
    const incContainer = document.getElementById('modal-inclusions');
    const inclusionsData = Array.isArray(trek.inclusions) ? trek.inclusions : (typeof trek.inclusions === 'string' ? JSON.parse(trek.inclusions) : []);
    const exclusionsData = Array.isArray(trek.exclusions) ? trek.exclusions : (typeof trek.exclusions === 'string' ? JSON.parse(trek.exclusions) : []);

    const inclusionsHtml = inclusionsData.map(inc => `
      <div class="inc-item inc-yes">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>${inc}</span>
      </div>
    `).join('');
    const exclusionsHtml = exclusionsData.map(exc => `
      <div class="inc-item inc-no">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        <span>${exc}</span>
      </div>
    `).join('');
    incContainer.innerHTML = inclusionsHtml + exclusionsHtml;

    // Set prices
    document.getElementById('modal-footer-price').textContent = trek.price;

    // WhatsApp Book Link
    const waButton = document.getElementById('modal-whatsapp-btn');
    const waText = encodeURIComponent(`Hi! I'm interested in booking the ${trek.name || trek.title} (${trek.duration}) with The Rising Stars. Please share availability.`);
    waButton.href = `https://wa.me/919373011627?text=${waText}`;

    // 2. Hook up Online Booking Button
    const onlineBtn = document.getElementById('modal-online-book-btn');
    onlineBtn.onclick = (e) => {
      e.preventDefault();
      const currentUser = window.api.getCurrentUser();
      if (!currentUser) {
        // Not logged in -> open Login modal
        modal.classList.remove('open');
        document.body.classList.remove('modal-open');
        window.openAuthModal(e);
      } else {
        // Logged in -> open Booking form
        openBookingFormModal(trek);
      }
    };

    // 3. Load Reviews from backend
    const reviewsList = document.getElementById('modal-reviews-list');
    reviewsList.innerHTML = '<div style="color:rgba(255,255,255,0.4); font-size:0.85rem;">Loading reviews...</div>';

    // Show/hide review form based on auth state
    const user = window.api.getCurrentUser();
    const reviewFormWrap = document.getElementById('trek-review-form');
    const reviewAuthPrompt = document.getElementById('review-auth-prompt');

    if (user) {
      reviewFormWrap.style.display = 'block';
      reviewAuthPrompt.style.display = 'none';
      
      // Bind Review submit handler
      const reviewForm = document.getElementById('trek-review-form');
      // Remove old listeners by cloning
      const newReviewForm = reviewForm.cloneNode(true);
      reviewForm.parentNode.replaceChild(newReviewForm, reviewForm);
      
      newReviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const rating = document.getElementById('review-rating').value;
        const comment = document.getElementById('review-comment').value;
        
        try {
          await window.api.addReview(trek.id, rating, comment);
          alert('Review posted successfully!');
          document.getElementById('review-comment').value = '';
          // Reload reviews
          const updatedReviews = await window.api.getReviews(trek.id);
          renderTrekReviews(updatedReviews);
        } catch (err) {
          alert('Failed to post review: ' + err.message);
        }
      });
    } else {
      reviewFormWrap.style.display = 'none';
      reviewAuthPrompt.style.display = 'block';
    }

    try {
      const reviews = await window.api.getReviews(trek.id);
      renderTrekReviews(reviews);
    } catch (err) {
      console.warn('Failed to load reviews from API. Running offline mode.', err);
      reviewsList.innerHTML = '<div style="color:rgba(255,255,255,0.4); font-size:0.85rem;">Reviews offline.</div>';
    }

    // Open Modal
    modal.classList.add('open');
    document.body.classList.add('modal-open');

    // Trigger timeline entry animations
    if (typeof gsap !== 'undefined') {
      gsap.fromTo('.timeline-item', 
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, delay: 0.2 }
      );
      gsap.fromTo('.chart-bar-fill',
        { height: '0%' },
        { height: (i, el) => el.getAttribute('data-height') + '%', duration: 1, ease: 'power2.out', delay: 0.3 }
      );
    }
  };

  // Navigations inside the modal image gallery
  const prevBtn = document.getElementById('gallery-prev');
  const nextBtn = document.getElementById('gallery-next');

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      activeSlideIndex = (activeSlideIndex - 1 + modalGalleryImages.length) % modalGalleryImages.length;
      updateModalGalleryActiveSlide();
    });
    nextBtn.addEventListener('click', () => {
      activeSlideIndex = (activeSlideIndex + 1) % modalGalleryImages.length;
      updateModalGalleryActiveSlide();
    });
  }
}

function renderTrekReviews(reviews) {
  const container = document.getElementById('modal-reviews-list');
  if (reviews.length === 0) {
    container.innerHTML = '<div style="color:rgba(255,255,255,0.4); font-size:0.9rem;">No reviews yet. Be the first to share your experience!</div>';
    return;
  }

  container.innerHTML = reviews.map(r => {
    const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
    const dateStr = new Date(r.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
    return `
      <div class="review-item-card">
        <div class="review-card-header">
          <span class="review-user-name">${r.userName}</span>
          <span class="review-stars">${stars}</span>
        </div>
        <p class="review-comment-text">${r.comment}</p>
        <span style="font-size:0.75rem; color:rgba(255,255,255,0.3); display:block; margin-top:6px; font-style:italic;">Posted on ${dateStr}</span>
      </div>
    `;
  }).join('');
}

// Booking form modal operations
let currentBookingTrekPrice = 0;

async function openBookingFormModal(trek) {
  const modal = document.getElementById('booking-form-modal');
  if (!modal) return;

  // Close trek detail modal first
  document.getElementById('global-trek-modal').classList.remove('open');
  document.body.classList.remove('modal-open');

  document.getElementById('booking-form-title').textContent = `Book: ${trek.name || trek.title}`;
  
  // Set price head
  const rawPrice = typeof trek.price === 'string' ? parseFloat(trek.price.replace(/[^\d.]/g, '')) : trek.price;
  currentBookingTrekPrice = rawPrice || 0;
  document.getElementById('booking-price-head').textContent = `₹${currentBookingTrekPrice.toLocaleString()}`;

  // Populate travel dates dropdown from upcoming departures
  const dateSelect = document.getElementById('booking-date-select');
  let upcomingTrips = trek.upcomingTrips || [];

  if (upcomingTrips.length === 0 && window.api && typeof window.api.getUpcomingTrips === 'function') {
    try {
      upcomingTrips = await window.api.getUpcomingTrips();
    } catch (err) {
      console.warn('Unable to load upcoming trips for booking form.', err);
    }
  }

  if (upcomingTrips.length === 0) {
    dateSelect.innerHTML = '<option value="">No departures scheduled</option>';
  } else {
    dateSelect.innerHTML = upcomingTrips.map(trip => {
      const dateStr = new Date(trip.date).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
      const remaining = trip.totalSeats - trip.bookedSeats;
      return `<option value="${trip.id}" ${remaining <= 0 ? 'disabled' : ''}>${dateStr} (${remaining <= 0 ? 'SOLD OUT' : `${remaining} seats left`})</option>`;
    }).join('');
  }

  // Set members to 1 and calculate costs
  document.getElementById('booking-members').value = 1;
  document.getElementById('booking-error-msg').textContent = '';
  calculateBookingCosts();

  modal.classList.add('open');
  document.body.classList.add('modal-open');

  // Submit Handler
  const form = document.getElementById('booking-form-el');
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);

  newForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const tripId = document.getElementById('booking-date-select').value;
    const members = parseInt(document.getElementById('booking-members').value);
    const errorMsg = document.getElementById('booking-error-msg');

    if (!tripId) {
      errorMsg.textContent = 'Please choose a travel departure date.';
      return;
    }

    errorMsg.textContent = '';
    try {
      const data = await window.api.createBooking(tripId, members);
      // Close booking modal
      modal.classList.remove('open');
      document.body.classList.remove('modal-open');
      
      // Open Payment Gateway simulation popup directly!
      window.openPaymentGatewayModal(data.booking.id, data.booking.totalAmount);
    } catch (err) {
      errorMsg.textContent = err.message || 'Failed to submit booking.';
    }
  });

  // Bind close buttons
  document.getElementById('booking-form-close-btn').onclick = () => {
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
  };
}

window.calculateBookingCosts = function() {
  const members = parseInt(document.getElementById('booking-members').value) || 1;
  const total = currentBookingTrekPrice * members;
  document.getElementById('booking-price-total').textContent = `₹${total.toLocaleString()}`;
};

function renderModalGallery() {
  const container = document.getElementById('modal-gallery-slides');
  if (!container) return;

  container.innerHTML = modalGalleryImages.map((imgUrl, index) => `
    <div class="modal-gallery-slide ${index === 0 ? 'active' : ''}" style="background-image: url('${imgUrl}')"></div>
  `).join('');
}

function updateModalGalleryActiveSlide() {
  const slides = document.querySelectorAll('.modal-gallery-slide');
  slides.forEach((slide, index) => {
    if (index === activeSlideIndex) {
      slide.classList.add('active');
    } else {
      slide.classList.remove('active');
    }
  });
}

function renderModalChart(trek) {
  const chartFill = document.getElementById('chart-bars-wrap');
  if (!chartFill) return;

  // Set parameters dynamically based on trek level
  let diffPercent = 40;
  let elevPercent = 30;
  let safetyPercent = 98;

  if (trek.difficulty === 'Moderate') {
    diffPercent = 65;
  } else if (trek.difficulty === 'Challenging') {
    diffPercent = 90;
  }

  // Calculate approximate height percentage based on standard elevations
  const rawElevation = parseInt(trek.elevation.replace(/[^0-9]/g, ''), 10);
  if (!isNaN(rawElevation)) {
    // Range maps from 1,000 ft (10%) up to 18,000 ft (100%)
    elevPercent = Math.min(Math.max(Math.round((rawElevation / 18000) * 100), 15), 100);
  }

  chartFill.innerHTML = `
    <div class="chart-bar-group">
      <span class="chart-bar-val">${trek.difficulty}</span>
      <div class="chart-bar-fill" data-height="${diffPercent}" style="height: 0%"></div>
      <span class="chart-bar-lbl">Difficulty</span>
    </div>
    <div class="chart-bar-group">
      <span class="chart-bar-val">${trek.elevation}</span>
      <div class="chart-bar-fill" data-height="${elevPercent}" style="height: 0%"></div>
      <span class="chart-bar-lbl">Altitude</span>
    </div>
    <div class="chart-bar-group">
      <span class="chart-bar-val">${safetyPercent}%</span>
      <div class="chart-bar-fill" data-height="${safetyPercent}" style="height: 0%"></div>
      <span class="chart-bar-lbl">Safety Index</span>
    </div>
  `;
}

/* --- STORIES MASONRY GALLERY & LIGHTBOX CONTROLLER --- */
let activeLightboxIndex = 0;
let galleryImagesList = [];

function initRealStoriesLightbox() {
  const items = document.querySelectorAll('.horizontal-slide-panel');
  const lightbox = document.getElementById('global-lightbox');
  const lightboxImg = document.getElementById('lightbox-image');
  const lightboxCap = document.getElementById('lightbox-txt');
  const closeBtn = document.getElementById('lightbox-close-btn');

  if (!lightbox || items.length === 0) return;

  // Clear existing items just in case
  galleryImagesList = [];

  // Consolidate images list
  items.forEach((item, index) => {
    const img = item.querySelector('img');
    const h3 = item.querySelector('.slide-panel-content h3');
    const span = item.querySelector('.slide-panel-content span');
    const cap = h3 && span ? `${h3.textContent} - ${span.textContent}` : (h3 ? h3.textContent : '');
    
    galleryImagesList.push({
      src: img.src || img.getAttribute('data-src'),
      caption: cap
    });

    item.addEventListener('click', () => {
      activeLightboxIndex = index;
      openLightbox();
    });
  });

  function openLightbox() {
    const activeImg = galleryImagesList[activeLightboxIndex];
    lightboxImg.src = activeImg.src;
    lightboxCap.textContent = activeImg.caption;
    
    lightbox.classList.add('open');
    document.body.classList.add('modal-open');
  }

  // Bind close
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      lightbox.classList.remove('open');
      document.body.classList.remove('modal-open');
    });
  }

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-img-wrap')) {
      lightbox.classList.remove('open');
      document.body.classList.remove('modal-open');
    }
  });

  // Lightbox arrow clicks
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      activeLightboxIndex = (activeLightboxIndex - 1 + galleryImagesList.length) % galleryImagesList.length;
      updateLightboxContent();
    });

    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      activeLightboxIndex = (activeLightboxIndex + 1) % galleryImagesList.length;
      updateLightboxContent();
    });
  }

  function updateLightboxContent() {
    const activeImg = galleryImagesList[activeLightboxIndex];
    
    // Quick fade trans
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(lightboxImg, { opacity: 0.5 }, { opacity: 1, duration: 0.3 });
    }
    
    lightboxImg.src = activeImg.src;
    lightboxCap.textContent = activeImg.caption;
  }
}

/* --- AUTO-ROTATING TESTIMONIALS CAROUSEL --- */
function initTestimonialsCarousel() {
  const slides = document.querySelectorAll('.testimonial-slide');
  const dotsContainer = document.getElementById('testimonials-dots');
  if (slides.length === 0 || !dotsContainer) return;

  let currentIndex = 0;
  let timer = null;

  // Render dots
  dotsContainer.innerHTML = Array.from({ length: slides.length }).map((_, i) => `
    <span class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>
  `).join('');

  const dots = dotsContainer.querySelectorAll('.carousel-dot');

  function showSlide(index) {
    slides.forEach((slide, i) => {
      if (i === index) {
        slide.classList.add('active');
        dots[i].classList.add('active');
      } else {
        slide.classList.remove('active');
        dots[i].classList.remove('active');
      }
    });
    currentIndex = index;
  }

  function startAutoCycle() {
    timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % slides.length;
      showSlide(nextIndex);
    }, 6000);
  }

  function stopAutoCycle() {
    if (timer) clearInterval(timer);
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-index'), 10);
      showSlide(idx);
      stopAutoCycle();
      startAutoCycle();
    });
  });

  // Start initial rotation
  startAutoCycle();
}

/* --- WHY RISING STARS TRUST BLOCKS DRAW ON SCROLL --- */
function initTrustBlocksDraw() {
  const blocks = document.querySelectorAll('.trust-block');
  if (blocks.length === 0) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    blocks.forEach(b => observer.observe(b));
  } else {
    // Fallback
    blocks.forEach(b => b.classList.add('visible'));
  }
}

/* --- SMOOTH SCROLL ACCESSIBILITY LINK HACK --- */
function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        // Adjust for sticky headers if needed, otherwise standard offset
        const yOffset = -50; 
        const y = targetEl.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });
}

/* --- LUXURY BRANDED CUSTOM CURSOR SYSTEM & MAGNETIC INTERACTION PHYSICS --- */
function initCustomCursor() {
  // Mobile / Touch devices check — Disable custom cursor visual effects entirely for better usability
  const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches || 
                        ('ontouchstart' in window) || 
                        (navigator.maxTouchPoints > 0);
  
  if (isTouchDevice) {
    console.log("Touch device detected. Custom cursor disabled for fluid accessibility.");
    return;
  }

  // Inject Custom Cursor elements dynamically
  const cursorDot = document.createElement('div');
  cursorDot.className = 'custom-cursor-dot';
  
  const cursorCircle = document.createElement('div');
  cursorCircle.className = 'custom-cursor-circle';

  document.body.appendChild(cursorDot);
  document.body.appendChild(cursorCircle);

  // Set initial off-screen positioning
  gsap.set([cursorDot, cursorCircle], { xPercent: -50, yPercent: -50, x: -100, y: -100 });

  // Use fast GSAP quickTo functions for ultra-smooth 60fps tracking
  const xToDot = gsap.quickTo(cursorDot, "x", { duration: 0.08, ease: "power3.out" });
  const yToDot = gsap.quickTo(cursorDot, "y", { duration: 0.08, ease: "power3.out" });
  
  const xToCircle = gsap.quickTo(cursorCircle, "x", { duration: 0.25, ease: "power4.out" });
  const yToCircle = gsap.quickTo(cursorCircle, "y", { duration: 0.25, ease: "power4.out" });

  // Mousemove Tracking
  window.addEventListener('mousemove', (e) => {
    xToDot(e.clientX);
    yToDot(e.clientY);
    
    xToCircle(e.clientX);
    yToCircle(e.clientY);
  });

  // Fade out cursor when mouse leaves the viewport
  document.addEventListener('mouseleave', () => {
    gsap.to([cursorDot, cursorCircle], { opacity: 0, scale: 0, duration: 0.3 });
  });

  document.addEventListener('mouseenter', () => {
    gsap.to([cursorDot, cursorCircle], { opacity: 1, scale: 1, duration: 0.3 });
  });

  // Snapping & Interactive Custom Cursor Morphs
  document.addEventListener('mouseover', (e) => {
    const target = e.target;
    
    // Check if hovering over any clickable elements
    const isInteractive = target.closest('a, button, select, input, textarea, [role="button"], .interactive-zone, .map-hotspot-group, .horizontal-slide-panel, .hamburger');
    
    if (isInteractive) {
      cursorCircle.classList.add('hover-active');
      cursorDot.classList.add('hover-active');

      // Special card-snap morph: Larger orange viewport ring with "VIEW" inside
      const isCard = target.closest('.trek-card, .drawer-trek-card, .zone-card, .horizontal-slide-panel');
      if (isCard) {
        cursorCircle.classList.add('hover-card');
        cursorDot.classList.add('hover-card');
      }
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target;
    const isInteractive = target.closest('a, button, select, input, textarea, [role="button"], .interactive-zone, .map-hotspot-group, .horizontal-slide-panel, .hamburger');
    
    if (isInteractive) {
      cursorCircle.classList.remove('hover-active', 'hover-card');
      cursorDot.classList.remove('hover-active', 'hover-card');
    }
  });

  // MAGNETIC SNAPPING PHYSICS: Move elements slightly towards the pointer
  const initMagneticElements = () => {
    // Dynamic query selector for magnetic luxury interactive targets
    const magneticElements = document.querySelectorAll(
      '.nav-links a, .logo-wrap, .btn, .hamburger, .social-link, .whatsapp-floating-action, #map-reset-btn, .filter-tab'
    );

    magneticElements.forEach(el => {
      // Prevent double bindings
      if (el.dataset.magneticBound) return;
      el.dataset.magneticBound = "true";

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        // Mouse coordinate relative to the bounding center of target
        const relX = e.clientX - (rect.left + rect.width / 2);
        const relY = e.clientY - (rect.top + rect.height / 2);
        
        // Dynamic pull factor (nav links shift easily; solid buttons resist more)
        const pull = el.classList.contains('btn') ? 0.2 : 0.35;

        gsap.to(el, {
          x: relX * pull,
          y: relY * pull,
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto"
        });
      });

      el.addEventListener('mouseleave', () => {
        // Return element back to center with elegant spring elastic bounce
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: "elastic.out(1.1, 0.4)",
          overwrite: "auto"
        });
      });
    });
  };

  // Run on startup
  initMagneticElements();

  // Re-run magnetic elements check on dynamic content changes (like filters)
  window.addEventListener('contentChanged', initMagneticElements);
}

/* --- HERO SECTION CINEMATIC ANIME & 3D PARALLAX DEPTH ENGINE --- */
function initHeroCinematic() {
  const video = document.getElementById('hero-bg-video');
  const heroSection = document.getElementById('hero');
  if (!heroSection) return;

  // 1. Fade-in video backdrop smoothly once loaded
  if (video) {
    const handleVideoReady = () => {
      // Fade in video to a premium opacity level so background remains moody
      gsap.to(video, { opacity: 0.38, duration: 1.8, ease: "power2.out" });
    };

    if (video.readyState >= 3) {
      handleVideoReady();
    } else {
      video.addEventListener('canplaythrough', handleVideoReady);
      video.addEventListener('loadeddata', handleVideoReady);
    }

    // Dynamic failover fallback: if loading fails or takes too long, gradient remains primary
    setTimeout(() => {
      if (parseFloat(window.getComputedStyle(video).opacity) === 0) {
        console.log("Ambient video backdrop slow to load. Retaining pure high-fidelity dark gradient + particles.");
      }
    }, 4000);
  }

  // 2. Dynamic staggered word-by-word magnetic reveal using GSAP
  // Set initial states
  gsap.set('.hero-subtitle', { opacity: 0, y: -20 });
  gsap.set('.hero-word', { opacity: 0, y: 55, skewY: 5 });
  gsap.set('.hero-desc', { opacity: 0, y: 15 });
  gsap.set('.hero-ctas .btn', { opacity: 0, y: 25 });
  gsap.set('.scroll-indicator-wrap', { opacity: 0, y: 10 });

  const tl = gsap.timeline({ delay: 0.15 });

  tl.to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
    .to('.hero-word', { 
      opacity: 1, 
      y: 0, 
      skewY: 0, 
      duration: 1.1, 
      ease: "power4.out", 
      stagger: 0.16 
    }, "-=0.55")
    .to('.hero-desc', { opacity: 0.82, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.65")
    .to('.hero-ctas .btn', { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.16 }, "-=0.55")
    .to('.scroll-indicator-wrap', { opacity: 0.65, y: 0, duration: 0.7, ease: "power2.out" }, "-=0.35");

  // 3. Interactive Mouse-move Layered Parallax Depth
  const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches || 
                        ('ontouchstart' in window) || 
                        (navigator.maxTouchPoints > 0);

  if (!isTouchDevice) {
    window.addEventListener('mousemove', (e) => {
      // Coordinate ratios normalized relative to screen center (-1 to 1)
      const normX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const normY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

      // Deep 3D sub-pixel translates with distinct speeds per element layer
      gsap.to('.hero-video-wrapper', {
        x: normX * 16,
        y: normY * 8,
        scale: 1.015,
        duration: 1.4,
        ease: "power2.out",
        overwrite: "auto"
      });

      gsap.to('.mountain-silhouette-fixed svg', {
        x: normX * -10,
        y: normY * -3,
        scale: 1.01,
        duration: 1.4,
        ease: "power2.out",
        overwrite: "auto"
      });

      gsap.to('.hero-content', {
        x: normX * 6,
        y: normY * 3,
        duration: 1.4,
        ease: "power2.out",
        overwrite: "auto"
      });
    });
  }
}

/* --- MAGICAL STAR-DUST PARTICLE CURSOR TRAIL --- */
function initStarDustTrail() {
  const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches || 
                        ('ontouchstart' in window) || 
                        (navigator.maxTouchPoints > 0);
  
  if (isTouchDevice) return;

  let lastX = 0;
  let lastY = 0;
  const threshold = 12; // Distance threshold in pixels to throttle spark spawning

  window.addEventListener('mousemove', (e) => {
    // Check if mouse is hovering over interactive elements
    const target = e.target;
    const isInteractive = target.closest('a, button, select, input, textarea, [role="button"], .interactive-zone, .map-hotspot-group, .horizontal-slide-panel, .hamburger, .trek-card, .filter-tab');
    if (!isInteractive) return;

    const currentX = e.clientX;
    const currentY = e.clientY;
    
    // Calculate movement distance
    const dist = Math.hypot(currentX - lastX, currentY - lastY);
    if (dist < threshold) return;

    lastX = currentX;
    lastY = currentY;

    createSpark(currentX, currentY);
  });

  function createSpark(x, y) {
    const spark = document.createElement('span');
    spark.className = 'cursor-sparkle';
    spark.innerHTML = '✦';
    
    // Slight random offset
    const offsetX = (Math.random() - 0.5) * 8;
    const offsetY = (Math.random() - 0.5) * 8;
    
    spark.style.left = `${x + offsetX}px`;
    spark.style.top = `${y + offsetY}px`;

    // Randomize movement vector variables for keyframe animation (--tx, --ty)
    const tx = (Math.random() - 0.5) * 80;
    const ty = (Math.random() - 0.8) * 60 - 20; // Drifts slightly upwards like sparks
    spark.style.setProperty('--tx', `${tx}px`);
    spark.style.setProperty('--ty', `${ty}px`);

    // Alternate color between Gold and Magenta
    const isMagenta = Math.random() > 0.5;
    if (isMagenta) {
      spark.style.color = 'var(--accent-magenta)';
      spark.style.textShadow = '0 0 8px var(--accent-purple), 0 0 15px var(--accent-magenta)';
    } else {
      spark.style.color = 'var(--accent-amber)';
      spark.style.textShadow = '0 0 8px var(--primary-orange), 0 0 15px var(--accent-amber)';
    }

    document.body.appendChild(spark);

    // Dynamic garbage collection to prevent memory leaks
    setTimeout(() => {
      spark.remove();
    }, 1100);
  }
}

/* --- GSAP SCROLL-TRIGGERED ADVENTURE ANIMATIONS --- */
function initScrollReveals() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // 1. Parallax Scroll-Scrub on Mountain Mist Layers inside Hero
  // As the user scrolls down, mist layers fade out and shift sideways/downwards
  gsap.to('.mist-layer-1', {
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    },
    xPercent: -20,
    y: 100,
    opacity: 0.1,
    ease: 'none'
  });

  gsap.to('.mist-layer-2', {
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    },
    xPercent: 20,
    y: 150,
    opacity: 0.1,
    ease: 'none'
  });

  // 2. GSAP "Mountain Rise" scroll-triggered card reveals for geographical territory zone cards
  // Smoothly rise and scale up with a subtle rotation to mimic mountain peaks rising above fog
  gsap.from('.zone-card', {
    scrollTrigger: {
      trigger: '#territory',
      start: 'top 80%', // Starts when top of territory hits 80% viewport height
      toggleActions: 'play none none none' // Play once
    },
    opacity: 0,
    y: 90,
    scale: 0.95,
    rotateX: -10,
    duration: 1.2,
    ease: 'power3.out',
    stagger: 0.25
  });

  // 3. GSAP Trust blocks slide-up staggered grid reveals inside #trust
  gsap.from('.trust-block', {
    scrollTrigger: {
      trigger: '#trust',
      start: 'top 82%',
      toggleActions: 'play none none none'
    },
    opacity: 0,
    y: 60,
    duration: 1.0,
    ease: 'power3.out',
    stagger: {
      each: 0.15,
      onStart: function() {
        this.targets()[0].classList.add('visible');
      }
    }
  });
}

/* --- GSAP HORIZONTAL SCROLL GALLERY --- */
function initHorizontalGallery() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const track = document.querySelector('.horizontal-scroll-track');
  const panels = gsap.utils.toArray('.horizontal-slide-panel');
  const section = document.querySelector('.horizontal-gallery-section');

  if (!track || panels.length === 0 || !section) return;

  // Setup GSAP MatchMedia for responsive horizontal pinning behavior
  let mm = gsap.matchMedia();

  mm.add("(min-width: 1025px)", () => {
    // Calculate the total scrollable distance of the track
    const getScrollAmount = () => track.scrollWidth - window.innerWidth;

    gsap.to(track, {
      x: () => -getScrollAmount(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        pin: true,
        start: 'top top',
        end: () => `+=${getScrollAmount()}`,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1
      }
  });
}

function initNewsletterForm() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;

  // Remove the inline onsubmit attribute if it exists
  form.removeAttribute('onsubmit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = form.querySelector('.newsletter-input');
    if (!emailInput || !emailInput.value) return;

    try {
      const res = await window.api.subscribeNewsletter(emailInput.value);
      alert(res.message || 'Thank you for subscribing!');
      form.reset();
    } catch (err) {
      alert(err.message || 'Subscription failed. Please try again.');
    }
  });
}



