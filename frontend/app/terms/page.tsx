'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Overview' },
    { id: 'services', title: 'Services' },
    { id: 'user-accounts', title: 'User Accounts' },
    { id: 'content-ownership', title: 'Content & Ownership' },
    { id: 'payment-terms', title: 'Payment Terms' },
    { id: 'acceptable-use', title: 'Acceptable Use' },
    { id: 'intellectual-property', title: 'Intellectual Property' },
    { id: 'limitations', title: 'Limitations & Liability' },
    { id: 'termination', title: 'Termination' },
    { id: 'contact', title: 'Contact Us' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Terms of Service Overview</h2>
            <p className="text-gray-600 leading-relaxed">
              Welcome to Hookly! These Terms of Service govern your use of our AI-powered UGC content generation platform. 
              By accessing or using our services, you agree to be bound by these terms and our Privacy Policy.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Key Terms:</h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• You must be 18+ or have parental consent to use our services</li>
                <li>• You retain ownership of your content and inputs</li>
                <li>• We provide AI tools but don't guarantee specific results</li>
                <li>• Subscription plans have usage limits and auto-renewal</li>
                <li>• We may terminate accounts for policy violations</li>
              </ul>
            </div>
            <p className="text-gray-600 leading-relaxed">
              These terms were last updated on {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}. We may update these terms from time to time, and will notify you of any material changes.
            </p>
          </div>
        );

      case 'services':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Services Description</h2>
            <p className="text-gray-600 leading-relaxed">
              Hookly provides an AI-powered platform for generating User Generated Content (UGC) across multiple social media platforms. 
              Here's what we offer and how our services work:
            </p>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Core Services</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• AI-powered content generation for TikTok, Instagram, X, and YouTube</li>
                  <li>• Template library with proven content structures</li>
                  <li>• Performance prediction and analytics</li>
                  <li>• Team collaboration tools for agencies and marketing teams</li>
                  <li>• API access for enterprise integration</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Service Availability</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• 24/7 platform availability (99.9% uptime target)</li>
                  <li>• Regular maintenance windows with advance notice</li>
                  <li>• Automatic scaling based on demand</li>
                  <li>• Backup and disaster recovery systems</li>
                  <li>• Real-time monitoring and alerting</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Service Limitations</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Generation limits based on subscription plan</li>
                  <li>• Platform-specific content optimization</li>
                  <li>• AI model availability and fallback systems</li>
                  <li>• Rate limiting to prevent abuse</li>
                  <li>• Content moderation and policy compliance</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'user-accounts':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">User Accounts & Registration</h2>
            <p className="text-gray-600 leading-relaxed">
              To access our services, you must create an account and provide accurate information. 
              Here are the requirements and responsibilities for account holders:
            </p>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Account Requirements</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Must be 18 years or older, or have parental consent</li>
                  <li>• Valid email address for account verification</li>
                  <li>• Strong password meeting security requirements</li>
                  <li>• Accurate and up-to-date account information</li>
                  <li>• One account per person (no shared accounts)</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Account Security</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Keep your login credentials secure and confidential</li>
                  <li>• Notify us immediately of any unauthorized access</li>
                  <li>• Enable two-factor authentication when available</li>
                  <li>• Log out from shared devices</li>
                  <li>• Regular password updates recommended</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Account Responsibilities</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Maintain accurate and current account information</li>
                  <li>• Accept responsibility for all activities under your account</li>
                  <li>• Comply with all applicable laws and regulations</li>
                  <li>• Respect intellectual property rights</li>
                  <li>• Report violations or suspicious activity</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">Important Note:</h3>
                <p className="text-yellow-800 text-sm">
                  You are responsible for maintaining the security of your account. We cannot and will not be liable for any loss or damage 
                  arising from your failure to comply with these security obligations.
                </p>
              </div>
            </div>
          </div>
        );

      case 'content-ownership':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Content & Ownership</h2>
            <p className="text-gray-600 leading-relaxed">
              Understanding content ownership is crucial when using AI-powered tools. Here's how content ownership works on Hookly:
            </p>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Your Content</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• You retain full ownership of your original inputs and prompts</li>
                  <li>• AI-generated content based on your inputs belongs to you</li>
                  <li>• You can use, modify, and distribute your generated content</li>
                  <li>• You're responsible for ensuring your content doesn't infringe on others' rights</li>
                  <li>• You grant us a license to use your content for service improvement</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Our Content</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Platform interface, design, and functionality remain our property</li>
                  <li>• Templates and AI models are our intellectual property</li>
                  <li>• Analytics and performance data belong to us</li>
                  <li>• We may use anonymized data for research and improvement</li>
                  <li>• You may not reverse engineer or copy our proprietary technology</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Content License</h3>
                <p className="text-gray-600 text-sm mb-2">
                  By using our services, you grant us a limited, non-exclusive license to:
                </p>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Process your content to provide our services</li>
                  <li>• Use anonymized data for service improvement</li>
                  <li>• Store your content securely for service delivery</li>
                  <li>• Backup your content for disaster recovery</li>
                  <li>• Comply with legal obligations</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Content Rights Summary:</h3>
                <p className="text-green-800 text-sm">
                  <strong>You own:</strong> Your inputs, prompts, and AI-generated content<br/>
                  <strong>We own:</strong> Platform technology, templates, and AI models<br/>
                  <strong>Shared:</strong> Anonymized usage data for service improvement
                </p>
              </div>
            </div>
          </div>
        );

      case 'payment-terms':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Payment Terms & Subscriptions</h2>
            <p className="text-gray-600 leading-relaxed">
              Our subscription plans provide access to different levels of service. Here are the key payment terms and conditions:
            </p>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Subscription Plans</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• <strong>TRIAL:</strong> Free 7-day trial with 15 generations</li>
                  <li>• <strong>STARTER:</strong> $19/month with 50 generations</li>
                  <li>• <strong>PRO:</strong> $59/month with 200 generations + team features</li>
                  <li>• <strong>AGENCY:</strong> $129/month with 500 generations + full team access</li>
                  <li>• Annual plans available with 17% discount</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Billing & Renewal</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Subscriptions automatically renew on monthly or annual basis</li>
                  <li>• Payment is processed on the renewal date</li>
                  <li>• Failed payments may result in service suspension</li>
                  <li>• Price changes will be communicated 30 days in advance</li>
                  <li>• Refunds are handled on a case-by-case basis</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Usage Limits & Overage</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Generation limits reset monthly on your billing date</li>
                  <li>• Overage charges: $0.15 per generation after limit</li>
                  <li>• Usage warnings at 80% of monthly limit</li>
                  <li>• Plan upgrades available anytime during billing cycle</li>
                  <li>• Unused generations do not carry over to next month</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Cancellation & Refunds</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Cancel anytime through your account settings</li>
                  <li>• Service continues until end of current billing period</li>
                  <li>• No refunds for partial months of service</li>
                  <li>• Trial cancellations stop automatic billing</li>
                  <li>• Data retention for 30 days after cancellation</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'acceptable-use':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Acceptable Use Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              To maintain a safe and productive environment for all users, we have established guidelines for acceptable use of our platform. 
              Violation of these policies may result in account suspension or termination.
            </p>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Prohibited Activities</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Creating content that promotes hate speech or discrimination</li>
                  <li>• Generating content for illegal activities or fraud</li>
                  <li>• Violating intellectual property rights of others</li>
                  <li>• Attempting to reverse engineer or hack our platform</li>
                  <li>• Using automated tools to abuse our services</li>
                  <li>• Sharing account credentials with unauthorized users</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Content Guidelines</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Content must comply with applicable laws and regulations</li>
                  <li>• No false or misleading advertising claims</li>
                  <li>• Respect copyright and trademark rights</li>
                  <li>• Avoid content that could harm minors</li>
                  <li>• No spam or excessive promotional content</li>
                  <li>• Maintain professional and ethical standards</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Platform Usage</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Use services for intended business purposes only</li>
                  <li>• Respect rate limits and fair usage policies</li>
                  <li>• Report bugs and security vulnerabilities</li>
                  <li>• Provide constructive feedback for improvements</li>
                  <li>• Support other users in the community</li>
                  <li>• Maintain professional conduct in all interactions</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">Consequences of Violations:</h3>
                <p className="text-red-800 text-sm">
                  <strong>First violation:</strong> Warning and content removal<br/>
                  <strong>Second violation:</strong> Temporary account suspension (7-30 days)<br/>
                  <strong>Third violation:</strong> Permanent account termination<br/>
                  <strong>Severe violations:</strong> Immediate termination and legal action if necessary
                </p>
              </div>
            </div>
          </div>
        );

      case 'intellectual-property':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Intellectual Property Rights</h2>
            <p className="text-gray-600 leading-relaxed">
              Intellectual property is a critical aspect of our platform. Here's how we handle IP rights and what you need to know:
            </p>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Our Intellectual Property</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Platform technology, algorithms, and software</li>
                  <li>• AI models, templates, and content structures</li>
                  <li>• Brand names, logos, and visual design elements</li>
                  <li>• Documentation, tutorials, and educational content</li>
                  <li>• Analytics tools and performance metrics</li>
                  <li>• Platform architecture and infrastructure</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Your Intellectual Property</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Original content, ideas, and creative inputs</li>
                  <li>• Brand assets and proprietary information</li>
                  <li>• Business strategies and marketing materials</li>
                  <li>• Custom templates and content structures</li>
                  <li>• User-generated content and feedback</li>
                  <li>• Business data and analytics insights</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Licensing & Permissions</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• We grant you a limited license to use our platform</li>
                  <li>• You grant us permission to process your content</li>
                  <li>• Templates are licensed for commercial use</li>
                  <li>• AI-generated content is licensed to you</li>
                  <li>• No transfer of ownership in either direction</li>
                  <li>• Licenses terminate when you stop using our services</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Third-Party IP</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Respect third-party intellectual property rights</li>
                  <li>• Don't use copyrighted materials without permission</li>
                  <li>• Report potential IP violations to our team</li>
                  <li>• We may remove content that infringes on others' rights</li>
                  <li>• You're responsible for ensuring your content is original</li>
                  <li>• Consider using royalty-free or licensed materials</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'limitations':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Limitations & Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              While we strive to provide excellent service, it's important to understand the limitations of our platform and our liability. 
              Here are the key limitations and disclaimers:
            </p>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Service Limitations</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• AI-generated content may not always meet expectations</li>
                  <li>• Platform availability subject to maintenance and updates</li>
                  <li>• Generation limits apply to all subscription plans</li>
                  <li>• Some features may be limited based on your plan</li>
                  <li>• Third-party integrations subject to their availability</li>
                  <li>• Performance may vary based on usage and demand</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Liability Limitations</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• We provide tools but don't guarantee specific results</li>
                  <li>• Not liable for content generated using our platform</li>
                  <li>• No responsibility for third-party service failures</li>
                  <li>• Limited liability for indirect or consequential damages</li>
                  <li>• Maximum liability limited to amount paid for services</li>
                  <li>• No liability for data loss beyond our control</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Disclaimers</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Services provided "as is" without warranties</li>
                  <li>• No guarantee of uninterrupted or error-free service</li>
                  <li>• AI models may produce unexpected or inappropriate content</li>
                  <li>• User responsibility for content compliance and legality</li>
                  <li>• No endorsement of user-generated content</li>
                  <li>• Platform subject to change without notice</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">Important Disclaimer:</h3>
                <p className="text-yellow-800 text-sm">
                  <strong>We are not responsible for:</strong> Content generated using our platform, legal compliance of user content, 
                  business outcomes from using our services, or third-party service failures. Users are responsible for ensuring their 
                  content complies with applicable laws and regulations.
                </p>
              </div>
            </div>
          </div>
        );

      case 'termination':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Account Termination</h2>
            <p className="text-gray-600 leading-relaxed">
              We hope you'll continue using Hookly, but we understand that circumstances may change. 
              Here's how account termination works and what happens to your data:
            </p>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Voluntary Termination</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Cancel your subscription anytime through account settings</li>
                  <li>• Service continues until end of current billing period</li>
                  <li>• No additional charges after cancellation</li>
                  <li>• Export your data before cancellation if needed</li>
                  <li>• Reactivate your account within 30 days if desired</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Involuntary Termination</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Violation of Terms of Service or Acceptable Use Policy</li>
                  <li>• Non-payment or repeated payment failures</li>
                  <li>• Fraudulent or abusive behavior</li>
                  <li>• Legal or regulatory compliance issues</li>
                  <li>• Extended period of account inactivity</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Data Retention After Termination</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Account data retained for 30 days after termination</li>
                  <li>• Content and generations accessible during retention period</li>
                  <li>• Data permanently deleted after 30 days</li>
                  <li>• Anonymized analytics data may be retained</li>
                  <li>• Legal obligations may require longer retention</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Reactivation & Appeals</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Contact support to appeal involuntary termination</li>
                  <li>• Provide explanation and evidence for reconsideration</li>
                  <li>• Appeals reviewed within 5 business days</li>
                  <li>• Successful appeals may result in account restoration</li>
                  <li>• Repeated violations may result in permanent termination</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Before You Go:</h3>
                <p className="text-blue-800 text-sm">
                  We're sorry to see you leave! Before terminating your account, consider pausing your subscription instead. 
                  You can always reactivate later, and we'd love to hear your feedback on how we can improve our services.
                </p>
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Contact Information</h2>
            <p className="text-gray-600 leading-relaxed">
              Have questions about these Terms of Service? Need clarification on any specific terms? 
              We're here to help and ensure you understand your rights and responsibilities.
            </p>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Legal & Terms Inquiries</h3>
                <p className="text-gray-600 text-sm mb-2">
                  For questions about these terms and legal matters:
                </p>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Email: <a href="mailto:legal@hookly.ai" className="text-blue-600 hover:underline">legal@hookly.ai</a></li>
                  <li>• Terms Questions: <a href="mailto:terms@hookly.ai" className="text-blue-600 hover:underline">terms@hookly.ai</a></li>
                  <li>• Response Time: Within 48 hours</li>
                  <li>• Legal Review: Available for complex inquiries</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">General Support</h3>
                <p className="text-gray-600 text-sm mb-2">
                  For technical support and general questions:
                </p>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Email: <a href="mailto:support@hookly.ai" className="text-blue-600 hover:underline">support@hookly.ai</a></li>
                  <li>• Response Time: Within 24 hours</li>
                  <li>• Available: Monday-Friday, 9 AM - 6 PM EST</li>
                  <li>• Emergency: 24/7 for critical service issues</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Business & Partnerships</h3>
                <p className="text-gray-600 text-sm mb-2">
                  For business inquiries and partnership opportunities:
                </p>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Email: <a href="mailto:business@hookly.ai" className="text-blue-600 hover:underline">business@hookly.ai</a></li>
                  <li>• Enterprise Sales: <a href="mailto:sales@hookly.ai" className="text-blue-600 hover:underline">sales@hookly.ai</a></li>
                  <li>• Response Time: Within 24 hours</li>
                  <li>• Meeting Scheduling: Available for qualified prospects</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">We're Here to Help:</h3>
                <p className="text-green-800 text-sm">
                  Our team is committed to providing clear, helpful responses to all your questions about these terms. 
                  We believe in transparency and want to ensure you fully understand your rights and our obligations. 
                  Don't hesitate to reach out - we're here to support your success with Hookly.
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            These terms govern your use of Hookly and outline the rights and responsibilities of both you and our platform. 
            Please read them carefully.
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
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-800 hover:underline">
                      Privacy Policy
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
            These Terms of Service are legally binding and govern your relationship with Hookly. 
            By using our services, you acknowledge that you have read, understood, and agree to these terms.
          </p>
        </div>
      </div>
    </div>
  );
}
