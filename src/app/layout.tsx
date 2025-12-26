import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

export const metadata: Metadata = {
  title: 'NiceAI - Your EQ & Social Skills Coach',
  description: 'Practice difficult conversations and improve your emotional intelligence with AI-powered simulations. Build self-awareness, manage emotions, develop empathy, and strengthen relationships through interactive role-play scenarios.',
  keywords: 'emotional intelligence, EQ training, conversation practice, soft skills, communication skills, empathy training, self-awareness, relationship management',
  authors: [{ name: 'NiceAI' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/icons/icon.svg',
  },
  openGraph: {
    title: 'NiceAI - Your EQ & Social Skills Coach',
    description: 'Practice difficult conversations and improve your emotional intelligence with AI-powered simulations.',
    type: 'website',
    locale: 'en_US',
    url: 'https://niceai.chat',
    siteName: 'NiceAI',
    images: [
      {
        url: 'https://niceai.chat/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NiceAI - Emotional Intelligence Training Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NiceAI - Your EQ & Social Skills Coach',
    description: 'Practice difficult conversations and improve your emotional intelligence with AI-powered simulations.',
    images: ['https://niceai.chat/og-image.png'],
  },
  alternates: {
    canonical: 'https://niceai.chat',
    languages: {
      'en': 'https://niceai.chat',
      'x-default': 'https://niceai.chat',
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || '',
    // Add other verification codes as needed:
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://www.googletagservices.com" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'NiceAI',
                url: 'https://niceai.chat',
                logo: 'https://niceai.chat/favicon.svg',
                description: 'AI-powered emotional intelligence training platform helping people improve their EQ through realistic conversation practice.',
                sameAs: [],
                contactPoint: {
                  '@type': 'ContactPoint',
                  contactType: 'Customer Support',
                  url: 'https://niceai.chat/support.html',
                },
                knowsAbout: [
                  'Emotional Intelligence',
                  'Communication Skills',
                  'AI Training',
                  'Personal Development',
                  'Soft Skills',
                ],
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebApplication',
                name: 'NiceAI',
                applicationCategory: 'EducationalApplication',
                operatingSystem: 'Any',
                offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
                },
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: '4.8',
                  ratingCount: '150',
                },
                featureList: [
                  'AI-powered conversation practice',
                  'Real-time emotional intelligence feedback',
                  '12+ realistic scenarios',
                  'Progress tracking',
                  'Personalized improvement suggestions',
                ],
              },
              {
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
                    name: 'How does NiceAI help improve emotional intelligence?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'NiceAI provides realistic conversation scenarios where you can practice difficult conversations with AI characters. You receive real-time feedback on your emotional intelligence across four dimensions, helping you identify areas for improvement and track your progress over time.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Is NiceAI free to use?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Yes, NiceAI is free to use. You can practice unlimited conversation scenarios and receive AI-powered feedback on your emotional intelligence skills at no cost. Visit https://niceai.chat/ to get started.',
                    },
                  },
                ],
              },
              {
                '@context': 'https://schema.org',
                '@type': 'HowTo',
                name: 'How to Improve Your Emotional Intelligence with NiceAI',
                description: 'Step-by-step guide to using NiceAI for EQ training and improving your communication skills',
                step: [
                  {
                    '@type': 'HowToStep',
                    position: 1,
                    name: 'Choose a Scenario',
                    text: 'Select from workplace, personal, or advanced conversation scenarios that challenge your emotional intelligence',
                  },
                  {
                    '@type': 'HowToStep',
                    position: 2,
                    name: 'Practice Conversation',
                    text: 'Engage in realistic role-play with AI characters, responding naturally to challenging situations',
                  },
                  {
                    '@type': 'HowToStep',
                    position: 3,
                    name: 'Receive Feedback',
                    text: 'Get real-time analysis of your emotional intelligence across four dimensions: self-awareness, self-management, social awareness, and relationship management',
                  },
                  {
                    '@type': 'HowToStep',
                    position: 4,
                    name: 'Review and Improve',
                    text: 'Review your session summary, identify areas for improvement, and practice again to build your EQ skills',
                  },
                ],
              },
              {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                  {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: 'https://niceai.chat/',
                  },
                ],
              },
            ]),
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


