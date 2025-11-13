export default function ModulLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The belajar root layout already renders the global Sidebar and Header.
  // Keep this nested layout minimal to avoid duplicated shells on modul pages.
  return <>{children}</>;
}

