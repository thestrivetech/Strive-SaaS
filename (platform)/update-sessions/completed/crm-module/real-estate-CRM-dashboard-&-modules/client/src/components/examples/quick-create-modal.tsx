import { QuickCreateButton } from "../crm/shared/quick-create-modal";

export default function QuickCreateModalExample() {
  return (
    <div className="p-6 min-h-[400px] relative">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Quick Create Demo</h3>
        <p className="text-muted-foreground">
          Click the floating action button in the bottom-right corner
        </p>
      </div>
      <QuickCreateButton />
    </div>
  );
}
