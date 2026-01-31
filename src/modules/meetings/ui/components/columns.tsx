"use client";

import { GenerateAvatar } from "@/components/generate-avatar";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { ClockIcon, UserIcon } from "lucide-react";
import { MeetingGetMany } from "../../types";

// Helper function to format duration in seconds to human readable format
const formatDuration = (seconds: number | null): string => {
    if (!seconds || seconds <= 0) return "—";
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

export const columns: ColumnDef<MeetingGetMany>[] = [
    {
        accessorKey: "name",
        header: "Meeting",
        cell: ({ row }) => (
            <div className="flex flex-col gap-y-1">
                <span className="font-semibold capitalize">{row.original.name}</span>
                <div className="flex items-center gap-x-2 text-muted-foreground text-sm">
                    <UserIcon className="size-3" />
                    <span className="capitalize">{row.original.agentName}</span>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "agentName",
        header: "Agent",
        cell: ({ row }) => (
            <div className="flex items-center gap-x-2">
                <GenerateAvatar
                    variant="botttsNeutral"
                    seed={row.original.agentName}
                    className="size-6"
                />
                <span className="capitalize">{row.original.agentName}</span>
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant={getStatusVariant(row.original.status)} className="capitalize px-2.5 py-1">
                {row.original.status}
            </Badge>
        ),
    },
    {
        accessorKey: "duration",
        header: "Duration",
        cell: ({ row }) => (
            <div className="flex items-center gap-x-2">
                <ClockIcon className="size-4 text-muted-foreground" />
                <span>{formatDuration(row.original.duration)}</span>
            </div>
        ),
    },
    {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => (
            <span className="text-muted-foreground text-sm">
                {new Date(row.original.createdAt).toLocaleDateString()}
            </span>
        ),
    },
];
