/**
 * Real Estate Industry Configuration
 *
 * Defines the real estate industry's capabilities, features, and extensions
 */

import type { IndustryConfig } from '../_core/industry-config';

export const realEstateConfig: IndustryConfig = {
  // Identification
  id: 'real-estate',
  name: 'Real Estate',
  description: 'Property management and real estate CRM',
  icon: 'Home', // Lucide icon name
  color: '#3B82F6', // Blue

  // Module Extensions - which core modules does real estate use?
  extends: ['crm', 'projects', 'ai', 'tasks'],

  // Features - real estate-specific capabilities (will be implemented later)
  features: [
    {
      id: 'property-management',
      name: 'Property Management',
      description: 'Manage property listings, showings, and transactions',
      componentPath: '@/lib/industries/real-estate/features/property-management',
      requiredTier: 'STARTER',
    },
    {
      id: 'mls-integration',
      name: 'MLS Integration',
      description: 'Connect to Multiple Listing Service for property data',
      componentPath: '@/lib/industries/real-estate/features/mls-integration',
      requiredTier: 'GROWTH',
    },
    {
      id: 'market-analysis',
      name: 'Market Analysis',
      description: 'Comparative market analysis and property valuation',
      componentPath: '@/lib/industries/real-estate/features/market-analysis',
      requiredTier: 'ENTERPRISE',
    },
  ],

  // Tools - real estate marketplace add-ons (will be implemented later)
  tools: [
    {
      id: 'property-alerts',
      name: 'Property Alert System',
      description: 'Automated property matching and buyer notifications',
      category: 'lead-management',
      pricing: 'paid',
      basePrice: 4900, // $49/month (PLACEHOLDER - TBD)
      requiredTier: 'STARTER',
    },
    {
      id: 'virtual-tours',
      name: 'Virtual Tour Coordinator',
      description: '3D property tour scheduling and management',
      category: 'marketing',
      pricing: 'paid',
      basePrice: 9900, // $99/month (PLACEHOLDER - TBD)
      requiredTier: 'GROWTH',
    },
    {
      id: 'cma-generator',
      name: 'CMA Generator',
      description: 'Automated comparative market analysis reports',
      category: 'analytics',
      pricing: 'enterprise',
      requiredTier: 'ENTERPRISE',
    },
  ],

  // CRM Field Extensions - custom fields for real estate CRM
  crmFields: {
    customer: [
      {
        fieldName: 'buyerType',
        type: 'string',
        label: 'Buyer Type',
        required: false,
        validation: {
          enum: ['first-time', 'repeat', 'investor', 'luxury'],
        },
      },
      {
        fieldName: 'priceRange',
        type: 'json',
        label: 'Price Range',
        required: false,
        validation: {
          properties: {
            min: { type: 'number' },
            max: { type: 'number' },
          },
        },
      },
      {
        fieldName: 'preferredLocations',
        type: 'json',
        label: 'Preferred Locations',
        required: false,
      },
      {
        fieldName: 'propertyPreferences',
        type: 'json',
        label: 'Property Preferences',
        required: false,
      },
      {
        fieldName: 'preApprovalAmount',
        type: 'number',
        label: 'Pre-Approval Amount',
        required: false,
      },
    ],
  },

  // Project Field Extensions - real estate-specific project fields
  projectFields: [
    {
      fieldName: 'propertyAddress',
      type: 'string',
      label: 'Property Address',
      required: false,
    },
    {
      fieldName: 'mlsNumber',
      type: 'string',
      label: 'MLS Number',
      required: false,
    },
    {
      fieldName: 'listPrice',
      type: 'number',
      label: 'List Price',
      required: false,
    },
    {
      fieldName: 'transactionType',
      type: 'string',
      label: 'Transaction Type',
      required: false,
      validation: {
        enum: ['sale', 'lease', 'rental'],
      },
    },
  ],

  // Routes - real estate-specific pages
  routes: [
    {
      path: '/industries/real-estate/user-dashboard',
      name: 'Real Estate Dashboard',
      description: 'Overview of properties, transactions, and market trends',
      componentPath: '@/lib/industries/real-estate/features/dashboard',
    },
    {
      path: '/industries/real-estate/properties',
      name: 'Property Listings',
      description: 'Manage property listings and showings',
      componentPath: '@/lib/industries/real-estate/features/property-management',
    },
    {
      path: '/industries/real-estate/workspace',
      name: 'Transactions',
      description: 'Track real estate transactions and closings',
      componentPath: '@/lib/industries/real-estate/features/transactions',
    },
    {
      path: '/industries/real-estate/market-analysis',
      name: 'Market Analysis',
      description: 'Comparative market analysis and property valuation',
      componentPath: '@/lib/industries/real-estate/features/market-analysis',
    },
  ],

  // Status
  status: 'beta',
  releasedAt: new Date('2025-01-01'),
  version: '1.0.0-beta',

  // Settings Schema - industry-specific configuration
  settingsSchema: {
    type: 'object',
    properties: {
      mlsIntegration: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean', default: false },
          mlsId: { type: 'string' },
          apiKey: { type: 'string' },
        },
      },
      defaultCommissionSplit: {
        type: 'object',
        properties: {
          buyerAgent: { type: 'number', default: 3 },
          listingAgent: { type: 'number', default: 3 },
        },
      },
      enablePropertyAlerts: {
        type: 'boolean',
        default: true,
        description: 'Enable automated property matching alerts',
      },
      defaultShowingDuration: {
        type: 'number',
        default: 30,
        description: 'Default property showing duration in minutes',
      },
    },
  },
};

export default realEstateConfig;
