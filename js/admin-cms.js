// Enterprise Trek CMS Frontend Controller
(function() {
  'use strict';

  let currentTreks = [];
  let selectedTrekIds = new Set();
  let editingTrekId = null;
  let currentImages = [];

  document.addEventListener('DOMContentLoaded', () => {
    initCmsModule();
  });

  function initCmsModule() {
    setupCmsEventListeners();
  }

  function setupCmsEventListeners() {
    const cmsLink = document.querySelector('a[href="#cms-section"]');
    if (cmsLink) {
      cmsLink.addEventListener('click', (e) => {
        e.preventDefault();
        showCmsSection();
      });
    }
  }

  window.showCmsSection = async function() {
    let cmsSec = document.getElementById('sec-cms');
    if (cmsSec.innerHTML.trim() === '') {
      cmsSec.innerHTML = createCmsSectionHtml();
    }
    await loadCmsTreks();
  };

  function createCmsSectionHtml() {
    return `
      <div class="admin-header">
        <div>
          <h1>Enterprise Trek CMS</h1>
          <p style="color: var(--text-muted);">Manage all adventure treks, monthly schedules, images, SEO, and version history without touching code.</p>
        </div>
        <button class="cms-btn cms-btn-primary" onclick="openTrekEditorModal()"><i class="fas fa-plus"></i> Create New Trek</button>
      </div>

      <!-- Toolbar -->
      <div class="cms-toolbar">
        <div class="cms-toolbar-group">
          <input type="text" id="cms-search-input" class="cms-input" placeholder="Search treks..." onkeyup="filterCmsTreks()">
          <select id="cms-status-filter" class="cms-select" onchange="filterCmsTreks()">
            <option value="all">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
            <option value="HIDDEN">Hidden</option>
          </select>
          <select id="cms-zone-filter" class="cms-select" onchange="filterCmsTreks()">
            <option value="all">All Zones</option>
            <option value="maharashtra">Maharashtra</option>
            <option value="western_ghats">Western Ghats</option>
            <option value="himalayas">Himalayas</option>
          </select>
        </div>

        <!-- Bulk Action Toolbar -->
        <div class="cms-toolbar-group">
          <select id="cms-bulk-action-select" class="cms-select">
            <option value="">Bulk Actions...</option>
            <option value="publish">Bulk Publish</option>
            <option value="archive">Bulk Archive</option>
            <option value="delete">Bulk Delete</option>
          </select>
          <button class="cms-btn cms-btn-secondary" onclick="applyBulkTrekAction()"><i class="fas fa-play"></i> Apply</button>
        </div>
      </div>

      <!-- Treks Catalog Table -->
      <div class="table-card">
        <table class="admin-table">
          <thead>
            <tr>
              <th><input type="checkbox" id="cms-select-all" onclick="toggleSelectAllTreks(this)"></th>
              <th>ID</th>
              <th>Trek Title</th>
              <th>Zone / State</th>
              <th>Price</th>
              <th>Status</th>
              <th>Version</th>
              <th>Departures</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="cms-treks-tbody">
            <tr><td colspan="9" style="text-align:center; padding: 30px;">Loading Trek CMS Catalog...</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Rich Trek Editor Modal Drawer -->
      <div id="cms-editor-modal" class="cms-modal">
        <div class="cms-modal-content">
          <div class="cms-modal-header">
            <h2 id="cms-modal-title">Edit Trek Package</h2>
            <button class="cms-btn cms-btn-secondary" onclick="closeTrekEditorModal()"><i class="fas fa-times"></i> Close</button>
          </div>

          <div class="cms-modal-tabs">
            <button class="cms-tab-btn active" onclick="switchCmsTab(this, 'cms-tab-basic')"><i class="fas fa-info-circle"></i> Basic Info</button>
            <button class="cms-tab-btn" onclick="switchCmsTab(this, 'cms-tab-content')"><i class="fas fa-file-alt"></i> Content & Itinerary</button>
            <button class="cms-tab-btn" onclick="switchCmsTab(this, 'cms-tab-media')"><i class="fas fa-images"></i> Media & Gallery</button>
            <button class="cms-tab-btn" onclick="switchCmsTab(this, 'cms-tab-scheduling')"><i class="fas fa-calendar-alt"></i> Monthly Departures</button>
            <button class="cms-tab-btn" onclick="switchCmsTab(this, 'cms-tab-seo')"><i class="fas fa-search"></i> SEO & Meta</button>
            <button class="cms-tab-btn" onclick="switchCmsTab(this, 'cms-tab-versions')"><i class="fas fa-history"></i> Version History</button>
            <button class="cms-tab-btn" onclick="switchCmsTab(this, 'cms-tab-preview')"><i class="fas fa-mobile-alt"></i> Live Preview</button>
          </div>

          <div class="cms-modal-body">
            <form id="cms-editor-form" onsubmit="handleCmsFormSubmit(event)">
              <!-- TAB 1: Basic Info -->
              <div id="cms-tab-basic" class="cms-tab-pane active">
                <div class="cms-form-grid">
                  <div class="cms-form-group">
                    <label>Trek ID (URL Key) *</label>
                    <input type="text" id="cms-field-id" class="cms-input" required placeholder="e.g. kalsubai">
                  </div>
                  <div class="cms-form-group">
                    <label>Trek Title *</label>
                    <input type="text" id="cms-field-title" class="cms-input" required placeholder="e.g. Kalsubai Peak Sunrise Trek">
                  </div>
                  <div class="cms-form-group">
                    <label>Subtitle / Tagline</label>
                    <input type="text" id="cms-field-subtitle" class="cms-input" placeholder="Highest peak of Maharashtra">
                  </div>
                  <div class="cms-form-group">
                    <label>Location *</label>
                    <input type="text" id="cms-field-location" class="cms-input" required placeholder="Igatpuri, Maharashtra">
                  </div>
                  <div class="cms-form-group">
                    <label>Zone / State *</label>
                    <select id="cms-field-zone" class="cms-select">
                      <option value="maharashtra">Maharashtra</option>
                      <option value="western_ghats">Western Ghats</option>
                      <option value="himalayas">Himalayas</option>
                    </select>
                  </div>
                  <div class="cms-form-group">
                    <label>Price (₹) *</label>
                    <input type="number" id="cms-field-price" class="cms-input" required min="0" placeholder="1499">
                  </div>
                  <div class="cms-form-group">
                    <label>Discount Price (₹)</label>
                    <input type="number" id="cms-field-discountPrice" class="cms-input" min="0" placeholder="1299">
                  </div>
                  <div class="cms-form-group">
                    <label>Duration *</label>
                    <input type="text" id="cms-field-duration" class="cms-input" required placeholder="1 Day / 1 Night">
                  </div>
                  <div class="cms-form-group">
                    <label>Difficulty Level</label>
                    <select id="cms-field-difficulty" class="cms-select">
                      <option value="Easy">Easy</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Hard">Hard</option>
                      <option value="Extreme">Extreme</option>
                    </select>
                  </div>
                  <div class="cms-form-group">
                    <label>Max Seats per Trip</label>
                    <input type="number" id="cms-field-maxSeats" class="cms-input" value="30">
                  </div>
                  <div class="cms-form-group">
                    <label>Publication Status</label>
                    <select id="cms-field-status" class="cms-select">
                      <option value="PUBLISHED">Published</option>
                      <option value="DRAFT">Draft</option>
                      <option value="ARCHIVED">Archived</option>
                      <option value="HIDDEN">Hidden</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- TAB 2: Content & Itinerary -->
              <div id="cms-tab-content" class="cms-tab-pane">
                <div class="cms-form-group" style="margin-bottom: 20px;">
                  <label>Full Description *</label>
                  <textarea id="cms-field-description" rows="5" required placeholder="Detailed description of the trek..."></textarea>
                </div>
                <div class="cms-form-grid">
                  <div class="cms-form-group">
                    <label>Highlights (One per line)</label>
                    <textarea id="cms-field-highlights" rows="4" placeholder="Sunrise above clouds&#10;Highest Peak&#10;Ladder climb"></textarea>
                  </div>
                  <div class="cms-form-group">
                    <label>Things to Carry (One per line)</label>
                    <textarea id="cms-field-thingsToCarry" rows="4" placeholder="Trekking shoes&#10;Torch with batteries&#10;2L Water bottle"></textarea>
                  </div>
                  <div class="cms-form-group">
                    <label>Inclusions (One per line)</label>
                    <textarea id="cms-field-inclusions" rows="4" placeholder="Kasara to base travel&#10;Breakfast & Lunch&#10;First Aid & Trek Leaders"></textarea>
                  </div>
                  <div class="cms-form-group">
                    <label>Exclusions (One per line)</label>
                    <textarea id="cms-field-exclusions" rows="4" placeholder="Personal snacks&#10;Mineral water&#10;Travel to Kasara"></textarea>
                  </div>
                </div>
                <div class="cms-form-group" style="margin-top: 20px;">
                  <label>Meeting Point & Pickup Instructions</label>
                  <input type="text" id="cms-field-meetingPoint" class="cms-input" placeholder="Kasara Railway Station at 10:00 PM">
                </div>
              </div>

              <!-- TAB 3: Media & Gallery -->
              <div id="cms-tab-media" class="cms-tab-pane">
                <div class="cms-form-group" style="margin-bottom: 20px;">
                  <label>Hero Image URL</label>
                  <input type="url" id="cms-field-heroImage" class="cms-input" placeholder="https://images.unsplash.com/...">
                </div>

                <label style="font-size: 0.85rem; font-weight:600; color:var(--text-muted);">Gallery Images (Cloudinary Drag & Drop / Direct Input)</label>
                <div class="cms-dropzone" onclick="triggerImageUpload()">
                  <i class="fas fa-cloud-upload-alt" style="font-size: 2.5rem; color:#FF8A00; margin-bottom:10px;"></i>
                  <p>Drag & Drop Images here or click to select files</p>
                  <span style="font-size: 0.8rem; color: #888;">Optimized for Cloudinary CDN & WebP conversion</span>
                </div>
                <input type="file" id="cms-file-input" style="display:none" multiple accept="image/*" onchange="handleFileDrop(this.files)">

                <div class="cms-form-group" style="margin-top: 16px;">
                  <label>Image URLs (comma separated or enter individual URLs)</label>
                  <textarea id="cms-field-imagesText" rows="3" placeholder="https://image1.jpg, https://image2.jpg" onchange="syncImagesFromText()"></textarea>
                </div>

                <div id="cms-images-preview" class="cms-image-preview-grid"></div>
              </div>

              <!-- TAB 4: Monthly Scheduling -->
              <div id="cms-tab-scheduling" class="cms-tab-pane">
                <p style="color: var(--text-muted); margin-bottom: 16px;">Generate recurring weekend/monthly trip departures automatically without touching code.</p>
                <div class="cms-form-grid">
                  <div class="cms-form-group">
                    <label>Start Date</label>
                    <input type="date" id="cms-sched-start" class="cms-input">
                  </div>
                  <div class="cms-form-group">
                    <label>End Date</label>
                    <input type="date" id="cms-sched-end" class="cms-input">
                  </div>
                  <div class="cms-form-group">
                    <label>Departure Days</label>
                    <select id="cms-sched-days" class="cms-select" multiple style="height: 70px;">
                      <option value="6" selected>Saturday</option>
                      <option value="0" selected>Sunday</option>
                      <option value="5">Friday</option>
                    </select>
                  </div>
                  <div class="cms-form-group">
                    <label>Seats per Departure</label>
                    <input type="number" id="cms-sched-seats" class="cms-input" value="30">
                  </div>
                </div>
                <button type="button" class="cms-btn cms-btn-primary" style="margin-top: 16px;" onclick="runBulkDepartureGeneration()"><i class="fas fa-magic"></i> Generate Monthly Schedule</button>
              </div>

              <!-- TAB 5: SEO & Meta -->
              <div id="cms-tab-seo" class="cms-tab-pane">
                <div class="cms-form-grid">
                  <div class="cms-form-group">
                    <label>Meta Title</label>
                    <input type="text" id="cms-field-metaTitle" class="cms-input" placeholder="Kalsubai Trek — Highest Peak Maharashtra">
                  </div>
                  <div class="cms-form-group">
                    <label>Meta Description</label>
                    <textarea id="cms-field-metaDescription" rows="3" placeholder="Book Kalsubai Sunrise Trek with expert leaders..."></textarea>
                  </div>
                  <div class="cms-form-group">
                    <label>Keywords (comma separated)</label>
                    <input type="text" id="cms-field-keywords" class="cms-input" placeholder="kalsubai trek, igatpuri, sunrise trek">
                  </div>
                  <div class="cms-form-group">
                    <label>Open Graph (OG) Image URL</label>
                    <input type="url" id="cms-field-ogImage" class="cms-input" placeholder="https://...">
                  </div>
                </div>
              </div>

              <!-- TAB 6: Version History -->
              <div id="cms-tab-versions" class="cms-tab-pane">
                <p style="color: var(--text-muted); margin-bottom: 16px;">Compare past revisions and restore any snapshot with 1 click.</p>
                <div id="cms-versions-list">
                  <p style="text-align:center;">Select or edit a trek to load version history.</p>
                </div>
              </div>

              <!-- TAB 7: Live Preview -->
              <div id="cms-tab-preview" class="cms-tab-pane" style="height: 60vh;">
                <div style="display:flex; gap:10px; margin-bottom:12px;">
                  <button type="button" class="cms-btn cms-btn-secondary" onclick="setDevicePreview('desktop')"><i class="fas fa-desktop"></i> Desktop</button>
                  <button type="button" class="cms-btn cms-btn-secondary" onclick="setDevicePreview('tablet')"><i class="fas fa-tablet-alt"></i> Tablet</button>
                  <button type="button" class="cms-btn cms-btn-secondary" onclick="setDevicePreview('mobile')"><i class="fas fa-mobile-alt"></i> Mobile</button>
                </div>
                <div class="cms-preview-frame-container">
                  <div id="cms-preview-device" class="cms-preview-device desktop">
                    <iframe id="cms-preview-iframe" class="cms-preview-iframe" src="about:blank"></iframe>
                  </div>
                </div>
              </div>

              <!-- Footer Buttons -->
              <div style="display:flex; justify-content: flex-end; gap:12px; margin-top:24px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.08);">
                <button type="button" class="cms-btn cms-btn-secondary" onclick="closeTrekEditorModal()">Cancel</button>
                <button type="submit" class="cms-btn cms-btn-primary"><i class="fas fa-save"></i> Save & Publish Changes</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  window.loadCmsTreks = async function() {
    try {
      const tbody = document.getElementById('cms-treks-tbody');
      if (tbody) tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding: 20px;">Fetching treks from database...</td></tr>';
      
      currentTreks = await window.api.getCmsTreks();
      renderCmsTreksTable(currentTreks);
    } catch (err) {
      console.error('Failed to load CMS treks:', err);
    }
  };

  function renderCmsTreksTable(treks) {
    const tbody = document.getElementById('cms-treks-tbody');
    if (!tbody) return;

    if (!treks || treks.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding: 20px;">No treks found. Create your first trek above!</td></tr>';
      return;
    }

    tbody.innerHTML = treks.map(t => `
      <tr>
        <td><input type="checkbox" value="${t.id}" onchange="toggleSelectTrek('${t.id}', this.checked)"></td>
        <td><code>${t.id}</code></td>
        <td><strong>${t.title}</strong><br><small style="color:#888;">${t.subtitle || t.location}</small></td>
        <td>${t.zone}</td>
        <td>${t.priceFormatted || '₹' + t.price}</td>
        <td><span class="cms-badge cms-badge-${t.status}">${t.status}</span></td>
        <td>v${t.version || 1}</td>
        <td>${t._count?.trips || 0} Departures</td>
        <td>
          <button class="cms-btn cms-btn-secondary" style="padding: 4px 8px; font-size:0.8rem;" onclick="editTrekCms('${t.id}')"><i class="fas fa-edit"></i> Edit</button>
          <button class="cms-btn cms-btn-secondary" style="padding: 4px 8px; font-size:0.8rem;" onclick="duplicateTrekCms('${t.id}')"><i class="fas fa-copy"></i></button>
        </td>
      </tr>
    `).join('');
  }

  window.filterCmsTreks = function() {
    const q = document.getElementById('cms-search-input')?.value.toLowerCase() || '';
    const status = document.getElementById('cms-status-filter')?.value || 'all';
    const zone = document.getElementById('cms-zone-filter')?.value || 'all';

    const filtered = currentTreks.filter(t => {
      const matchQ = !q || t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.location.toLowerCase().includes(q);
      const matchStatus = status === 'all' || t.status === status;
      const matchZone = zone === 'all' || t.zone === zone;
      return matchQ && matchStatus && matchZone;
    });

    renderCmsTreksTable(filtered);
  };

  window.toggleSelectAllTreks = function(masterCb) {
    selectedTrekIds.clear();
    const cbs = document.querySelectorAll('#cms-treks-tbody input[type="checkbox"]');
    cbs.forEach(cb => {
      cb.checked = masterCb.checked;
      if (masterCb.checked) selectedTrekIds.add(cb.value);
    });
  };

  window.toggleSelectTrek = function(id, isChecked) {
    if (isChecked) selectedTrekIds.add(id);
    else selectedTrekIds.delete(id);
  };

  window.applyBulkTrekAction = async function() {
    const action = document.getElementById('cms-bulk-action-select')?.value;
    if (!action) return alert('Please select a bulk action.');
    if (selectedTrekIds.size === 0) return alert('Select at least one trek.');

    if (!confirm(`Are you sure you want to run '${action}' on ${selectedTrekIds.size} selected treks?`)) return;

    try {
      await window.api.bulkTrekAction(Array.from(selectedTrekIds), action);
      alert('Bulk action executed successfully.');
      selectedTrekIds.clear();
      await loadCmsTreks();
    } catch (err) {
      alert(`Bulk action failed: ${err.message}`);
    }
  };

  window.openTrekEditorModal = function(trek = null) {
    editingTrekId = trek ? trek.id : null;
    document.getElementById('cms-modal-title').innerText = trek ? `Edit Trek: ${trek.title}` : 'Create New Trek Package';

    // Reset Form
    document.getElementById('cms-editor-form').reset();
    currentImages = trek && trek.images ? trek.images.map(img => typeof img === 'string' ? img : img.url) : [];
    updateImagePreviewGrid();

    if (trek) {
      document.getElementById('cms-field-id').value = trek.id;
      document.getElementById('cms-field-id').readOnly = true;
      document.getElementById('cms-field-title').value = trek.title || '';
      document.getElementById('cms-field-subtitle').value = trek.subtitle || '';
      document.getElementById('cms-field-location').value = trek.location || '';
      document.getElementById('cms-field-zone').value = trek.zone || 'maharashtra';
      document.getElementById('cms-field-price').value = trek.price || '';
      document.getElementById('cms-field-discountPrice').value = trek.discountPrice || '';
      document.getElementById('cms-field-duration').value = trek.duration || '';
      document.getElementById('cms-field-difficulty').value = trek.difficulty || 'Moderate';
      document.getElementById('cms-field-description').value = trek.description || '';
      document.getElementById('cms-field-highlights').value = Array.isArray(trek.highlights) ? trek.highlights.join('\n') : '';
      document.getElementById('cms-field-thingsToCarry').value = Array.isArray(trek.thingsToCarry) ? trek.thingsToCarry.join('\n') : '';
      document.getElementById('cms-field-inclusions').value = Array.isArray(trek.inclusions) ? trek.inclusions.join('\n') : '';
      document.getElementById('cms-field-exclusions').value = Array.isArray(trek.exclusions) ? trek.exclusions.join('\n') : '';
      document.getElementById('cms-field-meetingPoint').value = trek.meetingPoint || '';
      document.getElementById('cms-field-status').value = trek.status || 'PUBLISHED';
      document.getElementById('cms-field-heroImage').value = trek.heroImage || '';
      document.getElementById('cms-field-imagesText').value = currentImages.join('\n');
      document.getElementById('cms-field-metaTitle').value = trek.metaTitle || '';
      document.getElementById('cms-field-metaDescription').value = trek.metaDescription || '';
      document.getElementById('cms-field-keywords').value = trek.keywords || '';

      loadVersionHistory(trek.id);
    } else {
      document.getElementById('cms-field-id').readOnly = false;
    }

    document.getElementById('cms-editor-modal').classList.add('active');
  };

  window.closeTrekEditorModal = function() {
    document.getElementById('cms-editor-modal').classList.remove('active');
  };

  window.editTrekCms = async function(id) {
    try {
      const trek = await window.api.getCmsTrek(id);
      openTrekEditorModal(trek);
    } catch (err) {
      alert(`Failed to load trek details: ${err.message}`);
    }
  };

  window.duplicateTrekCms = async function(id) {
    const newId = prompt('Enter ID for duplicated trek:', `${id}-copy`);
    if (!newId) return;

    try {
      await window.api.duplicateTrek(id, newId, `Copy of ${id}`);
      alert('Trek duplicated successfully.');
      await loadCmsTreks();
    } catch (err) {
      alert(`Duplication failed: ${err.message}`);
    }
  };

  window.switchCmsTab = function(btn, tabId) {
    document.querySelectorAll('.cms-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.cms-tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(tabId)?.classList.add('active');
  };

  window.triggerImageUpload = function() {
    document.getElementById('cms-file-input').click();
  };

  window.handleFileDrop = async function(files) {
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (e) => {
        currentImages.push(e.target.result);
        updateImagePreviewGrid();
        document.getElementById('cms-field-imagesText').value = currentImages.join('\n');
      };
      reader.readAsDataURL(file);
    }
  };

  function updateImagePreviewGrid() {
    const grid = document.getElementById('cms-images-preview');
    if (!grid) return;

    grid.innerHTML = currentImages.map((url, idx) => `
      <div class="cms-image-thumb">
        <img src="${url}">
        <button type="button" class="cms-image-remove" onclick="removeCmsImage(${idx})">&times;</button>
      </div>
    `).join('');
  }

  window.removeCmsImage = function(idx) {
    currentImages.splice(idx, 1);
    updateImagePreviewGrid();
    document.getElementById('cms-field-imagesText').value = currentImages.join('\n');
  };

  window.syncImagesFromText = function() {
    const text = document.getElementById('cms-field-imagesText').value;
    currentImages = text.split('\n').map(s => s.trim()).filter(Boolean);
    updateImagePreviewGrid();
  };

  window.runBulkDepartureGeneration = async function() {
    const trekId = document.getElementById('cms-field-id').value;
    const startDate = document.getElementById('cms-sched-start').value;
    const endDate = document.getElementById('cms-sched-end').value;
    if (!trekId || !startDate || !endDate) return alert('Trek ID, Start Date, and End Date are required.');

    try {
      const res = await window.api.bulkCreateDepartures(trekId, startDate, endDate);
      alert(res.message);
    } catch (err) {
      alert(`Scheduling failed: ${err.message}`);
    }
  };

  async function loadVersionHistory(trekId) {
    const container = document.getElementById('cms-versions-list');
    if (!container) return;
    try {
      const versions = await window.api.getTrekVersions(trekId);
      if (!versions || versions.length === 0) {
        container.innerHTML = '<p>No previous versions recorded.</p>';
        return;
      }

      container.innerHTML = versions.map(v => `
        <div style="background:#181818; padding:12px; border-radius:8px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong>Version ${v.version}</strong> — <small>${new Date(v.createdAt).toLocaleString()}</small><br>
            <small style="color:#888;">Edited by: ${v.editedBy || 'Admin'}</small>
          </div>
          <button type="button" class="cms-btn cms-btn-secondary" style="font-size:0.8rem;" onclick="restoreVersionCms('${trekId}', ${v.id})">Restore Version</button>
        </div>
      `).join('');
    } catch (err) {
      container.innerHTML = `<p style="color:red">Failed to load versions: ${err.message}</p>`;
    }
  }

  window.restoreVersionCms = async function(trekId, versionId) {
    if (!confirm(`Restore this version snapshot?`)) return;
    try {
      await window.api.restoreTrekVersion(trekId, versionId);
      alert('Version restored successfully.');
      closeTrekEditorModal();
      await loadCmsTreks();
    } catch (err) {
      alert(`Restore failed: ${err.message}`);
    }
  };

  window.setDevicePreview = function(device) {
    const dev = document.getElementById('cms-preview-device');
    if (dev) {
      dev.className = `cms-preview-device ${device}`;
      const iframe = document.getElementById('cms-preview-iframe');
      const trekId = document.getElementById('cms-field-id').value;
      if (iframe && trekId) {
        iframe.src = `trek-details.html?id=${trekId}`;
      }
    }
  };

  window.handleCmsFormSubmit = async function(e) {
    e.preventDefault();
    const id = document.getElementById('cms-field-id').value.trim();
    const title = document.getElementById('cms-field-title').value.trim();
    if (!id || !title) return alert('Trek ID and Title are required.');

    const data = {
      id,
      title,
      subtitle: document.getElementById('cms-field-subtitle').value.trim(),
      location: document.getElementById('cms-field-location').value.trim(),
      zone: document.getElementById('cms-field-zone').value,
      price: parseFloat(document.getElementById('cms-field-price').value) || 0,
      discountPrice: parseFloat(document.getElementById('cms-field-discountPrice').value) || null,
      duration: document.getElementById('cms-field-duration').value.trim(),
      difficulty: document.getElementById('cms-field-difficulty').value,
      days: document.getElementById('cms-field-duration').value.split('/')[0].trim() || '1 Day',
      description: document.getElementById('cms-field-description').value.trim(),
      highlights: document.getElementById('cms-field-highlights').value.split('\n').map(s => s.trim()).filter(Boolean),
      thingsToCarry: document.getElementById('cms-field-thingsToCarry').value.split('\n').map(s => s.trim()).filter(Boolean),
      inclusions: document.getElementById('cms-field-inclusions').value.split('\n').map(s => s.trim()).filter(Boolean),
      exclusions: document.getElementById('cms-field-exclusions').value.split('\n').map(s => s.trim()).filter(Boolean),
      meetingPoint: document.getElementById('cms-field-meetingPoint').value.trim(),
      status: document.getElementById('cms-field-status').value,
      heroImage: document.getElementById('cms-field-heroImage').value.trim(),
      images: currentImages,
      metaTitle: document.getElementById('cms-field-metaTitle').value.trim(),
      metaDescription: document.getElementById('cms-field-metaDescription').value.trim(),
      keywords: document.getElementById('cms-field-keywords').value.trim(),
      maxSeats: parseInt(document.getElementById('cms-field-maxSeats').value) || 30,
    };

    try {
      await window.api.saveCmsTrek(data);
      alert(`Trek '${title}' saved successfully!`);
      closeTrekEditorModal();
      await loadCmsTreks();
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    }
  };
})();
