import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function buildEmailHtml({ firstName, title, message, category, buildingName, managerName, ctaUrl, ctaText, isNewUser, buildingId }) {
  const categoryTag = category && category !== 'general'
    ? `<span style="display: inline-block; padding: 4px 12px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; background: #EDE8DF; color: #6B5E52; border-radius: 20px;">${category}</span>`
    : '';

  const nudgeSection = isNewUser
    ? `
      <tr>
        <td style="padding: 0 30px 24px;">
          <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #8B7E74;">Your neighbors at ${buildingName} are already using COMMUNITY to stay connected, share updates, and never miss what's happening in your building.</p>
        </td>
      </tr>`
    : '';

  const contextLine = isNewUser
    ? 'Your building manager posted a new announcement:'
    : `${managerName} posted a new announcement in COMMUNITY:`;

  const footerText = isNewUser
    ? `You're receiving this because your building manager added you to ${buildingName} on COMMUNITY.`
    : `You're receiving this because you're a resident of ${buildingName} on COMMUNITY.`;

  return `<!DOCTYPE html>
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
            <td align="center" style="padding: 0 30px 32px;">
              <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 3px; color: #8B7E74; text-transform: uppercase;">COMMUNITY</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 0 30px 8px;">
              <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: #2C2520;">Hi ${firstName || 'there'}!</p>
            </td>
          </tr>

          <!-- Context -->
          <tr>
            <td style="padding: 0 30px 24px;">
              <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.5; color: #6B5E52;">${contextLine}</p>
            </td>
          </tr>

          <!-- Announcement Card -->
          <tr>
            <td style="padding: 0 30px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #FFFCF7; border-radius: 12px; border: 1px solid #E8E2D8;">
                <tr>
                  <td style="padding: 20px;">
                    ${categoryTag ? `<div style="margin-bottom: 12px;">${categoryTag}</div>` : ''}
                    <p style="margin: 0 0 8px; font-family: Arial, Helvetica, sans-serif; font-size: 17px; font-weight: 700; color: #2C2520; line-height: 1.3;">${title}</p>
                    <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #6B5E52; white-space: pre-line;">${message}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${nudgeSection}

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 0 30px 16px;">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="background-color: #2C2520; border-radius: 50px;">
                    <a href="${ctaUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 1px; color: #F5F0EB; text-decoration: none; text-transform: uppercase;">${ctaText} &rarr;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td align="center" style="padding: 16px 80px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-top: 1px solid #E0D5C8; font-size: 0; line-height: 0;">&nbsp;</td>
                </tr>
              </table>
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
              <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 11px; line-height: 1.5; color: #C8BFAD;">${footerText}</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { emails, title, message, category, buildingName, managerName, buildingId } = req.body;

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: 'Missing required field: emails array' });
  }

  if (!title || !buildingName) {
    return res.status(400).json({ error: 'Missing required fields: title, buildingName' });
  }

  let sentCount = 0;
  let failedCount = 0;

  try {
    for (let i = 0; i < emails.length; i++) {
      const recipient = emails[i];
      if (!recipient.email) continue;

      // Rate limit: 600ms between sends
      if (i > 0) await delay(600);

      const isNewUser = !recipient.hasAccount;
      const ctaUrl = isNewUser
        ? `https://www.communityhq.space/join/${buildingId}`
        : 'https://www.communityhq.space';
      const ctaText = isNewUser
        ? `Join ${buildingName}`
        : 'View in Community';

      const html = buildEmailHtml({
        firstName: recipient.firstName || '',
        title,
        message,
        category,
        buildingName,
        managerName: managerName || 'Your building manager',
        ctaUrl,
        ctaText,
        isNewUser,
        buildingId
      });

      try {
        const { error } = await resend.emails.send({
          from: 'Community <noreply@mail.communityhq.space>',
          to: [recipient.email],
          subject: `New announcement from ${buildingName}`,
          html
        });

        if (error) {
          console.error('[send-announcement] Resend error for', recipient.email, ':', error);
          failedCount++;
        } else {
          sentCount++;
        }
      } catch (sendErr) {
        console.error('[send-announcement] Send error for', recipient.email, ':', sendErr);
        failedCount++;
      }
    }

    console.log(`[send-announcement] Done: ${sentCount} sent, ${failedCount} failed out of ${emails.length}`);
    return res.status(200).json({ success: true, sentCount, failedCount });
  } catch (err) {
    console.error('[send-announcement] Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to send announcement emails' });
  }
}
