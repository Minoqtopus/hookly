'use client';

import { useAuth } from '@/app/lib/AppContext';
import React, { useEffect, useState } from 'react';

interface BetaApplicationForm {
  company_name: string;
  industry: string;
  team_size: string;
  use_case: string;
  social_media_platforms: string[];
  expected_usage: string;
  additional_info: string;
}

export default function BetaPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<BetaApplicationForm>({
    company_name: '',
    industry: '',
    team_size: '',
    use_case: '',
    social_media_platforms: [],
    expected_usage: '',
    additional_info: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [availability, setAvailability] = useState<{
    allowed: boolean;
    remaining: number;
    message?: string;
  } | null>(null);

  useEffect(() => {
    checkBetaAvailability();
  }, []);

  const checkBetaAvailability = async () => {
    try {
      const response = await fetch('/api/beta/availability');
      if (response.ok) {
        const data = await response.json();
        setAvailability(data);
      }
    } catch (err) {
      console.error('Error checking beta availability:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      social_media_platforms: prev.social_media_platforms.includes(platform)
        ? prev.social_media_platforms.filter(p => p !== platform)
        : [...prev.social_media_platforms, platform]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company_name.trim() || !formData.industry || !formData.team_size || !formData.use_case) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.social_media_platforms.length === 0) {
      setError('Please select at least one social media platform');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/beta/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({
          company_name: '',
          industry: '',
          team_size: '',
          use_case: '',
          social_media_platforms: [],
          expected_usage: '',
          additional_info: ''
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to submit application');
      }
    } catch (err) {
      setError('Error submitting application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Application Submitted!</h3>
              <p className="mt-2 text-sm text-gray-600">
                Thank you for your interest in Hookly! We'll review your application and get back to you within 48 hours.
              </p>
              <div className="mt-6">
                <a
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Go to Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Apply for Beta Access</h1>
            <p className="mt-2 text-lg text-gray-600">
              Join our exclusive beta program and get early access to Hookly's team collaboration features
            </p>
          </div>

          {/* Beta Availability Status */}
          {availability && (
            <div className={`mb-8 p-4 rounded-lg border ${
              availability.allowed 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {availability.allowed ? (
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${
                    availability.allowed ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {availability.allowed ? 'Beta applications are open!' : 'Beta applications are currently limited'}
                  </h3>
                  <p className={`text-sm ${
                    availability.allowed ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {availability.message || (availability.allowed 
                      ? `${availability.remaining} spots remaining` 
                      : 'We\'re at capacity but still accepting applications for our waitlist'
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Information */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your company name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                    Industry *
                  </label>
                  <select
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select industry</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="saas">SaaS</option>
                    <option value="agency">Marketing Agency</option>
                    <option value="consulting">Consulting</option>
                    <option value="education">Education</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="real_estate">Real Estate</option>
                    <option value="food_beverage">Food & Beverage</option>
                    <option value="fashion">Fashion & Beauty</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Team Size and Use Case */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="team_size" className="block text-sm font-medium text-gray-700">
                    Team Size *
                  </label>
                  <select
                    id="team_size"
                    name="team_size"
                    value={formData.team_size}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select team size</option>
                    <option value="1-5">1-5 people</option>
                    <option value="6-10">6-10 people</option>
                    <option value="11-25">11-25 people</option>
                    <option value="26-50">26-50 people</option>
                    <option value="50+">50+ people</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="expected_usage" className="block text-sm font-medium text-gray-700">
                    Expected Monthly Usage
                  </label>
                  <select
                    id="expected_usage"
                    name="expected_usage"
                    value={formData.expected_usage}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select usage</option>
                    <option value="1-50">1-50 generations</option>
                    <option value="51-200">51-200 generations</option>
                    <option value="201-500">201-500 generations</option>
                    <option value="500+">500+ generations</option>
                  </select>
                </div>
              </div>

              {/* Use Case */}
              <div>
                <label htmlFor="use_case" className="block text-sm font-medium text-gray-700">
                  Primary Use Case *
                </label>
                <textarea
                  id="use_case"
                  name="use_case"
                  value={formData.use_case}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe how you plan to use Hookly for your team..."
                  required
                />
              </div>

              {/* Social Media Platforms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Social Media Platforms * (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {['TikTok', 'Instagram', 'X (Twitter)', 'YouTube'].map(platform => (
                    <label key={platform} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.social_media_platforms.includes(platform)}
                        onChange={() => handleCheckboxChange(platform)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <label htmlFor="additional_info" className="block text-sm font-medium text-gray-700">
                  Additional Information
                </label>
                <textarea
                  id="additional_info"
                  name="additional_info"
                  value={formData.additional_info}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any additional context about your team or use case..."
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !availability?.allowed}
                  className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>

          {/* Beta Benefits */}
          <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Beta Program Benefits</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">30 Days Free PRO Access</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Experience all PRO features including team collaboration, advanced analytics, and priority support.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">Early Access to New Features</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Be among the first to test new team collaboration tools and provide feedback.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">Direct Support</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Get direct access to our development team for questions, feedback, and feature requests.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">Influence Product Direction</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Help shape the future of Hookly with your valuable insights and feedback.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
