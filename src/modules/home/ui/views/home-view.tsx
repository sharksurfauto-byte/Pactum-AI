"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function HomeView() {
    const router = useRouter();
    const { data: session } = authClient.useSession();

    if (!session) {
        return <p>Loading...</p>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 gap-y-8 text-center">
            <div className="flex flex-col items-center gap-y-4">
                <div className="bg-primary/5 p-6 rounded-3xl shadow-sm border border-primary/10">
                    <Image
                        src="/logo.svg"
                        height={80}
                        width={80}
                        alt="Pactum.AI Logo"
                        className="size-20"
                    />
                </div>
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight">Pactum.AI</h1>
                    <p className="text-muted-foreground">The future of autonomous financial advising</p>
                </div>
            </div>

            <div className="flex flex-col items-center gap-y-3">
                <p className="text-sm font-medium italic text-muted-foreground/80">Welcome back, {session.user.name}</p>
                <Button
                    variant="outline"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
                    onClick={() =>
                        authClient.signOut({
                            fetchOptions: {
                                onSuccess: () => {
                                    router.push("/sign-in");
                                },
                            },
                        })
                    }
                >
                    Sign Out
                </Button>
            </div>
        </div>
    );
}