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

  // Format date
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  const formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  // Generate receipt HTML - FIXED version matching the image
  const receiptHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt</title>
        <style>
          @page {
            margin: 0;
            size: 80mm auto;
          }
          
          body {
            margin: 0;
            padding: 2mm;
            width: 80mm;
            font-family: 'Courier New', monospace;
            font-size: 10px;
            font-weight: bold;
            background: white;
            box-sizing: border-box;
          }
          
          .receipt {
            width: 100%;
            max-width: 70mm;
            margin: 0 auto;
          }
          
          .shop-header {
            text-align: center;
            margin-bottom: 5px;
          }
          
          .shop-name {
            font-weight: 900;
            font-size: 18px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .shop-details {
            font-size: 11px;
            line-height: 1.2;
          }
          
          .receipt-title {
            text-align: center;
            font-weight: 900;
            font-size: 14px;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            padding: 4px 0;
            margin: 8px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 2px 0;
            width: 100%;
          }
          
          .invoice-section {
            padding: 2px 0;
            margin: 5px 0;
          }
          
          /* Items Header */
          .items-header {
            display: flex;
            justify-content: space-between;
            font-weight: 900;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            padding: 4px 0;
            margin-top: 5px;
            width: 100%;
          }
          
          .item-row {
            display: flex;
            justify-content: space-between;
            padding: 2px 0;
            width: 100%;
          }
          
          /* Fixed widths - matching the image */
          .desc-header { width: 38mm; text-align: left; }
          .qty-header { width: 10mm; text-align: center; }
          .price-header { width: 20mm; text-align: right; }
          
          .item-desc { 
            width: 38mm; 
            text-align: left; 
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .item-qty { width: 10mm; text-align: center; }
          .item-price { width: 20mm; text-align: right; }
          
          /* Format prices WITHOUT decimals (like in the image) */
          .item-price, .total-value {
            font-family: 'Courier New', monospace;
          }
          
          /* Totals Section */
          .totals-section {
            margin-top: 10px;
            border-top: 2px solid #000;
            padding-top: 5px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 3px 0;
            width: 100%;
          }
          
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
            width: 100%;
          }
          
          .payment-label { width: 40mm; text-align: left; }
          .payment-value { width: 28mm; text-align: right; text-transform: uppercase; }
          
          .thank-you {
            text-align: center;
            font-weight: 900;
            font-size: 18px;
            margin: 15px 0 5px 0;
            letter-spacing: 1px;
          }
          
          .cut-line {
            text-align: center;
            margin-top: 15px;
            border-top: 2px dashed #000;
            padding-top: 5px;
            font-size: 10px;
          }
          
          .font-extra-bold { font-weight: 900; }
          
          /* Helper function to format prices without decimals when .00 */
          .no-decimal {
            /* This will be applied via JS formatting */
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <!-- Shop Header -->
          <div class="shop-header">
            <div class="shop-name">${shopName}</div>
            <div class="shop-details">${shopAddress}</div>
            <div class="shop-details">Tel: ${shopPhone}</div>
          </div>

          <!-- Receipt Title -->
          <div class="receipt-title">
            CASH RECEIPT
          </div>

          <!-- Date and Invoice Info -->
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

          <!-- Items Header -->
          <div class="items-header">
            <span class="desc-header">DESCRIPTION</span>
            <span class="qty-header">QTY</span>
            <span class="price-header">PRICE</span>
          </div>

          <!-- Items List - Format prices like in the image ($27. not $27.00) -->
          ${cartItems.map(item => {
            const itemName = item.title.length > 18 ? item.title.substring(0, 16) + '..' : item.title;
            const itemTotal = item.price * item.quantity;
            // Format price without decimals if it's a whole number
            const formattedPrice = Number.isInteger(itemTotal) ? `$${itemTotal}.` : `$${itemTotal.toFixed(2)}`;
            return `
              <div class="item-row">
                <span class="item-desc" title="${item.title}">${itemName}</span>
                <span class="item-qty">${item.quantity}</span>
                <span class="item-price">${formattedPrice}</span>
              </div>
            `;
          }).join('')}

          <!-- Totals Section - Format like the image -->
          <div class="totals-section">
            <div class="total-row">
              <span class="total-label">Subtotal</span>
              <span class="total-value">${Number.isInteger(subtotal) ? `$${subtotal}.` : `$${subtotal.toFixed(2)}`}</span>
            </div>

            <div class="total-row">
              <span class="total-label">Tax</span>
              <span class="total-value">${Number.isInteger(tax) ? `$${tax}.` : `$${tax.toFixed(2)}`}</span>
            </div>

            <div class="total-row">
              <span class="total-label">Discount (${discountPercentage}%)</span>
              <span class="total-value">-${Number.isInteger(discountAmount) ? `$${discountAmount}.` : `$${discountAmount.toFixed(2)}`}</span>
            </div>

            <!-- FINAL TOTAL -->
            <div class="total-row final">
              <span class="total-label">TOTAL</span>
              <span class="total-value">${Number.isInteger(totalAmount) ? `$${totalAmount}.` : `$${totalAmount.toFixed(2)}`}</span>
            </div>

            <!-- PAYMENT METHOD -->
            <div class="payment-row">
              <span class="payment-label">PAYMENT METHOD</span>
              <span class="payment-value">${paymentMethod.toUpperCase()}</span>
            </div>

            ${paymentMethod === "cash" && receivedAmount ? `
              <div class="total-row">
                <span class="total-label">Cash</span>
                <span class="total-value">${Number.isInteger(parseFloat(receivedAmount)) ? `$${parseFloat(receivedAmount)}.` : `$${parseFloat(receivedAmount).toFixed(2)}`}</span>
              </div>
            ` : ''}

            ${paymentMethod === "cash" && receivedAmount && payback >= 0 ? `
              <div class="total-row" style="font-weight: 900;">
                <span class="total-label">CHANGE</span>
                <span class="total-value">${Number.isInteger(payback) ? `$${payback}.` : `$${payback.toFixed(2)}`}</span>
              </div>
            ` : ''}
          </div>

          <!-- Thank You Message -->
          <div class="thank-you">
            THANK YOU!
          </div>
          
          <!-- Cut line -->
          <div class="cut-line">
            • • • • • CUT HERE • • • • •
          </div>
        </div>
        
        <script>
          let printClicked = false;
          
          function safeClose() {
            setTimeout(() => window.close(), 100);
          }
          
          window.onafterprint = () => printClicked = true;
          
          window.onload = () => setTimeout(() => window.print(), 300);
          
          let hasFocus = true;
          window.addEventListener('blur', () => hasFocus = false);
          window.addEventListener('focus', () => {
            if (!printClicked && !hasFocus) safeClose();
            hasFocus = true;
          });
          
          document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'w') {
              e.preventDefault();
              safeClose();
            }
          });
          
          setTimeout(() => !window.closed && safeClose(), 30000);
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(receiptHTML);
  printWindow.document.close();
  printWindow.focus();
};