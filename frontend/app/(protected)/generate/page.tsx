/**
 * Generate Content Page
 * 
 * Staff Engineer Design: Clean, scalable foundation
 * Business Logic: Basic content generation interface
 */

export default function GeneratePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Generate Content</h1>
        <p className="text-gray-600">Create viral content for your chosen platform.</p>
      </div>

      {/* Email Verification Reminder */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-blue-400 text-lg mr-3">🔓</span>
            <div>
              <h3 className="text-sm font-medium text-blue-800">
                Unlock More Generations
              </h3>
              <p className="text-sm text-blue-700">
                You have 3 generations remaining. Verify your email to unlock 15 total generations.
              </p>
            </div>
          </div>
          <a 
            href="/verification"
            className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Verify Now
          </a>
        </div>
      </div>

      {/* Platform Selection */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Platform</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 transition-colors">
            <div className="text-center">
              <span className="text-3xl mb-2 block">🎵</span>
              <h3 className="font-semibold text-gray-900">TikTok</h3>
              <p className="text-sm text-gray-600">60-90 second videos</p>
            </div>
          </button>
          
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
            <div className="text-center">
              <span className="text-3xl mb-2 block">📸</span>
              <h3 className="font-semibold text-gray-900">Instagram</h3>
              <p className="text-sm text-gray-600">30-60 second content</p>
            </div>
          </button>
          
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
            <div className="text-center">
              <span className="text-3xl mb-2 block">📺</span>
              <h3 className="font-semibold text-gray-900">YouTube</h3>
              <p className="text-sm text-gray-600">60 seconds to 3 minutes</p>
            </div>
          </button>
        </div>
      </div>

      {/* Content Type */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 transition-colors">
            <div className="text-center">
              <span className="text-2xl mb-2 block">💡</span>
              <h3 className="font-semibold text-gray-900">Hook Video</h3>
              <p className="text-sm text-gray-600">Grab attention in first 3 seconds</p>
            </div>
          </button>
          
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
            <div className="text-center">
              <span className="text-2xl mb-2 block">📚</span>
              <h3 className="font-semibold text-gray-900">Educational</h3>
              <p className="text-sm text-gray-600">Teach something valuable</p>
            </div>
          </button>
          
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
            <div className="text-center">
              <span className="text-2xl mb-2 block">🎭</span>
              <h3 className="font-semibold text-gray-900">Story</h3>
              <p className="text-sm text-gray-600">Share personal experiences</p>
            </div>
          </button>
          
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
            <div className="text-center">
              <span className="text-2xl mb-2 block">🔥</span>
              <h3 className="font-semibold text-gray-900">Trend</h3>
              <p className="text-sm text-gray-600">Jump on viral trends</p>
            </div>
          </button>
        </div>
      </div>

      {/* Content Description */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Describe Your Content</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What do you want to create?
            </label>
            <textarea 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Describe the content you want to generate. Be specific about your niche, target audience, and the message you want to convey..."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              <input 
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Young professionals, fitness enthusiasts"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tone
              </label>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>Professional</option>
                <option>Casual</option>
                <option>Humorous</option>
                <option>Inspirational</option>
                <option>Educational</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <button className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors">
          Generate Content
        </button>
        <p className="text-sm text-gray-600 text-center mt-2">
          This will use 1 generation from your plan (3 remaining)
        </p>
        <p className="text-xs text-blue-600 text-center mt-1">
          Verify your email to unlock 15 total generations
        </p>
      </div>
    </div>
  );
}