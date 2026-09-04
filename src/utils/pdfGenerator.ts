import jsPDF from 'jspdf';
import { RentalOrder, BusinessProfile } from '../types';

export const generateRentalContractPdf = (
  rental: RentalOrder,
  business: BusinessProfile
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 18;

  // Header Banner
  doc.setFillColor(22, 101, 52); // Brand green #166534
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(business.name.toUpperCase(), margin, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(business.slogan || 'Contrato de Renta y Servicios de Mobiliario', margin, 18);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`CONTRATO: ${rental.folio}`, pageWidth - margin, 14, { align: 'right' });

  // Status & Date info box
  y = 32;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha de Emisión: ${new Date(rental.createdAt).toLocaleDateString('es-MX')}`, margin, y);
  doc.text(`Estado: ${rental.status.toUpperCase()}`, pageWidth - margin, y, { align: 'right' });

  // Two columns: Business Info & Client Info
  y += 7;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, (pageWidth - margin * 2) / 2 - 2, 34, 2, 2, 'FD');
  doc.roundedRect(margin + (pageWidth - margin * 2) / 2 + 2, y, (pageWidth - margin * 2) / 2 - 2, 34, 2, 2, 'FD');

  // Left: Arrendador (Empresa)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52);
  doc.text('DATOS DEL ARRENDADOR', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.text(`Empresa: ${business.name}`, margin + 4, y + 12);
  doc.text(`RFC/ID: ${business.rfcOrTaxId || 'N/A'}`, margin + 4, y + 17);
  doc.text(`Tel/WhatsApp: ${business.phone}`, margin + 4, y + 22);
  doc.text(`Dirección: ${business.address}`, margin + 4, y + 27, { maxWidth: 80 });

  // Right: Arrendatario (Cliente)
  const rightColX = margin + (pageWidth - margin * 2) / 2 + 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52);
  doc.text('DATOS DEL CLIENTE / EVENTO', rightColX, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.text(`Cliente: ${rental.clientName}`, rightColX, y + 12);
  doc.text(`Teléfono: ${rental.clientPhone}`, rightColX, y + 17);
  doc.text(`Evento: ${rental.eventName || 'Renta de Mobiliario'}`, rightColX, y + 22);
  doc.text(`Lugar: ${rental.eventLocation || rental.clientAddress}`, rightColX, y + 27, { maxWidth: 80 });

  // Event Logistics bar
  y += 38;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 14, 2, 2, 'F');
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`📅 Fecha Inicio: ${rental.startDate} ${rental.deliveryTime ? '(' + rental.deliveryTime + ')' : ''}`, margin + 4, y + 6);
  doc.text(`🔄 Fecha Recolección: ${rental.endDate} ${rental.pickupTime ? '(' + rental.pickupTime + ')' : ''}`, margin + 95, y + 6);
  
  if (rental.eventNotes) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Notas de entrega: ${rental.eventNotes}`, margin + 4, y + 11, { maxWidth: pageWidth - margin * 2 - 8 });
  }

  // Items Table Header
  y += 19;
  doc.setFillColor(22, 101, 52);
  doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('CÓDIGO', margin + 3, y + 4.5);
  doc.text('DESCRIPCIÓN DEL MOBILIARIO', margin + 25, y + 4.5);
  doc.text('CANT.', margin + 105, y + 4.5, { align: 'center' });
  doc.text('P. UNITARIO', margin + 135, y + 4.5, { align: 'right' });
  doc.text('SUBTOTAL', pageWidth - margin - 3, y + 4.5, { align: 'right' });

  // Items Rows
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8);

  rental.items.forEach((item, index) => {
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, pageWidth - margin * 2, 6, 'F');
    }
    doc.text(item.furnitureCode || '-', margin + 3, y + 4.2);
    doc.text(item.furnitureName, margin + 25, y + 4.2, { maxWidth: 75 });
    doc.text(String(item.quantity), margin + 105, y + 4.2, { align: 'center' });
    doc.text(`$${item.unitPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, margin + 135, y + 4.2, { align: 'right' });
    doc.text(`$${item.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, pageWidth - margin - 3, y + 4.2, { align: 'right' });
    y += 6;
  });

  // Financial Breakdown Box
  y += 3;
  const breakX = pageWidth - margin - 70;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(breakX, y, 70, 36, 1.5, 1.5, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal Mobiliario:', breakX + 4, y + 5);
  doc.text(`$${rental.itemsSubtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, pageWidth - margin - 4, y + 5, { align: 'right' });

  doc.text('Flete / Transporte:', breakX + 4, y + 10);
  doc.text(`$${rental.deliveryFee.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, pageWidth - margin - 4, y + 10, { align: 'right' });

  if (rental.setupFee > 0) {
    doc.text('Montaje / Maniobra:', breakX + 4, y + 15);
    doc.text(`$${rental.setupFee.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, pageWidth - margin - 4, y + 15, { align: 'right' });
  }

  if (rental.discount > 0) {
    doc.text('Descuento:', breakX + 4, y + 20);
    doc.text(`-$${rental.discount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, pageWidth - margin - 4, y + 20, { align: 'right' });
  }

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(22, 101, 52);
  doc.text('TOTAL A PAGAR:', breakX + 4, y + 26);
  doc.text(`$${rental.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, pageWidth - margin - 4, y + 26, { align: 'right' });

  doc.setFontSize(8);
  doc.setTextColor(220, 38, 38);
  doc.text(`Depósito Garantía (Fianza): $${rental.guaranteeDeposit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, breakX + 4, y + 31);
  doc.setTextColor(30, 41, 59);
  doc.text(`Saldo Pendiente: $${rental.balanceDue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, breakX + 4, y + 35);

  // Terms and conditions
  y += 40;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52);
  doc.text('TÉRMINOS, CONDICIONES Y RESPONSABILIDAD:', margin, y);

  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(6.5);
  const terms = doc.splitTextToSize(business.termsAndConditions, pageWidth - margin * 2);
  doc.text(terms, margin, y);

  // Digital Signature section
  y += terms.length * 3 + 6;
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(margin + 15, y + 22, margin + 75, y + 22);
  doc.line(pageWidth - margin - 75, y + 22, pageWidth - margin - 15, y + 22);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('POR LA EMPRESA', margin + 45, y + 27, { align: 'center' });
  doc.text('FIRMA DE CONFORMIDAD DEL CLIENTE', pageWidth - margin - 45, y + 27, { align: 'center' });

  if (rental.signedByName) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`Nombre: ${rental.signedByName}`, pageWidth - margin - 45, y + 31, { align: 'center' });
    if (rental.signedAt) {
      doc.text(`Firmado digitalmente: ${new Date(rental.signedAt).toLocaleString('es-MX')}`, pageWidth - margin - 45, y + 35, { align: 'center' });
    }
  }

  // Draw signature image if present
  if (rental.signatureDataUrl) {
    try {
      doc.addImage(rental.signatureDataUrl, 'PNG', pageWidth - margin - 65, y, 40, 20);
    } catch (e) {
      console.warn('Could not render signature on PDF', e);
    }
  }

  // Footer note
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text(`Documento digital sin papel generado por ${business.name} | Folio ${rental.folio}`, pageWidth / 2, 290, { align: 'center' });

  // Save / Download PDF
  doc.save(`Contrato_${rental.folio}_${rental.clientName.replace(/\s+/g, '_')}.pdf`);
};

export const generateDeliveryChecklistPdf = (
  rental: RentalOrder,
  business: BusinessProfile
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 18;

  // Header Banner
  doc.setFillColor(30, 64, 175); // Blue #1e40af for logistics
  doc.rect(0, 0, pageWidth, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('HOJA DE RUTA Y ENTREGA DE MOBILIARIO', margin, 12);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${business.name} | Logística & Operaciones`, margin, 18);
  doc.text(`FOLIO: ${rental.folio}`, pageWidth - margin, 14, { align: 'right' });

  // Delivery target box
  y = 28;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`📍 DESTINO: ${rental.eventLocation || rental.clientAddress}`, margin + 4, y + 7);
  doc.text(`👤 CLIENTE: ${rental.clientName} (Tel: ${rental.clientPhone})`, margin + 4, y + 13);
  doc.text(`🕒 HORA ENTREGA: ${rental.deliveryTime || 'A acordar'} | 📅 FECHA: ${rental.startDate}`, margin + 4, y + 19);
  doc.text(`🔄 HORA RECOLECCIÓN: ${rental.pickupTime || 'A acordar'} | 📅 FECHA: ${rental.endDate}`, margin + 4, y + 25);

  // Check items table
  y = 62;
  doc.setFillColor(30, 64, 175);
  doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('ESTADO', margin + 3, y + 4.5);
  doc.text('CÓDIGO', margin + 22, y + 4.5);
  doc.text('ARTÍCULO A ENTREGAR', margin + 48, y + 4.5);
  doc.text('CANTIDAD', margin + 130, y + 4.5, { align: 'center' });
  doc.text('CHECK ENTREGA', margin + 155, y + 4.5);
  doc.text('CHECK RETORNO', pageWidth - margin - 3, y + 4.5, { align: 'right' });

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8);

  rental.items.forEach((item, index) => {
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, pageWidth - margin * 2, 8, 'F');
    }
    doc.text('[ OK ]', margin + 3, y + 5.5);
    doc.text(item.furnitureCode || '-', margin + 22, y + 5.5);
    doc.text(item.furnitureName, margin + 48, y + 5.5, { maxWidth: 75 });
    doc.setFont('helvetica', 'bold');
    doc.text(`${item.quantity} pzas`, margin + 130, y + 5.5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.rect(margin + 160, y + 2, 4, 4); // Checkbox entrega
    doc.rect(pageWidth - margin - 15, y + 2, 4, 4); // Checkbox retorno
    y += 8;
  });

  // Notes
  y += 10;
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 25, 2, 2);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('OBSERVACIONES DE ENTREGA O CONDICIÓN FÍSICA:', margin + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(rental.eventNotes || 'Sin notas especiales.', margin + 4, y + 13, { maxWidth: pageWidth - margin * 2 - 8 });

  // Signatures
  y += 35;
  doc.line(margin + 15, y + 20, margin + 75, y + 20);
  doc.line(pageWidth - margin - 75, y + 20, pageWidth - margin - 15, y + 20);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('CHOFER / REPARTIDOR', margin + 45, y + 25, { align: 'center' });
  doc.text('RECIBE DE CONFORMIDAD (CLIENTE)', pageWidth - margin - 45, y + 25, { align: 'center' });

  doc.save(`Hoja_Entrega_${rental.folio}.pdf`);
};
