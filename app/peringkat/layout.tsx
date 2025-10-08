export default function PeringkatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full overflow-hidden">
      {children}
    </div>
  );
}

