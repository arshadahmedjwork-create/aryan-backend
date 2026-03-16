/**
 * EmailJS Service — sends authentication-related emails via EmailJS.
 * Emails are sent client-side (no SMTP server required).
 * All calls are non-blocking; failures are logged but never throw.
 */
import emailjs from '@emailjs/browser';

// ── Configuration ─────────────────────────────────────────────────────────

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_WELCOME_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_WELCOME_TEMPLATE_ID || '';
const EMAILJS_LOGIN_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_LOGIN_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

// ── Initialisation ────────────────────────────────────────────────────────

let _initialised = false;

/**
 * Initialise EmailJS with the public key.
 * Safe to call multiple times — only initialises once.
 */
export function initEmailJS(): void {
  if (_initialised || !EMAILJS_PUBLIC_KEY) {
    if (!EMAILJS_PUBLIC_KEY) {
      console.warn('[EmailJS] No public key configured — emails will not be sent.');
    }
    return;
  }
  emailjs.init(EMAILJS_PUBLIC_KEY);
  _initialised = true;
  console.log('[EmailJS] Initialised successfully');
}

// ── Email Functions ───────────────────────────────────────────────────────

/**
 * Send a welcome email after user registration.
 * Non-blocking — never throws; errors are logged to console.
 */
export async function sendWelcomeEmail(
  userName: string,
  userEmail: string,
  userRole: string,
): Promise<void> {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_WELCOME_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.warn('[EmailJS] Welcome email skipped — missing configuration.');
    return;
  }

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_WELCOME_TEMPLATE_ID, {
      name: userName,
      email: userEmail,
      to_name: userName,
      to_email: userEmail,
      user_role: userRole,
      platform_name: 'NexusOps AI',
      message: `Welcome to NexusOps AI! Your account has been created successfully as a ${userRole}. You can now access all the features available for your role.`,
    });
    console.log(`[EmailJS] Welcome email sent to ${userEmail}`);
  } catch (error) {
    console.error('[EmailJS] Failed to send welcome email:', error);
  }
}

/**
 * Send a login notification email.
 * Non-blocking — never throws; errors are logged to console.
 */
export async function sendLoginNotification(
  userName: string,
  userEmail: string,
): Promise<void> {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_LOGIN_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.warn('[EmailJS] Login notification skipped — missing configuration.');
    return;
  }

  try {
    const loginTime = new Date().toLocaleString();
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_LOGIN_TEMPLATE_ID, {
      name: userName,
      email: userEmail,
      to_name: userName,
      to_email: userEmail,
      login_time: loginTime,
      platform_name: 'NexusOps AI',
      message: `A new sign-in to your NexusOps AI account was detected on ${loginTime}. If this wasn't you, please secure your account immediately.`,
    });
    console.log(`[EmailJS] Login notification sent to ${userEmail}`);
  } catch (error) {
    console.error('[EmailJS] Failed to send login notification:', error);
  }
}
