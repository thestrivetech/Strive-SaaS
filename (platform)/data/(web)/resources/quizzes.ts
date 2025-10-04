/**
 * STUB: Quizzes data
 * This is a stub file - actual data lives in (website) project
 * These exports allow (platform) code to compile without cross-project imports
 */

export type Quiz = {
  id: string;
  title: string;
  questions: unknown[];
  difficulty: string;
  description?: string;
};

export const quizzes: Quiz[] = [];
export const allQuizzes: Quiz[] = [];
