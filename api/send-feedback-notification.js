import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const CATEGORY_LABELS = {
  bug: 'Bug Report',
  feature_request: 'Suggestion',
  question: 'Question',
  general_feedback: 'Feedback',
  contact_form: 'Contact Form',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { category, subject, message, userName, userEmail, userRole, buildingName, pageContext, timestamp } = req.body;

  if (!message || !category) {
    return res.status(400).json({ error: 'Missing required fields: message, category' });
  }

  const categoryLabel = CATEGORY_LABELS[category] || category;
  const emailSubject = subject
    ? `[COMMUNITY] ${categoryLabel}: ${subject}`
    : `[COMMUNITY] ${categoryLabel} from ${userName || 'Anonymous'}`;

  const submittedAt = timestamp ? new Date(timestamp).toLocaleString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
  }) : new Date().toLocaleString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
  });

  const roleLabel = userRole || 'Unknown';
  const displayName = userName || 'Anonymous';

  try {
    const { data, error } = await resend.emails.send({
      from: 'Community <noreply@mail.communityhq.space>',
      to: ['taylor@communityhq.space'],
      replyTo: userEmail || undefined,
      subject: emailSubject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f9f8f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9f8f6;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">

                  <!-- Header Bar -->
                  <tr>
                    <td style="padding: 24px 36px; background: linear-gradient(135deg, #5B8A8A 0%, #4A7878 100%);">
                      <p style="margin: 0; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; color: rgba(255,255,255,0.8); text-transform: uppercase;">
                        Community Feedback
                      </p>
                      <h1 style="margin: 8px 0 0; font-size: 22px; font-weight: 600; color: #ffffff;">
                        ${categoryLabel}
                      </h1>
                    </td>
                  </tr>

                  <!-- Subject -->
                  ${subject ? `
                  <tr>
                    <td style="padding: 28px 36px 0;">
                      <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">
                        ${subject}
                      </h2>
                    </td>
                  </tr>
                  ` : ''}

                  <!-- Message -->
                  <tr>
                    <td style="padding: ${subject ? '16px' : '28px'} 36px 28px;">
                      <div style="padding: 20px; background-color: #f9f8f6; border-radius: 10px; border-left: 4px solid #5B8A8A;">
                        <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #333; white-space: pre-wrap;">${message}</p>
                      </div>
                    </td>
                  </tr>

                  <!-- Details Table -->
                  <tr>
                    <td style="padding: 0 36px 28px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                        <tr>
                          <td style="padding: 10px 0; border-top: 1px solid #eee; font-size: 13px; color: #888; width: 110px; vertical-align: top;">From</td>
                          <td style="padding: 10px 0; border-top: 1px solid #eee; font-size: 14px; color: #333; font-weight: 500;">${displayName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-top: 1px solid #eee; font-size: 13px; color: #888; vertical-align: top;">Email</td>
                          <td style="padding: 10px 0; border-top: 1px solid #eee; font-size: 14px; color: #333;">
                            ${userEmail ? `<a href="mailto:${userEmail}" style="color: #5B8A8A; text-decoration: none;">${userEmail}</a>` : '<span style="color: #aaa;">Not provided</span>'}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-top: 1px solid #eee; font-size: 13px; color: #888; vertical-align: top;">Role</td>
                          <td style="padding: 10px 0; border-top: 1px solid #eee; font-size: 14px; color: #333;">${roleLabel}</td>
                        </tr>
                        ${buildingName ? `
                        <tr>
                          <td style="padding: 10px 0; border-top: 1px solid #eee; font-size: 13px; color: #888; vertical-align: top;">Building</td>
                          <td style="padding: 10px 0; border-top: 1px solid #eee; font-size: 14px; color: #333;">${buildingName}</td>
                        </tr>
                        ` : ''}
                        ${pageContext ? `
                        <tr>
                          <td style="padding: 10px 0; border-top: 1px solid #eee; font-size: 13px; color: #888; vertical-align: top;">Page</td>
                          <td style="padding: 10px 0; border-top: 1px solid #eee; font-size: 14px; color: #333;">${pageContext}</td>
                        </tr>
                        ` : ''}
                        <tr>
                          <td style="padding: 10px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; font-size: 13px; color: #888; vertical-align: top;">Time</td>
                          <td style="padding: 10px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; font-size: 14px; color: #333;">${submittedAt}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 36px; background-color: #f9f8f6;">
                      <p style="margin: 0; font-size: 12px; color: #999; text-align: center;">
                        This notification was sent from Community App feedback system.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('[send-feedback-notification] Resend error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('[send-feedback-notification] Email sent:', data?.id);
    return res.status(200).json({ success: true, messageId: data?.id });
  } catch (err) {
    console.error('[send-feedback-notification] Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to send notification' });
  }
}
