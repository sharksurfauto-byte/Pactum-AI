"use client";

import { ErrorState } from "@/components/error-state";
import { GenerateAvatar } from "@/components/generate-avatar";
import { LoadingState } from "@/components/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { FileUpIcon, VideoIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import UpdateAgentDialog from "@/modules/agents/ui/components/update-new-agent-dialog";
import { AgentIdViewHeader } from "./agent-id-view-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentRagManager } from "../components/agent-rag-manager";

interface Props {
    agentId: string;
}

export const AgentIdView = ({ agentId }: Props) => {
    const trpc = useTRPC();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [updateAgentDialogOpen, setUpdateAgentDialogOpen] = useState<boolean>(false);

    const { data } = useSuspenseQuery(trpc.agents.getOne.queryOptions({ id: agentId }));
    const removeAgent = useMutation(
        trpc.agents.remove.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}));
                router.push("/agents");
            },
            onError: (error) => {
                toast.error(`Error removing agent: ${error.message}`);
            },
        })
    );

    const [RemoveConfirmation, confirmRemove] = useConfirm(
        "Are you sure?",
        `The following action will remove ${data.meetingCount} associated meetings`
    );

    const handleRemoveAgent = async () => {
        const ok = await confirmRemove();
        if (!ok) return;
        removeAgent.mutate({ id: agentId });
    };

    return (
        <>
            <RemoveConfirmation />
            <UpdateAgentDialog
                open={updateAgentDialogOpen}
                onOpenChange={setUpdateAgentDialogOpen}
                initialValues={data}
            />
            <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
                <AgentIdViewHeader
                    agentId={agentId}
                    agentName={data.name}
                    onEdit={() => setUpdateAgentDialogOpen(true)}
                    onRemove={handleRemoveAgent}
                />

                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="details">Agent Details</TabsTrigger>
                        <TabsTrigger value="knowledge">Knowledge Base (RAG)</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details">
                        <div className="bg-white rounded-lg border">
                            <div className="px-4 py-5 gap-y-5 flex flex-col col-span-5">
                                <div className="flex items-center gap-x-3">
                                    <GenerateAvatar variant="botttsNeutral" seed={data.name} className="size-10" />
                                    <h2 className="text-2xl font-medium">{data.name}</h2>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Badge className="flex items-center gap-x-2 [&>svg]:size-4 w-fit" variant={"outline"}>
                                        <VideoIcon className="text-blue-700" />
                                        {data.meetingCount}
                                        {data.meetingCount === 1 ? "Meeting" : "Meetings"}
                                    </Badge>
                                    <div className="flex items-center gap-x-2">
                                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                                            RAG Enabled
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-y-4">
                                    <p className="text-lg font-medium">Instructions</p>
                                    <p className="text-neutral-800">{data.instructions}</p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="knowledge">
                        <AgentRagManager />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
};

export const AgentsIdViewLoading = () => {
    return <LoadingState title="Loading Agents" description="This may take a few seconds" />;
};

export const AgentsIdViewError = () => {
    return (
        <ErrorState
            title="Error loading agents"
            description="Something went wrong while loading the agents"
        />
    );
};