// Orthodox Calendar Data
const orthodoxHolidays = {
    "01-07": { name: "Nativity of Christ (Christmas)", type: "major", fasting: false },
    "01-14": { name: "Circumcision of Christ / St. Basil", type: "feast", fasting: false },
    "01-19": { name: "Theophany (Epiphany)", type: "major", fasting: false },
    "02-02": { name: "Presentation of Christ", type: "major", fasting: false },
    "03-25": { name: "Annunciation", type: "major", fasting: false },
    "06-24": { name: "Nativity of St. John the Baptist", type: "feast", fasting: false },
    "06-29": { name: "Sts. Peter and Paul", type: "feast", fasting: false },
    "08-06": { name: "Transfiguration", type: "major", fasting: false },
    "08-15": { name: "Dormition of the Theotokos", type: "major", fasting: false },
    "09-08": { name: "Nativity of the Theotokos", type: "major", fasting: false },
    "09-14": { name: "Elevation of the Holy Cross", type: "major", fasting: true },
    "10-01": { name: "Protection of the Theotokos", type: "feast", fasting: false },
    "11-08": { name: "Synaxis of Archangel Michael", type: "feast", fasting: false },
    "11-21": { name: "Entrance of Theotokos into Temple", type: "major", fasting: false },
    "12-06": { name: "St. Nicholas the Wonderworker", type: "feast", fasting: false }
};

const saintDays = {
    "01-01": "St. Basil the Great",
    "01-17": "St. Anthony the Great",
    "01-20": "St. Euthymius the Great",
    "01-30": "Three Holy Hierarchs",
    "02-10": "St. Charalambos",
    "03-09": "Forty Martyrs of Sebaste",
    "04-23": "St. George the Great Martyr",
    "05-08": "St. John the Theologian",
    "05-21": "Sts. Constantine and Helen",
    "07-11": "St. Euphemia",
    "07-20": "Prophet Elijah",
    "07-27": "St. Panteleimon",
    "08-29": "Beheading of St. John the Baptist",
    "09-24": "St. Silouan the Athonite",
    "10-18": "St. Luke the Evangelist",
    "10-26": "St. Demetrios",
    "11-13": "St. John Chrysostom",
    "11-30": "St. Andrew the Apostle",
    "12-04": "St. Barbara",
    "12-13": "St. Herman of Alaska"
};

// Server configuration
// Set custom server URL or leave empty for GitHub Pages (no server sync)
let customServerUrl = localStorage.getItem('customServerUrl') || '';
// Auto-detect: if running on GitHub Pages or file://, disable server sync
const isGitHubPages = window.location.hostname.includes('github.io');
const isFileProtocol = window.location.protocol === 'file:';
const serverSyncEnabled = !isGitHubPages && !isFileProtocol && window.location.hostname === 'localhost';

// Security & Validation Helpers
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneDigits = phone.replace(/\D/g, '');
    return phoneDigits.length >= 10 && phoneDigits.length <= 15;
}

function validateCUI(cui) {
    // Romanian CUI validation (basic)
    const cuiClean = cui.replace(/[^0-9]/g, '');
    return cuiClean.length >= 2 && cuiClean.length <= 10;
}

function validateIBAN(iban) {
    // Basic IBAN validation (Romanian)
    const ibanClean = iban.replace(/\s/g, '').toUpperCase();
    return ibanClean.startsWith('RO') && ibanClean.length === 24;
}

// Undo functionality - store last deleted item
let lastDeletedItem = null;

function storeDeletedItem(type, item) {
    lastDeletedItem = {
        type: type, // 'client', 'appointment', 'invoice', 'quote'
        item: JSON.parse(JSON.stringify(item)), // deep copy
        timestamp: Date.now()
    };
    
    // Clear after 30 seconds
    setTimeout(() => {
        if (lastDeletedItem && lastDeletedItem.timestamp === item.timestamp) {
            lastDeletedItem = null;
        }
    }, 30000);
    
    showNotification('🗑️ Șters! Apasă Ctrl+Z în 30 sec pentru Undo', 'info');
}

function undoDelete() {
    if (!lastDeletedItem) {
        showNotification('❌ Nu există nimic de anulat', 'error');
        return;
    }
    
    const { type, item } = lastDeletedItem;
    
    switch(type) {
        case 'client':
            clients.push(item);
            renderClients();
            showNotification('✅ Client restaurat!', 'success');
            break;
        case 'appointment':
            appointments.push(item);
            renderAppointments();
            renderCalendar();
            showNotification('✅ Programare restaurată!', 'success');
            break;
        case 'invoice':
            invoices.push(item);
            renderInvoices();
            showNotification('✅ Factură restaurată!', 'success');
            break;
        case 'quote':
            quotations.push(item);
            renderQuotations();
            showNotification('✅ Ofertă restaurată!', 'success');
            break;
    }
    
    saveToLocalStorage();
    lastDeletedItem = null;
}

// Notification system
function showNotification(message, type = 'info') {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };
    
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 0.95rem;
        font-weight: 600;
        z-index: 10001;
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        max-width: 300px;
        word-wrap: break-word;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations for notifications
if (!document.getElementById('notificationStyle')) {
    const style = document.createElement('style');
    style.id = 'notificationStyle';
    style.textContent = `
        @keyframes slideInRight {
            from { 
                opacity: 0; 
                transform: translateX(100px); 
            }
            to { 
                opacity: 1; 
                transform: translateX(0); 
            }
        }
        @keyframes slideOutRight {
            from { 
                opacity: 1; 
                transform: translateX(0); 
            }
            to { 
                opacity: 0; 
                transform: translateX(100px); 
            }
        }
    `;
    document.head.appendChild(style);
}

// Keyboard shortcuts help modal
function showKeyboardShortcutsHelp() {
    const shortcuts = [
        { key: 'N', action: 'Adaugă Programare Nouă' },
        { key: 'C', action: 'Adaugă Client Nou' },
        { key: 'F', action: 'Adaugă Factură Nouă' },
        { key: 'Q', action: 'Adaugă Ofertă Nouă' },
        { key: 'S', action: 'Focus pe Căutare Globală' },
        { key: 'D', action: 'Mergi la Dashboard' },
        { key: 'P', action: 'Mergi la Programări' },
        { key: 'K', action: 'Mergi la Calendar' },
        { key: 'Ctrl+S', action: 'Salvează Manual' },
        { key: 'Ctrl+Z', action: 'Anulează Ultima Ștergere (30s)' },
        { key: '?', action: 'Afișează Acest Help' }
    ];
    
    let html = '<div style="padding: 20px;">';
    html += '<h3 style="margin-top: 0; color: #667eea;">⌨️ Scurtături de Tastatură</h3>';
    html += '<table style="width: 100%; border-collapse: collapse;">';
    html += '<thead><tr style="background: #f5f5f5;"><th style="padding: 10px; text-align: left;">Tastă</th><th style="padding: 10px; text-align: left;">Acțiune</th></tr></thead>';
    html += '<tbody>';
    
    shortcuts.forEach(shortcut => {
        html += `
            <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 10px;"><kbd style="background: #333; color: white; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${shortcut.key}</kbd></td>
                <td style="padding: 10px;">${shortcut.action}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    html += '<p style="color: #666; font-size: 0.9rem; margin-top: 15px;">💡 Scurtăturile funcționează doar când nu editezi un câmp.</p>';
    html += '</div>';
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <span class="close" onclick="this.parentElement.parentElement.remove();">&times;</span>
            ${html}
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

let clients = JSON.parse(localStorage.getItem("clients")) || [];
let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
let quotations = JSON.parse(localStorage.getItem('quotations')) || [];
let businessInfo = JSON.parse(localStorage.getItem('businessInfo')) || {
    name: 'Your Business Name',
    email: 'business@example.com',
    phone: '(555) 123-4567',
    address: '123 Main Street\nCity, State ZIP',
    // E-INVOICE FIELDS
    cui: '',           // CUI/CIF - Romanian tax number
    regCom: '',        // Register of Commerce number
    city: 'City',
    county: 'County',
    postalCode: '00000',
    iban: '',
    bank: '',
    invoiceSeries: 'INV',  // Prefix for invoice numbering
    quoteSeriesPrefix: 'OFR' // Prefix for quotation numbering
};

// Telegram Bot Configuration
let telegramBotToken = localStorage.getItem('telegramBotToken') || '';

// Debounce helper function
let saveTimeout = null;
function debounce(func, delay) {
    return function(...args) {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Check localStorage space availability
function checkLocalStorageSpace() {
    try {
        const testKey = '_storage_test_';
        const testData = new Array(1024 * 1024).join('a'); // 1MB test
        localStorage.setItem(testKey, testData);
        localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        console.warn('⚠️ localStorage space is running low');
        return false;
    }
}

// Centralized localStorage save function with error handling
function saveToLocalStorage() {
    try {
        const timestamp = Date.now();
        
        // Validate data before saving
        if (!Array.isArray(clients) || !Array.isArray(appointments) || !Array.isArray(invoices) || !Array.isArray(quotations)) {
            console.error('❌ Invalid data structure, skipping save');
            return;
        }
        
        localStorage.setItem('clients', JSON.stringify(clients));
        localStorage.setItem('appointments', JSON.stringify(appointments));
        localStorage.setItem('invoices', JSON.stringify(invoices));
        localStorage.setItem('quotations', JSON.stringify(quotations));
        localStorage.setItem('businessInfo', JSON.stringify(businessInfo));
        localStorage.setItem('lastModified', timestamp.toString());
        
        console.log('✅ Data saved to localStorage');
        
        // Show brief save indicator (non-intrusive)
        showSaveIndicator();
        
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            console.error('❌ localStorage quota exceeded!');
            alert('⚠️ Spațiul de stocare este plin! Vă rugăm să exportați datele și să ștergeți înregistrări vechi.');
        } else {
            console.error('❌ Error saving to localStorage:', e);
        }
    }
}

// Debounced save function for frequent operations
const debouncedSave = debounce(saveToLocalStorage, 1000);

// Visual save indicator (non-intrusive)
function showSaveIndicator() {
    const indicator = document.createElement('div');
    indicator.textContent = '💾 Salvat';
    indicator.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: #10b981;
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 600;
        z-index: 10000;
        animation: fadeInOut 2s ease-in-out;
        pointer-events: none;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    `;
    document.body.appendChild(indicator);
    setTimeout(() => indicator.remove(), 2000);
}

// Add CSS animation for save indicator
if (!document.getElementById('saveIndicatorStyle')) {
    const style = document.createElement('style');
    style.id = 'saveIndicatorStyle';
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(10px); }
            10% { opacity: 1; transform: translateY(0); }
            90% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-10px); }
        }
    `;
    document.head.appendChild(style);
}

// Sync data to server
function syncToServer() {
    // Skip sync if server is not available
    if (!serverSyncEnabled && !customServerUrl) {
        console.log('ℹ️ Server sync disabled (GitHub Pages mode)');
        return;
    }
    
    const syncData = {
        clients: clients,
        appointments: appointments,
        invoices: invoices,
        quotations: quotations,
        businessInfo: businessInfo,
        timestamp: Date.now()
    };
    
    const serverUrl = customServerUrl || window.location.origin;
    
    fetch(`${serverUrl}/save_sync_data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(syncData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('☁️ Synced to server:', data);
        }
    })
    .catch(error => {
        console.log('ℹ️ Server sync skipped:', error.message);
    });
}

// Load data from server
function loadFromServer() {
    // Skip if server sync is disabled
    if (!serverSyncEnabled && !customServerUrl) {
        updateSyncStatus('ℹ️ Offline mode (no server)');
        console.log('ℹ️ Server sync disabled (GitHub Pages/Offline mode)');
        return;
    }
    
    const serverUrl = customServerUrl || window.location.origin;
    
    fetch(`${serverUrl}/get_sync_data`)
        .then(response => response.json())
        .then(serverData => {
            if (serverData.error) {
                updateSyncStatus('ℹ️ No data on server');
                return;
            }
            
            console.log('📥 Merging data from server...');
            
            // MERGE instead of replace
            const serverClients = serverData.clients || [];
            const serverAppointments = serverData.appointments || [];
            const serverInvoices = serverData.invoices || [];
            const serverQuotations = serverData.quotations || [];
            
            // Add any clients from server that we don't have
            serverClients.forEach(serverClient => {
                const exists = clients.find(c => c.id === serverClient.id);
                if (!exists) {
                    clients.push(serverClient);
                    console.log('Added client from server:', serverClient.name);
                }
            });
            
            // Add any appointments from server that we don't have
            serverAppointments.forEach(serverAppt => {
                const exists = appointments.find(a => a.id === serverAppt.id);
                if (!exists) {
                    appointments.push(serverAppt);
                }
            });
            
            // Add any invoices from server that we don't have
            serverInvoices.forEach(serverInv => {
                const exists = invoices.find(i => i.id === serverInv.id);
                if (!exists) {
                    invoices.push(serverInv);
                }
            });
            
            // Add any quotations from server that we don't have
            serverQuotations.forEach(serverQuote => {
                const exists = quotations.find(q => q.id === serverQuote.id);
                if (!exists) {
                    quotations.push(serverQuote);
                }
            });
            
            // Save merged data locally
            localStorage.setItem('clients', JSON.stringify(clients));
            localStorage.setItem('appointments', JSON.stringify(appointments));
            localStorage.setItem('invoices', JSON.stringify(invoices));
            localStorage.setItem('quotations', JSON.stringify(quotations));
            localStorage.setItem('lastModified', Date.now().toString());
            
            // Refresh views
            renderDashboard();
            renderClients();
            renderAppointments();
            renderInvoices();
            renderCalendar();
            
            updateSyncStatus(`✅ ${clients.length} clients, ${appointments.length} appointments`);
            console.log('✅ Merged:', clients.length, 'clients');
        })
        .catch(error => {
            updateSyncStatus('ℹ️ Server offline');
            console.log('ℹ️ Server unavailable:', error.message);
        });
}

// Push to server
function pushToServer() {
    // Check if server sync is available
    if (!serverSyncEnabled && !customServerUrl) {
        alert('ℹ️ Server sync is disabled in GitHub Pages mode.\n\nData is stored locally in your browser.\n\nTo enable server sync, run the app locally with Python server.');
        return;
    }
    
    const btn = document.querySelector('.push-btn');
    btn.disabled = true;
    updateSyncStatus('⬆️ Pushing...');
    
    syncToServer();
    
    setTimeout(() => {
        btn.disabled = false;
        const now = new Date().toLocaleTimeString();
        localStorage.setItem('lastPush', now);
        document.getElementById('lastPush').textContent = `⬆️ Last push: ${now}`;
        updateSyncStatus('✅ Pushed to server');
    }, 500);
}

// Pull from server
function pullFromServer() {
    // Check if server sync is available
    if (!serverSyncEnabled && !customServerUrl) {
        alert('ℹ️ Server sync is disabled in GitHub Pages mode.\n\nData is stored locally in your browser.\n\nTo enable server sync, run the app locally with Python server.');
        return;
    }
    
    // Create backup before pulling
    createBackup();
    
    const btn = document.querySelector('.pull-btn');
    btn.disabled = true;
    updateSyncStatus('⬇️ Pulling...');
    
    loadFromServer();
    
    setTimeout(() => {
        btn.disabled = false;
        const now = new Date().toLocaleTimeString();
        localStorage.setItem('lastPull', now);
        document.getElementById('lastPull').textContent = `⬇️ Last pull: ${now}`;
    }, 500);
}

// Create backup before overwriting
function createBackup() {
    const timestamp = Date.now();
    const backup = {
        clients: clients,
        appointments: appointments,
        invoices: invoices,
        businessInfo: businessInfo,
        timestamp: timestamp,
        date: new Date().toLocaleString()
    };
    
    // Keep last 10 backups
    let backups = JSON.parse(localStorage.getItem('backups') || '[]');
    backups.unshift(backup);
    if (backups.length > 10) {
        backups = backups.slice(0, 10);
    }
    localStorage.setItem('backups', JSON.stringify(backups));
    console.log('💾 Backup created:', backup.date);
}

// Show backups modal
function showBackups() {
    const backups = JSON.parse(localStorage.getItem('backups') || '[]');
    
    if (backups.length === 0) {
        alert('No backups available yet. Backups are created automatically before pulling from server.');
        return;
    }
    
    let html = '<div style="max-height: 400px; overflow-y: auto;">';
    html += '<h3>Available Backups</h3>';
    html += '<p style="color: #666; font-size: 0.9rem;">Backups are created automatically before pulling from server</p>';
    
    backups.forEach((backup, index) => {
        html += `
            <div style="background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>📅 ${backup.date}</strong><br>
                        <span style="color: #666; font-size: 0.9rem;">
                            ${backup.clients.length} clients, ${backup.appointments.length} appointments, ${backup.invoices.length} invoices
                        </span>
                    </div>
                    <button onclick="restoreBackup(${index})" class="btn" style="background: #667eea; color: white; padding: 8px 16px;">
                        ↩️ Restore
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <span class="close" onclick="this.parentElement.parentElement.remove(); const fab = document.querySelector('.fab-container'); if(fab) fab.classList.remove('hidden');">&times;</span>
            ${html}
        </div>
    `;
    document.body.appendChild(modal);
    
    // Hide FAB buttons when modal opens on mobile
    const fabContainer = document.querySelector('.fab-container');
    if (fabContainer) fabContainer.classList.add('hidden');
}

// Restore from backup
function restoreBackup(index) {
    const backups = JSON.parse(localStorage.getItem('backups') || '[]');
    const backup = backups[index];
    
    if (!backup) return;
    
    if (!confirm(`Restore backup from ${backup.date}?\n\nThis will replace your current data with:\n${backup.clients.length} clients\n${backup.appointments.length} appointments\n${backup.invoices.length} invoices`)) {
        return;
    }
    
    clients = backup.clients;
    appointments = backup.appointments;
    invoices = backup.invoices;
    businessInfo = backup.businessInfo;
    
    saveToLocalStorage();
    
    renderDashboard();
    renderClients();
    renderAppointments();
    renderInvoices();
    renderCalendar();
    
    alert('✅ Backup restored successfully!');
    document.querySelector('.modal').remove();
}

// Initialize app
document.addEventListener("DOMContentLoaded", function() {
    console.log('🚀 App initializing...');
    
    // Load data from localStorage first
    loadDataFromStorage();
    
    // Show dashboard content panel by default (both mobile and desktop)
    const dashboardPanel = document.getElementById('dashboardContentPanel');
    if (dashboardPanel) {
        dashboardPanel.style.display = 'block';
        const dashboardBtn = document.getElementById('dashboardToggleBtn');
        if (dashboardBtn) dashboardBtn.classList.add('active');
    }
    
    // Ensure sync panel is hidden by default
    const syncPanel = document.getElementById('syncControlsPanel');
    if (syncPanel) {
        syncPanel.style.display = 'none';
        const syncBtn = document.getElementById('syncToggleBtn');
        if (syncBtn) syncBtn.classList.remove('active');
    }
    
    // Force hide syncInfoModal on mobile - PERMANENTLY DISABLED
    const syncInfoModal = document.getElementById('syncInfoModal');
    if (syncInfoModal) {
        syncInfoModal.style.display = 'none';
        syncInfoModal.style.visibility = 'hidden';
        syncInfoModal.classList.add('permanently-hidden');
    }
    
    // Force hide all modals at startup to prevent auto-popup on mobile
    const allModals = [
        'appointmentDetailModal',
        'appointmentModal',
        'clientModal',
        'invoiceModal',
        'invoiceDetailModal',
        'quoteModal',
        'quoteDetailModal'
    ];
    
    allModals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    });
    
    initializeTabs();
    initializeModals();
    initializeEventListeners();
    initializeSmartFeatures(); // NEW: Initialize smart features
    
    // Initialize invoices and quotations with delay for DOM readiness
    setTimeout(() => {
        if (document.getElementById('addInvoiceBtn')) {
            initializeInvoices();
        }
        if (document.getElementById('addQuoteBtn')) {
            initializeQuotations();
        }
    }, 100);
    updateDateTime();
    setInterval(updateDateTime, 60000);
    
    // Render everything with loaded data
    renderDashboard();
    renderClients();
    renderAppointments();
    if (document.getElementById('invoicesList')) {
        renderInvoices();
    }
    if (document.getElementById('quotationsContainer')) {
        renderQuotations();
    }
    renderCalendar();
    
    // Render smart notifications
    renderSmartNotifications();
    updateSmartStats();
    
    console.log('✅ App loaded successfully!');
    
    // Display server sync status
    if (!serverSyncEnabled && !customServerUrl) {
        updateSyncStatus('ℹ️ Mod Offline (GitHub Pages)');
        console.log('ℹ️ Server sync disabled - running in GitHub Pages/Offline mode');
        console.log('💾 All data is stored locally in browser localStorage');
    } else {
        updateSyncStatus('🟢 Server disponibil');
        console.log('🟢 Server sync enabled');
    }
    
    // Display last push/pull times
    const lastPush = localStorage.getItem('lastPush');
    const lastPull = localStorage.getItem('lastPull');
    if (lastPush) {
        document.getElementById('lastPush').textContent = `⬆️ Last push: ${lastPush}`;
    }
    if (lastPull) {
        document.getElementById('lastPull').textContent = `⬇️ Last pull: ${lastPull}`;
    }
    
    // Manual sync only - use Push/Pull buttons
    console.log('💡 Use Push/Pull buttons to sync');
    
    // Check for upcoming appointments and send reminders
    checkUpcomingAppointments();
    // Check every 5 minutes for upcoming appointments
    setInterval(checkUpcomingAppointments, 5 * 60 * 1000);
    
    // Update smart notifications every 2 minutes
    setInterval(() => {
        renderSmartNotifications();
        updateSmartStats();
    }, 2 * 60 * 1000);
    
    // Start auto-backup
    startAutoBackup();
    
    // Show welcome message for new or updated features - DISABLED
    // showFeatureWelcome();
});

// Update sync status display
function updateSyncStatus(message) {
    const statusEl = document.getElementById('syncStatus');
    if (statusEl) {
        statusEl.textContent = message;
    }
}

let editingClientId = null;
let editingAppointmentId = null;
let editingInvoiceId = null;
let currentDate = new Date();
let viewMode = "week";
let selectedDate = new Date();
let showOrthodoxCalendar = true;
let weekStartDate = new Date();

function getJulianDate(gregorianDate) {
    const julian = new Date(gregorianDate);
    julian.setDate(julian.getDate() - 13);
    return julian;
}

function getOrthodoxHoliday(dateStr) {
    const monthDay = dateStr.substring(5);
    return orthodoxHolidays[monthDay];
}

function getSaintDay(dateStr) {
    const monthDay = dateStr.substring(5);
    return saintDays[monthDay];
}

function isWednesdayOrFriday(date) {
    const day = date.getDay();
    return day === 3 || day === 5;
}

function calculateEasterDate(year) {
    const a = year % 19;
    const b = year % 4;
    const c = year % 7;
    const d = (19 * a + 16) % 30;
    const e = (2 * b + 4 * c + 6 * d) % 7;
    const f = d + e;
    
    let month = 3;
    let day = 22 + f;
    
    if (day > 31) {
        month = 4;
        day = f - 9;
    }
    
    const easter = new Date(year, month - 1, day);
    easter.setDate(easter.getDate() + 13);
    return easter;
}

function getGreatLentPeriod(year) {
    const easter = calculateEasterDate(year);
    const startLent = new Date(easter);
    startLent.setDate(startLent.getDate() - 48);
    return { start: startLent, end: new Date(easter) };
}

// REMOVED: Duplicate DOMContentLoaded event listener (moved to line 322)

// Simple function to ensure data is loaded from localStorage
function loadDataFromStorage() {
    try {
        // Check if data is being shared via URL
        const urlParams = new URLSearchParams(window.location.search);
        const encodedData = urlParams.get('data');
        
        if (encodedData) {
            try {
                // Decode and load the shared data
                const jsonStr = decodeURIComponent(escape(atob(encodedData)));
                const data = JSON.parse(jsonStr);
                
                if (data.clients && data.appointments && data.invoices) {
                    clients = data.clients;
                    appointments = data.appointments;
                    invoices = data.invoices;
                    if (data.businessInfo) {
                        businessInfo = data.businessInfo;
                    }
                    
                    // Save to localStorage
                    saveToLocalStorage();
                    
                    // Clean URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                    
                    showNotification('✅ Datele au fost încărcate de pe desktop! Acum aveți ' + clients.length + ' clienți și ' + appointments.length + ' programări.');
                    console.log('✅ Loaded shared data from URL');
                    return;
                }
            } catch (error) {
                console.error('Error loading shared data:', error);
            }
        }
        
        // Reload from localStorage to ensure we have the latest data
        const storedClients = localStorage.getItem("clients");
        const storedAppointments = localStorage.getItem("appointments");
        const storedInvoices = localStorage.getItem('invoices');
        const storedBusinessInfo = localStorage.getItem('businessInfo');
        
        if (storedClients) {
            clients = JSON.parse(storedClients);
        }
        if (storedAppointments) {
            appointments = JSON.parse(storedAppointments);
        }
        if (storedInvoices) {
            invoices = JSON.parse(storedInvoices);
        }
        if (storedBusinessInfo) {
            businessInfo = JSON.parse(storedBusinessInfo);
        }
        
        console.log('✅ Data loaded:', {
            clients: clients.length,
            appointments: appointments.length,
            invoices: invoices.length
        });
    } catch (error) {
        console.error('Error loading data from storage:', error);
    }
}

function initializeTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            this.classList.add('active');
            
            // Get FAB container for mobile visibility control
            const fabContainer = document.querySelector('.fab-container');
            const isMobile = window.innerWidth <= 768;
            
            if (this.id === 'dashboardBtn') {
                document.getElementById('dashboardSection').classList.add('active');
                renderDashboard();
                if (fabContainer && isMobile) fabContainer.classList.remove('hidden');
            } else if (this.id === 'clientsBtn') {
                document.getElementById('clientsSection').classList.add('active');
                renderClients();
                if (fabContainer && isMobile) fabContainer.classList.remove('hidden');
            } else if (this.id === 'appointmentsBtn') {
                document.getElementById('appointmentsSection').classList.add('active');
                renderAppointments();
                if (fabContainer && isMobile) fabContainer.classList.remove('hidden');
            } else if (this.id === 'invoicesBtn') {
                document.getElementById('invoicesSection').classList.add('active');
                renderInvoices();
                // Hide FAB on invoices section on mobile - can interfere with invoice actions
                if (fabContainer && isMobile) fabContainer.classList.add('hidden');
            } else if (this.id === 'quotesBtn') {
                document.getElementById('quotationsSection').classList.add('active');
                renderQuotations();
                if (fabContainer && isMobile) fabContainer.classList.remove('hidden');
            } else if (this.id === 'calendarBtn') {
                document.getElementById('calendarSection').classList.add('active');
                renderCalendar();
                // Hide FAB on calendar section on mobile - can interfere with time slot selection
                if (fabContainer && isMobile) fabContainer.classList.add('hidden');
            } else if (this.id === 'settingsBtn') {
                document.getElementById('settingsSection').classList.add('active');
                loadSettings();
                if (fabContainer && isMobile) fabContainer.classList.remove('hidden');
            }
        });
    });
}

