import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  drawBox,
  BRAND_COLORS,
  drawGradientBackground,
  addSectionTitle,
  addBodyText,
  setPDFOpacity,
  resetPDFOpacity,
  BROCHURE_DATA,
} from './pdf-generator-helpers';

export interface PDFOptions {
  filename?: string;
  quality?: number;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
}

export const generatePDF = async (
  elementId: string,
  options: PDFOptions = {}
): Promise<void> => {
  const {
    filename = 'Strive-Business-Solutions-Brochure.pdf',
    quality = 1.0,
    format = 'a4',
    orientation = 'portrait'
  } = options;

  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    // Create canvas from the element
    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight,
      scrollX: 0,
      scrollY: 0
    });

    const imgData = canvas.toDataURL('image/png', quality);

    // Calculate dimensions
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // PDF dimensions (A4: 210 x 297 mm)
    const pdfWidth = format === 'a4' ? 210 : 216; // letter: 216 x 279 mm
    const pdfHeight = format === 'a4' ? 297 : 279;

    // Calculate scaling to fit content
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const scaledWidth = imgWidth * ratio;
    const scaledHeight = imgHeight * ratio;

    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: format === 'a4' ? 'a4' : 'letter'
    });

    // If content is taller than one page, we need to split it
    const pageHeight = pdfHeight;
    const totalPages = Math.ceil(scaledHeight / pageHeight);

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage();
      }

      const yOffset = -page * pageHeight;

      pdf.addImage(
        imgData,
        'PNG',
        0,
        yOffset,
        scaledWidth,
        scaledHeight
      );
    }

    // Save the PDF
    pdf.save(filename);

    return Promise.resolve();
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

