import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
import validateEnv from '../utils/validateEnv.js';

validateEnv();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
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
        <html>
<head>
    <style type="text/css">
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .header {
            color: #AA319A; /* Fuchsia/purple accent color */
            border-bottom: 2px solid #AA319A;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .content {
            padding: 15px;
            background-color: #ffffff;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .proposal-title {
            font-size: 18px;
            color: #AA319A;
            padding: 10px;
            background-color: #f8e0f5;
            border-left: 3px solid #AA319A;
            margin: 15px 0;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #AA319A;
            color: white !important;
            text-decoration: none;
            border-radius: 4px;
            margin: 15px 0;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e0e0e0;
            font-size: 14px;
            color: #666666;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>New Research Proposal Submission</h1>
    </div>
    
    <div class="content">
        <p><strong>${researcher}</strong> (${submitterTypeText}) has submitted a new research proposal titled:</p>
        
        <div class="proposal-title">"${proposalTitle}"</div>
        
        <p>Please log in to the research portal to review this proposal at your earliest convenience.</p>
        
        <a href="${reviewUrl}" class="button">Review Proposal Now</a>
        
        <p>For any questions regarding the review process, please contact the Research Directorate.</p>
    </div>
    
    <div class="footer">
        <p><strong>Directorate of Research, Innovation and Development</strong></p>
        <p>University of Benin • PMB 1154, Benin City, Nigeria</p>
    </div>
</body>
</html>
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
          <html>
<head>
    <style type="text/css">
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            color: #AA319A;
            border-bottom: 2px solid #AA319A;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .content {
            padding: 10px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e0e0e0;
            font-size: 14px;
            color: #666666;
        }
        .highlight {
            color: #AA319A;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Proposal Submission Confirmation</h1>
    </div>
    
    <div class="content">
        <p>Dear ${name},</p>
        
        <p>Thank you for submitting your ${submitterTypeText} research proposal${submitterType === 'staff' && proposalTitle ? ` titled <strong class="highlight">"${proposalTitle}"</strong>` : ''}.</p>
        
        <p>Your proposal has been received and is now under review by our committee.</p>
        
        <p>We appreciate your contribution to the research community at the University of Benin. You will receive further communication regarding the status of your proposal as soon as possible</p>
    </div>
    
    <div class="footer">
        <p><strong>Best regards,</strong></p>
        <p>Directorate of Research, Innovation and Development<br>
        University of Benin<br>
        PMB 1154, Benin City, Nigeria</p>
    </div>
</body>
</html>
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
