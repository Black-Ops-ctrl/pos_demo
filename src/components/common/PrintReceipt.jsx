// PrintReceipt.js
export const printReceipt = (receiptData) => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.error('PrintReceipt: Not in browser environment');
    return false;
  }

  try {
    // Validate receipt data
    if (!receiptData) {
      console.error('PrintReceipt: No receipt data provided');
      return false;
    }

    const { 
      cartItems = [], 
      subtotal = 0, 
      discountPercentage = 0, 
      discountAmount = 0, 
      tax = 0, 
      totalAmount = 0, 
      paymentMethod = 'cash', 
      receivedAmount = 0,
      payback = 0,
      invoiceNo = 'INV-00000000',
      fbrInvoiceNo = 'N/A',
      shopName = 'Smart Shop',
      shopAddress = '',
      shopPhone = '',
      customerName = 'Walk In Customer'
    } = receiptData;

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-GB');
    const formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${invoiceNo}</title>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
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
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 2px 0;
            }
            .invoice-section {
              padding: 2px 0;
              margin: 5px 0;
            }
            .items-header {
              display: flex;
              justify-content: space-between;
              font-weight: 900;
              border-top: 2px solid #000;
              border-bottom: 2px solid #000;
              padding: 4px 0;
              margin-top: 5px;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              padding: 2px 0;
            }
            .desc-header {
              width: 38mm;
              text-align: left;
            }
            .qty-header {
              width: 10mm;
              text-align: center;
            }
            .price-header {
              width: 20mm;
              text-align: right;
            }
            .item-desc {
              width: 38mm;
              text-align: left;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .item-qty {
              width: 10mm;
              text-align: center;
            }
            .item-price {
              width: 20mm;
              text-align: right;
            }
            .totals-section {
              margin-top: 10px;
              border-top: 2px solid #000;
              padding-top: 5px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 3px 0;
            }
            .total-label {
              width: 40mm;
              text-align: left;
            }
            .total-value {
              width: 28mm;
              text-align: right;
            }
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
            .payment-label {
              width: 40mm;
              text-align: left;
            }
            .payment-value {
              width: 28mm;
              text-align: right;
              text-transform: uppercase;
            }
            .customer-section {
              margin: 5px 0;
              padding: 4px;
              border: 1px dashed #000;
              background-color: #f9f9f9;
            }
            .thank-you {
              text-align: center;
              font-weight: 900;
              font-size: 18px;
              margin: 15px 0 5px 0;
            }
            .cut-line {
              text-align: center;
              margin-top: 15px;
              border-top: 2px dashed #000;
              padding-top: 5px;
              font-size: 10px;
            }
            @media print {
              body {
                margin: 0;
                padding: 2mm;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="shop-header">
              <div class="shop-name">${shopName || 'Smart Shop'}</div>
              <div class="shop-details">${shopAddress || ''}</div>
              ${shopPhone ? `<div class="shop-details">Tel: ${shopPhone}</div>` : ''}
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
              ${fbrInvoiceNo && fbrInvoiceNo !== 'N/A' ? `
              <div class="info-row">
                <span>FBR #:</span>
                <span class="font-extra-bold">${fbrInvoiceNo}</span>
              </div>
              ` : ''}
            </div>

            ${customerName && customerName !== 'Walk In Customer' ? `
            <div class="customer-section">
              <div class="info-row">
                <span>Customer:</span>
                <span class="font-extra-bold">${customerName}</span>
              </div>
            </div>
            ` : ''}

            <div class="items-header">
              <span class="desc-header">DESCRIPTION</span>
              <span class="qty-header">QTY</span>
              <span class="price-header">PRICE</span>
            </div>

            ${cartItems.map(item => {
              const itemName = item.title ? (item.title.length > 18 ? item.title.substring(0, 16) + '..' : item.title) : 'Unknown Item';
              const itemTotal = Math.round((item.price || 0) * (item.quantity || 0));
              return `
                <div class="item-row">
                  <span class="item-desc" title="${item.title || ''}">${itemName}</span>
                  <span class="item-qty">${item.quantity || 0}</span>
                  <span class="item-price">Rs ${itemTotal}</span>
                </div>
              `;
            }).join('')}

            <div class="totals-section">
              <div class="total-row">
                <span class="total-label">Subtotal</span>
                <span class="total-value">Rs ${Math.round(subtotal)}</span>
              </div>

              ${tax > 0 ? `
              <div class="total-row">
                <span class="total-label">Tax</span>
                <span class="total-value">Rs ${Math.round(tax)}</span>
              </div>
              ` : ''}

              ${discountPercentage > 0 ? `
              <div class="total-row">
                <span class="total-label">Discount (${discountPercentage}%)</span>
                <span class="total-value">-Rs ${Math.round(discountAmount)}</span>
              </div>
              ` : ''}

              <div class="total-row final">
                <span class="total-label">TOTAL</span>
                <span class="total-value">Rs ${Math.round(totalAmount)}</span>
              </div>

              <div class="payment-row">
                <span class="payment-label">PAYMENT METHOD</span>
                <span class="payment-value">${(paymentMethod || 'cash').toUpperCase()}</span>
              </div>

              ${paymentMethod === "cash" && receivedAmount ? `
                <div class="total-row">
                  <span class="total-label">Cash Received</span>
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
            // Auto print with error handling
            (function() {
              let printTimeout;
              
              function closeWindow() {
                if (printTimeout) clearTimeout(printTimeout);
                setTimeout(function() {
                  window.close();
                }, 500);
              }
              
              window.onload = function() {
                // Small delay to ensure DOM is fully rendered
                setTimeout(function() {
                  try {
                    window.print();
                  } catch (e) {
                    console.error('Print failed:', e);
                    alert('Print failed. You can manually print this page.');
                  }
                }, 100);
              };
              
              // Handle after print event
              window.onafterprint = function() {
                closeWindow();
              };
              
              // Fallback: close after 5 seconds if print dialog is canceled or not triggered
              printTimeout = setTimeout(function() {
                if (!window.closed) {
                  window.close();
                }
              }, 5000);
            })();
          </script>
        </body>
      </html>
    `;

    // Try to open print window
    let printWindow = null;
    
    try {
      printWindow = window.open('', '_blank', 'width=400,height=600,menubar=yes,location=yes,resizable=yes,scrollbars=yes');
      
      // Check if window was opened successfully
      if (!printWindow || printWindow.closed || typeof printWindow.closed === 'undefined') {
        console.error('PrintReceipt: Popup was blocked!');
        
        // Fallback: Create an iframe for printing
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);
        
        const iframeDoc = iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(receiptHTML);
        iframeDoc.close();
        
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
        
        return true;
      }
      
      // Write content to the new window
      printWindow.document.open();
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      
      printWindow.focus();
      
      // Handle print dialog
      printWindow.onafterprint = function() {
        setTimeout(() => {
          if (printWindow && !printWindow.closed) {
            printWindow.close();
          }
        }, 500);
      };
      
      // Fallback close after 10 seconds
      setTimeout(() => {
        if (printWindow && !printWindow.closed) {
          printWindow.close();
        }
      }, 10000);
      
      return true;
      
    } catch (popupError) {
      console.error('PrintReceipt: Error opening print window:', popupError);
      
      // Last resort: Create a hidden div and use browser's print
      const printDiv = document.createElement('div');
      printDiv.style.position = 'absolute';
      printDiv.style.left = '-9999px';
      printDiv.style.top = '-9999px';
      printDiv.innerHTML = receiptHTML;
      document.body.appendChild(printDiv);
      
      window.print();
      
      setTimeout(() => {
        document.body.removeChild(printDiv);
      }, 1000);
      
      return true;
    }
    
  } catch (error) {
    console.error('PrintReceipt: Unexpected error:', error);
    alert('Unable to print receipt. Please check if popups are allowed for this site.');
    return false;
  }
};