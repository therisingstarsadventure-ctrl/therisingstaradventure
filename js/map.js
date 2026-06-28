// The Rising Stars - SVG India Map Interactive Controller
class TrekMap {
  constructor() {
    this.mapContainer = document.getElementById('india-map-section');
    if (!this.mapContainer) return;

    this.mapSvg = document.getElementById('india-svg');
    this.mapGroup = document.getElementById('india-map-group');
    this.zones = document.querySelectorAll('.interactive-zone');
    this.fallbackButtons = document.querySelectorAll('.zone-btn');
    this.resetBtn = document.getElementById('map-reset-btn');
    this.sidePanel = document.getElementById('map-side-panel');
    this.bottomSheet = document.getElementById('map-bottom-sheet');
    
    this.currentZone = null;
    this.isZoomed = false;

    this.init();
  }

  init() {
    // Bind zone clicks
    this.zones.forEach(zone => {
      zone.addEventListener('click', (e) => {
        const zoneId = zone.getAttribute('data-zone');
        this.selectZone(zoneId);
      });
    });

    // Bind fallback buttons
    this.fallbackButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const zoneId = btn.getAttribute('data-zone');
        this.selectZone(zoneId);
      });
    });

    // Bind reset button
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => this.resetMap());
    }

    // Close sheets on clicking map background
    this.mapSvg.addEventListener('click', (e) => {
      if (e.target === this.mapSvg || e.target.classList.contains('state-backdrop')) {
        this.resetMap();
      }
    });
  }

  selectZone(zoneId) {
    if (this.currentZone === zoneId) return;

    this.currentZone = zoneId;
    this.isZoomed = true;

    // Highlight path
    this.zones.forEach(z => {
      if (z.getAttribute('data-zone') === zoneId) {
        z.classList.add('active');
      } else {
        z.classList.remove('active');
        z.classList.add('dimmed');
      }
    });

    // Highlight fallback buttons
    this.fallbackButtons.forEach(b => {
      if (b.getAttribute('data-zone') === zoneId) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    // Zoom coordinates for GSAP based on zone
    let zoomData = { scale: 1, x: 0, y: 0 };
    if (zoneId === 'maharashtra') {
      zoomData = window.innerWidth < 768 
        ? { scale: 2.8, x: 100, y: -280 } 
        : { scale: 2.8, x: -90, y: -260 };
    } else if (zoneId === 'himachal') {
      zoomData = window.innerWidth < 768 
        ? { scale: 2.8, x: 100, y: 220 } 
        : { scale: 2.8, x: -70, y: 170 };
    } else if (zoneId === 'mp') {
      zoomData = window.innerWidth < 768 
        ? { scale: 2.6, x: 40, y: -120 } 
        : { scale: 2.6, x: -100, y: -100 };
    }

    // Animate SVG Map Group with hardware acceleration
    gsap.to(this.mapGroup, {
      scale: zoomData.scale,
      x: zoomData.x,
      y: zoomData.y,
      duration: 1.2,
      ease: 'power3.out',
      force3D: true,
      overwrite: 'auto'
    });

    // Show reset button
    if (this.resetBtn) {
      this.resetBtn.classList.add('visible');
    }

    // Render hot dots for treks in this zone
    this.renderTrekDots(zoneId);

    // Open information panel / drawer
    this.openDetailsDrawer(zoneId);
  }

  resetMap() {
    if (!this.isZoomed) return;

    this.currentZone = null;
    this.isZoomed = false;

    // Reset paths
    this.zones.forEach(z => {
      z.classList.remove('active', 'dimmed');
    });

    // Reset buttons
    this.fallbackButtons.forEach(b => {
      b.classList.remove('active');
    });

    // Animate map back to original state with hardware acceleration
    gsap.to(this.mapGroup, {
      scale: 1,
      x: 0,
      y: 0,
      duration: 1,
      ease: 'power2.out',
      force3D: true,
      overwrite: 'auto'
    });

    // Hide reset button
    if (this.resetBtn) {
      this.resetBtn.classList.remove('visible');
    }

    // Clear trek dots
    this.clearTrekDots();

    // Close drawers
    this.closeDetailsDrawer();
  }

  renderTrekDots(zoneId) {
    this.clearTrekDots();

    // Filter treks in this zone
    const treks = TREKS_DATA.filter(t => t.zone === zoneId);
    const dotsContainer = document.getElementById('map-dots-layer');
    if (!dotsContainer) return;

    // Sort treks sequentially by coordinates to draw a logical, clean path
    // Vertically oriented zones (like himachal) flow best when sorted by y-coordinate (North to South)
    // Horizontally/diagonally oriented zones (like maharashtra and mp) flow best when sorted by x-coordinate
    const sortedTreks = [...treks].sort((a, b) => {
      if (zoneId === 'himachal') {
        return a.mapCoords.y - b.mapCoords.y;
      } else {
        return a.mapCoords.x - b.mapCoords.x;
      }
    });
    this.renderRouteTrails(zoneId, sortedTreks);

    treks.forEach(trek => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'map-hotspot-group map-campfire-wrap');
      g.setAttribute('data-trek-id', trek.id);
      
      // Campfire background glow area for mouse detection
      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      bg.setAttribute('cx', trek.mapCoords.x);
      bg.setAttribute('cy', trek.mapCoords.y);
      bg.setAttribute('r', '14');
      bg.setAttribute('class', 'map-campfire-bg');

      // Campfire logs
      const log1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      log1.setAttribute('x1', trek.mapCoords.x - 7);
      log1.setAttribute('y1', trek.mapCoords.y + 4);
      log1.setAttribute('x2', trek.mapCoords.x + 7);
      log1.setAttribute('y2', trek.mapCoords.y + 1);
      log1.setAttribute('class', 'map-campfire-log');

      const log2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      log2.setAttribute('x1', trek.mapCoords.x - 7);
      log2.setAttribute('y1', trek.mapCoords.y + 1);
      log2.setAttribute('x2', trek.mapCoords.x + 7);
      log2.setAttribute('y2', trek.mapCoords.y + 4);
      log2.setAttribute('class', 'map-campfire-log');

      // Three layers of flickering flames (outer-magenta, mid-orange, inner-gold)
      const flameOuter = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      flameOuter.setAttribute('d', `M ${trek.mapCoords.x - 7} ${trek.mapCoords.y + 2} C ${trek.mapCoords.x - 9} ${trek.mapCoords.y - 3} ${trek.mapCoords.x - 3} ${trek.mapCoords.y - 12} ${trek.mapCoords.x} ${trek.mapCoords.y - 14} C ${trek.mapCoords.x + 3} ${trek.mapCoords.y - 12} ${trek.mapCoords.x + 9} ${trek.mapCoords.y - 3} ${trek.mapCoords.x + 7} ${trek.mapCoords.y + 2} Q ${trek.mapCoords.x} ${trek.mapCoords.y + 4} ${trek.mapCoords.x - 7} ${trek.mapCoords.y + 2} Z`);
      flameOuter.setAttribute('class', 'map-campfire-flame flame-outer');

      const flameMid = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      flameMid.setAttribute('d', `M ${trek.mapCoords.x - 5} ${trek.mapCoords.y + 2} C ${trek.mapCoords.x - 7} ${trek.mapCoords.y - 2} ${trek.mapCoords.x - 2} ${trek.mapCoords.y - 9} ${trek.mapCoords.x} ${trek.mapCoords.y - 11} C ${trek.mapCoords.x + 2} ${trek.mapCoords.y - 9} ${trek.mapCoords.x + 7} ${trek.mapCoords.y - 2} ${trek.mapCoords.x + 5} ${trek.mapCoords.y + 2} Q ${trek.mapCoords.x} ${trek.mapCoords.y + 3} ${trek.mapCoords.x - 5} ${trek.mapCoords.y + 2} Z`);
      flameMid.setAttribute('class', 'map-campfire-flame');

      const flameInner = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      flameInner.setAttribute('d', `M ${trek.mapCoords.x - 3} ${trek.mapCoords.y + 2} C ${trek.mapCoords.x - 4} ${trek.mapCoords.y} ${trek.mapCoords.x - 1} ${trek.mapCoords.y - 5} ${trek.mapCoords.x} ${trek.mapCoords.y - 7} C ${trek.mapCoords.x + 1} ${trek.mapCoords.y - 5} ${trek.mapCoords.x + 4} ${trek.mapCoords.y} ${trek.mapCoords.x + 3} ${trek.mapCoords.y + 2} Q ${trek.mapCoords.x} ${trek.mapCoords.y + 3} ${trek.mapCoords.x - 3} ${trek.mapCoords.y + 2} Z`);
      flameInner.setAttribute('class', 'map-campfire-flame flame-inner');

      // Tooltip/label offset slightly higher to clear flame tips
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', trek.mapCoords.x);
      text.setAttribute('y', trek.mapCoords.y - 18);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('class', 'map-dot-label');
      text.textContent = trek.name.split(" ")[0]; // Just the first word for neatness

      g.appendChild(bg);
      g.appendChild(log1);
      g.appendChild(log2);
      g.appendChild(flameOuter);
      g.appendChild(flameMid);
      g.appendChild(flameInner);
      g.appendChild(text);

      // Tap event on hotspot
      g.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof window.openTrekDetailModal === 'function') {
          window.openTrekDetailModal(trek.id);
        }
      });

      dotsContainer.appendChild(g);

      // Animate dots entrance using opacity only to avoid CSS transform conflicts on SVG child groups
      gsap.fromTo(g, { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.4 });
    });
  }

  renderRouteTrails(zoneId, treks) {
    const dotsContainer = document.getElementById('map-dots-layer');
    if (!dotsContainer || treks.length < 2) return;

    let d = '';
    treks.forEach((trek, i) => {
      if (i === 0) {
        d += `M ${trek.mapCoords.x} ${trek.mapCoords.y}`;
      } else {
        const prev = treks[i - 1];
        // Calculate curved offset center point
        const cx = (prev.mapCoords.x + trek.mapCoords.x) / 2 + (i % 2 === 0 ? 12 : -12);
        const cy = (prev.mapCoords.y + trek.mapCoords.y) / 2 + (i % 2 === 0 ? -12 : 12);
        d += ` Q ${cx} ${cy} ${trek.mapCoords.x} ${trek.mapCoords.y}`;
      }
    });

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', `map-route-trail color-${zoneId}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-dasharray', '6,6');
    
    dotsContainer.appendChild(path);

    // Flowing dashoffset animation
    gsap.fromTo(path, 
      { strokeDashoffset: 120, opacity: 0 }, 
      { strokeDashoffset: 0, opacity: 0.8, duration: 2.0, ease: 'none', delay: 0.3 }
    );
  }

  clearTrekDots() {
    const dotsContainer = document.getElementById('map-dots-layer');
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
    }
  }

  getWeatherData(zoneId) {
    if (zoneId === 'maharashtra') {
      return { temp: '24°C', condition: '🌧️ Monsoon Mist', detail: 'Humidity: 94% | Wind: 18km/h | Terrain: Wet Fort Steps' };
    } else if (zoneId === 'himachal') {
      return { temp: '12°C', condition: '❄️ Alpine Freeze', detail: 'Humidity: 42% | Wind: 24km/h | Terrain: Dry scree & glacial sheets' };
    } else {
      return { temp: '31°C', condition: '🌤️ Forest Canopy Breeze', detail: 'Humidity: 58% | Wind: 10km/h | Terrain: Sandy riverbeds' };
    }
  }

  openDetailsDrawer(zoneId) {
    const treks = TREKS_DATA.filter(t => t.zone === zoneId);
    const weather = this.getWeatherData(zoneId);

    const weatherHtml = `
      <div class="map-weather-widget">
        <span class="weather-title">⚡ REAL-TIME TRAIL CLIMATE</span>
        <div class="weather-row">
          <span class="weather-temp">${weather.temp}</span>
          <div class="weather-detail">
            <span class="weather-cond">${weather.condition}</span>
            <span class="weather-sub">${weather.detail}</span>
          </div>
        </div>
      </div>
    `;

    const listHtml = treks.map(trek => `
      <div class="drawer-trek-card" onclick="openTrekDetailModal('${trek.id}')">
        <div class="drawer-card-info">
          <h4>${trek.name}</h4>
          <div class="drawer-card-meta">
            <span>🏔️ ${trek.elevation}</span>
            <span>⏱️ ${trek.duration}</span>
          </div>
          <p class="drawer-card-desc">${trek.description}</p>
        </div>
        <div class="drawer-card-action">
          <span class="drawer-price">${trek.price}</span>
          <button class="drawer-btn">View Details</button>
        </div>
      </div>
    `).join('');

    const titleMap = {
      'maharashtra': 'MAHARASHTRA — Sahyadri Forts & Canyon Trails',
      'himachal': 'HIMACHAL + LADAKH — High Altitude Snow Passes',
      'mp': 'MADHYA PRADESH — Satpura Tiger Reserves & Wild Canyons'
    };

    if (window.innerWidth < 768) {
      // Mobile Bottom Sheet
      const content = this.bottomSheet.querySelector('.sheet-scroll-content');
      const title = this.bottomSheet.querySelector('.sheet-title');
      if (title && content) {
        title.innerHTML = `<h3>${titleMap[zoneId]}</h3>`;
        content.innerHTML = weatherHtml + listHtml;
      }
      this.bottomSheet.classList.add('open');
      document.body.classList.add('modal-open');
    } else {
      // Desktop Side Panel
      const content = this.sidePanel.querySelector('.panel-scroll-content');
      const title = this.sidePanel.querySelector('.panel-title');
      if (title && content) {
        title.innerHTML = `<h3>${titleMap[zoneId]}</h3>`;
        content.innerHTML = weatherHtml + listHtml;
      }
      this.sidePanel.classList.add('open');
    }
  }

  closeDetailsDrawer() {
    if (this.sidePanel) this.sidePanel.classList.remove('open');
    if (this.bottomSheet) this.bottomSheet.classList.remove('open');
    document.body.classList.remove('modal-open');
  }
}

// Global setup
document.addEventListener('DOMContentLoaded', () => {
  window.trekMapInstance = new TrekMap();
  
  // Bind close buttons for drawer/sheet
  const closeSide = document.getElementById('panel-close-btn');
  if (closeSide) {
    closeSide.addEventListener('click', () => {
      if (window.trekMapInstance) window.trekMapInstance.resetMap();
    });
  }

  const closeBottom = document.getElementById('sheet-close-btn');
  if (closeBottom) {
    closeBottom.addEventListener('click', () => {
      if (window.trekMapInstance) window.trekMapInstance.resetMap();
    });
  }
});
