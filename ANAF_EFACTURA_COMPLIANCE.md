# 🏛️ ANAF eFactura - Reguli de Conformitate România

## Descriere Generală
Sistemul de facturare a fost configurat cu validări ANAF eFactura pentru a asigura conformitatea deplină cu standardele de e-facturare în România.

---

## ✅ Validări Obligatorii - ERORI FATALE

Următoarele validări vor **bloca salvarea facturii** dacă nu sunt îndeplinite:

### 📋 Date Firmă (Emitent)
- **Nume Firmă**: Obligatoriu
- **CUI**: Obligatoriu și trebuie format `RO` + 8-10 cifre
  - Exemplu corect: `RO12345678`
  - Exemplu incorect: `12345678` (fără RO prefix)
- **Adresă**: Obligatoriu (stradă, număr, bloc, apartament)
- **Oraș**: Obligatoriu
- **Județ/Sector**: Obligatoriu (ex: Sector 1, Bihor, Cluj, etc.)
- **Cod Poștal**: Obligatoriu (format: 6 cifre)

### 👤 Date Client (Plătitor)
- **Nume Client**: Obligatoriu
- **Adresă**: Obligatoriu (stradă, număr, bloc, apartament)
- **Oraș**: Obligatoriu
- **Județ/Sector**: Obligatoriu
- **Cod Poștal**: Obligatoriu (format: 6 cifre)

### 📦 Articole/Servicii
- Trebuie să existe **cel puțin 1 articol** pe factură
- Fiecare articol trebuie să aibă:
  - **Descriere**: Obligatoriu (nu se poate lăsa gol)
  - **Cantitate**: Trebuie > 0
  - **Preț**: Nu poate fi negativ

### 💰 Calcule și Totale
- **TVA %**: Nu poate fi negativ (0-100% sunt valide)
- **Reducere %**: Trebuie între 0-100%
- **Total**: Nu poate fi negativ
- Totalul trebuie calculat corect: `(Subtotal - Reducere) + TVA`

### 📅 Date
- **Data Facturii**: Obligatoriu
- **Data Scadență**: Obligatoriu
- **Data Scadență trebuie după Data Facturii**: Validare comparație

### 💳 Metoda de Plată
- Obligatoriu a selecta o metodă de plată
- Opțiuni valide:
  - Transfer Bancar
  - Numerar
  - Card
  - Cec

### 🔢 Numărul Facturii
- Format obligatoriu: `SERIE-YYYYMM-SEQUENCE`
  - Exemplu: `INV-202601-0001`
  - SERIE: Prefixul seriei (ex: INV, FAC, etc.)
  - YYYYMM: An și lună în format numeric
  - SEQUENCE: Număr secvențial (4+ cifre)

---

## ⚠️ Validări Recomandate - AVERTISMENTE

Următoarele validări vor **afișa avertismente** dar vor permite salvarea:

### 💳 Date Financiare Client
- **IBAN**: Recomandat a fi completat
  - Format corect pentru România: `RO` + 2 cifre + 4 litere + numere
  - Exemplu: `RO49AAAA1B31007593840000`
- **Bancă**: Recomandat (pentru ușurință în plăți)

### 🏦 Date Financiare Firmă
- **IBAN**: Recomandat a fi completat
- **Bancă**: Recomandat a fi completat

### 📧 Contact
- **Email Firmă**: Dacă este completat, trebuie să fie format valid
  - Validare: `nume@domeniu.ro`
- **Email Client**: Dacă este completat, trebuie să fie format valid

### 🆔 Informații Identificare
- **CUI/CNP Client**: Recomandat
  - Format CUI: `RO` + 8-10 cifre
  - Format CNP: 13 cifre

---

## 📋 Câmpuri Suportate pentru eFactura

### Firmă (Emitent)
- Nume
- Email
- Telefon
- Adresă completă
- CUI/CIF
- Nr. Registru Comerțului
- Oraș
- Județ
- Cod Poștal
- IBAN
- Bancă

### Client (Plătitor)
- Nume
- CUI/CNP
- Nr. Registru Comerțului
- Adresă
- Oraș
- Județ
- Cod Poștal
- Telefon
- Email
- IBAN
- Bancă

### Factură
- Numărul facturii
- Data emiterii
- Data scadenței
- Articole cu descriere, cantitate, preț
- Subtotal
- Reducere (%)
- Taxă/TVA (%)
- Suma finală
- Metoda de plată
- Termeni de plată
- Note/Observații

