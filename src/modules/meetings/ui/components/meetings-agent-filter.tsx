"use client";

import { CommandSelect } from "@/components/command-select";
import { GenerateAvatar } from "@/components/generate-avatar";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";

export const MeetingsAgentFilter = () => {
    const [filters, setFilters] = useMeetingsFilters();
    const trpc = useTRPC();

    const { data } = useQuery(trpc.agents.getMany.queryOptions({ pageSize: 100 }));

    const options = [
        {
            id: "all",
            value: "",
            children: <span>All Agents</span>,
        },
        ...(data?.items ?? []).map((agent) => ({
            id: agent.id,
            value: agent.id,
            children: (
                <div className="flex items-center gap-x-2">
                    <GenerateAvatar
                        variant="botttsNeutral"
                        seed={agent.name}
                        className="size-5"
                    />
                    <span className="capitalize">{agent.name}</span>
                </div>
            ),
        })),
    ];

    return (
        <CommandSelect
            className="w-[180px]"
            placeholder="Filter by agent..."
            value={filters.agentId}
            onSelect={(value) => setFilters({ agentId: value, page: 1 })}
            options={options}
        />
    );
};
