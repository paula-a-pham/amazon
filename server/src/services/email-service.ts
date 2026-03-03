import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { FastifyBaseLogger } from 'fastify';
import { env } from '@/config/env.js';

let transporter: Transporter | null = null;
let logger: FastifyBaseLogger | null = null;
let etherealReady: Promise<void> | null = null;

export const setEmailLogger = (log: FastifyBaseLogger) => {
  logger = log;
};

const initEthereal = async () => {
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  const log = logger;
  if (log) {
    log.info(
      { host: testAccount.smtp.host, user: testAccount.user },
      'Ethereal test email account created — view sent emails at https://ethereal.email/login',
    );
  }
};

const getTransporter = async (): Promise<Transporter | null> => {
  if (transporter) return transporter;

  // Use real SMTP if configured
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT ?? 587,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
    return transporter;
  }

  // Fall back to Ethereal in development
  if (!etherealReady) {
    etherealReady = initEthereal();
  }
  try {
    await etherealReady;
    return transporter!;
  } catch (err) {
    // Reset so subsequent calls can retry
    etherealReady = null;
    const log = logger;
    if (log) {
      log.warn('Ethereal email account creation failed — emails will be logged to console instead');
    }
    return null;
  }
};

const logEmailToConsole = (to: string, subject: string, _text: string, url?: string) => {
  console.log(
    '\n\x1b[33m%s\x1b[0m',
    '╔══════════════════════════════════════════════════════════════╗',
  );
  console.log(
    '\x1b[33m%s\x1b[0m',
    '║  [FALLBACK] Email logged to console (transport unavailable)',
  );
  console.log(
    '\x1b[33m%s\x1b[0m',
    `║  To: ${to}`,
  );
  console.log(
    '\x1b[33m%s\x1b[0m',
    `║  Subject: ${subject}`,
  );
  if (url) {
    console.log(
      '\x1b[32m%s\x1b[0m',
      `║  Action URL: ${url}`,
    );
  }
  console.log(
    '\x1b[33m%s\x1b[0m',
    '╚══════════════════════════════════════════════════════════════╝\n',
  );
};

const sendEmail = async (to: string, subject: string, html: string, text: string, actionUrl?: string) => {
  const transport = await getTransporter();

  if (!transport) {
    logEmailToConsole(to, subject, text, actionUrl);
    return;
  }

  const info = await transport.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
    text,
  });

  // Log Ethereal preview URL in development
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(
      '\n\x1b[36m%s\x1b[0m',
      '╔══════════════════════════════════════════════════════════════╗',
    );
    console.log(
      '\x1b[36m%s\x1b[0m',
      `║  Email sent to: ${to}`,
    );
    console.log(
      '\x1b[36m%s\x1b[0m',
      `║  Subject: ${subject}`,
    );
    console.log(
      '\x1b[33m%s\x1b[0m',
      `║  Preview: ${previewUrl}`,
    );
    console.log(
      '\x1b[36m%s\x1b[0m',
      '╚══════════════════════════════════════════════════════════════╝\n',
    );
  }
};

export const sendVerificationEmail = async (email: string, name: string, token: string) => {
  const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;

  const html = `
    <h2>Verify your email address</h2>
    <p>Hi ${name},</p>
    <p>Thanks for signing up! Please verify your email address by clicking the link below:</p>
    <p><a href="${verifyUrl}">Verify Email Address</a></p>
    <p>This link expires in 24 hours.</p>
    <p>If you didn't create an account, you can safely ignore this email.</p>
  `;

  const text = `Hi ${name},\n\nVerify your email address by visiting:\n${verifyUrl}\n\nThis link expires in 24 hours.\n\nIf you didn't create an account, you can safely ignore this email.`;

  await sendEmail(email, 'Verify your email address', html, text, verifyUrl);
};

export const sendPasswordResetEmail = async (email: string, name: string, token: string) => {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;

  const html = `
    <h2>Reset your password</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset your password. Click the link below to choose a new one:</p>
    <p><a href="${resetUrl}">Reset Password</a></p>
    <p>This link expires in 1 hour.</p>
    <p>If you didn't request a password reset, you can safely ignore this email.</p>
  `;

  const text = `Hi ${name},\n\nReset your password by visiting:\n${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request a password reset, you can safely ignore this email.`;

  await sendEmail(email, 'Reset your password', html, text, resetUrl);
};
