"use client";

import { ErrorState } from "@/components/error-state";

export const CallViewError = () => {
    return (
        <ErrorState
            title="Error loading call"
            description="Something went wrong while loading the call"
        />
    );
};
