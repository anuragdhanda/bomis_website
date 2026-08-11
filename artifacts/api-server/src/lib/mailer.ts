import nodemailer from "nodemailer";
import { logger } from "./logger.js";

const GMAIL_USER = process.env["GMAIL_USER"];
const GMAIL_APP_PASSWORD = process.env["GMAIL_APP_PASSWORD"];

// Returns null if env vars are missing — email sending is optional
function createTransporter() {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    logger.warn("GMAIL_USER or GMAIL_APP_PASSWORD not set — email notifications disabled");
    return null;
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });
}

const transporter = createTransporter();

export interface InquiryEmailData {
  type: "admission" | "contact";
  name: string;
  email: string;
  phone?: string | null;
  studentName?: string | null;
  gradeApplying?: string | null;
  message: string;
}

function buildHtml(data: InquiryEmailData): string {
  const isAdmission = data.type === "admission";
  const title = isAdmission ? "New Admission Inquiry" : "New Contact Message";
  const accentColor = "#F15A29";

  const rows = [
    ["Type", isAdmission ? "Admission Inquiry" : "Contact Message"],
    ["Name", data.name],
    ["Email", data.email],
    ...(data.phone ? [["Phone", data.phone]] : []),
    ...(data.studentName ? [["Student Name", data.studentName]] : []),
    ...(data.gradeApplying ? [["Grade Applying For", data.gradeApplying]] : []),
    ["Message", data.message],
  ] as [string, string][];

  const tableRows = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:10px 16px;font-weight:600;color:#555;white-space:nowrap;vertical-align:top;width:160px;">${label}</td>
        <td style="padding:10px 16px;color:#222;white-space:pre-wrap;">${value}</td>
      </tr>`
    )
    .join("<tr><td colspan='2' style='border-top:1px solid #eee;padding:0'></td></tr>");

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <div style="background:${accentColor};padding:24px 32px;">
        <h1 style="margin:0;color:#fff;font-size:22px;">${title}</h1>
        <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">BOMIS Rajound — Bright Open Minds</p>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        ${tableRows}
      </table>
      <div style="padding:16px 32px;background:#fafafa;border-top:1px solid #eee;font-size:12px;color:#999;text-align:center;">
        This email was sent automatically from the BOMIS website inquiry form.
      </div>
    </div>`;
}

export async function sendInquiryEmail(data: InquiryEmailData): Promise<void> {
  if (!transporter || !GMAIL_USER) {
    logger.warn("Email not sent — mailer not configured");
    return;
  }

  const isAdmission = data.type === "admission";
  const subject = isAdmission
    ? `[Admission Inquiry] ${data.name} — Grade ${data.gradeApplying ?? "N/A"}`
    : `[Contact Message] ${data.name} — ${data.email}`;

  await transporter.sendMail({
    from: `"BOMIS Website" <${GMAIL_USER}>`,
    to: GMAIL_USER,
    replyTo: data.email,
    subject,
    html: buildHtml(data),
  });

  logger.info({ type: data.type, from: data.email }, "Inquiry email sent");
}
