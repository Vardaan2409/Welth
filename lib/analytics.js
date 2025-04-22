import { prisma } from './prisma';
import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateFinancialInsights(userId) {
    try {
        // Get user's transactions for the last 3 months
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const transactions = await prisma.transaction.findMany({
            where: {
                account: {
                    userId: userId
                },
                date: {
                    gte: threeMonthsAgo
                }
            },
            include: {
                category: true
            },
            orderBy: {
                date: 'desc'
            }
        });

        // Get user's budget
        const budget = await prisma.budget.findFirst({
            where: {
                account: {
                    userId: userId
                }
            }
        });

        // Calculate spending patterns
        const spendingByCategory = transactions.reduce((acc, transaction) => {
            if (transaction.type === 'EXPENSE') {
                const category = transaction.category?.name || 'Uncategorized';
                acc[category] = (acc[category] || 0) + Number(transaction.amount);
            }
            return acc;
        }, {});

        // Calculate income patterns
        const incomeBySource = transactions.reduce((acc, transaction) => {
            if (transaction.type === 'INCOME') {
                const source = transaction.category?.name || 'Other';
                acc[source] = (acc[source] || 0) + Number(transaction.amount);
            }
            return acc;
        }, {});

        // Prepare data for AI analysis
        const analysisData = {
            spendingPatterns: spendingByCategory,
            incomeSources: incomeBySource,
            totalExpenses: Object.values(spendingByCategory).reduce((a, b) => a + b, 0),
            totalIncome: Object.values(incomeBySource).reduce((a, b) => a + b, 0),
            budget: budget ? {
                amount: Number(budget.amount),
                spent: Number(budget.spent)
            } : null
        };

        // Generate insights using OpenAI
        const prompt = `Analyze the following financial data and provide personalized insights and recommendations:
        Spending Patterns: ${JSON.stringify(analysisData.spendingPatterns)}
        Income Sources: ${JSON.stringify(analysisData.incomeSources)}
        Total Expenses: ${analysisData.totalExpenses}
        Total Income: ${analysisData.totalIncome}
        Budget: ${JSON.stringify(analysisData.budget)}

        Please provide:
        1. Key spending patterns and potential areas for savings
        2. Income optimization opportunities
        3. Budget management recommendations
        4. Specific actionable steps to improve financial health
        5. Risk areas to watch out for

        Format the response in a clear, concise manner with bullet points and specific numbers where relevant.`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-3.5-turbo",
            temperature: 0.7,
            max_tokens: 1000
        });

        return {
            insights: completion.choices[0].message.content,
            data: analysisData
        };
    } catch (error) {
        console.error('Error generating financial insights:', error);
        throw error;
    }
} 