function initializeModals() {
    const clientModal = document.getElementById('clientModal');
    const appointmentModal = document.getElementById('appointmentModal');
    const appointmentDetailModal = document.getElementById('appointmentDetailModal');
    const invoiceModal = document.getElementById('invoiceModal');
    const invoiceDetailModal = document.getElementById('invoiceDetailModal');
    const syncInfoModal = document.getElementById('syncInfoModal');
    const closeBtns = document.querySelectorAll('.close');
    const fabContainer = document.querySelector('.fab-container');
    
    // Helper to hide/show FAB buttons
    function hideFabs() {
        if (fabContainer) fabContainer.classList.add('hidden');
    }
    
    function showFabs() {
        if (fabContainer) fabContainer.classList.remove('hidden');
    }
    
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            clientModal.style.display = 'none';
            appointmentModal.style.display = 'none';
            appointmentDetailModal.style.display = 'none';
            invoiceModal.style.display = 'none';
            invoiceDetailModal.style.display = 'none';
            if (syncInfoModal) syncInfoModal.style.display = 'none';
            // Add quote modals
            const quoteModal = document.getElementById('quoteModal');
            const quoteDetailModal = document.getElementById('quoteDetailModal');
            if (quoteModal) quoteModal.style.display = 'none';
            if (quoteDetailModal) quoteDetailModal.style.display = 'none';
            resetForms();
            showFabs(); // Show FABs when modal closes
        });
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === clientModal) {
            clientModal.style.display = 'none';
            resetForms();
            showFabs();
        }
        if (event.target === appointmentModal) {
            appointmentModal.style.display = 'none';
            resetForms();
            showFabs();
        }
        if (event.target === appointmentDetailModal) {
            appointmentDetailModal.style.display = 'none';
            showFabs();
        }
        if (event.target === invoiceModal) {
            invoiceModal.style.display = 'none';
            resetForms();
            showFabs();
        }
        // Add quote modals
        const quoteModal = document.getElementById('quoteModal');
        const quoteDetailModal = document.getElementById('quoteDetailModal');
        if (quoteModal && event.target === quoteModal) {
            quoteModal.style.display = 'none';
            resetForms();
            showFabs();
        }
        if (quoteDetailModal && event.target === quoteDetailModal) {
            quoteDetailModal.style.display = 'none';
            showFabs();
        }
        // Invoice detail modal stays open when clicking outside
        if (syncInfoModal && event.target === syncInfoModal) {
            syncInfoModal.style.display = 'none';
            showFabs();
        }
    });
    
    document.getElementById('closeDetailBtn').addEventListener('click', () => {
        appointmentDetailModal.style.display = 'none';
        showFabs();
    });
    
    document.getElementById('printAppointmentBtn').addEventListener('click', () => {
        window.print();
    });
    
    document.getElementById('editFromDetailBtn').addEventListener('click', () => {
        appointmentDetailModal.style.display = 'none';
        const aptId = document.getElementById('editFromDetailBtn').dataset.appointmentId;
        if (aptId) {
            openAppointmentModal(parseInt(aptId));
        }
    });
    
    document.getElementById('sendSmsBtn').addEventListener('click', () => {
        const aptId = document.getElementById('editFromDetailBtn').dataset.appointmentId;
        if (aptId) {
            sendSmsConfirmation(parseInt(aptId));
        }
    });
}

function initializeEventListeners() {
    document.getElementById('addClientBtn').addEventListener('click', () => openClientModal());
    
    // CSV Import
    document.getElementById('csvImportInput').addEventListener('change', handleCSVImport);
    document.getElementById('cancelClientBtn').addEventListener('click', () => {
        document.getElementById('clientModal').style.display = 'none';
        resetForms();
    });
    document.getElementById('clientForm').addEventListener('submit', saveClient);
    document.getElementById('clientSearch').addEventListener('input', renderClients);
    
    // Add client from appointment modal
    document.getElementById('addClientFromAppointment').addEventListener('click', (e) => {
        e.preventDefault();
        // Save that we're coming from appointment modal
        window.returnToAppointmentModal = true;
        // Close appointment modal
        document.getElementById('appointmentModal').style.display = 'none';
        // Open client modal
        openClientModal();
    });
    
    document.getElementById('addAppointmentBtn').addEventListener('click', () => openAppointmentModal());
    document.getElementById('cancelAppointmentBtn').addEventListener('click', () => {
        document.getElementById('appointmentModal').style.display = 'none';
        resetForms();
    });
    document.getElementById('appointmentForm').addEventListener('submit', saveAppointment);
    document.getElementById('appointmentFilter').addEventListener('change', renderAppointments);
    document.getElementById('monthViewBtn').addEventListener('click', () => {
        viewMode = 'month';
        updateViewToggle();
        renderCalendarView();
    });
    document.getElementById('dayViewBtn').addEventListener('click', () => {
        viewMode = 'day';
        selectedDate = new Date(currentDate);
        updateViewToggle();
        renderCalendarView();
    });
    document.getElementById('prevPeriod').addEventListener('click', () => {
        if (viewMode === 'month') {
            currentDate.setMonth(currentDate.getMonth() - 1);
        } else if (viewMode === 'week') {
            weekStartDate.setDate(weekStartDate.getDate() - 7);
        } else {
            selectedDate.setDate(selectedDate.getDate() - 1);
        }
        renderCalendarView();
    });
    document.getElementById('nextPeriod').addEventListener('click', () => {
        if (viewMode === 'month') {
            currentDate.setMonth(currentDate.getMonth() + 1);
        } else if (viewMode === 'week') {
            weekStartDate.setDate(weekStartDate.getDate() + 7);
        } else {
            selectedDate.setDate(selectedDate.getDate() + 1);
        }
        renderCalendarView();
    });
    document.getElementById('todayBtn').addEventListener('click', () => {
        currentDate = new Date();
        selectedDate = new Date();
        // For week view, start from today
        weekStartDate = new Date();
        renderCalendarView();
    });
    document.getElementById('weekViewBtn').addEventListener('click', () => {
        viewMode = 'week';
        // Start week view from today
        weekStartDate = new Date();
        updateViewToggle();
        renderCalendarView();
    });
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);
    document.getElementById('exportPdfBtn').addEventListener('click', exportToPDF);
    
    document.getElementById('hiddenImportInput').addEventListener('change', handleImportFile);
    
    document.getElementById('quickAddClient').addEventListener('click', () => {
        document.getElementById('clientsBtn').click();
        setTimeout(() => openClientModal(), 100);
    });
    
    document.getElementById('quickScheduleAppointment').addEventListener('click', () => {
        document.getElementById('appointmentsBtn').click();
        setTimeout(() => openAppointmentModal(), 100);
    });
    
    document.getElementById('quickViewCalendar').addEventListener('click', () => {
        document.getElementById('calendarBtn').click();
    });
}

// ==================== QUOTATION FUNCTIONS ====================

let editingQuoteId = null;

function initializeQuotations() {
    console.log('🟢 Initializing quotations...');
    const addBtn = document.getElementById('addQuoteBtn');
    console.log('🟢 addQuoteBtn:', addBtn);
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            console.log('🟢 Add Quote button clicked!');
            openQuoteModal();
        });
    }
    if (document.getElementById('quoteForm')) {
        document.getElementById('quoteForm').addEventListener('submit', saveQuote);
    }
    if (document.getElementById('cancelQuoteBtn')) {
        document.getElementById('cancelQuoteBtn').addEventListener('click', () => {
            document.getElementById('quoteModal').style.display = 'none';
            resetForms();
        });
    }
    if (document.getElementById('quoteFilter')) {
        document.getElementById('quoteFilter').addEventListener('change', (e) => {
            renderQuotations(e.target.value);
        });
    }
    const addItemBtn = document.getElementById('addQuoteItem');
    console.log('🟢 addQuoteItem button:', addItemBtn);
    if (addItemBtn) {
        addItemBtn.addEventListener('click', () => {
            console.log('🟢 Add Quote Item button clicked!');
            addQuoteItemRow();
        });
    }
    if (document.getElementById('quoteClient')) {
        document.getElementById('quoteClient').addEventListener('change', () => {
            fillClientDataInQuote();
        });
    }
    if (document.getElementById('closeQuoteDetailBtn')) {
        document.getElementById('closeQuoteDetailBtn').addEventListener('click', () => {
            document.getElementById('quoteDetailModal').style.display = 'none';
        });
    }
}

function generateQuoteNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const yearMonth = `${year}${month}`;
    
    // Count quotes from this month
    const thisMonthQuotes = quotations.filter(q => {
        const qDate = new Date(q.createdAt);
        const qYearMonth = `${qDate.getFullYear()}${String(qDate.getMonth() + 1).padStart(2, '0')}`;
        return qYearMonth === yearMonth;
    });
    
    const sequence = String(thisMonthQuotes.length + 1).padStart(4, '0');
    return `${businessInfo.quoteSeriesPrefix}-${yearMonth}-${sequence}`;
}

function openQuoteModal(quoteId = null) {
    console.log('🔵 openQuoteModal called', {quoteId});
    editingQuoteId = quoteId;
    const modal = document.getElementById('quoteModal');
    if (!modal) {
        console.error('❌ quoteModal not found!');
        return;
    }
    
    const title = document.getElementById('quoteModalTitle');
    
    // Populate client select
    console.log('🔵 Updating client select...');
    updateQuoteClientSelect();
    
    // Clear form and add first item row
    const itemsContainer = document.getElementById('quoteItems');
    console.log('🔵 quoteItems container:', itemsContainer);
    if (itemsContainer) {
        itemsContainer.innerHTML = '';
        console.log('🔵 Container cleared. Calling addQuoteItemRow...');
        // Force immediate call
        try {
            addQuoteItemRow();
            console.log('🔵 addQuoteItemRow completed');
        } catch (error) {
            console.error('❌ Error in addQuoteItemRow:', error);
        }
    }
    
    // Attach event listener to Add Item button (reattach each time modal opens)
    const addItemBtn = document.getElementById('addQuoteItem');
    console.log('🔵 Attaching click listener to addQuoteItem button:', addItemBtn);
    if (addItemBtn) {
        // Remove old listener if exists
        const newAddItemBtn = addItemBtn.cloneNode(true);
        addItemBtn.parentNode.replaceChild(newAddItemBtn, addItemBtn);
        
        newAddItemBtn.addEventListener('click', () => {
            console.log('✅ Add Quote Item button clicked!');
            addQuoteItemRow();
        });
    } else {
        console.error('❌ addQuoteItem button not found!');
    }
    
    // Load business info
    if (document.getElementById('businessNameQuote')) {
        document.getElementById('businessNameQuote').value = businessInfo.name;
        document.getElementById('businessEmailQuote').value = businessInfo.email;
        document.getElementById('businessPhoneQuote').value = businessInfo.phone;
        document.getElementById('businessAddressQuote').value = businessInfo.address;
    }
    
    if (quoteId) {
        const quote = quotations.find(q => q.id === quoteId);
        if (quote) {
            title.textContent = '📄 Edit Quotation';
            if (document.getElementById('quoteClient')) {
                document.getElementById('quoteClient').value = quote.clientId;
                fillClientDataInQuote();
            }
            if (document.getElementById('quoteDate')) {
                document.getElementById('quoteDate').value = quote.date;
                document.getElementById('quoteDueDate').value = quote.validUntil;
            }
            if (document.getElementById('quoteNumber')) {
                document.getElementById('quoteNumber').value = quote.quoteNumber;
            }
            if (document.getElementById('quoteDiscount')) {
                document.getElementById('quoteDiscount').value = quote.discount || 0;
                document.getElementById('quoteTax').value = quote.tax || 0;
            }
            if (document.getElementById('quoteNotes')) {
                document.getElementById('quoteNotes').value = quote.notes || '';
            }
            
            // Load items
            if (quote.items && document.getElementById('quoteItems')) {
                document.getElementById('quoteItems').innerHTML = '';
                quote.items.forEach(item => {
                    addQuoteItemRow(item.description, item.quantity, item.price);
                });
            }
            
            // Load client data
            if (quote.clientData) {
                document.getElementById('quoteClientName').value = quote.clientData.name || '';
                document.getElementById('quoteClientCUI').value = quote.clientData.cui || '';
                document.getElementById('quoteClientRegCom').value = quote.clientData.regCom || '';
                document.getElementById('quoteClientAddress').value = quote.clientData.address || '';
                if (document.getElementById('quoteClientCity')) {
                    document.getElementById('quoteClientCity').value = quote.clientData.city || '';
                }
                if (document.getElementById('quoteClientCounty')) {
                    document.getElementById('quoteClientCounty').value = quote.clientData.county || '';
                }
                if (document.getElementById('quoteClientPostalCode')) {
                    document.getElementById('quoteClientPostalCode').value = quote.clientData.postalCode || '';
                }
                if (document.getElementById('quoteClientPhone')) {
                    document.getElementById('quoteClientPhone').value = quote.clientData.phone || '';
                }
                if (document.getElementById('quoteClientEmail')) {
                    document.getElementById('quoteClientEmail').value = quote.clientData.email || '';
                }
                if (document.getElementById('quoteClientIBAN')) {
                    document.getElementById('quoteClientIBAN').value = quote.clientData.iban || '';
                }
                if (document.getElementById('quoteClientBank')) {
                    document.getElementById('quoteClientBank').value = quote.clientData.bank || '';
                }
            }
            
            // Load business info
            if (quote.businessInfo) {
                if (document.getElementById('businessNameQuote')) {
                    document.getElementById('businessNameQuote').value = quote.businessInfo.name || '';
                }
                if (document.getElementById('businessEmailQuote')) {
                    document.getElementById('businessEmailQuote').value = quote.businessInfo.email || '';
                }
                if (document.getElementById('businessPhoneQuote')) {
                    document.getElementById('businessPhoneQuote').value = quote.businessInfo.phone || '';
                }
                if (document.getElementById('businessAddressQuote')) {
                    document.getElementById('businessAddressQuote').value = quote.businessInfo.address || '';
                }
                if (document.getElementById('businessCUIQuote')) {
                    document.getElementById('businessCUIQuote').value = quote.businessInfo.cui || '';
                }
                if (document.getElementById('businessRegComQuote')) {
                    document.getElementById('businessRegComQuote').value = quote.businessInfo.regCom || '';
                }
                if (document.getElementById('businessCityQuote')) {
                    document.getElementById('businessCityQuote').value = quote.businessInfo.city || '';
                }
                if (document.getElementById('businessCountyQuote')) {
                    document.getElementById('businessCountyQuote').value = quote.businessInfo.county || '';
                }
                if (document.getElementById('businessPostalCodeQuote')) {
                    document.getElementById('businessPostalCodeQuote').value = quote.businessInfo.postalCode || '';
                }
                if (document.getElementById('businessIBANQuote')) {
                    document.getElementById('businessIBANQuote').value = quote.businessInfo.iban || '';
                }
                if (document.getElementById('businessBankQuote')) {
                    document.getElementById('businessBankQuote').value = quote.businessInfo.bank || '';
                }
            }
        }
    } else {
        title.textContent = '📄 New Quotation';
        if (document.getElementById('quoteNumber')) {
            document.getElementById('quoteNumber').value = generateQuoteNumber();
        }
        // Pre-populate business info from current settings
        if (document.getElementById('businessNameQuote')) {
            document.getElementById('businessNameQuote').value = businessInfo.name || '';
            document.getElementById('businessEmailQuote').value = businessInfo.email || '';
            document.getElementById('businessPhoneQuote').value = businessInfo.phone || '';
            document.getElementById('businessAddressQuote').value = businessInfo.address || '';
            if (document.getElementById('businessCUIQuote')) {
                document.getElementById('businessCUIQuote').value = businessInfo.cui || '';
            }
            if (document.getElementById('businessRegComQuote')) {
                document.getElementById('businessRegComQuote').value = businessInfo.regCom || '';
            }
            if (document.getElementById('businessCityQuote')) {
                document.getElementById('businessCityQuote').value = businessInfo.city || '';
            }
            if (document.getElementById('businessCountyQuote')) {
                document.getElementById('businessCountyQuote').value = businessInfo.county || '';
            }
            if (document.getElementById('businessPostalCodeQuote')) {
                document.getElementById('businessPostalCodeQuote').value = businessInfo.postalCode || '';
            }
            if (document.getElementById('businessIBANQuote')) {
                document.getElementById('businessIBANQuote').value = businessInfo.iban || '';
            }
            if (document.getElementById('businessBankQuote')) {
                document.getElementById('businessBankQuote').value = businessInfo.bank || '';
            }
        }
        if (document.getElementById('quoteDate')) {
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('quoteDate').value = today;
            const validUntil = new Date();
            validUntil.setDate(validUntil.getDate() + 30); // Valid for 30 days
            document.getElementById('quoteDueDate').value = validUntil.toISOString().split('T')[0];
        }
    }
    
    // Add listeners for discount and tax to recalculate totals
    const discountInput = document.getElementById('quoteDiscount');
    const taxInput = document.getElementById('quoteTax');
    
    if (discountInput) {
        // Remove old listener and add new one to prevent duplicates
        discountInput.removeEventListener('input', calculateQuoteTotals);
        discountInput.addEventListener('input', calculateQuoteTotals);
    }
    if (taxInput) {
        // Remove old listener and add new one to prevent duplicates
        taxInput.removeEventListener('input', calculateQuoteTotals);
        taxInput.addEventListener('input', calculateQuoteTotals);
    }
    
    // Calculate totals on modal open
    setTimeout(() => calculateQuoteTotals(), 100);
    
    modal.style.display = 'block';
}

function updateQuoteClientSelect() {
    const select = document.getElementById('quoteClient');
    if (!select) return;
    select.innerHTML = '<option value="">Selectează un client</option>' +
        clients.map(client => `<option value="${client.id}">${client.name}</option>`).join('');
}

function fillClientDataInQuote() {
    const clientId = parseInt(document.getElementById('quoteClient').value);
    const client = clients.find(c => c.id === clientId);
    
    if (client) {
        document.getElementById('quoteClientName').value = client.name || '';
        document.getElementById('quoteClientCUI').value = client.cui || '';
        document.getElementById('quoteClientRegCom').value = client.regCom || '';
        document.getElementById('quoteClientAddress').value = client.address || '';
        if (document.getElementById('quoteClientCity')) {
            document.getElementById('quoteClientCity').value = client.city || '';
        }
        if (document.getElementById('quoteClientCounty')) {
            document.getElementById('quoteClientCounty').value = client.county || '';
        }
        if (document.getElementById('quoteClientPostalCode')) {
            document.getElementById('quoteClientPostalCode').value = client.postalCode || '';
        }
        if (document.getElementById('quoteClientPhone')) {
            document.getElementById('quoteClientPhone').value = client.phone || '';
        }
        if (document.getElementById('quoteClientEmail')) {
            document.getElementById('quoteClientEmail').value = client.email || '';
        }
        if (document.getElementById('quoteClientIBAN')) {
            document.getElementById('quoteClientIBAN').value = client.iban || '';
        }
        if (document.getElementById('quoteClientBank')) {
            document.getElementById('quoteClientBank').value = client.bank || '';
        }
    }
}

