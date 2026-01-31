"use client";

import { DataPagination } from "@/components/data-pagination";
import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";
import { columns } from "../components/columns";

export const MeetingsView = () => {
    const [filters, setFilters] = useMeetingsFilters();
    const router = useRouter();
    const trpc = useTRPC();

    const statusValue = filters.status as "upcomming" | "active" | "completed" | "processing" | "cancelled" | null;

    const { data } = useSuspenseQuery(
        trpc.meetings.getMany.queryOptions({
            page: filters.page,
            search: filters.search || undefined,
            agentId: filters.agentId || undefined,
            status: statusValue || undefined,
        })
    );

    return (
        <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
            {data.items.length === 0 ? (
                <EmptyState
                    title="No meetings yet"
                    description="Create your first meeting to get started. Meetings allow you to interact with your AI agents in real-time."
                />
            ) : (
                <>
                    <DataTable
                        data={data.items}
                        columns={columns}
                        onRowClick={(row) => router.push(`/meetings/${row.id}`)}
                    />
                    <DataPagination
                        page={filters.page}
                        totalPages={data.totalPages}
                        onPageChange={(page) => setFilters({ page })}
                    />
                </>
            )}
        </div>
    );
};

export const MeetingsViewLoading = () => {
    return (
        <LoadingState title="Loading Meetings" description="This may take a few seconds" />
    );
};

export const MeetingsViewError = () => {
    return (
        <ErrorState
            title="Error loading meetings"
            description="Something went wrong while loading the meetings"
        />
    );
};
