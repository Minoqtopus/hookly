import { Briefcase, Mail, Rocket, Users } from "lucide-react";
import Link from "next/link";

export default function CareersPage() {
  return (
    <main className="min-h-screen">
      <section className="container mx-auto px-4 py-24 sm:py-32">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Careers at Hookly
          </h1>

          <p className="text-lg leading-8 text-muted-foreground mb-12">
            Join us in revolutionizing how products go viral
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="border rounded-lg p-8 bg-card mb-12">
              <div className="flex items-center gap-3 mb-4">
                <Briefcase className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-semibold m-0">Current Openings</h2>
              </div>
              <p className="text-muted-foreground mb-0">
                We don't have any open positions at the moment, but we're always
                interested in connecting with talented individuals who are
                passionate about AI, viral marketing, and building products that
                make a difference.
              </p>
            </div>

            <h2 className="text-3xl font-bold mb-4">Why Work at Hookly?</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="border rounded-lg p-6 bg-card">
                <Rocket className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Innovation First</h3>
                <p className="text-muted-foreground text-sm">
                  Work at the cutting edge of AI and viral marketing. We're
                  building technology that doesn't exist yet.
                </p>
              </div>

              <div className="border rounded-lg p-6 bg-card">
                <Users className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Impact at Scale</h3>
                <p className="text-muted-foreground text-sm">
                  Help millions of entrepreneurs and businesses succeed. Your
                  work directly impacts their growth.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-4">Our Culture</h2>
            <p className="text-muted-foreground mb-4">
              At Hookly, we believe in:
            </p>
            <ul className="space-y-3 text-muted-foreground mb-8">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>
                  <strong>Customer Obsession:</strong> Every decision starts
                  with how it benefits our users
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>
                  <strong>Rapid Iteration:</strong> Ship fast, learn faster, and
                  constantly improve
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>
                  <strong>Data-Driven Decisions:</strong> Let metrics guide us,
                  not opinions
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>
                  <strong>Ownership Mentality:</strong> Act like an owner, not
                  an employee
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>
                  <strong>Continuous Learning:</strong> Stay curious and never
                  stop growing
                </span>
              </li>
            </ul>

            <h2 className="text-3xl font-bold mb-4">Stay Connected</h2>
            <p className="text-muted-foreground mb-8">
              While we don't have open positions right now, we'd love to keep in
              touch. When we start hiring, we'll be looking for:
            </p>

            <div className="border rounded-lg p-8 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold m-0">Get Notified</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Interested in future opportunities? Send us your resume and a
                note about why you're excited about Hookly.
              </p>
              <p className="mb-0">
                <a
                  href="mailto:minoqtopus.agency@gmail.com"
                  className="text-primary hover:underline font-semibold"
                >
                  minoqtopus.agency@gmail.com
                </a>
              </p>
            </div>

            <div className="border-t pt-8 mt-12">
              <p className="text-center text-muted-foreground mb-6">
                In the meantime, try our product and see what we're building
              </p>
              <div className="flex justify-center">
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
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
