"use client";

import { getUserAccounts } from '@/actions/dashboard';
import { getCurrentBudget } from '@/actions/budget';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import AccountCard from './_components/account-card';
import BudgetProgress from './budget-progress';
import DashboardCharts from './_components/dashboard-charts';
import CreateAccountDrawer from '@/components/create-account-drawer';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const [accounts, setAccounts] = useState([]);
    const [defaultAccount, setDefaultAccount] = useState(null);
    const [currentBudget, setCurrentBudget] = useState(null);
    const [allTransactions, setAllTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const accountsData = await getUserAccounts();
                setAccounts(accountsData);
                
                const defaultAcc = accountsData.find(account => account.isDefault);
                setDefaultAccount(defaultAcc);

                if (defaultAcc) {
                    const budgetData = await getCurrentBudget(defaultAcc.id);
                    setCurrentBudget(budgetData);
                }

                // Aggregate all transactions from all accounts
                const transactions = accountsData.reduce((acc, account) => {
                    return [...acc, ...(account.transactions || [])];
                }, []);
                setAllTransactions(transactions);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
        };

        if (status === 'authenticated') {
            fetchData();
        }
    }, [status]);

    const handleGenerateInsights = async () => {
        if (!session?.user?.id) {
            toast.error('Please sign in to generate insights');
            return;
        }

        try {
            const response = await fetch('/api/inngest/generate-insights', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: session.user.id
                })
            });

            if (response.ok) {
                toast.success('Insights generation started. You will receive an email shortly.');
            } else {
                throw new Error('Failed to generate insights');
            }
        } catch (error) {
            console.error('Error generating insights:', error);
            toast.error('Failed to generate insights');
        }
    };

    if (status === 'loading' || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Please sign in to view your dashboard</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <Button 
                    onClick={handleGenerateInsights}
                    className="bg-primary hover:bg-primary/90"
                >
                    Generate Insights
                </Button>
            </div>

            {/* Budget Progress */}
            {defaultAccount && (
                <BudgetProgress
                    initialBudget={currentBudget?.budget}
                    currentExpenses={currentBudget?.currentExpenses || 0}
                />
            )}

            {/* Accounts Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <CreateAccountDrawer>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed flex flex-col h-full">
                        <CardContent className="flex flex-col items-center justify-center text-muted-foreground flex-grow">
                            <Plus className="h-10 w-10 mb-2" />
                            <p className="text-sm font-medium">Add New Account</p>
                        </CardContent>
                    </Card>
                </CreateAccountDrawer>

                {accounts.length > 0 &&
                    accounts.map((account) => (
                        <AccountCard key={account.id} account={account} />
                    ))}
            </div>

            {/* Charts Section */}
            {accounts.length > 0 ? (
                allTransactions.length > 0 ? (
                    <DashboardCharts transactions={allTransactions} />
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <p className="text-muted-foreground text-center">
                                No transactions found. Add some transactions to see your financial overview.
                            </p>
                        </CardContent>
                    </Card>
                )
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                        <p className="text-muted-foreground text-center">
                            Create an account to start tracking your finances.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
