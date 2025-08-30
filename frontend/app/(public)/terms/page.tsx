import LegalLayout from "@/components/composite/legal-layout";

export default function TermsPage() {
  return (
    <LegalLayout>
      <h1>Terms of Service</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <h2>1. Introduction</h2>
      <p>
        Welcome to Hookly! These Terms of Service ("Terms") govern your use of
        our website and services. By using Hookly, you agree to these Terms.
      </p>
      <h2>2. User Accounts</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account
        and password. You agree to accept responsibility for all activities that
        occur under your account.
      </p>
      <h2>3. Content</h2>
      <p>
        Our service allows you to generate content. You are responsible for the
        content you generate and its consequences.
      </p>
      <h2>4. Termination</h2>
      <p>
        We may terminate or suspend your account at any time, without prior
        notice or liability, for any reason whatsoever.
      </p>
      <h2>5. Changes to Terms</h2>
      <p>
        We reserve the right to modify these terms at any time. We will notify
        you of any changes by posting the new Terms of Service on this page.
      </p>
    </LegalLayout>
  );
}
