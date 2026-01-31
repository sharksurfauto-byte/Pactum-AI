"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeftIcon,
    MicIcon,
    MicOffIcon,
    PhoneIcon,
    PhoneOffIcon,
    MessageSquareIcon,
    LoaderIcon,
    FileUpIcon,
} from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { getVapiClient, getAssistantId } from "@/lib/vapi";
import { VapiMessage } from "@/lib/vapi";
import { InsightsCard } from "../../../financial/ui/components/insights-card";
import { GenerateAvatar } from "@/components/generate-avatar";
import { authClient } from "@/lib/auth-client";

interface Props {
    meetingId: string;
}

type CallStatus = "idle" | "connecting" | "active" | "ended";

export const CallView = ({ meetingId }: Props) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const trpc = useTRPC();
    const { data: session } = authClient.useSession();
    const { data: meeting } = useSuspenseQuery(
        trpc.meetings.getOne.queryOptions({ id: meetingId })
    );

    const [callStatus, setCallStatus] = useState<CallStatus>("idle");
    const [isMuted, setIsMuted] = useState(false);
    const [transcript, setTranscript] = useState<string[]>([]);
    const transcriptRef = useRef<string[]>([]);
    const [volumeLevel, setVolumeLevel] = useState(0);
    const vapiRef = useRef(getVapiClient());

    const updateMeeting = useMutation(
        trpc.meetings.update.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries(trpc.meetings.getOne.queryOptions({ id: meetingId }));
                // Silently succeed unless we want to toast here
            },
            onError: (error) => {
                console.error("Failed to update meeting:", error);
                import("sonner").then(({ toast }) => toast.error("Failed to save transcript: " + error.message));
            },
        })
    );

    // Set up Vapi event listeners
    useEffect(() => {
        const vapi = vapiRef.current;

        const handleCallStart = () => {
            console.log("Call started");
            setCallStatus("active");
            updateMeeting.mutate({
                id: meetingId,
                status: "active",
                startedAt: new Date(),
            });
        };

        const handleCallEnd = () => {
            console.log("Call ended with transcript:", transcriptRef.current);
            setCallStatus("ended");

            // Join transcript array into a single string for summary storage
            const fullTranscript = transcriptRef.current.join("\n");

            updateMeeting.mutate({
                id: meetingId,
                status: "completed",
                endedAt: new Date(),
                summary: fullTranscript,
            } as any);
        };

        const handleSpeechStart = () => {
            console.log("Speech started");
        };

        const handleSpeechEnd = () => {
            console.log("Speech ended");
        };

        const handleMessage = (message: VapiMessage) => {
            if (message.type === "transcript" && message.transcriptType === "final") {
                const role = message.role === "assistant" ? "Agent" : "You";
                const line = `${role}: ${message.transcript}`;
                setTranscript((prev) => [...prev, line]);
                transcriptRef.current.push(line);
            }
        };

        const handleVolumeLevel = (level: number) => {
            setVolumeLevel(level);
        };

        const handleError = (error: Error) => {
            console.error("Vapi error:", error);
            setCallStatus("idle");
        };

        vapi.on("call-start", handleCallStart);
        vapi.on("call-end", handleCallEnd);
        vapi.on("speech-start", handleSpeechStart);
        vapi.on("speech-end", handleSpeechEnd);
        vapi.on("message", handleMessage);
        vapi.on("volume-level", handleVolumeLevel);
        vapi.on("error", handleError);

        return () => {
            vapi.off("call-start", handleCallStart);
            vapi.off("call-end", handleCallEnd);
            vapi.off("speech-start", handleSpeechStart);
            vapi.off("speech-end", handleSpeechEnd);
            vapi.off("message", handleMessage);
            vapi.off("volume-level", handleVolumeLevel);
            vapi.off("error", handleError);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [meetingId]);

    const startCall = useCallback(async () => {
        setCallStatus("connecting");
        try {
            const assistantId = getAssistantId();
            await vapiRef.current.start(assistantId, {
                metadata: {
                    meetingId,
                    meetingName: meeting.name,
                    agentId: meeting.agentId,
                    agentName: meeting.agentName,
                    userId: session?.user?.id,
                    userName: session?.user?.name,
                },
            });
        } catch (error) {
            console.error("Error starting call:", error);
            setCallStatus("idle");
        }
    }, [meetingId, meeting, session]);

    const endCall = useCallback(() => {
        vapiRef.current.stop();
        setCallStatus("ended");
    }, []);

    const toggleMute = useCallback(() => {
        const newMuted = !isMuted;
        vapiRef.current.setMuted(newMuted);
        setIsMuted(newMuted);
    }, [isMuted]);

    const goBack = () => {
        router.push(`/meetings/${meetingId}`);
    };

    // Idle state - show start button
    if (callStatus === "idle") {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-y-6 p-8">
                <div className="rounded-full bg-primary/10 p-8">
                    <GenerateAvatar
                        variant="botttsNeutral"
                        seed={meeting.agentName}
                        className="size-24"
                    />
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-semibold">{meeting.name}</h2>
                    <p className="text-muted-foreground mt-1">
                        Ready to start your meeting with {meeting.agentName}
                    </p>
                </div>
                <div className="flex items-center gap-x-4">
                    <Button variant="outline" onClick={goBack}>
                        Cancel
                    </Button>
                    <Button onClick={startCall} size="lg">
                        <PhoneIcon className="size-5 mr-2" />
                        Start Call
                    </Button>
                </div>
            </div>
        );
    }

    // Connecting state
    if (callStatus === "connecting") {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-y-4">
                <LoaderIcon className="size-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Connecting to {meeting.agentName}...</p>
            </div>
        );
    }

    // Ended state
    if (callStatus === "ended") {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-y-6 p-8">
                <div className="flex flex-col items-center gap-y-2 mb-4">
                    <div className="bg-primary/5 p-3 rounded-2xl">
                        <Image
                            src="/logo.svg"
                            height={48}
                            width={48}
                            alt="Pactum.AI Logo"
                        />
                    </div>
                    <p className="text-sm font-bold tracking-widest uppercase text-muted-foreground/60">Pactum.AI</p>
                </div>
                <div className="rounded-full bg-destructive/10 p-6">
                    <PhoneOffIcon className="size-12 text-destructive" />
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-semibold">Call Ended</h2>
                    <p className="text-muted-foreground mt-1">
                        Your meeting with {meeting.agentName} has ended
                    </p>
                </div>
                {transcript.length > 0 && (
                    <div className="mt-8 w-full max-w-2xl space-y-6">
                        <InsightsCard meetingId={meetingId} transcript={transcript.join("\n")} />

                        <div className="bg-white/50 backdrop-blur-sm border rounded-xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center gap-x-2">
                                    <MessageSquareIcon className="size-5 text-primary" />
                                    Call Transcript
                                </h3>
                                <Button variant="outline" size="sm" className="gap-x-2">
                                    <FileUpIcon className="size-4" />
                                    Upload Document
                                </Button>
                            </div>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                                {transcript.map((line, i) => (
                                    <p key={i} className="text-sm border-l-2 border-primary/20 pl-4 py-1">
                                        {line}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex items-center gap-x-4">
                    <Button onClick={() => setCallStatus("idle")} variant="outline">
                        Call Again
                    </Button>
                    <Button onClick={goBack}>
                        Back to Meeting
                    </Button>
                </div>
            </div>
        );
    }

    // Active call state
    return (
        <div className="flex flex-col h-screen">
            {/* Main call area */}
            <div className="flex-1 flex flex-col items-center justify-center gap-y-6 bg-gradient-to-b from-background to-muted/30">
                <div className="relative">
                    <div
                        className="rounded-full p-2 transition-all duration-200"
                        style={{
                            boxShadow: `0 0 ${volumeLevel * 50}px ${volumeLevel * 20}px rgba(var(--primary), ${volumeLevel * 0.3})`,
                        }}
                    >
                        <GenerateAvatar
                            variant="botttsNeutral"
                            seed={meeting.agentName}
                            className="size-32"
                        />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-3 py-1 rounded-full animate-pulse">
                        Connected
                    </div>
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-semibold">{meeting.agentName}</h2>
                    <p className="text-muted-foreground">{meeting.name}</p>
                </div>

                {/* Live transcript */}
                <div className="w-full max-w-2xl bg-background/80 backdrop-blur rounded-lg p-4 max-h-48 overflow-y-auto border">
                    <h3 className="font-medium mb-2 text-sm text-muted-foreground">Live Transcript</h3>
                    <div className="space-y-1 text-sm">
                        {transcript.length === 0 ? (
                            <p className="text-muted-foreground italic">Start speaking...</p>
                        ) : (
                            transcript.slice(-5).map((line, i) => (
                                <p key={i} className={line.startsWith("Agent:") ? "text-primary" : ""}>
                                    {line}
                                </p>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Call controls */}
            <div className="p-6 bg-background border-t">
                <div className="flex items-center justify-center gap-x-4">
                    <Button
                        variant={isMuted ? "destructive" : "outline"}
                        size="icon"
                        className="rounded-full size-14"
                        onClick={toggleMute}
                    >
                        {isMuted ? (
                            <MicOffIcon className="size-6" />
                        ) : (
                            <MicIcon className="size-6" />
                        )}
                    </Button>
                    <Button
                        variant="destructive"
                        size="icon"
                        className="rounded-full size-16"
                        onClick={endCall}
                    >
                        <PhoneOffIcon className="size-6" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
