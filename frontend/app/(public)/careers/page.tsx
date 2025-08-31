import { Briefcase, Mail, Rocket, Users } from "lucide-react";
import Link from "next/link";

export default function CareersPage() {
  return (
    <main className="min-h-screen">
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-24 md:py-32">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4 sm:mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Careers at Hookly
          </h1>

          <p className="text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground mb-8 sm:mb-12">
            Join us in revolutionizing how products go viral
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="border rounded-lg p-4 sm:p-6 md:p-8 bg-card mb-8 sm:mb-12">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <h2 className="text-xl sm:text-2xl font-semibold m-0">
                  Current Openings
                </h2>
              </div>
              <p className="text-muted-foreground mb-0 text-sm sm:text-md">
                We don't have any open positions at the moment, but we're always
                interested in connecting with talented individuals who are
                passionate about AI, viral marketing, and building products that
                make a difference.
              </p>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
              Why Work at Hookly?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
              <div className="border rounded-lg p-4 sm:p-6 bg-card">
                <Rocket className="w-8 h-8 sm:w-10 sm:h-10 text-primary mb-3 sm:mb-4" />
                <h3 className="font-semibold text-base sm:text-lg mb-2">
                  Innovation First
                </h3>
                <p className="text-muted-foreground text-sm">
                  Work at the cutting edge of AI and viral marketing. We're
                  building technology that doesn't exist yet.
                </p>
              </div>

              <div className="border rounded-lg p-4 sm:p-6 bg-card">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-primary mb-3 sm:mb-4" />
                <h3 className="font-semibold text-base sm:text-lg mb-2">
                  Impact at Scale
                </h3>
                <p className="text-muted-foreground text-sm">
                  Help millions of entrepreneurs and businesses succeed. Your
                  work directly impacts their growth.
                </p>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
              Our Culture
            </h2>
            <p className="text-muted-foreground mb-3 sm:mb-4">
              At Hookly, we believe in:
            </p>
            <ul className="space-y-2 sm:space-y-3 text-muted-foreground mb-6 sm:mb-8 p-0 sm:px-2">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span className="text-sm sm:text-md">
                  <strong>Customer Obsession:</strong> Every decision starts
                  with how it benefits our users
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span className="text-sm sm:text-md">
                  <strong>Rapid Iteration:</strong> Ship fast, learn faster, and
                  constantly improve
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span className="text-sm sm:text-md">
                  <strong>Data-Driven Decisions:</strong> Let metrics guide us,
                  not opinions
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span className="text-sm sm:text-md">
                  <strong>Ownership Mentality:</strong> Act like an owner, not
                  an employee
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span className="text-sm sm:text-md">
                  <strong>Continuous Learning:</strong> Stay curious and never
                  stop growing
                </span>
              </li>
            </ul>

            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
              Stay Connected
            </h2>
            <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-md">
              While we don't have open positions right now, we'd love to keep in
              touch. When we start hiring, we'll be looking for:
            </p>

            <div className="border rounded-lg p-4 sm:p-6 md:p-8 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <h3 className="text-lg sm:text-xl font-semibold m-0">
                  Get Notified
                </h3>
              </div>
              <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-md">
                Interested in future opportunities? Send us your resume and a
                note about why you're excited about Hookly.
              </p>
              <p className="mb-0">
                <a
                  href="mailto:minoqtopus.agency@gmail.com"
                  className="text-sm sm:text-primary hover:underline font-semibold"
                >
                  minoqtopus.agency@gmail.com
                </a>
              </p>
            </div>

            <div className="border-t pt-6 sm:pt-8 mt-8 sm:mt-12">
              <p className="text-center text-muted-foreground mb-4 sm:mb-6">
                In the meantime, try our product and see what we're building
              </p>
              <div className="flex justify-center">
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Try Hookly
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
