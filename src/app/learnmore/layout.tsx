import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Learn More About Emotional Intelligence Training | NiceAI',
  description: 'Discover how NiceAI helps you improve emotional intelligence through AI-powered conversation practice. Learn about EQ dimensions, benefits, and how it works.',
  keywords: 'emotional intelligence training, EQ coaching, conversation practice, soft skills development, communication skills, empathy training',
  openGraph: {
    title: 'Learn More About EQ Training | NiceAI',
    description: 'Master emotional intelligence with AI-powered conversation practice. Learn how NiceAI helps you build self-awareness, manage emotions, and improve relationships.',
    url: 'https://niceai.chat/learnmore',
    type: 'website',
    images: [
      {
        url: 'https://niceai.chat/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Learn More About NiceAI - Emotional Intelligence Training',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Learn More About EQ Training | NiceAI',
    description: 'Master emotional intelligence with AI-powered conversation practice',
    images: ['https://niceai.chat/og-image.png'],
  },
  alternates: {
    canonical: 'https://niceai.chat/learnmore',
  },
};

export default function LearnMoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'How to Improve Your Emotional Intelligence',
            description: 'Learn how NiceAI helps you improve emotional intelligence through AI-powered conversation practice and real-time feedback.',
            author: {
              '@type': 'Organization',
              name: 'NiceAI',
            },
            publisher: {
              '@type': 'Organization',
              name: 'NiceAI',
              logo: {
                '@type': 'ImageObject',
                url: 'https://niceai.chat/favicon.svg',
              },
            },
            datePublished: '2024-12-01',
            dateModified: new Date().toISOString().split('T')[0],
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': 'https://niceai.chat/learnmore',
            },
          }),
        }}
      />
      {children}
    </>
  );
}

