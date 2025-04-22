import { prisma } from '../prisma';
import { generateFinancialInsights } from '../analytics';
import { generateFinancialInsightsEmail } from '../email-templates/financial-insights';
import { sendEmail } from '../email';

export async function sendFinancialInsights() {
    try {
        // Get all users who have opted in for insights
        const users = await prisma.user.findMany({
            where: {
                emailNotifications: {
                    financialInsights: true
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
            }
        }
    } catch (error) {
        console.error('Error in sendFinancialInsights:', error);
    }
} 