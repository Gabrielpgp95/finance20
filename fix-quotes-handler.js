// Handler pentru tabul Oferte - cu traduceri în limba română
// Reparare pentru tab-ul "Oferte" și inițializare formular ofertă

(function() {
    // Așteptăm ca DOM și app.js să se încarce complet
    document.addEventListener('DOMContentLoaded', function() {
        // Asigurăm că globalele sunt disponibile
        if (typeof clients === 'undefined' || typeof renderQuotations === 'undefined') {
            console.log('⏳ Se așteaptă încărcarea app.js...');
            setTimeout(arguments.callee, 500);
            return;
        }

        console.log('✅ Inițializare Handler Tabul Oferte');
        
        // Adăugăm handler pentru click pe butonul Oferte
        const quotesBtn = document.getElementById('quotesBtn');
        if (quotesBtn) {
            quotesBtn.addEventListener('click', function(e) {
                e.preventDefault();
                // Eliminăm clasa active de la toate tab-urile
                document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
                
                // Adăugăm clasa active la tab-ul curent și secțiunea Oferte
                this.classList.add('active');
                const quotationsSection = document.getElementById('quotationsSection');
                if (quotationsSection) {
                    quotationsSection.classList.add('active');
                    
                    // Afișăm lista de oferte
                    if (typeof renderQuotations === 'function') {
                        renderQuotations();
                        console.log('✅ Lista de oferte afișată');
                    }
                    
                    // Ascundem FAB pe mobile
                    const fabContainer = document.querySelector('.fab-container');
                    if (fabContainer && window.innerWidth <= 768) {
                        fabContainer.classList.add('hidden');
                    }
                }
            });
        }
        
        // Adăugăm handler pentru click pe "Creează Ofertă"
        const addQuoteBtn = document.getElementById('addQuoteBtn');
        if (addQuoteBtn) {
            addQuoteBtn.addEventListener('click', function() {
                // Populez select-ul de clienți
                populateQuoteClientSelect();
                // Deschid modal pentru crearea ofertei
                if (typeof openQuoteModal === 'function') {
                    openQuoteModal();
                    console.log('✅ Modal creație ofertă deschis');
                }
            });
        }
        
        // Funcție pentru a popula select-ul de clienți în formular
        function populateQuoteClientSelect() {
            const select = document.getElementById('quoteClient');
            if (!select) return;
            
            select.innerHTML = '<option value="">-- Selectează Client --</option>';
            
            if (typeof clients !== 'undefined' && Array.isArray(clients)) {
                clients.forEach(client => {
                    const option = document.createElement('option');
                    option.value = client.id;
                    option.textContent = client.name + ' (' + (client.email || 'fără email') + ')';
                    select.appendChild(option);
                });
                console.log('✅ ' + clients.length + ' clienți încărcați în select');
            }
        }
        
        // Acoperim funcția openQuoteModal pentru a popula întotdeauna select-ul
        const originalOpenQuoteModal = window.openQuoteModal;
        if (typeof originalOpenQuoteModal === 'function') {
            window.openQuoteModal = function(quoteId) {
                populateQuoteClientSelect();
                return originalOpenQuoteModal.call(this, quoteId);
            };
        }
        
        console.log('✅ Handler Tabul Oferte - Inițializare reușită');
    });
})();
