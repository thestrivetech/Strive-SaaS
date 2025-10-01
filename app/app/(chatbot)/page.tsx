// Root page for chatbot subdomain - redirects to /full
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatbotRootPage() {
  const router = useRouter();

  useEffect(() => {
    // Default to full page mode
    router.replace('/full');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-white">Loading Sai...</div>
    </div>
  );
}
