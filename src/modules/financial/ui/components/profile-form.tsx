"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LoaderIcon, SaveIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { financialProfileSchema } from "../../schemas";
import { z } from "zod";

type FormValues = z.infer<typeof financialProfileSchema>;

interface Props {
    initialValues?: FormValues;
}

export const ProfileForm = ({ initialValues }: Props) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const upsertProfile = useMutation(
        trpc.financial.upsertProfile.mutationOptions({
            onSuccess: () => {
                toast.success("Profile updated");
                queryClient.invalidateQueries(trpc.financial.getProfile.queryOptions());
            },
            onError: (error) => {
                toast.error(error.message);
            },
        })
    );

    const form = useForm<FormValues>({
        resolver: zodResolver(financialProfileSchema),
        defaultValues: initialValues || {
            riskTolerance: "medium",
            monthlyBudget: "0",
        },
    });

    const onSubmit = (values: FormValues) => {
        upsertProfile.mutate(values);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="riskTolerance"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Risk Tolerance</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select risk tolerance" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="monthlyBudget"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Monthly Budget ($)</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={upsertProfile.isPending}>
                    {upsertProfile.isPending ? (
                        <LoaderIcon className="size-4 mr-2 animate-spin" />
                    ) : (
                        <SaveIcon className="size-4 mr-2" />
                    )}
                    Save Profile
                </Button>
            </form>
        </Form>
    );
};
