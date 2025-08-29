/**
 * Dashboard Page
 * 
 * Staff Engineer Design: Clean, scalable foundation
 * Business Logic: Basic dashboard structure for authenticated users
 */

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your content generation overview.</p>
      </div>

      {/* Email Verification Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-blue-400 text-lg mr-3">📧</span>
            <div>
              <h3 className="text-sm font-medium text-blue-800">
                Verify Your Email
              </h3>
              <p className="text-sm text-blue-700">
                Verify your email to unlock 10 additional generations (5→15 total)
              </p>
            </div>
          </div>
          <a 
            href="/verification"
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Verify Now
          </a>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Generations Used</p>
              <p className="text-2xl font-semibold text-gray-900">2</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Remaining</p>
              <p className="text-2xl font-semibold text-gray-900">3</p>
              <p className="text-xs text-gray-500">of 5 (unverified)</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Plan</p>
              <p className="text-2xl font-semibold text-gray-900">Trial</p>
              <p className="text-xs text-gray-500">7 days remaining</p>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Benefits */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Unlock More Generations</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-400 mb-2">5</div>
            <p className="text-sm text-gray-600">Current Limit</p>
            <p className="text-xs text-gray-500 mt-1">Unverified email</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="text-3xl font-bold text-blue-600 mb-2">15</div>
            <p className="text-sm text-blue-700">After Verification</p>
            <p className="text-xs text-blue-600 mt-1">+10 generations</p>
          </div>
        </div>
        <div className="mt-4 text-center">
          <a 
            href="/verification"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <span className="mr-2">🔓</span>
            Verify Email to Unlock
          </a>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a 
            href="/generate"
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
          >
            Generate New Content
          </a>
          <a 
            href="/verification"
            className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
          >
            Verify Email
          </a>
        </div>
      </div>

      {/* Recent Generations */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Generations</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">TikTok Hook Video</p>
              <p className="text-sm text-gray-600">Generated 2 hours ago</p>
            </div>
            <span className="text-sm text-gray-500">TikTok</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Instagram Story</p>
              <p className="text-sm text-gray-600">Generated 1 day ago</p>
            </div>
            <span className="text-sm text-gray-500">Instagram</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">YouTube Short</p>
              <p className="text-sm text-gray-600">Generated 3 days ago</p>
            </div>
            <span className="text-sm text-gray-500">YouTube</span>
          </div>
        </div>
      </div>
    </div>
  );
}