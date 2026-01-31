import Vapi from "@vapi-ai/web";

let vapiInstance: Vapi | null = null;

export const getVapiClient = (): Vapi => {
    if (!vapiInstance) {
        const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
        if (!apiKey) {
            throw new Error("NEXT_PUBLIC_VAPI_API_KEY is not configured");
        }
        vapiInstance = new Vapi(apiKey);
    }
    return vapiInstance;
};

export const getAssistantId = (): string => {
    const assistantId = process.env.NEXT_PUBLIC_VAPI_VOICE_ASSISTANT_ID;
    if (!assistantId) {
        throw new Error("NEXT_PUBLIC_VAPI_VOICE_ASSISTANT_ID is not configured");
    }
    return assistantId;
};

export interface VapiCallData {
    callId: string;
    status: "started" | "ended" | "error";
    startedAt?: Date;
    endedAt?: Date;
    transcript?: string;
    summary?: string;
    recordingUrl?: string;
}

export type VapiEventType =
    | "call-start"
    | "call-end"
    | "speech-start"
    | "speech-end"
    | "message"
    | "volume-level"
    | "error";

export interface VapiMessage {
    type: "transcript" | "function-call" | "hang" | "tool-calls" | "tool-call-result";
    role?: "user" | "assistant" | "system";
    transcript?: string;
    transcriptType?: "partial" | "final";
}
