import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navigation from '@/components/navigation';
import LiveChatWidget from '@/components/live-chat-widget';
import EmailCaptureModal from '@/components/email-capture-modal';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ReeseBlanks - Premium Streetwear',
  description: 'Discover exclusive streetwear collections, limited drops, and premium fashion at ReeseBlanks.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <main>{children}</main>
        <LiveChatWidget />
        <EmailCaptureModal />
      </body>
    </html>
  );
}