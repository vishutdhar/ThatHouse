import * as Sentry from '@sentry/react-native';
import { ENV } from './env';

export const initSentry = () => {
  // Only initialize in production
  if (ENV.ENV_NAME === 'production') {
    Sentry.init({
      dsn: 'YOUR_SENTRY_DSN_HERE', // You'll get this from Sentry dashboard
      debug: false,
      environment: ENV.ENV_NAME,
      tracesSampleRate: 0.2, // 20% of transactions for performance monitoring
      attachScreenshot: true,
      attachViewHierarchy: true,
      beforeSend: (event, hint) => {
        // Filter out sensitive data
        if (event.request?.cookies) {
          delete event.request.cookies;
        }
        if (event.user?.email) {
          event.user.email = '[REDACTED]';
        }
        return event;
      },
      integrations: [
        Sentry.reactNativeTracingIntegration({
          routingInstrumentation: Sentry.reactNavigationIntegration(),
          tracingOrigins: ['localhost', /^\//],
        }),
      ],
    });
  }
};

// Custom error boundary
export const ErrorBoundary = Sentry.ErrorBoundary;

// Capture custom errors
export const captureError = (error: Error, context?: any) => {
  if (ENV.ENV_NAME === 'production') {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    console.error('Error:', error, context);
  }
};

// Track user actions
export const trackEvent = (event: string, data?: any) => {
  if (ENV.ENV_NAME === 'production') {
    Sentry.addBreadcrumb({
      message: event,
      data,
      level: 'info',
    });
  }
};