function addQuoteItemRow(description = '', quantity = 1, price = 0) {
    console.log('🟢 addQuoteItemRow called with:', {description, quantity, price});
    const container = document.getElementById('quoteItems');
    console.log('🟢 quoteItems container:', container);
    
    if (!container) {
        console.error('❌ quoteItems container not found!');
        return;
    }
    
    console.log('✅ Container found, creating item row...');
    
    const itemId = Date.now();
    const div = document.createElement('div');
    div.className = 'invoice-item-row';
    div.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 0.5rem; margin-bottom: 0.75rem; align-items: end;';
    div.innerHTML = `
        <div class="form-group" style="margin-bottom: 0;">
            <label>Descriere Produs/Serviciu</label>
            <input type="text" class="quote-item-desc" placeholder="Ex: Consultanță, Produs..." value="${description}" required>
        </div>
        <div class="form-group" style="margin-bottom: 0;">
            <label>Cantitate</label>
            <input type="number" class="quote-item-qty" min="1" step="0.01" value="${quantity}" required>
        </div>
        <div class="form-group" style="margin-bottom: 0;">
            <label>Preț Unitar (Lei)</label>
            <input type="number" class="quote-item-price" min="0" step="0.01" placeholder="0.00" value="${price}" required>
        </div>
        <div class="form-group" style="margin-bottom: 0;">
            <label>Total</label>
            <input type="text" class="quote-item-total" readonly style="background: #f0f0f0; font-weight: 700;" value="0.00 Lei">
        </div>
        <button type="button" class="btn btn-danger" style="padding: 0.5rem; margin-bottom: 0.25rem;" onclick="this.parentElement.remove(); calculateQuoteTotals();">🗑</button>
    `;
    
    // Add event listeners for calculation
    const quantityInput = div.querySelector('.quote-item-qty');
    const priceInput = div.querySelector('.quote-item-price');
    const totalInput = div.querySelector('.quote-item-total');
    
    const updateItemTotal = () => {
        const qty = parseFloat(quantityInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        const total = qty * price;
        totalInput.value = total.toFixed(2) + ' Lei';
        calculateQuoteTotals();
    };
    
    quantityInput.addEventListener('input', updateItemTotal);
    priceInput.addEventListener('input', updateItemTotal);
    
    container.appendChild(div);
    console.log('✅ Quote item row added successfully');
    console.log('✅ Container now has', container.children.length, 'items');
    console.log('✅ Container HTML:', container.innerHTML.substring(0, 200));
    updateItemTotal();
}

function calculateQuoteTotals() {
    const itemRows = document.querySelectorAll('#quoteItems .invoice-item-row');
    let subtotal = 0;
    
    itemRows.forEach(row => {
        const qty = parseFloat(row.querySelector('.quote-item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.quote-item-price').value) || 0;
        subtotal += qty * price;
    });
    
    const discountPercent = parseFloat(document.getElementById('quoteDiscount')?.value) || 0;
    const taxPercent = parseFloat(document.getElementById('quoteTax')?.value) || 0;
    
    const discountAmount = subtotal * (discountPercent / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (taxPercent / 100);
    const total = afterDiscount + taxAmount;
    
    if (document.getElementById('quoteSubtotal')) {
        document.getElementById('quoteSubtotal').textContent = subtotal.toFixed(2);
    }
    if (document.getElementById('quoteDiscountAmount')) {
        document.getElementById('quoteDiscountAmount').textContent = discountAmount.toFixed(2);
    }
    if (document.getElementById('quoteTaxAmount')) {
        document.getElementById('quoteTaxAmount').textContent = taxAmount.toFixed(2);
    }
    if (document.getElementById('quoteTotal')) {
        document.getElementById('quoteTotal').textContent = total.toFixed(2);
    }
}

function saveQuote(e) {
    e.preventDefault();
    
    // Validare numar oferta
    const quoteNumber = document.getElementById('quoteNumber').value?.trim();
    if (!quoteNumber || quoteNumber === 'undefined' || quoteNumber === '') {
        alert('⚠️ Eroare: Numărul ofertei nu a fost generat corect. Reîncarcă pagina!');
        return;
    }
    
    const clientId = parseInt(document.getElementById('quoteClient').value);
    if (!clientId) {
        alert('⚠️ Trebuie să selectezi un client');
        return;
    }
    
    const itemsRows = document.querySelectorAll('#quoteItems .invoice-item-row');
    if (itemsRows.length === 0) {
        alert('⚠️ Adăugă cel puțin un articol');
        return;
    }
    
    const items = [];
    let subtotal = 0;
    
    // Validare articole
    for (let i = 0; i < itemsRows.length; i++) {
        const row = itemsRows[i];
        const desc = row.querySelector('.quote-item-desc').value?.trim();
        const qty = parseFloat(row.querySelector('.quote-item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.quote-item-price').value) || 0;
        
        if (!desc) {
            alert(`⚠️ Articolul ${i + 1}: Descrierea nu poate fi goală`);
            return;
        }
        if (qty <= 0) {
            alert(`⚠️ Articolul ${i + 1}: Cantitatea trebuie > 0`);
            return;
        }
        if (price < 0) {
            alert(`⚠️ Articolul ${i + 1}: Preț nu poate fi negativ`);
            return;
        }
        
        const total = qty * price;
        items.push({ description: desc, quantity: qty, price: price, total: total });
        subtotal += total;
    }
    
    const discountPct = parseFloat(document.getElementById('quoteDiscount').value) || 0;
    const taxPct = parseFloat(document.getElementById('quoteTax').value) || 19;
    const discountAmount = (subtotal * discountPct) / 100;
    const taxAmount = ((subtotal - discountAmount) * taxPct) / 100;
    const total = subtotal - discountAmount + taxAmount;
    
    const client = clients.find(c => c.id === clientId);
    const clientType = document.getElementById('quoteClientType').value || 'firma';
    const clientCUI = document.getElementById('quoteClientCUI').value;
    const clientCNP = document.getElementById('quoteClientCNP').value;
    
    // CUI and CNP are optional (not required)
    // Users can save quotes without them
    
    const clientData = {
        name: document.getElementById('quoteClientName').value || 'N/A',
        type: clientType,
        cui: clientCUI || null,
        cnp: clientCNP || null,
        regCom: document.getElementById('quoteClientRegCom').value || '',
        address: document.getElementById('quoteClientAddress').value || '',
        city: document.getElementById('quoteClientCity')?.value || '',
        county: document.getElementById('quoteClientCounty')?.value || '',
        postalCode: document.getElementById('quoteClientPostalCode')?.value || '',
        phone: document.getElementById('quoteClientPhone')?.value || '',
        email: document.getElementById('quoteClientEmail')?.value || '',
        iban: document.getElementById('quoteClientIBAN')?.value || '',
        bank: document.getElementById('quoteClientBank')?.value || ''
    };
    
    // Collect business info from form
    const businessInfoData = {
        name: document.getElementById('businessNameQuote')?.value || businessInfo.name,
        email: document.getElementById('businessEmailQuote')?.value || businessInfo.email,
        phone: document.getElementById('businessPhoneQuote')?.value || businessInfo.phone,
        address: document.getElementById('businessAddressQuote')?.value || businessInfo.address,
        cui: document.getElementById('businessCUIQuote')?.value || businessInfo.cui || '',
        regCom: document.getElementById('businessRegComQuote')?.value || businessInfo.regCom || '',
        city: document.getElementById('businessCityQuote')?.value || businessInfo.city || '',
        county: document.getElementById('businessCountyQuote')?.value || businessInfo.county || '',
        postalCode: document.getElementById('businessPostalCodeQuote')?.value || businessInfo.postalCode || '',
        iban: document.getElementById('businessIBANQuote')?.value || businessInfo.iban || '',
        bank: document.getElementById('businessBankQuote')?.value || businessInfo.bank || '',
        invoiceSeries: businessInfo.invoiceSeries || 'INV',
        quoteSeriesPrefix: businessInfo.quoteSeriesPrefix || 'OFR'
    };
    
    if (editingQuoteId) {
        // Update existing quote
        const quote = quotations.find(q => q.id === editingQuoteId);
        if (quote) {
            quote.quoteNumber = quoteNumber;
            quote.date = document.getElementById('quoteDate').value;
            quote.validUntil = document.getElementById('quoteDueDate').value;
            quote.items = items;
            quote.subtotal = subtotal;
            quote.discount = discountPct;
            quote.discountAmount = discountAmount;
            quote.tax = taxPct;
            quote.taxAmount = taxAmount;
            quote.total = total;
            quote.notes = document.getElementById('quoteNotes').value;
            quote.clientData = clientData;
            quote.businessInfo = businessInfoData;
            quote.modifiedAt = new Date().toISOString();
        }
    } else {
        // Create new quote
        const newQuote = {
            id: Date.now(),
            quoteNumber: quoteNumber,
            clientId: clientId,
            date: document.getElementById('quoteDate').value,
            validUntil: document.getElementById('quoteDueDate').value,
            items: items,
            subtotal: subtotal,
            discount: discountPct,
            discountAmount: discountAmount,
            tax: taxPct,
            taxAmount: taxAmount,
            total: total,
            notes: document.getElementById('quoteNotes').value,
            status: 'draft', // draft, sent, accepted, rejected, converted
            clientData: clientData,
            businessInfo: businessInfoData,
            createdAt: new Date().toISOString(),
            sentAt: null,
            acceptedAt: null
        };
        quotations.push(newQuote);
    }
    
    debouncedSave();
    syncToServer();
    
    document.getElementById('quoteModal').style.display = 'none';
    renderQuotations();
    resetForms();
    showModal('✅ Succes', 'Oferta a fost salvată cu succes!');
}

function renderQuotations(filter = 'all') {
    const container = document.getElementById('quotationsContainer');
    if (!container) return;
    
    let filtered = quotations;
    if (filter !== 'all') {
        filtered = quotations.filter(q => q.status === filter);
    }
    
    if (filtered.length === 0) {
        container.innerHTML = '<p class="empty-message">No quotations yet. Create one to get started!</p>';
        return;
    }
    
    container.innerHTML = filtered.map(quote => {
        const client = clients.find(c => c.id === quote.clientId);
        const statusBadge = `<span class="status-badge status-${quote.status}">${quote.status.toUpperCase()}</span>`;
        return `
            <div class="invoice-card">
                <div class="invoice-header">
                    <h3>${quote.quoteNumber}</h3>
                    ${statusBadge}
                </div>
                <p><strong>Client:</strong> ${quote.clientData?.name || client?.name || 'Unknown'}</p>
                <p><strong>Date:</strong> ${quote.date}</p>
                <p><strong>Valid Until:</strong> ${quote.validUntil}</p>
                <p><strong>Total:</strong> <span class="amount">$${quote.total.toFixed(2)}</span></p>
                <div class="invoice-actions">
                    <button class="btn btn-sm" onclick="showQuoteDetail(${quote.id})">📄 View</button>
                    <button class="btn btn-sm" onclick="editQuote(${quote.id})">✏️ Edit</button>
                    <button class="btn btn-sm btn-success" onclick="convertQuoteToInvoice(${quote.id})">💰 To Invoice</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteQuote(${quote.id})">🗑️ Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function editQuote(quoteId) {
    openQuoteModal(quoteId);
}

function showQuoteDetail(quoteId) {
    const quote = quotations.find(q => q.id === quoteId);
    if (!quote) return;
    
    const modal = document.getElementById('quoteDetailModal');
    if (!modal) return;
    
    const detailContent = document.getElementById('quoteDetailContent');
    if (!detailContent) return;
    
    const client = clients.find(c => c.id === quote.clientId);
    
    detailContent.innerHTML = `
        <div class="quote-detail">
            <div class="quote-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div>
                    <h2>${quote.quoteNumber}</h2>
                    <p>${quote.date}</p>
                </div>
                <span class="status-badge status-${quote.status}">${quote.status.toUpperCase()}</span>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                    <h3>FROM (Issuer)</h3>
                    <p><strong>${quote.businessInfo?.name}</strong></p>
                    <p>${quote.businessInfo?.address}</p>
                    <p>${quote.businessInfo?.phone}</p>
                    <p>${quote.businessInfo?.email}</p>
                    <p>CUI: ${quote.businessInfo?.cui || 'N/A'}</p>
                </div>
                <div>
                    <h3>TO (Client)</h3>
                    <p><strong>${quote.clientData?.name}</strong></p>
                    <p>${quote.clientData?.address}</p>
                    <p>${quote.clientData?.phone}</p>
                    <p>${quote.clientData?.email}</p>
                    <p>CUI: ${quote.clientData?.cui || 'N/A'}</p>
                </div>
            </div>
            
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${quote.items.map(item => `
                        <tr>
                            <td>${item.description}</td>
                            <td>${item.quantity}</td>
                            <td>$${item.price.toFixed(2)}</td>
                            <td>$${item.total.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="totals" style="margin-top: 20px; text-align: right;">
                <p><strong>Subtotal:</strong> $${quote.subtotal.toFixed(2)}</p>
                ${quote.discount > 0 ? `<p><strong>Discount (${quote.discount}%):</strong> -$${quote.discountAmount.toFixed(2)}</p>` : ''}
                ${quote.tax > 0 ? `<p><strong>Tax (${quote.tax}%):</strong> +$${quote.taxAmount.toFixed(2)}</p>` : ''}
                <p style="font-size: 1.3em; font-weight: bold; margin-top: 10px;"><strong>TOTAL: $${quote.total.toFixed(2)}</strong></p>
            </div>
            
            ${quote.notes ? `<p style="margin-top: 20px; padding: 10px; background: #f0f0f0; border-radius: 4px;"><strong>Notes:</strong> ${quote.notes}</p>` : ''}
            
            <div class="modal-actions" style="margin-top: 20px; display: flex; gap: 10px;">
                <button class="btn btn-primary" onclick="downloadQuotePDF(${quote.id})">Descarca PDF</button>
                <button class="btn btn-success" onclick="convertQuoteToInvoice(${quote.id})">Converteste in Factura</button>
                <button class="btn btn-secondary" onclick="document.getElementById('quoteDetailModal').style.display = 'none'">Close</button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function downloadQuotePDF(quoteId) {
    const quote = quotations.find(q => q.id === quoteId);
    if (!quote) return;
    
    // Validare date obligatorii
    if (!quote.businessInfo?.name || !quote.clientData?.name) {
        showModal('⚠️ Eroare', 'Completează datele emitentului și clientului!');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'A4');
    
    // ===== CULORI & STYLING =====
    const primaryColor = [102, 126, 234];      // Albastru
    const darkGray = [50, 50, 50];             // Gri inchis
    const lightGray = [240, 240, 240];         // Gri deschis
    const accentColor = [76, 175, 80];         // Verde
    
    // ===== HEADER CU LOGO =====
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 50, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.text('OFERTA COMERCIALA', 15, 25);
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Seria: ${quote.quoteNumber || 'N/A'}`, 15, 35);
    
    // Data și validitate - format simplu ro
    doc.setFontSize(9);
    const dateRO = quote.date ? new Date(quote.date).toLocaleDateString('ro-RO') : 'N/A';
    const validRO = quote.validUntil ? new Date(quote.validUntil).toLocaleDateString('ro-RO') : 'N/A';
    doc.text(`Data: ${dateRO}`, 150, 32);
    doc.text(`Valabila pana: ${validRO}`, 150, 38);
    
    let yPos = 62;
    
    // ===== SECȚIUNEA EMITENT (DE LA) =====
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.rect(15, yPos - 5, 80, 35);
    
    doc.setTextColor(...primaryColor);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('DE LA (EMITENT):', 18, yPos);
    
    doc.setTextColor(...darkGray);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    
    yPos += 7;
    const businessName = quote.businessInfo?.name || 'N/A';
    const businessNameLines = doc.splitTextToSize(businessName, 70);
    doc.text(businessNameLines, 18, yPos);
    yPos += (businessNameLines.length * 5);
    
    if (quote.businessInfo?.cui) {
        doc.setFontSize(9);
        doc.text(`CUI: ${quote.businessInfo.cui}`, 18, yPos);
        yPos += 4;
    }
    
    if (quote.businessInfo?.regCom) {
        doc.text(`Reg. Com: ${quote.businessInfo.regCom}`, 18, yPos);
        yPos += 4;
    }
    
    if (quote.businessInfo?.address) {
        const addressLines = doc.splitTextToSize(quote.businessInfo.address, 70);
        doc.text(addressLines, 18, yPos);
        yPos += (addressLines.length * 4);
    }
    
    let addressY = yPos;
    if (quote.businessInfo?.city) {
        doc.text(`${quote.businessInfo.city}, ${quote.businessInfo.county || 'N/A'} ${quote.businessInfo.postalCode || ''}`, 18, yPos);
        addressY = yPos + 4;
    }
    
    // ===== SECȚIUNEA CLIENT (CĂTRE) =====
    yPos = 62;
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.rect(110, yPos - 5, 85, 35);
    
    doc.setTextColor(...primaryColor);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('CATRE (CLIENT):', 113, yPos);
    
    doc.setTextColor(...darkGray);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    
    yPos += 7;
    const clientName = quote.clientData?.name || 'N/A';
    const clientNameLines = doc.splitTextToSize(clientName, 75);
    doc.text(clientNameLines, 113, yPos);
    yPos += (clientNameLines.length * 5);
    
    if (quote.clientData?.cui) {
        doc.setFontSize(9);
        doc.text(`CUI: ${quote.clientData.cui}`, 113, yPos);
        yPos += 4;
    }
    
    if (quote.clientData?.address) {
        const clientAddressLines = doc.splitTextToSize(quote.clientData.address, 75);
        doc.text(clientAddressLines, 113, yPos);
        yPos += (clientAddressLines.length * 4);
    }
    
    if (quote.clientData?.city) {
        doc.text(`${quote.clientData.city}, ${quote.clientData.county || 'N/A'}`, 113, yPos);
        yPos += 4;
    }
    
    yPos = Math.max(addressY, 104) + 5;
    
    // ===== TABEL ARTICOLE =====
    const tableData = quote.items.map(item => [
        item.description || 'N/A',
        item.quantity.toString() || '0',
        `${item.price?.toFixed(2) || '0.00'} RON`,
        `${item.total?.toFixed(2) || '0.00'} RON`
    ]);
    
    doc.autoTable({
        head: [['DESCRIERE ARTICOL', 'CANTITATE', 'PREȚ UNITAR', 'VALOARE']],
        body: tableData,
        startY: yPos,
        theme: 'grid',
        headStyles: {
            fillColor: primaryColor,
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 10,
            halign: 'center'
        },
        bodyStyles: {
            fontSize: 9,
            textColor: darkGray
        },
        columnStyles: {
            0: { halign: 'left', cellWidth: 70 },
            1: { halign: 'center', cellWidth: 25 },
            2: { halign: 'right', cellWidth: 30 },
            3: { halign: 'right', cellWidth: 30 }
        },
        margin: { left: 15, right: 15 },
        didDrawPage: function(data) {
            // Footer pe fiecare pagină
            const pageCount = doc.internal.pages.length - 1;
            if (pageCount > 1) {
                doc.setFontSize(9);
                doc.text(`Pagina ${data.pageNumber}`, 100, 285);
            }
        }
    });
    
    // ===== SECȚIUNEA TOTALE =====
    const finalY = doc.lastAutoTable?.finalY || yPos + 40;
    const totalY = finalY + 12;
    
    // Background pentru totale
    doc.setFillColor(...lightGray);
    doc.rect(120, totalY - 8, 75, 45, 'F');
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...darkGray);
    
    // Subtotal
    doc.text('Subtotal:', 125, totalY);
    doc.text(`${(quote.subtotal || 0).toFixed(2)} RON`, 185, totalY, { align: 'right' });
    
    // Reducere
    if (quote.discountAmount > 0) {
        doc.setTextColor(220, 53, 69); // Roșu pentru reducere
        doc.text(`Reducere (${quote.discount || 0}%):`, 125, totalY + 8);
        doc.text(`-${(quote.discountAmount || 0).toFixed(2)} RON`, 185, totalY + 8, { align: 'right' });
    }
    
    // TVA
    doc.setTextColor(...darkGray);
    doc.text(`TVA (${quote.tax || 19}%):`, 125, totalY + 16);
    doc.text(`+${(quote.taxAmount || 0).toFixed(2)} RON`, 185, totalY + 16, { align: 'right' });
    
    // TOTAL FINAL
    doc.setFillColor(...accentColor);
    doc.rect(120, totalY + 22, 75, 12, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL:', 125, totalY + 30);
    doc.text(`${(quote.total || 0).toFixed(2)} RON`, 185, totalY + 30, { align: 'right' });
    
    // ===== NOTE SPECIALE =====
    if (quote.notes) {
        let notesY = totalY + 40;
        
        doc.setTextColor(...primaryColor);
        doc.setFont(undefined, 'bold');
        doc.setFontSize(10);
        doc.text('NOTE:', 15, notesY);
        
        doc.setTextColor(...darkGray);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        
        const splitText = doc.splitTextToSize(quote.notes, 180);
        doc.text(splitText, 15, notesY + 6);
    }
    
    // ===== FOOTER =====
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.line(15, 270, 195, 270);
    doc.text('Aceasta este o oferta comerciala si nu constituie o factura fiscala.', 15, 275);
    doc.text(`Generat de: ${quote.businessInfo?.name} | Data: ${new Date().toLocaleString('ro-RO')}`, 15, 280);
    
    // ===== SALVARE PDF =====
    const fileName = `Oferta_${quote.quoteNumber}_${quote.clientData?.name?.substring(0, 15)}.pdf`;
    doc.save(fileName);
    
    console.log('✅ PDF Ofertă descărcat: ' + fileName);
}

function convertQuoteToInvoice(quoteId) {
    const quote = quotations.find(q => q.id === quoteId);
    if (!quote) return;
    
    if (confirm('Convert this quotation to an invoice?')) {
        // Create invoice from quote
        const invoiceNumber = generateInvoiceNumber();
        
        // Verify client has required fields for ANAF
        if (!quote.clientData?.cui) {
            alert('⚠️ Clientul nu are CUI completat. Completeaza-l in detaliile facturii inainte de a salva.');
        }
        
        const newInvoice = {
            id: Date.now(),
            invoiceNumber: invoiceNumber,
            clientId: quote.clientId,
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            items: quote.items,
            subtotal: quote.subtotal,
            discount: quote.discount,
            discountAmount: quote.discountAmount,
            tax: quote.tax,
            taxAmount: quote.taxAmount,
            total: quote.total,
            notes: quote.notes,
            status: 'unpaid',
            clientData: quote.clientData,
            businessInfo: quote.businessInfo,
            paymentTerms: 'Net 30',
            paymentMethod: 'bank_transfer',  // Default ANAF compliant method
            appointmentId: null,
            createdAt: new Date().toISOString(),
            paidDate: null,
            sourceQuoteId: quoteId,
            eFiscalNumber: null,
            auditTrail: [
                {
                    action: 'created_from_quote',
                    timestamp: new Date().toISOString(),
                    user: 'current_user',
                    sourceQuote: quote.quoteNumber
                }
            ],
            isCompliant: true
        };
        
        invoices.push(newInvoice);
        
        // Mark quote as converted
        quote.status = 'converted';
        quote.convertedAt = new Date().toISOString();
        quote.invoiceId = newInvoice.id;
        
        saveToLocalStorage();
        syncToServer();
        
        document.getElementById('quoteDetailModal').style.display = 'none';
        renderQuotations();
        renderInvoices();
        
        showModal('✅ Succes', `Factura ${invoiceNumber} a fost creată din oferta!`);
    }
}

function deleteQuote(quoteId) {
    if (confirm('Sigur dorești să ștergi această ofertă?')) {
        quotations = quotations.filter(q => q.id !== quoteId);
        saveToLocalStorage();
        syncToServer();
        renderQuotations();
        showModal('✅ Succes', 'Oferta a fost ștearsă!');
    }
}

// Toggle between CUI (firma) and CNP (persoana fizica) fields
function toggleClientTypeFields(formType) {
    const clientType = document.getElementById(`${formType}ClientType`)?.value;
    const cuiRow = document.getElementById(`${formType}CUIRow`);
    const cnpRow = document.getElementById(`${formType}CNPRow`);
    
    if (!cuiRow || !cnpRow) return;
    
    if (clientType === 'firma') {
        cuiRow.style.display = 'flex';
        cnpRow.style.display = 'none';
        // Optional: clear CNP field
        const cnpInput = document.getElementById(`${formType}ClientCNP`);
        if (cnpInput) cnpInput.value = '';
    } else if (clientType === 'persoana') {
        cuiRow.style.display = 'none';
        cnpRow.style.display = 'flex';
        // Optional: clear CUI and RegCom fields
        const cuiInput = document.getElementById(`${formType}ClientCUI`);
        const regComInput = document.getElementById(`${formType}ClientRegCom`);
        if (cuiInput) cuiInput.value = '';
        if (regComInput) regComInput.value = '';
    }
}

// ==================== INVOICE FUNCTIONS ====================

function initializeInvoices() {
    const addBtn = document.getElementById('addInvoiceBtn');
    const form = document.getElementById('invoiceForm');
    
    if (!addBtn || !form) {
        console.error('Invoice elements not found in DOM');
        return;
    }
    
    addBtn.addEventListener('click', () => openInvoiceModal());
    form.addEventListener('submit', saveInvoice);
    
    const cancelBtn = document.getElementById('cancelInvoiceBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            document.getElementById('invoiceModal').style.display = 'none';
            resetForms();
        });
    }
    
    const invoiceFilter = document.getElementById('invoiceFilter');
    if (invoiceFilter) {
        invoiceFilter.addEventListener('change', renderInvoices);
    }
    
    const addItemBtn = document.getElementById('addInvoiceItem');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', addInvoiceItemRow);
    }
    
    const invoiceClient = document.getElementById('invoiceClient');
    if (invoiceClient) {
        invoiceClient.addEventListener('change', () => {
            updateInvoiceAppointmentSelect();
            fillClientDataInInvoice();
        });
    }
    
    // Add client from invoice modal
    const addClientBtn = document.getElementById('addClientFromInvoice');
    if (addClientBtn) {
        addClientBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Save that we're coming from invoice modal
            window.returnToInvoiceModal = true;
            // Close invoice modal
            document.getElementById('invoiceModal').style.display = 'none';
            // Open client modal
            openClientModal();
        });
    }
    
    const closeDetailBtn = document.getElementById('closeInvoiceDetailBtn');
    if (closeDetailBtn) {
        closeDetailBtn.addEventListener('click', () => {
            document.getElementById('invoiceDetailModal').style.display = 'none';
        });
    }
    
    // Add X button handler for invoice detail modal
    const invoiceDetailModal = document.getElementById('invoiceDetailModal');
    if (invoiceDetailModal) {
        const invoiceCloseBtn = invoiceDetailModal.querySelector('.close');
        if (invoiceCloseBtn) {
            invoiceCloseBtn.addEventListener('click', () => {
                invoiceDetailModal.style.display = 'none';
            });
        }
    }
    
    const printBtn = document.getElementById('printInvoiceBtn');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }
    
    const editBtn = document.getElementById('editInvoiceBtn');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            document.getElementById('invoiceDetailModal').style.display = 'none';
            const invId = document.getElementById('editInvoiceBtn').dataset.invoiceId;
            if (invId) {
                openInvoiceModal(parseInt(invId));
            }
        });
    }
    
    const markPaidBtn = document.getElementById('markAsPaidBtn');
    if (markPaidBtn) {
        markPaidBtn.addEventListener('click', () => {
            const invId = document.getElementById('editInvoiceBtn').dataset.invoiceId;
            if (invId) {
                markInvoiceAsPaid(parseInt(invId));
            }
        });
    }
    
    const createFromAptBtn = document.getElementById('createInvoiceFromAppointment');
    if (createFromAptBtn) {
        createFromAptBtn.addEventListener('click', () => {
            const aptId = document.getElementById('editFromDetailBtn').dataset.appointmentId;
            if (aptId) {
                createInvoiceFromAppointment(parseInt(aptId));
            }
        });
    }
}

function openInvoiceModal(invoiceId = null) {
    editingInvoiceId = invoiceId;
    const modal = document.getElementById('invoiceModal');
    const title = document.getElementById('invoiceModalTitle');
    
    updateInvoiceClientSelect();
    document.getElementById('invoiceItems').innerHTML = '';
    addInvoiceItemRow(); // Add first item row
    
    // Load business info
    document.getElementById('businessName').value = businessInfo.name;
    document.getElementById('businessEmail').value = businessInfo.email;
    document.getElementById('businessPhone').value = businessInfo.phone;
    document.getElementById('businessAddress').value = businessInfo.address;
    
    if (invoiceId) {
        const invoice = invoices.find(i => i.id === invoiceId);
        if (invoice) {
            title.textContent = '💼 Edit Invoice';
            document.getElementById('invoiceClient').value = invoice.clientId;
            updateInvoiceAppointmentSelect();
            document.getElementById('invoiceAppointment').value = invoice.appointmentId || '';
            document.getElementById('invoiceDate').value = invoice.date;
            document.getElementById('invoiceDueDate').value = invoice.dueDate;
            document.getElementById('invoiceNumber').value = invoice.invoiceNumber || '';
            document.getElementById('invoiceDiscount').value = invoice.discount || 0;
            document.getElementById('invoiceTax').value = invoice.tax || 0;
            document.getElementById('invoicePaymentTerms').value = invoice.paymentTerms || 'Net 30';
            document.getElementById('invoiceNotes').value = invoice.notes || '';
            document.getElementById('invoiceStatus').value = invoice.status;
            
            // Load client data from invoice
            if (invoice.clientData) {
                document.getElementById('invoiceClientName').value = invoice.clientData.name || '';
                document.getElementById('invoiceClientCUI').value = invoice.clientData.cui || '';
                document.getElementById('invoiceClientRegCom').value = invoice.clientData.regCom || '';
                document.getElementById('invoiceClientAddress').value = invoice.clientData.address || '';
                document.getElementById('invoiceClientCity').value = invoice.clientData.city || '';
                document.getElementById('invoiceClientCounty').value = invoice.clientData.county || '';
                document.getElementById('invoiceClientPostalCode').value = invoice.clientData.postalCode || '';
                document.getElementById('invoiceClientPhone').value = invoice.clientData.phone || '';
                document.getElementById('invoiceClientEmail').value = invoice.clientData.email || '';
                document.getElementById('invoiceClientIBAN').value = invoice.clientData.iban || '';
                document.getElementById('invoiceClientBank').value = invoice.clientData.bank || '';
            } else {
                fillClientDataInInvoice();
            }
            
            // Load items
            document.getElementById('invoiceItems').innerHTML = '';
            invoice.items.forEach(item => {
                addInvoiceItemRow(item);
            });
            calculateInvoiceTotal();
        }
    } else {
        title.textContent = '💼 Create Professional Invoice';
        const today = new Date().toISOString().split('T')[0];
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        document.getElementById('invoiceDate').value = today;
        document.getElementById('invoiceDueDate').value = dueDate.toISOString().split('T')[0];
        document.getElementById('invoiceNumber').value = generateInvoiceNumber();
        document.getElementById('invoiceStatus').value = 'unpaid';
        document.getElementById('invoiceDiscount').value = 0;
        document.getElementById('invoiceTax').value = 0;
        document.getElementById('invoicePaymentTerms').value = 'Net 30';
        
        // Clear client data fields
        document.getElementById('invoiceClientName').value = '';
        document.getElementById('invoiceClientCUI').value = '';
        document.getElementById('invoiceClientRegCom').value = '';
        document.getElementById('invoiceClientAddress').value = '';
        document.getElementById('invoiceClientCity').value = '';
        document.getElementById('invoiceClientCounty').value = '';
        document.getElementById('invoiceClientPostalCode').value = '';
        document.getElementById('invoiceClientPhone').value = '';
        document.getElementById('invoiceClientEmail').value = '';
        document.getElementById('invoiceClientIBAN').value = '';
        document.getElementById('invoiceClientBank').value = '';
    }
    
    // Add listeners for discount and tax
    document.getElementById('invoiceDiscount').addEventListener('input', calculateInvoiceTotal);
    document.getElementById('invoiceTax').addEventListener('input', calculateInvoiceTotal);
    
    modal.style.display = 'block';
    
    // Hide FAB buttons when modal opens on mobile
    const fabContainer = document.querySelector('.fab-container');
    if (fabContainer) fabContainer.classList.add('hidden');

    // Bind XML download button in modal
    const xmlBtn = document.getElementById('downloadEfacturaXmlBtn');
    if (xmlBtn) {
        xmlBtn.onclick = function() {
            if (invoiceId) {
                window.downloadEfacturaXML(invoiceId);
            } else {
                alert('Factura nu este salvată încă. Salvați factura înainte de a descărca XML.');
            }
        };
    }
}

function updateInvoiceClientSelect() {
    const select = document.getElementById('invoiceClient');
    select.innerHTML = '<option value="">Select a client</option>' +
        clients.map(client => `<option value="${client.id}">${client.name}</option>`).join('');
}

function fillClientDataInInvoice() {
    const clientId = parseInt(document.getElementById('invoiceClient').value);
    if (!clientId) {
        document.getElementById('invoiceClientName').value = '';
        document.getElementById('invoiceClientCUI').value = '';
        document.getElementById('invoiceClientRegCom').value = '';
        document.getElementById('invoiceClientAddress').value = '';
        document.getElementById('invoiceClientCity').value = '';
        document.getElementById('invoiceClientCounty').value = '';
        document.getElementById('invoiceClientPostalCode').value = '';
        document.getElementById('invoiceClientPhone').value = '';
        document.getElementById('invoiceClientEmail').value = '';
        document.getElementById('invoiceClientIBAN').value = '';
        document.getElementById('invoiceClientBank').value = '';
        return;
    }
    
    const client = clients.find(c => c.id === clientId);
    if (client) {
        document.getElementById('invoiceClientName').value = client.name || '';
        document.getElementById('invoiceClientCUI').value = client.cui || '';
        document.getElementById('invoiceClientRegCom').value = client.regCom || '';
        document.getElementById('invoiceClientAddress').value = client.address || '';
        document.getElementById('invoiceClientCity').value = client.city || '';
        document.getElementById('invoiceClientCounty').value = client.county || '';
        document.getElementById('invoiceClientPostalCode').value = client.postalCode || '';
        document.getElementById('invoiceClientPhone').value = client.phone || '';
        document.getElementById('invoiceClientEmail').value = client.email || '';
        document.getElementById('invoiceClientIBAN').value = client.iban || '';
        document.getElementById('invoiceClientBank').value = client.bank || '';
    }
}

function updateInvoiceAppointmentSelect() {
    const clientId = parseInt(document.getElementById('invoiceClient').value);
    const select = document.getElementById('invoiceAppointment');
    
    if (!clientId) {
        select.innerHTML = '<option value="">None - Manual Invoice</option>';
        return;
    }
    
    const clientAppointments = appointments.filter(a => a.clientId === clientId);
    select.innerHTML = '<option value="">None - Manual Invoice</option>' +
        clientAppointments.map(apt => {
            const dateStr = formatDate(apt.date);
            return `<option value="${apt.id}">${dateStr} at ${apt.time} - ${apt.service || 'Appointment'}</option>`;
        }).join('');
}

function addInvoiceItemRow(item = null) {
    const container = document.getElementById('invoiceItems');
    const itemId = Date.now();
    const div = document.createElement('div');
    div.className = 'invoice-item-row';
    div.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 0.5rem; margin-bottom: 0.75rem; align-items: end;';
    div.innerHTML = `
        <div class="form-group" style="margin-bottom: 0;">
            <label>Description</label>
            <input type="text" class="item-description" placeholder="Service or item" value="${item ? item.description : ''}" required>
        </div>
        <div class="form-group" style="margin-bottom: 0;">
            <label>Quantity</label>
            <input type="number" class="item-quantity" min="1" value="${item ? item.quantity : 1}" required>
        </div>
        <div class="form-group" style="margin-bottom: 0;">
            <label>Preț (Lei)</label>
            <input type="number" class="item-price" min="0" step="0.01" placeholder="0.00" value="${item ? item.price : ''}" required>
        </div>
        <div class="form-group" style="margin-bottom: 0;">
            <label>Total</label>
            <input type="text" class="item-total" readonly style="background: #f0f0f0; font-weight: 700;" value="0.00 Lei">
        </div>
        <button type="button" class="btn btn-danger" style="padding: 0.5rem; margin-bottom: 0.25rem;" onclick="this.parentElement.remove(); calculateInvoiceTotal();">🗑</button>
    `;
    
    // Add event listeners for calculation
    const quantityInput = div.querySelector('.item-quantity');
    const priceInput = div.querySelector('.item-price');
    const totalInput = div.querySelector('.item-total');
    
    const updateItemTotal = () => {
        const quantity = parseFloat(quantityInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        const total = quantity * price;
        totalInput.value = total.toFixed(2) + ' Lei';
        calculateInvoiceTotal();
    };
    
    quantityInput.addEventListener('input', updateItemTotal);
    priceInput.addEventListener('input', updateItemTotal);
    
    container.appendChild(div);
    updateItemTotal();
}

function calculateInvoiceTotal() {
    const itemRows = document.querySelectorAll('.invoice-item-row');
    let subtotal = 0;
    
    itemRows.forEach(row => {
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        subtotal += quantity * price;
    });
    
    const discountPercent = parseFloat(document.getElementById('invoiceDiscount')?.value) || 0;
    const taxPercent = parseFloat(document.getElementById('invoiceTax')?.value) || 0;
    
    const discountAmount = subtotal * (discountPercent / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (taxPercent / 100);
    const total = afterDiscount + taxAmount;
    
    if (document.getElementById('invoiceSubtotal')) {
        document.getElementById('invoiceSubtotal').textContent = subtotal.toFixed(2);
    }
    if (document.getElementById('invoiceDiscountAmount')) {
        document.getElementById('invoiceDiscountAmount').textContent = discountAmount.toFixed(2);
    }
    if (document.getElementById('invoiceTaxAmount')) {
        document.getElementById('invoiceTaxAmount').textContent = taxAmount.toFixed(2);
    }
    document.getElementById('invoiceTotal').textContent = total.toFixed(2);
}

function generateInvoiceNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const yearMonth = `${year}${month}`;
    
    // Count invoices from this month
    const thisMonthInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.date);
        const invYearMonth = `${invDate.getFullYear()}${String(invDate.getMonth() + 1).padStart(2, '0')}`;
        return invYearMonth === yearMonth;
    });
    
    const sequence = String(thisMonthInvoices.length + 1).padStart(4, '0');
    const series = businessInfo.invoiceSeries || 'INV';
    return `${series}-${yearMonth}-${sequence}`;
}

