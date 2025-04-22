import { Inngest } from 'inngest';
import { generateFinancialInsights } from '@/lib/analytics';
import { generateFinancialInsightsEmail } from '@/lib/email-templates/financial-insights';
import { sendEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';

const inngest = new Inngest({ id: "welth" });

export const { GET, POST } = inngest.createFunction(
    { id: "generate-insights" },
    { event: "insights.generate" },
    async ({ event }) => {
        try {
            const { userId } = event.data;

            // Get user
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                throw new Error('User not found');
            }

            // Generate insights
            const { insights, data } = await generateFinancialInsights(userId);

            // Generate email content
            const email = generateFinancialInsightsEmail(user, insights, data);

            // Send email
            await sendEmail({
                to: user.email,
                subject: email.subject,
                html: email.html
            });

            return { 
                success: true, 
                message: "Insights generated and sent successfully",
                userId 
            };
        } catch (error) {
            console.error('Error in generateInsights:', error);
            throw error;
        }
    }
); 