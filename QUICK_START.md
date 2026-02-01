# 🚀 QUICK START - OFERTE & E-FACTURI

## ⚡ 30 SECUNDE PENTRU A ÎNCEPE:

### **STEP 1: Deschide Oferte (5 sec)**
1. Reîncarcă pagina: `http://localhost:8000`
2. Click pe tabul **"📄 Oferte"** (lângă Facturi)
3. Vei vedea lista de oferte (gol dacă e prima dată)

### **STEP 2: Creează O Ofertă (10 sec)**
1. Click pe **"📋 Creează Ofertă"**
2. Se deschide formular mare
3. Selectează un client din dropdown
4. Adaugă articole (ex: "Serviciu web design", 1, 500)
5. Se calculează automat totalul

### **STEP 3: Salvează (5 sec)**
1. Scroll jos la formular
2. Click **"💾 Salvează Ofertă"**
3. ✅ Mesaj de succes

### **STEP 4: Convertir în Factură (10 sec)**
1. Apare oferta în listă
2. Click pe **"💰 To Invoice"**
3. ✅ Se crează automat o factură

---

## 🎯 CELE 5 ACȚIUNI PRINCIPALE:

| # | Acțiune | Icon | Locație |
|---|---------|------|---------|
| 1 | **Creează Ofertă** | 📋 | Tab Oferte → Buton |
| 2 | **Vezi Ofertă** | 📄 | Card ofertă → View |
| 3 | **Convertir în Factură** | 💰 | Card ofertă → To Invoice |
| 4 | **Descarcă PDF** | 📥 | Preview ofertă → Descarcă PDF |
| 5 | **Șterge Ofertă** | 🗑️ | Card ofertă → Delete |

---

## 🔥 PROBLEME COMUNE & SOLUȚII RAPIDE:

### **❌ Nu văd tab-ul "Oferte"**
**Soluție:** 
- F5 reîncarcă pagina
- Scroll orizontal în meniu dacă e mobile

### **❌ Nu se populează clienții în formular**
**Soluție:**
- Du-te la "Clienți" și creează/adaugă clienți
- Revino la Oferte

### **❌ PDF nu se descarcă**
**Soluție:**
- Verifica dacă browser-ul blochează pop-ups
- Incearcă alt browser
- Asigură-te că oferta are date complete

### **❌ Pagini se suprapun/nu merge click**
**Soluție:**
- F5 hard refresh (Ctrl+Shift+R)
- Clear cache browser
- Restart server: `python -m http.server 8000`

---

## 💡 TIPS & TRICKS:

### **Tip 1: Template de Ofertă Rapidă**
1. Creezi o ofertă cu "Serviciu Web"
2. O copiezi prin edit + save as new

### **Tip 2: Export Multiplu**
1. Ofertă #1 → PDF
2. Ofertă #2 → PDF
3. Trimite ambele unui client

### **Tip 3: Tracking Oferte**
1. Statusuri auto: DRAFT → SENT → ACCEPTED → CONVERTED
2. Știi exact care oferte sunt acceptate

### **Tip 4: Batch Convert**
1. Creezi mai multe oferte într-o ședință
2. Apoi convertești toate în facturi odată

---

## 📋 CHECKLIST SETUP INIȚIAL:

- [ ] 1. Deschis pagina `http://localhost:8000`
- [ ] 2. Click tab "📄 Oferte"
- [ ] 3. Verific că sunt clienți în sistem
- [ ] 4. Crează prima ofertă test
- [ ] 5. Adaug articole test
- [ ] 6. Salvez oferta
- [ ] 7. Fac screenshot
- [ ] 8. Convertir în factură
- [ ] 9. Download PDF test
- [ ] 10. Sunt mulțumit! ✅

---

## 🎓 FLOW SCURT:

```
Ofertă (OFR-202601-001)
        ↓
    CLIENT VEDE
        ↓
    CLIENT ACCEPTĂ
        ↓
    CONVERTIRI ÎN FACTURĂ
        ↓
    Factură (INV-202601-001)
        ↓
    CLIENT PLĂTEȘTE
        ↓
    MARCA PLĂTITĂ ✅
```

---

## 📞 CONTACT RAPID:

**Ai nevoie de ajutor?**
1. Citește: **MANUALOFERTE.md**
2. Verifica: **REZUMAT_IMPLEMENTARE.md**
3. Împ: Console browser (F12)

---

## ✨ READY? START! 🚀

Merge la tabul **📄 Oferte** și creează prima ta ofertă comercială!

**SUCCES!** 💪
