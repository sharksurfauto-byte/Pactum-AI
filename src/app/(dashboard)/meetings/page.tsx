import { auth } from "@/lib/auth";
import { loadMeetingsSearchParams } from "@/modules/meetings/params";
import { MeetingsListHeader } from "@/modules/meetings/ui/components/meetings-list-header";
import {
    MeetingsView,
    MeetingsViewError,
    MeetingsViewLoading,
} from "@/modules/meetings/ui/views/meetings-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { SearchParams } from "nuqs";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
    searchParams: Promise<SearchParams>;
}

const MeetingsPage = async ({ searchParams }: Props) => {
    const filters = await loadMeetingsSearchParams(searchParams);

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) redirect("/sign-in");

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(
        trpc.meetings.getMany.queryOptions({
            page: filters.page,
            search: filters.search || undefined,
            agentId: filters.agentId || undefined,
            status: filters.status || undefined,
        })
    );

    return (
        <>
            <MeetingsListHeader />
            <HydrationBoundary state={dehydrate(queryClient)}>
                <Suspense fallback={<MeetingsViewLoading />}>
                    <ErrorBoundary FallbackComponent={MeetingsViewError}>
                        <MeetingsView />
                    </ErrorBoundary>
                </Suspense>
            </HydrationBoundary>
        </>
    );
};

export default MeetingsPage;