---

## 🔄 Fluxul de Conformitate

1. **Completare Date Obligatorii**
   - Completezi toate câmpurile marcate cu "Obligatoriu"
   - Sistemul validează în timp real

2. **Validare ANAF**
   - La salvare, sistemul rulează validări complete
   - Dacă sunt ERORI: **Factura nu se salvează** - corectezi și încerci din nou
   - Dacă sunt AVERTISMENTE: Poți continua, dar îți recomandă completări

3. **Generare Automată**
   - Numărul facturii se generează automat dacă nu-l completezi
   - Format: `INV-YYYYMM-SEQUENCE`
   - Paginarea este automată și secvențială

4. **Stocare și Audit**
   - Factura se salvează în localStorage și pe server
   - Se ține evidență cu data creării, actualizării, și validare ANAF
   - Se păstrează audit trail cu acțiuni și validări

---

## 📝 Mesajele de Validare

### Exemplu - ERORI (Blocante)
```
❌ ERORI CONFORMITATE ANAF eFactura:

1. CUI: obligatoriu pentru e-factură
2. Adresă firmă: obligatoriu
3. Articole: trebuie să adauge cel puțin un articol

⚠️ Corectează aceste erori înainte de a salva factura.
```

### Exemplu - AVERTISMENTE (Non-blocante)
```
⚠️ AVERTISMENTE ANAF:

1. IBAN: recomandat a fi completat
2. Email firmă: format invalid

✓ Poți continua, dar verifică aceste probleme potențiale.
```

---

## 🔐 Audit Trail

Fiecare factură păstrează:
- ✅ Data creării
- ✅ Data actualizării
- ✅ Utilizator (current_user)
- ✅ Ștampila validării ANAF
- ✅ Lista erorilor și avertismentelor
- ✅ Ștampila e-facturii (dacă a fost transmisă)

---

## 📊 Exemple de Facturi Valide

### Factură de Bază - Validă
```
Firmă: SC Example SRL
CUI: RO12345678
Client: Acme Corporation
CUI Client: RO87654321

Articles:
- Serviciu consultație: 1 x 500 RON = 500 RON
- Produsul X: 2 x 250 RON = 500 RON

Subtotal: 1000 RON
Reducere: 0%
TVA 19%: 190 RON
Total: 1190 RON

Data: 31.01.2026
Scadență: 28.02.2026
Plată: Transfer Bancar
```

### Factură cu Reducere - Validă
```
Subtotal: 1000 RON
Reducere: 10%
Subtotal după reducere: 900 RON
TVA 19%: 171 RON
Total: 1071 RON
```

---

## ❌ Exemple de Erori Comune

### Eroare #1: CUI Greșit Format
```
❌ INCORECT: CUI: 12345678 (fără RO)
✅ CORECT: CUI: RO12345678
```

### Eroare #2: Cod Poștal Gol
```
❌ INCORECT: Cod Poștal: [gol]
✅ CORECT: Cod Poștal: 010101
```

### Eroare #3: Data Scadență Înainte de Emitere
```
❌ INCORECT: Data: 31.01.2026, Scadență: 30.01.2026
✅ CORECT: Data: 31.01.2026, Scadență: 28.02.2026
```

### Eroare #4: Articol fără Descriere
```
❌ INCORECT: Descriere: [gol], Cant: 1, Preț: 100
✅ CORECT: Descriere: Serviciu X, Cant: 1, Preț: 100
```

### Eroare #5: TVA Negativ
```
❌ INCORECT: TVA: -5%
✅ CORECT: TVA: 19%
```

---

## 📞 Contactare ANAF

Pentru informații suplimentare despre e-facturare:
- 🌐 Website: [portal.anaf.ro](https://portal.anaf.ro)
- 📧 Email: [contact@anaf.ro](mailto:contact@anaf.ro)
- ☎️ Telefon: 021.208.01.00 / 0800 800 800

---

## 📚 Versiune Document

- **Versiune**: 1.0
- **Data**: 31.01.2026
- **Sistem**: Facturable Pro - eFactura Romania Module
- **Compatibilitate**: ANAF eFactura 2024+

---

**🔒 Importanță**: Respectarea acestor reguli asigură acceptarea facturilor de către ANAF și evitează amenzile pentru non-conformitate.
