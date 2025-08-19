'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Overview' },
    { id: 'data-collection', title: 'Data Collection' },
    { id: 'data-usage', title: 'Data Usage' },
    { id: 'data-sharing', title: 'Data Sharing' },
    { id: 'user-rights', title: 'Your Rights' },
    { id: 'cookies', title: 'Cookies & Tracking' },
    { id: 'security', title: 'Security' },
    { id: 'contact', title: 'Contact Us' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Privacy Policy Overview</h2>
            <p className="text-gray-600 leading-relaxed">
              At Hookly, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, and safeguard your data when you use our AI-powered UGC content generation platform.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Key Points:</h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• We collect only necessary data to provide our services</li>
                <li>• Your content and data remain private and secure</li>
                <li>• We never sell your personal information to third parties</li>
                <li>• You have full control over your data and can delete it anytime</li>
                <li>• We comply with GDPR, CCPA, and other privacy regulations</li>
              </ul>
            </div>
            <p className="text-gray-600 leading-relaxed">
              This policy was last updated on {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} and applies to all users of Hookly services.
            </p>
          </div>
        );

      case 'data-collection':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Data Collection</h2>
            <p className="text-gray-600 leading-relaxed">
              We collect information to provide, improve, and personalize our services. Here's what we collect and why:
            </p>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Account Information</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Email address (for account creation and communication)</li>
                  <li>• Name (optional, for personalization)</li>
                  <li>• Password (encrypted and securely stored)</li>
                  <li>• Subscription plan and payment information</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Usage Data</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Content generation requests and preferences</li>
                  <li>• Platform usage patterns and feature interactions</li>
                  <li>• Performance metrics and content analytics</li>
                  <li>• Error logs and technical diagnostics</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Content Data</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• AI-generated content and your custom inputs</li>
                  <li>• Template usage and customization preferences</li>
                  <li>• Content performance data and engagement metrics</li>
                  <li>• User-generated content and feedback</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'data-usage':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Data Usage</h2>
            <p className="text-gray-600 leading-relaxed">
              We use your data responsibly to provide and improve our services. Here's how we use the information we collect:
            </p>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Service Provision</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Generate AI-powered content based on your inputs</li>
                  <li>• Manage your account and subscription</li>
                  <li>• Provide customer support and technical assistance</li>
                  <li>• Process payments and manage billing</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Service Improvement</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Analyze usage patterns to improve features</li>
                  <li>• Optimize AI models and content generation</li>
                  <li>• Enhance user experience and platform performance</li>
                  <li>• Develop new features based on user needs</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Communication</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Send important service updates and notifications</li>
                  <li>• Provide customer support and respond to inquiries</li>
                  <li>• Share relevant product updates and new features</li>
                  <li>• Send billing and subscription reminders</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'data-sharing':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Data Sharing</h2>
            <p className="text-gray-600 leading-relaxed">
              We are committed to protecting your privacy and do not sell, trade, or rent your personal information to third parties. 
              We only share data in limited, specific circumstances:
            </p>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Service Providers</h3>
                <p className="text-gray-600 text-sm mb-2">
                  We work with trusted third-party service providers who help us operate our platform:
                </p>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Payment processors (LemonSqueezy) for secure transactions</li>
                  <li>• AI service providers (OpenAI, Claude, Gemini) for content generation</li>
                  <li>• Cloud hosting providers for reliable service delivery</li>
                  <li>• Analytics services for platform improvement</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Legal Requirements</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Comply with applicable laws and regulations</li>
                  <li>• Respond to legal requests and court orders</li>
                  <li>• Protect our rights, property, and safety</li>
                  <li>• Prevent fraud and security threats</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Business Transfers</h3>
                <p className="text-gray-600 text-sm">
                  In the event of a merger, acquisition, or sale of assets, your data may be transferred as part of the business transaction. 
                  We will ensure that your privacy rights continue to be protected.
                </p>
              </div>
            </div>
          </div>
        );

      case 'user-rights':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Your Rights</h2>
            <p className="text-gray-600 leading-relaxed">
              You have important rights regarding your personal data. We are committed to honoring these rights and making it easy for you to exercise them:
            </p>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Access & Portability</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Request a copy of all personal data we hold about you</li>
                  <li>• Export your data in a machine-readable format</li>
                  <li>• Access your account information and usage data</li>
                  <li>• Review and update your account settings</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Correction & Updates</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Correct inaccurate or incomplete information</li>
                  <li>• Update your account details and preferences</li>
                  <li>• Modify your content generation preferences</li>
                  <li>• Change your communication preferences</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Deletion & Withdrawal</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Delete your account and all associated data</li>
                  <li>• Remove specific content or data points</li>
                  <li>• Withdraw consent for data processing</li>
                  <li>• Request data anonymization for analytics</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Restriction & Objection</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Restrict how we process your data</li>
                  <li>• Object to certain types of data processing</li>
                  <li>• Opt out of marketing communications</li>
                  <li>• Control automated decision-making</li>
                </ul>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">How to Exercise Your Rights:</h3>
              <p className="text-green-800 text-sm">
                You can exercise these rights by contacting us at{' '}
                <a href="mailto:privacy@hookly.ai" className="underline hover:text-green-700">
                  privacy@hookly.ai
                </a>
                . We will respond to your request within 30 days and provide the requested information or action free of charge.
              </p>
            </div>
          </div>
        );

      case 'cookies':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Cookies & Tracking</h2>
            <p className="text-gray-600 leading-relaxed">
              We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized services. 
              Here's what you need to know about our use of these technologies:
            </p>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Essential Cookies</h3>
                <p className="text-gray-600 text-sm mb-2">
                  These cookies are necessary for the platform to function properly:
                </p>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Authentication and session management</li>
                  <li>• Security and fraud prevention</li>
                  <li>• Basic platform functionality</li>
                  <li>• Payment processing</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Analytics Cookies</h3>
                <p className="text-gray-600 text-sm mb-2">
                  These cookies help us understand how you use our platform:
                </p>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Usage patterns and feature adoption</li>
                  <li>• Performance metrics and error tracking</li>
                  <li>• User experience optimization</li>
                  <li>• Content generation analytics</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Personalization Cookies</h3>
                <p className="text-gray-600 text-sm mb-2">
                  These cookies help us provide personalized experiences:
                </p>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Content preferences and history</li>
                  <li>• AI model optimization for your style</li>
                  <li>• Customized dashboard and features</li>
                  <li>• Platform language and region settings</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">Cookie Management:</h3>
                <p className="text-yellow-800 text-sm">
                  You can control cookies through your browser settings. However, disabling certain cookies may limit your ability to use some features of our platform. 
                  We respect your choices and will honor your cookie preferences.
                </p>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement industry-standard security measures to protect your data and ensure the confidentiality, integrity, and availability of our services:
            </p>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Data Protection</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• End-to-end encryption for data in transit</li>
                  <li>• AES-256 encryption for data at rest</li>
                  <li>• Secure API endpoints with rate limiting</li>
                  <li>• Regular security audits and penetration testing</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Access Control</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Multi-factor authentication for admin accounts</li>
                  <li>• Role-based access control and permissions</li>
                  <li>• Session management and timeout controls</li>
                  <li>• Secure password policies and hashing</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Infrastructure Security</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Secure cloud infrastructure with SOC 2 compliance</li>
                  <li>• Regular security updates and patch management</li>
                  <li>• Intrusion detection and prevention systems</li>
                  <li>• 24/7 security monitoring and incident response</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Incident Response</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Comprehensive incident response plan</li>
                  <li>• Rapid detection and containment procedures</li>
                  <li>• User notification protocols for data breaches</li>
                  <li>• Regular security training for our team</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Security Best Practices:</h3>
                <p className="text-blue-800 text-sm">
                  We regularly review and update our security measures to address emerging threats and maintain compliance with industry standards. 
                  If you discover a security vulnerability, please report it to{' '}
                  <a href="mailto:security@hookly.ai" className="underline hover:text-blue-700">
                    security@hookly.ai
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, we're here to help. 
              You can reach us through multiple channels:
            </p>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Privacy Inquiries</h3>
                <p className="text-gray-600 text-sm mb-2">
                  For privacy-related questions and data requests:
                </p>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Email: <a href="mailto:privacy@hookly.ai" className="text-blue-600 hover:underline">privacy@hookly.ai</a></li>
                  <li>• Data Subject Rights: <a href="mailto:rights@hookly.ai" className="text-blue-600 hover:underline">rights@hookly.ai</a></li>
                  <li>• Response Time: Within 30 days</li>
                  <li>• Languages: English (primary), other languages available upon request</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">General Support</h3>
                <p className="text-gray-600 text-sm mb-2">
                  For general questions and technical support:
                </p>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Email: <a href="mailto:support@hookly.ai" className="text-blue-600 hover:underline">support@hookly.ai</a></li>
                  <li>• Response Time: Within 24 hours</li>
                  <li>• Available: Monday-Friday, 9 AM - 6 PM EST</li>
                  <li>• Emergency: 24/7 for critical security issues</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Data Protection Officer</h3>
                <p className="text-gray-600 text-sm mb-2">
                  For EU residents and GDPR compliance:
                </p>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Email: <a href="mailto:dpo@hookly.ai" className="text-blue-600 hover:underline">dpo@hookly.ai</a></li>
                  <li>• Role: Independent data protection oversight</li>
                  <li>• Expertise: GDPR, CCPA, and international privacy law</li>
                  <li>• Response Time: Within 72 hours for urgent matters</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Your Privacy Matters:</h3>
                <p className="text-green-800 text-sm">
                  We take your privacy seriously and are committed to transparency. If you're not satisfied with our response, 
                  you have the right to lodge a complaint with your local data protection authority. We're here to work with you 
                  to resolve any concerns about your data privacy.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're committed to protecting your privacy and ensuring transparency in how we handle your data. 
            This policy explains your rights and our practices.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h2>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Related Links</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/terms" className="text-blue-600 hover:text-blue-800 hover:underline">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/help" className="text-blue-600 hover:text-blue-800 hover:underline">
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link href="/" className="text-blue-600 hover:text-blue-800 hover:underline">
                      Back to Home
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              {renderSection()}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            This Privacy Policy is part of our commitment to transparency and user privacy. 
            We regularly review and update this policy to ensure compliance with applicable laws and best practices.
          </p>
        </div>
      </div>
    </div>
  );
}
