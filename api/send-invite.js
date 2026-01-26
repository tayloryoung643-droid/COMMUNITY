import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, fullName, token, buildingName } = req.body;

  // Validate required fields
  if (!email || !token || !buildingName) {
    return res.status(400).json({ error: 'Missing required fields: email, token, buildingName' });
  }

  const joinUrl = `https://www.communityhq.space/join?token=${token}`;
  const displayName = fullName || 'Neighbor';

  // Get first name for personalization
  const firstName = displayName.split(' ')[0];

  try {
    const { data, error } = await resend.emails.send({
      from: 'Community <noreply@mail.communityhq.space>',
      to: [email],
      subject: `Your neighbors at ${buildingName} are waiting`,
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
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">

                  <!-- Hero Image -->
                  <tr>
                    <td style="padding: 0;">
                      <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1040&h=400&fit=crop&crop=bottom" alt="" width="100%" style="display: block; width: 100%; height: auto; max-height: 200px; object-fit: cover;">
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 36px 32px;">

                      <!-- Brand -->
                      <p style="margin: 0 0 24px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; color: #5B8A8A; text-transform: uppercase;">
                        Community
                      </p>

                      <!-- Headline -->
                      <h1 style="margin: 0 0 24px; font-size: 28px; font-weight: 600; line-height: 1.25; color: #1a1a1a;">
                        Join your neighbors at ${buildingName}
                      </h1>

                      <!-- Opening -->
                      <p style="margin: 0 0 28px; font-size: 16px; line-height: 1.6; color: #4a4a4a;">
                        Hi ${firstName}, your building manager has invited you to Community — a private space just for residents of ${buildingName}.
                      </p>

                      <!-- Value Section -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                        <tr>
                          <td style="padding: 20px 24px; background-color: #f9f8f6; border-radius: 12px;">
                            <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #3a3a3a;">
                              <span style="color: #5B8A8A;">✓</span>&nbsp;&nbsp;Never miss a package delivery
                            </p>
                            <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #3a3a3a;">
                              <span style="color: #5B8A8A;">✓</span>&nbsp;&nbsp;Know what's happening in your building
                            </p>
                            <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #3a3a3a;">
                              <span style="color: #5B8A8A;">✓</span>&nbsp;&nbsp;Book amenities without back-and-forth
                            </p>
                            <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #3a3a3a;">
                              <span style="color: #5B8A8A;">✓</span>&nbsp;&nbsp;Connect with neighbors when it matters
                            </p>
                            <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #3a3a3a;">
                              <span style="color: #5B8A8A;">✓</span>&nbsp;&nbsp;Get building updates in one place
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- CTA -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center">
                            <a href="${joinUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #5B8A8A 0%, #4A7878 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 10px;">
                              Join Your Building
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Reassurance -->
                      <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.5; color: #888; text-align: center;">
                        You'll create your account and confirm your unit. That's it.
                      </p>

                    </td>
                  </tr>

                  <!-- Light Urgency -->
                  <tr>
                    <td style="padding: 0 36px 32px;">
                      <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #666; text-align: center; font-style: italic;">
                        The earlier you join, the more useful Community becomes for everyone.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 36px; border-top: 1px solid #eee;">
                      <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #999; text-align: center;">
                        If you didn't expect this invite, you can safely ignore this email.
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
      console.error('[send-invite] Resend error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('[send-invite] Email sent successfully:', data?.id);
    return res.status(200).json({ success: true, messageId: data?.id });
  } catch (err) {
    console.error('[send-invite] Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to send email' });
  }
}
