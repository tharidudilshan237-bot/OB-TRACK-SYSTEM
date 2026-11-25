/**
 * ============================================================================
 * OB Track – Smart OB Operations & Equipment Management System
 * Core Application JavaScript (script.js)
 * Client: Ads Art (Pvt) Ltd
 * Features: Module Navigation, User Role Authorization, Dynamic Filtering,
 *           Operational Actions, and UI State Management
 * ============================================================================
 */

// Global State
const OBTrack = {
  currentUser: 'Dilipa',
  currentRole: 'Manager',
  activeLocation: 'ALL',
  activeModule: 'dashboard'
};

// ----------------------------------------------------------------------------
// 1. INITIALIZATION & EVENT LISTENERS
// ----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initUserSession();
  initLocationFilter();
  initSearchFilters();
  console.log('OB Track Engine Initialized. Current User:', OBTrack.currentUser);
});

/**
 * Initialize Default User Session
 */
function initUserSession() {
  setUser(OBTrack.currentUser, OBTrack.currentRole);
}

/**
 * Switch Active User Role (Demo Toggle)
 * @param {string} username - 'Dilipa' or 'Tharidu'
 * @param {string} role - 'Manager' or 'Technician'
 */
function setUser(username, role) {
  OBTrack.currentUser = username;
  OBTrack.currentRole = role;

  // Update UI Header
  const userNameEl = document.getElementById('current-user-name');
  const userRoleEl = document.getElementById('current-user-role');
  
  if (userNameEl) userNameEl.innerText = username;
  if (userRoleEl) userRoleEl.innerText = role;

  // Toggle Manager-only UI elements
  const managerElements = document.querySelectorAll('.manager-only, .manager-only-btn');
  managerElements.forEach(el => {
    if (role === 'Manager') {
      el.style.display = '';
      el.removeAttribute('disabled');
    } else {
      el.style.display = 'none';
      el.setAttribute('disabled', 'true');
    }
  });

  showToast(`Switched account to ${username} (${role})`);
}

// ----------------------------------------------------------------------------
// 2. MODULE NAVIGATION & UI SWITCHING
// ----------------------------------------------------------------------------

/**
 * Switch between system modules
 * @param {string} moduleId - Target module ID (e.g., 'dashboard', 'inventory')
 * @param {HTMLElement} [navLink] - Clicked sidebar element
 */
function switchModule(moduleId, navLink) {
  OBTrack.activeModule = moduleId;

  // Hide all module sections
  const modules = document.querySelectorAll('.module-section');
  modules.forEach(sec => sec.classList.remove('active'));

  // Show target module section
  const targetModule = document.getElementById(`mod-${moduleId}`);
  if (targetModule) {
    targetModule.classList.add('active');
  } else {
    console.warn(`Module section [mod-${moduleId}] not found in DOM.`);
  }

  // Update Sidebar active state
  if (navLink) {
    const sidebarLinks = document.querySelectorAll('#sidebar .nav-link');
    sidebarLinks.forEach(link => link.classList.remove('active'));
    navLink.classList.add('active');
  }

  // Update Header Page Title
  updatePageTitle(moduleId);
}

/**
 * Update Top Navbar Title based on active module
 */
function updatePageTitle(moduleId) {
  const titles = {
    dashboard: 'Operational Dashboard',
    inventory: 'Equipment Inventory Register',
    packup: 'Production Pack-up Checklist',
    transfers: 'Equipment Transfer Management',
    rentals: 'Commercial Rental Management',
    gatepass: 'Digital Gate Pass Management',
    faults: 'Live Production Fault Reporting',
    repairs: 'Repair & Maintenance Tracking',
    attendance: 'Staff Attendance Register',
    reports: 'System History & PDF Reports',
    backup: 'Google Drive Database Backup',
    settings: 'User Management & System Settings'
  };

  const titleEl = document.getElementById('page-title');
  if (titleEl) {
    titleEl.innerText = titles[moduleId] || 'OB Track Workspace';
  }
}

// ----------------------------------------------------------------------------
// 3. LOCATION FILTERING MECHANICS
// ----------------------------------------------------------------------------

function initLocationFilter() {
  const locSelect = document.getElementById('global-location');
  if (locSelect) {
    locSelect.addEventListener('change', (e) => {
      OBTrack.activeLocation = e.target.value;
      filterTableDataByLocation(OBTrack.activeLocation);
      showToast(`Filter applied: ${OBTrack.activeLocation}`);
    });
  }
}

/**
 * Filter visible table rows across modules based on location
 */
