import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'NIT-CoDeX Hackathon 2026 — Judging Platform',
  description: 'Official judging and scoring platform for NIT-CoDeX Hackathon 2026'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-grotesk@200,300,400,500,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#141414',
              color: '#f2ead8',
              border: '1px solid rgba(242,234,216,0.1)',
              fontFamily: 'Clash Grotesk, sans-serif',
              fontSize: '13px',
              fontWeight: '500',
              borderRadius: '10px'
            },
            success: { iconTheme: { primary: '#c0a87a', secondary: '#060606' } },
            error:   { iconTheme: { primary: '#dc6b6b', secondary: '#f2ead8' } }
          }}
        />
      </body>
    </html>
  );
}