// Validate ANAF eFactura Romania compliance
function validateANAFCompliance(businessInfo, clientData, items, invoiceData) {
    const errors = [];
    const warnings = [];
    
    // BUSINESS INFO VALIDATION
    if (!businessInfo.name || businessInfo.name.trim() === '') {
        errors.push('Nume firmă: obligatoriu');
    }
    if (!businessInfo.cui || businessInfo.cui.trim() === '') {
        errors.push('CUI: obligatoriu pentru e-factură');
    } else if (!/^RO\d{8,10}$/.test(businessInfo.cui.trim())) {
        warnings.push('CUI format suspectat: ar trebui RO + 8-10 cifre');
    }
    if (!businessInfo.address || businessInfo.address.trim() === '') {
        errors.push('Adresă firmă: obligatoriu');
    }
    if (!businessInfo.city || businessInfo.city.trim() === '') {
        errors.push('Oraș firmă: obligatoriu');
    }
    if (!businessInfo.county || businessInfo.county.trim() === '') {
        errors.push('Județ/Sector: obligatoriu');
    }
    if (!businessInfo.postalCode || businessInfo.postalCode.trim() === '') {
        errors.push('Cod Poștal: obligatoriu');
    }
    if (!businessInfo.iban || businessInfo.iban.trim() === '') {
        warnings.push('IBAN: recomandat a fi completat');
    } else if (!/^RO\d{2}[A-Z]{4}\d{1,}/.test(businessInfo.iban.trim())) {
        warnings.push('IBAN format suspectat pentru România');
    }
    if (businessInfo.email && !/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(businessInfo.email)) {
        warnings.push('Email firmă: format invalid');
    }
    
    // CLIENT DATA VALIDATION
    if (!clientData.name || clientData.name.trim() === '') {
        errors.push('Nume client: obligatoriu');
    }
    if (!clientData.address || clientData.address.trim() === '') {
        errors.push('Adresă client: obligatoriu');
    }
    if (!clientData.city || clientData.city.trim() === '') {
        errors.push('Oraș client: obligatoriu');
    }
    if (!clientData.county || clientData.county.trim() === '') {
        errors.push('Județ/Sector client: obligatoriu');
    }
    if (!clientData.postalCode || clientData.postalCode.trim() === '') {
        errors.push('Cod Poștal client: obligatoriu');
    }
    
    // CUI/CNP validation - required for e-invoice based on client type
    const clientType = clientData.type || 'firma';
    
    if (clientType === 'firma') {
        // Company requires CUI
        if (!clientData.cui || clientData.cui.trim() === '') {
            warnings.push('CUI: recomandat a fi completat pentru firme');
        } else {
            const cuiValue = clientData.cui.trim();
            if (!/^RO\d{8,10}$/.test(cuiValue)) {
                warnings.push('CUI format suspectat: ar trebui RO + 8-10 cifre');
            }
        }
    } else if (clientType === 'persoana') {
        // Individual requires CNP
        if (!clientData.cnp || clientData.cnp.trim() === '') {
            warnings.push('CNP: recomandat a fi completat pentru persoane fizice');
        } else {
            const cnpValue = clientData.cnp.trim();
            if (!/^\d{13}$/.test(cnpValue)) {
                warnings.push('CNP format suspectat: ar trebui 13 cifre');
            }
        }
    }
    
    // ITEMS VALIDATION
    if (!items || items.length === 0) {
        errors.push('Articole: trebuie să adauge cel puțin un articol');
    }
    
    items.forEach((item, index) => {
        if (!item.description || item.description.trim() === '') {
            errors.push(`Articol ${index + 1}: descrierea obligatoriu`);
        }
        if (item.quantity <= 0) {
            errors.push(`Articol ${index + 1}: cantitatea trebuie > 0`);
        }
        if (item.price < 0) {
            errors.push(`Articol ${index + 1}: preț negativ`);
        }
    });
    
    // INVOICE DATA VALIDATION
    if (!invoiceData.date || invoiceData.date.trim() === '') {
        errors.push('Data facturii: obligatoriu');
    }
    if (!invoiceData.dueDate || invoiceData.dueDate.trim() === '') {
        errors.push('Data scadență: obligatoriu');
    }
    if (invoiceData.date && invoiceData.dueDate && invoiceData.date > invoiceData.dueDate) {
        errors.push('Data scadență trebuie după data facturii');
    }
    if (invoiceData.taxPercent < 0) {
        errors.push('TVA: nu poate fi negativ');
    }
    if (invoiceData.discountPercent < 0 || invoiceData.discountPercent > 100) {
        errors.push('Reducere: trebuie între 0-100%');
    }
    if (!invoiceData.paymentMethod || invoiceData.paymentMethod.trim() === '') {
        errors.push('Metoda plată: obligatoriu');
    }
    if (invoiceData.total < 0) {
        errors.push('Total: nu poate fi negativ');
    }
    
    return { errors, warnings, isValid: errors.length === 0 };
}

// Validate invoice number sequence (e-invoicing compliance)
function validateInvoiceSequence(newInvoiceNumber) {
    // Allow flexible format: Series-YYYYMM-Sequence
    // Examples: INV-202601-0001, OFR-202601-0001, etc
    const pattern = /^([A-Z0-9\-]+)-(\d{6})-(\d+)$/;
    const match = newInvoiceNumber.match(pattern);
    
    if (!match) {
        // If it doesn't match the pattern, it's likely manually entered - allow it
        return { valid: true };
    }
    
    const [_, series, yearMonth, sequence] = match;
    const sequenceNum = parseInt(sequence);
    
    // Get invoices from the same month and series
    const year = parseInt(yearMonth.substring(0, 4));
    const month = parseInt(yearMonth.substring(4, 6));
    
    const samePeriodInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.date);
        const invSeries = inv.invoiceNumber.split('-')[0];
        return invDate.getFullYear() === year && 
               (invDate.getMonth() + 1) === month &&
               invSeries === series;
    });
    
    // Check for gaps or duplicates
    if (samePeriodInvoices.length > 0) {
        const existingNumbers = samePeriodInvoices.map(inv => {
            const m = inv.invoiceNumber.match(pattern);
            return m ? parseInt(m[3]) : 0;
        }).sort((a, b) => a - b);
        
        const lastNum = existingNumbers[existingNumbers.length - 1];
        if (sequenceNum <= lastNum) {
            return { valid: false, error: `Numărul facturii trebuie să fie mai mare decât ${series}-${yearMonth}-${String(lastNum).padStart(4, '0')}` };
        }
    }
    
    return { valid: true };
}

