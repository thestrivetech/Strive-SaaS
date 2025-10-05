import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchNeighborhoodInsights } from "@/lib/api";

interface AmenitiesModuleProps {
  selectedAreaCode?: string;
}

export function AmenitiesModule({ selectedAreaCode }: AmenitiesModuleProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const { data: insights = [], isLoading, isError } = useQuery({
    queryKey: ["/api/v1/reid/insights", selectedAreaCode],
    queryFn: () => fetchNeighborhoodInsights(selectedAreaCode),
  });

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-muted-foreground">Loading amenities...</div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-6">
        <div className="text-destructive">Failed to load amenities. Please try again.</div>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-muted-foreground">No amenity data available for selected area</div>
      </Card>
    );
  }

  const sortedData = [...insights].sort((a, b) => {
    if (!sortKey) return 0;
    
    let aVal: number = 0;
    let bVal: number = 0;
    
    if (sortKey === "schoolRating") {
      aVal = a.amenities.schoolRating;
      bVal = b.amenities.schoolRating;
    } else if (sortKey === "walkScore") {
      aVal = a.amenities.walkScore;
      bVal = b.amenities.walkScore;
    } else if (sortKey === "bikeScore") {
      aVal = a.amenities.bikeScore;
      bVal = b.amenities.bikeScore;
    } else if (sortKey === "crimeIndex") {
      aVal = a.amenities.crimeIndex;
      bVal = b.amenities.crimeIndex;
    }
    
    return sortDir === "asc" ? aVal - bVal : bVal - aVal;
  });

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge variant="default" className="bg-chart-3 hover:bg-chart-3">{score}</Badge>;
    if (score >= 80) return <Badge variant="default" className="bg-chart-1 hover:bg-chart-1">{score}</Badge>;
    return <Badge variant="secondary">{score}</Badge>;
  };

  const getCrimeIndexBadge = (index: number) => {
    if (index <= 25) return <Badge variant="default" className="bg-chart-3 hover:bg-chart-3">Low ({index})</Badge>;
    if (index <= 35) return <Badge variant="default" className="bg-chart-4 hover:bg-chart-4">Medium ({index})</Badge>;
    return <Badge variant="destructive">High ({index})</Badge>;
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Neighborhood Amenities & Quality of Life</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Zip Code</TableHead>
            <TableHead>
              <button 
                onClick={() => handleSort("schoolRating")}
                className="flex items-center gap-1 hover-elevate px-2 py-1 rounded"
                data-testid="sort-rating"
                aria-label="Sort by school rating"
              >
                School Rating <ArrowUpDown className="h-3 w-3" />
              </button>
            </TableHead>
            <TableHead>
              <button 
                onClick={() => handleSort("walkScore")}
                className="flex items-center gap-1 hover-elevate px-2 py-1 rounded"
                data-testid="sort-walkscore"
                aria-label="Sort by walk score"
              >
                Walk Score <ArrowUpDown className="h-3 w-3" />
              </button>
            </TableHead>
            <TableHead>
              <button 
                onClick={() => handleSort("bikeScore")}
                className="flex items-center gap-1 hover-elevate px-2 py-1 rounded"
                data-testid="sort-bikescore"
                aria-label="Sort by bike score"
              >
                Bike Score <ArrowUpDown className="h-3 w-3" />
              </button>
            </TableHead>
            <TableHead>
              <button 
                onClick={() => handleSort("crimeIndex")}
                className="flex items-center gap-1 hover-elevate px-2 py-1 rounded"
                data-testid="sort-crime"
                aria-label="Sort by crime index"
              >
                Crime Index <ArrowUpDown className="h-3 w-3" />
              </button>
            </TableHead>
            <TableHead>Park Distance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((insight) => (
            <TableRow key={insight.id} className="hover-elevate">
              <TableCell className="font-medium">{insight.areaCode}</TableCell>
              <TableCell>
                <Badge variant={insight.amenities.schoolRating >= 9 ? "default" : "secondary"} className={insight.amenities.schoolRating >= 9 ? "bg-chart-3 hover:bg-chart-3" : ""}>
                  {insight.amenities.schoolRating}/10
                </Badge>
              </TableCell>
              <TableCell>{getScoreBadge(insight.amenities.walkScore)}</TableCell>
              <TableCell>{getScoreBadge(insight.amenities.bikeScore)}</TableCell>
              <TableCell>{getCrimeIndexBadge(insight.amenities.crimeIndex)}</TableCell>
              <TableCell className="text-muted-foreground">{insight.amenities.parkProximity} mi</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
