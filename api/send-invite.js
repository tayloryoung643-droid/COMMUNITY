import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, fullName, token, buildingName, joinUrl: customJoinUrl, invite_type } = req.body;

  // Validate required fields
  if (!email || !buildingName) {
    return res.status(400).json({ error: 'Missing required fields: email, buildingName' });
  }

  // Support both token-based (manager) and URL-based (resident) invites
  const joinUrl = customJoinUrl || (token ? `https://www.communityhq.space/join?token=${token}` : 'https://www.communityhq.space');

  // Adjust context line based on invite source
  const isResident = invite_type === 'resident';
  const contextLine = isResident
    ? `Your neighbor at ${buildingName} thought you'd love this.`
    : `Your building manager at ${buildingName} invited you to join.`;

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
        <body style="margin: 0; padding: 0; background-color: #F5F0EB; font-family: Arial, Helvetica, sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F5F0EB;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px;">

                  <!-- Brand -->
                  <tr>
                    <td align="center" style="padding: 0 30px 40px;">
                      <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 3px; color: #8B7E74; text-transform: uppercase;">COMMUNITY</p>
                    </td>
                  </tr>

                  <!-- Tagline -->
                  <tr>
                    <td align="center" style="padding: 0 30px 40px;">
                      <p style="margin: 0 0 4px; font-family: Georgia, 'Times New Roman', Times, serif; font-size: 28px; font-weight: 300; line-height: 1.3; color: #2C2520;">Fall in love with</p>
                      <p style="margin: 0; font-family: Georgia, 'Times New Roman', Times, serif; font-size: 28px; font-weight: 300; font-style: italic; line-height: 1.3; color: #8B6914;">your community.</p>
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr>
                    <td align="center" style="padding: 0 80px 32px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="border-top: 1px solid #E0D5C8; font-size: 0; line-height: 0;">&nbsp;</td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Context Line -->
                  <tr>
                    <td align="center" style="padding: 0 30px 36px;">
                      <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.6; color: #6B5E52;">${contextLine}</p>
                    </td>
                  </tr>

                  <!-- CTA Button -->
                  <tr>
                    <td align="center" style="padding: 0 30px 16px;">
                      <table role="presentation" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center" style="background-color: #2C2520; border-radius: 50px;">
                            <a href="${joinUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 1px; color: #F5F0EB; text-decoration: none; text-transform: uppercase;">Join Your Building &rarr;</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Plain text URL fallback -->
                  <tr>
                    <td align="center" style="padding: 0 30px 40px;">
                      <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 11px; line-height: 1.5; color: #B5A99D; word-break: break-all;"><a href="${joinUrl}" style="color: #B5A99D; text-decoration: underline;">${joinUrl}</a></p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding: 0 30px 8px;">
                      <p style="margin: 0; font-family: Georgia, 'Times New Roman', Times, serif; font-size: 13px; font-style: italic; color: #B5A99D;">Your building, connected.</p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 0 30px 40px;">
                      <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 11px; line-height: 1.5; color: #C8BFAD;">If you didn't expect this invite, you can safely ignore this email.</p>
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
