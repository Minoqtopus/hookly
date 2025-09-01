export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background">
      <div className="container px-4 sm:px-6 py-12 sm:py-32">
        <div
          className="prose prose-sm sm:prose dark:prose-invert mx-auto max-w-3xl 
                        prose-headings:text-foreground prose-p:text-muted-foreground
                        prose-strong:text-foreground prose-a:text-primary"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
