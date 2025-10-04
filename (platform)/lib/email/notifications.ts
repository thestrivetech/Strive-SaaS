import nodemailer from 'nodemailer';

/**
 * Email Notification Service
 *
 * Uses nodemailer with SMTP configuration for sending transactional emails.
 * Configuration is loaded from environment variables.
 */

/**
 * Create and configure SMTP transporter
 */
function createTransporter() {
  // Validate required environment variables
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !port || !user || !password) {
    console.warn('SMTP configuration incomplete. Email sending will fail.');
    // Return a mock transporter in development if SMTP not configured
    return nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true,
    });
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(port, 10),
    secure: parseInt(port, 10) === 465, // true for port 465, false for other ports
    auth: {
      user,
      pass: password,
    },
  });
}

/**
 * Parameters for signature request email
 */
export interface SignatureRequestEmailParams {
  to: string;
  signerName: string;
  documentName: string;
  requestTitle: string;
  message?: string;
  signUrl: string;
  expiresAt?: Date;
}

/**
 * Send signature request email to a signer
 *
 * @param params - Email parameters
 * @returns Promise<{success: boolean, messageId?: string}>
 *
 * @example
 * ```typescript
 * await sendSignatureRequestEmail({
 *   to: 'buyer@example.com',
 *   signerName: 'John Buyer',
 *   documentName: 'Purchase Agreement.pdf',
 *   requestTitle: '123 Main St Purchase Agreement',
 *   message: 'Please review and sign the purchase agreement.',
 *   signUrl: 'https://app.strivetech.ai/transactions/sign/sig-123',
 *   expiresAt: new Date('2025-10-11')
 * });
 * ```
 */
