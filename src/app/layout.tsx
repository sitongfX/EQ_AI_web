import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

export const metadata: Metadata = {
  title: 'EQ Coach - AI-Powered Emotional Intelligence Training',
  description: 'Practice difficult conversations and improve your emotional intelligence with AI-powered simulations. Build self-awareness, manage emotions, develop empathy, and strengthen relationships through interactive role-play scenarios.',
  keywords: 'emotional intelligence, EQ training, conversation practice, soft skills, communication skills, empathy training, self-awareness, relationship management',
  authors: [{ name: 'EQ Coach' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/icons/icon.svg',
  },
  openGraph: {
    title: 'EQ Coach - AI-Powered Emotional Intelligence Training',
    description: 'Practice difficult conversations and improve your emotional intelligence with AI-powered simulations.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EQ Coach - AI-Powered Emotional Intelligence Training',
    description: 'Practice difficult conversations and improve your emotional intelligence with AI-powered simulations.',
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#6366F1' },
    { media: '(prefers-color-scheme: dark)', color: '#4F46E5' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'What is emotional intelligence (EQ)?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Emotional intelligence is the ability to recognize, understand, and manage your own emotions, as well as recognize, understand, and influence the emotions of others. It consists of four key dimensions: self-awareness, self-management, social awareness, and relationship management.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How does EQ Coach help improve emotional intelligence?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'EQ Coach provides realistic conversation scenarios where you can practice difficult conversations with AI characters. You receive real-time feedback on your emotional intelligence across four dimensions, helping you identify areas for improvement and track your progress over time.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Is EQ Coach free to use?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes, EQ Coach is free to use. You can practice unlimited conversation scenarios and receive AI-powered feedback on your emotional intelligence skills at no cost.',
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}

