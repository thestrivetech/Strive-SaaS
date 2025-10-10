Prompt #16: Document Processing Automation (Enhanced)
Role
Senior N8n Document Intelligence Engineer specializing in OCR technology, natural language processing, computer vision, and automated data extraction from unstructured documents.
Context

Volume: Process 10,000+ documents daily (contracts, disclosures, inspections, appraisals)
Performance: OCR processing < 30s per document, batch processing 500 documents/hour
Integration: OCR engines (Tesseract, Google Vision, AWS Textract), NLP models, document storage, CRM
Compliance: Data privacy regulations, document retention policies, audit trail requirements
Scale: Support 50,000 documents daily within 6 months, 200,000 within 1 year

Primary Objective
Build an intelligent document processing system achieving 95% extraction accuracy for printed text and 85% for handwritten content while processing documents in under 2 minutes.
Enhanced Requirements
Advanced OCR and Data Extraction Engine
pythonimport cv2
import numpy as np
import pytesseract
from PIL import Image
import pandas as pd
from transformers import pipeline, LayoutLMv3Processor, LayoutLMv3ForTokenClassification
import torch
from typing import Dict, List, Tuple, Optional
import re
from dataclasses import dataclass

@dataclass
class DocumentEntity:
    text: str
    confidence: float
    bounding_box: Tuple[int, int, int, int]
    entity_type: str
    page_number: int

