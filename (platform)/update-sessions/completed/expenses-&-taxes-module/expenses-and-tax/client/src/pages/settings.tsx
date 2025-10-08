import { Construction } from "lucide-react";

export default function Settings() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Construction className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Settings Page</h1>
        <p className="text-muted-foreground">
          This page is under construction. Return to Dashboard to manage your preferences.
        </p>
      </div>
    </div>
  );
}
