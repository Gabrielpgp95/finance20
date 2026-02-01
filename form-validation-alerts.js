/**
 * REAL-TIME FORM VALIDATION & ERROR NOTIFICATIONS
 * Atenționează utilizatorul în TIMP REAL ce este greșit
 * - Visual feedback (red border, error icons)
 * - Error messages sub fiecare field
 * - Toast notifications
 * - Error summary panel
 * - Auto-scroll la first error
 */

// ==========================================
// ERROR NOTIFICATION SYSTEM
// ==========================================

class FormValidator {
    constructor() {
        this.errors = {};
        this.warnings = {};
        this.validationRules = this.initializeRules();
    }

    initializeRules() {
        return {
            invoiceClientType: {
                required: true,
                message: 'Tip client este obligatoriu'
            },
            invoiceClientName: {
                required: true,
                message: 'Nume client este obligatoriu'
            },
            invoiceClientCUI: {
                required: false,
                pattern: /^RO\d{8,10}$|^$/,
                message: 'CUI trebuie să fie în format: RO + 8-10 cifre'
            },
            invoiceClientCNP: {
                required: false,
                pattern: /^\d{13}$|^$/,
                message: 'CNP trebuie să fie 13 cifre'
            },
            invoiceDate: {
                required: true,
                message: 'Data facturii este obligatorie'
            },
            invoiceDueDate: {
                required: true,
                message: 'Data scadență este obligatorie'
            },
            invoiceClientAddress: {
                required: true,
                message: 'Adresa client este obligatorie'
            },
            invoiceClientCity: {
                required: true,
                message: 'Orașul este obligatoriu'
            },
            invoiceClientCounty: {
                required: true,
                message: 'Județul/Sectorul este obligatoriu'
            },
            invoiceClientPostalCode: {
                required: true,
                message: 'Codul poștal este obligatoriu'
            },
            businessName: {
                required: true,
                message: 'Numele firmei este obligatoriu'
            },
            businessCUI: {
                required: true,
                pattern: /^RO\d{8,10}$/,
                message: 'CUI firmă: RO + 8-10 cifre (obligatoriu)'
            },
            businessAddress: {
                required: true,
                message: 'Adresa firmei este obligatorie'
            },
            businessCity: {
                required: true,
                message: 'Orașul firmei este obligatoriu'
            },
            businessCounty: {
                required: true,
                message: 'Județul firmei este obligatoriu'
            },
            businessPostalCode: {
                required: true,
                message: 'Codul poștal al firmei este obligatoriu'
            },
            businessIBAN: {
                required: false,
                pattern: /^RO\d{2}[A-Z]{4}\d+$|^$/,
                message: 'IBAN trebuie în format: RO + 2 cifre + 4 litere + numere'
            },
            invoiceEmail: {
                required: false,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$|^$/,
                message: 'Email invalid'
            },
            quoteClientType: {
                required: true,
                message: 'Tip client este obligatoriu'
            },
            quoteClientName: {
                required: true,
                message: 'Nume client este obligatoriu'
            },
            quoteClientCUI: {
                required: false,
                pattern: /^RO\d{8,10}$|^$/,
                message: 'CUI trebuie să fie în format: RO + 8-10 cifre'
            },
            quoteClientCNP: {
                required: false,
                pattern: /^\d{13}$|^$/,
                message: 'CNP trebuie să fie 13 cifre'
            }
        };
    }

    validateField(fieldId, value) {
        // Special handling for CUI/CNP - check which type is selected
        if (fieldId === 'invoiceClientCUI' || fieldId === 'invoiceClientCNP' ||
            fieldId === 'quoteClientCUI' || fieldId === 'quoteClientCNP') {
            return this.validateClientIdentifier(fieldId, value);
        }

        const rule = this.validationRules[fieldId];
        if (!rule) return null;

        // Required check
        if (rule.required && (!value || value.trim() === '')) {
            this.addError(fieldId, rule.message);
            return false;
        }

        // Pattern check
        if (rule.pattern && value && !rule.pattern.test(value)) {
            this.addError(fieldId, rule.message);
            return false;
        }

        // Clear error if valid
        this.clearError(fieldId);
        return true;
    }

