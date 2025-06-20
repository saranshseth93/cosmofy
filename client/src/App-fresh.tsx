import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-black text-white">
        {/* Navigation */}
        <nav className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
                <span className="text-xl font-bold">Cosmofy</span>
              </div>
              <div className="hidden md:flex space-x-8">
                <a href="/" className="text-white hover:text-blue-400 transition-colors">Home</a>
                <a href="/gallery" className="text-neutral-400 hover:text-blue-400 transition-colors">Gallery</a>
                <a href="/iss-tracker" className="text-neutral-400 hover:text-blue-400 transition-colors">ISS Tracker</a>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Explore the Cosmos
              </h1>
              <p className="text-xl md:text-2xl text-neutral-300 mb-8 max-w-3xl mx-auto">
                Real-time space data, stunning NASA imagery, and interactive exploration 
                of our universe
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
                  Start Exploring
                </button>
                <button className="px-8 py-4 border border-neutral-600 hover:border-neutral-500 rounded-lg font-semibold transition-colors">
                  View Gallery
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-neutral-800/50 p-6 rounded-xl border border-neutral-700">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold mb-2">NASA Gallery</h3>
              <p className="text-neutral-400">Discover stunning astronomy images from NASA's daily collection</p>
            </div>
            
            <div className="bg-neutral-800/50 p-6 rounded-xl border border-neutral-700">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <div className="w-6 h-6 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-xl font-semibold mb-2">ISS Live Tracking</h3>
              <p className="text-neutral-400">Follow the International Space Station in real-time</p>
            </div>
            
            <div className="bg-neutral-800/50 p-6 rounded-xl border border-neutral-700">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Space Phenomena</h3>
              <p className="text-neutral-400">Track auroras, asteroids, and space weather</p>
            </div>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;