function saveInvoice(e) {
    e.preventDefault();
    
    // Save business info with e-invoicing fields
    businessInfo = {
        name: document.getElementById('businessName').value || businessInfo.name,
        email: document.getElementById('businessEmail').value || businessInfo.email,
        phone: document.getElementById('businessPhone').value || businessInfo.phone,
        address: document.getElementById('businessAddress').value || businessInfo.address,
        cui: document.getElementById('businessCUI')?.value || businessInfo.cui || '',
        regCom: document.getElementById('businessRegCom')?.value || businessInfo.regCom || '',
        city: document.getElementById('businessCity')?.value || businessInfo.city || '',
        county: document.getElementById('businessCounty')?.value || businessInfo.county || '',
        postalCode: document.getElementById('businessPostalCode')?.value || businessInfo.postalCode || '',
        iban: document.getElementById('businessIBAN')?.value || businessInfo.iban || '',
        bank: document.getElementById('businessBank')?.value || businessInfo.bank || '',
        invoiceSeries: businessInfo.invoiceSeries || 'INV',
        quoteSeriesPrefix: businessInfo.quoteSeriesPrefix || 'OFR'
    };
    
    const itemRows = document.querySelectorAll('.invoice-item-row');
    const items = [];
    
    // Validare articole
    for (let i = 0; i < itemRows.length; i++) {
        const row = itemRows[i];
        const description = row.querySelector('.item-description').value?.trim();
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        
        if (!description) {
            alert(`⚠️ Articolul ${i + 1}: Descrierea nu poate fi goală`);
            return;
        }
        if (quantity <= 0) {
            alert(`⚠️ Articolul ${i + 1}: Cantitatea trebuie > 0`);
            return;
        }
        if (price < 0) {
            alert(`⚠️ Articolul ${i + 1}: Preț nu poate fi negativ`);
            return;
        }
        
        items.push({ description, quantity, price, total: quantity * price });
    }
    
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const discountPercent = parseFloat(document.getElementById('invoiceDiscount').value) || 0;
    const taxPercent = parseFloat(document.getElementById('invoiceTax').value) || 0;
    
    const discountAmount = subtotal * (discountPercent / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (taxPercent / 100);
    const total = afterDiscount + taxAmount;
    
    // Collect client data from invoice form - with e-invoicing validation
    const clientName = document.getElementById('invoiceClientName').value;
    const clientType = document.getElementById('invoiceClientType').value || 'firma';
    const clientCUI = document.getElementById('invoiceClientCUI').value;
    const clientCNP = document.getElementById('invoiceClientCNP').value;
    const clientEmail = document.getElementById('invoiceClientEmail').value;
    
    // E-INVOICE VALIDATION: Client name is required
    if (!clientName) {
        alert('⚠️ Numele clientului este necesar pentru conformitate e-factură');
        return;
    }
    
    // CUI and CNP are optional (not required)
    // Users can save invoices without them
    
    const clientData = {
        name: clientName,
        type: clientType,
        cui: clientCUI || null,
        cnp: clientCNP || null,
        regCom: document.getElementById('invoiceClientRegCom').value,
        address: document.getElementById('invoiceClientAddress').value,
        city: document.getElementById('invoiceClientCity').value,
        county: document.getElementById('invoiceClientCounty').value,
        postalCode: document.getElementById('invoiceClientPostalCode').value,
        phone: document.getElementById('invoiceClientPhone').value,
        email: clientEmail,
        iban: document.getElementById('invoiceClientIBAN').value,
        bank: document.getElementById('invoiceClientBank').value
    };
    
    const invoiceNumber = document.getElementById('invoiceNumber').value || generateInvoiceNumber();
    
    // Validate invoice sequence
    const sequenceValidation = validateInvoiceSequence(invoiceNumber);
    if (!sequenceValidation.valid && !editingInvoiceId) {
        alert('⚠️ ' + sequenceValidation.error);
        return;
    }
    
    const invoiceData = {
        id: editingInvoiceId || Date.now(),
        clientId: parseInt(document.getElementById('invoiceClient').value),
        appointmentId: document.getElementById('invoiceAppointment').value ? 
            parseInt(document.getElementById('invoiceAppointment').value) : null,
        date: document.getElementById('invoiceDate').value,
        dueDate: document.getElementById('invoiceDueDate').value,
        invoiceNumber: invoiceNumber,
        items: items,
        subtotal: subtotal,
        discount: discountPercent,
        discountAmount: discountAmount,
        tax: taxPercent,
        taxAmount: taxAmount,
        total: total,
        paymentTerms: document.getElementById('invoicePaymentTerms').value,
        paymentMethod: document.getElementById('invoicePaymentMethod')?.value || 'bank_transfer',
        notes: document.getElementById('invoiceNotes').value,
        status: document.getElementById('invoiceStatus').value,
        businessInfo: {...businessInfo},
        clientData: clientData,
        createdAt: editingInvoiceId ? 
            invoices.find(i => i.id === editingInvoiceId).createdAt : 
            new Date().toISOString(),
        issueDate: document.getElementById('invoiceDate').value,
        paidDate: editingInvoiceId ? invoices.find(i => i.id === editingInvoiceId).paidDate : null,
        // E-INVOICING FIELDS
        eFiscalNumber: editingInvoiceId ? invoices.find(i => i.id === editingInvoiceId).eFiscalNumber : null,
        auditTrail: editingInvoiceId ? invoices.find(i => i.id === editingInvoiceId).auditTrail : [],
        isCompliant: true
    };
    
    // ANAF eFactura Validation - Compatibilitate România
    const complianceValidation = validateANAFCompliance(businessInfo, clientData, items, {
        date: invoiceData.date,
        dueDate: invoiceData.dueDate,
        taxPercent: taxPercent,
        discountPercent: discountPercent,
        paymentMethod: invoiceData.paymentMethod,
        total: invoiceData.total
    });
    
    // Show compliance errors - FATAL
    if (complianceValidation.errors.length > 0) {
        let errorMessage = '❌ ERORI CONFORMITATE ANAF eFactura:\\n\\n';
        complianceValidation.errors.forEach((err, idx) => {
            errorMessage += `${idx + 1}. ${err}\\n`;
        });
        errorMessage += '\\n⚠️ Corectează aceste erori înainte de a salva factura.';
        alert(errorMessage);
        return;
    }
    
    // Show warnings but allow to continue
    if (complianceValidation.warnings.length > 0) {
        let warningMessage = '⚠️ AVERTISMENTE ANAF:\\n\\n';
        complianceValidation.warnings.forEach((warn, idx) => {
            warningMessage += `${idx + 1}. ${warn}\\n`;
        });
        warningMessage += '\\n✓ Poți continua, dar verifică aceste probleme potențiale.';
        console.warn(warningMessage);
    }
    
    // Add to audit trail
    invoiceData.auditTrail.push({
        action: editingInvoiceId ? 'updated' : 'created',
        timestamp: new Date().toISOString(),
        user: 'current_user',
        anafValidation: complianceValidation
    });
    
    // If status changed to paid and no paidDate exists, set it now
    if (invoiceData.status === 'paid' && !invoiceData.paidDate) {
        invoiceData.paidDate = new Date().toISOString().split('T')[0];
    }
    // If status changed from paid to something else, clear paidDate
    if (invoiceData.status !== 'paid') {
        invoiceData.paidDate = null;
    }
    
    if (editingInvoiceId) {
        const index = invoices.findIndex(i => i.id === editingInvoiceId);
        invoices[index] = invoiceData;
        showToast('🔄 Factura a fost actualizată cu succes!', 'success');
    } else {
        invoices.push(invoiceData);
        showToast('✅ Factura a fost creată cu succes!', 'success');
    }
    
    saveToLocalStorage();
    syncToServer();
    document.getElementById('invoiceModal').style.display = 'none';
    resetForms();
    renderInvoices();
    renderDashboard();
}

function renderInvoices() {
    const filter = document.getElementById('invoiceFilter').value;
    let filteredInvoices = invoices;
    
    if (filter === 'unpaid') {
        filteredInvoices = invoices.filter(i => i.status === 'unpaid');
    } else if (filter === 'paid') {
        filteredInvoices = invoices.filter(i => i.status === 'paid');
    } else if (filter === 'overdue') {
        const today = new Date().toISOString().split('T')[0];
        filteredInvoices = invoices.filter(i => i.status === 'unpaid' && i.dueDate < today);
    }
    
    filteredInvoices.sort((a, b) => b.date.localeCompare(a.date));
    
    const invoicesList = document.getElementById('invoicesList');
    
    if (filteredInvoices.length === 0) {
        invoicesList.innerHTML = '<div class="empty-state"><h3>Nu există facturi</h3><p>Creează prima factură pentru a începe</p></div>';
        return;
    }
    
    invoicesList.innerHTML = filteredInvoices.map(invoice => {
        const client = clients.find(c => c.id === invoice.clientId);
        const clientName = client ? client.name : 'Unknown Client';
        const statusClass = invoice.status === 'paid' ? 'confirmed' : 
                           invoice.status === 'overdue' ? 'cancelled' : 'scheduled';
        
        return `
            <div class="invoice-card" style="background: white; border: 2px solid #f0f0f0; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                <div class="invoice-info">
                    <div class="invoice-title" style="font-size: 1.3rem; font-weight: 700; color: #333; margin-bottom: 0.5rem;">
                        ${invoice.invoiceNumber} - ${clientName}
                    </div>
                    <div class="invoice-details" style="color: #666;">
                        📅 Data: ${formatDate(invoice.date)} | Scadență: ${formatDate(invoice.dueDate)}
                        <br>💰 Total: ${invoice.total.toFixed(2)} Lei
                        <br><span class="status-badge status-${statusClass}">${invoice.status.toUpperCase()}</span>
                    </div>
                </div>
                <div class="invoice-actions" style="display: flex; gap: 0.75rem;">
                    <button class="btn btn-primary" onclick="showInvoiceDetail(${invoice.id})">Vezi</button>
                    <button class="btn btn-edit" onclick="openInvoiceModal(${invoice.id})">Editează</button>
                    <button class="btn btn-danger" onclick="deleteInvoice(${invoice.id})">Sterge</button>
                </div>
            </div>
        `;
    }).join('');
}

function showInvoiceDetail(invoiceId) {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;
    
    const client = clients.find(c => c.id === invoice.clientId);
    const clientName = client ? client.name : 'Unknown Client';
    const clientPhone = client ? client.phone : 'N/A';
    const clientEmail = client ? client.email : 'N/A';
    const clientAddress = client ? client.address : 'N/A';
    
    const bizInfo = invoice.businessInfo || businessInfo;
    
    const modal = document.getElementById('invoiceDetailModal');
    const content = document.getElementById('invoiceDetailContent');
    
    const itemsHtml = invoice.items.map(item => `
        <tr>
            <td style="padding: 0.75rem; border-bottom: 1px solid #e0e0e0;">${item.description}</td>
            <td style="padding: 0.75rem; border-bottom: 1px solid #e0e0e0; text-align: center;">${item.quantity}</td>
            <td style="padding: 0.75rem; border-bottom: 1px solid #e0e0e0; text-align: right;">${item.price.toFixed(2)} Lei</td>
            <td style="padding: 0.75rem; border-bottom: 1px solid #e0e0e0; text-align: right; font-weight: 700;">${item.total.toFixed(2)} Lei</td>
        </tr>
    `).join('');
    
    const subtotal = invoice.subtotal || invoice.total;
    const discount = invoice.discountAmount || 0;
    const tax = invoice.taxAmount || 0;
    
    content.innerHTML = `
        <div class="invoice-professional-display">
            <div class="invoice-header-section">
                <div class="invoice-company-info">
                    <h2>${bizInfo.name}</h2>
                    <div style="color: #666; line-height: 1.8;">
                        ${bizInfo.email}<br>
                        ${bizInfo.phone}<br>
                        ${bizInfo.address.replace(/\n/g, '<br>')}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 1rem 1.5rem; border-radius: 8px; margin-bottom: 1rem;">
                        <div style="font-size: 1.5rem; font-weight: 700;">Factură Fiscală</div>
                        <div style="font-size: 1.2rem;">${invoice.invoiceNumber}</div>
                    </div>
                    <div style="color: #666; line-height: 1.8;">
                        <strong>Data:</strong> ${formatDate(invoice.date)}<br>
                        <strong>Scadență:</strong> ${formatDate(invoice.dueDate)}<br>
                        <strong>Termeni:</strong> ${invoice.paymentTerms || 'Net 30'}
                    </div>
                </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                <h3 style="margin: 0 0 1rem 0; color: #667eea;">Facturat către:</h3>
                <div style="font-size: 1.1rem; line-height: 1.8;">
                    <strong>${clientName}</strong><br>
                    ${clientEmail}<br>
                    ${clientPhone}<br>
                    ${clientAddress !== 'N/A' ? clientAddress : ''}
                </div>
            </div>
            
            <table class="invoice-details-table">
                <thead>
                    <tr>
                        <th>Descriere</th>
                        <th style="text-align: center; width: 100px;">Cant.</th>
                        <th style="text-align: right; width: 120px;">Preț Unitar</th>
                        <th style="text-align: right; width: 120px;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            
            <div class="invoice-summary-section">
                <div class="invoice-summary-box">
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #ddd;">
                        <span>Subtotal:</span>
                        <span style="font-weight: 600;">${subtotal.toFixed(2)} Lei</span>
                    </div>
                    ${discount > 0 ? `
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #ddd; color: #4caf50;">
                        <span>Discount (${invoice.discount}%):</span>
                        <span style="font-weight: 600;">-${discount.toFixed(2)} Lei</span>
                    </div>
                    ` : ''}
                    ${tax > 0 ? `
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #ddd;">
                        <span>TVA (${invoice.tax}%):</span>
                        <span style="font-weight: 600;">${tax.toFixed(2)} Lei</span>
                    </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; padding: 1rem 0; border-top: 3px solid #667eea; margin-top: 0.5rem;">
                        <span style="font-size: 1.3rem; font-weight: 700; color: #667eea;">Total:</span>
                        <span style="font-size: 1.5rem; font-weight: 700; color: #667eea;">${invoice.total.toFixed(2)} Lei</span>
                    </div>
                    <div style="text-align: center; padding: 1rem; margin-top: 1rem; background: ${invoice.status === 'paid' ? '#4caf50' : invoice.status === 'overdue' ? '#f44336' : '#ff9800'}; color: white; border-radius: 8px; font-weight: 700; text-transform: uppercase;">
                        ${invoice.status === 'paid' ? '✅ PLĂTITĂ' : invoice.status === 'overdue' ? '⚠️ RESTANȚĂ' : '⏰ ' + invoice.status}
                    </div>
                </div>
            </div>
            
            ${invoice.notes ? `
            <div class="invoice-footer">
                <strong>Note:</strong><br>
                ${invoice.notes}
            </div>
            ` : ''}
        </div>
    `;
    
    document.getElementById('editInvoiceBtn').dataset.invoiceId = invoiceId;
    document.getElementById('markAsPaidBtn').style.display = invoice.status === 'paid' ? 'none' : 'inline-flex';
    
    // eFactura PDF button
    const efacturaPdfBtn = document.getElementById('downloadEfacturaPdfBtn');
    if (efacturaPdfBtn) {
        efacturaPdfBtn.onclick = () => downloadEfacturaPDF(invoiceId);
    }

    // eFactura XML button
    const efacturaXmlBtn = document.getElementById('downloadEfacturaXmlBtn');
    if (efacturaXmlBtn) {
        efacturaXmlBtn.onclick = () => window.downloadEfacturaXML(invoiceId);
    }
    
    // Setup ANAF sidebar
    updateANAFSidebarStatus(invoice);
    document.getElementById('submitInvoiceToANAFBtn').onclick = () => submitInvoiceToANAF(invoiceId);
    
    modal.style.display = 'block';
    modal.dataset.currentInvoiceId = invoiceId;
    
    // Hide FAB buttons when modal opens on mobile
    const fabContainer = document.querySelector('.fab-container');
    if (fabContainer) fabContainer.classList.add('hidden');
}

// Update ANAF sidebar status display
function updateANAFSidebarStatus(invoice) {
    const statusDiv = document.getElementById('invoiceANAFStatus');
    const statusText = document.getElementById('invoiceANAFStatusText');
    const numberDisplay = document.getElementById('invoiceNumberDisplay');
    
    numberDisplay.textContent = invoice.invoiceNumber;
    
    if (invoice.anapSubmittedAt) {
        statusDiv.classList.add('submitted');
        statusDiv.innerHTML = '<span style="font-size: 1.2rem;">✅ TRIMISĂ</span>';
        const date = new Date(invoice.anapSubmittedAt).toLocaleDateString('ro-RO');
        statusText.textContent = `Trimisă: ${date}`;
        statusText.style.color = '#4caf50';
    } else if (invoice.anapError) {
        statusDiv.style.background = 'rgba(244, 67, 54, 0.2) !important';
        statusDiv.innerHTML = '<span style="font-size: 1.2rem;">❌ EROARE</span>';
        statusText.textContent = `Eroare: ${invoice.anapError}`;
        statusText.style.color = '#f44336';
    } else {
        statusDiv.style.background = 'rgba(255, 255, 255, 0.2) !important';
        statusDiv.innerHTML = '<span style="font-size: 1.2rem;">⏳ AȘTEPTARE</span>';
        statusText.textContent = 'Neprocesată';
    }
}

// Submit invoice to ANAF
async function submitInvoiceToANAF(invoiceId) {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;
    
    // Check if already submitted
    if (invoice.anapSubmittedAt) {
        alert('⚠️ Această factură a fost deja trimisă la ANAF pe ' + 
              new Date(invoice.anapSubmittedAt).toLocaleDateString('ro-RO'));
        return;
    }
    
    const btn = document.getElementById('submitInvoiceToANAFBtn');
    btn.disabled = true;
    btn.textContent = '⏳ Se trimite...';
    
    try {
        // Validate ANAF compliance first
        const complianceValidation = validateANAFCompliance(invoice.businessInfo, invoice.clientData, invoice.items, {
            date: invoice.date,
            dueDate: invoice.dueDate,
            taxPercent: invoice.tax,
            discountPercent: invoice.discount,
            paymentMethod: invoice.paymentMethod,
            total: invoice.total
        });
        
        if (complianceValidation.errors.length > 0) {
            let errorMsg = '❌ Factură nu conformă ANAF:\n\n';
            complianceValidation.errors.slice(0, 3).forEach(e => errorMsg += '• ' + e + '\n');
            alert(errorMsg);
            invoice.anapError = 'Non-conformă ANAF: ' + complianceValidation.errors[0];
            throw new Error('ANAF compliance validation failed');
        }
        
        // Prepare invoice data for ANAF
        const invoicePayload = {
            invoiceNumber: invoice.invoiceNumber,
            date: invoice.date,
            dueDate: invoice.dueDate,
            issuer: {
                name: invoice.businessInfo.name,
                cui: invoice.businessInfo.cui,
                regCom: invoice.businessInfo.regCom,
                address: invoice.businessInfo.address,
                city: invoice.businessInfo.city,
                county: invoice.businessInfo.county,
                postalCode: invoice.businessInfo.postalCode,
                email: invoice.businessInfo.email,
                phone: invoice.businessInfo.phone
            },
            customer: {
                name: invoice.clientData.name,
                cui: invoice.clientData.cui,
                address: invoice.clientData.address,
                city: invoice.clientData.city,
                county: invoice.clientData.county,
                postalCode: invoice.clientData.postalCode,
                email: invoice.clientData.email
            },
            items: invoice.items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                price: item.price,
                total: item.total
            })),
            subtotal: invoice.subtotal,
            discountPercent: invoice.discount,
            discountAmount: invoice.discountAmount,
            taxPercent: invoice.tax,
            taxAmount: invoice.taxAmount,
            total: invoice.total,
            paymentMethod: invoice.paymentMethod,
            paymentTerms: invoice.paymentTerms
        };
        
        // Send to ANAF API endpoint
        const response = await fetch('/api/anaf/submit-invoice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(invoicePayload)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Mark as submitted
            invoice.anapSubmittedAt = new Date().toISOString();
            invoice.anapTicketNumber = result.ticketNumber;
            invoice.anapStatus = 'submitted';
            invoice.anapError = null;
            
            saveToLocalStorage();
            syncToServer();
            
            updateANAFSidebarStatus(invoice);
            
            alert('✅ Factură trimisă cu succes la ANAF!\n\n' +
                  'Număr tichet: ' + result.ticketNumber + '\n' +
                  'Verifică status pe portalul ANAF cu acest număr.');
            
            btn.textContent = '✅ TRIMISĂ';
        } else {
            throw new Error(result.error || 'Unknown error from ANAF');
        }
    } catch (error) {
        console.error('ANAF submission error:', error);
        invoice.anapError = error.message;
        
        alert('❌ Eroare la trimiterea la ANAF:\n' + error.message + '\n\n' +
              'Dacă serverul ANAF nu este disponibil, puteți reîncerca mai târziu.\n' +
              'API endpoint: POST /api/anaf/submit-invoice');
        
        updateANAFSidebarStatus(invoice);
        btn.textContent = '▶ Trimite ANAF';
    } finally {
        btn.disabled = false;
        if (btn.textContent === '⏳ Se trimite...') {
            btn.textContent = '▶ Trimite ANAF';
        }
    }
}

function markInvoiceAsPaid(invoiceId) {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (invoice) {
        invoice.status = 'paid';
        invoice.paidDate = new Date().toISOString().split('T')[0]; // Save payment date
        saveToLocalStorage();
        renderDashboard(); // Update dashboard to refresh revenue stats
        document.getElementById('invoiceDetailModal').style.display = 'none';
        renderInvoices();
        showNotification('Invoice marked as paid! 💰');
    }
}

function downloadInvoicePDF(invoiceId) {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;
    
    const client = clients.find(c => c.id === invoice.clientId);
    const clientName = client ? client.name : 'Client Necunoscut';
    const clientPhone = client ? client.phone : 'N/A';
    const clientEmail = client ? client.email : 'N/A';
    
    const bizInfo = invoice.businessInfo || businessInfo;
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Header - Company Info
        doc.setFontSize(16);
        doc.setTextColor(102, 126, 234);
        doc.text(bizInfo.name, 14, 20);
        
        doc.setFontSize(9);
        doc.setTextColor(100);
        const addressLines = bizInfo.address.split('\n');
        let yPos = 27;
        addressLines.forEach(line => {
            doc.text(line, 14, yPos);
            yPos += 5;
        });
        doc.text(bizInfo.email, 14, yPos);
        yPos += 5;
        doc.text(bizInfo.phone, 14, yPos);
        
        // Invoice Title Box
        doc.setFillColor(102, 126, 234);
        doc.rect(140, 15, 55, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text('Factură Fiscală', 167, 23, { align: 'center' });
        doc.setFontSize(11);
        doc.text(invoice.invoiceNumber, 167, 32, { align: 'center' });
        
        // Invoice Details
        doc.setTextColor(0);
        doc.setFontSize(9);
        doc.text('Data: ' + formatDate(invoice.date), 140, 45);
        doc.text('Scadență: ' + formatDate(invoice.dueDate), 140, 50);
        doc.text('Termeni: ' + (invoice.paymentTerms || 'Net 30'), 140, 55);
        
        // Bill To Section
        yPos = 70;
        doc.setFillColor(248, 249, 250);
        doc.rect(14, yPos - 5, 180, 30, 'F');
        doc.setTextColor(102, 126, 234);
        doc.setFontSize(11);
        doc.text('Facturat către:', 18, yPos);
        
        doc.setTextColor(0);
        doc.setFontSize(10);
        yPos += 7;
        doc.text(clientName, 18, yPos);
        yPos += 5;
        doc.setFontSize(9);
        doc.text(clientEmail, 18, yPos);
        yPos += 5;
        doc.text(clientPhone, 18, yPos);
        
        // Items Table
        yPos = 110;
        const itemsData = invoice.items.map(item => [
            item.description,
            item.quantity.toString(),
            item.price.toFixed(2) + ' Lei',
            item.total.toFixed(2) + ' Lei'
        ]);
        
        doc.autoTable({
            startY: yPos,
            head: [['Descriere', 'Cant.', 'Preț Unitar', 'Total']],
            body: itemsData,
            theme: 'grid',
            headStyles: {
                fillColor: [102, 126, 234],
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: 'bold'
            },
            styles: {
                fontSize: 9,
                cellPadding: 5
            },
            columnStyles: {
                0: { cellWidth: 90 },
                1: { cellWidth: 25, halign: 'center' },
                2: { cellWidth: 35, halign: 'right' },
                3: { cellWidth: 35, halign: 'right' }
            }
        });
        
        // Summary
        yPos = doc.lastAutoTable.finalY + 10;
        const summaryX = 140;
        
        const subtotal = invoice.subtotal || invoice.total;
        const discount = invoice.discountAmount || 0;
        const tax = invoice.taxAmount || 0;
        
        doc.setFontSize(9);
        doc.text('Subtotal:', summaryX, yPos);
        doc.text(subtotal.toFixed(2) + ' Lei', 190, yPos, { align: 'right' });
        
        if (discount > 0) {
            yPos += 6;
            doc.setTextColor(76, 175, 80);
            doc.text(`Discount (${invoice.discount}%):`, summaryX, yPos);
            doc.text('-' + discount.toFixed(2) + ' Lei', 190, yPos, { align: 'right' });
            doc.setTextColor(0);
        }
        
        if (tax > 0) {
            yPos += 6;
            doc.text(`TVA (${invoice.tax}%):`, summaryX, yPos);
            doc.text(tax.toFixed(2) + ' Lei', 190, yPos, { align: 'right' });
        }
        
        // Total
        yPos += 8;
        doc.setLineWidth(0.5);
        doc.setDrawColor(102, 126, 234);
        doc.line(summaryX, yPos - 2, 190, yPos - 2);
        
        doc.setFontSize(12);
        doc.setTextColor(102, 126, 234);
        doc.setFont(undefined, 'bold');
        doc.text('Total:', summaryX, yPos);
        doc.text(invoice.total.toFixed(2) + ' Lei', 190, yPos, { align: 'right' });
        
        // Status Badge
        yPos += 10;
        let statusColor, statusText;
        if (invoice.status === 'paid') {
            statusColor = [76, 175, 80];
            statusText = '✓ PLĂTITĂ';
        } else if (invoice.status === 'overdue') {
            statusColor = [244, 67, 54];
            statusText = '⚠ RESTANȚĂ';
        } else {
            statusColor = [255, 152, 0];
            statusText = '⏰ ' + invoice.status.toUpperCase();
        }
        
        doc.setFillColor(...statusColor);
        doc.rect(summaryX, yPos - 5, 50, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text(statusText, summaryX + 25, yPos + 1, { align: 'center' });
        
        // Notes
        if (invoice.notes) {
            yPos += 20;
            doc.setTextColor(0);
            doc.setFont(undefined, 'bold');
            doc.setFontSize(10);
            doc.text('Note:', 14, yPos);
            doc.setFont(undefined, 'normal');
            doc.setFontSize(9);
            const noteLines = doc.splitTextToSize(invoice.notes, 180);
            doc.text(noteLines, 14, yPos + 5);
        }
        
        // Save PDF
        doc.save(`Factura-${invoice.invoiceNumber}.pdf`);
        showNotification('✅ Factură descărcată cu succes!');
    } catch (error) {
        console.error('Eroare generare PDF:', error);
        showNotification('❌ Eroare la generarea PDF-ului');
    }
}

// Export invoice as e-invoice JSON (UBL-compatible structure)
function exportInvoiceAsJSON(invoiceId) {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;
    
    const eInvoiceJSON = {
        // UBL StandardBusinessDocument
        "xmlns": "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
        "UBLVersionID": "2.1",
        "CustomizationID": "urn:cen.eu:en16931:2017",
        "ProfileID": "urn:fdc:peppol.eu:2017:poacc:billing:01:1.0",
        
        // Document Header
        "ID": invoice.invoiceNumber,
        "IssueDate": invoice.date,
        "DueDate": invoice.dueDate,
        "InvoiceTypeCode": "380",
        "DocumentCurrencyCode": "RON",
        
        // Supplier (Issuer)
        "AccountingSupplierParty": {
            "PartyIdentification": {
                "ID": invoice.businessInfo.cui,
                "SchemeID": "CUI"
            },
            "PartyName": {
                "Name": invoice.businessInfo.name
            },
            "PostalAddress": {
                "StreetName": invoice.businessInfo.address,
                "CityName": invoice.businessInfo.city,
                "CountrySubentity": invoice.businessInfo.county,
                "PostalZone": invoice.businessInfo.postalCode,
                "CountryIdentificationCode": "RO"
            },
            "Contact": {
                "Telephone": invoice.businessInfo.phone,
                "ElectronicMail": invoice.businessInfo.email
            }
        },
        
        // Customer (Buyer)
        "AccountingCustomerParty": {
            "PartyIdentification": {
                "ID": invoice.clientData.cui,
                "SchemeID": "CUI"
            },
            "PartyName": {
                "Name": invoice.clientData.name
            },
            "PostalAddress": {
                "StreetName": invoice.clientData.address,
                "CityName": invoice.clientData.city,
                "CountrySubentity": invoice.clientData.county,
                "PostalZone": invoice.clientData.postalCode,
                "CountryIdentificationCode": "RO"
            },
            "Contact": {
                "Telephone": invoice.clientData.phone,
                "ElectronicMail": invoice.clientData.email
            }
        },
        
        // Line Items
        "InvoiceLine": invoice.items.map((item, index) => ({
            "ID": (index + 1).toString(),
            "InvoicedQuantity": {
                "value": item.quantity,
                "unitCode": "C62" // Each
            },
            "LineExtensionAmount": {
                "value": item.total.toFixed(2),
                "currencyID": "RON"
            },
            "Item": {
                "Description": item.description,
                "VATInformation": {
                    "TaxPercentage": invoice.tax.toFixed(2)
                }
            },
            "Price": {
                "PriceAmount": {
                    "value": item.price.toFixed(2),
                    "currencyID": "RON"
                }
            }
        })),
        
        // Monetary Totals
        "LegalMonetaryTotal": {
            "LineExtensionAmount": {
                "value": invoice.subtotal.toFixed(2),
                "currencyID": "RON"
            },
            "AllowanceTotalAmount": {
                "value": invoice.discountAmount.toFixed(2),
                "currencyID": "RON"
            },
            "TaxExclusiveAmount": {
                "value": (invoice.subtotal - invoice.discountAmount).toFixed(2),
                "currencyID": "RON"
            },
            "TaxInclusiveAmount": {
                "value": invoice.total.toFixed(2),
                "currencyID": "RON"
            },
            "PrepaidAmount": {
                "value": "0.00",
                "currencyID": "RON"
            },
            "PayableAmount": {
                "value": invoice.total.toFixed(2),
                "currencyID": "RON"
            }
        },
        
        // Tax Information
        "TaxTotal": {
            "TaxAmount": {
                "value": invoice.taxAmount.toFixed(2),
                "currencyID": "RON"
            },
            "TaxSubtotal": {
                "TaxableAmount": {
                    "value": (invoice.subtotal - invoice.discountAmount).toFixed(2),
                    "currencyID": "RON"
                },
                "TaxAmount": {
                    "value": invoice.taxAmount.toFixed(2),
                    "currencyID": "RON"
                },
                "TaxPercentage": invoice.tax.toFixed(2),
                "TaxCategoryCode": "S"
            }
        },
        
        // Payment Information
        "PaymentMeans": {
            "PaymentMeansCode": invoice.paymentMethod === "cash" ? "10" : "30", // 10=cash, 30=credit transfer
            "PayeeFinancialAccount": {
                "ID": invoice.clientData.iban,
                "FinancialInstitutionBranch": {
                    "FinancialInstitution": {
                        "Name": invoice.clientData.bank
                    }
                }
            }
        },
        
        // Payment Terms
        "PaymentTerms": {
            "Note": invoice.paymentTerms
        },
        
        // Metadata
        "metadata": {
            "eFiscalNumber": invoice.eFiscalNumber || null,
            "status": invoice.status,
            "isCompliant": invoice.isCompliant,
            "createdAt": invoice.createdAt,
            "auditTrail": invoice.auditTrail || []
        }
    };
    
    // Download as JSON
    const dataStr = JSON.stringify(eInvoiceJSON, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.invoiceNumber}-einvoice.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showNotification('✅ Invoice exported as e-invoice JSON!');
}

// Download eFactura XML (UBL 2.1/EN 16931 compliant)
function downloadEfacturaXML(invoiceId) {
        const invoice = invoices.find(i => i.id === invoiceId);
        if (!invoice) {
                alert('❌ Factura nu a fost găsită');
                return;
        }

        // Helper to escape XML special characters
        function xmlEscape(str) {
                return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
        }

        // Build minimal UBL 2.1/EN 16931 XML (expand as needed)
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
                 xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
                 xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
    <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
    <cbc:CustomizationID>urn:cen.eu:en16931:2017</cbc:CustomizationID>
    <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>
    <cbc:ID>${xmlEscape(invoice.invoiceNumber)}</cbc:ID>
    <cbc:IssueDate>${xmlEscape(invoice.date)}</cbc:IssueDate>
    <cbc:DueDate>${xmlEscape(invoice.dueDate)}</cbc:DueDate>
    <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
    <cbc:DocumentCurrencyCode>RON</cbc:DocumentCurrencyCode>
    <cac:AccountingSupplierParty>
        <cac:Party>
            <cac:PartyIdentification><cbc:ID>${xmlEscape(invoice.businessInfo?.cui || businessInfo.cui)}</cbc:ID></cac:PartyIdentification>
            <cac:PartyName><cbc:Name>${xmlEscape(invoice.businessInfo?.name || businessInfo.name)}</cbc:Name></cac:PartyName>
            <cac:PostalAddress>
                <cbc:StreetName>${xmlEscape(invoice.businessInfo?.address || businessInfo.address)}</cbc:StreetName>
                <cbc:CityName>${xmlEscape(invoice.businessInfo?.city || businessInfo.city)}</cbc:CityName>
                <cbc:CountrySubentity>${xmlEscape(invoice.businessInfo?.county || businessInfo.county)}</cbc:CountrySubentity>
                <cbc:PostalZone>${xmlEscape(invoice.businessInfo?.postalCode || businessInfo.postalCode)}</cbc:PostalZone>
                <cac:Country><cbc:IdentificationCode>RO</cbc:IdentificationCode></cac:Country>
            </cac:PostalAddress>
            <cac:Contact>
                <cbc:Telephone>${xmlEscape(invoice.businessInfo?.phone || businessInfo.phone)}</cbc:Telephone>
                <cbc:ElectronicMail>${xmlEscape(invoice.businessInfo?.email || businessInfo.email)}</cbc:ElectronicMail>
            </cac:Contact>
        </cac:Party>
    </cac:AccountingSupplierParty>
    <cac:AccountingCustomerParty>
        <cac:Party>
            <cac:PartyIdentification><cbc:ID>${xmlEscape(invoice.clientData?.cui || '')}</cbc:ID></cac:PartyIdentification>
            <cac:PartyName><cbc:Name>${xmlEscape(invoice.clientData?.name || '')}</cbc:Name></cac:PartyName>
            <cac:PostalAddress>
                <cbc:StreetName>${xmlEscape(invoice.clientData?.address || '')}</cbc:StreetName>
                <cbc:CityName>${xmlEscape(invoice.clientData?.city || '')}</cbc:CityName>
                <cbc:CountrySubentity>${xmlEscape(invoice.clientData?.county || '')}</cbc:CountrySubentity>
                <cbc:PostalZone>${xmlEscape(invoice.clientData?.postalCode || '')}</cbc:PostalZone>
                <cac:Country><cbc:IdentificationCode>RO</cbc:IdentificationCode></cac:Country>
            </cac:PostalAddress>
            <cac:Contact>
                <cbc:Telephone>${xmlEscape(invoice.clientData?.phone || '')}</cbc:Telephone>
                <cbc:ElectronicMail>${xmlEscape(invoice.clientData?.email || '')}</cbc:ElectronicMail>
            </cac:Contact>
        </cac:Party>
    </cac:AccountingCustomerParty>
    ${invoice.items.map((item, idx) => `
            <cac:InvoiceLine>
                <cbc:ID>${idx + 1}</cbc:ID>
                <cbc:InvoicedQuantity unitCode="C62">${item.quantity}</cbc:InvoicedQuantity>
                <cbc:LineExtensionAmount currencyID="RON">${item.total.toFixed(2)}</cbc:LineExtensionAmount>
                <cac:Item>
                    <cbc:Description>${xmlEscape(item.description)}</cbc:Description>
                </cac:Item>
                <cac:Price>
                    <cbc:PriceAmount currencyID="RON">${item.price.toFixed(2)}</cbc:PriceAmount>
                </cac:Price>
            </cac:InvoiceLine>`).join('')}
    <cac:LegalMonetaryTotal>
        <cbc:LineExtensionAmount currencyID="RON">${invoice.subtotal.toFixed(2)}</cbc:LineExtensionAmount>
        <cbc:TaxExclusiveAmount currencyID="RON">${(invoice.subtotal - invoice.discountAmount).toFixed(2)}</cbc:TaxExclusiveAmount>
        <cbc:TaxInclusiveAmount currencyID="RON">${invoice.total.toFixed(2)}</cbc:TaxInclusiveAmount>
        <cbc:PayableAmount currencyID="RON">${invoice.total.toFixed(2)}</cbc:PayableAmount>
    </cac:LegalMonetaryTotal>
</Invoice>`;

        // Download XML
        const blob = new Blob([xml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `eFactura_${invoice.invoiceNumber || 'invoice'}.xml`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        if (typeof showNotification === 'function') {
                showNotification('✅ eFactura XML descărcat cu succes!');
        }
}

// Expose globally for button access
window.downloadEfacturaXML = downloadEfacturaXML;

// Export quotation as JSON for email
function exportQuotationAsJSON(quoteId) {
    const quote = quotations.find(q => q.id === quoteId);
    if (!quote) return;
    
    const quoteJSON = {
        "quoteNumber": quote.quoteNumber,
        "date": quote.date,
        "validUntil": quote.validUntil,
        "status": quote.status,
        
        "issuer": {
            "name": quote.businessInfo.name,
            "cui": quote.businessInfo.cui,
            "address": quote.businessInfo.address,
            "city": quote.businessInfo.city,
            "county": quote.businessInfo.county,
            "postalCode": quote.businessInfo.postalCode,
            "phone": quote.businessInfo.phone,
            "email": quote.businessInfo.email
        },
        
        "client": {
            "name": quote.clientData.name,
            "cui": quote.clientData.cui,
            "address": quote.clientData.address,
            "city": quote.clientData.city,
            "county": quote.clientData.county,
            "postalCode": quote.clientData.postalCode,
            "phone": quote.clientData.phone,
            "email": quote.clientData.email
        },
        
        "items": quote.items,
        
        "totals": {
            "subtotal": quote.subtotal.toFixed(2),
            "discount": quote.discount,
            "discountAmount": quote.discountAmount.toFixed(2),
            "tax": quote.tax,
            "taxAmount": quote.taxAmount.toFixed(2),
            "total": quote.total.toFixed(2)
        },
        
        "notes": quote.notes,
        "createdAt": quote.createdAt
    };
    
    const dataStr = JSON.stringify(quoteJSON, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${quote.quoteNumber}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showNotification('✅ Quotation exported as JSON!');
}

function deleteInvoice(invoiceId) {
    if (confirm('Are you sure you want to delete this invoice?')) {
        invoices = invoices.filter(i => i.id !== invoiceId);
        saveToLocalStorage();
        renderInvoices();
    }
}

function createInvoiceFromAppointment(appointmentId) {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return;
    
    document.getElementById('appointmentDetailModal').style.display = 'none';
    openInvoiceModal();
    
    // Pre-fill form
    setTimeout(() => {
        document.getElementById('invoiceClient').value = appointment.clientId;
        updateInvoiceAppointmentSelect();
        document.getElementById('invoiceAppointment').value = appointmentId;
        
        // Add appointment as first item
        const itemRow = document.querySelector('.invoice-item-row');
        if (itemRow) {
            itemRow.querySelector('.item-description').value = appointment.service || 'Appointment';
            itemRow.querySelector('.item-quantity').value = 1;
            // Price needs to be set manually by user
        }
    }, 100);
}

// ==================== TIME CONFLICT CHECKING ====================

function checkTimeConflict(date, time, duration, excludeAppointmentId = null) {
    // Validate working hours (6 AM - 10 PM)
    const [hours, minutes] = time.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;
    const endTimeInMinutes = timeInMinutes + duration;
    const workStart = 6 * 60; // 6 AM
    const workEnd = 22 * 60; // 10 PM
    
    if (timeInMinutes < workStart || endTimeInMinutes > workEnd) {
        return {
            hasConflict: true,
            message: `⚠️ Outside working hours! Please book between 6:00 AM and 10:00 PM.`,
            type: 'hours'
        };
    }
    
    // Get all appointments on the same date except the one being edited
    const dayAppointments = appointments.filter(apt => 
        apt.date === date && apt.id !== excludeAppointmentId
    );
    
    if (dayAppointments.length === 0) return null;
    
    // Convert time to minutes for easier comparison
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;
    
    // Check each existing appointment for overlap
    for (const apt of dayAppointments) {
        const [aptHours, aptMinutes] = apt.time.split(':').map(Number);
        const aptStartMinutes = aptHours * 60 + aptMinutes;
        const aptEndMinutes = aptStartMinutes + apt.duration;
        
        // Check if times overlap
        // Overlap occurs if: new start < existing end AND new end > existing start
        if (startMinutes < aptEndMinutes && endMinutes > aptStartMinutes) {
            return apt; // Return the conflicting appointment
        }
    }
    
    return null; // No conflict
}

// ==================== AUTOMATIC REMINDERS ====================

function checkUpcomingAppointments() {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour ahead
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes buffer
    
    // Use local date to avoid timezone issues
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentTime = now.getHours() * 60 + now.getMinutes(); // current time in minutes
    const reminderTime = oneHourFromNow.getHours() * 60 + oneHourFromNow.getMinutes();
    const bufferTime = fiveMinutesFromNow.getHours() * 60 + fiveMinutesFromNow.getMinutes();
    
    // Get today's appointments
    const todayAppointments = appointments.filter(apt => apt.date === today);
    
    // Check each appointment
    todayAppointments.forEach(apt => {
        const [aptHours, aptMinutes] = apt.time.split(':').map(Number);
        const aptTimeInMinutes = aptHours * 60 + aptMinutes;
        
        // Check if appointment is about 1 hour away (within a 5-minute window)
        const isOneHourBefore = aptTimeInMinutes >= currentTime + 55 && aptTimeInMinutes <= currentTime + 65;
        
        if (isOneHourBefore) {
            // Check if we already sent a reminder for this appointment
            const reminderSent = localStorage.getItem(`reminder_${apt.id}_${today}`);
            
            if (!reminderSent) {
                sendAutomaticReminder(apt);
                // Mark reminder as sent
                localStorage.setItem(`reminder_${apt.id}_${today}`, 'sent');
            }
        }
    });
}

function sendAutomaticReminder(appointment) {
    const client = clients.find(c => c.id === appointment.clientId);
    if (!client || !client.phone) return;
    
    const clientName = client.name;
    const phoneNumber = client.phone.replace(/[^\d+]/g, '');
    
    // Create reminder message
    const endTime = calculateEndTime(appointment.time, appointment.duration);
    let message = `🔔 MEMENTO: Bună, ${clientName}! Programarea dumneavoastră este în 1 oră la ora ${appointment.time}`;
    if (appointment.service) {
        message += ` pentru ${appointment.service}`;
    }
    message += `. Durată: ${appointment.duration} min (${appointment.time} - ${endTime}). Vă așteptăm!`;
    
    const encodedMessage = encodeURIComponent(message);
    const smsUrl = `sms:${phoneNumber}?body=${encodedMessage}`;
    
    // Show notification with option to send
    showReminderNotification(clientName, appointment, smsUrl);
}

function showReminderNotification(clientName, appointment, smsUrl) {
    // Create a more prominent notification
    const notification = document.createElement('div');
    notification.className = 'reminder-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ff9800, #f57c00);
        color: white;
        padding: 20px 25px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        z-index: 10001;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 2rem;">⏰</span>
                <div>
                    <strong style="font-size: 1.1rem;">Memento Programare!</strong>
                    <div style="font-size: 0.9rem; opacity: 0.95;">${clientName} - ${appointment.time}</div>
                </div>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 5px;">
                <button onclick="window.location.href='${smsUrl}'; this.parentElement.parentElement.parentElement.remove();" 
                        style="flex: 1; background: white; color: #ff9800; border: none; padding: 10px; border-radius: 8px; font-weight: 700; cursor: pointer;">
                    📱 Trimite SMS Acum
                </button>
                <button onclick="this.parentElement.parentElement.parentElement.remove();" 
                        style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer;">
                    ✕
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 30 seconds if not interacted with
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentElement) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 30000);
}

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    document.getElementById('currentDateTime').textContent = now.toLocaleDateString('en-US', options);
}

function renderDashboard() {
    const now = new Date();
    // Use local date to avoid timezone issues
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes
    
    // Filter today's appointments to only show future ones (not passed)
    const todayAppts = appointments.filter(a => {
        if (a.date !== today) return false;
        
        // Parse appointment time
        const [hours, minutes] = a.time.split(':').map(Number);
        const aptTime = hours * 60 + minutes;
        
        // Only include if appointment hasn't passed yet
        return aptTime >= currentTime;
    });
    
    // Calculate appointments from last 7 days + today + future (matching the filter)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = `${sevenDaysAgo.getFullYear()}-${String(sevenDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(sevenDaysAgo.getDate()).padStart(2, '0')}`;
    
    const upcomingAppts = appointments.filter(a => {
        return a.date >= sevenDaysAgoStr;
    });
    
    // Calculate total hours only for future appointments (from today onwards)
    const futureAppointments = appointments.filter(a => {
        const aptDate = new Date(a.date + 'T00:00:00');
        const todayStart = new Date(today + 'T00:00:00');
        
        if (a.date === today) {
            // For today's appointments, check if time has passed
            const [hours, minutes] = a.time.split(':').map(Number);
            const aptTime = hours * 60 + minutes;
            return aptTime >= currentTime;
        }
        
        // For future dates, include all
        return aptDate > todayStart;
    });
    const totalHours = futureAppointments.reduce((sum, apt) => sum + (apt.duration / 60), 0);
    
    document.getElementById('totalClients').textContent = clients.length;
    document.getElementById('todayAppointments').textContent = todayAppts.length;
    document.getElementById('upcomingAppointments').textContent = upcomingAppts.length;
    document.getElementById('totalHours').textContent = Math.round(totalHours);
    
    // Update smart stats
    updateSmartStats();
    
    const todaySchedule = document.getElementById('todaySchedule');
    if (todayAppts.length === 0) {
        todaySchedule.innerHTML = '<div class="empty-schedule">No appointments remaining today</div>';
    } else {
        todaySchedule.innerHTML = todayAppts.sort((a, b) => a.time.localeCompare(b.time)).map(apt => {
            const client = clients.find(c => c.id === apt.clientId);
            const clientName = client ? client.name : 'Unknown';
            const clientPhone = client ? client.phone : '';
            return `
                <div class="schedule-item" onclick="showAppointmentDetail(${apt.id})" style="cursor: pointer;">
                    <div class="schedule-time">${apt.time}</div>
                    <div class="schedule-client">${clientName}</div>
                    ${clientPhone ? `<div class="schedule-service">📱 ${clientPhone}</div>` : ''}
                    ${apt.service ? `<div class="schedule-service">${apt.service}</div>` : ''}
                </div>
            `;
        }).join('');
    }
    
    const weekOverview = document.getElementById('weekOverview');
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const dayAppts = appointments.filter(a => a.date === dateStr);
        weekDays.push({
            date: date,
            dateStr: dateStr,
            count: dayAppts.length,
            day: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        });
    }
    weekOverview.innerHTML = weekDays.map(day => `
        <div class="schedule-item">
            <div class="schedule-time">${day.day}</div>
            <div class="schedule-client">${day.count} appointment${day.count !== 1 ? 's' : ''}</div>
        </div>
    `).join('');
    
    // Render analytics sections - NEW
    renderTopClients();
    renderBusyDays();
}

