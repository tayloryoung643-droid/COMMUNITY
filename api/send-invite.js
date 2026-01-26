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

  const joinUrl = `https://community-eight-theta.vercel.app/join?token=${token}`;
  const displayName = fullName || 'Neighbor';

  try {
    const { data, error } = await resend.emails.send({
      from: 'Community <noreply@mail.communityhq.space>',
      to: [email],
      subject: `You're invited to join ${buildingName} on Community`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">Welcome to Community</h1>
          </div>

          <p style="font-size: 16px; margin-bottom: 16px;">Hi ${displayName},</p>

          <p style="font-size: 16px; margin-bottom: 16px;">
            You've been invited to join <strong>${buildingName}</strong> on Community — the app that connects you with your neighbors.
          </p>

          <p style="font-size: 16px; margin-bottom: 24px;">
            With Community, you can:
          </p>

          <ul style="font-size: 16px; margin-bottom: 24px; padding-left: 24px;">
            <li>Get notified when packages arrive</li>
            <li>RSVP to building events</li>
            <li>Connect with neighbors</li>
            <li>Book shared amenities</li>
            <li>Stay updated on building news</li>
          </ul>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${joinUrl}" style="background-color: #1a1a1a; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 500; display: inline-block;">
              Join ${buildingName}
            </a>
          </div>

          <p style="font-size: 14px; color: #666; margin-top: 32px;">
            Or copy and paste this link into your browser:<br>
            <a href="${joinUrl}" style="color: #1a1a1a; word-break: break-all;">${joinUrl}</a>
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">

          <p style="font-size: 12px; color: #999; text-align: center;">
            This invitation was sent by your building manager. If you didn't expect this email, you can safely ignore it.
          </p>
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