class DocumentProcessor:
    def __init__(self):
        # Initialize OCR engines
        self.tesseract_config = '--oem 3 --psm 6 -c preserve_interword_spaces=1'
        
        # Initialize LayoutLM for document understanding
        self.processor = LayoutLMv3Processor.from_pretrained(
            "microsoft/layoutlmv3-base",
            apply_ocr=False
        )
        self.model = LayoutLMv3ForTokenClassification.from_pretrained(
            "microsoft/layoutlmv3-finetuned-funsd"
        )
        
        # Initialize NER pipeline for entity extraction
        self.ner_pipeline = pipeline(
            "ner",
            model="dslim/bert-base-NER-uncased",
            aggregation_strategy="simple"
        )
        
        # Document type classifiers
        self.doc_classifier = self.load_document_classifier()
        
        # Field extraction patterns
        self.extraction_patterns = self.load_extraction_patterns()
    
    def process_document(self, document_path: str) -> Dict:
        """
        Complete document processing pipeline
        """
        # Classify document type
        doc_type = self.classify_document(document_path)
        
        # Preprocess image for optimal OCR
        preprocessed_images = self.preprocess_document(document_path)
        
        # Extract text using multiple OCR engines
        ocr_results = self.multi_engine_ocr(preprocessed_images)
        
        # Merge and reconcile OCR results
        merged_text = self.merge_ocr_results(ocr_results)
        
        # Extract structured data based on document type
        extracted_data = self.extract_structured_data(
            merged_text,
            doc_type,
            preprocessed_images[0]  # Use first page for layout analysis
        )
        
        # Validate and correct extracted data
        validated_data = self.validate_and_correct(extracted_data, doc_type)
        
        # Extract key dates and deadlines
        dates = self.extract_dates_and_deadlines(merged_text, doc_type)
        
        # Extract parties and entities
        entities = self.extract_entities(merged_text)
        
        # Extract financial information
        financial_data = self.extract_financial_info(merged_text, doc_type)
        
        # Generate document summary
        summary = self.generate_summary(merged_text, extracted_data)
        
        return {
            'document_type': doc_type,
            'confidence': self.calculate_overall_confidence(ocr_results),
            'extracted_text': merged_text,
            'structured_data': validated_data,
            'dates': dates,
            'entities': entities,
            'financial_data': financial_data,
            'summary': summary,
            'processing_metadata': {
                'ocr_engines_used': list(ocr_results.keys()),
                'preprocessing_applied': self.get_preprocessing_methods(),
                'extraction_method': 'hybrid_ml_regex'
            }
        }
    
    def preprocess_document(self, document_path: str) -> List[np.ndarray]:
        """
        Advanced document preprocessing for optimal OCR
        """
        # Load document (handle PDF and images)
        if document_path.endswith('.pdf'):
            images = self.pdf_to_images(document_path)
        else:
            images = [cv2.imread(document_path)]
        
        preprocessed = []
        for img in images:
            # Convert to grayscale
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Deskew image
            angle = self.detect_skew(gray)
            if abs(angle) > 0.5:
                gray = self.rotate_image(gray, angle)
            
            # Remove noise
            denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
            
            # Adaptive thresholding for better text extraction
            thresh = cv2.adaptiveThreshold(
                denoised, 255,
                cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv2.THRESH_BINARY, 11, 2
            )
            
            # Remove borders and lines
            cleaned = self.remove_lines_and_borders(thresh)
            
            # Enhance text regions
            enhanced = self.enhance_text_regions(cleaned)
            
            preprocessed.append(enhanced)
        
        return preprocessed
    
    def multi_engine_ocr(self, images: List[np.ndarray]) -> Dict:
        """
        Use multiple OCR engines and merge results
        """
        results = {}
        
        # Tesseract OCR
        tesseract_results = []
        for img in images:
            text = pytesseract.image_to_string(img, config=self.tesseract_config)
            data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
            tesseract_results.append({
                'text': text,
                'data': data,
                'confidence': self.calculate_tesseract_confidence(data)
            })
        results['tesseract'] = tesseract_results
        
        # Google Vision API (if available)
        if self.google_vision_available():
            results['google_vision'] = self.google_vision_ocr(images)
        
        # AWS Textract (if available)
        if self.aws_textract_available():
            results['textract'] = self.aws_textract_ocr(images)
        
        # EasyOCR as fallback
        results['easyocr'] = self.easyocr_process(images)
        
        return results
    
    def extract_structured_data(self, text: str, doc_type: str, image: np.ndarray) -> Dict:
        """
        Extract structured data based on document type
        """
        if doc_type == 'purchase_agreement':
            return self.extract_purchase_agreement_data(text, image)
        elif doc_type == 'inspection_report':
            return self.extract_inspection_data(text, image)
        elif doc_type == 'appraisal':
            return self.extract_appraisal_data(text, image)
        elif doc_type == 'disclosure':
            return self.extract_disclosure_data(text, image)
        elif doc_type == 'lease':
            return self.extract_lease_data(text, image)
        else:
            return self.extract_generic_data(text, image)
    
    def extract_purchase_agreement_data(self, text: str, image: np.ndarray) -> Dict:
        """
        Extract specific fields from purchase agreements
        """
        extracted = {}
        
        # Property address
        address_patterns = [
            r'Property Address[:\s]+([^\n]+)',
            r'Subject Property[:\s]+([^\n]+)',
            r'Located at[:\s]+([^\n]+)'
        ]
        for pattern in address_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                extracted['property_address'] = match.group(1).strip()
                break
        
        # Purchase price
        price_patterns = [
            r'Purchase Price[:\s]+\$?([\d,]+)',
            r'Sale Price[:\s]+\$?([\d,]+)',
            r'Total Consideration[:\s]+\$?([\d,]+)'
        ]
        for pattern in price_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                extracted['purchase_price'] = float(match.group(1).replace(',', ''))
                break
        
        # Earnest money
        earnest_patterns = [
            r'Earnest Money[:\s]+\$?([\d,]+)',
            r'Initial Deposit[:\s]+\$?([\d,]+)',
            r'EMD[:\s]+\$?([\d,]+)'
        ]
        for pattern in earnest_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                extracted['earnest_money'] = float(match.group(1).replace(',', ''))
                break
        
        # Closing date
        closing_patterns = [
            r'Closing Date[:\s]+([A-Za-z]+ \d{1,2},? \d{4})',
            r'Settlement Date[:\s]+([A-Za-z]+ \d{1,2},? \d{4})',
            r'Close of Escrow[:\s]+([A-Za-z]+ \d{1,2},? \d{4})'
        ]
        for pattern in closing_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                extracted['closing_date'] = self.parse_date(match.group(1))
                break
        
        # Buyer and Seller names (using NER)
        entities = self.ner_pipeline(text)
        persons = [e for e in entities if e['entity_group'] == 'PER']
        if len(persons) >= 2:
            extracted['buyer_name'] = persons[0]['word']
            extracted['seller_name'] = persons[1]['word']
        
        # Contingencies
        extracted['contingencies'] = []
        contingency_keywords = ['inspection', 'appraisal', 'financing', 'sale of property']
        for keyword in contingency_keywords:
            if keyword.lower() in text.lower():
                extracted['contingencies'].append(keyword)
        
        # Use LayoutLM for additional extraction
        layout_extracted = self.extract_with_layoutlm(image, text)
        extracted.update(layout_extracted)
        
        return extracted
    
    def extract_dates_and_deadlines(self, text: str, doc_type: str) -> List[Dict]:
        """
        Extract all dates and associated deadlines
        """
        dates = []
        
        # Common date patterns
        date_patterns = [
            (r'(\w+ \d{1,2},? \d{4})', '%B %d, %Y'),
            (r'(\d{1,2}/\d{1,2}/\d{4})', '%m/%d/%Y'),
            (r'(\d{1,2}-\d{1,2}-\d{4})', '%m-%d-%Y'),
            (r'(\d{4}-\d{1,2}-\d{1,2})', '%Y-%m-%d')
        ]
        
        # Context patterns for identifying deadline types
        deadline_contexts = {
            'inspection': ['inspection', 'inspect', 'examination'],
            'appraisal': ['appraisal', 'valuation', 'assessment'],
            'loan': ['loan', 'financing', 'mortgage', 'commitment'],
            'closing': ['closing', 'settlement', 'completion'],
            'contingency': ['contingency', 'condition', 'subject to'],
            'earnest_money': ['earnest', 'deposit', 'emd'],
            'title': ['title', 'deed', 'ownership']
        }
        
        for pattern, date_format in date_patterns:
            for match in re.finditer(pattern, text):
                date_str = match.group(1)
                
                # Get context around the date
                start = max(0, match.start() - 100)
                end = min(len(text), match.end() + 100)
                context = text[start:end].lower()
                
                # Determine deadline type from context
                deadline_type = 'other'
                for dtype, keywords in deadline_contexts.items():
                    if any(keyword in context for keyword in keywords):
                        deadline_type = dtype
                        break
                
                try:
                    parsed_date = datetime.strptime(date_str, date_format)
                    dates.append({
                        'date': parsed_date.isoformat(),
                        'original_text': date_str,
                        'type': deadline_type,
                        'context': context.strip(),
                        'position': match.start()
                    })
                except ValueError:
                    continue
        
        # Sort by date
        dates.sort(key=lambda x: x['date'])
        
        return dates
    
    def validate_and_correct(self, data: Dict, doc_type: str) -> Dict:
        """
        Validate extracted data and apply corrections
        """
        validated = data.copy()
        
        # Address validation and standardization
        if 'property_address' in validated:
            validated['property_address'] = self.standardize_address(
                validated['property_address']
            )
        
        # Price validation
        if 'purchase_price' in validated:
            # Check for reasonable price range
            if validated['purchase_price'] < 1000 or validated['purchase_price'] > 100000000:
                validated['purchase_price_confidence'] = 'low'
                validated['purchase_price_needs_review'] = True
        
        # Date validation
        for date_field in ['closing_date', 'inspection_deadline', 'appraisal_deadline']:
            if date_field in validated:
                try:
                    date_obj = datetime.fromisoformat(validated[date_field])
                    # Check if date is reasonable (not too far in past or future)
                    if date_obj < datetime.now() - timedelta(days=365):
                        validated[f'{date_field}_warning'] = 'Date is more than 1 year in the past'
                    elif date_obj > datetime.now() + timedelta(days=365):
                        validated[f'{date_field}_warning'] = 'Date is more than 1 year in the future'
                except:
                    validated[f'{date_field}_invalid'] = True
        
        # Cross-field validation
        if 'earnest_money' in validated and 'purchase_price' in validated:
            earnest_ratio = validated['earnest_money'] / validated['purchase_price']
            if earnest_ratio > 0.2:  # More than 20% is unusual
                validated['earnest_money_warning'] = 'Unusually high earnest money ratio'
        
        return validated
