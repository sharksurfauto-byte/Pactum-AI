"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrainCircuitIcon, LoaderIcon, SendIcon, SparklesIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export const AgentRagManager = () => {
    const [knowledge, setKnowledge] = useState("");
    const [isIndexing, setIsIndexing] = useState(false);
    const [isAsking, setIsAsking] = useState(false);
    const [question, setQuestion] = useState("");
    const [chat, setChat] = useState<Message[]>([]);
    const [isReady, setIsReady] = useState(false);

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

    const handleBuildKB = async () => {
        if (!knowledge.trim()) {
            toast.error("Please paste some text first");
            return;
        }

        setIsIndexing(true);
        try {
            const res = await fetch(`${BACKEND_URL}/ingest`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: knowledge }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || "Failed to index knowledge");
            }

            const data = await res.json();
            toast.success(`Knowledge base built with ${data.chunks} chunks!`);
            setIsReady(true);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Could not connect to RAG backend.");
        } finally {
            setIsIndexing(false);
        }
    };

    const handleAsk = async () => {
        if (!question.trim()) return;

        const userMsg = { role: "user" as const, content: question };
        setChat((prev) => [...prev, userMsg]);
        setQuestion("");
        setIsAsking(true);

        try {
            const res = await fetch(`${BACKEND_URL}/ask`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: userMsg.content }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || "Failed to get answer");
            }

            const data = await res.json();
            setChat((prev) => [...prev, { role: "assistant", content: data.answer }]);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Error getting answer from RAG engine");
        } finally {
            setIsAsking(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="h-fit">
                <CardHeader>
                    <CardTitle className="flex items-center gap-x-2">
                        <BrainCircuitIcon className="size-5 text-primary" />
                        Knowledge Input
                    </CardTitle>
                    <CardDescription>
                        Paste notes, policy text, or document content to ground your agent.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        placeholder="e.g., Our company policy states that all employees are entitled to 25 days of annual leave..."
                        className="min-h-[300px] resize-none font-mono text-sm"
                        value={knowledge}
                        onChange={(e) => setKnowledge(e.target.value)}
                    />
                    <Button
                        className="w-full gap-x-2"
                        onClick={handleBuildKB}
                        disabled={isIndexing}
                    >
                        {isIndexing ? (
                            <LoaderIcon className="size-4 animate-spin" />
                        ) : (
                            <SparklesIcon className="size-4" />
                        )}
                        Build Knowledge Base
                    </Button>
                </CardContent>
            </Card>

            <Card className="flex flex-col h-[500px]">
                <CardHeader>
                    <CardTitle className="flex items-center gap-x-2">
                        <SparklesIcon className="size-5 text-yellow-500" />
                        Grounded Chat
                        {isReady && <Badge className="ml-2 bg-green-500 hover:bg-green-600">Live</Badge>}
                    </CardTitle>
                    <CardDescription>
                        Answers are strictly grounded in your provided knowledge.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-y-4 overflow-hidden">
                    <ScrollArea className="flex-1 pr-4">
                        {chat.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-2 mt-20">
                                <BrainCircuitIcon className="size-12" />
                                <p>Ask something about your knowledge base</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {chat.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                            : "bg-muted rounded-tl-none border"
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {isAsking && (
                                    <div className="flex justify-start">
                                        <div className="bg-muted rounded-2xl rounded-tl-none border px-4 py-2">
                                            <LoaderIcon className="size-4 animate-spin" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </ScrollArea>
                    <div className="flex gap-x-2">
                        <Input
                            placeholder={isReady ? "Ask a question..." : "Build knowledge base first"}
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            disabled={!isReady || isAsking}
                            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                        />
                        <Button size="icon" onClick={handleAsk} disabled={!isReady || isAsking || !question.trim()}>
                            <SendIcon className="size-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
