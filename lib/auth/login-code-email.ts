import { sendMailAsUser } from "@/lib/microsoft/graph-mail";

function loginCodeHtml(code: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0f172a;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:420px;background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:32px 28px;text-align:center;">
          <div style="display:inline-block;width:48px;height:48px;line-height:48px;border-radius:12px;background:#ea580c;color:#fff;font-size:22px;font-weight:700;">N</div>
          <h1 style="margin:16px 0 8px;font-size:20px;color:#0f172a;">NOX PWR sign-in code</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.5;">
            Enter this code on the sign-in page. It expires shortly and works once.
          </p>
          <div style="display:inline-block;padding:14px 28px;border-radius:10px;background:#fff7ed;border:1px solid #fed7aa;font-size:28px;font-weight:700;letter-spacing:6px;color:#c2410c;">
            ${code}
          </div>
          <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;line-height:1.5;">
            If you didn't request this, you can ignore this email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendLoginCodeEmail(options: {
  to: string;
  code: string;
}) {
  await sendMailAsUser({
    to: options.to,
    subject: `${options.code} is your NOX PWR sign-in code`,
    body: loginCodeHtml(options.code),
    contentType: "html",
  });
}
