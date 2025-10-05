import Marketplace from '../../pages/Marketplace';
import { ThemeProvider } from '@/lib/theme-provider';

export default function MarketplaceExample() {
  return (
    <ThemeProvider>
      <Marketplace />
    </ThemeProvider>
  );
}
