// Chatbot subdomain layout (chatbot.strivetech.ai)
import { Metadata } from 'next';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'Sai - AI Sales Assistant | Strive Tech',
  description: 'Intelligent AI sales chatbot powered by Strive Tech. Get instant answers about AI solutions for your business.',
  keywords: ['AI chatbot', 'sales assistant', 'AI solutions', 'business automation'],
  robots: 'noindex, nofollow', // Chatbot subdomain shouldn't be indexed
};

export default function ChatbotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
