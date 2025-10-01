import { NextRequest } from 'next/server';

export function detectHostType(request: NextRequest): 'chatbot' | 'marketing' | 'platform' | 'unknown' {
  const hostname = request.headers.get('host') || '';
  const path = request.nextUrl.pathname;

  // Chatbot subdomain
  const isChatbotSite =
    hostname === 'chatbot.strivetech.ai' ||
    hostname === 'www.chatbot.strivetech.ai' ||
    (hostname.includes('localhost') && (path.startsWith('/full') || path.startsWith('/widget')));

  if (isChatbotSite) return 'chatbot';

  // Marketing site
  const isMarketingSite =
    hostname === 'strivetech.ai' ||
    hostname === 'www.strivetech.ai' ||
    (hostname.includes('localhost') && path.startsWith('/web'));

  if (isMarketingSite) return 'marketing';

  // Platform site
  const isPlatformSite =
    hostname === 'app.strivetech.ai' ||
    (hostname.includes('localhost') && !path.startsWith('/web'));

  if (isPlatformSite) return 'platform';

  return 'unknown';
}
