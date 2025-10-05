import { Search, Calendar, Download, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useState } from "react";
import { format } from "date-fns";

interface DashboardHeaderProps {
  onSearch?: (query: string) => void;
  onDateRangeChange?: (from: Date, to: Date) => void;
  onExport?: () => void;
}

export function DashboardHeader({ onSearch, onDateRangeChange, onExport }: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState<Date>(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [dateTo, setDateTo] = useState<Date>(new Date());

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-border bg-background/80 backdrop-blur-xl px-6 py-3">
      <div className="flex items-center gap-4">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
            REID
          </div>
          <div className="hidden sm:block text-sm text-muted-foreground">
            Real Estate Intelligence
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search neighborhoods, zip codes..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
            className="pl-9 bg-card/50"
            data-testid="input-search"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="default" data-testid="button-date-range">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">
                {format(dateFrom, "MMM d")} - {format(dateTo, "MMM d")}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">From</label>
                <CalendarComponent
                  mode="single"
                  selected={dateFrom}
                  onSelect={(date) => {
                    if (date) {
                      setDateFrom(date);
                      onDateRangeChange?.(date, dateTo);
                    }
                  }}
                  data-testid="calendar-from"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">To</label>
                <CalendarComponent
                  mode="single"
                  selected={dateTo}
                  onSelect={(date) => {
                    if (date) {
                      setDateTo(date);
                      onDateRangeChange?.(dateFrom, date);
                    }
                  }}
                  data-testid="calendar-to"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button variant="outline" size="default" onClick={onExport} data-testid="button-export">
          <Download className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>
    </header>
  );
}
