"use client";

import { Badge } from "@/components/ui/badge";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";

type MeetingStatus = "upcomming" | "active" | "completed" | "processing" | "cancelled";

const statusOptions: { value: MeetingStatus | ""; label: string }[] = [
    { value: "", label: "All Status" },
    { value: "upcomming", label: "Upcoming" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "processing", label: "Processing" },
    { value: "cancelled", label: "Cancelled" },
];

export const MeetingsStatusFilter = () => {
    const [filters, setFilters] = useMeetingsFilters();

    const isSelected = (value: string) => {
        if (value === "") {
            return !filters.status;
        }
        return filters.status === value;
    };

    return (
        <div className="flex items-center gap-x-1">
            {statusOptions.map((option) => (
                <Badge
                    key={option.value || "all"}
                    variant={isSelected(option.value) ? "default" : "outline"}
                    className="cursor-pointer px-2.5 py-1 text-xs hover:bg-accent/50 transition-colors"
                    onClick={() => setFilters({
                        status: option.value ? option.value as MeetingStatus : null,
                        page: 1
                    })}
                >
                    {option.label}
                </Badge>
            ))}
        </div>
    );
};
