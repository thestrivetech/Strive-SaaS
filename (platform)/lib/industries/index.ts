/**
 * Industries Module
 *
 * Central export for the industry-as-plugin system
 */

// Core abstractions (types and base classes)
export * from './_core/industry-config';
export * from './_core/base-industry';

// Registry functions (preferred over router functions)
export * from './registry';

// Individual industries will be exported here as they're created
// export * from './healthcare';
// export * from './real-estate';
