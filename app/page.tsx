"use client";

import { InstagramRoastGenerator } from "@/components/instagram-roast-generator";

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-gray-900 to-blue-900 min-h-screen text-gray-200">
      <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6 md:py-8">
        <div className="max-w-lg mx-auto bg-gray-900/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-blue-500/50">
          <div className="p-3 sm:p-4 md:p-6">
            {/* Header */}
            <div className="text-center mb-4 sm:mb-6">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                Instagram Roast Generator
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">Tes mental lo disini...</p>
            </div>
            
            <InstagramRoastGenerator />

            {/* Footer */}
            <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-400">
              Made with ❤️ by{" "}
              <a 
                href="https://instagram.com/dandidandil" 
                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 hover:opacity-80" 
                target="_blank"
                rel="noopener noreferrer"
              >
                @dandidandil
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}