"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
    const { data: session } = useSession();
    const [emailPreferences, setEmailPreferences] = useState({
        financialInsights: true
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPreferences() {
            try {
                const response = await fetch('/api/user/preferences');
                if (response.ok) {
                    const data = await response.json();
                    setEmailPreferences(data.emailNotifications || { financialInsights: true });
                }
            } catch (error) {
                console.error('Error fetching preferences:', error);
                toast.error('Failed to load preferences');
            } finally {
                setLoading(false);
            }
        }

        if (session?.user) {
            fetchPreferences();
        }
    }, [session]);

    const handleToggle = async (key) => {
        try {
            const newPreferences = {
                ...emailPreferences,
                [key]: !emailPreferences[key]
            };
            
            const response = await fetch('/api/user/preferences', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ emailNotifications: newPreferences }),
            });

            if (response.ok) {
                setEmailPreferences(newPreferences);
                toast.success('Preferences updated successfully');
            } else {
                throw new Error('Failed to update preferences');
            }
        } catch (error) {
            console.error('Error updating preferences:', error);
            toast.error('Failed to update preferences');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Email Notifications</CardTitle>
                    <CardDescription>
                        Manage your email notification preferences
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between py-4">
                        <div>
                            <h3 className="font-medium">Financial Insights</h3>
                            <p className="text-sm text-muted-foreground">
                                Receive monthly AI-powered insights about your spending patterns and financial health
                            </p>
                        </div>
                        <Switch
                            checked={emailPreferences.financialInsights}
                            onCheckedChange={() => handleToggle('financialInsights')}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 