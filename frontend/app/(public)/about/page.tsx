import { ArrowRight, Sparkles, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-24 md:py-32">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4 sm:mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            About Hookly
          </h1>

          <p className="text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground mb-8 sm:mb-12">
            Transforming ordinary products into viral sensations through
            AI-powered content generation
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
              Our Mission
            </h2>
            <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-md">
              At Hookly, we believe every product has a story worth sharing. Our
              mission is to democratize viral marketing by making it accessible
              to businesses of all sizes. We combine cutting-edge AI technology
              with deep understanding of social media psychology to create
              content that doesn't just get views — it drives conversions.
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
              The Problem We Solve
            </h2>
            <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-md">
              In today's crowded digital marketplace, standing out is harder
              than ever. Businesses spend thousands on content creation, yet
              struggle to achieve viral reach. Traditional marketing approaches
              are expensive, time-consuming, and often miss the mark. Small
              businesses and solopreneurs are left behind, unable to compete
              with brands that have massive marketing budgets.
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
              Our Solution
            </h2>
            <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-md">
              Hookly leverages advanced AI to analyze your product and generate
              viral-worthy content in seconds. Our platform understands the
              nuances of different social media platforms, current trends, and
              psychological triggers that make content shareable. We turn your
              product URL into compelling hooks, engaging descriptions, and
              platform-optimized content that resonates with your target
              audience.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 my-8 sm:my-12">
              <div className="border rounded-lg p-4 sm:p-6 bg-card">
                <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-primary mb-3 sm:mb-4" />
                <h3 className="font-semibold text-base sm:text-lg mb-2">
                  Lightning Fast
                </h3>
                <p className="text-muted-foreground text-sm">
                  Generate viral content in seconds, not hours. Launch campaigns
                  at the speed of trends.
                </p>
              </div>

              <div className="border rounded-lg p-4 sm:p-6 bg-card">
                <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-primary mb-3 sm:mb-4" />
                <h3 className="font-semibold text-base sm:text-lg mb-2">
                  Data-Driven
                </h3>
                <p className="text-muted-foreground text-sm">
                  Built on analysis of millions of viral posts to understand
                  what makes content spread.
                </p>
              </div>

              <div className="border rounded-lg p-4 sm:p-6 bg-card">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-primary mb-3 sm:mb-4" />
                <h3 className="font-semibold text-base sm:text-lg mb-2">
                  Platform Optimized
                </h3>
                <p className="text-muted-foreground text-sm">
                  Tailored content for TikTok, Instagram, YouTube, and more —
                  each with platform-specific optimization.
                </p>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
              Why Hookly?
            </h2>
            <ul className="space-y-2 sm:space-y-3 text-muted-foreground mb-6 sm:mb-8 px-0 sm:px-2">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span className="text-sm sm:text-md">
                  Save thousands on content creation and copywriting services
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span className="text-sm sm:text-md">
                  Launch products faster with instant viral-ready content
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span className="text-sm sm:text-md">
                  Compete with big brands regardless of your marketing budget
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span className="text-sm sm:text-md">
                  Focus on your product while we handle the viral marketing
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span className="text-sm sm:text-md">
                  Stay ahead of trends with AI that learns from real-time data
                </span>
              </li>
            </ul>

            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
              Our Vision
            </h2>
            <p className="text-muted-foreground mb-8 sm:mb-12 text-sm sm:text-md">
              We envision a world where any entrepreneur with a great product
              can achieve viral success. Where marketing excellence isn't
              gatekept by budget or expertise. Where AI empowers creativity
              rather than replacing it. Hookly is building the future of viral
              marketing — one where success is determined by the quality of your
              product, not the size of your marketing budget.
            </p>

            <div className="border-t pt-6 sm:pt-8 mt-8 sm:mt-12">
              <p className="text-center text-sm sm:text-md text-muted-foreground mb-4 sm:mb-6">
                Ready to make your product go viral?
              </p>
              <div className="flex justify-center">
                <Link
                  href="/generate"
                  className="inline-flex items-center gap-2 bg-primary text-sm sm:text-md text-primary-foreground sm:text-primary-foreground px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Start Generating Content
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
