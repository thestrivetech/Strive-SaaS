export default function TransactionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
