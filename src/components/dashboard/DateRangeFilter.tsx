import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

export type DateRangePreset = "today" | "yesterday" | "7days" | "30days" | "360days" | "custom";

interface DateRangeFilterProps {
  selectedPreset: DateRangePreset;
  dateRange: { from: Date; to: Date };
  onPresetChange: (preset: DateRangePreset) => void;
  onDateRangeChange: (range: { from: Date; to: Date }) => void;
}

const presets: { key: DateRangePreset; label: string }[] = [
  { key: "today", label: "Aujourd'hui" },
  { key: "yesterday", label: "Hier" },
  { key: "7days", label: "7 derniers jours" },
  { key: "30days", label: "30 derniers jours" },
  { key: "360days", label: "360 derniers jours" },
];

export const getDateRangeFromPreset = (preset: DateRangePreset): { from: Date; to: Date } => {
  const now = new Date();
  const today = startOfDay(now);
  const todayEnd = endOfDay(now);

  switch (preset) {
    case "today":
      return { from: today, to: todayEnd };
    case "yesterday":
      return { from: startOfDay(subDays(now, 1)), to: endOfDay(subDays(now, 1)) };
    case "7days":
      return { from: startOfDay(subDays(now, 6)), to: todayEnd };
    case "30days":
      return { from: startOfDay(subDays(now, 29)), to: todayEnd };
    case "360days":
      return { from: startOfDay(subDays(now, 359)), to: todayEnd };
    default:
      return { from: today, to: todayEnd };
  }
};

const DateRangeFilter = ({
  selectedPreset,
  dateRange,
  onPresetChange,
  onDateRangeChange,
}: DateRangeFilterProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handlePresetClick = (preset: DateRangePreset) => {
    onPresetChange(preset);
    const range = getDateRangeFromPreset(preset);
    onDateRangeChange(range);
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      onPresetChange("custom");
      onDateRangeChange({ from: startOfDay(range.from), to: endOfDay(range.to) });
    } else if (range?.from) {
      onPresetChange("custom");
      onDateRangeChange({ from: startOfDay(range.from), to: endOfDay(range.from) });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((preset) => (
        <Button
          key={preset.key}
          variant={selectedPreset === preset.key ? "default" : "outline"}
          size="sm"
          onClick={() => handlePresetClick(preset.key)}
          className="text-xs"
        >
          {preset.label}
        </Button>
      ))}

      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={selectedPreset === "custom" ? "default" : "outline"}
            size="sm"
            className={cn("text-xs gap-2", selectedPreset === "custom" && "min-w-[200px]")}
          >
            <CalendarIcon className="h-4 w-4" />
            {selectedPreset === "custom"
              ? `${format(dateRange.from, "dd/MM/yyyy", { locale: fr })} - ${format(dateRange.to, "dd/MM/yyyy", { locale: fr })}`
              : format(new Date(), "dd/MM/yyyy", { locale: fr })}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={{ from: dateRange.from, to: dateRange.to }}
            onSelect={handleCalendarSelect}
            numberOfMonths={2}
            locale={fr}
            disabled={{ after: new Date() }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangeFilter;
