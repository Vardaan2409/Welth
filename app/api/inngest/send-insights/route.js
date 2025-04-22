import { Inngest } from 'inngest';
import { generateFinancialInsights } from '@/lib/analytics';
import { generateFinancialInsightsEmail } from '@/lib/email-templates/financial-insights';
import { sendEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';

// Initialize Inngest
const inngest = new Inngest({ id: "welth" });

// Create a scheduled function that runs monthly
export const { GET, POST } = inngest.createFunction(
    { id: "send-financial-insights" },
    { cron: "0 0 1 * *" }, // Run at midnight on the 1st of every month
    async ({ event }) => {
        try {
            // Get all users who have opted in for insights
            const users = await prisma.user.findMany({
                where: {
                    emailNotifications: {
                        path: ['financialInsights'],
                        equals: true
                    }
                }
            });

            for (const user of users) {
                try {
                    // Generate insights for each user
                    const { insights, data } = await generateFinancialInsights(user.id);

                    // Generate email content
                    const email = generateFinancialInsightsEmail(user, insights, data);

                    // Send email
                    await sendEmail({
                        to: user.email,
                        subject: email.subject,
                        html: email.html
                    });

                    console.log(`Financial insights email sent to ${user.email}`);
                } catch (error) {
                    console.error(`Error sending insights to ${user.email}:`, error);
                    // Log the error to your error tracking system
                }
            }

            return { success: true, message: "Financial insights sent successfully" };
        } catch (error) {
            console.error('Error in sendFinancialInsights:', error);
            throw error;
        }
    }
); 