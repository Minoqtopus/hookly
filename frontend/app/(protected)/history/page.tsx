/**
 * History Page
 * 
 * Staff Engineer Design: Clean, scalable foundation
 * Business Logic: Basic history display structure
 */

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Generation History</h1>
        <p className="text-gray-600">View all your previously generated content.</p>
      </div>

      {/* Filter Options */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option>All Platforms</option>
            <option>TikTok</option>
            <option>Instagram</option>
            <option>YouTube</option>
          </select>
          
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option>All Types</option>
            <option>Hook Video</option>
            <option>Educational</option>
            <option>Story</option>
            <option>Trend</option>
          </select>
          
          <input 
            type="date" 
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Generations</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🎵</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">TikTok Hook Video</h3>
                  <p className="text-sm text-gray-600">Generated 2 hours ago</p>
                  <p className="text-sm text-gray-500">Fitness motivation content</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  TikTok
                </span>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📸</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Instagram Story</h3>
                  <p className="text-sm text-gray-600">Generated 1 day ago</p>
                  <p className="text-sm text-gray-500">Business tips for entrepreneurs</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Instagram
                </span>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📺</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">YouTube Short</h3>
                  <p className="text-sm text-gray-600">Generated 3 days ago</p>
                  <p className="text-sm text-gray-500">Cooking tutorial</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  YouTube
                </span>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}