N8n Workflow Implementation
javascriptconst documentProcessingWorkflow = {
  name: 'Document_Processing_Automation',
  nodes: [
    {
      name: 'Document_Upload_Trigger',
      type: 'n8n-nodes-base.s3Trigger',
      parameters: {
        bucketName: 'document-uploads',
        events: ['s3:ObjectCreated:*'],
        prefix: 'incoming/',
        suffix: '.pdf,.jpg,.png,.tiff'
      }
    },
    {
      name: 'Classify_Document',
      type: 'n8n-nodes-base.httpRequest',
      parameters: {
        url: '={{$env["ML_SERVICE"]}}/classify',
        method: 'POST',
        body: {
          document_url: '={{$json["s3"]["object"]["url"]}}',
          quick_classification: true
        },
        options: {
          timeout: 5000
        }
      }
    },
    {
      name: 'Route_By_Document_Type',
      type: 'n8n-nodes-base.switch',
      parameters: {
        dataType: 'string',
        value1: '={{$json["document_type"]}}',
        rules: [
          {
            value2: 'contract',
            output: 0
          },
          {
            value2: 'inspection_report',
            output: 1
          },
          {
            value2: 'appraisal',
            output: 2
          },
          {
            value2: 'disclosure',
            output: 3
          },
          {
            value2: 'other',
            output: 4
          }
        ]
      }
    },
    {
      name: 'Process_Contract',
      type: 'n8n-nodes-base.python',
      parameters: {
        pythonCode: `
import boto3
import json
from document_processor import DocumentProcessor
import numpy as np

# Download document from S3
s3 = boto3.client('s3')
document_key = $json["s3"]["object"]["key"]
bucket_name = $json["s3"]["bucket"]["name"]

# Download to temp location
local_path = f'/tmp/{document_key.split("/")[-1]}'
s3.download_file(bucket_name, document_key, local_path)

# Initialize processor
processor = DocumentProcessor()

# Process document
result = processor.process_document(local_path)

# Extract contract-specific fields
contract_data = {
    'parties': {
        'buyer': result['entities'].get('buyer', {}),
        'seller': result['entities'].get('seller', {}),
        'agents': result['entities'].get('agents', [])
    },
    'property': {
        'address': result['structured_data'].get('property_address'),
        'legal_description': result['structured_data'].get('legal_description')
    },
    'terms': {
        'purchase_price': result['financial_data'].get('purchase_price'),
        'earnest_money': result['financial_data'].get('earnest_money'),
        'closing_date': result['dates'].get('closing_date')
    },
    'contingencies': result['structured_data'].get('contingencies', []),
    'important_dates': result['dates'],
    'extracted_clauses': result['structured_data'].get('clauses', [])
}

# Calculate confidence scores
confidence_scores = {
    'overall': result['confidence'],
    'parties': calculate_entity_confidence(result['entities']),
    'financial': calculate_financial_confidence(result['financial_data']),
    'dates': calculate_date_confidence(result['dates'])
}

# Identify missing or low-confidence fields
review_required = []
for field, confidence in confidence_scores.items():
    if confidence < 0.85:
        review_required.append({
            'field': field,
            'confidence': confidence,
            'current_value': contract_data.get(field)
        })

return {
    'document_id': generate_document_id(),
    'document_type': 'contract',
    'extracted_data': contract_data,
    'confidence_scores': confidence_scores,
    'review_required': review_required,
    'processing_time': result.get('processing_time'),
    'summary': result['summary']
}
        `
      }
    },
    {
      name: 'Data_Validation',
      type: 'n8n-nodes-base.function',
      parameters: {
        functionCode: `
          const extractedData = $json["extracted_data"];
          const documentType = $json["document_type"];
          const validationErrors = [];
          const validationWarnings = [];
          
          // Required field validation based on document type
          const requiredFields = getRequiredFields(documentType);
          
          for (const field of requiredFields) {
            if (!extractedData[field] || extractedData[field] === '') {
              validationErrors.push({
                field: field,
                error: 'Required field missing',
                severity: 'high'
              });
            }
          }
          
          // Business rule validation
          if (documentType === 'contract') {
            // Validate purchase price
            if (extractedData.terms?.purchase_price) {
              if (extractedData.terms.purchase_price < 10000) {
                validationWarnings.push({
                  field: 'purchase_price',
                  warning: 'Unusually low purchase price',
                  value: extractedData.terms.purchase_price
                });
              }
            }
            
            // Validate dates
            const closingDate = new Date(extractedData.terms?.closing_date);
            const today = new Date();
            
            if (closingDate < today) {
              validationErrors.push({
                field: 'closing_date',
                error: 'Closing date is in the past',
                value: extractedData.terms.closing_date
              });
            }
            
            // Validate earnest money ratio
            if (extractedData.terms?.earnest_money && extractedData.terms?.purchase_price) {
              const ratio = extractedData.terms.earnest_money / extractedData.terms.purchase_price;
              if (ratio > 0.2) {
                validationWarnings.push({
                  field: 'earnest_money',
                  warning: 'Earnest money exceeds 20% of purchase price',
                  ratio: ratio
                });
              }
            }
          }
          
          // Address validation
          if (extractedData.property?.address) {
            const addressValidation = await validateAddress(extractedData.property.address);
            if (!addressValidation.valid) {
              validationWarnings.push({
                field: 'address',
                warning: 'Address validation failed',
                suggestion: addressValidation.suggestion
              });
            }
          }
          
          const isValid = validationErrors.length === 0;
          const requiresReview = validationErrors.length > 0 || validationWarnings.length > 0;
          
          return {
            valid: isValid,
            requiresReview: requiresReview,
            errors: validationErrors,
            warnings: validationWarnings,
            validatedData: isValid ? extractedData : null,
            validationTimestamp: new Date().toISOString()
          };
        `
      }
    },
    {
      name: 'Create_Calendar_Entries',
      type: 'n8n-nodes-base.googleCalendar',
      parameters: {
        operation: 'create',
        calendar: 'primary',
        start: '={{$json["dates"]["inspection_deadline"]}}',
        end: '={{$json["dates"]["inspection_deadline"]}}',
        summary: 'Inspection Deadline - {{$json["property"]["address"]}}',
        description: 'Document ID: {{$json["document_id"]}}\nExtracted from: {{$json["document_type"]}}',
        additionalFields: {
          reminders: [
            {
              method: 'email',
              minutes: 1440  // 24 hours before
            },
            {
              method: 'popup',
              minutes: 120  // 2 hours before
            }
          ]
        }
      }
    },
    {
      name: 'Update_CRM',
      type: 'n8n-nodes-base.supabase',
      parameters: {
        operation: 'upsert',
        table: 'document_data',
        columns: {
          document_id: '={{$json["document_id"]}}',
          transaction_id: '={{$json["transaction_id"]}}',
          document_type: '={{$json["document_type"]}}',
          extracted_data: '={{JSON.stringify($json["extracted_data"])}}',
          confidence_scores: '={{JSON.stringify($json["confidence_scores"])}}',
          validation_status: '={{$json["validation"]["valid"] ? "valid" : "needs_review"}}',
          processed_at: '={{new Date().toISOString()}}',
          s3_url: '={{$json["s3"]["object"]["url"]}}'
        }
      }
    },
    {
      name: 'Handle_Low_Confidence',
      type: 'n8n-nodes-base.if',
      parameters: {
        conditions: {
          boolean: [
            {
              value1: '={{$json["confidence_scores"]["overall"]}}',
              operation: 'smaller',
              value2: 0.85
            }
          ]
        }
      }
    },
    {
      name: 'Send_For_Manual_Review',
      type: 'n8n-nodes-base.slack',
      parameters: {
        channel: '#document-review',
        text: 'Document requires manual review',
        attachments: [
          {
            color: '#ff9900',
            title: 'Document Processing - Manual Review Required',
            fields: [
              {
                title: 'Document ID',
                value: '{{$json["document_id"]}}',
                short: true
              },
              {
                title: 'Document Type',
                value: '{{$json["document_type"]}}',
                short: true
              },
              {
                title: 'Overall Confidence',
                value: '{{$json["confidence_scores"]["overall"]}}',
                short: true
              },
              {
                title: 'Review Required Fields',
                value: '{{$json["review_required"].map(f => f.field).join(", ")}}',
                short: false
              }
            ],
            actions: [
              {
                type: 'button',
                text: 'Review Document',
                url: '{{$env["REVIEW_APP_URL"]}}/document/{{$json["document_id"]}}'
              }
            ]
          }
        ]
      }
    }
  ]
};
Success Criteria
Performance Metrics