    /**
     * Validate CUI or CNP based on selected client type
     * Both are OPTIONAL but if provided, must match format
     */
    validateClientIdentifier(fieldId, value) {
        const isInvoice = fieldId.includes('invoice');
        const prefix = isInvoice ? 'invoice' : 'quote';
        const typeSelect = document.getElementById(`${prefix}ClientType`);
        
        if (!typeSelect) return true; // If no type selector, skip validation
        
        const clientType = typeSelect.value;
        
        // If field is empty, it's OK (optional)
        if (!value || value.trim() === '') {
            this.clearError(fieldId);
            return true;
        }
        
        if (fieldId.endsWith('CUI')) {
            // CUI validation - if provided, must be valid format
            if (!/^RO\d{8,10}$/.test(value)) {
                this.addError(fieldId, 'CUI trebuie să fie RO + 8-10 cifre');
                return false;
            }
            // If persoana is selected, CUI is ignored anyway
        } else if (fieldId.endsWith('CNP')) {
            // CNP validation - if provided, must be valid format
            if (!/^\d{13}$/.test(value)) {
                this.addError(fieldId, 'CNP trebuie să fie 13 cifre');
                return false;
            }
            // If firma is selected, CNP is ignored anyway
        }
        
        this.clearError(fieldId);
        return true;
    }

    addError(fieldId, message) {
        this.errors[fieldId] = message;
        this.updateFieldUI(fieldId, 'error', message);
    }

    addWarning(fieldId, message) {
        this.warnings[fieldId] = message;
        this.updateFieldUI(fieldId, 'warning', message);
    }

    clearError(fieldId) {
        delete this.errors[fieldId];
        this.updateFieldUI(fieldId, 'success');
    }

    clearWarning(fieldId) {
        delete this.warnings[fieldId];
    }

