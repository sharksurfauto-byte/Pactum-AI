import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";

import { FinancialDashboardView } from "@/modules/financial/ui/views/financial-dashboard-view";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";

const FinancialPage = () => {
    return (
        <ErrorBoundary fallback={<ErrorState title="Error loading financial dashboard" description="Something went wrong" />}>
            <Suspense fallback={<LoadingState title="Loading Financial Dashboard" description="Fetching your financial data..." />}>
                <FinancialDashboardView />
            </Suspense>
        </ErrorBoundary>
    );
};

export default FinancialPage;
