# 📌 Ghid Rapid - Buton Trimite ANAF

## 🎯 Cum Funcționează?

### 1️⃣ Locația Butonului
- Deschide o **Factură** din listă
- Modalul de detalii se deschide cu o **bara laterală VIOLET** pe stânga
- În bara laterală găsești butonul **"▶ Trimite ANAF"**

### 2️⃣ Ce se întâmplă când apesi butonul?

```
APESI BUTON
    ↓
VALIDARE ANAF (automat)
    ↓
TRIMITERE LA API
    ↓
AȘTEPTARE RĂSPUNS
    ↓
✅ BIFĂ + TICKET NUMBER (dacă succes)
❌ EROARE (dacă problem)
```

### 3️⃣ Stări Posibile

#### 🟢 TRIMISĂ ✅
```
Status: TRIMISĂ
Trimisă: 31.01.2026
Ticket: TICKET-20260131103045-INV-202601-0001
```
- Factura a fost trimisă cu succes la ANAF
- Poți verifica statusul pe portalul ANAF cu ticket-ul

#### 🔴 EROARE ❌
```
Status: EROARE
Eroare: Factura nu este conformă ANAF
```
- Se afișează motivul erorii
- Corectează datele și încearcă din nou

#### ⚫ AȘTEPTARE ⏳
```
Status: Neprocessată
```
- Nicio trimitere încă
- Apasă butonul pentru a trimite

---

## ⚙️ Configurare ANAF

### Pasul 1: Obținere Credențiale ANAF
1. Accesează [https://portal.anaf.ro](https://portal.anaf.ro)
2. Înregistrează programul tău
3. Obții: **Username**, **Password**, **CUI**

### Pasul 2: Configurare Environment

**Pentru Windows (PowerShell):**
```powershell
$env:ANAF_USERNAME = "your_username"
$env:ANAF_PASSWORD = "your_password"
$env:ANAF_CUI = "RO12345678"
$env:ANAF_ENABLED = "true"
$env:ANAF_SANDBOX_MODE = "false"
```

**Pentru Linux/Mac (Bash):**
```bash
export ANAF_USERNAME=your_username
export ANAF_PASSWORD=your_password
export ANAF_CUI=RO12345678
export ANAF_ENABLED=true
export ANAF_SANDBOX_MODE=false
```

### Pasul 3: Restart Server
```bash
python sync_server.py  # Port 8080 pentru ANAF API
```

---

## 🧪 Mode Test (Sandbox)

Înainte de a folosi în producție, testează cu:
```bash
$env:ANAF_SANDBOX_MODE = "true"
```

Factura se va trimite la **test portal ANAF**, nu la producție.

---

## 🔍 Verificare Trimitere

### 1. Bifă verde ✅
- Butonul devine verde
- Se vede "TRIMISĂ" în sidebar
- Se afișează data trimiterii

### 2. Ticket Number
- Primești un number de ticket: `TICKET-20260131-INV-202601-0001`
- Salvezi acest number
- Il folosești pe portalul ANAF pentru a verifica statusul

### 3. Log Automat
- Fiecare trimitere se salvează în `anaf_submissions.log`
- Puteți verifica istoric pe server

---

## 🛟 Troubleshooting

### "Butonul nu se activează"
- ✓ Verifica dacă sunt completate TOATE câmpurile obligatorii
- ✓ Verifica dacă sunt articole pe factură
- ✓ Verifica dacă CUI-ul este format corect (RO + 8-10 cifre)

### "Eroare la trimitere - API indisponibil"
- ✓ Verifică conexiunea la internet
- ✓ Asigură-te că credențialele ANAF sunt setate
- ✓ Verifică dacă portalul ANAF nu este în mentenanță

### "Bifă nu apare după trimitere"
- ✓ Verifică consolă (F12) pentru erori
- ✓ Refreshează pagina (F5)
- ✓ Deschide din nou factura

---

## 📊 API Details (pentru dezvoltatori)

### Endpoint
```
POST http://localhost:8000/api/anaf/submit-invoice
```

### Request
```json
{
    "invoiceNumber": "INV-202601-0001",
    "date": "2026-01-31",
    "dueDate": "2026-02-28",
    "issuer": {
        "name": "Firma Ta",
        "cui": "RO12345678",
        "address": "Str. X, Nr. 1",
        "city": "București",
        "county": "Sector 1",
        "postalCode": "010101"
    },
    "customer": {
        "name": "Client",
        "cui": "RO87654321",
        "address": "Str. Y, Nr. 2",
        "city": "Cluj",
        "county": "Cluj",
        "postalCode": "400001"
    },
    "items": [
        {
            "description": "Serviciu",
            "quantity": 1,
            "price": 100,
            "total": 100
        }
    ],
    "total": 119
}
```

### Response (Success)
```json
{
    "success": true,
    "ticketNumber": "TICKET-20260131-INV-202601-0001",
    "message": "Factură trimisă cu succes la ANAF"
}
```

### Response (Error)
```json
{
    "success": false,
    "error": "CUI client invalid",
    "message": "Eroare la trimiterea la ANAF"
}
```

---

## 📋 Checklist Înainte de Trimitere

- ☑️ Nume Firmă completat
- ☑️ CUI Firmă: RO + 8-10 cifre
- ☑️ Adresă, Oraș, Județ, Cod Poștal firma
- ☑️ Nume Client completat
- ☑️ Adresă, Oraș, Județ, Cod Poștal client
- ☑️ Cel puțin 1 articol cu descriere, cantitate > 0, preț ≥ 0
- ☑️ TVA % valid (0-100)
- ☑️ Data scadență > data emiterii
- ☑️ Metoda plată selectată
- ☑️ Credențiale ANAF configurate
- ☑️ Conexiune internet disponibilă

---

## 📞 Suport

- 📖 Vezi [ANAF_API_CONFIG.md](ANAF_API_CONFIG.md) pentru detalii tehnice
- 🏛️ Vezi [ANAF_EFACTURA_COMPLIANCE.md](ANAF_EFACTURA_COMPLIANCE.md) pentru reguli
- 📧 Contact ANAF: [contact@anaf.ro](mailto:contact@anaf.ro)

---

## ✅ Gata!

Acum poți:
1. ✅ Crea facturi conforme ANAF
2. ✅ Trimite la ANAF direct din aplicație
3. ✅ Verifica statusul cu ticket number
4. ✅ Menține evidență completa cu audit trail

**Succes în facturare! 🚀**
