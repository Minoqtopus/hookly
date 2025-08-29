export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background">
      <div className="container py-24">
        <div className="prose prose-invert mx-auto">{children}</div>
      </div>
    </div>
  );
}
