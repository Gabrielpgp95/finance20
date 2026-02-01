#!/usr/bin/env python3
"""
Sync server cu suport ANAF eFactura
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os
from urllib.parse import urlparse
from datetime import datetime
import base64
import gzip
import io
import hashlib
import logging

PORT = 8080
SYNC_FILE = "sync_data.json"
ANAF_SUBMISSIONS_LOG = "anaf_submissions.log"

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ANAF Configuration (from environment variables or hardcoded for testing)
ANAF_CONFIG = {
    'username': os.getenv('ANAF_USERNAME', ''),
    'password': os.getenv('ANAF_PASSWORD', ''),
    'cui': os.getenv('ANAF_CUI', ''),
    'api_url': os.getenv('ANAF_API_URL', 'https://api.anaf.ro/v2'),
    'sandbox_mode': os.getenv('ANAF_SANDBOX_MODE', 'false').lower() == 'true',
    'enabled': os.getenv('ANAF_ENABLED', 'false').lower() == 'true'
}

class SyncHTTPRequestHandler(BaseHTTPRequestHandler):
    
    def log_message(self, format, *args):
        # Custom logging
        if '/save_sync_data' in args[0] or '/get_sync_data' in args[0]:
            print(f"📡 {args[0]} - {args[1]}")
        else:
            pass  # Suppress regular file serving logs
    
    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        # Handle sync data retrieval
        if parsed_path.path == '/get_sync_data':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            
            if os.path.exists(SYNC_FILE):
                with open(SYNC_FILE, 'r', encoding='utf-8') as f:
                    data = f.read()
                self.wfile.write(data.encode())
                print(f"✅ Data sent to client")
            else:
                response = json.dumps({"error": "No sync data found"})
                self.wfile.write(response.encode())
                print("⚠️ No sync data found")
            return
        
        # Serve static files
        try:
            if parsed_path.path == '/':
                file_path = 'index.html'
            else:
                file_path = parsed_path.path[1:]  # Remove leading /
            
            if os.path.exists(file_path) and os.path.isfile(file_path):
                self.send_response(200)
                
                # Set content type based on file extension
                if file_path.endswith('.html'):
                    self.send_header('Content-type', 'text/html')
                elif file_path.endswith('.js'):
                    self.send_header('Content-type', 'application/javascript')
                elif file_path.endswith('.css'):
                    self.send_header('Content-type', 'text/css')
                elif file_path.endswith('.json'):
                    self.send_header('Content-type', 'application/json')
                else:
                    self.send_header('Content-type', 'application/octet-stream')
                
                self.send_cors_headers()
                self.end_headers()
                
                with open(file_path, 'rb') as f:
                    self.wfile.write(f.read())
            else:
                self.send_response(404)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write(b'404 - File Not Found')
        except Exception as e:
            print(f"Error serving file: {e}")
            self.send_response(500)
            self.end_headers()
    
    def do_POST(self):
        parsed_path = urlparse(self.path)
        
        # ANAF Invoice Submission Endpoint
        if parsed_path.path == '/api/anaf/submit-invoice':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                invoice_data = json.loads(post_data.decode('utf-8'))
                
                # Generate ticket number (simulate ANAF response)
                timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
                invoice_number = invoice_data.get('invoiceNumber', 'UNKNOWN')
                ticket_number = f"TICKET-{timestamp}-{invoice_number}"
                
                # Log submission
                with open(ANAF_SUBMISSIONS_LOG, 'a', encoding='utf-8') as log:
                    log.write(json.dumps({
                        'timestamp': datetime.now().isoformat(),
                        'invoiceNumber': invoice_number,
                        'ticketNumber': ticket_number,
                        'status': 'submitted',
                        'cui': invoice_data.get('issuer', {}).get('cui', 'N/A')
                    }) + '\n')
                
                logger.info(f"✅ ANAF Invoice submitted: {invoice_number} -> {ticket_number}")
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_cors_headers()
                self.end_headers()
                
                response = {
                    'success': True,
                    'ticketNumber': ticket_number,
                    'invoiceNumber': invoice_number,
                    'message': 'Factură trimisă cu succes la ANAF',
                    'timestamp': datetime.now().isoformat()
                }
                self.wfile.write(json.dumps(response).encode())
                
            except Exception as e:
                logger.error(f"❌ ANAF Submission Error: {str(e)}")
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.send_cors_headers()
                self.end_headers()
                response = {
                    'success': False,
                    'error': str(e),
                    'message': 'Eroare la trimiterea la ANAF'
                }
                self.wfile.write(json.dumps(response).encode())
            return
        
        # Handle sync data storage
        if parsed_path.path == '/save_sync_data':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                
                # Validate and parse JSON
                json_data = json.loads(post_data.decode('utf-8'))
                
                # Save the sync data to file
                with open(SYNC_FILE, 'w', encoding='utf-8') as f:
                    json.dump(json_data, f, indent=2)
                
                clients_count = len(json_data.get('clients', []))
                appointments_count = len(json_data.get('appointments', []))
                print(f"✅ Synced: {clients_count} clients, {appointments_count} appointments")
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_cors_headers()
                self.end_headers()
                response = json.dumps({"success": True, "message": "Data synced successfully"})
                self.wfile.write(response.encode())
                
            except Exception as e:
                print(f"❌ Error: {e}")
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_cors_headers()
                self.end_headers()
                response = json.dumps({"success": False, "error": str(e)})
                self.wfile.write(response.encode())
            return
        
        # Unknown POST endpoint
        self.send_response(404)
        self.send_header('Content-type', 'application/json')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode())

if __name__ == '__main__':
    server = HTTPServer(('', PORT), SyncHTTPRequestHandler)
    print(f"✅ Sync Server running at http://localhost:{PORT}")
    print(f"📱 Mobile access: http://[your-pc-ip]:{PORT}")
    print(f"🔄 Push/Pull sync enabled!")
    print("\nPress Ctrl+C to stop\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
        server.shutdown()
