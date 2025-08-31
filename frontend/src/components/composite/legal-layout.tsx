export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background">
      <div className="container px-4 sm:px-6 py-12 sm:py-24">
        <div className="prose prose-sm sm:prose prose-invert mx-auto max-w-3xl">{children}</div>
      </div>
    </div>
  );
}