function exportData() {
    const data = {
        clients: clients,
        appointments: appointments,
        invoices: invoices,
        businessInfo: businessInfo,
        exportDate: new Date().toISOString()
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `business-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Backup created successfully!', 'success');
}

// Excel Export Function
function exportToExcel() {
    try {
        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Clients Sheet
        const clientsData = clients.map(c => ({
            'Name': c.name,
            'Email': c.email,
            'Phone': c.phone,
            'Address': c.address || 'N/A',
            'Created': new Date(c.createdAt).toLocaleDateString()
        }));
        const wsClients = XLSX.utils.json_to_sheet(clientsData);
        XLSX.utils.book_append_sheet(wb, wsClients, "Clients");
        
        // Appointments Sheet
        const appointmentsData = appointments.map(a => {
            const client = clients.find(c => c.id === a.clientId);
            return {
                'Date': formatDate(a.date),
                'Time': a.time,
                'Client': client ? client.name : 'Unknown',
                'Service': a.service || 'N/A',
                'Duration': a.duration + ' min',
                'Status': a.status,
                'Notes': a.notes || ''
            };
        });
        const wsAppointments = XLSX.utils.json_to_sheet(appointmentsData);
        XLSX.utils.book_append_sheet(wb, wsAppointments, "Appointments");
        
        // Invoices Sheet
        const invoicesData = invoices.map(inv => {
            const client = clients.find(c => c.id === inv.clientId);
            return {
                'Invoice #': inv.invoiceNumber,
                'Date': formatDate(inv.date),
                'Due Date': formatDate(inv.dueDate),
                'Client': client ? client.name : 'Unknown',
                'Subtotal': inv.subtotal || inv.total,
                'Discount': inv.discount || 0,
                'Tax': inv.tax || 0,
                'Total': inv.total,
                'Status': inv.status,
                'Payment Terms': inv.paymentTerms || 'N/A'
            };
        });
        const wsInvoices = XLSX.utils.json_to_sheet(invoicesData);
        XLSX.utils.book_append_sheet(wb, wsInvoices, "Invoices");
        
        // Revenue Summary Sheet
        const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
        const pendingRevenue = invoices.filter(i => i.status === 'unpaid').reduce((sum, i) => sum + i.total, 0);
        const summaryData = [
            { 'Metric': 'Total Clients', 'Value': clients.length },
            { 'Metric': 'Total Appointments', 'Value': appointments.length },
            { 'Metric': 'Total Invoices', 'Value': invoices.length },
            { 'Metric': 'Paid Revenue', 'Value': '$' + totalRevenue.toFixed(2) },
            { 'Metric': 'Pending Revenue', 'Value': '$' + pendingRevenue.toFixed(2) },
            { 'Metric': 'Total Revenue', 'Value': '$' + (totalRevenue + pendingRevenue).toFixed(2) }
        ];
        const wsSummary = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
        
        // Export
        XLSX.writeFile(wb, `business-report-${new Date().toISOString().split('T')[0]}.xlsx`);
        showToast('Excel report exported successfully!', 'success');
    } catch (error) {
        console.error('Excel export error:', error);
        showToast('Error exporting to Excel', 'error');
    }
}

// PDF Export Function
function exportToPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Title
        doc.setFontSize(20);
        doc.setTextColor(102, 126, 234);
        doc.text('Raport Business', 14, 22);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(new Date().toLocaleDateString('ro-RO'), 14, 30);
        
        let yPos = 45;
        
        // Summary
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text('Sumar', 14, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        doc.text(`Total Clienți: ${clients.length}`, 20, yPos);
        yPos += 6;
        doc.text(`Total Programări: ${appointments.length}`, 20, yPos);
        yPos += 6;
        doc.text(`Total Facturi: ${invoices.length}`, 20, yPos);
        yPos += 6;
        
        const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
        doc.text(`Venit Total: ${totalRevenue.toFixed(2)} Lei`, 20, yPos);
        yPos += 15;
        
        // Clients Table
        if (clients.length > 0) {
            doc.setFontSize(14);
            doc.text('Clienți', 14, yPos);
            yPos += 5;
            
            const clientsTableData = clients.slice(0, 10).map(c => [
                c.name,
                c.email,
                c.phone
            ]);
            
            doc.autoTable({
                startY: yPos,
                head: [['Nume', 'Email', 'Telefon']],
                body: clientsTableData,
                theme: 'grid',
                headStyles: { fillColor: [102, 126, 234] }
            });
            
            yPos = doc.lastAutoTable.finalY + 15;
        }
        
        // Appointments Table
        if (appointments.length > 0 && yPos < 250) {
            doc.setFontSize(14);
            doc.text('Programări Recente', 14, yPos);
            yPos += 5;
            
            const appointmentsTableData = appointments.slice(0, 5).map(a => {
                const client = clients.find(c => c.id === a.clientId);
                return [
                    formatDate(a.date),
                    a.time,
                    client ? client.name : 'Necunoscut',
                    a.status
                ];
            });
            
            doc.autoTable({
                startY: yPos,
                head: [['Data', 'Ora', 'Client', 'Status']],
                body: appointmentsTableData,
                theme: 'grid',
                headStyles: { fillColor: [102, 126, 234] }
            });
        }
        
        // New page for invoices if needed
        if (invoices.length > 0) {
            doc.addPage();
            yPos = 20;
            
            doc.setFontSize(14);
            doc.text('Facturi', 14, yPos);
            yPos += 5;
            
            const invoicesTableData = invoices.slice(0, 10).map(inv => {
                const client = clients.find(c => c.id === inv.clientId);
                return [
                    inv.invoiceNumber,
                    client ? client.name : 'Necunoscut',
                    formatDate(inv.date),
                    inv.total.toFixed(2) + ' Lei',
                    inv.status
                ];
            });
            
            doc.autoTable({
                startY: yPos,
                head: [['Factură #', 'Client', 'Data', 'Total', 'Status']],
                body: invoicesTableData,
                theme: 'grid',
                headStyles: { fillColor: [102, 126, 234] }
            });
        }
        
        // Save
        doc.save(`business-report-${new Date().toISOString().split('T')[0]}.pdf`);
        showToast('PDF report exported successfully!', 'success');
    } catch (error) {
        console.error('PDF export error:', error);
        showToast('Error exporting to PDF', 'error');
    }
}

// Toast Notification Function
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `message-toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showAppointmentDetail(appointmentId) {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return;
    
    const client = clients.find(c => c.id === appointment.clientId);
    const clientName = client ? client.name : 'Unknown Client';
    const clientPhone = client ? client.phone : 'N/A';
    const clientEmail = client ? client.email : 'N/A';
    
    const modal = document.getElementById('appointmentDetailModal');
    const content = document.getElementById('appointmentDetailContent');
    
    const endTime = calculateEndTime(appointment.time, appointment.duration);
    const dateFormatted = formatDate(appointment.date);
    
    content.innerHTML = `
        <div class="detail-section">
            <h3>📋 Informații Client</h3>
            <div class="detail-row">
                <div class="detail-label">Nume:</div>
                <div class="detail-value">${clientName}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Telefon:</div>
                <div class="detail-value detail-phone">📱 ${clientPhone}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Email:</div>
                <div class="detail-value">${clientEmail}</div>
            </div>
            <a href="tel:${clientPhone}" class="call-button">📞 Apelează ${clientPhone}</a>
            <button onclick="sendSmsConfirmation(${appointmentId})" class="call-button" style="background: #2196F3; margin-left: 10px;">📱 Trimite SMS</button>
        </div>
        
        <div class="detail-section">
            <h3>📅 Detalii Programare</h3>
            <div class="detail-row">
                <div class="detail-label">Data:</div>
                <div class="detail-value">${dateFormatted}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Ora:</div>
                <div class="detail-value">⏰ ${appointment.time} - ${endTime}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Durată:</div>
                <div class="detail-value">${appointment.duration} minute</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Status:</div>
                <div class="detail-value"><span class="status-badge status-${appointment.status || 'scheduled'}">${(appointment.status || 'scheduled').toUpperCase()}</span></div>
            </div>
            ${appointment.service ? `
            <div class="detail-row">
                <div class="detail-label">Serviciu:</div>
                <div class="detail-value">🔧 ${appointment.service}</div>
            </div>
            ` : ''}
            ${appointment.notes ? `
            <div class="detail-row">
                <div class="detail-label">Notițe:</div>
                <div class="detail-value">📝 ${appointment.notes}</div>
            </div>
            ` : ''}
        </div>
    `;
    
    document.getElementById('editFromDetailBtn').dataset.appointmentId = appointmentId;
    modal.style.display = 'block';
    
    // Hide FAB buttons when modal opens on mobile
    const fabContainer = document.querySelector('.fab-container');
    if (fabContainer) fabContainer.classList.add('hidden');
}

function initializeViewControls() {
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendarView();
    });
    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendarView();
    });
    document.getElementById('orthodoxToggle').addEventListener('change', (e) => {
        showOrthodoxCalendar = e.target.checked;
        renderCalendarView();
    });
}

