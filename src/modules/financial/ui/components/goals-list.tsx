"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { PlusIcon, TargetIcon, CalendarIcon, CheckCircle2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTRPC } from "@/trpc/client";

const SAMPLE_GOALS = [
    {
        id: "sample-1",
        title: "Emergency Fund",
        targetAmount: "10000.00",
        currentAmount: "4500.00",
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString(),
        status: "in_progress",
    },
    {
        id: "sample-2",
        title: "Retirement Portfolio",
        targetAmount: "500000.00",
        currentAmount: "85000.00",
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3650).toISOString(),
        status: "in_progress",
    },
];

export const GoalsList = () => {
    const trpc = useTRPC();
    const { data: realGoals } = useSuspenseQuery(trpc.financial.getGoals.queryOptions());

    const goals = realGoals && realGoals.length > 0 ? realGoals : SAMPLE_GOALS;

    if (!goals || goals.length === 0) {
        return (
            <div className="text-center p-8 border rounded-lg border-dashed">
                <TargetIcon className="size-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No financial goals set</h3>
                <p className="text-muted-foreground text-sm mb-4">
                    Goals created during your calls will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {goals.map((goal) => {
                const target = parseFloat(goal.targetAmount);
                const current = parseFloat(goal.currentAmount);
                const progress = Math.min(100, (current / target) * 100);

                return (
                    <Card key={goal.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {goal.title}
                            </CardTitle>
                            <Badge variant={goal.status === "completed" ? "default" : "secondary"}>
                                {goal.status}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-y-2">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-2xl font-bold">${current.toLocaleString()}</span>
                                    <span className="text-xs text-muted-foreground">target: ${target.toLocaleString()}</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                                <div className="flex items-center gap-x-2 text-xs text-muted-foreground mt-1">
                                    <CalendarIcon className="size-3" />
                                    {goal.deadline ? format(new Date(goal.deadline), "PPP") : "No deadline"}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};
