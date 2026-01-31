import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { auth } from "@/lib/auth";
import { getQueryClient, trpc } from "@/trpc/server";
import { CallView } from "@/modules/call/ui/views/call-view";
import { CallViewError } from "@/modules/call/ui/views/call-view-error";
import { LoadingState } from "@/components/loading-state";

interface Props {
    params: Promise<{
        meetingId: string;
    }>;
}

export const Page = async ({ params }: Props) => {
    const { meetingId } = await params;

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    const queryClient = getQueryClient();

    void queryClient.prefetchQuery(
        trpc.meetings.getOne.queryOptions({ id: meetingId })
    );

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<LoadingState title="Loading call" description="Please wait..." />}>
                <ErrorBoundary FallbackComponent={CallViewError}>
                    <CallView meetingId={meetingId} />
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    );
};

export default Page;
