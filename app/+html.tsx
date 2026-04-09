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

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ArcRadius - Policy Navigator" />
        <meta name="twitter:description" content="Track LGBTQ+ legislation across all 50 states. Understand bills, take action, and stay informed." />
        <meta name="twitter:image" content="https://arcradius.netlify.app/thumbnail-tiny.png" />

        {/* OG tags (property=) are injected by scripts/inject-og-tags.js post-build */}

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
