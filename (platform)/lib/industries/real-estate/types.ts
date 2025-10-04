/**
 * Real Estate Industry Types
 *
 * Type definitions specific to the real estate industry.
 * Co-located with the real estate implementation for better organization.
 */

import type { customers, projects } from '@prisma/client';

/**
 * Real Estate Customer Extension
 *
 * Extends the base Customer type with real estate-specific fields
 */
export interface RealEstateCustomer extends customers {
  customFields: {
    buyerType?: 'first-time' | 'repeat' | 'investor' | 'luxury';
    priceRange?: {
      min: number;
      max: number;
    };
    preferredLocations?: string[];
    propertyPreferences?: {
      bedrooms?: { min?: number; max?: number };
      bathrooms?: { min?: number; max?: number };
      squareFeet?: { min?: number; max?: number };
      propertyTypes?: PropertyType[];
      features?: string[];
    };
    preApprovalAmount?: number;
    preApprovalDate?: Date;
    lenderName?: string;
  };
}

/**
 * Property Type
 */
export type PropertyType =
  | 'single-family'
  | 'multi-family'
  | 'condo'
  | 'townhouse'
  | 'land'
  | 'commercial'
  | 'industrial'
  | 'mixed-use';

/**
 * Property Status
 */
export type PropertyStatus =
  | 'active'
  | 'pending'
  | 'sold'
  | 'off-market'
  | 'coming-soon'
  | 'expired'
  | 'withdrawn';

/**
 * Transaction Type
 */
export type TransactionType = 'sale' | 'lease' | 'rental';

/**
 * Transaction Status
 */
export type TransactionStatus =
  | 'pre-contract'
  | 'under-contract'
  | 'inspection'
  | 'appraisal'
  | 'financing'
  | 'clear-to-close'
  | 'closed'
  | 'canceled';

/**
 * Property
 */
export interface Property {
  id: string;
  organizationId: string;

  // Basic Info
  mlsNumber?: string;
  address: Address;
  type: PropertyType;
  status: PropertyStatus;

  // Pricing
  listPrice: number;
  soldPrice?: number;
  pricePerSqFt?: number;

  // Details
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  lotSizeAcres?: number;
  yearBuilt?: number;

  // Features
  features: string[];
  appliances: string[];
  parking?: ParkingInfo;

  // Media
  photos: PropertyPhoto[];
  virtualTourUrl?: string;
  videoUrl?: string;
  floorPlanUrl?: string;

  // Listing
  description?: string;
  listingAgent?: string;
  listDate?: Date;
  daysOnMarket?: number;

  // Financial
  taxes: PropertyTaxes;
  hoa?: HOAInfo;

  // Rental specific
  rentalInfo?: RentalInfo;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * Address
 */
export interface Address {
  street: string;
  unit?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;

  // Coordinates
  latitude?: number;
  longitude?: number;

  // Parsed
  county?: string;
  neighborhood?: string;
  subdivision?: string;
}

/**
 * Property Photo
 */
export interface PropertyPhoto {
  id: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  order: number;
  isPrimary: boolean;
}

/**
 * Parking Info
 */
export interface ParkingInfo {
  spaces: number;
  type: 'garage' | 'carport' | 'driveway' | 'street' | 'none';
  covered: boolean;
}

/**
 * Property Taxes
 */
export interface PropertyTaxes {
  annualAmount: number;
  year: number;
  assessedValue?: number;
}

/**
 * HOA Info
 */
export interface HOAInfo {
  monthlyFee: number;
  name?: string;
  phone?: string;
  amenities?: string[];
}

/**
 * Rental Info
 */
export interface RentalInfo {
  monthlyRent: number;
  securityDeposit: number;
  leaseTermMonths: number;
  availableDate: Date;
  petsAllowed: boolean;
  utilitiesIncluded: string[];
}

/**
 * Property Alert
 */
export interface PropertyAlert {
  id: string;
  organizationId: string;
  customerId: string;

  name: string;
  criteria: PropertySearchCriteria;

  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  channels: NotificationChannel[];

  isActive: boolean;

  lastMatchedAt?: Date;
  matchCount: number;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Property Search Criteria
 */
export interface PropertySearchCriteria {
  // Location
  cities?: string[];
  states?: string[];
  zipCodes?: string[];
  radius?: number; // miles from coordinates
  coordinates?: { lat: number; lng: number };

  // Price
  minPrice?: number;
  maxPrice?: number;

  // Property
  propertyTypes?: PropertyType[];
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minSquareFeet?: number;
  maxSquareFeet?: number;

  // Features
  requiredFeatures?: string[];
  excludedFeatures?: string[];

  // Other
  maxDaysOnMarket?: number;
  keywords?: string[];
}

/**
 * Notification Channel
 */
export type NotificationChannel = 'email' | 'sms' | 'push' | 'in-app';

/**
 * Transaction
 */
export interface Transaction {
  id: string;
  organizationId: string;
  propertyId: string;

  type: TransactionType;
  status: TransactionStatus;

  // Parties
  buyerId?: string;
  sellerId?: string;
  buyerAgentId?: string;
  sellerAgentId?: string;

  // Financial
  purchasePrice: number;
  commission: CommissionSplit;

  // Timeline
  contractDate?: Date;
  inspectionDate?: Date;
  appraisalDate?: Date;
  closingDate?: Date;

  // Documents
  documents: TransactionDocument[];

  // Milestones
  milestones: TransactionMilestone[];

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Commission Split
 */
export interface CommissionSplit {
  totalPercent: number;
  buyerAgentPercent: number;
  sellerAgentPercent: number;
  totalAmount: number;
}

/**
 * Transaction Document
 */
export interface TransactionDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  required: boolean;
  signatureRequired: boolean;
  signedAt?: Date;
}

/**
 * Transaction Milestone
 */
export interface TransactionMilestone {
  id: string;
  name: string;
  dueDate?: Date;
  completedDate?: Date;
  responsible: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  notes?: string;
}

/**
 * CMA (Comparative Market Analysis)
 */
export interface CMA {
  id: string;
  organizationId: string;
  propertyId: string;

  subjectProperty: Property;
  comparables: ComparableProperty[];

  estimatedValue: number;
  valueRange: { min: number; max: number };

  adjustments: CMAdjustment[];

  reportUrl?: string;

  createdBy: string;
  createdAt: Date;
}

/**
 * Comparable Property
 */
export interface ComparableProperty extends Property {
  distance: number; // miles from subject
  adjustments: CMAdjustment[];
  adjustedPrice: number;
}

/**
 * CMA Adjustment
 */
export interface CMAdjustment {
  factor: string;
  amount: number;
  reason: string;
}

/**
 * Real Estate Project Extension
 *
 * Extends the base Project with real estate-specific fields
 */
export interface RealEstateProject extends projects {
  customFields: {
    propertyAddress?: string;
    mlsNumber?: string;
    listPrice?: number;
    transactionType?: TransactionType;
  };
}
