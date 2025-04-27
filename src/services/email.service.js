import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
import validateEnv from '../utils/validateEnv.js';

validateEnv();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
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
    email,
    researcher,
    proposalTitle,
    submitterType
  ) {
    const submitterTypeText =
      submitterType === 'faculty' ? 'Faculty Member' : "Master's Student";
    const reviewUrl = `${this.frontendUrl}/admin/proposals`;

    try {
      await this.transporter.sendMail({
        from: this.emailFrom,
        to: email,
        subject: `New Research Proposal Submission by ${researcher}`,
        html: `
          <h1>New Research Proposal Submission</h1>
          <p><strong>${researcher}</strong> (${submitterTypeText}) has submitted a new research proposal titled:</p>
          <p><strong>"${proposalTitle}"</strong></p>
          <p>Please log in to the research portal to review this proposal.</p>
          <a href="${reviewUrl}">Review Proposals</a>
        `,
      });
      logger.info(`Proposal notification email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send proposal notification email:', error);
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
