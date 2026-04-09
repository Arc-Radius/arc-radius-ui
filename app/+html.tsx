import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        <title>ArcRadius - Policy Navigator</title>
        <meta name="description" content="Track LGBTQ+ legislation across all 50 states. Understand bills, take action, and stay informed." />
        <meta name="theme-color" content="#18181b" />

        {/* Open Graph / Social sharing */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="ArcRadius - Policy Navigator" />
        <meta property="og:description" content="Track LGBTQ+ legislation across all 50 states. Understand bills, take action, and stay informed." />
        <meta property="og:image" content="https://arcradius.netlify.app/assets/thumbnail-tiny.png" />
        <meta property="og:url" content="https://arcradius.netlify.app" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ArcRadius - Policy Navigator" />
        <meta name="twitter:description" content="Track LGBTQ+ legislation across all 50 states. Understand bills, take action, and stay informed." />
        <meta name="twitter:image" content="https://arcradius.netlify.app/assets/thumbnail-tiny.png" />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
