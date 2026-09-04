import { RentalOrder, BusinessProfile } from '../types';

export const cleanPhoneForWhatsApp = (phone: string): string => {
  // Clean special characters
  let clean = phone.replace(/[^0-9]/g, '');
  // Default to Mexico country code +52 if 10 digits
  if (clean.length === 10) {
    clean = '521' + clean;
  }
  return clean;
};

export const createWhatsAppConfirmationMessage = (
  rental: RentalOrder,
  business: BusinessProfile
): string => {
  const itemsText = rental.items
    .map((item) => `• *${item.quantity}x* ${item.furnitureName}`)
    .join('\n');

  const text = `🎉 *¡Hola ${rental.clientName}!*
Te confirmamos tu orden de renta con *${business.name}*.

📋 *Folio:* ${rental.folio}
📅 *Fecha de Entrega:* ${rental.startDate} ${rental.deliveryTime ? '(' + rental.deliveryTime + ')' : ''}
🔄 *Fecha de Recolección:* ${rental.endDate} ${rental.pickupTime ? '(' + rental.pickupTime + ')' : ''}
📍 *Lugar:* ${rental.eventLocation || rental.clientAddress}

📦 *Mobiliario Rentado:*
${itemsText}

💰 *Total Renta:* $${rental.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
💵 *Anticipo Pagado:* $${rental.amountPaid.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
⚠️ *Saldo Pendiente:* $${rental.balanceDue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
🛡️ *Depósito Garantía:* $${rental.guaranteeDeposit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}

_Cualquier duda o cambio de horario estamos a tus órdenes por este medio._ ¡Gracias por tu preferencia!`;

  return encodeURIComponent(text);
};

export const createWhatsAppDeliveryReminderMessage = (
  rental: RentalOrder,
  business: BusinessProfile
): string => {
  const text = `🚚 *¡Hola ${rental.clientName}!*
Te saludamos de *${business.name}*.

Te recordamos que tu entrega de mobiliario está programada para *hoy*:
🕒 *Hora estimada:* ${rental.deliveryTime || 'En breve'}
📍 *Dirección:* ${rental.eventLocation || rental.clientAddress}
📦 *Folio:* ${rental.folio}

⚠️ *Recordatorio de liquidación:* Saldo pendiente al entregar: *$${rental.balanceDue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}* + Depósito: *$${rental.guaranteeDeposit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}*.

¡Nuestro equipo ya está preparando tu pedido!`;

  return encodeURIComponent(text);
};

export const getWhatsAppLink = (phone: string, encodedMessage: string): string => {
  const cleanPhone = cleanPhoneForWhatsApp(phone);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};