OCR Speed: P50 < 15s, P95 < 30s per document
Batch Processing: 500 documents/hour
End-to-end Processing: < 2 minutes per document
System Throughput: 10,000 documents/day

Quality Metrics

OCR Accuracy (Printed): >95% character accuracy
OCR Accuracy (Handwritten): >85% character accuracy
Field Extraction Accuracy: >90% for key fields
Document Classification: >98% accuracy

Business Impact Metrics

Manual Processing Reduction: 85% reduction in manual data entry
Processing Time Saved: 20 minutes per document × 10,000 = 3,333 hours/month
Error Reduction: 90% fewer data entry errors
Compliance Improvement: 100% audit trail compliance

Testing Requirements
pythonimport unittest
from document_processor import DocumentProcessor

class TestDocumentProcessing(unittest.TestCase):
    def setUp(self):
        self.processor = DocumentProcessor()
    
    def test_contract_extraction(self):
        """Test extraction from purchase agreement"""
        result = self.processor.process_document('test_data/purchase_agreement.pdf')
        
        self.assertIn('property_address', result['structured_data'])
        self.assertIn('purchase_price', result['structured_data'])
        self.assertIn('closing_date', result['dates'])
        self.assertGreater(result['confidence'], 0.85)
    
    def test_handwritten_processing(self):
        """Test handwritten text extraction"""
        result = self.processor.process_document('test_data/handwritten_form.jpg')
        
        self.assertIsNotNone(result['extracted_text'])
        self.assertGreater(len(result['extracted_text']), 100)
        # Lower threshold for handwritten
        self.assertGreater(result['confidence'], 0.70)
    
    def test_date_extraction(self):
        """Test date and deadline extraction"""
        text = "Inspection deadline: January 15, 2024. Closing date: 02/28/2024"
        dates = self.processor.extract_dates_and_deadlines(text, 'contract')
        
        self.assertEqual(len(dates), 2)
        self.assertEqual(dates[0]['type'], 'inspection')
        self.assertEqual(dates[1]['type'], 'closing')
    
    def test_validation(self):
        """Test data validation and correction"""
        data = {
            'purchase_price': 500,  # Too low
            'closing_date': '2020-01-01',  # Too far in past
            'earnest_money': 500000,
            'property_address': '123 main st'
        }
        
        validated = self.processor.validate_and_correct(data, 'contract')
        
        self.assertIn('purchase_price_needs_review', validated)
        self.assertIn('closing_date_warning', validated)
        self.assertIn('earnest_money_warning', validated)
Implementation Checklist

 Set up OCR infrastructure (Tesseract, cloud APIs)
 Deploy document preprocessing pipeline
 Train document classification model
 Implement multi-engine OCR system
 Build data extraction patterns
 Create validation rule engine
 Set up LayoutLM for document understanding
 Implement entity recognition
 Build date extraction system
 Create data reconciliation logic
 Set up quality scoring system
 Implement manual review workflow
 Create audit trail logging
 Build monitoring dashboard
 Deploy to staging environment
 Conduct accuracy testing
 Production rollout with monitoring