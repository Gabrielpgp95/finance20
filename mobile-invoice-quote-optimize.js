/**
 * MOBILE OPTIMIZATION FOR INVOICE & QUOTE MODALS
 * Optimizări specifice pentru dispozitive mobile:
 * - Scroll smooth în modals
 * - Resize modals pentru landscape
 * - Close on outside click (cu debounce)
 * - Keyboard handling
 * - Touch gestures (swipe-down to close)
 */

// ==========================================
// MODAL MOBILE INITIALIZATION
// ==========================================

function initializeModalMobileOptimizations() {
    const isMobile = window.innerWidth <= 768;
    
    if (!isMobile) return;

    // ========== PREVENT BODY SCROLL WHEN MODAL OPEN ==========
    document.addEventListener('modalopen', function(e) {
        document.body.style.overflow = 'hidden';
        document.body.classList.add('modal-open');
    });

    document.addEventListener('modalclose', function(e) {
        document.body.style.overflow = 'auto';
        document.body.classList.remove('modal-open');
    });

    // ========== HANDLE VIEWPORT RESIZE ==========
    window.addEventListener('orientationchange', function() {
        const openModals = document.querySelectorAll('.modal.show');
        openModals.forEach(modal => {
            // Trigger resize event for modals
            setTimeout(() => {
                modal.dispatchEvent(new Event('resize'));
            }, 300);
        });
    });

    // ========== KEYBOARD HANDLING ==========
    document.addEventListener('keydown', function(e) {
        // ESC to close modal
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                closeModal(openModal);
            }
        }

        // Tab navigation through form fields in modal
        if (e.key === 'Tab') {
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                const formElements = openModal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                
                if (formElements.length > 0) {
                    const firstElement = formElements[0];
                    const lastElement = formElements[formElements.length - 1];

                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            lastElement.focus();
                            e.preventDefault();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            firstElement.focus();
                            e.preventDefault();
                        }
                    }
                }
            }
        }
    });

    // ========== TOUCH GESTURE: SWIPE DOWN TO CLOSE ==========
    let touchStartY = 0;
    let touchEndY = 0;
    let touchStartTime = 0;

    document.addEventListener('touchstart', function(e) {
        const openModal = document.querySelector('.modal.show');
        if (openModal && openModal.contains(e.target)) {
            const modalContent = openModal.querySelector('.modal-content');
            // Only track if at top of scroll
            if (modalContent.scrollTop === 0) {
                touchStartY = e.changedTouches[0].screenY;
                touchStartTime = Date.now();
            }
        }
    }, { passive: true });

    document.addEventListener('touchend', function(e) {
        const openModal = document.querySelector('.modal.show');
        if (openModal && openModal.contains(e.target)) {
            touchEndY = e.changedTouches[0].screenY;
            const touchDuration = Date.now() - touchStartTime;
            const swipeDistance = touchEndY - touchStartY;

            // Swipe down more than 60px in less than 500ms
            if (swipeDistance > 60 && touchDuration < 500) {
                closeModal(openModal);
            }
        }
    }, { passive: true });

    // ========== CLOSE ON OUTSIDE CLICK ==========
    let clickStartTime = 0;
    let clickTarget = null;

    document.addEventListener('mousedown', function(e) {
        clickStartTime = Date.now();
        clickTarget = e.target;
    }, true);

    document.addEventListener('click', function(e) {
        // Only treat as click if mouse didn't move (prevent accidental closes)
        if (Date.now() - clickStartTime > 300) return;

        const openModal = document.querySelector('.modal.show');
        if (!openModal) return;

        const modalContent = openModal.querySelector('.modal-content');
        const closeBtn = modalContent.querySelector('.close');

        // Click outside modal content
        if (e.target === openModal || 
            (e.target === clickTarget && !modalContent.contains(e.target))) {
            
            // Don't close if clicking on modal content
            if (!modalContent.contains(e.target) && e.target !== closeBtn) {
                closeModal(openModal);
            }
        }
    });

    // ========== PREVENT ZOOM ON DOUBLE-CLICK ==========
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(e) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    // ========== FOCUS MANAGEMENT ==========
    document.addEventListener('focusin', function(e) {
        const openModal = document.querySelector('.modal.show');
        if (openModal && e.target instanceof HTMLInputElement) {
            // Scroll focused input into view
            setTimeout(() => {
                e.target.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }, 300);
        }
    });

    // ========== AUTO-FOCUS FIRST FIELD ==========
    document.addEventListener('modalopen', function(e) {
        const modal = e.detail?.modal;
        if (modal) {
            const firstInput = modal.querySelector(
                'input:not([type="hidden"]), select, textarea'
            );
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    });
}

// Helper function to close modal
function closeModal(modal) {
    modal.classList.remove('show');
    modal.style.display = 'none';
    
    // Dispatch custom event
    document.dispatchEvent(new CustomEvent('modalclose', { 
        detail: { modal } 
    }));
}

