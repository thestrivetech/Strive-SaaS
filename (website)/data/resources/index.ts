// Export types
export type { Resource } from './types';

// Export individual category modules
export * from '../../../(website)/data/resources/technology';
export * from '../../../(website)/data/resources/blog-posts';
export * from '../../../(website)/data/resources/whitepapers';
export * from '../../../(website)/data/resources/case-studies';
export * from '../../../(website)/data/resources/quizzes';
export * from '../../../(website)/data/resources/featured';

// Import aggregated arrays from each category
import { technologyCards } from '../../../(website)/data/resources/technology';
import { blogPosts } from '../../../(website)/data/resources/blog-posts';
import { whitepapers } from '../../../(website)/data/resources/whitepapers';
import { caseStudies } from '../../../(website)/data/resources/case-studies';

// Combined resources array (maintains backward compatibility)
export const resources = [
  ...blogPosts,      // IDs 1, 4, 5
  ...whitepapers,    // IDs 2, 6, 7, 8  
  ...caseStudies     // IDs 3, 9, 10, 11, 12
];

// Export technology cards separately (as they were in original structure)
export { technologyCards };