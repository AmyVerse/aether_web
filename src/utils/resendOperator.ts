import { generateOtp } from "@/utils/otp";
import { cookies } from "next/headers";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendOtp(email: string) {
  const otp = generateOtp();

  const cookieStore = cookies();
  (await cookieStore).set(`otp-${email}`, otp, {
    httpOnly: true,
    maxAge: 300,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Your OTP Code</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <style>
          body {
            background: #f3f5fe;
            font-family: 'Manrope', Arial, sans-serif;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 420px;
            margin: 40px auto;
            background: #fff;
            border-radius: 14px;
            box-shadow: 0 4px 24px rgba(60,72,100,0.10);
            padding: 2.5rem 2rem 2rem 2rem;
            text-align: center;
          }
          .otp-code {
            display: inline-block;
            background: #f3f5fe;
            color: #22223b;
            font-size: 2rem;
            letter-spacing: 0.4rem;
            font-weight: 700;
            padding: 0.7rem 1.5rem;
            border-radius: 8px;
            margin: 1.5rem 0;
            border: 1.5px dashed #6366f1;
          }
          .title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #22223b;
            margin-bottom: 0.5rem;
          }
          .subtitle {
            color: #6366f1;
            font-size: 1.1rem;
            margin-bottom: 1.5rem;
          }
          .footer {
            color: #6c6f7d;
            font-size: 0.95rem;
            margin-top: 2.5rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="title">Verify Your Email</div>
          <div class="subtitle">Use the OTP below to complete your sign up</div>
          <div class="otp-code">${otp}</div>
          <div>
            <p style="color:#444; margin: 1.5rem 0 0.5rem 0;">
              This code will expire in 5 minutes.<br/>
              If you did not request this, you can safely ignore this email.
            </p>
          </div>
          <div class="footer">
            &mdash; Aether IIITN Team
          </div>
        </div>
      </body>
    </html>
  `;

  const data = await resend.emails.send({
    from: "verify@aether.amyverse.in",
    to: email,
    subject: "Your OTP Code",
    html,
  });

  return { otp, data };
}