function openClientModal(clientId = null) {
    editingClientId = clientId;
    const modal = document.getElementById('clientModal');
    const title = document.getElementById('clientModalTitle');
    
    // Reset tag checkboxes
    document.querySelectorAll('.client-tag-checkbox').forEach(cb => cb.checked = false);
    
    if (clientId) {
        const client = clients.find(c => c.id === clientId);
        if (client) {
            title.textContent = 'Edit Client';
            document.getElementById('clientName').value = client.name;
            document.getElementById('clientEmail').value = client.email || '';
            document.getElementById('clientPhone').value = client.phone;
            document.getElementById('clientCUI').value = client.cui || '';
            document.getElementById('clientRegCom').value = client.regCom || '';
            document.getElementById('clientAddress').value = client.address || '';
            document.getElementById('clientCity').value = client.city || '';
            document.getElementById('clientCounty').value = client.county || '';
            document.getElementById('clientPostalCode').value = client.postalCode || '';
            document.getElementById('clientIBAN').value = client.iban || '';
            document.getElementById('clientBank').value = client.bank || '';
            document.getElementById('clientTelegram').value = client.telegram || '';
            document.getElementById('clientNotes').value = client.notes || '';
            
            // Set tags
            if (client.tags && Array.isArray(client.tags)) {
                client.tags.forEach(tag => {
                    const checkbox = document.querySelector(`.client-tag-checkbox[value="${tag}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
        }
    } else {
        title.textContent = 'Add Client';
    }
    modal.style.display = 'block';
    
    // Hide FAB buttons when modal opens
    const fabContainer = document.querySelector('.fab-container');
    if (fabContainer) fabContainer.classList.add('hidden');
}

function saveClient(e) {
    e.preventDefault();
    
    const name = document.getElementById('clientName').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    const email = document.getElementById('clientEmail').value.trim();
    const cui = document.getElementById('clientCUI').value.trim();
    const regCom = document.getElementById('clientRegCom').value.trim();
    const address = document.getElementById('clientAddress').value.trim();
    const city = document.getElementById('clientCity').value.trim();
    const county = document.getElementById('clientCounty').value.trim();
    const postalCode = document.getElementById('clientPostalCode').value.trim();
    const iban = document.getElementById('clientIBAN').value.trim();
    const bank = document.getElementById('clientBank').value.trim();
    const telegram = document.getElementById('clientTelegram').value.trim();
    const notes = document.getElementById('clientNotes').value.trim();
    
    // Get selected tags
    const selectedTags = Array.from(document.querySelectorAll('.client-tag-checkbox:checked'))
        .map(cb => cb.value);
    
    // Validation
    if (!name) {
        alert('⚠️ Please enter client name');
        document.getElementById('clientName').focus();
        return;
    }
    
    if (!phone) {
        alert('⚠️ Please enter phone number');
        document.getElementById('clientPhone').focus();
        return;
    }
    
    // Check for duplicate clients (similar names)
    if (!editingClientId) {
        const similarClients = clients.filter(c => {
            const similarity = calculateNameSimilarity(name.toLowerCase(), c.name.toLowerCase());
            return similarity > 0.7; // 70% similarity threshold
        });
        
        if (similarClients.length > 0) {
            const duplicateNames = similarClients.map(c => c.name).join(', ');
            const confirmAdd = confirm(`⚠️ ATENȚIE: Există client(i) cu nume similar:\n\n${duplicateNames}\n\nSigur vrei să adaugi un client nou?`);
            if (!confirmAdd) {
                return;
            }
        }
    }
    
    // Basic phone validation (at least 10 digits)
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
        alert('⚠️ Please enter a valid phone number (at least 10 digits)');
        document.getElementById('clientPhone').focus();
        return;
    }
    
    // Email validation if provided
    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        alert('⚠️ Please enter a valid email address or leave it empty');
        document.getElementById('clientEmail').focus();
        return;
    }
    
    const clientData = {
        id: editingClientId || Date.now(),
        name,
        email,
        phone,
        cui,
        regCom,
        address,
        city,
        county,
        postalCode,
        iban,
        bank,
        telegram,
        notes,
        tags: selectedTags, // Save tags
        createdAt: editingClientId ? clients.find(c => c.id === editingClientId).createdAt : new Date().toISOString()
    };
    if (editingClientId) {
        const index = clients.findIndex(c => c.id === editingClientId);
        clients[index] = clientData;
        showNotification('✅ Client updated successfully!');
    } else {
        clients.push(clientData);
        showNotification('✅ Client added successfully!');
    }
    saveToLocalStorage();
    document.getElementById('clientModal').style.display = 'none';
    resetForms();
    renderClients();
    renderDashboard();
    renderCalendar();
    
    // Check if we need to return to appointment modal
    if (window.returnToAppointmentModal && !editingClientId) {
        window.returnToAppointmentModal = false;
        // Reopen appointment modal
        openAppointmentModal();
        // Update and select the new client
        updateAppointmentClientSelect();
        document.getElementById('appointmentClient').value = clientData.id;
        showToast('✅ Client adăugat! Continuă programarea.', 'success');
    }
    
    // Check if we need to return to invoice modal
    if (window.returnToInvoiceModal && !editingClientId) {
        window.returnToInvoiceModal = false;
        // Reopen invoice modal
        openInvoiceModal();
        // Update and select the new client
        updateInvoiceClientSelect();
        document.getElementById('invoiceClient').value = clientData.id;
        fillClientDataInInvoice();
        showToast('✅ Client adăugat! Continuă factura.', 'success');
    }
}

function deleteClient(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    
    if (confirm('Sigur vrei să ștergi acest client și toate programările asociate?')) {
        // Store for undo
        storeDeletedItem('client', client);
        
        clients = clients.filter(c => c.id !== clientId);
        appointments = appointments.filter(a => a.clientId !== clientId);
        saveToLocalStorage();
        renderClients();
        renderAppointments();
        renderDashboard();
        renderCalendar();
    }
}

function renderClients() {
    const searchTerm = document.getElementById('clientSearch').value.toLowerCase();
    const filteredClients = clients.filter(client => 
        client.name.toLowerCase().includes(searchTerm) ||
        client.email.toLowerCase().includes(searchTerm) ||
        client.phone.includes(searchTerm)
    );
    const clientsList = document.getElementById('clientsList');
    if (filteredClients.length === 0) {
        clientsList.innerHTML = '<div class="empty-state"><h3>No clients found</h3><p>Add your first client to get started</p></div>';
        return;
    }
    clientsList.innerHTML = filteredClients.map(client => {
        const tagIcons = {
            'VIP': '⭐',
            'Recurent': '🔄',
            'Nou': '✨'
        };
        const tagColors = {
            'VIP': '#f59e0b',
            'Recurent': '#10b981',
            'Nou': '#3b82f6'
        };
        const tagsHtml = client.tags && client.tags.length > 0 
            ? client.tags.map(tag => `<span style="display: inline-block; padding: 2px 8px; background: ${tagColors[tag]}; color: white; border-radius: 4px; font-size: 0.85rem; font-weight: 600; margin-right: 4px;">${tagIcons[tag]} ${tag}</span>`).join('')
            : '';
        
        return `
        <div class="client-card" data-client-id="${client.id}">
            <div class="client-info">
                <div class="client-name">${client.name} ${tagsHtml}</div>
                <div class="client-details">
                    ${client.email ? `📧 ${client.email}<br>` : ''}
                    📱 ${client.phone}
                    ${client.telegram ? `<br>📱 Telegram: ${client.telegram}` : ''}
                    ${client.notes ? `<br>📝 <i>${client.notes}</i>` : ''}
                </div>
            </div>
            <div class="client-actions">
                ${client.telegram ? `<button class="btn btn-success" onclick="sendClientTestMessage(${client.id})" title="Trimite mesaj test">📨 Mesaj</button>` : ''}
                <button class="btn btn-edit" onclick="openClientModal(${client.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteClient(${client.id})">Delete</button>
            </div>
        </div>
    `}).join('');
}

function openAppointmentModal(appointmentId = null) {
    editingAppointmentId = appointmentId;
    const modal = document.getElementById('appointmentModal');
    const title = document.getElementById('appointmentModalTitle');
    updateAppointmentClientSelect();
    if (appointmentId) {
        const appointment = appointments.find(a => a.id === appointmentId);
        if (appointment) {
            title.textContent = 'Edit Appointment';
            document.getElementById('appointmentClient').value = appointment.clientId;
            document.getElementById('appointmentDate').value = appointment.date;
            document.getElementById('appointmentTime').value = appointment.time;
            document.getElementById('appointmentDuration').value = appointment.duration;
            document.getElementById('appointmentService').value = appointment.service || '';
            document.getElementById('appointmentStatus').value = appointment.status || 'scheduled';
            document.getElementById('appointmentNotes').value = appointment.notes || '';
            document.getElementById('appointmentReminder').value = appointment.reminderDays || '1';
        }
    } else {
        title.textContent = 'Schedule Appointment';
        // Use local date to avoid timezone issues
        const todayDate = new Date();
        const today = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
        document.getElementById('appointmentDate').value = today;
        document.getElementById('appointmentStatus').value = 'scheduled';
        document.getElementById('appointmentReminder').value = '1';
    }
    
    // Add real-time conflict checking
    const dateInput = document.getElementById('appointmentDate');
    const timeInput = document.getElementById('appointmentTime');
    const durationInput = document.getElementById('appointmentDuration');
    
    const checkConflict = () => {
        const date = dateInput.value;
        const time = timeInput.value;
        const duration = parseInt(durationInput.value);
        
        if (date && time) {
            const conflict = checkTimeConflict(date, time, duration, editingAppointmentId);
            const warning = document.getElementById('timeConflictWarning');
            
            if (conflict) {
                warning.style.display = 'block';
                timeInput.style.borderColor = '#f44336';
            } else {
                warning.style.display = 'none';
                timeInput.style.borderColor = '#e0e0e0';
            }
            
            // Show existing appointments on this day
            showExistingAppointments(date);
        }
    };
    
    dateInput.addEventListener('change', checkConflict);
    timeInput.addEventListener('change', checkConflict);
    durationInput.addEventListener('change', checkConflict);
    
    // Initial check if editing
    if (appointmentId) {
        setTimeout(checkConflict, 100);
    }
    
    modal.style.display = 'block';
    
    // Hide FAB buttons when modal opens on mobile
    const fabContainer = document.querySelector('.fab-container');
    if (fabContainer) fabContainer.classList.add('hidden');
}

function showExistingAppointments(date) {
    const dayAppointments = appointments.filter(apt => 
        apt.date === date && apt.id !== editingAppointmentId
    );
    
    const info = document.getElementById('existingAppointmentsInfo');
    const list = document.getElementById('existingAppointmentsList');
    
    if (dayAppointments.length > 0) {
        dayAppointments.sort((a, b) => a.time.localeCompare(b.time));
        list.innerHTML = dayAppointments.map(apt => {
            const client = clients.find(c => c.id === apt.clientId);
            const clientName = client ? client.name : 'Unknown';
            const endTime = calculateEndTime(apt.time, apt.duration);
            return `• ${apt.time} - ${endTime}: <strong>${clientName}</strong> (${apt.duration} min)`;
        }).join('<br>');
        info.style.display = 'block';
    } else {
        info.style.display = 'none';
    }
}

function updateAppointmentClientSelect() {
    const select = document.getElementById('appointmentClient');
    select.innerHTML = '<option value="">Select a client</option>' +
        clients.map(client => `<option value="${client.id}">${client.name}</option>`).join('');
}

function saveAppointment(e) {
    e.preventDefault();
    
    const clientId = parseInt(document.getElementById('appointmentClient').value);
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    const duration = parseInt(document.getElementById('appointmentDuration').value);
    
    // Validation
    if (!clientId) {
        alert('⚠️ Please select a client');
        document.getElementById('appointmentClient').focus();
        return;
    }
    
    if (!date) {
        alert('⚠️ Please select a date');
        document.getElementById('appointmentDate').focus();
        return;
    }
    
    if (!time) {
        alert('⚠️ Please select a time');
        document.getElementById('appointmentTime').focus();
        return;
    }
    
    // Check for time conflicts (double-booking prevention)
    const conflict = checkTimeConflict(date, time, duration, editingAppointmentId);
    if (conflict && conflict.hasConflict) {
        if (conflict.type === 'hours') {
            alert(conflict.message);
        } else {
            const client = clients.find(c => c.id === conflict.conflictingAppointment.clientId);
            const conflictName = client ? client.name : 'Un alt client';
            alert(`⚠️ CONFLICT DE PROGRAMARE!\n\n${conflictName} are deja o programare la ora ${conflict.conflictingAppointment.time} în data de ${formatDate(date)}.\n\nVă rugăm să alegeți o altă oră.`);
        }
        return;
    }
    
    const appointmentData = {
        id: editingAppointmentId || Date.now(),
        clientId,
        date,
        time,
        duration,
        service: document.getElementById('appointmentService').value.trim(),
        status: document.getElementById('appointmentStatus').value,
        notes: document.getElementById('appointmentNotes').value.trim(),
        reminderDays: document.getElementById('appointmentReminder').value,
        createdAt: editingAppointmentId ? 
            appointments.find(a => a.id === editingAppointmentId).createdAt : 
            new Date().toISOString()
    };
    
    if (editingAppointmentId) {
        const index = appointments.findIndex(a => a.id === editingAppointmentId);
        appointments[index] = appointmentData;
        showNotification('✅ Programarea a fost actualizată cu succes!');
    } else {
        appointments.push(appointmentData);
        showNotification('✅ Programarea a fost creată cu succes!');
    }
    saveToLocalStorage();
    document.getElementById('appointmentModal').style.display = 'none';
    
    // Check if SMS confirmation should be sent
    const sendSms = document.getElementById('sendSmsConfirmation').checked;
    if (sendSms) {
        // Send SMS after a short delay to allow modal to close
        setTimeout(() => {
            sendSmsConfirmation(appointmentData.id);
        }, 500);
    }
    
    resetForms();
    renderAppointments();
    renderDashboard();
    renderCalendar();
}

function deleteAppointment(appointmentId) {
    if (confirm('Sigur doriți să ștergeți această programare?')) {
        appointments = appointments.filter(a => a.id !== appointmentId);
        saveToLocalStorage();
        renderAppointments();
        renderDashboard();
        renderCalendar();
    }
}

function updateViewToggle() {
    document.getElementById('monthViewBtn').classList.toggle('active', viewMode === 'month');
    document.getElementById('weekViewBtn').classList.toggle('active', viewMode === 'week');
    document.getElementById('dayViewBtn').classList.toggle('active', viewMode === 'day');
    renderCalendarView();
}

function renderCalendarView() {
    document.getElementById('calendar').style.display = 'none';
    document.getElementById('weekView').style.display = 'none';
    document.getElementById('dayView').style.display = 'none';
    
    if (viewMode === 'month') {
        document.getElementById('calendar').style.display = 'grid';
        renderMonthCalendar();
    } else if (viewMode === 'week') {
        document.getElementById('weekView').style.display = 'block';
        renderWeekView();
    } else {
        document.getElementById('dayView').style.display = 'block';
        renderDayView();
    }
}

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    // Adjust so Monday is start of week (0=Sunday, 1=Monday)
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function renderWeekView() {
    // Start week from current date (today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(weekStartDate);
    weekStart.setHours(0, 0, 0, 0);
    // Use local date string for comparison
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const weekDays = [];
    // Show 7 days starting from weekStartDate
    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        weekDays.push(date);
    }
    
    const weekStartStr = weekDays[0].toLocaleDateString('ro-RO', { month: 'short', day: 'numeric' });
    const weekEndStr = weekDays[6].toLocaleDateString('ro-RO', { month: 'short', day: 'numeric', year: 'numeric' });
    document.getElementById('currentPeriod').textContent = `${weekStartStr} - ${weekEndStr}`;
    
    const weekView = document.getElementById('weekView');
    let html = '<div class="week-grid">';
    
    html += '<div class="week-header">Ora</div>';
    weekDays.forEach(date => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const isToday = dateStr === todayStr;
        const todayStyle = isToday ? 'background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; font-weight: 800; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); transform: scale(1.05); border: 3px solid #1e40af;' : '';
        html += `<div class="week-header ${isToday ? 'today-header' : ''}" style="${todayStyle}">${date.toLocaleDateString('ro-RO', { weekday: 'short', month: 'short', day: 'numeric' })}</div>`;
    });
    
    // Create 15-minute intervals from 6:00 to 22:00
    for (let hour = 6; hour <= 22; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            // Skip 22:15, 22:30, 22:45 to end at 22:00
            if (hour === 22 && minute > 0) break;
            
            const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            const currentTimeInMinutes = hour * 60 + minute;
            html += `<div class="week-time-label">${timeStr}</div>`;
            
            weekDays.forEach(date => {
                const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                const isToday = dateStr === todayStr;
                
                // Find appointments that start at this time
                const timeAppts = appointments.filter(apt => {
                    return apt.date === dateStr && apt.time === timeStr;
                });
                
                // Find appointments that occupy this time slot
                const occupyingAppt = appointments.find(apt => {
                    if (apt.date !== dateStr) return false;
                    const [aptHour, aptMinute] = apt.time.split(':').map(Number);
                    const aptStartMinutes = aptHour * 60 + aptMinute;
                    const aptEndMinutes = aptStartMinutes + apt.duration;
                    return currentTimeInMinutes >= aptStartMinutes && currentTimeInMinutes < aptEndMinutes;
                });
                
                const todayClass = isToday ? 'today-column' : '';
                const cellClass = occupyingAppt ? `week-time-cell occupied ${todayClass}` : `week-time-cell ${todayClass}`;
                html += `<div class="${cellClass}" data-date="${dateStr}" data-time="${timeStr}" data-minutes="${currentTimeInMinutes}">`;
                
                // Show appointment info in all occupied slots
                if (occupyingAppt) {
                    const client = clients.find(c => c.id === occupyingAppt.clientId);
                    const clientName = client ? client.name : 'Unknown';
                    const isStartSlot = occupyingAppt.time === timeStr;
                    const serviceColor = getServiceColor(occupyingAppt.service);
                    html += `<div class="week-appointment ${isStartSlot ? 'start-slot' : ''}" style="background: linear-gradient(135deg, ${serviceColor.from} 0%, ${serviceColor.to} 100%);" onclick="event.stopPropagation(); showAppointmentDetail(${occupyingAppt.id})" title="${clientName} - ${occupyingAppt.time} (${occupyingAppt.duration} min)${occupyingAppt.service ? ' - ' + occupyingAppt.service : ''}">`;
                    if (isStartSlot) {
                        html += `${occupyingAppt.time.substring(0, 5)} ${clientName}`;
                    } else {
                        html += `${clientName}`;
                    }
                    html += `</div>`;
                }
                
                html += '</div>';
            });
        }
    }
    
    html += '</div>';
    weekView.innerHTML = html;
    
    // Initialize drag selection
    initializeDragSelection();
}

let isDragging = false;
let dragStartDate = null;
let dragStartTime = null;
let dragStartMinutes = null;
let mouseUpHandler = null;

function initializeDragSelection() {
    // Remove old mouseup listener if it exists
    if (mouseUpHandler) {
        document.removeEventListener('mouseup', mouseUpHandler);
    }
    
    const cells = document.querySelectorAll('.week-time-cell:not(.occupied)');
    
    cells.forEach(cell => {
        // Remove old listeners by cloning (clean approach)
        const newCell = cell.cloneNode(true);
        cell.parentNode.replaceChild(newCell, cell);
    });
    
    // Re-query cells after cloning
    const freshCells = document.querySelectorAll('.week-time-cell:not(.occupied)');
    
    freshCells.forEach(cell => {
        cell.addEventListener('mousedown', (e) => {
            if (cell.classList.contains('occupied')) return;
            e.preventDefault();
            isDragging = true;
            dragStartDate = cell.dataset.date;
            dragStartTime = cell.dataset.time;
            dragStartMinutes = parseInt(cell.dataset.minutes);
            cell.classList.add('drag-selecting');
        });
        
        cell.addEventListener('mouseenter', (e) => {
            if (!isDragging) return;
            if (cell.dataset.date !== dragStartDate) return;
            if (cell.classList.contains('occupied')) return;
            
            // Clear previous selection
            document.querySelectorAll('.drag-selecting').forEach(c => c.classList.remove('drag-selecting'));
            
            // Select range
            const currentMinutes = parseInt(cell.dataset.minutes);
            const startMin = Math.min(dragStartMinutes, currentMinutes);
            const endMin = Math.max(dragStartMinutes, currentMinutes);
            
            freshCells.forEach(c => {
                if (c.dataset.date === dragStartDate) {
                    const cellMinutes = parseInt(c.dataset.minutes);
                    if (cellMinutes >= startMin && cellMinutes <= endMin && !c.classList.contains('occupied')) {
                        c.classList.add('drag-selecting');
                    }
                }
            });
        });
    });
    
    // Create and store the mouseup handler
    mouseUpHandler = (e) => {
        if (!isDragging) return;
        isDragging = false;
        
        const selectedCells = document.querySelectorAll('.drag-selecting');
        if (selectedCells.length > 0) {
            const firstCell = selectedCells[0];
            const lastCell = selectedCells[selectedCells.length - 1];
            
            const startTime = firstCell.dataset.time;
            const endMinutes = parseInt(lastCell.dataset.minutes) + 15;
            const startMinutes = parseInt(firstCell.dataset.minutes);
            const duration = endMinutes - startMinutes;
            
            // Clear selection
            selectedCells.forEach(c => c.classList.remove('drag-selecting'));
            
            // Open appointment modal with pre-filled data
            openAppointmentModalWithTime(dragStartDate, startTime, duration);
        }
        
        // Clear selection styling on mouseup outside
        document.querySelectorAll('.drag-selecting').forEach(c => c.classList.remove('drag-selecting'));
        
        dragStartDate = null;
        dragStartTime = null;
        dragStartMinutes = null;
    };
    
    document.addEventListener('mouseup', mouseUpHandler);
}

function openAppointmentModalWithTime(date, time, duration) {
    editingAppointmentId = null;
    document.getElementById('appointmentModalTitle').textContent = 'Programare Nouă';
    document.getElementById('appointmentDate').value = date;
    document.getElementById('appointmentTime').value = time;
    document.getElementById('appointmentDuration').value = duration;
    document.getElementById('appointmentClient').value = '';
    document.getElementById('appointmentService').value = '';
    document.getElementById('appointmentNotes').value = '';
    document.getElementById('appointmentModal').style.display = 'block';
    
    // Hide FAB buttons when modal opens on mobile
    const fabContainer = document.querySelector('.fab-container');
    if (fabContainer) fabContainer.classList.add('hidden');
}

function renderAppointments() {
    const filter = document.getElementById('appointmentFilter').value;
    const today = new Date();
    // Use local date to avoid timezone issues
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Calculate 7 days ago
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const sevenDaysAgoStr = `${sevenDaysAgo.getFullYear()}-${String(sevenDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(sevenDaysAgo.getDate()).padStart(2, '0')}`;
    
    let filteredAppointments = appointments;
    if (filter === 'upcoming') {
        // Show appointments from last 7 days + today + future
        filteredAppointments = appointments.filter(a => a.date >= sevenDaysAgoStr);
    } else if (filter === 'today') {
        filteredAppointments = appointments.filter(a => a.date === todayStr);
    } else if (filter === 'past') {
        filteredAppointments = appointments.filter(a => a.date < sevenDaysAgoStr);
    }
    filteredAppointments.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        return dateCompare !== 0 ? dateCompare : a.time.localeCompare(b.time);
    });
    const appointmentsList = document.getElementById('appointmentsList');
    if (filteredAppointments.length === 0) {
        appointmentsList.innerHTML = '<div class="empty-state"><h3>No appointments found</h3><p>Schedule your first appointment to get started</p></div>';
        return;
    }
    appointmentsList.innerHTML = filteredAppointments.map(appointment => {
        const client = clients.find(c => c.id === appointment.clientId);
        const clientName = client ? client.name : 'Unknown Client';
        const status = getAppointmentStatus(appointment.date);
        return `
            <div class="appointment-card">
                <div class="appointment-info">
                    <div class="appointment-title">${clientName}</div>
                    <div class="appointment-details">
                        📅 ${formatDate(appointment.date)} | ⏰ ${appointment.time} (${appointment.duration} min)
                        ${appointment.service ? `<br>🔧 ${appointment.service}` : ''}
                        ${appointment.notes ? `<br>📝 ${appointment.notes}` : ''}
                        <br><span class="status-badge status-${status}">${status.toUpperCase()}</span>
                    </div>
                </div>
                <div class="appointment-actions">
                    <button class="btn btn-edit" onclick="openAppointmentModal(${appointment.id})">✏️ Editează</button>
                    <button class="btn btn-danger" onclick="deleteAppointment(${appointment.id})">🗑️ Șterge</button>
                </div>
            </div>
        `;
    }).join('');
}

function getAppointmentStatus(date) {
    // Use local date to avoid timezone issues
    const todayDate = new Date();
    const today = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
    if (date === today) return 'today';
    if (date > today) return 'upcoming';
    return 'past';
}

function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

function renderMonthCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    document.getElementById('currentPeriod').textContent = 
        currentDate.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' });
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    let firstDayOfWeek = firstDay.getDay();
    // Convert Sunday (0) to 7, so Monday becomes 1
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    const lastDateOfMonth = lastDay.getDate();
    const prevLastDate = prevLastDay.getDate();
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    // Days in Romanian: All 7 days of the week
    const days = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică'];
    days.forEach(day => {
        calendar.innerHTML += `<div class="calendar-day-header">${day}</div>`;
    });
    // Add previous month days
    for (let i = firstDayOfWeek; i > 0; i--) {
        const dayNum = prevLastDate - i + 1;
        calendar.innerHTML += `<div class="calendar-day other-month"><div class="calendar-day-number">${dayNum}</div></div>`;
    }
    // Use local date to avoid timezone issues
    const todayDate = new Date();
    const today = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
    const lentPeriod = getGreatLentPeriod(year);
    let currentWeekDay = firstDayOfWeek;
    for (let day = 1; day <= lastDateOfMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const currentDateObj = new Date(dateStr + 'T00:00:00');
        const dayOfWeek = currentDateObj.getDay();
        const isToday = dateStr === today;
        const dayAppointments = appointments.filter(a => a.date === dateStr);
        const holiday = getOrthodoxHoliday(dateStr);
        const saint = getSaintDay(dateStr);
        const isFastingDay = isWednesdayOrFriday(currentDateObj);
        const isLent = currentDateObj >= lentPeriod.start && currentDateObj < lentPeriod.end;
        let orthodoxMarkers = '';
        if (showOrthodoxCalendar) {
            if (holiday) {
                const holidayClass = holiday.type === 'major' ? 'major-feast' : 'feast-day';
                orthodoxMarkers += `<div class="orthodox-marker ${holidayClass}" title="${holiday.name}">✝</div>`;
            } else if (saint) {
                orthodoxMarkers += `<div class="orthodox-marker saint-day" title="${saint}">☦</div>`;
            }
            if (isLent) {
                orthodoxMarkers += `<div class="orthodox-marker lent-marker" title="Great Lent">†</div>`;
            } else if (isFastingDay && !holiday) {
                orthodoxMarkers += `<div class="orthodox-marker fast-day" title="Fasting Day">✢</div>`;
            }
        }
        let appointmentsHtml = '';
        if (dayAppointments.length > 0) {
            appointmentsHtml = dayAppointments.slice(0, 2).map(apt => {
                const client = clients.find(c => c.id === apt.clientId);
                const clientName = client ? client.name : 'Unknown';
                return `<div class="calendar-appointment" onclick="event.stopPropagation(); showAppointmentDetail(${apt.id})">${apt.time} ${clientName}</div>`;
            }).join('');
            if (dayAppointments.length > 2) {
                appointmentsHtml += `<div class="calendar-appointment">+${dayAppointments.length - 2} more</div>`;
            }
        }
        const dayClasses = [
            'calendar-day',
            isToday ? 'today' : '',
            holiday && holiday.type === 'major' ? 'orthodox-feast' : '',
            isLent ? 'orthodox-lent' : '',
            isFastingDay && !holiday && !isLent ? 'orthodox-fast' : ''
        ].filter(c => c).join(' ');
        calendar.innerHTML += `
            <div class="${dayClasses}" onclick="viewDaySchedule('${dateStr}')">
                <div class="calendar-day-number">${day}${orthodoxMarkers}</div>
                ${appointmentsHtml}
            </div>
        `;
    }
    const remainingDays = 42 - (firstDayOfWeek + lastDateOfMonth);
    for (let day = 1; day <= remainingDays; day++) {
        calendar.innerHTML += `<div class="calendar-day other-month"><div class="calendar-day-number">${day}</div></div>`;
    }
}

function renderDayView() {
    // Use local date to avoid timezone issues
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    const dayAppointments = appointments.filter(a => a.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
    document.getElementById('currentPeriod').textContent = 
        selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const holiday = getOrthodoxHoliday(dateStr);
    const saint = getSaintDay(dateStr);
    const isFastingDay = isWednesdayOrFriday(selectedDate);
    const julianDate = getJulianDate(selectedDate);
    const year = selectedDate.getFullYear();
    const lentPeriod = getGreatLentPeriod(year);
    const isLent = selectedDate >= lentPeriod.start && selectedDate < lentPeriod.end;
    let orthodoxInfo = '';
    if (showOrthodoxCalendar) {
        orthodoxInfo = '<div class="orthodox-day-info">';
        orthodoxInfo += `<div class="orthodox-julian">📅 Julian: ${julianDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>`;
        if (holiday) {
            const icon = holiday.type === 'major' ? '✝️' : '☦️';
            orthodoxInfo += `<div class="orthodox-holiday ${holiday.type}">${icon} ${holiday.name}</div>`;
        } else if (saint) {
            orthodoxInfo += `<div class="orthodox-saint">☦️ ${saint}</div>`;
        }
        if (isLent) {
            orthodoxInfo += `<div class="orthodox-fasting lent">† Great Lent - Strict Fasting</div>`;
        } else if (isFastingDay) {
            orthodoxInfo += `<div class="orthodox-fasting">✢ Zi de Post (Miercuri/Vineri)</div>`;
        } else if (holiday && holiday.fasting) {
            orthodoxInfo += `<div class="orthodox-fasting">✢ Fasting Day</div>`;
        }
        orthodoxInfo += '</div>';
    }
    const dayView = document.getElementById('dayView');
    let html = `
        <div class="day-view-header">
            <div>
                <div class="day-view-date">${selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
                ${orthodoxInfo}
            </div>
            <div class="day-view-summary">${dayAppointments.length} appointment${dayAppointments.length !== 1 ? 's' : ''}</div>
        </div>
        <div class="time-slots">
    `;
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const isToday = dateStr === now.toISOString().split('T')[0];
    
    // Working hours: 6 AM to 10 PM (22:00)
    const startHour = 6;
    const endHour = 22;
    
    for (let hour = startHour; hour <= endHour; hour++) {
        const hourStr = String(hour).padStart(2, '0');
        const timeLabel = formatHour(hour);
        const isCurrentHour = isToday && hour === currentHour;
        const hourAppointments = dayAppointments.filter(apt => {
            const aptHour = parseInt(apt.time.split(':')[0]);
            return aptHour === hour;
        });
        html += `
            <div class="time-slot">
                <div class="time-label">${timeLabel}</div>
                <div class="time-content ${isCurrentHour ? 'current-hour' : ''}" onclick="scheduleAppointmentAtTime('${dateStr}', '${hourStr}:00')">
        `;
        if (isCurrentHour) {
            const position = (currentMinutes / 60) * 100;
            html += `<div class="current-time-indicator" style="top: ${position}%"></div>`;
        }
        if (hourAppointments.length > 0) {
            hourAppointments.forEach(apt => {
                const client = clients.find(c => c.id === apt.clientId);
                const clientName = client ? client.name : 'Unknown Client';
                const clientPhone = client ? client.phone : '';
                html += `
                    <div class="day-appointment" onclick="event.stopPropagation(); showAppointmentDetail(${apt.id})">
                        <div class="day-appointment-client">${clientName}</div>
                        <div class="day-appointment-time">⏰ ${apt.time} - ${calculateEndTime(apt.time, apt.duration)}</div>
                        ${clientPhone ? `<div class="day-appointment-service">📱 ${clientPhone}</div>` : ''}
                        ${apt.service ? `<div class="day-appointment-service">${apt.service}</div>` : ''}
                    </div>
                `;
            });
        } else {
            html += `<div class="empty-time-slot">Click to schedule</div>`;
        }
        html += `</div></div>`;
    }
    html += '</div>';
    dayView.innerHTML = html;
}

function viewDaySchedule(dateStr) {
    selectedDate = new Date(dateStr + 'T00:00:00');
    viewMode = 'day';
    updateViewToggle();
    renderCalendarView();
}

function scheduleAppointmentAtTime(date, time) {
    document.getElementById('appointmentDate').value = date;
    document.getElementById('appointmentTime').value = time;
    openAppointmentModal();
}

function formatHour(hour) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${displayHour}:00 ${period}`;
}

function calculateEndTime(startTime, duration) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
}

function renderCalendar() {
    renderCalendarView();
}

function resetForms() {
    if (document.getElementById('clientForm')) {
        document.getElementById('clientForm').reset();
    }
    if (document.getElementById('appointmentForm')) {
        document.getElementById('appointmentForm').reset();
    }
    if (document.getElementById('invoiceForm')) {
        document.getElementById('invoiceForm').reset();
    }
    if (document.getElementById('quoteForm')) {
        document.getElementById('quoteForm').reset();
    }
    // Reset SMS checkbox to checked by default
    if (document.getElementById('sendSmsConfirmation')) {
        document.getElementById('sendSmsConfirmation').checked = true;
    }
    editingClientId = null;
    editingAppointmentId = null;
    editingInvoiceId = null;
    editingQuoteId = null;
}

function sendSmsConfirmation(appointmentId) {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) {
        alert('Programarea nu a fost găsită');
        return;
    }
    
    const client = clients.find(c => c.id === appointment.clientId);
    if (!client || !client.phone) {
        alert('Numărul de telefon al clientului nu a fost găsit. Vă rugăm adăugați un număr de telefon în profilul clientului.');
        return;
    }
    
    // Format the phone number (remove any non-numeric characters except +)
    const phoneNumber = client.phone.replace(/[^\d+]/g, '');
    
    // Create the confirmation message
    const dateFormatted = formatDate(appointment.date);
    const endTime = calculateEndTime(appointment.time, appointment.duration);
    
    let message = `Bună, ${client.name}! `;
    message += `Aceasta este o confirmare pentru programarea dumneavoastră din data de ${dateFormatted} la ora ${appointment.time}`;
    if (appointment.service) {
        message += ` pentru ${appointment.service}`;
    }
    message += `. Durată: ${appointment.duration} minute (${appointment.time} - ${endTime}).`;
    message += ` Vă rugăm să confirmați sau să ne sunați dacă doriți să reprogramați. Vă mulțumim!`;
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create SMS URL (works on both mobile and desktop)
    // On mobile: opens SMS app with pre-filled message
    // On desktop: may open default messaging app or prompt to set one up
    const smsUrl = `sms:${phoneNumber}?body=${encodedMessage}`;
    
    // Show notification
    showNotification(`Se deschide aplicația SMS pentru trimiterea confirmării către ${client.name} (${client.phone})...`);
    
    // Open SMS app
    window.location.href = smsUrl;
    
    // Alternative method for better compatibility
    setTimeout(() => {
        const link = document.createElement('a');
        link.href = smsUrl;
        link.click();
    }, 100);
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'sms-notification';
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.5rem;">📱</span>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// ============================================
// MOBILE SYNC & DATA SHARING FUNCTIONS
// ============================================

function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Validate data structure
            if (!data.clients || !data.appointments || !data.invoices) {
                throw new Error('Invalid data format');
            }
            
            // Ask for confirmation
            const confirmMsg = `Import ${data.clients.length} clients, ${data.appointments.length} appointments, and ${data.invoices.length} invoices?\n\nThis will replace your current data!`;
            
            if (confirm(confirmMsg)) {
                // Import data
                clients = data.clients;
                appointments = data.appointments;
                invoices = data.invoices;
                if (data.businessInfo) {
                    businessInfo = data.businessInfo;
                }
                
                // Save to localStorage
                saveToLocalStorage();
                
                // Refresh all views
                renderDashboard();
                renderClients();
                renderAppointments();
                renderInvoices();
                renderCalendar();
                
                showNotification('✅ Data imported successfully! All views updated.');
            }
        } catch (error) {
            alert('Error importing data: ' + error.message);
        }
    };
    
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

// Old loadSharedData function removed - now handled by initializeCloudSync
// Keeping this comment for reference
function loadSharedData_OLD() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('data');
    
    if (encodedData) {
        try {
            // Decode the data
            const jsonStr = decodeURIComponent(escape(atob(encodedData)));
            const data = JSON.parse(jsonStr);
            
            // Validate data
            if (data.clients && data.appointments && data.invoices) {
                // Check if local data exists
                const hasLocalData = clients.length > 0 || appointments.length > 0 || invoices.length > 0;
                
                let shouldImport = true;
                if (hasLocalData) {
                    shouldImport = confirm(`Found shared data with ${data.clients.length} clients, ${data.appointments.length} appointments.\n\nImport this data? (Will replace current data)`);
                }
                
                // ALWAYS clean URL after showing dialog (whether user accepts or cancels)
                window.history.replaceState({}, document.title, window.location.pathname);
                
                if (shouldImport) {
                    // Import data
                    clients = data.clients;
                    appointments = data.appointments;
                    invoices = data.invoices;
                    if (data.businessInfo) {
                        businessInfo = data.businessInfo;
                    }
                    
                    // Import cloud sync ID if provided
                    if (data.syncId) {
                        syncId = data.syncId;
                        localStorage.setItem('syncId', syncId);
                        showNotification('☁️ Cloud Sync Connected!');
                    }
                    
                    // Save to localStorage
                    saveToLocalStorage();
                    
                    // Refresh all views
                    renderDashboard();
                    renderClients();
                    renderAppointments();
                    renderInvoices();
                    renderCalendar();
                    
                    // Show success notification
                    if (!data.syncId) {
                        showNotification('✅ Synced! Your data has been loaded successfully.');
                    }
                }
            } else {
                // Invalid data format - clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch (error) {
            // Clean URL even on error to prevent repeated error messages
            window.history.replaceState({}, document.title, window.location.pathname);
            console.error('Error loading shared data:', error);
            // Don't show error notification if user just canceled
            // Only show if there's actual data corruption
            if (!error.message.includes('cancel')) {
                showNotification('❌ Error loading shared data. Data might be corrupted.');
            }
        }
    }
}

// ==================== TELEGRAM FUNCTIONS ====================

function loadSettings() {
    const tokenInput = document.getElementById('telegramBotToken');
    if (telegramBotToken) {
        tokenInput.value = telegramBotToken;
    }
}

function saveTelegramToken() {
    const token = document.getElementById('telegramBotToken').value.trim();
    
    if (!token) {
        showNotification('⚠️ Te rog introdu token-ul Telegram Bot');
        return;
    }
    
    telegramBotToken = token;
    localStorage.setItem('telegramBotToken', token);
    
    document.getElementById('telegramStatus').innerHTML = `
        <div style="background: #d4edda; color: #155724; padding: 12px; border-radius: 6px; border: 1px solid #c3e6cb;">
            ✅ Token-ul a fost salvat cu succes! Acum poți testa conexiunea.
        </div>
    `;
    
    showNotification('✅ Token Telegram salvat!');
}

async function testTelegramConnection() {
    if (!telegramBotToken) {
        document.getElementById('telegramStatus').innerHTML = `
            <div style="background: #f8d7da; color: #721c24; padding: 12px; border-radius: 6px; border: 1px solid #f5c6cb;">
                ❌ Te rog salvează mai întâi token-ul!
            </div>
        `;
        return;
    }
    
    document.getElementById('telegramStatus').innerHTML = `
        <div style="background: #cce5ff; color: #004085; padding: 12px; border-radius: 6px; border: 1px solid #b8daff;">
            🔄 Se testează conexiunea...
        </div>
    `;
    
    try {
        const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/getMe`);
        const data = await response.json();
        
        if (data.ok) {
            const botName = data.result.username;
            document.getElementById('telegramStatus').innerHTML = `
                <div style="background: #d4edda; color: #155724; padding: 12px; border-radius: 6px; border: 1px solid #c3e6cb;">
                    ✅ <strong>Conexiune reușită!</strong><br>
                    Bot: @${botName}<br>
                    <small>Clienții pot căuta acest bot în Telegram și apăsa START pentru a primi Chat ID.</small>
                </div>
            `;
            showNotification('✅ Telegram Bot conectat cu succes!');
        } else {
            throw new Error(data.description || 'Invalid token');
        }
    } catch (error) {
        document.getElementById('telegramStatus').innerHTML = `
            <div style="background: #f8d7da; color: #721c24; padding: 12px; border-radius: 6px; border: 1px solid #f5c6cb;">
                ❌ <strong>Eroare de conexiune!</strong><br>
                ${error.message}<br>
                <small>Verifică dacă token-ul este corect.</small>
            </div>
        `;
        showNotification('❌ Eroare: Token invalid');
    }
}

async function sendTelegramMessage(chatId, message) {
    if (!telegramBotToken) {
        showNotification('⚠️ Configurează mai întâi Telegram Bot în Setări');
        return false;
    }
    
    if (!chatId) {
        showNotification('⚠️ Clientul nu are Telegram Chat ID setat');
        return false;
    }
    
    try {
        const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            showNotification('✅ Mesaj trimis cu succes prin Telegram!');
            return true;
        } else {
            throw new Error(data.description || 'Failed to send message');
        }
    } catch (error) {
        showNotification(`❌ Eroare trimitere: ${error.message}`);
        return false;
    }
}

async function sendAppointmentReminder(appointmentId) {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return;
    
    const client = clients.find(c => c.id === appointment.clientId);
    if (!client) return;
    
    if (!client.telegram) {
        showNotification('⚠️ Clientul nu are Telegram Chat ID setat. Adaugă-l în profilul clientului.');
        return;
    }
    
    const message = `🔔 <b>Memento Programare</b>\n\n` +
                   `Bună, ${client.name}!\n\n` +
                   `Aveți o programare:\n` +
                   `📅 Data: ${formatDate(appointment.date)}\n` +
                   `⏰ Ora: ${appointment.time}\n` +
                   `⏱ Durată: ${appointment.duration} minute\n\n` +
                   `Vă așteptăm! 😊`;
    
    await sendTelegramMessage(client.telegram, message);
}

// Add global functions for HTML onclick handlers
window.saveTelegramToken = saveTelegramToken;
window.testTelegramConnection = testTelegramConnection;
window.sendAppointmentReminder = sendAppointmentReminder;

async function sendClientTestMessage(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    
    if (!client.telegram) {
        showNotification('⚠️ Clientul nu are Telegram Chat ID setat');
        return;
    }
    
    const message = `👋 Bună, ${client.name}!\n\n` +
                   `Acesta este un mesaj de test de la aplicația de programări.\n\n` +
                   `Telegram este configurat corect! ✅`;
    
    await sendTelegramMessage(client.telegram, message);
}

window.sendClientTestMessage = sendClientTestMessage;

// ========================================
// SMART FEATURES - AI-POWERED ENHANCEMENTS
// ========================================

// Smart Notifications System
let smartNotifications = JSON.parse(localStorage.getItem('smartNotifications')) || [];

function generateSmartNotifications() {
    const notifications = [];
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Check reminder notifications (1, 3, 7 days before)
    appointments.forEach(appt => {
        if (appt.reminderDays && appt.reminderDays !== 'none') {
            const apptDate = new Date(appt.date);
            const daysUntil = Math.floor((apptDate - now) / (24 * 60 * 60 * 1000));
            const reminderDays = parseInt(appt.reminderDays);
            
            if (daysUntil === reminderDays && daysUntil > 0) {
                const client = clients.find(c => c.id === appt.clientId);
                notifications.push({
                    id: `reminder-${appt.id}`,
                    type: 'info',
                    icon: '⏰',
                    title: `Reminder: Programare în ${reminderDays} ${reminderDays === 1 ? 'zi' : 'zile'}`,
                    text: `${client?.name || 'Client'} - ${appt.time} ${appt.service ? `(${appt.service})` : ''}`,
                    time: formatTime(now),
                    timestamp: now.getTime()
                });
            }
        }
    });
    
    // Check upcoming appointments in next 2 hours
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    appointments.forEach(appt => {
        const apptDateTime = new Date(`${appt.date}T${appt.time}`);
        if (apptDateTime > now && apptDateTime <= twoHoursLater) {
            const client = clients.find(c => c.id === appt.clientId);
            const minutesUntil = Math.round((apptDateTime - now) / 60000);
            notifications.push({
                id: `appt-${appt.id}`,
                type: 'urgent',
                icon: '⏰',
                title: 'Programare Iminentă!',
                text: `${client?.name || 'Client'} vine în ${minutesUntil} minute`,
                time: 'Acum',
                timestamp: now.getTime()
            });
        }
    });
    
    // Check today's appointments
    const todayAppts = appointments.filter(a => a.date === today);
    if (todayAppts.length > 0) {
        notifications.push({
            id: 'today-summary',
            type: 'info',
            icon: '📅',
            title: `${todayAppts.length} Programări Astăzi`,
            text: `Verifică programul pentru detalii`,
            time: formatTime(now),
            timestamp: now.getTime()
        });
    }
    
    // Check unpaid invoices
    const unpaidInvoices = invoices.filter(inv => inv.status === 'unpaid');
    if (unpaidInvoices.length > 0) {
        const total = unpaidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        notifications.push({
            id: 'unpaid-invoices',
            type: 'urgent',
            icon: '💰',
            title: `${unpaidInvoices.length} Facturi Neplătite`,
            text: `Total de încasat: ${total.toFixed(2)} RON`,
            time: formatTime(now),
            timestamp: now.getTime()
        });
    }
    
    // Check clients without recent appointments (potential follow-up)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    clients.forEach(client => {
        const clientAppts = appointments.filter(a => a.clientId === client.id);
        if (clientAppts.length > 0) {
            const lastAppt = clientAppts
                .map(a => new Date(a.date))
                .sort((a, b) => b - a)[0];
            
            if (lastAppt < oneMonthAgo) {
                const daysSince = Math.floor((now - lastAppt) / (24 * 60 * 60 * 1000));
                notifications.push({
                    id: `followup-${client.id}`,
                    type: 'info',
                    icon: '🔄',
                    title: 'Follow-up Sugerat',
                    text: `${client.name} - ${daysSince} zile de la ultima programare`,
                    time: formatTime(now),
                    timestamp: now.getTime()
                });
            }
        }
    });
    
    // Success notification for meeting daily goals
    if (todayAppts.filter(a => a.status === 'confirmed').length >= 5) {
        notifications.push({
            id: 'daily-goal',
            type: 'success',
            icon: '🎯',
            title: 'Obiectiv Zilnic Atins!',
            text: 'Felicitări! Ai 5+ programări confirmate astăzi',
            time: formatTime(now),
            timestamp: now.getTime()
        });
    }
    
    return notifications.slice(0, 10); // Max 10 notifications
}

function renderSmartNotifications() {
    const container = document.getElementById('smartNotifications');
    if (!container) return;
    
    const notifications = generateSmartNotifications();
    
    if (notifications.length === 0) {
        container.innerHTML = '<div class="empty-state" style="color: rgba(255,255,255,0.7); padding: 15px; font-size: 0.9rem; text-align: center;">✨ Totul OK!</div>';
        return;
    }
    
    container.innerHTML = notifications.map(notif => `
        <div class="notification-item ${notif.type}">
            <div class="notification-icon">${notif.icon}</div>
            <div class="notification-content">
                <div class="notification-title">${notif.title}</div>
                <div class="notification-text">${notif.text}</div>
                <div class="notification-time">${notif.time}</div>
            </div>
        </div>
    `).join('');
}

// Global Quick Search
function performGlobalSearch(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();
    
    // Search clients
    clients.forEach(client => {
        if (client.name.toLowerCase().includes(lowerQuery) ||
            client.phone.includes(query) ||
            client.email?.toLowerCase().includes(lowerQuery)) {
            results.push({
                type: 'client',
                icon: '👤',
                title: client.name,
                details: `📱 ${client.phone} ${client.email ? '📧 ' + client.email : ''}`,
                data: client
            });
        }
    });
    
    // Search appointments
    appointments.forEach(appt => {
        const client = clients.find(c => c.id === appt.clientId);
        const searchText = `${client?.name} ${appt.service} ${appt.date}`.toLowerCase();
        if (searchText.includes(lowerQuery)) {
            results.push({
                type: 'appointment',
                icon: '📅',
                title: `Programare: ${client?.name || 'Client'}`,
                details: `${formatDate(appt.date)} la ${appt.time} - ${appt.service}`,
                data: appt
            });
        }
    });
    
    // Search invoices
    invoices.forEach(invoice => {
        const client = clients.find(c => c.id === invoice.clientId);
        const searchText = `${invoice.invoiceNumber} ${client?.name}`.toLowerCase();
        if (searchText.includes(lowerQuery)) {
            results.push({
                type: 'invoice',
                icon: '💰',
                title: `Factură #${invoice.invoiceNumber}`,
                details: `${client?.name || 'Client'} - ${invoice.total?.toFixed(2)} RON - ${invoice.status}`,
                data: invoice
            });
        }
    });
    
    return results.slice(0, 20); // Max 20 results
}

function renderSearchResults(results) {
    const container = document.getElementById('quickSearchResults');
    if (!container) return;
    
    if (results.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">Nu s-au găsit rezultate</div>';
        container.style.display = 'block';
        return;
    }
    
    container.innerHTML = results.map(result => `
        <div class="search-result-item" onclick="handleSearchResultClick('${result.type}', '${result.data.id}')">
            <span class="search-result-type">${result.icon} ${result.type.toUpperCase()}</span>
            <div class="search-result-title">${result.title}</div>
            <div class="search-result-details">${result.details}</div>
        </div>
    `).join('');
    container.style.display = 'block';
}

function handleSearchResultClick(type, id) {
    if (type === 'client') {
        switchTab('clientsBtn', 'clientsSection');
        // Scroll to client
        setTimeout(() => {
            const clientCard = document.querySelector(`[data-client-id="${id}"]`);
            if (clientCard) clientCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    } else if (type === 'appointment') {
        switchTab('appointmentsBtn', 'appointmentsSection');
    } else if (type === 'invoice') {
        switchTab('invoicesBtn', 'invoicesSection');
    }
    document.getElementById('quickSearchResults').style.display = 'none';
    document.getElementById('globalSearch').value = '';
}

// Calculate Monthly Revenue - includes ALL invoices from current month (day 1 to last day)
function calculateMonthlyRevenue() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get all paid invoices from the entire current month
    // This includes all days from 1st to the last day (28/29/30/31)
    // regardless of what day of the month we are currently on
    return invoices
        .filter(inv => {
            // Only count paid invoices
            if (inv.status !== 'paid') return false;
            
            // Use payment date if available, otherwise use date or issueDate
            const dateToCheck = inv.paidDate ? new Date(inv.paidDate) : (inv.date ? new Date(inv.date) : (inv.issueDate ? new Date(inv.issueDate) : null));
            
            if (!dateToCheck) return false;
            
            // Check if invoice is from current month and year (any day)
            return dateToCheck.getMonth() === currentMonth && 
                   dateToCheck.getFullYear() === currentYear;
        })
        .reduce((total, inv) => total + (inv.total || 0), 0);
}

// Calculate Recurring Clients (clients with 2+ appointments)
function calculateRecurringClients() {
    return clients.filter(client => {
        const clientAppointments = appointments.filter(a => a.clientId === client.id);
        return clientAppointments.length >= 2;
    }).length;
}

// Keyboard Shortcuts
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Don't trigger shortcuts when typing in inputs/textareas
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            return;
        }
        
        // Don't trigger if any modal is open
        const modalsOpen = document.querySelector('.modal[style*="display: block"]');
        if (modalsOpen) return;
        
        // Shortcuts (case insensitive)
        const key = e.key.toLowerCase();
        
        // Ctrl/Cmd + S to save (trigger manual save)
        if ((e.ctrlKey || e.metaKey) && key === 's') {
            e.preventDefault();
            saveToLocalStorage();
            showNotification('💾 Date salvate!', 'success');
            return;
        }
        
        // Ctrl/Cmd + Z to undo (if undo available)
        if ((e.ctrlKey || e.metaKey) && key === 'z' && lastDeletedItem) {
            e.preventDefault();
            undoDelete();
            return;
        }
        
        if (key === 'n') {
            e.preventDefault();
            document.getElementById('addAppointmentBtn').click();
        } else if (key === 'c') {
            e.preventDefault();
            document.getElementById('addClientBtn').click();
        } else if (key === 'f') {
            e.preventDefault();
            const addInvoiceBtn = document.getElementById('addInvoiceBtn');
            if (addInvoiceBtn) addInvoiceBtn.click();
        } else if (key === 'q') {
            e.preventDefault();
            const addQuoteBtn = document.getElementById('addQuoteBtn');
            if (addQuoteBtn) addQuoteBtn.click();
        } else if (key === 's') {
            e.preventDefault();
            const globalSearch = document.getElementById('globalSearch');
            if (globalSearch) {
                globalSearch.focus();
                globalSearch.select();
            }
        } else if (key === 'd') {
            e.preventDefault();
            document.getElementById('dashboardBtn').click();
        } else if (key === 'p') {
            e.preventDefault();
            document.getElementById('appointmentsBtn').click();
        } else if (key === 'k') {
            e.preventDefault();
            document.getElementById('calendarBtn').click();
        } else if (key === '?') {
            e.preventDefault();
            showKeyboardShortcutsHelp();
        }
    });
    
    console.log('⌨️ Keyboard shortcuts enabled: N=Programare, C=Client, F=Factură, Q=Ofertă, S=Căutare, D=Dashboard, P=Programări, K=Calendar, ?=Help, Ctrl+S=Save, Ctrl+Z=Undo');
}

