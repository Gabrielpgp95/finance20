/**
 * eFactura PDF Generator
 * Generates official ANAF eFactura format PDF (1:1 replica)
 */

function downloadEfacturaPDF(invoiceId) {
    try {
        const invoice = invoices.find(i => i.id === invoiceId);
        if (!invoice) {
            alert('❌ Factura nu a fost găsită');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'mm', 'A4');

        // Get client data
        let clientData;
        if (invoice.clientData && invoice.clientData.name) {
            clientData = invoice.clientData;
        } else {
            const client = clients.find(c => c.id === invoice.clientId);
            clientData = client || {};
        }

        const bizInfo = invoice.businessInfo || businessInfo;

        // ==========================================
        // OFFICIAL eFactura ANAF FORMAT (EXACT REPLICA)
        // ==========================================

        // Page setup
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 10;
        let y = margin;

        // Colors - ANAF Official
        const black = [0, 0, 0];
        const darkGray = [51, 51, 51];
        const mediumGray = [128, 128, 128];
        const lightGray = [200, 200, 200];
        const tableBorder = [0, 0, 0];

        // ==========================================
        // THREE COLUMN HEADER (Vanzator | RO eFactura | Cumparator)
        // ==========================================
        
        const colWidth = (pageWidth - 2*margin) / 3;
        
        // Helper to normalize text (avoid accidental line breaks/spaces)
        const normalizeText = (value) => {
            const text = String(value || '').replace(/\s+/g, ' ').trim();
            return text.replace(/\s*@\s*/g, '@');
        };

        const lineHeight = 4;

        // LEFT COLUMN - VANZATOR
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...black);
        doc.text('VANZATOR', margin, y);
        
        let leftY = y + 4;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        
        const supplierInfo = [
            ['Identificator', bizInfo.cui || ''],
            ['Denumire', bizInfo.name || ''],
            ['Nume', bizInfo.name || ''],
            ['Nr. inregistrare', bizInfo.regCom || ''],
            ['Informatii juridice', ''],
            ['Strada', bizInfo.address || ''],
            ['Oras', bizInfo.city || ''],
            ['Cod', ''],
            ['Regiune', bizInfo.county || ''],
            ['Tara', 'RO'],
            ['Adresa', ''],
            ['Persoana de contact', ''],
            ['Telefon', bizInfo.phone || ''],
            ['E-mail', bizInfo.email || '']
        ];
        
        supplierInfo.forEach(([label, value]) => {
            doc.setFont('helvetica', 'normal');
            doc.text(label, margin, leftY);
            doc.setFont('helvetica', 'bold');
            const valueX = margin + 36;
            const normalizedValue = normalizeText(value);
            const lines = doc.splitTextToSize(normalizedValue, colWidth - 38);
            if (lines.length > 0 && lines[0]) {
                doc.text(lines, valueX, leftY);
            }
            leftY += Math.max(1, lines.length) * lineHeight;
        });
        
        // CENTER COLUMN - RO eFactura
        const centerX = margin + colWidth;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('RO eFactura', centerX + colWidth/2, y + 10, { align: 'center' });
        
        let centerY = y + 18;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        
        const invoiceInfo = [
            ['Nr. factura', invoice.invoiceNumber || ''],
            ['Codul tipului', '380'],
            ['Data emitere', invoice.issueDate || ''],
            ['Data scadenta', invoice.dueDate || ''],
            ['Perioada', ''],
            ['Moneda facturii', 'RON'],
            ['Moneda contabilizare', ''],
            ['Data de exigibilitate', '']
        ];
        
        invoiceInfo.forEach(([label, value]) => {
            doc.setFont('helvetica', 'normal');
            doc.text(label, centerX + 2, centerY);
            doc.setFont('helvetica', 'bold');
            const normalizedValue = normalizeText(value);
            const centerLines = doc.splitTextToSize(normalizedValue, colWidth - 40);
            if (centerLines.length > 0 && centerLines[0]) {
                doc.text(centerLines, centerX + 36, centerY);
            }
            centerY += Math.max(1, centerLines.length) * lineHeight;
        });
        
        // RIGHT COLUMN - CUMPARATOR
        const rightX = margin + 2*colWidth;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('CUMPARATOR', rightX, y);
        
        let rightY = y + 4;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        
        const clientType = clientData.type || 'firma';
        const buyerInfo = [
            ['Denumire', clientData.name || ''],
            ['', (clientType === 'persoana_fizica' && clientData.cnp) ? clientData.cnp : (clientData.cui || '')],
            ['Strada', clientData.address || ''],
            ['Oras', clientData.city || ''],
            ['Cod', ''],
            ['Regiune', clientData.county || ''],
            ['Tara', 'RO'],
            ['Nume', clientData.name || ''],
            ['Nr. inregistrare', clientData.regCom || ''],
            ['Adresa electronica', clientData.email || ''],
            ['Identificator fiscal', (clientType === 'persoana_fizica' && clientData.cnp) ? clientData.cnp : (clientData.cui || '')],
            ['Persoana de contact', ''],
            ['Telefon', clientData.phone || ''],
            ['E-mail', clientData.email || '']
        ];
        
        buyerInfo.forEach(([label, value]) => {
            if (label) {
                doc.setFont('helvetica', 'normal');
                doc.text(label, rightX, rightY);
                doc.setFont('helvetica', 'bold');
                const normalizedValue = normalizeText(value);
                const lines = doc.splitTextToSize(normalizedValue, colWidth - 38);
                if (lines.length > 0 && lines[0]) {
                    doc.text(lines, rightX + 36, rightY);
                }
                rightY += Math.max(1, lines.length) * lineHeight;
            } else {
                doc.setFont('helvetica', 'bold');
                const normalizedValue = normalizeText(value);
                const lines = doc.splitTextToSize(normalizedValue, colWidth - 2);
                if (lines.length > 0 && lines[0]) {
                    doc.text(lines, rightX, rightY);
                }
                rightY += Math.max(1, lines.length) * lineHeight;
            }
        });

        y = Math.max(leftY, centerY, rightY) + 5;

        // ==========================================
        // TOTALS TABLE (Top Section)
        // ==========================================

        // Draw border box
        doc.setDrawColor(...tableBorder);
        doc.setLineWidth(0.5);
        const totalsBoxHeight = 26;
        doc.rect(margin, y, pageWidth - 2*margin, totalsBoxHeight);

        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...black);

        // Calculate totals
        const invoiceItems = invoice.items || [];
        let subtotal = 0;
        invoiceItems.forEach(item => {
            subtotal += (item.quantity || 0) * (item.price || 0);
        });
        
        const vatRate = invoiceItems[0]?.vat || 19;
        const vatAmount = subtotal * (vatRate / 100);
        const total = subtotal + vatAmount;

        // Column headers
        const totalsHeaders = [
            'TOTAL NET',
            'VALOARE TOTALA fara TVA',
            'VALOARE TOTALA cu TVA',
            'TOTAL DEDUCERI',
            'TOTAL TAXE\nSUPLIMENTARE',
            'SUMA PLATITA',
            'VALOARE DE\nROTUNJIRE'
        ];
        
        const totalsValues = [
            subtotal.toFixed(2),
            subtotal.toFixed(2),
            total.toFixed(2),
            '',
            '',
            '',
            ''
        ];

        const totalsColWidth = (pageWidth - 2*margin) / totalsHeaders.length;
        let totalsX = margin;

        // Draw vertical lines and content
        totalsHeaders.forEach((header, i) => {
            if (i > 0) {
                doc.line(totalsX, y, totalsX, y + 20);
            }
            
            // Header (multi-line support)
            const headerLines = doc.splitTextToSize(header, totalsColWidth - 2);
            let headerY = y + 4;
            headerLines.forEach(line => {
                doc.text(line, totalsX + totalsColWidth/2, headerY, { align: 'center' });
                headerY += 2.6;
            });
            
            // Value
            if (totalsValues[i]) {
                doc.text(totalsValues[i], totalsX + totalsColWidth/2, y + totalsBoxHeight - 5, { align: 'center' });
            }
            
            totalsX += totalsColWidth;
        });

        // Horizontal separator
        doc.line(margin, y + 12, pageWidth - margin, y + 12);

        // VAT rate indicator
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(`Cota TVA: ${vatRate}%`, margin + 2, y + totalsBoxHeight + 4);

        y += totalsBoxHeight + 8;

        // TOTAL PLATA row
        doc.setDrawColor(...tableBorder);
        doc.rect(margin, y, pageWidth - 2*margin, 8);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL PLATA', margin + 2, y + 5);
        doc.text(total.toFixed(2), pageWidth - margin - 2, y + 5, { align: 'right' });

        y += 13;

        // ==========================================
        // VAT DETAILS SECTION (DETALIERE TVA)
        // ==========================================

        // (Removed TOTAL 0.00 RON line as requested)

        // DETALIERE TVA header
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('DETALIERE TVA', margin, y);

        y += 5;

        // VAT table
        doc.setDrawColor(...tableBorder);
        doc.setLineWidth(0.5);
        
        const vatTableY = y;
        const vatTableHeight = 15;
        doc.rect(margin, vatTableY, pageWidth - 2*margin, vatTableHeight);

        // VAT table headers
        const vatHeaders = ['Codul categoriei de0', 'Cota TVA', 'Valoare TVA', 'Codul motiv/Motivul scutirii'];
        const vatColWidths = [40, 20, 30, 100];
        let vatX = margin;

        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        
        vatHeaders.forEach((header, i) => {
            if (i > 0) {
                doc.line(vatX, vatTableY, vatX, vatTableY + vatTableHeight);
            }
            doc.text(header, vatX + 2, vatTableY + 4);
            vatX += vatColWidths[i];
        });

        // VAT table separator
        doc.line(margin, vatTableY + 6, pageWidth - margin, vatTableY + 6);

        // VAT table values
        doc.setFont('helvetica', 'normal');
        vatX = margin;
        
        doc.text(subtotal.toFixed(2), vatX + 2, vatTableY + 11);
        vatX += vatColWidths[0];
        doc.text(`${vatRate}%`, vatX + 2, vatTableY + 11);
        vatX += vatColWidths[1];
        doc.text(vatAmount.toFixed(2), vatX + 2, vatTableY + 11);
        vatX += vatColWidths[2];
        doc.text('', vatX + 2, vatTableY + 11);

        y = vatTableY + vatTableHeight + 5;

        // ==========================================
        // ITEMS TABLE (Products/Services)
        // ==========================================

        // Table header
        doc.setDrawColor(...tableBorder);
        doc.setLineWidth(0.5);
        
        const itemsTableY = y;
        doc.rect(margin, itemsTableY, pageWidth - 2*margin, 8);
        
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...black);

        const itemHeaders = [
            'Linia',
            'Nume articol',
            'Descriere articol',
            'Tara\nprovenienta',
            'Pretul net al\narticulului',
            'Moneda',
            'Cantitate de baza',
            'Cantitate\nfacturata',
            'UM',
            'Cota\nTVA',
            'Valoare neta'
        ];
        
        const itemColWidths = [8, 20, 30, 12, 15, 12, 15, 15, 10, 10, 15];
        let itemX = margin;

        itemHeaders.forEach((header, i) => {
            if (i > 0) {
                doc.line(itemX, itemsTableY, itemX, itemsTableY + 8);
            }
            
            const headerLines = header.split('\n');
            let headerY = itemsTableY + 3;
            headerLines.forEach(line => {
                doc.text(line, itemX + itemColWidths[i]/2, headerY, { align: 'center' });
                headerY += 2.5;
            });
            
            itemX += itemColWidths[i];
        });

        y = itemsTableY + 8;

        // Table rows
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);

        invoiceItems.forEach((item, index) => {
            const nameLines = doc.splitTextToSize(item.description || '', itemColWidths[1] - 2);
            const descLines = doc.splitTextToSize(item.description || '', itemColWidths[2] - 2);
            const lineCount = Math.max(1, nameLines.length, descLines.length);
            const rowHeight = 4.5 * lineCount;

            // Check if we need a new page
            if (y + rowHeight > pageHeight - 20) {
                doc.addPage();
                y = margin;

                // Page header to confirm items belong to the same invoice
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9);
                doc.setTextColor(...black);
                doc.text(`RO eFactura - Nr. ${invoice.invoiceNumber || ''} (continuare)`, margin, y);
                y += 6;

                // Redraw items table header on new page
                doc.setDrawColor(...tableBorder);
                doc.setLineWidth(0.5);
                doc.rect(margin, y, pageWidth - 2*margin, 8);
                doc.setFontSize(6);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(...black);

                itemX = margin;
                itemHeaders.forEach((header, i) => {
                    if (i > 0) {
                        doc.line(itemX, y, itemX, y + 8);
                    }
                    const headerLines = header.split('\n');
                    let headerY = y + 3;
                    headerLines.forEach(line => {
                        doc.text(line, itemX + itemColWidths[i]/2, headerY, { align: 'center' });
                        headerY += 2.5;
                    });
                    itemX += itemColWidths[i];
                });
                y += 8;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7);
            }

            // Draw cell borders
            doc.setDrawColor(...tableBorder);
            doc.setLineWidth(0.1);

            itemX = margin;
            itemColWidths.forEach(width => {
                doc.rect(itemX, y, width, rowHeight);
                itemX += width;
            });

            // Cell content
            itemX = margin;

            // Linia (Nr.)
            doc.text(String(index + 1), itemX + itemColWidths[0]/2, y + 3.5, { align: 'center' });
            itemX += itemColWidths[0];

            // Nume articol
            doc.text(nameLines, itemX + 1, y + 3.5);
            itemX += itemColWidths[1];

            // Descriere articol
            doc.text(descLines, itemX + 1, y + 3.5);
            itemX += itemColWidths[2];

            // Tara provenienta (empty)
            itemX += itemColWidths[3];

            // Pretul net al articolului
            doc.text((item.price || 0).toFixed(2), itemX + itemColWidths[4] - 1, y + 3.5, { align: 'right' });
            itemX += itemColWidths[4];

            // Moneda
            doc.text('RON', itemX + itemColWidths[5]/2, y + 3.5, { align: 'center' });
            itemX += itemColWidths[5];

            // Cantitate de baza (empty)
            itemX += itemColWidths[6];

            // Cantitate facturata
            doc.text(String(item.quantity || 0), itemX + itemColWidths[7]/2, y + 3.5, { align: 'center' });
            itemX += itemColWidths[7];

            // UM
            doc.text(item.unit || 'buc', itemX + itemColWidths[8]/2, y + 3.5, { align: 'center' });
            itemX += itemColWidths[8];

            // Cota TVA
            doc.text(String(item.vat || 19), itemX + itemColWidths[9]/2, y + 3.5, { align: 'center' });
            itemX += itemColWidths[9];

            // Valoare neta
            const itemTotal = (item.quantity || 0) * (item.price || 0);
            doc.text(itemTotal.toFixed(2), itemX + itemColWidths[10] - 1, y + 3.5, { align: 'right' });

            y += rowHeight;
        });

        y += 10;

        // ==========================================
        // FOOTER - Page Number
        // ==========================================

        const footerY = pageHeight - 10;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...mediumGray);
        doc.text('Pagina', pageWidth/2 - 10, footerY);
        doc.setFont('helvetica', 'bold');
        doc.text('1', pageWidth/2, footerY);
        doc.setFont('helvetica', 'normal');
        doc.text('din', pageWidth/2 + 5, footerY);
        doc.setFont('helvetica', 'bold');
        doc.text('1', pageWidth/2 + 12, footerY);

        // ==========================================
        // SAVE PDF
        // ==========================================

        const fileName = `eFactura_${invoice.invoiceNumber || 'invoice'}.pdf`;
        doc.save(fileName);
        
        if (typeof showToast === 'function') {
            showToast(`✅ eFactura PDF descărcată: ${fileName}`, 'success');
        }

        console.log('✅ eFactura PDF generated successfully');

    } catch (error) {
        console.error('Error generating eFactura PDF:', error);
        alert('❌ Eroare la generarea eFactura PDF: ' + error.message);
    }
}
