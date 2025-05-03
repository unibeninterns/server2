import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
import validateEnv from '../utils/validateEnv.js';

validateEnv();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    this.frontendUrl = process.env.FRONTEND_URL;
    this.emailFrom = process.env.EMAIL_FROM;

    if (!this.frontendUrl || !this.emailFrom) {
      throw new Error(
        'FRONTEND_URL and EMAIL_FROM must be defined in environment variables'
      );
    }
  }

  async sendProposalNotificationEmail(
    reviewerEmails,
    researcher,
    proposalTitle,
    submitterType
  ) {
    const submitterTypeText =
      submitterType === 'staff' ? 'Staff Member' : "Master's Student";
    const reviewUrl = `${this.frontendUrl}/admin/proposals`;

    // Handle comma-separated emails or single email
    const recipients = Array.isArray(reviewerEmails)
      ? reviewerEmails
      : reviewerEmails.split(',').map((email) => email.trim());

    try {
      await this.transporter.sendMail({
        from: this.emailFrom,
        to: recipients.join(','),
        subject: `New Research Proposal Submission by ${researcher}`,
        html: `
        <h1>New Research Proposal Submission</h1>
        <p><strong>${researcher}</strong> (${submitterTypeText}) has submitted a new research proposal titled:</p>
        <p><strong>"${proposalTitle}"</strong></p>
        <p>Please log in to the research portal to review this proposal.</p>
        <a href="${reviewUrl}">Review Proposals</a>
      `,
      });
      logger.info(
        `Proposal notification email sent to reviewers: ${recipients.join(', ')}`
      );
    } catch (error) {
      logger.error('Failed to send proposal notification email:', error);
      // Not throwing to prevent proposal submission failure
    }
  }

  async sendSubmissionConfirmationEmail(
    email,
    name,
    proposalTitle,
    submitterType
  ) {
    const submitterTypeText =
      submitterType === 'staff' ? 'Staff' : "Master's Student";

    try {
      await this.transporter.sendMail({
        from: this.emailFrom,
        to: email,
        subject: `Research Proposal Submission Confirmation`,
        html: `
          <h1>Proposal Submission Confirmation</h1>
          <p>Dear ${name},</p>
          <p>Thank you for submitting your ${submitterTypeText} research proposal${submitterType === 'staff' && proposalTitle ? ` titled <strong>"${proposalTitle}"</strong>` : ''}.</p>
          <p>Your proposal has been received and is now under review.</p>
        `,
      });
      logger.info(`Submission confirmation email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send submission confirmation email:', error);
      // Not throwing to prevent proposal submission failure
    }
  }

  async sendProposalStatusUpdateEmail(
    email,
    researcher,
    proposalTitle,
    status
  ) {
    const statusText = {
      approved: 'approved',
      rejected: 'rejected',
      revision_requested: 'returned for revision',
      under_review: 'under review',
    };

    const statusMessage = statusText[status] || status;
    const proposalUrl = `${this.frontendUrl}/proposals/my-proposals`;

    try {
      await this.transporter.sendMail({
        from: this.emailFrom,
        to: email,
        subject: `Research Proposal Status Update: ${proposalTitle}`,
        html: `
          <h1>Research Proposal Status Update</h1>
          <p>Dear ${researcher},</p>
          <p>Your research proposal titled <strong>"${proposalTitle}"</strong> has been <strong>${statusMessage}</strong>.</p>
          <p>Please log in to the research portal to view more details.</p>
          <a href="${proposalUrl}">View Your Proposals</a>
        `,
      });
      logger.info(`Proposal status update email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send proposal status update email:', error);
    }
  }
}

export default new EmailService();
