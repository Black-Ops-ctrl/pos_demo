// PrintReceipt.js
export const printReceipt = (receiptData) => {
  const { 
    cartItems, 
    subtotal, 
    discountPercentage, 
    discountAmount, 
    tax, 
    totalAmount, 
    paymentMethod, 
    receivedAmount,
    payback,
    invoiceNo,
    fbrInvoiceNo,
    shopName,
    shopAddress,
    shopPhone
  } = receiptData;

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-GB'); 
  const formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const printWindow = window.open('', '_blank');
  
  const receiptHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt</title>
        <style>
          @page { margin: 0; size: 80mm auto; }
          body {
            margin: 0;
            padding: 2mm;
            width: 80mm;
            font-family: 'Courier New', monospace;
            font-size: 10px;
            font-weight: bold;
            background: white;
          }
          .receipt { width: 100%; max-width: 70mm; margin: 0 auto; }
          .shop-header { text-align: center; margin-bottom: 5px; }
          .shop-name { font-weight: 900; font-size: 18px; text-transform: uppercase; }
          .shop-details { font-size: 11px; line-height: 1.2; }
          .receipt-title {
            text-align: center;
            font-weight: 900;
            font-size: 14px;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            padding: 4px 0;
            margin: 8px 0;
            text-transform: uppercase;
          }
          .info-row { display: flex; justify-content: space-between; padding: 2px 0; }
          .invoice-section { padding: 2px 0; margin: 5px 0; }
          .items-header {
            display: flex;
            justify-content: space-between;
            font-weight: 900;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            padding: 4px 0;
            margin-top: 5px;
          }
          .item-row { display: flex; justify-content: space-between; padding: 2px 0; }
          .desc-header { width: 38mm; text-align: left; }
          .qty-header { width: 10mm; text-align: center; }
          .price-header { width: 20mm; text-align: right; }
          .item-desc { width: 38mm; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .item-qty { width: 10mm; text-align: center; }
          .item-price { width: 20mm; text-align: right; }
          .totals-section { margin-top: 10px; border-top: 2px solid #000; padding-top: 5px; }
          .total-row { display: flex; justify-content: space-between; padding: 3px 0; }
          .total-label { width: 40mm; text-align: left; }
          .total-value { width: 28mm; text-align: right; }
          .total-row.final {
            font-weight: 900;
            font-size: 14px;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            padding: 6px 0;
            margin: 5px 0;
          }
          .payment-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            font-size: 12px;
            font-weight: bold;
            border-bottom: 2px solid #000;
            margin-top: 5px;
          }
          .payment-label { width: 40mm; text-align: left; }
          .payment-value { width: 28mm; text-align: right; text-transform: uppercase; }
          .thank-you { text-align: center; font-weight: 900; font-size: 18px; margin: 15px 0 5px 0; }
          .cut-line { text-align: center; margin-top: 15px; border-top: 2px dashed #000; padding-top: 5px; font-size: 10px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="shop-header">
            <div class="shop-name">${shopName}</div>
            <div class="shop-details">${shopAddress}</div>
            <div class="shop-details">Tel: ${shopPhone}</div>
          </div>

          <div class="receipt-title">CASH RECEIPT</div>

          <div class="info-row">
            <span>Date: ${formattedDate}</span>
            <span>${formattedTime}</span>
          </div>

          <div class="invoice-section">
            <div class="info-row">
              <span>Invoice #:</span>
              <span class="font-extra-bold">${invoiceNo}</span>
            </div>
            <div class="info-row">
              <span>FBR #:</span>
              <span class="font-extra-bold">${fbrInvoiceNo}</span>
            </div>
          </div>

          <div class="items-header">
            <span class="desc-header">DESCRIPTION</span>
            <span class="qty-header">QTY</span>
            <span class="price-header">PRICE</span>
          </div>

          ${cartItems.map(item => {
            const itemName = item.title.length > 18 ? item.title.substring(0, 16) + '..' : item.title;
            const itemTotal = Math.round(item.price * item.quantity);
            return `
              <div class="item-row">
                <span class="item-desc" title="${item.title}">${itemName}</span>
                <span class="item-qty">${item.quantity}</span>
                <span class="item-price">Rs ${itemTotal}</span>
              </div>
            `;
          }).join('')}

          <div class="totals-section">
            <div class="total-row">
              <span class="total-label">Subtotal</span>
              <span class="total-value">Rs ${Math.round(subtotal)}</span>
            </div>

            <div class="total-row">
              <span class="total-label">Tax</span>
              <span class="total-value">Rs ${Math.round(tax)}</span>
            </div>

            <div class="total-row">
              <span class="total-label">Discount (${discountPercentage}%)</span>
              <span class="total-value">-Rs ${Math.round(discountAmount)}</span>
            </div>

            <div class="total-row final">
              <span class="total-label">TOTAL</span>
              <span class="total-value">Rs ${Math.round(totalAmount)}</span>
            </div>

            <div class="payment-row">
              <span class="payment-label">PAYMENT METHOD</span>
              <span class="payment-value">${paymentMethod.toUpperCase()}</span>
            </div>

            ${paymentMethod === "cash" && receivedAmount ? `
              <div class="total-row">
                <span class="total-label">Cash</span>
                <span class="total-value">Rs ${Math.round(parseFloat(receivedAmount))}</span>
              </div>
            ` : ''}

            ${paymentMethod === "cash" && receivedAmount && payback >= 0 ? `
              <div class="total-row" style="font-weight: 900;">
                <span class="total-label">Change Return</span>
                <span class="total-value">Rs ${Math.round(payback)}</span>
              </div>
            ` : ''}
            
            ${paymentMethod === "cash" && receivedAmount && payback < 0 ? `
              <div class="total-row" style="font-weight: 900; color: #ff0000;">
                <span class="total-label">Amount Due</span>
                <span class="total-value">Rs ${Math.abs(Math.round(payback))}</span>
              </div>
            ` : ''}
          </div>

          <div class="thank-you">THANK YOU!</div>
          <div class="cut-line">• • • • • CUT HERE • • • • •</div>
        </div>
        
        <script>
          // Auto print
          window.onload = function() {
            window.print();
          };
          
          // Close after printing or after 3 seconds
          window.onafterprint = function() {
            window.close();
          };
          
          // Fallback: close after 3 seconds if print dialog is canceled
          setTimeout(function() {
            window.close();
          }, 3000);
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(receiptHTML);
  printWindow.document.close();
};