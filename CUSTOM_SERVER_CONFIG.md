# ⚙️ Configurare Server Custom (Opțional)

Dacă dorești să folosești un server personalizat pentru sincronizare (nu localhost), poți configura URL-ul serverului.

## 🔧 Cum să configurezi un server custom:

### **Opțiunea 1: Din Console Browser**

1. Deschide aplicația în browser
2. Apasă **F12** pentru a deschide Developer Tools
3. Mergi la tab-ul **Console**
4. Rulează comanda:

```javascript
// Setează URL-ul serverului tău custom
localStorage.setItem('customServerUrl', 'http://YOUR_SERVER_IP:5000');

// Exemplu pentru server pe rețeaua locală
localStorage.setItem('customServerUrl', 'http://192.168.1.100:5000');

// Exemplu pentru server cloud
localStorage.setItem('customServerUrl', 'https://your-app.herokuapp.com');

// Reîncarcă pagina
location.reload();
```

5. Refresh page (F5)
6. Acum butoanele Push/Pull vor folosi serverul tău custom!

### **Opțiunea 2: Resetare la Mod Offline**

```javascript
// Șterge setarea custom
localStorage.removeItem('customServerUrl');

// Reîncarcă pagina
location.reload();
```

---

## 🌍 Exemple de Configurări

### **Server Local în LAN**
```javascript
// Găsește IP-ul PC-ului tău cu: ipconfig (Windows) sau ifconfig (Linux/Mac)
localStorage.setItem('customServerUrl', 'http://192.168.1.50:5000');
```

### **Server Cloud (Heroku, Railway, etc.)**
```javascript
localStorage.setItem('customServerUrl', 'https://my-business-app.herokuapp.com');
```

### **Ngrok Tunnel (pentru testare)**
```javascript
// Rulează: ngrok http 5000
localStorage.setItem('customServerUrl', 'https://abc123.ngrok.io');
```

---

## 🔍 Verificare Configurare

```javascript
// Verifică URL-ul serverului configurat
console.log('Server URL:', localStorage.getItem('customServerUrl') || 'Default (localhost/GitHub Pages)');
```

---

## ⚠️ Important

1. **Server-ul trebuie să ruleze `sync_server.py`**
2. **CORS trebuie configurat corect** pe server pentru domenii externe
3. **HTTPS recomandat** pentru producție (Let's Encrypt gratuit)
4. **GitHub Pages NU poate rula server Python** - doar client-side

---

## 🔐 Securitate

- ⚠️ Nu folosi HTTP pentru date sensibile în producție
- ✅ Folosește HTTPS pentru server-ul tău
- ✅ Implementează autentificare pentru API-ul serverului
- ✅ Restricționează CORS la domenii cunoscute

---

## 📝 Notă

Această setare este **complet opțională**. Aplicația funcționează perfect:
- **Fără server** (localStorage pe GitHub Pages)
- **Cu server local** (autodetectat pe localhost)
- **Cu server custom** (folosind această configurație)
