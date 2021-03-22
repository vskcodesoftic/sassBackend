// wrapper for sentry to catch trycatch block exceptions
// import * as Sentry from '@sentry/node';

const sentryCapture = () => {
    // Sentry.captureException(e);
  };
  
  exports.sentryCapture = sentryCapture;