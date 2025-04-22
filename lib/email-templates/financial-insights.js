export function generateFinancialInsightsEmail(user, insights, data) {
    return {
        subject: `Your Personalized Financial Insights - ${new Date().toLocaleDateString()}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
                    .content { padding: 20px; }
                    .insights { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
                    .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
                    .stat-card { background-color: #fff; padding: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Your Financial Insights</h1>
                        <p>Personalized analysis of your financial health</p>
                    </div>
                    
                    <div class="content">
                        <h2>Hello ${user.name},</h2>
                        <p>Here's your monthly financial analysis and personalized recommendations to help you optimize your finances.</p>
                        
                        <div class="stats">
                            <div class="stat-card">
                                <h3>Total Income</h3>
                                <p>₹${data.totalIncome.toFixed(2)}</p>
                            </div>
                            <div class="stat-card">
                                <h3>Total Expenses</h3>
                                <p>₹${data.totalExpenses.toFixed(2)}</p>
                            </div>
                        </div>
                        
                        <div class="insights">
                            <h2>AI-Powered Insights</h2>
                            ${insights.split('\n').map(line => `<p>${line}</p>`).join('')}
                        </div>
                        
                        <p>Remember, these insights are based on your transaction history and are meant to help you make informed financial decisions.</p>
                        
                        <p>To view more detailed analytics, visit your dashboard at <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">${process.env.NEXT_PUBLIC_APP_URL}/dashboard</a></p>
                    </div>
                    
                    <div class="footer">
                        <p>This is an automated message. Please do not reply to this email.</p>
                        <p>© ${new Date().getFullYear()} Welth. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
} 