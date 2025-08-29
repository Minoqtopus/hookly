import LegalLayout from "../components/legal-layout";

export default function PrivacyPage() {
  return (
    <LegalLayout>
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <h2>1. Information We Collect</h2>
      <p>
        We collect information you provide directly to us, such as when you
        create an account, and information we get from your use of our
        services.
      </p>
      <h2>2. How We Use Information</h2>
      <p>
        We use the information we collect to provide, maintain, and improve our
        services, and to protect Hookly and our users.
      </p>
      <h2>3. Information Sharing</h2>
      <p>
        We do not share your personal information with companies, organizations,
        or individuals outside of Hookly except in the following cases: with
        your consent, for legal reasons.
      </p>
      <h2>4. Security</h2>
      <p>
        We work hard to protect Hookly and our users from unauthorized access
        to or unauthorized alteration, disclosure, or destruction of information
        we hold.
      </p>
    </LegalLayout>
  );
}