    updateFieldUI(fieldId, state, message = '') {
        const element = document.getElementById(fieldId);
        if (!element) return;

        const group = element.closest('.form-group');
        if (!group) return;

        // Remove old states
        group.classList.remove('error-field', 'warning-field', 'success-field');

        // Remove old error message
        const oldError = group.querySelector('.field-error-message');
        if (oldError) oldError.remove();

        // Add new state
        if (state === 'error') {
            group.classList.add('error-field');
            const errorMsg = document.createElement('span');
            errorMsg.className = 'field-error-message';
            errorMsg.textContent = '❌ ' + message;
            group.appendChild(errorMsg);
            element.style.borderColor = '#f44336';
            element.style.boxShadow = '0 0 0 3px rgba(244, 67, 54, 0.1)';
        } else if (state === 'warning') {
            group.classList.add('warning-field');
            const errorMsg = document.createElement('span');
            errorMsg.className = 'field-error-message warning';
            errorMsg.textContent = '⚠️ ' + message;
            group.appendChild(errorMsg);
            element.style.borderColor = '#ff9800';
        } else if (state === 'success' && message === '') {
            group.classList.add('success-field');
            element.style.borderColor = '#4caf50';
            element.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)';
        }
    }

    getErrors() {
        return this.errors;
    }

    hasErrors() {
        return Object.keys(this.errors).length > 0;
    }

    showErrorSummary() {
        if (!this.hasErrors()) return;

        const errorList = Object.entries(this.errors)
            .map(([field, message]) => `• ${message}`)
            .join('\n');

        const summary = `
❌ ERORI GĂSITE:

${errorList}

Vă rog completați toate câmpurile obligatorii!
        `;

        alert(summary);
    }

    showToastError(message) {
        this.showToast(message, 'error');
    }

    showToastWarning(message) {
        this.showToast(message, 'warning');
    }

    showToastSuccess(message) {
        this.showToast(message, 'success');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `form-toast form-toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${this.getToastIcon(type)}</span>
                <span class="toast-message">${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
        `;

        document.body.appendChild(toast);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    getToastIcon(type) {
        const icons = {
            error: '❌',
            warning: '⚠️',
            success: '✅',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    scrollToFirstError() {
        const firstErrorField = Object.keys(this.errors)[0];
        if (firstErrorField) {
            const element = document.getElementById(firstErrorField);
            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                element.focus();
            }
        }
    }
}

// ==========================================
// GLOBAL VALIDATOR INSTANCE
// ==========================================

const formValidator = new FormValidator();

// ==========================================
// ATTACH VALIDATION TO ALL FORM FIELDS
// ==========================================

function attachFieldValidation() {
    const fields = document.querySelectorAll('input[id], select[id], textarea[id]');

    fields.forEach(field => {
        const fieldId = field.id;

        // Validate on blur
        field.addEventListener('blur', function() {
            formValidator.validateField(fieldId, this.value);
        });

        // Real-time validation while typing
        field.addEventListener('input', function() {
            // Debounce: validate after user stops typing for 500ms
            clearTimeout(field.validationTimeout);
            field.validationTimeout = setTimeout(() => {
                formValidator.validateField(fieldId, this.value);
            }, 500);
        });

        // Validate on change (for select)
        field.addEventListener('change', function() {
            formValidator.validateField(fieldId, this.value);
        });

        // Clear old error on focus
        field.addEventListener('focus', function() {
            const group = this.closest('.form-group');
            if (group) {
                group.classList.remove('error-field', 'warning-field');
                const errorMsg = group.querySelector('.field-error-message');
                if (errorMsg) errorMsg.remove();
            }
        });
    });
}

// ==========================================
// INVOICE-SPECIFIC VALIDATION
// ==========================================

function validateInvoiceBeforeSave() {
    const invoiceForm = document.getElementById('invoiceForm');
    if (!invoiceForm) return true;

    // Clear previous errors
    formValidator.errors = {};
    formValidator.warnings = {};

    // Validate all fields
    const fields = invoiceForm.querySelectorAll('input[id], select[id], textarea[id]');
    fields.forEach(field => {
        formValidator.validateField(field.id, field.value);
    });

    // Validate items
    const itemRows = document.querySelectorAll('.invoice-item-row');
    if (itemRows.length === 0) {
        formValidator.showToastError('❌ Trebuie să adăugați cel puțin un articol!');
        return false;
    }

    // Check for items with errors
    let itemsValid = true;
    itemRows.forEach((row, index) => {
        const desc = row.querySelector('input[class*="description"], input[class*="desc"]')?.value || '';
        const qty = parseFloat(row.querySelector('input[class*="quantity"], input[class*="qty"]')?.value || 0);
        const price = parseFloat(row.querySelector('input[class*="price"]')?.value || 0);

        if (!desc || desc.trim() === '') {
            formValidator.showToastError(`❌ Articol ${index + 1}: Descrierea este obligatorie!`);
            itemsValid = false;
        }
        if (qty <= 0) {
            formValidator.showToastError(`❌ Articol ${index + 1}: Cantitatea trebuie > 0!`);
            itemsValid = false;
        }
        if (price < 0) {
            formValidator.showToastError(`❌ Articol ${index + 1}: Prețul nu poate fi negativ!`);
            itemsValid = false;
        }
    });

    if (!itemsValid) return false;

    // Show summary if errors
    if (formValidator.hasErrors()) {
        formValidator.showErrorSummary();
        formValidator.scrollToFirstError();
        return false;
    }

    // Show success
    formValidator.showToastSuccess('✅ Validare OK! Factura se salvează...');
    return true;
}

// ==========================================
// QUOTE-SPECIFIC VALIDATION
// ==========================================

function validateQuoteBeforeSave() {
    const quoteForm = document.getElementById('quoteForm');
    if (!quoteForm) return true;

    // Clear previous errors
    formValidator.errors = {};
    formValidator.warnings = {};

    // Validate all fields
    const fields = quoteForm.querySelectorAll('input[id], select[id], textarea[id]');
    fields.forEach(field => {
        formValidator.validateField(field.id, field.value);
    });

    // Validate items
    const itemRows = document.querySelectorAll('.quote-item-row');
    if (itemRows.length === 0) {
        formValidator.showToastError('❌ Trebuie să adăugați cel puțin un articol!');
        return false;
    }

    // Check for items with errors
    let itemsValid = true;
    itemRows.forEach((row, index) => {
        const desc = row.querySelector('input[class*="description"], input[class*="desc"]')?.value || '';
        const qty = parseFloat(row.querySelector('input[class*="quantity"], input[class*="qty"]')?.value || 0);
        const price = parseFloat(row.querySelector('input[class*="price"]')?.value || 0);

        if (!desc || desc.trim() === '') {
            formValidator.showToastError(`❌ Articol ${index + 1}: Descrierea este obligatorie!`);
            itemsValid = false;
        }
        if (qty <= 0) {
            formValidator.showToastError(`❌ Articol ${index + 1}: Cantitatea trebuie > 0!`);
            itemsValid = false;
        }
        if (price < 0) {
            formValidator.showToastError(`❌ Articol ${index + 1}: Prețul nu poate fi negativ!`);
            itemsValid = false;
        }
    });

    if (!itemsValid) return false;

    // Show summary if errors
    if (formValidator.hasErrors()) {
        formValidator.showErrorSummary();
        formValidator.scrollToFirstError();
        return false;
    }

    // Show success
    formValidator.showToastSuccess('✅ Validare OK! Oferta se salvează...');
    return true;
}

// ==========================================
// ATTACH VALIDATION ON FORM SUBMIT
// ==========================================

function attachFormValidation() {
    const invoiceForm = document.getElementById('invoiceForm');
    const quoteForm = document.getElementById('quoteForm');

    if (invoiceForm) {
        invoiceForm.addEventListener('submit', function(e) {
            if (!validateInvoiceBeforeSave()) {
                e.preventDefault();
                return false;
            }
        });
    }

    if (quoteForm) {
        quoteForm.addEventListener('submit', function(e) {
            if (!validateQuoteBeforeSave()) {
                e.preventDefault();
                return false;
            }
        });
    }
}

// ==========================================
// CUSTOMER TYPE TOGGLE
// ==========================================

/**
 * Toggle between CUI (company) and CNP (individual) fields
 * @param {string} formType - 'invoice' or 'quote'
 */
function toggleClientTypeFields(formType) {
    const prefix = formType === 'invoice' ? 'invoice' : 'quote';
    const typeSelect = document.getElementById(`${prefix}ClientType`);
    const cuiRow = document.getElementById(`${prefix}CUIRow`);
    const cnpRow = document.getElementById(`${prefix}CNPRow`);
    const cuiField = document.getElementById(`${prefix}ClientCUI`);
    const cnpField = document.getElementById(`${prefix}ClientCNP`);
    
    if (!typeSelect || !cuiRow || !cnpRow) return;
    
    const type = typeSelect.value;
    
    if (type === 'firma') {
        // Show CUI, hide CNP
        cuiRow.style.display = 'flex';
        cnpRow.style.display = 'none';
        cuiField.removeAttribute('disabled');
        cnpField.setAttribute('disabled', 'disabled');
        cnpField.value = '';
    } else if (type === 'persoana') {
        // Show CNP, hide CUI
        cuiRow.style.display = 'none';
        cnpRow.style.display = 'flex';
        cnpField.removeAttribute('disabled');
        cuiField.setAttribute('disabled', 'disabled');
        cuiField.value = '';
    } else {
        // Hide both
        cuiRow.style.display = 'flex';
        cnpRow.style.display = 'none';
        cuiField.removeAttribute('disabled');
        cnpField.setAttribute('disabled', 'disabled');
    }
}

// ==========================================
// INITIALIZE ON LOAD
// ==========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        attachFieldValidation();
        attachFormValidation();
    });
} else {
    attachFieldValidation();
    attachFormValidation();
}
