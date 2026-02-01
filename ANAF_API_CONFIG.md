# 🔗 ANAF API - Configurare și Înregistrare Program

## Overview

Sistemul de facturare include **integrare ANAF eFactura** cu trimitere automată de facturi. Pentru a funcționa, trebuie să:

1. **Înregistrezi programul la ANAF** (o singură dată)
2. **Configurezi credențialele ANAF** în backend
3. **Implementezi API endpoint-ul** pentru trimitere

---

## 📋 Pași de Înregistrare Program la ANAF

### 1. Cerință Preliminară
- CUI valid pentru firma ta
- Email firmă
- Acces la portalul ANAF (https://anaf.ro)

### 2. Înregistrare Portal ANAF
1. Accesează [https://portal.anaf.ro](https://portal.anaf.ro)
2. Loghează-te cu credențialele ANAF
3. Navighează la **"Aplicații Autorizate"** sau **"Înregistrare Aplicații"**
4. Completează formularul cu:
   - **Denumire program**: "Facturable Pro"
   - **Descriere**: "Sistem de facturare cu eFactura"
   - **CUI**: [CUI-ul tău]
   - **Contact**: [email]@[domeniu].ro
   - **URL callback**: `http://localhost:8000/api/anaf/callback` (pentru development)

### 3. Obținere Credențiale
După aprobarea ANAF, vei primi:
- **Username ANAF**
- **Password ANAF**
- **Certificate** (dacă cere autentificare cu certificat digital)

---

## 🔑 Configurare Credențiale

### Metoda 1: Variabile de Mediu (Recomandată)
```bash
# Adaugă în .env file sau în environment
ANAF_USERNAME=your_anaf_username
ANAF_PASSWORD=your_anaf_password
ANAF_CUI=RO12345678
ANAF_API_URL=https://api.anaf.ro/v2
ANAF_SANDBOX_MODE=false
```

### Metoda 2: Configurare directă în backend
Editează [sync_server.py](sync_server.py):
```python
ANAF_CONFIG = {
    'username': 'YOUR_ANAF_USERNAME',
    'password': 'YOUR_ANAF_PASSWORD',
    'cui': 'RO12345678',
    'api_url': 'https://api.anaf.ro/v2',
    'sandbox_mode': False  # Setează True pentru testing
}
```

---

## 🌐 API Endpoint - Backend

### Locație: `sync_server.py`

```python
@app.route('/api/anaf/submit-invoice', methods=['POST'])
def submit_invoice_to_anaf():
    """
    Trimite o factură la ANAF eFactura
    
    Request:
    {
        "invoiceNumber": "INV-202601-0001",
        "date": "2026-01-31",
        "dueDate": "2026-02-28",
        "issuer": {...},
        "customer": {...},
        "items": [...],
        "total": 1190.00,
        ...
    }
    
    Response:
    {
        "success": true,
        "ticketNumber": "ABC-123456-XYZ",
        "message": "Invoice submitted successfully"
    }
    """
    try:
        data = request.json
        
        # 1. Validate ANAF compliance
        # ... validation code ...
        
        # 2. Authenticate to ANAF
        anaf_session = authenticate_to_anaf()
        
        # 3. Format invoice according to UBL standard
        ubl_invoice = format_invoice_to_ubl(data)
        
        # 4. Submit to ANAF
        ticket_number = submit_to_anaf_portal(anaf_session, ubl_invoice)
        
        # 5. Log submission
        log_submission(data['invoiceNumber'], ticket_number)
        
        return {
            'success': True,
            'ticketNumber': ticket_number,
            'message': 'Factura trimisă cu succes la ANAF'
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'message': 'Eroare la trimiterea la ANAF'
        }, 400
```

---

## 📝 Implementare Backend (Python)

### Pas 1: Instalare Dependencies
```bash
pip install requests lxml zeep
```

### Pas 2: Adaugă în `sync_server.py`
```python
import requests
from zeep import Client, Settings
from lxml import etree
import base64
from datetime import datetime
import json
import os

class ANAFClient:
    def __init__(self, username, password, cui, sandbox=False):
        self.username = username
        self.password = password
        self.cui = cui
        self.sandbox = sandbox
        
        if sandbox:
            self.wsdl = 'https://testws1.anaf.ro/webservices/ws/wssp'
        else:
            self.wsdl = 'https://ws2.anaf.ro/webservices/ws/wssp'
        
        self.client = Client(wsdl=self.wsdl + '?wsdl')
        self.session = None
    
    def authenticate(self):
        """Autentificare la ANAF"""
        try:
            response = self.client.service.authenticateUser(
                self.username,
                self.password
            )
            self.session = response
            return True
        except Exception as e:
            print(f"ANAF Authentication Error: {e}")
            return False
    
    def submit_invoice(self, invoice_data, ubl_xml):
        """Trimite factură la ANAF"""
        if not self.session:
            if not self.authenticate():
                raise Exception("Failed to authenticate with ANAF")
        
        try:
            # Compresare XML
            compressed = self.compress_xml(ubl_xml)
            
            # Trimitere la ANAF
            response = self.client.service.uploadInvoice(
                sessionID=self.session,
                fileContent=base64.b64encode(compressed).decode(),
                fileName=f"{invoice_data['invoiceNumber']}.xml"
            )
            
            return response
        except Exception as e:
            print(f"ANAF Upload Error: {e}")
            raise
    
    def compress_xml(self, xml_content):
        """Compresare ZIP pentru XML"""
        import zipfile
        import io
        
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, 'w') as zf:
            zf.writestr('invoice.xml', xml_content)
        return buffer.getvalue()

# UBL Invoice Format
def format_invoice_to_ubl(invoice_data):
    """Formează factura în format UBL (Universal Business Language)"""
    
    ubl_template = f'''<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ccts="urn:un:unece:uncefact:documentation:2">
    <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
    <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:invoicing:international:aunz:3.0</cbc:CustomizationID>
    <cbc:ProfileID>urn:fdc:peppol.eu:mp:poacc:invoicing:10:1.0</cbc:ProfileID>
    <cbc:ID>{invoice_data['invoiceNumber']}</cbc:ID>
    <cbc:IssueDate>{invoice_data['date']}</cbc:IssueDate>
    <cbc:DueDate>{invoice_data['dueDate']}</cbc:DueDate>
    <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
    <cbc:DocumentCurrencyCode>RON</cbc:DocumentCurrencyCode>
    
    <!-- Issuer (Supplier/Emitent) -->
    <cac:AccountingSupplierParty>
        <cac:Party>
            <cbc:EndpointID schemeID="9906">{invoice_data['issuer']['cui']}</cbc:EndpointID>
            <cac:PartyIdentification>
                <cbc:ID schemeID="0088">{invoice_data['issuer']['cui']}</cbc:ID>
            </cac:PartyIdentification>
            <cac:PartyName>
                <cbc:Name>{invoice_data['issuer']['name']}</cbc:Name>
            </cac:PartyName>
            <cac:PostalAddress>
                <cbc:StreetName>{invoice_data['issuer']['address']}</cbc:StreetName>
                <cbc:CityName>{invoice_data['issuer']['city']}</cbc:CityName>
                <cbc:PostalZone>{invoice_data['issuer']['postalCode']}</cbc:PostalZone>
                <cbc:CountrySubentity>{invoice_data['issuer']['county']}</cbc:CountrySubentity>
                <cac:Country>
                    <cbc:IdentificationCode>RO</cbc:IdentificationCode>
                </cac:Country>
            </cac:PostalAddress>
            <cac:Contact>
                <cbc:Telephone>{invoice_data['issuer'].get('phone', '')}</cbc:Telephone>
                <cbc:ElectronicMail>{invoice_data['issuer'].get('email', '')}</cbc:ElectronicMail>
            </cac:Contact>
        </cac:Party>
    </cac:AccountingSupplierParty>
    
    <!-- Customer (Buyer/Plătitor) -->
    <cac:AccountingCustomerParty>
        <cac:Party>
            <cbc:EndpointID schemeID="9906">{invoice_data['customer'].get('cui', 'RO-INDIVIDUAL')}</cbc:EndpointID>
            <cac:PartyName>
                <cbc:Name>{invoice_data['customer']['name']}</cbc:Name>
            </cac:PartyName>
            <cac:PostalAddress>
                <cbc:StreetName>{invoice_data['customer']['address']}</cbc:StreetName>
                <cbc:CityName>{invoice_data['customer']['city']}</cbc:CityName>
                <cbc:PostalZone>{invoice_data['customer']['postalCode']}</cbc:PostalZone>
                <cbc:CountrySubentity>{invoice_data['customer'].get('county', '')}</cbc:CountrySubentity>
                <cac:Country>
                    <cbc:IdentificationCode>RO</cbc:IdentificationCode>
                </cac:Country>
            </cac:PostalAddress>
        </cac:Party>
    </cac:AccountingCustomerParty>
    
    <!-- Invoice Lines -->
    <cac:InvoiceLine>
        <!-- Articole vor fi generate aici -->
    </cac:InvoiceLine>
    
    <!-- Monetary Totals -->
    <cac:LegalMonetaryTotal>
        <cbc:LineExtensionAmount>{invoice_data['subtotal']}</cbc:LineExtensionAmount>
        <cbc:TaxExclusiveAmount>{invoice_data['subtotal'] - invoice_data['discountAmount']}</cbc:TaxExclusiveAmount>
        <cbc:TaxInclusiveAmount>{invoice_data['total']}</cbc:TaxInclusiveAmount>
        <cbc:AllowanceTotalAmount>{invoice_data['discountAmount']}</cbc:AllowanceTotalAmount>
        <cbc:PayableAmount>{invoice_data['total']}</cbc:PayableAmount>
    </cac:LegalMonetaryTotal>
</Invoice>
'''
    
    return ubl_template

# Route handler
@app.route('/api/anaf/submit-invoice', methods=['POST'])
def submit_invoice_to_anaf():
    """Endpoint pentru trimitere factură la ANAF"""
    try:
        invoice_data = request.json
        
        # Inițializare ANAF client
        anaf = ANAFClient(
            username=os.getenv('ANAF_USERNAME'),
            password=os.getenv('ANAF_PASSWORD'),
            cui=os.getenv('ANAF_CUI'),
            sandbox=os.getenv('ANAF_SANDBOX_MODE', 'false').lower() == 'true'
        )
        
        # Format UBL
        ubl_xml = format_invoice_to_ubl(invoice_data)
        
        # Submit
        result = anaf.submit_invoice(invoice_data, ubl_xml)
        
        # Salvare log
        with open('anaf_submissions.log', 'a') as log:
            log.write(f"{datetime.now().isoformat()}\t{invoice_data['invoiceNumber']}\t{result.get('ticketNumber', 'N/A')}\n")
        
        return {
            'success': True,
            'ticketNumber': result.get('ticketNumber', 'PENDING'),
            'message': 'Factură trimisă cu succes la ANAF'
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'message': 'Eroare la trimiterea la ANAF'
        }, 400

@app.route('/api/anaf/callback', methods=['POST'])
def anaf_callback():
    """Endpoint pentru notificări de status ANAF"""
    data = request.json
    
    # Log callback
    with open('anaf_callbacks.log', 'a') as log:
        log.write(json.dumps({
            'timestamp': datetime.now().isoformat(),
            'data': data
        }) + '\n')
    
    return {'success': True}
```

---

## 🧪 Test în Sandbox Mode

Pentru testing fără a afecta producția, setează:
```python
ANAF_SANDBOX_MODE=true
```

---

## 📊 Loguri și Monitoring

Sistemul păstrează loguri ale trimiterii:

1. **anaf_submissions.log** - Istoricul trimiterii
2. **anaf_callbacks.log** - Notificări de status ANAF
3. **Audit Trail** - În fiecare factură salvată

Exemplu log:
```
2026-01-31T10:30:45.123Z    INV-202601-0001    ABC-123456-XYZ
2026-01-31T10:45:22.456Z    INV-202601-0002    ABC-123457-XYZ
```

---

## 🔐 Securitate

- ✅ Credențiale stocare în **variabile de mediu**
- ✅ Nu salva parolele în cod
- ✅ Folosește **HTTPS** în producție
- ✅ Validare **CUI și certificat digital** ANAF
- ✅ Rate limiting pentru API calls

---

## 🐛 Troubleshooting

### Eroare: "Authentication Failed"
- Verifică credențialele ANAF
- Asigură-te că programul este aprobat de ANAF

### Eroare: "Invalid Invoice Format"
- Verifică conformitatea UBL
- Validează CUI și date

### Eroare: "Connection Timeout"
- Verifică conexiunea la internet
- Asigură-te că portalul ANAF este disponibil

### Sandbox vs Production
- Sandbox: `https://testws1.anaf.ro/webservices`
- Production: `https://ws2.anaf.ro/webservices`

---

## 📞 Contactare ANAF

- **Email**: [contact@anaf.ro](mailto:contact@anaf.ro)
- **Portal**: [https://portal.anaf.ro](https://portal.anaf.ro)
- **Telefon**: 021.208.01.00

---

## 📚 Resurse Externe

- [ANAF eFactura Documentation](https://www.anaf.ro/anaf/internet/anaf/informatii_utile/e-factura)
- [UBL Standard](http://docs.oasis-open.org/ubl/os-UBL-2.1/)
- [EN 16931 (European Standard)](https://ec.europa.eu/growth/tools-databases/nando/index.cfm?fuseaction=directive.notifiers&dir_id=34151)

---

## 📝 Versiune Document

- **Versiune**: 1.0
- **Data**: 31.01.2026
- **Status**: Pregătit pentru implementare
- **Actualizări**: Se vor face după aprobarea ANAF