function filterTableDataByLocation(location) {
  const rows = document.querySelectorAll('tbody tr[data-location]');
  rows.forEach(row => {
    const rowLoc = row.getAttribute('data-location');
    if (location === 'ALL' || rowLoc === location) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

// ----------------------------------------------------------------------------
// 4. OPERATIONAL MODULE WORKFLOWS & ACTIONS
// ----------------------------------------------------------------------------

/**
 * Approve Gate Pass (Dilipa Only)
 * @param {string} passNumber - e.g. 'GP-2026-0082'
 */
function approveGatePass(passNumber) {
  if (OBTrack.currentRole !== 'Manager') {
    alert('AUTHORIZATION DENIED!\nOnly Dilipa (Equipment Manager) can approve Gate Passes.');
    return;
  }

  const confirmAction = confirm(`Are you sure you want to approve Gate Pass [${passNumber}]?`);
  if (confirmAction) {
    showToast(`Gate Pass ${passNumber} APPROVED by Dilipa!`, 'success');
    // Update UI badge dynamically if exists
    const row = document.querySelector(`tr[data-pass="${passNumber}"]`);
    if (row) {
      const badge = row.querySelector('.approval-badge');
      if (badge) {
        badge.className = 'badge bg-success approval-badge';
        badge.innerText = 'Approved';
      }
    }
  }
}

/**
 * Reject Gate Pass (Dilipa Only)
 */
function rejectGatePass(passNumber) {
  if (OBTrack.currentRole !== 'Manager') {
    alert('AUTHORIZATION DENIED!\nOnly Dilipa (Equipment Manager) can reject Gate Passes.');
    return;
  }

  const reason = prompt(`Enter rejection reason for Gate Pass [${passNumber}]:`);
  if (reason) {
    showToast(`Gate Pass ${passNumber} REJECTED. Reason: ${reason}`, 'warning');
  }
}

/**
 * Trigger Google Drive Backup (Dilipa Only)
 */
function triggerDriveBackup() {
  if (OBTrack.currentRole !== 'Manager') {
    alert('AUTHORIZATION DENIED!\nOnly Dilipa (Equipment Manager) can initiate database backups.');
    return;
  }

  showToast('Starting MySQL database dump and Google Drive upload...', 'info');
  
  setTimeout(() => {
    showToast('Database Backup successfully saved to Google Drive!', 'success');
  }, 1500);
}

/**
 * Authorize Missing Equipment Write-off (Dilipa Only)
 */
function authorizeWriteoff(itemId, equipName) {
  if (OBTrack.currentRole !== 'Manager') {
    alert('AUTHORIZATION DENIED!\nOnly Dilipa can authorize permanent equipment write-offs.');
    return;
  }

  const confirmWriteoff = confirm(`Confirm permanent write-off for missing asset: ${equipName}?\nThis will permanently update qty_total.`);
  if (confirmWriteoff) {
    showToast(`Asset [${equipName}] authorized for write-off by Dilipa.`, 'danger');
  }
}

/**
 * Log Live Production Fault
 */
function logFaultReport(event) {
  if (event) event.preventDefault();
  
  const equipName = document.getElementById('fault-equip-select')?.value || 'Sony Camera';
  const location = document.getElementById('fault-location-select')?.value || 'LN OB';
  const desc = document.getElementById('fault-desc')?.value || 'No details';

  showToast(`Fault logged for ${equipName} at ${location}. Locked in qty_repair.`, 'warning');
}

/**
 * Execute Inter-Location Transfer
 */
function executeTransfer(event) {
  if (event) event.preventDefault();

  const fromLoc = document.getElementById('transfer-from')?.value;
  const toLoc = document.getElementById('transfer-to')?.value;

  if (fromLoc === toLoc) {
    alert('Source and Destination locations must be different!');
    return;
  }

  showToast(`Transfer initiated from ${fromLoc} to ${toLoc}. Status: In Transit.`, 'success');
}

// ----------------------------------------------------------------------------
// 5. SEARCH & TABLE FILTERING
// ----------------------------------------------------------------------------

function initSearchFilters() {
  const searchInputs = document.querySelectorAll('.table-search-input');
  searchInputs.forEach(input => {
    input.addEventListener('keyup', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const tableId = e.target.getAttribute('data-table');
      const table = document.getElementById(tableId);

      if (table) {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
          const text = row.innerText.toLowerCase();
          row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
      }
    });
  });
}

// ----------------------------------------------------------------------------
// 6. TOAST NOTIFICATION UTILITY
// ----------------------------------------------------------------------------

function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999;';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bgClass = type === 'success' ? 'bg-success' : type === 'warning' ? 'bg-warning text-dark' : type === 'danger' ? 'bg-danger' : 'bg-dark';
  
  toast.className = `toast align-items-center text-white ${bgClass} border-0 show mb-2`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body fw-semibold">
        <i class="fa-solid fa-circle-info me-2"></i> ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.parentElement.parentElement.remove()"></button>
    </div>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, 4000);
}