export async function sendSignatureRequestEmail(
  params: SignatureRequestEmailParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = createTransporter();
    const from = process.env.SMTP_FROM || 'noreply@strivetech.ai';

    // Build expiration text
    const expirationText = params.expiresAt
      ? `<p><small style="color: #666;">This signature request expires on ${params.expiresAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}.</small></p>`
      : '<p><small style="color: #666;">This signature request expires in 7 days.</small></p>';

    // HTML email template
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Signature Request: ${params.requestTitle}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Signature Requested</h1>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #1f2937; margin-top: 0;">Hello ${params.signerName},</h2>

    <p style="color: #4b5563; font-size: 16px;">
      You have been requested to sign the following document:
    </p>

    <div style="background: #f9fafb; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">${params.requestTitle}</h3>
      <p style="margin: 0; color: #6b7280;"><strong>Document:</strong> ${params.documentName}</p>
    </div>

    ${params.message ? `<p style="color: #4b5563; font-size: 16px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; margin: 20px 0;"><strong>Message:</strong><br>${params.message}</p>` : ''}

    <div style="text-align: center; margin: 30px 0;">
      <a href="${params.signUrl}"
         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        Review & Sign Document
      </a>
    </div>

    ${expirationText}

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="color: #6b7280; font-size: 14px; margin: 0;">
      <strong>Note:</strong> This is an automated email. Please do not reply to this message.
    </p>

    <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0 0;">
      If you have any questions, please contact the sender directly.
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 5px 0;">© ${new Date().getFullYear()} Strive Tech. All rights reserved.</p>
    <p style="margin: 5px 0;">Powered by Strive Transaction Management</p>
  </div>

</body>
</html>
    `.trim();

    // Plain text version (fallback)
    const textContent = `
Signature Requested

Hello ${params.signerName},

You have been requested to sign the following document:

${params.requestTitle}
Document: ${params.documentName}

${params.message ? `Message: ${params.message}\n\n` : ''}

To review and sign the document, please visit:
${params.signUrl}

${params.expiresAt ? `This request expires on ${params.expiresAt.toLocaleDateString()}.` : 'This request expires in 7 days.'}

---
This is an automated email. Please do not reply to this message.
If you have questions, please contact the sender directly.

© ${new Date().getFullYear()} Strive Tech. All rights reserved.
    `.trim();

    // Send email
    const info = await transporter.sendMail({
      from: `"Strive Transactions" <${from}>`,
      to: params.to,
      subject: `Signature Requested: ${params.requestTitle}`,
      text: textContent,
      html: htmlContent,
    });

    console.log('Signature request email sent:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Failed to send signature request email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Parameters for party invitation email
 */
export interface PartyInvitationEmailParams {
  to: string;
  partyName: string;
  role: string;
  loopAddress: string;
  inviteUrl: string;
}

/**
 * Send party invitation email
 *
 * Notifies a party that they've been added to a transaction loop.
 *
 * @param params - Email parameters
 * @returns Promise<{success: boolean, messageId?: string}>
 *
 * @example
 * ```typescript
 * await sendPartyInvitationEmail({
 *   to: 'buyer@example.com',
 *   partyName: 'John Buyer',
 *   role: 'BUYER',
 *   loopAddress: '123 Main St, San Francisco, CA',
 *   inviteUrl: 'https://app.strivetech.ai/transactions/loop-123'
 * });
 * ```
 */
export async function sendPartyInvitationEmail(
  params: PartyInvitationEmailParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = createTransporter();
    const from = process.env.SMTP_FROM || 'noreply@strivetech.ai';

    // HTML email template
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've Been Added to ${params.loopAddress}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Transaction Invitation</h1>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #1f2937; margin-top: 0;">Hello ${params.partyName},</h2>

    <p style="color: #4b5563; font-size: 16px;">
      You have been added as a <strong>${params.role}</strong> to the following transaction:
    </p>

    <div style="background: #f9fafb; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
      <h3 style="margin: 0; color: #1f2937; font-size: 18px;">${params.loopAddress}</h3>
    </div>

    <p style="color: #4b5563; font-size: 16px;">
      You can now access transaction documents, track progress, and collaborate with other parties.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${params.inviteUrl}"
         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        View Transaction
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="color: #6b7280; font-size: 14px; margin: 0;">
      <strong>Note:</strong> This is an automated email. Please do not reply to this message.
    </p>

    <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0 0;">
      If you have any questions, please contact the transaction coordinator directly.
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 5px 0;">© ${new Date().getFullYear()} Strive Tech. All rights reserved.</p>
    <p style="margin: 5px 0;">Powered by Strive Transaction Management</p>
  </div>

</body>
</html>
    `.trim();

    // Plain text version (fallback)
    const textContent = `
Transaction Invitation

Hello ${params.partyName},

You have been added as a ${params.role} to the following transaction:

${params.loopAddress}

You can now access transaction documents, track progress, and collaborate with other parties.

To view the transaction, please visit:
${params.inviteUrl}

---
This is an automated email. Please do not reply to this message.
If you have questions, please contact the transaction coordinator directly.

© ${new Date().getFullYear()} Strive Tech. All rights reserved.
    `.trim();

    // Send email
    const info = await transporter.sendMail({
      from: `"Strive Transactions" <${from}>`,
      to: params.to,
      subject: `You've been added to ${params.loopAddress}`,
      text: textContent,
      html: htmlContent,
    });

    console.log('Party invitation email sent:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Failed to send party invitation email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Parameters for task assignment email
 */
export interface TaskAssignmentEmailParams {
  to: string;
  assigneeName: string;
  taskTitle: string;
  dueDate?: Date;
  loopAddress: string;
  taskUrl: string;
}

/**
 * Send task assignment email
 *
 * Notifies a party that they've been assigned a task in a transaction loop.
 *
 * @param params - Email parameters
 * @returns Promise<{success: boolean, messageId?: string}>
 *
 * @example
 * ```typescript
 * await sendTaskAssignmentEmail({
 *   to: 'inspector@example.com',
 *   assigneeName: 'Bob Inspector',
 *   taskTitle: 'Complete property inspection',
 *   dueDate: new Date('2025-10-15'),
 *   loopAddress: '123 Main St, San Francisco, CA',
 *   taskUrl: 'https://app.strivetech.ai/transactions/loop-123?tab=tasks'
 * });
 * ```
 */
export async function sendTaskAssignmentEmail(
  params: TaskAssignmentEmailParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = createTransporter();
    const from = process.env.SMTP_FROM || 'noreply@strivetech.ai';

    // Build due date text
    const dueDateText = params.dueDate
      ? `<p style="color: #6b7280;"><strong>Due Date:</strong> ${params.dueDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</p>`
      : '';

    // HTML email template
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Assigned: ${params.taskTitle}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Task Assigned</h1>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #1f2937; margin-top: 0;">Hello ${params.assigneeName},</h2>

    <p style="color: #4b5563; font-size: 16px;">
      You have been assigned a new task:
    </p>

    <div style="background: #f9fafb; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">${params.taskTitle}</h3>
      <p style="margin: 0; color: #6b7280;"><strong>Transaction:</strong> ${params.loopAddress}</p>
      ${dueDateText}
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${params.taskUrl}"
         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        View Task
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="color: #6b7280; font-size: 14px; margin: 0;">
      <strong>Note:</strong> This is an automated email. Please do not reply to this message.
    </p>

    <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0 0;">
      If you have any questions about this task, please contact the transaction coordinator.
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 5px 0;">© ${new Date().getFullYear()} Strive Tech. All rights reserved.</p>
    <p style="margin: 5px 0;">Powered by Strive Transaction Management</p>
  </div>

</body>
</html>
    `.trim();

    // Plain text version (fallback)
    const textContent = `
Task Assigned

Hello ${params.assigneeName},

You have been assigned a new task:

${params.taskTitle}

Transaction: ${params.loopAddress}
${params.dueDate ? `Due Date: ${params.dueDate.toLocaleDateString()}` : ''}

To view the task, please visit:
${params.taskUrl}

---
This is an automated email. Please do not reply to this message.
If you have questions about this task, please contact the transaction coordinator.

© ${new Date().getFullYear()} Strive Tech. All rights reserved.
    `.trim();

    // Send email
    const info = await transporter.sendMail({
      from: `"Strive Transactions" <${from}>`,
      to: params.to,
      subject: `Task Assigned: ${params.taskTitle}`,
      text: textContent,
      html: htmlContent,
    });

    console.log('Task assignment email sent:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Failed to send task assignment email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
