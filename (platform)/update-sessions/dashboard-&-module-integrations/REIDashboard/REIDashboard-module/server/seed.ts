import { db } from "./db";
import { neighborhoodInsights } from "@shared/schema";

const seedData = [
  {
    areaCode: "94110",
    metrics: {
      medianPrice: 850000,
      daysOnMarket: 25,
      inventory: 45,
      priceChange: 5.2,
    },
    demographics: {
      medianAge: 38,
      medianIncome: 92000,
      households: 12450,
      avgCommuteTime: 28,
    },
    amenities: {
      schoolRating: 8.7,
      walkScore: 92,
      bikeScore: 88,
      crimeIndex: 25,
      parkProximity: 0.3,
    },
  },
  {
    areaCode: "94123",
    metrics: {
      medianPrice: 1200000,
      daysOnMarket: 28,
      inventory: 33,
      priceChange: 3.8,
    },
    demographics: {
      medianAge: 42,
      medianIncome: 145000,
      households: 8900,
      avgCommuteTime: 22,
    },
    amenities: {
      schoolRating: 9.2,
      walkScore: 88,
      bikeScore: 85,
      crimeIndex: 22,
      parkProximity: 0.5,
    },
  },
  {
    areaCode: "94107",
    metrics: {
      medianPrice: 920000,
      daysOnMarket: 18,
      inventory: 67,
      priceChange: 8.5,
    },
    demographics: {
      medianAge: 35,
      medianIncome: 125000,
      households: 15200,
      avgCommuteTime: 20,
    },
    amenities: {
      schoolRating: 8.2,
      walkScore: 85,
      bikeScore: 82,
      crimeIndex: 30,
      parkProximity: 0.8,
    },
  },
  {
    areaCode: "94115",
    metrics: {
      medianPrice: 1500000,
      daysOnMarket: 35,
      inventory: 22,
      priceChange: 2.1,
    },
    demographics: {
      medianAge: 45,
      medianIncome: 185000,
      households: 7800,
      avgCommuteTime: 25,
    },
    amenities: {
      schoolRating: 9.5,
      walkScore: 78,
      bikeScore: 75,
      crimeIndex: 18,
      parkProximity: 1.2,
    },
  },
];

async function seed() {
  console.log("Seeding database...");
  
  for (const data of seedData) {
    await db.insert(neighborhoodInsights).values(data);
  }
  
  console.log("Seed completed successfully!");
}

seed().catch(console.error);
