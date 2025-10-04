import { ReactNode } from "react";
import Sidebar from "./sidebar";
import Header from "./header";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-hidden flex flex-col">
        <Header />
        <div className="flex-1 overflow-y-auto scrollbar-thin p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
