import type { NeighborhoodInsight } from "@shared/schema";

export async function fetchNeighborhoodInsights(areaCode?: string): Promise<NeighborhoodInsight[]> {
  const url = areaCode 
    ? `/api/v1/reid/insights?area=${areaCode}`
    : '/api/v1/reid/insights';
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch insights');
  }
  const json = await response.json();
  return json.data;
}

export async function fetchNeighborhoodInsight(areaCode: string): Promise<NeighborhoodInsight> {
  const response = await fetch(`/api/v1/reid/insights/${areaCode}`);
  if (!response.ok) {
    throw new Error('Failed to fetch insight');
  }
  const json = await response.json();
  return json.data;
}

export function exportToCSV(data: NeighborhoodInsight[], filename: string) {
  if (data.length === 0) return;
  
  const flattenedData = data.map(item => ({
    areaCode: item.areaCode,
    medianPrice: item.metrics.medianPrice,
    daysOnMarket: item.metrics.daysOnMarket,
    inventory: item.metrics.inventory,
    priceChange: item.metrics.priceChange,
    medianAge: item.demographics.medianAge,
    medianIncome: item.demographics.medianIncome,
    households: item.demographics.households,
    avgCommuteTime: item.demographics.avgCommuteTime,
    schoolRating: item.amenities.schoolRating,
    walkScore: item.amenities.walkScore,
    bikeScore: item.amenities.bikeScore,
    crimeIndex: item.amenities.crimeIndex,
    parkProximity: item.amenities.parkProximity,
  }));
  
  const headers = Object.keys(flattenedData[0]);
  const csvContent = [
    headers.join(','),
    ...flattenedData.map(row => 
      headers.map(header => row[header as keyof typeof row]).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}
