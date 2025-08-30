/**
 * Email Verification Page - Protected Route
 * 
 * Staff Engineer Design: Users verify email while using the app
 * Business Logic: Verification unlocks additional generations (5→15)
 */

export default function EmailVerificationPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
        <p className="text-gray-600">
          Verify your email to secure your account and unlock additional features.
        </p>
      </div>

      {/* Current Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-blue-400 text-lg">📧</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Email Verification Required
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Verify your email to secure your account and ensure you don't lose access to your generations.
            </p>
          </div>
        </div>
      </div>

      {/* Verification Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Send Verification Email</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input 
              type="email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email address"
              defaultValue="user@example.com"
              readOnly
            />
            <p className="mt-1 text-sm text-gray-500">
              We'll send a verification link to this email address.
            </p>
          </div>
          
          <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Send Verification Email
          </button>
        </div>
      </div>

      {/* Benefits of Verification */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Benefits of Email Verification</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Account Security</h3>
              <p className="text-sm text-gray-600">Secure your account and preserve your generations</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Account Recovery</h3>
              <p className="text-sm text-gray-600">Reset password and recover account if needed</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Important Updates</h3>
              <p className="text-sm text-gray-600">Receive notifications about new features</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Better Support</h3>
              <p className="text-sm text-gray-600">Get priority support when you need help</p>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Instructions */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">How to Verify</h2>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">1</span>
            <p className="text-sm text-gray-700">Click "Send Verification Email" above</p>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">2</span>
            <p className="text-sm text-gray-700">Check your email for the verification link</p>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">3</span>
            <p className="text-sm text-gray-700">Click the link to verify your email</p>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">4</span>
            <p className="text-sm text-gray-700">Return to the app to access 15 total generations</p>
          </div>
        </div>
      </div>

      {/* Continue Using App */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Continue Using the App
          </h3>
          <p className="text-gray-600 mb-4">
            You can continue using your 5 available generations while waiting for email verification.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a 
              href="/dashboard"
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Go to Dashboard
            </a>
            <a 
              href="/generate"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Generate Content
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
