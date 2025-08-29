/**
 * Demo Page
 * 
 * Staff Engineer Design: Clean, scalable foundation
 * Business Logic: Basic demo interface structure
 */

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            See It In Action
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Watch how our AI platform creates viral content in seconds
          </p>
        </div>

        {/* Demo Video */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <span className="text-6xl mb-4 block">🎬</span>
              <p className="text-xl font-medium text-gray-600">Demo Video</p>
              <p className="text-gray-500">Watch our platform in action</p>
            </div>
          </div>
        </div>

        {/* Demo Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Describe Your Content</h3>
            <p className="text-gray-600">Tell us what you want to create and who it's for</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Generates Content</h3>
            <p className="text-gray-600">Our advanced AI creates engaging content in seconds</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Export & Share</h3>
            <p className="text-gray-600">Download your content and share it on social media</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Create Your Own?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Start with 15 free generations and see the magic happen
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
              Start Free Trial
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors">
              View Pricing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}