// Alternative method using print-friendly styling
export const generatePDFFromPrint = async (options: PDFOptions = {}): Promise<void> => {
  const { filename = 'Strive-Business-Solutions-Brochure.pdf' } = options;

  try {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Failed to open print window');
    }

    // Get the brochure content
    const brochureElement = document.getElementById('professional-brochure');
    if (!brochureElement) {
      throw new Error('Brochure element not found');
    }

    // Create print-optimized HTML
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Strive Business Solutions Brochure</title>
          <style>
            @page {
              margin: 15mm;
              size: A4;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.5;
              color: #333;
              background: white;
            }
            .page-break {
              page-break-before: always;
            }
            .no-break {
              page-break-inside: avoid;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            .gradient-text {
              background: linear-gradient(to right, #ff7033, #9333ea);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              color: #ff7033; /* fallback */
            }
            .text-primary {
              color: #ff7033 !important;
            }
            .bg-primary {
              background-color: #ff7033 !important;
            }
            .border-primary {
              border-color: #ff7033 !important;
            }
          </style>
        </head>
        <body>
          ${brochureElement.innerHTML}
        </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();

    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Trigger print
    printWindow.print();
    printWindow.close();

    return Promise.resolve();
  } catch (error) {
    console.error('Error generating PDF from print:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

// Utility to download any content as PDF
export const downloadAsPDF = async (
  content: string,
  filename: string = 'document.pdf'
): Promise<void> => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Split content into lines that fit the page width
    const splitText = pdf.splitTextToSize(content, 180);

    // Add text to PDF
    pdf.text(splitText, 15, 20);

    // Save the PDF
    pdf.save(filename);

    return Promise.resolve();
  } catch (error) {
    console.error('Error downloading as PDF:', error);
    throw new Error('Failed to download PDF. Please try again.');
  }
};

// Professional PDF Generator - Programmatic approach
export const generateProfessionalBrochurePDF = async (
  options: PDFOptions = {}
): Promise<void> => {
  const {
    filename = 'Strive-Business-Solutions-Brochure.pdf'
  } = options;

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = margin;

    // Brand colors
    const orangeColor = BRAND_COLORS.orange;
    const grayColor = BRAND_COLORS.gray;

    // Helper function to add a new page if needed
    const checkPageBreak = (spaceNeeded: number) => {
      if (yPos + spaceNeeded > pageHeight - margin) {
        pdf.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };

    // ===== COVER PAGE =====
    // Orange gradient background
    drawGradientBackground(pdf, { r: 255, g: 112, b: 51 }, { r: 255, g: 51, b: 234 });

    // Add logo placeholder (would need actual logo image)
    yPos = 60;
    drawBox(pdf, pageWidth / 2 - 20, yPos, 40, 40, BRAND_COLORS.white, 0.2);

    // Company name
    yPos = 115;
    pdf.setFontSize(40);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('STRIVE TECH', pageWidth / 2, yPos, { align: 'center' });

    // Tagline
    yPos += 12;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Transforming Business Through AI Innovation', pageWidth / 2, yPos, { align: 'center' });

    // Description
    yPos += 10;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const description = pdf.splitTextToSize(
      'Empowering organizations with cutting-edge AI solutions that drive growth, efficiency, and competitive advantage',
      contentWidth - 40
    );
    pdf.text(description, pageWidth / 2, yPos, { align: 'center' });

    // ===== PAGE 2: COMPANY OVERVIEW =====
    pdf.addPage();
    yPos = margin;
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    yPos = addSectionTitle(pdf, 'Company Overview', yPos, orangeColor);
    yPos = addBodyText(pdf, BROCHURE_DATA.company.description, yPos, margin);
    // Mission, Vision, Values boxes
    const boxWidth = (contentWidth - 10) / 3;
    const boxHeight = 35;
    const boxY = yPos;

    // Mission, Vision, Values
    const mvvItems = [
      { title: 'Our Mission', text: BROCHURE_DATA.company.mission },
      { title: 'Our Vision', text: BROCHURE_DATA.company.vision },
      { title: 'Our Values', text: BROCHURE_DATA.company.values }
    ];

    mvvItems.forEach((item, index) => {
      const xOffset = margin + (boxWidth + 5) * index;
      drawBox(pdf, xOffset, boxY, boxWidth, boxHeight, orangeColor, 0.1);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...orangeColor);
      pdf.text(item.title, xOffset + boxWidth / 2, boxY + 10, { align: 'center' });
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      const text = pdf.splitTextToSize(item.text, boxWidth - 6);
      pdf.text(text, xOffset + boxWidth / 2, boxY + 17, { align: 'center' });
    });

    yPos += boxHeight + 15;

    // ===== SERVICES & SOLUTIONS =====
    checkPageBreak(60);
    yPos = addSectionTitle(pdf, 'Services & Solutions', yPos, orangeColor);

    BROCHURE_DATA.services.forEach((service) => {
      checkPageBreak(25);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...orangeColor);
      pdf.text(service.title, margin, yPos);
      yPos += 6;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      const serviceDesc = pdf.splitTextToSize(service.desc, contentWidth);
      pdf.text(serviceDesc, margin, yPos);
      yPos += serviceDesc.length * 4.5 + 6;
    });

    // ===== INDUSTRY EXPERTISE =====
    checkPageBreak(60);
    yPos = addSectionTitle(pdf, 'Industry Expertise - 20+ Industries Served', yPos, orangeColor) - 4;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...grayColor);
    const industryDesc = pdf.splitTextToSize(
      'We bring deep domain knowledge and industry-specific AI solutions across 20+ industries to help you navigate unique challenges and opportunities.',
      contentWidth
    );
    pdf.text(industryDesc, pageWidth / 2, yPos, { align: 'center' });
    yPos += industryDesc.length * 5 + 8;

    BROCHURE_DATA.industries.forEach((industry, index) => {
      if (index % 2 === 0 && index > 0) {
        yPos += 8;
        checkPageBreak(8);
      }
      const xPos = index % 2 === 0 ? margin : pageWidth / 2 + 5;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text('• ' + industry, xPos, yPos);
      if (index % 2 === 1) {
        yPos += 6;
      }
    });
    yPos += 10;

    // ===== PROVEN RESULTS =====
    checkPageBreak(50);
    yPos = addSectionTitle(pdf, 'Proven Results', yPos, orangeColor);

    const metricBoxWidth = (contentWidth - 15) / 4;
    let metricX = margin;

    BROCHURE_DATA.metrics.forEach((metric) => {
      drawBox(pdf, metricX, yPos, metricBoxWidth, 25, orangeColor, 0.05);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...orangeColor);
      pdf.text(metric.number, metricX + metricBoxWidth / 2, yPos + 12, { align: 'center' });
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...grayColor);
      pdf.text(metric.label, metricX + metricBoxWidth / 2, yPos + 19, { align: 'center' });
      metricX += metricBoxWidth + 5;
    });
    yPos += 35;

    // ===== TECHNOLOGY STACK =====
    checkPageBreak(80);
    yPos = addSectionTitle(pdf, 'Technology Stack', yPos, orangeColor);

    BROCHURE_DATA.technologies.forEach((tech, index) => {
      if (index % 2 === 0) {
        checkPageBreak(40);
      }
      const xPos = index % 2 === 0 ? margin : pageWidth / 2 + 5;
      const techWidth = (contentWidth - 5) / 2;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...orangeColor);
      pdf.text(tech.category, xPos, yPos);

      let toolY = yPos + 6;
      tech.tools.forEach(tool => {
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text('✓ ' + tool, xPos, toolY);
        toolY += 5;
      });

      if (index % 2 === 1) {
        yPos += 32;
      }
    });
    yPos += 10;

    // ===== WHY CHOOSE STRIVE =====
    checkPageBreak(70);
    yPos = addSectionTitle(pdf, 'Why Choose Strive?', yPos, orangeColor);

    BROCHURE_DATA.reasons.forEach((reason) => {
      checkPageBreak(18);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...orangeColor);
      pdf.text('• ' + reason.title, margin, yPos);
      yPos += 6;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      const reasonDesc = pdf.splitTextToSize(reason.desc, contentWidth - 10);
      pdf.text(reasonDesc, margin + 5, yPos);
      yPos += reasonDesc.length * 4.5 + 4;
    });

    // ===== GET STARTED TODAY =====
    checkPageBreak(60);
    yPos = addSectionTitle(pdf, 'Get Started Today', yPos, orangeColor);

    // Contact Information
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...orangeColor);
    pdf.text('Contact Information', margin, yPos);
    yPos += 8;

    const contactItems = [
      `📞 ${BROCHURE_DATA.contact.phone}`,
      `✉️ ${BROCHURE_DATA.contact.email}`,
      `📍 ${BROCHURE_DATA.contact.location}`,
      `🕐 ${BROCHURE_DATA.contact.hours}`,
      `🌐 ${BROCHURE_DATA.contact.website}`
    ];

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...grayColor);
    contactItems.forEach(info => {
      pdf.text(info, margin, yPos);
      yPos += 6;
    });

    yPos += 8;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...orangeColor);
    pdf.text(BROCHURE_DATA.cta.title, margin, yPos);
    yPos += 6;

    yPos = addBodyText(pdf, BROCHURE_DATA.cta.description, yPos, margin, 9, grayColor);

    BROCHURE_DATA.cta.bullets.forEach(bullet => {
      pdf.text(bullet, margin, yPos);
      yPos += 5;
    });

    // ===== FOOTER =====
    pdf.addPage();
    yPos = pageHeight / 2;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(150, 150, 150);
    pdf.text('© 2025 Strive Tech. All rights reserved.', pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;
    pdf.text('Transforming Business Through AI Innovation', pageWidth / 2, yPos, { align: 'center' });

    // Save the PDF
    pdf.save(filename);

    return Promise.resolve();
  } catch (error) {
    console.error('Error generating professional PDF:', error);
    throw new Error('Failed to generate professional PDF. Please try again.');
  }
};