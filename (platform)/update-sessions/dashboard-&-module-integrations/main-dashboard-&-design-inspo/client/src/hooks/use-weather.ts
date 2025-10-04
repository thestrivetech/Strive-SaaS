import { useQuery } from "@tanstack/react-query";

interface WeatherData {
  location: string;
  temperature: string;
  condition: string;
  icon: string;
}

export function useWeather() {
  return useQuery<WeatherData>({
    queryKey: ["/api/weather"],
    refetchInterval: 300000, // Refresh every 5 minutes
    staleTime: 300000, // Consider data fresh for 5 minutes
  });
}