// CSV Import Handler
function handleCSVImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csv = e.target.result;
            const lines = csv.split('\n').filter(line => line.trim());
            
            if (lines.length < 2) {
                alert('❌ Fișier CSV invalid sau gol');
                return;
            }
            
            // Parse header
            const header = lines[0].split(',').map(h => h.trim().toLowerCase());
            const nameIndex = header.findIndex(h => h.includes('nume') || h.includes('name'));
            const phoneIndex = header.findIndex(h => h.includes('telefon') || h.includes('phone'));
            const emailIndex = header.findIndex(h => h.includes('email'));
            
            if (nameIndex === -1 || phoneIndex === -1) {
                alert('❌ CSV-ul trebuie să conțină coloane pentru "Nume" și "Telefon"');
                return;
            }
            
            let importedCount = 0;
            let skippedCount = 0;
            
            // Process each line
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                const name = values[nameIndex];
                const phone = values[phoneIndex];
                const email = emailIndex >= 0 ? values[emailIndex] : '';
                
                if (!name || !phone) {
                    skippedCount++;
                    continue;
                }
                
                // Check if client already exists
                const exists = clients.find(c => 
                    c.name.toLowerCase() === name.toLowerCase() || 
                    c.phone === phone
                );
                
                if (exists) {
                    skippedCount++;
                    continue;
                }
                
                // Add new client
                clients.push({
                    id: Date.now() + i,
                    name,
                    phone,
                    email,
                    cui: '',
                    regCom: '',
                    address: '',
                    city: '',
                    county: '',
                    postalCode: '',
                    iban: '',
                    bank: '',
                    telegram: '',
                    notes: '',
                    tags: ['Nou'],
                    createdAt: new Date().toISOString()
                });
                
                importedCount++;
            }
            
            if (importedCount > 0) {
                saveToLocalStorage();
                renderClients();
                renderDashboard();
                showNotification(`✅ ${importedCount} clienți importați cu succes!${skippedCount > 0 ? ` (${skippedCount} săriți)` : ''}`, 'success');
            } else {
                alert('❌ Niciun client nou nu a fost importat. Verifică dacă clienții nu există deja.');
            }
            
        } catch (error) {
            console.error('CSV Import Error:', error);
            alert('❌ Eroare la importul CSV. Verifică formatul fișierului.');
        }
        
        // Reset input
        event.target.value = '';
    };
    
    reader.readAsText(file);
}

// Get color for service type (consistent colors based on service name)
function getServiceColor(serviceName) {
    if (!serviceName) {
        return { from: '#4a90e2', to: '#357abd' }; // Default blue
    }
    
    // Define color palettes for different service types
    const colorPalettes = [
        { from: '#667eea', to: '#764ba2' }, // Purple
        { from: '#f093fb', to: '#f5576c' }, // Pink
        { from: '#4facfe', to: '#00f2fe' }, // Cyan
        { from: '#43e97b', to: '#38f9d7' }, // Green
        { from: '#fa709a', to: '#fee140' }, // Orange/Pink
        { from: '#30cfd0', to: '#330867' }, // Teal/Purple
        { from: '#a8edea', to: '#fed6e3' }, // Light pastel
        { from: '#ff9a9e', to: '#fecfef' }, // Rose
        { from: '#ffecd2', to: '#fcb69f' }, // Peach
        { from: '#ff6e7f', to: '#bfe9ff' }, // Red/Blue
    ];
    
    // Simple hash function to get consistent color for same service
    let hash = 0;
    for (let i = 0; i < serviceName.length; i++) {
        hash = serviceName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colorPalettes.length;
    
    return colorPalettes[index];
}

// Calculate name similarity using Levenshtein distance
function calculateNameSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}

// Dark Mode Toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
}

// Auto-backup every 30 minutes
let autoBackupInterval;
function startAutoBackup() {
    autoBackupInterval = setInterval(() => {
        createBackup();
        console.log('🔄 Auto-backup created');
        showNotification('✅ Backup automat creat', 'success');
    }, 30 * 60 * 1000); // 30 minutes
}

// Smart Reminders Modal
function showSmartRemindersModal() {
    const upcomingAppts = appointments
        .filter(a => new Date(a.date) >= new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 10);
    
    let html = '<h2>⏰ Reminder-e Inteligente</h2>';
    html += '<p>Trimite reminder-e automate pentru programările viitoare:</p>';
    html += '<div style="max-height: 400px; overflow-y: auto;">';
    
    upcomingAppts.forEach(appt => {
        const client = clients.find(c => c.id === appt.clientId);
        const hasPhone = client?.phone;
        const hasTelegram = client?.telegram;
        
        html += `
            <div style="background: #f9fafb; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea;">
                <div style="font-weight: 600; margin-bottom: 5px;">${client?.name || 'Client'}</div>
                <div style="font-size: 0.9rem; color: #666; margin-bottom: 10px;">
                    📅 ${formatDate(appt.date)} la ${appt.time}
                </div>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    ${hasPhone ? `<button class="btn btn-sm btn-primary" onclick="sendSMSReminder('${appt.id}')">📱 Trimite SMS</button>` : ''}
                    ${hasTelegram ? `<button class="btn btn-sm btn-success" onclick="sendTelegramReminder('${appt.id}')">📨 Trimite Telegram</button>` : ''}
                    ${!hasPhone && !hasTelegram ? '<span style="color: #999; font-size: 0.85rem;">Nu există metodă de contact</span>' : ''}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    showModal('Reminders Modal', html);
}

async function sendTelegramReminder(appointmentId) {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return;
    
    await sendAppointmentReminder(appointment.id);
}

function sendSMSReminder(appointmentId) {
    // Placeholder for SMS integration
    showNotification('📱 Funcție SMS în curs de dezvoltare', 'info');
}

// Update dashboard with smart stats
function updateSmartStats() {
    const monthlyRevenue = calculateMonthlyRevenue();
    const recurringClients = calculateRecurringClients();
    
    const revenueEl = document.getElementById('monthlyRevenue');
    const recurringEl = document.getElementById('recurringClients');
    
    if (revenueEl) revenueEl.textContent = `${monthlyRevenue.toFixed(2)} RON`;
    if (recurringEl) recurringEl.textContent = recurringClients;
}

// Initialize Smart Features
function initializeSmartFeatures() {
    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        // Load saved dark mode preference
        const darkMode = localStorage.getItem('darkMode');
        if (darkMode === 'enabled') {
            document.body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        }
        
        darkModeToggle.addEventListener('change', toggleDarkMode);
    }
    
    // Global search
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
        let searchTimeout;
        globalSearch.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                document.getElementById('quickSearchResults').style.display = 'none';
                return;
            }
            
            searchTimeout = setTimeout(() => {
                const results = performGlobalSearch(query);
                renderSearchResults(results);
            }, 300);
        });
        
        // Hide results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.quick-search-panel')) {
                document.getElementById('quickSearchResults').style.display = 'none';
            }
        });
    }
    
    // Clear notifications button
    const clearNotifBtn = document.getElementById('clearNotifications');
    if (clearNotifBtn) {
        clearNotifBtn.addEventListener('click', () => {
            smartNotifications = [];
            localStorage.setItem('smartNotifications', JSON.stringify(smartNotifications));
            renderSmartNotifications();
            showNotification('✅ Notificări șterse', 'success');
        });
    }
    
    // Smart reminders button
    const smartRemindersBtn = document.getElementById('smartRemindersBtn');
    if (smartRemindersBtn) {
        smartRemindersBtn.addEventListener('click', showSmartRemindersModal);
    }
    
    // Advanced search button
    const advancedSearchBtn = document.getElementById('advancedSearchBtn');
    if (advancedSearchBtn) {
        advancedSearchBtn.addEventListener('click', () => {
            showNotification('🔍 Căutare avansată - în curând!', 'info');
        });
    }
}

// Helper function to show modal
function showModal(title, content) {
    const existingModal = document.querySelector('.smart-modal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'modal smart-modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.closest('.modal').remove(); const fab = document.querySelector('.fab-container'); if(fab) fab.classList.remove('hidden');">&times;</span>
            ${content}
        </div>
    `;
    document.body.appendChild(modal);
    
    // Hide FAB buttons when modal opens on mobile
    const fabContainer = document.querySelector('.fab-container');
    if (fabContainer) fabContainer.classList.add('hidden');
}

// Export smart functions for global access
window.handleSearchResultClick = handleSearchResultClick;
window.showSmartRemindersModal = showSmartRemindersModal;
window.sendTelegramReminder = sendTelegramReminder;
window.sendSMSReminder = sendSMSReminder;

// Toggle Sync Panel
function toggleSyncPanel() {
    const panel = document.getElementById('syncControlsPanel');
    const btn = document.getElementById('syncToggleBtn');
    
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        btn.classList.add('active');
    } else {
        panel.style.display = 'none';
        btn.classList.remove('active');
    }
}

window.toggleSyncPanel = toggleSyncPanel;

function toggleDashboardPanel() {
    const panel = document.getElementById('dashboardContentPanel');
    const btn = document.getElementById('dashboardToggleBtn');
    
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        btn.classList.add('active');
    } else {
        panel.style.display = 'none';
        btn.classList.remove('active');
    }
}

window.toggleDashboardPanel = toggleDashboardPanel;

function toggleMobileControls() {
    const panel = document.getElementById('headerActionsPanel');
    const btn = document.getElementById('mobileControlsToggleBtn');
    
    if (panel.classList.contains('show')) {
        panel.classList.remove('show');
        btn.classList.remove('active');
    } else {
        panel.classList.add('show');
        btn.classList.add('active');
    }
}

window.toggleMobileControls = toggleMobileControls;

// ============================================
// ANALYTICS & BUSINESS INTELLIGENCE - NEW
// ============================================

// Toggle Revenue Chart
function toggleRevenueChart() {
    const panel = document.getElementById('revenueChartPanel');
    const btn = document.getElementById('revenueChartToggleBtn');
    
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        btn.classList.add('active');
        renderRevenueChart();
    } else {
        panel.style.display = 'none';
        btn.classList.remove('active');
    }
}

window.toggleRevenueChart = toggleRevenueChart;

// Render Revenue Chart (Simple CSS-based)
function renderRevenueChart() {
    const canvas = document.getElementById('revenueChart');
    if (!canvas) return;
    
    // Calculate revenue for last 6 months
    const months = [];
    const revenue = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('ro-RO', { month: 'short', year: 'numeric' });
        months.push(monthName);
        
        // Calculate revenue for this month
        const monthRevenue = invoices
            .filter(inv => {
                const invoiceDate = inv.paidDate ? new Date(inv.paidDate) : (inv.date ? new Date(inv.date) : null);
                if (!invoiceDate) return false;
                return invoiceDate.getMonth() === date.getMonth() && 
                       invoiceDate.getFullYear() === date.getFullYear() &&
                       inv.status === 'paid';
            })
            .reduce((sum, inv) => sum + (inv.total || 0), 0);
        
        revenue.push(monthRevenue);
    }
    
    // Create simple bar chart with CSS
    const maxRevenue = Math.max(...revenue, 1);
    const chartHTML = `
        <div style="display: flex; align-items: flex-end; justify-content: space-around; height: 250px; padding: 20px; border-bottom: 2px solid #e5e7eb;">
            ${revenue.map((rev, idx) => {
                const heightPercent = (rev / maxRevenue) * 100;
                return `
                    <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                        <div style="font-weight: 700; color: #10b981; font-size: 0.9rem;">${rev.toFixed(0)} RON</div>
                        <div style="width: 80%; height: ${heightPercent}%; min-height: 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px 8px 0 0; transition: all 0.3s; cursor: pointer; box-shadow: 0 -2px 10px rgba(16, 185, 129, 0.3);" 
                             onmouseover="this.style.transform='scaleY(1.05)'" 
                             onmouseout="this.style.transform='scaleY(1)'"></div>
                        <div style="font-size: 0.85rem; color: #6b7280; font-weight: 600; text-align: center;">${months[idx]}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    canvas.outerHTML = `<div id="revenueChart">${chartHTML}</div>`;
}

// Render Top 5 Clients
function renderTopClients() {
    const container = document.getElementById('topClientsChart');
    if (!container) return;
    
    // Calculate revenue per client
    const clientRevenue = {};
    
    invoices.filter(inv => inv.status === 'paid').forEach(inv => {
        const clientName = inv.clientName || 'Necunoscut';
        if (!clientRevenue[clientName]) {
            clientRevenue[clientName] = {
                name: clientName,
                revenue: 0,
                invoiceCount: 0
            };
        }
        clientRevenue[clientName].revenue += inv.total || 0;
        clientRevenue[clientName].invoiceCount++;
    });
    
    // Sort by revenue and get top 5
    const topClients = Object.values(clientRevenue)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    
    if (topClients.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #6b7280; padding: 20px;">Nu există date încă</div>';
        return;
    }
    
    const badges = ['gold', 'silver', 'bronze', '', ''];
    
    container.innerHTML = topClients.map((client, idx) => `
        <div class="client-rank-item">
            <div class="rank-badge ${badges[idx]}">${idx + 1}</div>
            <div class="client-rank-info">
                <div class="client-rank-name">${client.name}</div>
                <div class="client-rank-stats">${client.invoiceCount} facturi</div>
            </div>
            <div class="client-rank-revenue">${client.revenue.toFixed(0)} RON</div>
        </div>
    `).join('');
}

// Render Busy Days
function renderBusyDays() {
    const container = document.getElementById('busyDaysChart');
    if (!container) return;
    
    // Count appointments by day of week
    const dayCounts = {
        'Luni': 0,
        'Marți': 0,
        'Miercuri': 0,
        'Joi': 0,
        'Vineri': 0,
        'Sâmbătă': 0,
        'Duminică': 0
    };
    
    const dayNames = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'];
    
    appointments.forEach(apt => {
        if (apt.status !== 'cancelled' && apt.date) {
            const date = new Date(apt.date);
            const dayName = dayNames[date.getDay()];
            dayCounts[dayName]++;
        }
    });
    
    // Sort by count
    const sortedDays = Object.entries(dayCounts)
        .map(([day, count]) => ({ day, count }))
        .sort((a, b) => b.count - a.count);
    
    const maxCount = Math.max(...sortedDays.map(d => d.count), 1);
    
    if (maxCount === 0) {
        container.innerHTML = '<div style="text-align: center; color: #6b7280; padding: 20px;">Nu există programări încă</div>';
        return;
    }
    
    container.innerHTML = sortedDays.map(item => {
        const widthPercent = (item.count / maxCount) * 100;
        return `
            <div class="busy-day-item">
                <div class="busy-day-info">
                    <div class="busy-day-name">${item.day}</div>
                    <div class="busy-day-count">${item.count} programări</div>
                </div>
                <div class="busy-day-bar">
                    <div class="busy-day-bar-fill" style="width: ${widthPercent}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

// Export Reports Functions
function exportAppointmentsReport() {
    const data = appointments.map(apt => {
        const client = clients.find(c => c.id === apt.clientId);
        return {
            'Data': apt.date || '',
            'Ora': apt.time || '',
            'Client': client ? client.name : 'Necunoscut',
            'Telefon': client ? client.phone : '',
            'Serviciu': apt.service || '',
            'Durată (min)': apt.duration || '',
            'Status': apt.status || '',
            'Note': apt.notes || ''
        };
    });
    
    downloadCSV(data, 'programari_raport.csv');
}

function exportRevenueReport() {
    const data = invoices.filter(inv => inv.status === 'paid').map(inv => ({
        'Număr Factură': inv.number || '',
        'Data': inv.date || '',
        'Data Plată': inv.paidDate || '',
        'Client': inv.clientName || '',
        'Subtotal': inv.subtotal || 0,
        'Reducere': inv.discountAmount || 0,
        'Taxă': inv.taxAmount || 0,
        'Total': inv.total || 0
    }));
    
    downloadCSV(data, 'venituri_raport.csv');
}

function exportClientsReport() {
    const data = clients.map(client => ({
        'Nume': client.name || '',
        'Telefon': client.phone || '',
        'Email': client.email || '',
        'Tags': (client.tags || []).join(', '),
        'CUI': client.cui || '',
        'Adresă': client.address || '',
        'Oraș': client.city || '',
        'Note': client.notes || ''
    }));
    
    downloadCSV(data, 'clienti_raport.csv');
}

function exportFullReport() {
    // Calculate statistics
    const stats = {
        totalClients: clients.length,
        totalAppointments: appointments.length,
        completedAppointments: appointments.filter(a => a.status === 'completed').length,
        totalRevenue: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total || 0), 0),
        unpaidInvoices: invoices.filter(i => i.status === 'unpaid').length,
        unpaidAmount: invoices.filter(i => i.status === 'unpaid').reduce((sum, i) => sum + (i.total || 0), 0)
    };
    
    const data = [{
        'Statistică': 'Total Clienți',
        'Valoare': stats.totalClients
    }, {
        'Statistică': 'Total Programări',
        'Valoare': stats.totalAppointments
    }, {
        'Statistică': 'Programări Finalizate',
        'Valoare': stats.completedAppointments
    }, {
        'Statistică': 'Venituri Totale (RON)',
        'Valoare': stats.totalRevenue.toFixed(2)
    }, {
        'Statistică': 'Facturi Neplătite',
        'Valoare': stats.unpaidInvoices
    }, {
        'Statistică': 'Sumă Neplătită (RON)',
        'Valoare': stats.unpaidAmount.toFixed(2)
    }];
    
    downloadCSV(data, 'raport_complet.csv');
}

function downloadCSV(data, filename) {
    if (data.length === 0) {
        alert('Nu există date pentru export!');
        return;
    }
    
    // Convert to CSV
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            const value = row[header] || '';
            // Escape commas and quotes
            return `"${String(value).replace(/"/g, '""')}"`;
        }).join(','))
    ].join('\n');
    
    // Add BOM for Excel UTF-8 support
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    
    alert(`✅ Raport exportat: ${filename}`);
}

window.exportAppointmentsReport = exportAppointmentsReport;
window.exportRevenueReport = exportRevenueReport;
window.exportClientsReport = exportClientsReport;
window.exportFullReport = exportFullReport;

// ============================================
// PDF EXPORT FUNCTIONS - NEW
// ============================================

function exportAppointmentsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(30, 58, 138);
    doc.text('Raport Programări', 105, 20, { align: 'center' });
    
    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generat: ${new Date().toLocaleDateString('ro-RO')}`, 105, 28, { align: 'center' });
    
    // Prepare table data
    const tableData = appointments.map(apt => {
        const client = clients.find(c => c.id === apt.clientId);
        return [
            apt.date || '',
            apt.time || '',
            client ? client.name : 'Necunoscut',
            client ? client.phone : '',
            apt.service || '',
            apt.duration || '',
            apt.status || ''
        ];
    });
    
    // Add table
    doc.autoTable({
        startY: 35,
        head: [['Data', 'Ora', 'Client', 'Telefon', 'Serviciu', 'Durată', 'Status']],
        body: tableData,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [30, 58, 138], textColor: 255 },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { top: 35 }
    });
    
    // Save
    doc.save('programari_raport.pdf');
    alert('✅ Raport PDF programări generat!');
}

function exportRevenuePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129);
    doc.text('Raport Venituri', 105, 20, { align: 'center' });
    
    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generat: ${new Date().toLocaleDateString('ro-RO')}`, 105, 28, { align: 'center' });
    
    // Calculate totals
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    // Add summary
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total Facturi Plătite: ${paidInvoices.length}`, 20, 40);
    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129);
    doc.text(`Venit Total: ${totalRevenue.toFixed(2)} RON`, 20, 50);
    
    // Prepare table data
    const tableData = paidInvoices.map(inv => [
        inv.number || '',
        inv.date || '',
        inv.paidDate || inv.date || '',
        inv.clientName || '',
        (inv.subtotal || 0).toFixed(2),
        (inv.discountAmount || 0).toFixed(2),
        (inv.taxAmount || 0).toFixed(2),
        (inv.total || 0).toFixed(2)
    ]);
    
    // Add table
    doc.autoTable({
        startY: 60,
        head: [['Nr.', 'Data', 'Plată', 'Client', 'Subtotal', 'Reducere', 'Taxă', 'Total']],
        body: tableData,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        margin: { top: 60 }
    });
    
    // Save
    doc.save('venituri_raport.pdf');
    alert('✅ Raport PDF venituri generat!');
}

function exportClientsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246);
    doc.text('Raport Clienți', 105, 20, { align: 'center' });
    
    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generat: ${new Date().toLocaleDateString('ro-RO')}`, 105, 28, { align: 'center' });
    
    // Add summary
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total Clienți: ${clients.length}`, 20, 40);
    
    // Prepare table data
    const tableData = clients.map(client => [
        client.name || '',
        client.phone || '',
        client.email || '',
        (client.tags || []).join(', '),
        client.city || '',
        client.cui || ''
    ]);
    
    // Add table
    doc.autoTable({
        startY: 50,
        head: [['Nume', 'Telefon', 'Email', 'Tags', 'Oraș', 'CUI']],
        body: tableData,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        alternateRowStyles: { fillColor: [239, 246, 255] },
        margin: { top: 50 }
    });
    
    // Save
    doc.save('clienti_raport.pdf');
    alert('✅ Raport PDF clienți generat!');
}

function exportFullReportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Calculate statistics
    const stats = {
        totalClients: clients.length,
        totalAppointments: appointments.length,
        completedAppointments: appointments.filter(a => a.status === 'completed').length,
        scheduledAppointments: appointments.filter(a => a.status === 'scheduled').length,
        cancelledAppointments: appointments.filter(a => a.status === 'cancelled').length,
        totalRevenue: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total || 0), 0),
        unpaidInvoices: invoices.filter(i => i.status === 'unpaid').length,
        unpaidAmount: invoices.filter(i => i.status === 'unpaid').reduce((sum, i) => sum + (i.total || 0), 0),
        paidInvoices: invoices.filter(i => i.status === 'paid').length
    };
    
    // Add title
    doc.setFontSize(24);
    doc.setTextColor(30, 58, 138);
    doc.text('Raport Complet Business', 105, 25, { align: 'center' });
    
    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generat: ${new Date().toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 105, 33, { align: 'center' });
    
    // Section: Clienți
    let yPos = 50;
    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    doc.text('👥 Clienți', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total Clienți: ${stats.totalClients}`, 30, yPos);
    
    // Section: Programări
    yPos += 20;
    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129);
    doc.text('📅 Programări', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total Programări: ${stats.totalAppointments}`, 30, yPos);
    yPos += 7;
    doc.text(`Finalizate: ${stats.completedAppointments}`, 30, yPos);
    yPos += 7;
    doc.text(`Programate: ${stats.scheduledAppointments}`, 30, yPos);
    yPos += 7;
    doc.text(`Anulate: ${stats.cancelledAppointments}`, 30, yPos);
    
    // Section: Financiar
    yPos += 20;
    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129);
    doc.text('💰 Financiar', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(14);
    doc.setTextColor(16, 185, 129);
    doc.text(`Venit Total: ${stats.totalRevenue.toFixed(2)} RON`, 30, yPos);
    
    yPos += 10;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Facturi Plătite: ${stats.paidInvoices}`, 30, yPos);
    yPos += 7;
    doc.text(`Facturi Neplătite: ${stats.unpaidInvoices}`, 30, yPos);
    yPos += 7;
    doc.setTextColor(239, 68, 68);
    doc.text(`Sumă Neplătită: ${stats.unpaidAmount.toFixed(2)} RON`, 30, yPos);
    
    // Top Clients Section
    yPos += 20;
    if (yPos > 250) {
        doc.addPage();
        yPos = 20;
    }
    
    doc.setFontSize(16);
    doc.setTextColor(245, 158, 11);
    doc.text('🏆 Top 5 Clienți', 20, yPos);
    
    // Calculate top clients
    const clientRevenue = {};
    invoices.filter(inv => inv.status === 'paid').forEach(inv => {
        const clientName = inv.clientName || 'Necunoscut';
        if (!clientRevenue[clientName]) {
            clientRevenue[clientName] = 0;
        }
        clientRevenue[clientName] += inv.total || 0;
    });
    
    const topClients = Object.entries(clientRevenue)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    yPos += 10;
    doc.setFontSize(11);
    doc.setTextColor(0);
    topClients.forEach(([name, revenue], idx) => {
        doc.text(`${idx + 1}. ${name}: ${revenue.toFixed(2)} RON`, 30, yPos);
        yPos += 7;
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Generat de Planificator Programări Clienți - Ediție Profesională', 105, 285, { align: 'center' });
    
    // Save
    doc.save('raport_complet_business.pdf');
    alert('✅ Raport PDF complet generat!');
}

window.exportAppointmentsPDF = exportAppointmentsPDF;
window.exportRevenuePDF = exportRevenuePDF;
window.exportClientsPDF = exportClientsPDF;
window.exportFullReportPDF = exportFullReportPDF;

// Feature Welcome/Discovery Function
function showFeatureWelcome() {
    const FEATURE_VERSION = '2.1'; // Update this when adding new features
    const lastSeenVersion = localStorage.getItem('featureVersion');
    
    // Only show if user hasn't seen this version
    if (lastSeenVersion === FEATURE_VERSION) {
        return;
    }
    
    // Wait 2 seconds after load to show welcome
    setTimeout(() => {
        const welcome = `
            <div style="text-align: center; max-width: 600px;">
                <div style="font-size: 4rem; margin-bottom: 20px;">✨</div>
                <h2 style="color: #667eea; margin-bottom: 15px;">Funcții Smart Îmbunătățite!</h2>
                <p style="color: #374151; font-size: 1.1rem; line-height: 1.6; margin-bottom: 20px;">
                    Am adăugat mai multă vizibilitate pentru funcțiile tale smart preferate!
                </p>
                
                <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #667eea;">
                    <h3 style="color: #667eea; margin-top: 0;">🎯 Noutăți:</h3>
                    <ul style="text-align: left; color: #374151; line-height: 2; margin: 10px 0;">
                        <li><strong>✅ Venituri Sincronizate</strong> - Datele financiare sunt acum corecte!</li>
                        <li><strong>⚡ Panou Acțiuni Rapide</strong> - Acces instant în Setări</li>
                        <li><strong>📊 Status Funcții Smart</strong> - Vezi toate funcțiile active pe Dashboard</li>
                        <li><strong>🎨 Design îmbunătățit</strong> - Mai ușor de navigat</li>
                    </ul>
                </div>
                
                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <strong style="color: #b45309;">💡 Pro Tip:</strong>
                    <p style="color: #92400e; margin: 8px 0 0 0;">
                        Apasă <kbd style="background: white; padding: 4px 8px; border-radius: 4px; font-weight: 700;">K</kbd> 
                        pentru toate shortcut-urile!
                    </p>
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: center; margin-top: 25px;">
                    <button class="btn btn-primary" onclick="document.getElementById('settingsBtn').click(); this.closest('.modal').remove();" style="padding: 12px 24px; font-size: 1rem;">
                        ⚙️ Vezi Funcțiile
                    </button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove(); const fab = document.querySelector('.fab-container'); if(fab) fab.classList.remove('hidden');" style="padding: 12px 24px; font-size: 1rem;">
                        👍 Am înțeles
                    </button>
                </div>
            </div>
        `;
        
        showModal('Bun venit!', welcome);
        
        // Save that user has seen this version
        localStorage.setItem('featureVersion', FEATURE_VERSION);
    }, 2000);
}

// Share to Mobile function