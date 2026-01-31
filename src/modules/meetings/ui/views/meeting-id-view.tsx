"use client";

import { ErrorState } from "@/components/error-state";
import { GenerateAvatar } from "@/components/generate-avatar";
import { LoadingState } from "@/components/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { BanIcon, ClockIcon, PlayIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { UpdateMeetingDialog } from "../components/update-meeting-dialog";
import { MeetingIdViewHeader } from "./meeting-id-view-header";

interface Props {
    meetingId: string;
}

// Helper function to get status badge variant
const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case "active":
            return "default";
        case "completed":
            return "secondary";
        case "cancelled":
            return "destructive";
        default:
            return "outline";
    }
};

// Helper function to format duration
const formatDuration = (seconds: number | null): string => {
    if (!seconds || seconds <= 0) return "No Duration";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
};

export const MeetingIdView = ({ meetingId }: Props) => {
    const trpc = useTRPC();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [updateMeetingDialogOpen, setUpdateMeetingDialogOpen] = useState<boolean>(false);

    const { data } = useSuspenseQuery(trpc.meetings.getOne.queryOptions({ id: meetingId }));

    const removeMeeting = useMutation(
        trpc.meetings.remove.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
                router.push("/meetings");
                toast.success("Meeting removed successfully");
            },
            onError: (error) => {
                toast.error(`Error removing meeting: ${error.message}`);
            },
        })
    );

    const [RemoveConfirmation, confirmRemove] = useConfirm(
        "Are you sure?",
        "This action will permanently remove this meeting and all associated data."
    );

    const handleRemoveMeeting = async () => {
        const ok = await confirmRemove();
        if (!ok) return;
        removeMeeting.mutate({ id: meetingId });
    };

    const isUpcoming = data.status === "upcomming";
    const isActive = data.status === "active";
    const isCompleted = data.status === "completed";
    const isCancelled = data.status === "cancelled";
    const isProcessing = data.status === "processing";

    return (
        <>
            <RemoveConfirmation />
            <UpdateMeetingDialog
                open={updateMeetingDialogOpen}
                onOpenChange={setUpdateMeetingDialogOpen}
                initialValues={data}
            />
            <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
                <MeetingIdViewHeader
                    meetingId={meetingId}
                    meetingName={data.name}
                    onEdit={() => setUpdateMeetingDialogOpen(true)}
                    onRemove={handleRemoveMeeting}
                />
                <div className="bg-white rounded-lg border">
                    <div className="px-6 py-8 flex flex-col items-center justify-center text-center">
                        {/* Meeting Status Display */}
                        {isUpcoming && (
                            <>
                                <img
                                    src="/upcoming.svg"
                                    alt="Upcoming meeting"
                                    className="w-[200px] h-auto mb-4"
                                />
                                <h3 className="text-lg font-medium mb-2">Not started yet</h3>
                                <p className="text-muted-foreground mb-6">
                                    Once you start this meeting, a summary will appear here
                                </p>
                            </>
                        )}

                        {isActive && (
                            <>
                                <img
                                    src="/upcoming.svg"
                                    alt="Active meeting"
                                    className="w-[200px] h-auto mb-4"
                                />
                                <h3 className="text-lg font-medium mb-2">Meeting in progress</h3>
                                <p className="text-muted-foreground mb-6">
                                    Your meeting is currently active
                                </p>
                            </>
                        )}

                        {isProcessing && (
                            <>
                                <img
                                    src="/processing.svg"
                                    alt="Processing meeting"
                                    className="w-[200px] h-auto mb-4"
                                />
                                <h3 className="text-lg font-medium mb-2">Processing</h3>
                                <p className="text-muted-foreground mb-6">
                                    We are processing your meeting. This may take a few minutes.
                                </p>
                            </>
                        )}

                        {isCompleted && (
                            <>
                                <img
                                    src="/processing.svg"
                                    alt="Completed meeting"
                                    className="w-[200px] h-auto mb-4"
                                />
                                <h3 className="text-lg font-medium mb-2">Meeting completed</h3>
                                <p className="text-muted-foreground mb-6">
                                    This meeting has ended. View the summary below.
                                </p>
                            </>
                        )}

                        {isCancelled && (
                            <>
                                <img
                                    src="/cancelled.svg"
                                    alt="Cancelled meeting"
                                    className="w-[200px] h-auto mb-4"
                                />
                                <h3 className="text-lg font-medium mb-2">Meeting cancelled</h3>
                                <p className="text-muted-foreground mb-6">
                                    This meeting was cancelled
                                </p>
                            </>
                        )}

                        {/* Action Buttons */}
                        {isUpcoming && (
                            <div className="flex items-center gap-x-3">
                                <Button variant="outline" onClick={handleRemoveMeeting}>
                                    <BanIcon />
                                    Cancel meeting
                                </Button>
                                <Button onClick={() => router.push(`/call/${meetingId}`)}>
                                    <PlayIcon />
                                    Start meeting
                                </Button>
                            </div>
                        )}

                        {isActive && (
                            <div className="flex items-center gap-x-3">
                                <Button variant="destructive">
                                    <BanIcon />
                                    End meeting
                                </Button>
                                <Button onClick={() => router.push(`/call/${meetingId}`)}>
                                    <PlayIcon />
                                    Join meeting
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Meeting Details */}
                    <div className="border-t px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-x-3">
                                <GenerateAvatar
                                    variant="botttsNeutral"
                                    seed={data.agentName}
                                    className="size-8"
                                />
                                <div>
                                    <p className="text-sm text-muted-foreground">Agent</p>
                                    <p className="font-medium capitalize">{data.agentName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-x-3">
                                <Badge variant={getStatusVariant(data.status)} className="px-2.5 py-1 capitalize">
                                    {data.status}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-x-3">
                                <ClockIcon className="size-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Duration</p>
                                    <p className="font-medium">{formatDuration(data.duration)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Section (for completed meetings) */}
                    {isCompleted && data.summary && (
                        <div className="border-t px-6 py-4">
                            <h4 className="font-medium mb-2">Summary</h4>
                            <p className="text-muted-foreground">{data.summary}</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export const MeetingIdViewLoading = () => {
    return (
        <LoadingState title="Loading Meeting" description="This may take a few seconds" />
    );
};

export const MeetingIdViewError = () => {
    return (
        <ErrorState
            title="Error loading meeting"
            description="Something went wrong while loading the meeting"
        />
    );
};
