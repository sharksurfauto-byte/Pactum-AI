"use client";

import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";

export const MeetingsSearchFilter = () => {
    const [filters, setFilters] = useMeetingsFilters();

    return (
        <div className="relative">
            <Input
                placeholder="Search meetings..."
                className="h-9 bg-white w-[200px] pl-7"
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value, page: 1 })}
            />
            <SearchIcon className="absolute size-4 left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
    );
};
