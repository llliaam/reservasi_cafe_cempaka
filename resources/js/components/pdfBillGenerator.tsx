import React from 'react';
import { Download } from 'lucide-react';

// Install: npm install jspdf html2canvas

const PDFBillGenerator = ({ orderData }) => {
  // Import dinamis untuk mengurangi bundle size
  const generatePDF = async () => {
    try {
      // Dynamic imports
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;

      // Create PDF instance
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Add custom fonts (optional)
      // pdf.addFont('path/to/font.ttf', 'CustomFont', 'normal');

      // PDF styling variables
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;
      let yPosition = margin;

      // Helper function to add text with auto wrap
      const addText = (text, x, y, options = {}) => {
        const { 
          fontSize = 10, 
          fontStyle = 'normal', 
          color = [0, 0, 0],
          align = 'left',
          maxWidth = pageWidth - 2 * margin 
        } = options;
        
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', fontStyle);
        pdf.setTextColor(...color);
        
        if (align === 'center') {
          pdf.text(text, x, y, { align: 'center' });
        } else if (align === 'right') {
          pdf.text(text, x, y, { align: 'right' });
        } else {
          const lines = pdf.splitTextToSize(text, maxWidth);
          pdf.text(lines, x, y);
          return lines.length * (fontSize * 0.35); // Return height used
        }
        return fontSize * 0.35;
      };

      // Header with logo and restaurant info
      const addHeader = () => {
        // Logo placeholder (you can add actual logo)
        pdf.setFillColor(255, 165, 0); // Orange color
        pdf.circle(margin + 10, yPosition + 10, 8, 'F');
        
        // Restaurant name
        addText('Cempaka Cafe & Resto', margin + 25, yPosition + 8, {
          fontSize: 16,
          fontStyle: 'bold',
          color: [255, 165, 0]
        });
        
        addText('Jl. Raya Cafe No. 123, Medan', margin + 25, yPosition + 15, {
          fontSize: 10,
          color: [100, 100, 100]
        });
        
        addText('Telp: (061) 123-4567 | Email: info@cempakacafe.com', margin + 25, yPosition + 20, {
          fontSize: 10,
          color: [100, 100, 100]
        });

        yPosition += 35;
        
        // Divider line
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
      };

      // Bill title and order info
      const addOrderInfo = () => {
        addText('BILL / INVOICE', pageWidth / 2, yPosition, {
          fontSize: 18,
          fontStyle: 'bold',
          align: 'center'
        });
        yPosition += 15;

        // Order details in two columns
        const leftCol = margin;
        const rightCol = pageWidth / 2 + 10;
        
        addText('Order Code:', leftCol, yPosition, { fontStyle: 'bold' });
        addText(orderData.order_code, leftCol + 30, yPosition);
        
        addText('Date & Time:', rightCol, yPosition, { fontStyle: 'bold' });
        addText(orderData.order_time, rightCol + 30, yPosition);
        yPosition += 8;
        
        addText('Order Type:', leftCol, yPosition, { fontStyle: 'bold' });
        addText(orderData.order_type_label, leftCol + 30, yPosition);
        
        addText('Status:', rightCol, yPosition, { fontStyle: 'bold' });
        addText(orderData.status_label, rightCol + 30, yPosition);
        yPosition += 8;
        
        addText('Payment:', leftCol, yPosition, { fontStyle: 'bold' });
        addText(orderData.payment_method_label, leftCol + 30, yPosition);
        
        addText('Payment Status:', rightCol, yPosition, { fontStyle: 'bold' });
        addText(orderData.payment_status === 'paid' ? 'Paid' : 'Pending', rightCol + 30, yPosition);
        yPosition += 15;
      };

      // Customer information
      const addCustomerInfo = () => {
  addText('CUSTOMER INFORMATION', margin, yPosition, {
    fontSize: 12,
    fontStyle: 'bold'
  });
  yPosition += 10;
  
  addText(`Name: ${orderData.customer_name || 'N/A'}`, margin, yPosition);
  yPosition += 6;
  addText(`Phone: ${orderData.customer_phone || 'N/A'}`, margin, yPosition);
  yPosition += 6;
  addText(`Email: ${orderData.customer_email || 'N/A'}`, margin, yPosition);
  yPosition += 6;
  
  // Tambahan untuk delivery address jika ada
  if (orderData.delivery_address) {
    addText(`Address: ${orderData.delivery_address}`, margin, yPosition);
    yPosition += 6;
  }
  
  // Notes jika ada
  if (orderData.notes) {
    addText(`Notes: ${orderData.notes}`, margin, yPosition, {
      color: [100, 100, 100]
    });
    yPosition += 6;
  }
  
  yPosition += 10;
};

      // Items table
      const addItemsTable = () => {
        addText('ORDER ITEMS', margin, yPosition, {
          fontSize: 12,
          fontStyle: 'bold'
        });
        yPosition += 10;

        // Table header
        const tableHeaders = ['Item', 'Qty', 'Price', 'Subtotal'];
        const colWidths = [80, 20, 30, 35]; // mm
        let xPos = margin;
        
        // Header background
        pdf.setFillColor(245, 245, 245);
        pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 10, 'F');
        
        // Header text
        tableHeaders.forEach((header, index) => {
          addText(header, xPos + 2, yPosition, { fontStyle: 'bold', fontSize: 10 });
          xPos += colWidths[index];
        });
        yPosition += 8;
        
        // Table rows
        orderData.items.forEach((item, index) => {
          if (index % 2 === 0) {
            pdf.setFillColor(250, 250, 250);
            pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
          }
          
          xPos = margin;
          const rowData = [
            item.menu_name,
            item.quantity.toString(),
            `Rp ${item.price.toLocaleString()}`,
            `Rp ${item.subtotal.toLocaleString()}`
          ];
          
          rowData.forEach((data, colIndex) => {
            const align = colIndex > 0 ? 'right' : 'left';
            const textX = align === 'right' ? xPos + colWidths[colIndex] - 2 : xPos + 2;
            addText(data, textX, yPosition, { fontSize: 9, align });
            xPos += colWidths[colIndex];
          });
          
          yPosition += 8;
          
          // Special instructions
          if (item.special_instructions) {
            addText(`Note: ${item.special_instructions}`, margin + 5, yPosition, {
              fontSize: 8,
              color: [100, 100, 100]
            });
            yPosition += 6;
          }
        });
        
        yPosition += 5;
      };

      // Total calculation
      const addTotals = () => {
        const rightAlign = pageWidth - margin;
        const labelCol = rightAlign - 60;
        const valueCol = rightAlign;
        
        // Subtotal
        addText('Subtotal:', labelCol, yPosition);
        addText(`Rp ${orderData.subtotal.toLocaleString()}`, valueCol, yPosition, { align: 'right' });
        yPosition += 6;
        
        // Delivery fee (if applicable)
        if (orderData.delivery_fee > 0) {
          addText('Delivery Fee:', labelCol, yPosition);
          addText(`Rp ${orderData.delivery_fee.toLocaleString()}`, valueCol, yPosition, { align: 'right' });
          yPosition += 6;
        }
        
        // Service fee (if applicable)
        if (orderData.service_fee > 0) {
          addText('Service Fee:', labelCol, yPosition);
          addText(`Rp ${orderData.service_fee.toLocaleString()}`, valueCol, yPosition, { align: 'right' });
          yPosition += 6;
        }
        
        // Total line
        pdf.setDrawColor(0, 0, 0);
        pdf.line(labelCol - 5, yPosition, rightAlign, yPosition);
        yPosition += 5;
        
        addText('TOTAL:', labelCol, yPosition, { fontStyle: 'bold', fontSize: 12 });
        addText(`Rp ${orderData.total_amount.toLocaleString()}`, valueCol, yPosition, { 
          align: 'right', 
          fontStyle: 'bold', 
          fontSize: 12,
          color: [255, 165, 0]
        });
        yPosition += 15;
      };

      // Footer
      const addFooter = () => {
        // Thank you message
        addText('Thank you for your order!', pageWidth / 2, yPosition, {
          fontSize: 12,
          fontStyle: 'bold',
          align: 'center'
        });
        yPosition += 10;
        
        addText('Visit us again at Cempaka Cafe & Resto', pageWidth / 2, yPosition, {
          fontSize: 10,
          align: 'center',
          color: [100, 100, 100]
        });
        yPosition += 15;
        
        // QR Code placeholder (you can integrate with QR code library)
        addText('Scan for digital receipt:', pageWidth / 2, yPosition, {
          fontSize: 9,
          align: 'center',
          color: [100, 100, 100]
        });
        
        // QR code placeholder
        pdf.setDrawColor(200, 200, 200);
        const qrSize = 20;
        const qrX = (pageWidth - qrSize) / 2;
        yPosition += 5;
        pdf.rect(qrX, yPosition, qrSize, qrSize);
        
        // Generated timestamp
        yPosition = pageHeight - 15;
        addText(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, {
          fontSize: 8,
          align: 'center',
          color: [150, 150, 150]
        });
      };

      // Generate PDF content
      addHeader();
      addOrderInfo();
      addCustomerInfo();
      addItemsTable();
      addTotals();
      addFooter();

      // Save the PDF
      const fileName = `Bill_${orderData.order_code}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
      return false;
    }
  };

  return (
    <button
      onClick={generatePDF}
      className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
    >
      <Download size={16} />
      <span>Download Bill</span>
    </button>
  );
};

// Usage example with sample data
const BillExample = () => {
  const sampleOrderData = {
    order_code: "ORD-20250602-W1MX",
    order_time: "02/06/2025 11:49",
    order_type_label: "Makan di Tempat",
    status_label: "Dikonfirmasi",
    payment_method_label: "BNI Mobile/Internet Banking",
    payment_status: "paid",
    customer_name: "Timoty",
    customer_phone: "098765427834",
    customer_email: "moty@gmail.com",
    subtotal: 45000,
    delivery_fee: 0,
    service_fee: 2250,
    total_amount: 47250,
    items: [
      {
        menu_name: "Nasi Goreng Spesial",
        quantity: 1,
        price: 45000,
        subtotal: 45000,
        special_instructions: "Extra pedas"
      }
    ]
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">PDF Bill Generator Demo</h2>
      <PDFBillGenerator orderData={sampleOrderData} />
    </div>
  );
};

export default PDFBillGenerator;