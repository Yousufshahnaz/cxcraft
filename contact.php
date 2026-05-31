<?php
/**
 * CX Craft — Contact Form Mail Handler
 * File: contact.php
 * Place this file in the ROOT of your hosting (same folder as index.html)
 * Tested on: cPanel shared hosting with PHP 7.4+
 */

// ── CONFIG ──────────────────────────────────────────
$to        = 'info@cxcraft.bd';           // Your activated inbox
$from_name = 'CX Craft Website';
$from_addr = 'info@cxcraft.bd';        // Must be a valid address 
$site_url  = 'https://cxcraft.bd';
// ────────────────────────────────────────────────────

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . $site_url);
    exit;
}

// ── Helper: sanitize input ──────────────────────────
function clean($value) {
    return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
}

// ── Collect & sanitize fields ──────────────────────
$name         = clean($_POST['name']         ?? '');
$email        = clean($_POST['email']        ?? '');
$organization = clean($_POST['organization'] ?? '');
$service      = clean($_POST['service']      ?? '');
$message      = clean($_POST['message']      ?? '');
$submitted_at = date('d M Y, h:i A');

// ── Basic validation ───────────────────────────────
$errors = [];
if (empty($name))                         $errors[] = 'Name is required.';
if (empty($email) || !filter_var($_POST['email'], FILTER_VALIDATE_EMAIL))
                                          $errors[] = 'A valid email address is required.';
if (empty($message))                      $errors[] = 'Message is required.';

// If validation fails → return JSON error (for AJAX) or redirect
if (!empty($errors)) {
    if (isset($_SERVER['HTTP_X_REQUESTED_WITH'])) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'errors' => $errors]);
    } else {
        header('Location: ' . $site_url . '/#contact?error=validation');
    }
    exit;
}

// ── Build email ────────────────────────────────────
$subject = "New Consultation Request from $name — cxcraft.bd";

$body = "
========================================
  NEW CONSULTATION REQUEST — CX CRAFT
========================================

Name         : $name
Email        : $email
Organization : " . ($organization ?: '—') . "
Service      : " . ($service ?: '—') . "
Submitted    : $submitted_at

MESSAGE:
--------
$message

========================================
Reply directly to: $email
Sent from: cxcraft.bd contact form
========================================
";

// HTML version
$html_body = "
<!DOCTYPE html>
<html>
<head>
<meta charset='UTF-8'>
<style>
  body { font-family: 'DM Sans', Arial, sans-serif; background: #faf9f6; color: #1a1814; margin: 0; padding: 0; }
  .wrap { max-width: 580px; margin: 32px auto; background: #fff; border: 1px solid #e6e0d4; border-radius: 4px; overflow: hidden; }
  .header { background: #1a1814; padding: 24px 32px; }
  .logo { font-size: 22px; font-weight: bold; color: #fff; letter-spacing: -0.02em; }
  .logo span { color: #c5590a; }
  .body { padding: 28px 32px; }
  .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #7a7669; margin-bottom: 4px; }
  .value { font-size: 15px; color: #1a1814; margin-bottom: 18px; font-weight: 500; }
  .message-box { background: #f0ede6; border-left: 3px solid #c5590a; padding: 16px 20px; border-radius: 2px; margin: 20px 0; }
  .message-box p { font-size: 14px; color: #3d3a34; line-height: 1.7; margin: 0; white-space: pre-wrap; }
  .reply-btn { display: inline-block; background: #c5590a; color: #fff; padding: 12px 24px; border-radius: 2px; text-decoration: none; font-size: 14px; font-weight: 600; margin-top: 8px; }
  .footer { background: #f0ede6; padding: 16px 32px; font-size: 11px; color: #b5b0a4; border-top: 1px solid #e6e0d4; }
  .divider { height: 1px; background: #e6e0d4; margin: 20px 0; }
</style>
</head>
<body>
<div class='wrap'>
  <div class='header'>
    <div class='logo'>CX<span>Craft</span></div>
  </div>
  <div class='body'>
    <h2 style='font-size:18px;margin:0 0 20px;color:#1a1814'>New Consultation Request</h2>
    <div class='divider'></div>
    <div class='label'>Name</div><div class='value'>$name</div>
    <div class='label'>Email</div><div class='value'><a href='mailto:$email' style='color:#c5590a'>$email</a></div>
    <div class='label'>Organization</div><div class='value'>" . ($organization ?: '—') . "</div>
    <div class='label'>Service Interested In</div><div class='value'>" . ($service ?: '—') . "</div>
    <div class='label'>Submitted</div><div class='value'>$submitted_at</div>
    <div class='divider'></div>
    <div class='label'>Message</div>
    <div class='message-box'><p>$message</p></div>
    <a href='mailto:$email?subject=Re: Consultation Request — CX Craft' class='reply-btn'>Reply to $name</a>
  </div>
  <div class='footer'>
    Sent from the contact form at cxcraft.bd &nbsp;·&nbsp; info@cxcraft.bd
  </div>
</div>
</body>
</html>
";

// ── Send email ─────────────────────────────────────
$boundary = md5(time());

$headers  = "From: {$from_name} <{$from_addr}>\r\n";
$headers .= "Reply-To: {$name} <{$_POST['email']}>\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/alternative; boundary=\"{$boundary}\"\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

$mail_body  = "--{$boundary}\r\n";
$mail_body .= "Content-Type: text/plain; charset=UTF-8\r\n\r\n";
$mail_body .= $body . "\r\n\r\n";
$mail_body .= "--{$boundary}\r\n";
$mail_body .= "Content-Type: text/html; charset=UTF-8\r\n\r\n";
$mail_body .= $html_body . "\r\n\r\n";
$mail_body .= "--{$boundary}--";

$sent = mail($to, $subject, $mail_body, $headers);

// ── Send auto-reply to the person who submitted ────
$auto_subject = "Thanks for reaching out — CX Craft";
$auto_body = "
Dear $name,

Thank you for your message. I've received your consultation request and will get back to you within 24 hours.

Your submission details:
  Service: " . ($service ?: 'Not specified') . "
  Submitted: $submitted_at

In the meantime, feel free to connect with me on:
  LinkedIn : https://linkedin.com/in/mohammadyousuf-cx
  WhatsApp : https://wa.me/8801953819309

Best regards,
Mohammad Yousuf
CX Craft | cxcraft.bd
info@cxcraft.bd | 01953-819309
";

$auto_headers  = "From: Mohammad Yousuf — CX Craft <info@cxcraft.bd>\r\n";
$auto_headers .= "Reply-To: info@cxcraft.bd\r\n";
$auto_headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$auto_headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

mail($_POST['email'], $auto_subject, $auto_body, $auto_headers);

// ── Respond ────────────────────────────────────────
if (isset($_SERVER['HTTP_X_REQUESTED_WITH'])) {
    // AJAX request — return JSON
    header('Content-Type: application/json');
    if ($sent) {
        echo json_encode(['success' => true, 'message' => 'Email sent successfully.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Mail server error. Please try WhatsApp.']);
    }
} else {
    // Standard form submit — redirect
    if ($sent) {
        header('Location: ' . $site_url . '/#contact?success=1');
    } else {
        header('Location: ' . $site_url . '/#contact?error=mail');
    }
}
exit;