// Helper function to open modal
function openModal(modal) {
    modal.classList.add('show');
    modal.style.display = 'flex';
    
    // Dispatch custom event
    document.dispatchEvent(new CustomEvent('modalopen', { 
        detail: { modal } 
    }));
}

// ==========================================
// FORM OPTIMIZATION FOR MOBILE
// ==========================================

function optimizeFormForMobile() {
    const isMobile = window.innerWidth <= 768;
    
    if (!isMobile) return;

    // ========== SMOOTH SCROLL TO VALIDATION ERRORS ==========
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('invalid', function(e) {
            e.preventDefault();
            
            const firstInvalid = form.querySelector(':invalid');
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                firstInvalid.focus();
                
                // Add visual feedback
                firstInvalid.classList.add('error-highlight');
                setTimeout(() => {
                    firstInvalid.classList.remove('error-highlight');
                }, 2000);
            }
        }, true);
    }

    // ========== PREVENT ZOOM ON INPUT FOCUS ==========
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        // iOS fix: set font-size to 16px to prevent zoom
        input.style.fontSize = '16px';
        
        // Better visual feedback
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });

    // ========== FLOATING LABEL EFFECT (OPTIONAL) ==========
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        const input = group.querySelector('input, select, textarea');
        const label = group.querySelector('label');
        
        if (input && label) {
            // Add class if input has value on load
            if (input.value) {
                group.classList.add('has-value');
            }
            
            input.addEventListener('input', function() {
                if (this.value) {
                    group.classList.add('has-value');
                } else {
                    group.classList.remove('has-value');
                }
            });
        }
    });
}

// ==========================================
// INVOICE/QUOTE MODAL SPECIFIC
// ==========================================

function optimizeInvoiceQuoteModals() {
    const isMobile = window.innerWidth <= 768;
    
    if (!isMobile) return;

    // ========== SMOOTH SCROLL FOR ITEM ROWS ==========
    const addItemButtons = document.querySelectorAll('#addInvoiceItem, #addQuoteItem');
    addItemButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            setTimeout(() => {
                // Scroll to last item
                const itemRows = document.querySelectorAll('.invoice-item-row, .quote-item-row');
                if (itemRows.length > 0) {
                    const lastRow = itemRows[itemRows.length - 1];
                    lastRow.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'end' 
                    });
                }
            }, 100);
        });
    });

    // ========== ANAF SIDEBAR: TOGGLE ON MOBILE ==========
    const anafSidebar = document.querySelector('.invoice-anaf-sidebar');
    const invoiceDetailModal = document.getElementById('invoiceDetailModal');
    
    if (anafSidebar && invoiceDetailModal) {
        const anafTitle = anafSidebar.querySelector('h3');
        if (anafTitle) {
            anafTitle.style.cursor = 'pointer';
            anafTitle.addEventListener('click', function() {
                const details = anafSidebar.querySelectorAll(
                    '#invoiceANAFStatus, #invoiceANAFInfo'
                );
                details.forEach(detail => {
                    detail.style.display = detail.style.display === 'none' ? 'block' : 'none';
                });
            });
        }
    }

    // ========== COLLAPSE BUSINESS INFO SECTIONS ==========
    const businessSections = document.querySelectorAll(
        '.invoice-business-section, fieldset'
    );
    businessSections.forEach(section => {
        const legend = section.querySelector('legend');
        const heading = section.querySelector('h3');
        const trigger = legend || heading;
        
        if (trigger) {
            trigger.style.cursor = 'pointer';
            trigger.style.userSelect = 'none';
            
            const content = section.querySelector('div');
            if (content) {
                trigger.addEventListener('click', function() {
                    content.style.display = content.style.display === 'none' ? 'block' : 'none';
                });
            }
        }
    });

    // ========== CALCULATE TOTALS ON BLUR FOR MOBILE ==========
    const priceInputs = document.querySelectorAll(
        '.invoice-item-row input[class*="price"], .quote-item-row input[class*="price"]'
    );
    priceInputs.forEach(input => {
        input.addEventListener('blur', function() {
            // Trigger calculation
            const form = this.closest('form');
            if (form) {
                // Dispatch change event to trigger calculations
                form.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    });

    // ========== BETTER TEXTAREA RESIZE ==========
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        function autoResize() {
            textarea.style.height = 'auto';
            textarea.style.height = (textarea.scrollHeight) + 'px';
        }
        
        textarea.addEventListener('input', autoResize);
        // Initial resize
        autoResize();
    });
}

// ==========================================
// INITIALIZE ON LOAD
// ==========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initializeModalMobileOptimizations();
        optimizeFormForMobile();
        optimizeInvoiceQuoteModals();
    });
} else {
    initializeModalMobileOptimizations();
    optimizeFormForMobile();
    optimizeInvoiceQuoteModals();
}

// ========== HANDLE RESPONSIVE CHANGES ==========
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        // Reinitialize if crossing mobile/desktop threshold
        if (window.innerWidth <= 768) {
            optimizeFormForMobile();
            optimizeInvoiceQuoteModals();
        }
    }, 250);
});
