# Email Templates for That House

## 1. Confirm Signup
**Subject:** Welcome to That House! Please confirm your email

```html
<h2 style="color: #FF6B6B; font-family: Arial, sans-serif;">Welcome to That House! 🏠</h2>

<p style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
  Thanks for signing up! We're excited to help you find your dream home with just a swipe.
</p>

<p style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
  Please confirm your email address to get started:
</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" style="background-color: #FF6B6B; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-family: Arial, sans-serif; font-weight: bold;">
    Confirm Email Address
  </a>
</div>

<p style="font-family: Arial, sans-serif; color: #666; font-size: 14px; line-height: 1.6;">
  If you didn't create an account with That House, you can safely ignore this email.
</p>

<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

<p style="font-family: Arial, sans-serif; color: #999; font-size: 12px; text-align: center;">
  © 2024 That House. Find your dream home with a swipe.
</p>
```

## 2. Invite User
**Subject:** You're invited to join That House!

```html
<h2 style="color: #FF6B6B; font-family: Arial, sans-serif;">You're Invited to That House! 🏠</h2>

<p style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
  Someone has invited you to join That House, the app that helps you find your dream home with just a swipe.
</p>

<p style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
  Click below to accept the invitation and create your account:
</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" style="background-color: #FF6B6B; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-family: Arial, sans-serif; font-weight: bold;">
    Accept Invitation
  </a>
</div>

<p style="font-family: Arial, sans-serif; color: #666; font-size: 14px; line-height: 1.6;">
  This invitation will expire in 7 days.
</p>

<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

<p style="font-family: Arial, sans-serif; color: #999; font-size: 12px; text-align: center;">
  © 2024 That House. Find your dream home with a swipe.
</p>
```

## 3. Magic Link
**Subject:** Your That House login link

```html
<h2 style="color: #FF6B6B; font-family: Arial, sans-serif;">Your Login Link 🔑</h2>

<p style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
  Click the button below to securely log in to your That House account:
</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" style="background-color: #FF6B6B; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-family: Arial, sans-serif; font-weight: bold;">
    Log In to That House
  </a>
</div>

<p style="font-family: Arial, sans-serif; color: #666; font-size: 14px; line-height: 1.6;">
  This link will expire in 1 hour for security reasons. If you didn't request this login link, you can safely ignore this email.
</p>

<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

<p style="font-family: Arial, sans-serif; color: #999; font-size: 12px; text-align: center;">
  © 2024 That House. Find your dream home with a swipe.
</p>
```

## 4. Change Email Address
**Subject:** Confirm your new email address

```html
<h2 style="color: #FF6B6B; font-family: Arial, sans-serif;">Confirm Your New Email Address</h2>

<p style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
  You've requested to change your email address for your That House account.
</p>

<p style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
  Please confirm your new email address by clicking the button below:
</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" style="background-color: #FF6B6B; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-family: Arial, sans-serif; font-weight: bold;">
    Confirm New Email
  </a>
</div>

<p style="font-family: Arial, sans-serif; color: #666; font-size: 14px; line-height: 1.6;">
  If you didn't request this change, please contact us immediately.
</p>

<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

<p style="font-family: Arial, sans-serif; color: #999; font-size: 12px; text-align: center;">
  © 2024 That House. Find your dream home with a swipe.
</p>
```

## 5. Reset Password
**Subject:** Reset your That House password

```html
<h2 style="color: #FF6B6B; font-family: Arial, sans-serif;">Reset Your Password</h2>

<p style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
  We received a request to reset your password for your That House account.
</p>

<p style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
  Click the button below to create a new password:
</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" style="background-color: #FF6B6B; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-family: Arial, sans-serif; font-weight: bold;">
    Reset Password
  </a>
</div>

<p style="font-family: Arial, sans-serif; color: #666; font-size: 14px; line-height: 1.6;">
  If you didn't request a password reset, you can safely ignore this email. Your password won't be changed.
</p>

<p style="font-family: Arial, sans-serif; color: #666; font-size: 14px; line-height: 1.6;">
  This link will expire in 1 hour for security reasons.
</p>

<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

<p style="font-family: Arial, sans-serif; color: #999; font-size: 12px; text-align: center;">
  © 2024 That House. Find your dream home with a swipe.
</p>
```