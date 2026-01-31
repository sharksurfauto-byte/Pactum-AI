"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import {
    CreditCardIcon,
    LayoutDashboardIcon,
    PiggyBankIcon,
    TargetIcon,
    UserIcon
} from "lucide-react";
import { Suspense } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTRPC } from "@/trpc/client";

import { ProfileForm } from "../components/profile-form";
import { GoalsList } from "../components/goals-list";

import Image from "next/image";

export const FinancialDashboardView = () => {
    const trpc = useTRPC();
    const { data: profile } = useSuspenseQuery(trpc.financial.getProfile.queryOptions());

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div className="flex items-center gap-x-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <Image
                            src="/logo.svg"
                            height={32}
                            width={32}
                            alt="Pactum.AI Logo"
                            className="size-8"
                        />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Financial Advisory</h2>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-x-1">
                            Powered by <span className="text-primary font-bold">Pactum.AI</span>
                        </p>
                    </div>
                </div>
            </div>
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="goals">Goals</TabsTrigger>
                    <TabsTrigger value="profile">Client Profile</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Risk Tolerance
                                </CardTitle>
                                <LayoutDashboardIcon className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold capitalize">
                                    {profile?.riskTolerance ?? "Medium"}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Monthly Budget
                                </CardTitle>
                                <CreditCardIcon className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${parseFloat(profile?.monthlyBudget ?? "0").toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Savings Goal
                                </CardTitle>
                                <PiggyBankIcon className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">$510,000</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
                                <TargetIcon className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">2</div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Investment Allocation</CardTitle>
                                <CardDescription>
                                    Your current portfolio distribution based on risk profile.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px] flex flex-col items-center justify-center space-y-4">
                                <div className="flex gap-x-8">
                                    <div className="flex flex-col items-center">
                                        <div className="size-24 rounded-full border-8 border-primary border-t-transparent animate-spin-slow flex items-center justify-center">
                                            <span className="text-xs font-bold">Stocks</span>
                                        </div>
                                        <span className="text-xs mt-2">65% Equity</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="size-24 rounded-full border-8 border-blue-400 border-l-transparent flex items-center justify-center">
                                            <span className="text-xs font-bold">Bonds</span>
                                        </div>
                                        <span className="text-xs mt-2">25% Fixed</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="size-24 rounded-full border-8 border-green-400 border-b-transparent flex items-center justify-center">
                                            <span className="text-xs font-bold">Cash</span>
                                        </div>
                                        <span className="text-xs mt-2">10% Cash</span>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">Allocation automatically updated from deterministic call insights.</p>
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Recent Insights</CardTitle>
                                <CardDescription>
                                    Key financial topics found in your latest calls.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { topic: "Retirement", confidence: "94%", date: "Yesterday" },
                                    { topic: "Tax Strategy", confidence: "88%", date: "2 days ago" },
                                    { topic: "Budgeting", confidence: "98%", date: "5 days ago" },
                                ].map((insight, i) => (
                                    <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                        <div>
                                            <p className="text-sm font-medium">{insight.topic}</p>
                                            <p className="text-xs text-muted-foreground">{insight.date}</p>
                                        </div>
                                        <Badge variant="outline">{insight.confidence}</Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="goals" className="space-y-4">
                    <Suspense fallback={<div className="h-48 animate-pulse bg-muted rounded-lg" />}>
                        <GoalsList />
                    </Suspense>
                </TabsContent>
                <TabsContent value="profile" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Client Financial Profile</CardTitle>
                            <CardDescription>
                                Update your risk tolerance and financial constraints.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ProfileForm initialValues={profile ? {
                                riskTolerance: profile.riskTolerance,
                                monthlyBudget: profile.monthlyBudget || "0"
                            } : undefined} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};
