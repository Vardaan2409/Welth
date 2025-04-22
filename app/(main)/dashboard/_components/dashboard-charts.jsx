"use client";

import { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    AreaChart,
    Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const DATE_RANGES = {
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    "90d": "Last 90 Days",
    "1y": "Last Year",
};

const CHART_TYPES = {
    line: "Line Chart",
    area: "Area Chart",
    bar: "Bar Chart",
    pie: "Pie Chart",
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export function DashboardCharts({ transactions }) {
    const [dateRange, setDateRange] = useState("30d");
    const [chartType, setChartType] = useState("line");

    // Filter transactions based on date range
    const filteredTransactions = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        const now = new Date();
        const daysAgo = new Date(now.setDate(now.getDate() - parseInt(dateRange)));
        return transactionDate >= daysAgo;
    });

    // Group transactions by date
    const groupedData = filteredTransactions.reduce((acc, transaction) => {
        const date = format(new Date(transaction.date), "MMM dd");
        if (!acc[date]) {
            acc[date] = {
                date,
                income: 0,
                expense: 0,
            };
        }
        if (transaction.type === "income") {
            acc[date].income += transaction.amount;
        } else {
            acc[date].expense += transaction.amount;
        }
        return acc;
    }, {});

    const chartData = Object.values(groupedData).sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });

    // Calculate totals
    const totals = chartData.reduce(
        (acc, day) => ({
            income: acc.income + day.income,
            expense: acc.expense + day.expense,
        }),
        { income: 0, expense: 0 }
    );

    const renderChart = () => {
        switch (chartType) {
            case "line":
                return (
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="income" stroke="#0088FE" name="Income" />
                        <Line type="monotone" dataKey="expense" stroke="#FF8042" name="Expense" />
                    </LineChart>
                );
            case "area":
                return (
                    <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="income" stroke="#0088FE" fill="#0088FE" name="Income" />
                        <Area type="monotone" dataKey="expense" stroke="#FF8042" fill="#FF8042" name="Expense" />
                    </AreaChart>
                );
            case "bar":
                return (
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="income" fill="#0088FE" name="Income" />
                        <Bar dataKey="expense" fill="#FF8042" name="Expense" />
                    </BarChart>
                );
            case "pie":
                const pieData = [
                    { name: "Income", value: totals.income },
                    { name: "Expense", value: totals.expense },
                ];
                return (
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                );
            default:
                return null;
        }
    };

    return (
        <Card className="col-span-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transaction Overview</CardTitle>
                <div className="flex items-center space-x-2">
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select date range" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(DATE_RANGES).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={chartType} onValueChange={setChartType}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select chart type" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(CHART_TYPES).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        {renderChart()}
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="rounded-lg border p-3">
                        <div className="text-sm font-medium text-muted-foreground">Total Income</div>
                        <div className="text-2xl font-bold text-green-600">${totals.income.toFixed(2)}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                        <div className="text-sm font-medium text-muted-foreground">Total Expenses</div>
                        <div className="text-2xl font-bold text-red-600">${totals.expense.toFixed(2)}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                        <div className="text-sm font-medium text-muted-foreground">Net</div>
                        <div className={`text-2xl font-bold ${totals.income - totals.expense >= 0 ? "text-green-600" : "text-red-600"}`}>
                            ${(totals.income - totals.expense).toFixed(2)}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 