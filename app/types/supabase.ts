/**
 * Supabase Database Types
 *
 * This file defines the database schema types for TypeScript.
 * These types are used by the Supabase client to provide type safety.
 *
 * Note: In a production app, you would generate these types using:
 * npx supabase gen types typescript --project-id <project-id> > types/supabase.ts
 *
 * For now, we'll use a simple placeholder that works with Prisma types.
 */

export type Database = {
  public: {
    Tables: Record<string, any>;
    Views: Record<string, any>;
    Functions: Record<string, any>;
    Enums: Record<string, any>;
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];
