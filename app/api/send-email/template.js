export function buildEmailHtml({ opportunities, sector, region, note, date }) {
  const statusColor = (status) => {
    switch (status) {
      case "New": return "#1a56a0";
      case "Open": return "#2d7a3a";
      case "Closing Soon": return "#b45309";
      case "Closed": return "#6b7280";
      default: return "#6b7280";
    }
  };

  const statusBg = (status) => {
    switch (status) {
      case "New": return "#e8f0fe";
      case "Open": return "#e6f4ea";
      case "Closing Soon": return "#fff3e0";
      case "Closed": return "#f3f4f6";
      default: return "#f3f4f6";
    }
  };

  const rows = opportunities
    .map(
      (o) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;vertical-align:top;">
          <strong style="font-size:14px;color:#111;">${o.organisation}</strong><br/>
          <span style="font-size:12px;color:#888;">${o.type || ""}</span>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#555;vertical-align:top;">${o.location}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-size:13px;vertical-align:top;">
          ${o.website ? `<a href="${o.website}" style="color:#1a56a0;text-decoration:none;">Visit ↗</a>` : "—"}
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-size:13px;vertical-align:top;">
          ${o.tender_link ? `<a href="${o.tender_link}" style="color:#1a56a0;text-decoration:none;">View brief ↗</a>` : "—"}
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#444;vertical-align:top;">${o.project_scope || "—"}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-size:13px;vertical-align:top;">
          <div style="font-weight:500;color:#111;">${o.contact_name || "Not specified"}</div>
          <div style="font-size:12px;color:#888;">${o.contact_title || ""}</div>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-size:12px;color:#888;vertical-align:top;">${o.published || "—"}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:500;vertical-align:top;">${o.due_date || "—"}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;vertical-align:top;">
          <span style="background:${statusBg(o.status)};color:${statusColor(o.status)};padding:2px 10px;border-radius:100px;font-size:11px;font-weight:500;">${o.status}</span>
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f9f9f7;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f7;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:900px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ebebeb;">

        <!-- Header -->
        <tr>
          <td style="background:#0f0f0f;padding:24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="font-size:20px;font-weight:600;color:#f0ede8;letter-spacing:-0.03em;">OpportunityScanner</div>
                  <div style="font-size:13px;color:#888;margin-top:2px;">Daily Website Project Digest</div>
                </td>
                <td align="right">
                  <div style="font-size:12px;color:#666;">${date}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Summary bar -->
        <tr>
          <td style="padding:20px 32px;border-bottom:1px solid #f0f0f0;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:24px;">
                  <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">Sector</div>
                  <div style="font-size:15px;font-weight:600;color:#111;">${sector}</div>
                </td>
                ${region ? `<td style="padding-right:24px;">
                  <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">Region</div>
                  <div style="font-size:15px;font-weight:600;color:#111;">${region}</div>
                </td>` : ""}
                <td>
                  <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">Opportunities found</div>
                  <div style="font-size:15px;font-weight:600;color:#111;">${opportunities.length}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Table -->
        <tr>
          <td style="padding:0;">
            <div style="overflow-x:auto;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <thead>
                  <tr style="background:#f9f9f7;">
                    <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:500;color:#999;white-space:nowrap;border-bottom:1px solid #ebebeb;">Organisation</th>
                    <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:500;color:#999;white-space:nowrap;border-bottom:1px solid #ebebeb;">Location</th>
                    <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:500;color:#999;white-space:nowrap;border-bottom:1px solid #ebebeb;">Website</th>
                    <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:500;color:#999;white-space:nowrap;border-bottom:1px solid #ebebeb;">Tender</th>
                    <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:500;color:#999;white-space:nowrap;border-bottom:1px solid #ebebeb;">Project scope</th>
                    <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:500;color:#999;white-space:nowrap;border-bottom:1px solid #ebebeb;">Contact</th>
                    <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:500;color:#999;white-space:nowrap;border-bottom:1px solid #ebebeb;">Published</th>
                    <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:500;color:#999;white-space:nowrap;border-bottom:1px solid #ebebeb;">Due date</th>
                    <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:500;color:#999;white-space:nowrap;border-bottom:1px solid #ebebeb;">Status</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          </td>
        </tr>

        <!-- Note -->
        ${note ? `<tr><td style="padding:16px 32px;background:#fffbf0;border-top:1px solid #f0f0f0;">
          <p style="margin:0;font-size:12px;color:#888;">⚠ ${note}</p>
        </td></tr>` : ""}

        <!-- Footer -->
        <tr>
          <td style="padding:24px 32px;border-top:1px solid #f0f0f0;">
            <p style="margin:0;font-size:12px;color:#aaa;">
              Sent daily by OpportunityScanner · Website projects only ·
              <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#888;">Open app</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
