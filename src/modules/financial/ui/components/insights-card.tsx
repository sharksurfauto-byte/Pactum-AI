"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ActivityIcon,
    CheckCircleIcon,
    ExternalLinkIcon,
    HashIcon,
    InfoIcon,
    LoaderIcon,
    ShieldCheckIcon
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTRPC } from "@/trpc/client";

interface Props {
    meetingId: string;
    transcript?: string;
}

export const InsightsCard = ({ meetingId, transcript }: Props) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const { data: insight, isLoading } = useQuery(trpc.financial.getInsights.queryOptions({ meetingId }));

    const generateInsight = useMutation(
        trpc.financial.generateInsight.mutationOptions({
            onSuccess: () => {
                toast.success("Financial insights generated");
                queryClient.invalidateQueries(trpc.financial.getInsights.queryOptions({ meetingId }));
            },
            onError: (error) => {
                toast.error(error.message);
            },
        })
    );

    if (isLoading) {
        return <div className="h-48 animate-pulse bg-muted rounded-lg" />;
    }

    if (!insight) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Financial Insights</CardTitle>
                    <CardDescription>
                        Run deterministic keyword extraction to find financial topics in this call.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={() => generateInsight.mutate({ meetingId, transcript })}
                        disabled={generateInsight.isPending}
                    >
                        {generateInsight.isPending ? (
                            <LoaderIcon className="size-4 mr-2 animate-spin" />
                        ) : (
                            <ActivityIcon className="size-4 mr-2" />
                        )}
                        Generate Insights
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const confidence = parseFloat(insight.confidence);
    const confidencePercent = Math.round(confidence * 100);
    const topics = insight.topics as string[];
    const hits = insight.hits as Record<string, string[]>;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-x-2">
                            Financial Insights
                            <Badge variant="outline" className="font-normal text-[10px]">
                                {insight.source}
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            Extracted from transcript using deterministic logic
                        </CardDescription>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-medium text-muted-foreground uppercase">Confidence</span>
                        <span className="text-xl font-bold text-primary">{confidencePercent}%</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <h4 className="text-sm font-medium flex items-center gap-x-2">
                        <HashIcon className="size-4" />
                        Detected Topics
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {topics.map((topic) => (
                            <Badge key={topic} variant="secondary">
                                {topic}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-medium flex items-center gap-x-2">
                        <InfoIcon className="size-4" />
                        Keyword Matches
                    </h4>
                    <div className="grid gap-2 text-sm">
                        {Object.entries(hits).map(([topic, matches]) => (
                            <div key={topic} className="flex items-start gap-x-2">
                                <span className="font-semibold capitalize min-w-[100px]">{topic}:</span>
                                <span className="text-muted-foreground">{(matches as string[]).join(", ")}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {insight.attestationUid && (
                    <div className="pt-4 border-t">
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center justify-between">
                            <div className="flex items-center gap-x-3">
                                <ShieldCheckIcon className="size-5 text-primary" />
                                <div>
                                    <p className="text-sm font-medium">On-chain Attestation</p>
                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                        UID: {insight.attestationUid}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <a
                                    href={`https://sepolia.easscan.org/attestation/view/${insight.attestationUid}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View on EAS
                                    <ExternalLinkIcon className="size-3 ml-1" />
                                </a>
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
