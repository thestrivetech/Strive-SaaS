/**
 * Mock Data Generators
 *
 * Utilities for generating realistic mock data
 */

export function generateId(): string {
  return `mock_${Math.random().toString(36).substring(2, 11)}`;
}

export function randomFromArray<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomBoolean(): boolean {
  return Math.random() > 0.5;
}

export function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

export function randomPastDate(daysAgo: number): Date {
  const now = new Date();
  return new Date(now.getTime() - Math.random() * daysAgo * 24 * 60 * 60 * 1000);
}

export function randomFutureDate(daysFromNow: number): Date {
  const now = new Date();
  return new Date(now.getTime() + Math.random() * daysFromNow * 24 * 60 * 60 * 1000);
}

// Sample data pools
export const FIRST_NAMES = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa',
  'James', 'Maria', 'William', 'Jennifer', 'Richard', 'Linda', 'Thomas', 'Patricia',
];

export const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
];

export const COMPANY_NAMES = [
  'Acme Corp', 'Globex Corporation', 'Soylent Corp', 'Initech', 'Umbrella Corporation',
  'Massive Dynamic', 'Wayne Enterprises', 'Stark Industries', 'Oscorp', 'Cyberdyne Systems',
];

export const CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
  'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
];

export const STATES = [
  'NY', 'CA', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI', 'AZ', 'WA',
];

export const STREETS = [
  'Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Pine St', 'Elm Ave',
  'Washington Blvd', 'Park Ave', 'Lake Dr', 'Hill St', 'River Rd', 'Forest Ln',
];

export function randomName(): string {
  return `${randomFromArray(FIRST_NAMES)} ${randomFromArray(LAST_NAMES)}`;
}

export function randomEmail(name?: string): string {
  const nameForEmail = name
    ? name.toLowerCase().replace(/\s+/g, '.')
    : `user${randomInt(1000, 9999)}`;

  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com'];
  return `${nameForEmail}@${randomFromArray(domains)}`;
}

export function randomPhone(): string {
  return `(${randomInt(200, 999)}) ${randomInt(200, 999)}-${randomInt(1000, 9999)}`;
}

export function randomAddress(): {
  street: string;
  city: string;
  state: string;
  zip: string;
} {
  return {
    street: `${randomInt(100, 9999)} ${randomFromArray(STREETS)}`,
    city: randomFromArray(CITIES),
    state: randomFromArray(STATES),
    zip: `${randomInt(10000, 99999)}`,
  };
}

export function randomCurrency(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}
