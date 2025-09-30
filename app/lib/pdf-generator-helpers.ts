import jsPDF from 'jspdf';

// Type-safe wrapper for jsPDF GState
interface GState {
  opacity: number;
}

interface jsPDFWithGState extends jsPDF {
  GState: new (state: GState) => unknown;
}

/**
 * Set PDF opacity (transparency) safely
 */
export function setPDFOpacity(pdf: jsPDF, opacity: number): void {
  const pdfWithGState = pdf as jsPDFWithGState;
  pdf.setGState(new pdfWithGState.GState({ opacity }));
}

/**
 * Reset PDF opacity to fully opaque
 */
export function resetPDFOpacity(pdf: jsPDF): void {
  setPDFOpacity(pdf, 1);
}

/**
 * Draw a colored box with optional transparency
 */
export function drawBox(
  pdf: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  color: [number, number, number],
  alpha: number = 1
): void {
  pdf.setFillColor(...color);
  setPDFOpacity(pdf, alpha);
  pdf.rect(x, y, width, height, 'F');
  resetPDFOpacity(pdf);
}

/**
 * Brand colors for Strive Tech
 */
export const BRAND_COLORS = {
  orange: [255, 112, 51] as [number, number, number], // #ff7033
  gray: [148, 163, 184] as [number, number, number],  // #94a3b8
  white: [255, 255, 255] as [number, number, number],
  darkGray: [80, 80, 80] as [number, number, number],
};

/**
 * Check if we need to add a new page and do so if necessary
 */
export function checkPageBreak(
  pdf: jsPDF,
  yPos: number,
  spaceNeeded: number,
  margin: number
): { needsBreak: boolean; newYPos: number } {
  const pageHeight = pdf.internal.pageSize.getHeight();

  if (yPos + spaceNeeded > pageHeight - margin) {
    pdf.addPage();
    return { needsBreak: true, newYPos: margin };
  }

  return { needsBreak: false, newYPos: yPos };
}

/**
 * Draw a gradient background (simulated with rectangles)
 */
export function drawGradientBackground(
  pdf: jsPDF,
  startColor: { r: number; g: number; b: number },
  endColor: { r: number; g: number; b: number }
): void {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < pageHeight; i += 2) {
    const ratio = i / pageHeight;
    const r = Math.floor(startColor.r + (endColor.r - startColor.r) * ratio);
    const g = Math.floor(startColor.g + (endColor.g - startColor.g) * ratio);
    const b = Math.floor(startColor.b + (endColor.b - startColor.b) * ratio);
    pdf.setFillColor(r, g, b);
    pdf.rect(0, i, pageWidth, 2, 'F');
  }
}

/**
 * Add a section title to the PDF
 */
export function addSectionTitle(
  pdf: jsPDF,
  title: string,
  yPos: number,
  color: [number, number, number] = BRAND_COLORS.orange,
  centered: boolean = true
): number {
  const pageWidth = pdf.internal.pageSize.getWidth();

  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...color);

  if (centered) {
    pdf.text(title, pageWidth / 2, yPos, { align: 'center' });
  } else {
    pdf.text(title, 15, yPos);
  }

  return yPos + 12; // Return new yPos after title
}

/**
 * Add body text to the PDF with automatic wrapping
 */
export function addBodyText(
  pdf: jsPDF,
  text: string,
  yPos: number,
  margin: number = 15,
  fontSize: number = 10,
  color: [number, number, number] = BRAND_COLORS.darkGray
): number {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const contentWidth = pageWidth - (margin * 2);

  pdf.setFontSize(fontSize);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...color);

  const wrappedText = pdf.splitTextToSize(text, contentWidth);
  pdf.text(wrappedText, margin, yPos);

  return yPos + (wrappedText.length * 5) + 10; // Return new yPos
}

/**
 * Brochure content data
 */
export const BROCHURE_DATA = {
  company: {
    description: 'Strive is a leading provider of AI-powered business solutions, helping organizations across industries transform their operations, improve efficiency, and drive sustainable growth. Our comprehensive suite of services combines cutting-edge artificial intelligence with deep industry expertise to deliver measurable results.',
    mission: 'Democratizing AI to make intelligent solutions accessible to businesses of all sizes',
    vision: 'Creating a future where AI amplifies human potential and drives innovation',
    values: 'Innovation, integrity, and impact in everything we deliver'
  },
  services: [
    { title: 'AI & Machine Learning Solutions', desc: 'Custom AI models, machine learning pipelines, and intelligent automation systems tailored to your business needs.' },
    { title: 'Intelligent Process Automation', desc: 'Streamline operations with AI-powered automation that reduces costs and improves efficiency.' },
    { title: 'Predictive Analytics & BI', desc: 'Transform data into actionable insights with advanced analytics and real-time business intelligence.' },
    { title: 'Custom AI Development', desc: 'End-to-end development of bespoke AI solutions that integrate seamlessly with your existing systems.' },
    { title: 'Data Engineering & Architecture', desc: 'Robust data infrastructure design and implementation for scalable AI and analytics platforms.' },
    { title: 'Cloud Infrastructure & DevOps', desc: 'Modern cloud architecture with automated deployment pipelines and infrastructure management.' }
  ],
  industries: [
    'Healthcare & Life Sciences',
    'Financial Services & Banking',
    'Manufacturing & Supply Chain',
    'Retail & E-commerce',
    'Technology & SaaS',
    'Education & EdTech',
    'Real Estate & PropTech',
    'Legal & Compliance'
  ],
  metrics: [
    { number: '500+', label: 'AI Models Deployed' },
    { number: '95%', label: 'Client Retention Rate' },
    { number: '40%', label: 'Average Cost Reduction' },
    { number: '3x', label: 'ROI Within First Year' }
  ],
  technologies: [
    { category: 'AI/ML', tools: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'OpenAI GPT', 'Hugging Face'] },
    { category: 'Cloud', tools: ['AWS', 'Azure', 'Google Cloud', 'Kubernetes', 'Docker'] },
    { category: 'Data', tools: ['Snowflake', 'Databricks', 'Apache Spark', 'PostgreSQL', 'MongoDB'] },
    { category: 'DevOps', tools: ['Jenkins', 'GitLab CI/CD', 'Terraform', 'Ansible', 'Prometheus'] }
  ],
  reasons: [
    { title: 'Proven Track Record', desc: '500+ successful AI implementations across diverse industries' },
    { title: 'Expert Team', desc: 'Certified AI engineers, data scientists, and business strategists' },
    { title: 'End-to-End Solutions', desc: 'From strategy to deployment, we handle every aspect of your AI journey' },
    { title: '24/7 Support', desc: 'Continuous monitoring, maintenance, and optimization of your AI systems' }
  ],
  contact: {
    phone: '(731)-431-2320',
    email: 'contact@strivetech.ai',
    location: 'Nashville, TN',
    hours: 'Mon-Fri: 8:00 AM - 8:00 PM EST',
    website: 'www.strivetech.ai'
  },
  cta: {
    title: 'Ready to Transform Your Business?',
    description: 'Schedule a free consultation to discuss how AI can accelerate your growth and competitive advantage.',
    bullets: [
      '✓ Free initial consultation',
      '✓ Custom AI strategy development',
      '✓ ROI-focused implementation'
    ]
  }
};
