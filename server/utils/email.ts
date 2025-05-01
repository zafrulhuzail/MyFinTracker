// A simple utility to send emails
// In a production environment, this would use a real email service
// like SendGrid, Mailgun, or AWS SES

export async function sendEmail(
  to: string,
  subject: string,
  body: string
): Promise<void> {
  console.log(`Email sent to: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  
  // In a real implementation, this would call an email service API
  // For MVP, we'll just log the email content
  
  return Promise.resolve();
}
