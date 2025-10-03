import type { Metadata } from "next";
import Navigation from "@/components/(web)/web/navigation";
import Footer from "@/components/(web)/web/footer";
import { Toaster } from "@/components/(shared)/ui/toaster";

export const metadata: Metadata = {
  title: "Strive Tech - AI & Innovation Solutions",
  description: "Transform your business with cutting-edge AI solutions. Expert implementation, proven results, tailored strategies for sustainable growth.",
};

export default function WebLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navigation />
      <main>{children}</main>
      <Footer />
      <Toaster />
    </>
  );
}