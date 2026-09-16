import { Resend } from 'resend';

const SENDER_IDENTITY = 'SkyPrime Logistics <support@skyprime-logistics.com>';

/**
 * Helper to get or create a Resend client instance.
 * @returns {Resend|null}
 */
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
};

/**
 * Builds clean, responsive, inline-styled HTML email template for parcel status notifications.
 * @param {Object} params
 * @param {string} params.recipientName
 * @param {string} params.trackingNumber
 * @param {string} params.status
 * @param {string} params.location
 * @param {string} [params.description]
 * @param {string} [params.origin]
 * @param {string} [params.destination]
 * @param {string} [params.trackingUrl]
 * @returns {string} HTML string
 */
export const buildParcelStatusEmailHtml = ({
  recipientName,
  trackingNumber,
  status,
  location,
  description,
  origin,
  destination,
  trackingUrl,
}) => {
  const isHold = String(status || '').trim().toLowerCase() === 'on hold';
  const isDelivered = String(status || '').trim().toLowerCase() === 'delivered';

  // Badge colors & text
  let statusBadgeBg = '#dbeafe'; // light blue
  let statusBadgeColor = '#1d4ed8'; // blue 700
  let statusBadgeBorder = '#bfdbfe';

  if (isHold) {
    statusBadgeBg = '#fef3c7'; // amber 100
    statusBadgeColor = '#d97706'; // amber 600
    statusBadgeBorder = '#fde68a';
  } else if (isDelivered) {
    statusBadgeBg = '#d1fae5'; // emerald 100
    statusBadgeColor = '#059669'; // emerald 600
    statusBadgeBorder = '#a7f3d0';
  }

  const clientBaseUrl = process.env.CLIENT_URL || 'https://skyprime-logistics.com';
  const liveTrackingLink = trackingUrl || `${clientBaseUrl}/track/${encodeURIComponent(trackingNumber)}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shipment Status Update - ${trackingNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0f172a; padding: 32px 36px; text-align: left; border-bottom: 3px solid #1d4ed8;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase;">
                      SKYPRIME <span style="color: #60a5fa; font-size: 13px; font-weight: 700; letter-spacing: 2px;">LOGISTICS</span>
                    </h1>
                    <p style="margin: 4px 0 0; color: #94a3b8; font-size: 12px; letter-spacing: 0.5px;">
                      Precision Line-Haul & Global Telemetry
                    </p>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; padding: 6px 12px; background-color: rgba(255, 255, 255, 0.1); border-radius: 9999px; color: #93c5fd; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                      Shipment Update
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 36px 36px 24px;">
              <p style="margin: 0 0 16px; color: #334155; font-size: 15px; line-height: 1.6;">
                Hello <strong>${recipientName || 'Valued Customer'}</strong>,
              </p>
              <p style="margin: 0 0 24px; color: #475569; font-size: 14px; line-height: 1.6;">
                There is a new status update regarding your shipment with tracking number 
                <strong style="font-family: monospace; color: #0f172a; font-size: 15px;">${trackingNumber}</strong>.
              </p>

              <!-- Current Status Banner -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; text-align: center;">
                    <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 8px;">
                      Current Package Status
                    </div>
                    <div>
                      <span style="display: inline-block; padding: 8px 20px; background-color: ${statusBadgeBg}; color: ${statusBadgeColor}; border: 1px solid ${statusBadgeBorder}; border-radius: 9999px; font-size: 16px; font-weight: 800; letter-spacing: 0.5px;">
                        ${status}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              ${
                isHold
                  ? `
              <!-- Special Highlight: On Hold Customer Notice -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td style="background-color: #fffbeb; border: 1.5px solid #f59e0b; border-left: 6px solid #d97706; border-radius: 10px; padding: 18px 20px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <h3 style="margin: 0 0 6px; color: #b45309; font-size: 15px; font-weight: 800;">
                            ⚠️ Action Required: Shipment On Hold
                          </h3>
                          <p style="margin: 0 0 10px; color: #92400e; font-size: 13px; line-height: 1.5;">
                            Your package is currently placed on temporary administrative hold. Please contact our 24/7 customer support dispatch team immediately to review clearance requirements and expedite release.
                          </p>
                          <p style="margin: 0 0 6px; color: #b45309; font-size: 12px; font-weight: 600;">
                            Email: <a href="mailto:support@skyprime-logistics.com" style="color: #d97706; text-decoration: underline;">support@skyprime-logistics.com</a>
                          </p>
                          <p style="margin: 0; color: #b45309; font-size: 12px; font-weight: 600;">
                            WhatsApp Support: <a href="https://wa.me/12182012628" style="color: #d97706; text-decoration: underline;">+1 (218) 201-2628</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              `
                  : ''
              }

              <!-- Shipment Details Summary Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 28px; overflow: hidden;">
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0; background-color: #f1f5f9;">
                    <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #475569; letter-spacing: 0.5px;">
                      Shipment Details
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="38%" style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 500;">Tracking Number:</td>
                        <td width="62%" style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 700; font-family: monospace;">${trackingNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 500;">Current Location:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 600;">${location || 'In Transit'}</td>
                      </tr>
                      ${
                        origin
                          ? `
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 500;">Origin Hub:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-size: 13px;">${origin}</td>
                      </tr>
                      `
                          : ''
                      }
                      ${
                        destination
                          ? `
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 500;">Destination:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-size: 13px;">${destination}</td>
                      </tr>
                      `
                          : ''
                      }
                      ${
                        description
                          ? `
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 500;">Checkpoint Note:</td>
                        <td style="padding: 6px 0; color: #334155; font-size: 13px; font-style: italic;">${description}</td>
                      </tr>
                      `
                          : ''
                      }
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Call to Action Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${liveTrackingLink}" target="_blank" style="display: inline-block; background-color: #1d4ed8; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(29, 78, 216, 0.3); text-align: center;">
                      Track Your Shipment Live &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.5; text-align: center;">
                You can also copy and paste this link into your browser:<br>
                <a href="${liveTrackingLink}" style="color: #2563eb; text-decoration: underline; word-break: break-all;">${liveTrackingLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 36px; text-align: center;">
              <p style="margin: 0 0 6px; color: #64748b; font-size: 12px; font-weight: 600;">
                SkyPrime Logistics Support Team
              </p>
              <p style="margin: 0 0 6px; color: #64748b; font-size: 12px;">
                WhatsApp Direct: <a href="https://wa.me/12182012628" style="color: #2563eb; text-decoration: underline; font-weight: 600;">+1 (218) 201-2628</a>
              </p>
              <p style="margin: 0 0 12px; color: #94a3b8; font-size: 11px;">
                24/7 Email Inquiries: <a href="mailto:support@skyprime-logistics.com" style="color: #64748b; text-decoration: underline;">support@skyprime-logistics.com</a>
              </p>
              <p style="margin: 0; color: #cbd5e1; font-size: 11px;">
                &copy; ${new Date().getFullYear()} SkyPrime Logistics Inc. All rights reserved. Automated transactional notification.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * Dispatches an automated parcel status update email to the recipient using Resend.
 * @param {Object} parcel - Parcel record with recipient_email, tracking_number, status, etc.
 * @param {string} [location] - Current checkpoint location
 * @param {string} [description] - Checkpoint description note
 * @returns {Promise<Object|null>}
 */
export const sendParcelStatusEmail = async (parcel, location, description) => {
  const recipientEmail = parcel.recipient_email;

  if (!recipientEmail || typeof recipientEmail !== 'string' || !recipientEmail.trim()) {
    console.log(`[EmailService] Skipping email dispatch: No valid recipient email found for parcel ${parcel.tracking_number || parcel.id}`);
    return null;
  }

  const resend = getResendClient();
  if (!resend) {
    console.warn('[EmailService] RESEND_API_KEY is not set in environment variables. Email notification skipped.');
    return null;
  }

  const trackingNumber = parcel.tracking_number || 'N/A';
  const status = parcel.status || 'Updated';
  const recipientName = parcel.recipient_name || 'Customer';
  const currentLocation = location || parcel.current_location || 'In Transit';

  const html = buildParcelStatusEmailHtml({
    recipientName,
    trackingNumber,
    status,
    location: currentLocation,
    description: description || `Status updated to ${status}`,
    origin: parcel.origin,
    destination: parcel.destination,
  });

  const subject = `[SkyPrime Logistics] Shipment Status Update: ${status} (${trackingNumber})`;

  try {
    const data = await resend.emails.send({
      from: SENDER_IDENTITY,
      to: recipientEmail.trim(),
      subject,
      html,
    });

    console.log(`[EmailService] Status update email sent successfully to ${recipientEmail} for parcel ${trackingNumber} (ID: ${data?.id || 'OK'})`);
    return data;
  } catch (error) {
    console.error(`[EmailService] Error sending email via Resend for parcel ${trackingNumber}:`, error.message || error);
    throw error;
  }
};

export default {
  buildParcelStatusEmailHtml,
  sendParcelStatusEmail,
};
