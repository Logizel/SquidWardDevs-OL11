export default function Footer() {
  return (
    <footer className="w-full bg-[#0B1B3B] text-white mt-32 pt-16 pb-10">

      {/* CONTAINER (aligned with your site width) */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10">

          {/* PLATFORM */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 mb-4 tracking-wider">
              PLATFORM
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="hover:text-white transition cursor-pointer">Waste Exchange</li>
              <li className="hover:text-white transition cursor-pointer">Recycling Network</li>
              <li className="hover:text-white transition cursor-pointer">Logistics Matching</li>
              <li className="hover:text-white transition cursor-pointer">Compliance Tracking</li>
              <li className="hover:text-white transition cursor-pointer">Analytics Dashboard</li>
              <li className="hover:text-white transition cursor-pointer">Carbon Tracking</li>
            </ul>
          </div>

          {/* INDUSTRIES */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 mb-4 tracking-wider">
              INDUSTRIES
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="hover:text-white transition cursor-pointer">Manufacturing</li>
              <li className="hover:text-white transition cursor-pointer">Chemical</li>
              <li className="hover:text-white transition cursor-pointer">Construction</li>
              <li className="hover:text-white transition cursor-pointer">Textile</li>
              <li className="hover:text-white transition cursor-pointer">Food Processing</li>
              <li className="hover:text-white transition cursor-pointer">Energy</li>
            </ul>
          </div>

          {/* TOOLS */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 mb-4 tracking-wider">
              TOOLS
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="hover:text-white transition cursor-pointer">Waste Calculator</li>
              <li className="hover:text-white transition cursor-pointer">AI Matching</li>
              <li className="hover:text-white transition cursor-pointer">Smart Recommendations</li>
              <li className="hover:text-white transition cursor-pointer">Emission Insights</li>
              <li className="hover:text-white transition cursor-pointer">Resource Optimizer</li>
            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 mb-4 tracking-wider">
              COMPANY
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="hover:text-white transition cursor-pointer">About Medora</li>
              <li className="hover:text-white transition cursor-pointer">Our Vision</li>
              <li className="hover:text-white transition cursor-pointer">Careers</li>
              <li className="hover:text-white transition cursor-pointer">Blog</li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 mb-4 tracking-wider">
              SUPPORT
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="hover:text-white transition cursor-pointer">Help Center</li>
              <li className="hover:text-white transition cursor-pointer">Documentation</li>
              <li className="hover:text-white transition cursor-pointer">Contact Us</li>
              <li className="hover:text-white transition cursor-pointer">Report Issue</li>
            </ul>
          </div>

          {/* LEGAL */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 mb-4 tracking-wider">
              LEGAL
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="hover:text-white transition cursor-pointer">Privacy Policy</li>
              <li className="hover:text-white transition cursor-pointer">Terms of Service</li>
              <li className="hover:text-white transition cursor-pointer">Data Protection</li>
              <li className="hover:text-white transition cursor-pointer">Compliance</li>
            </ul>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="border-t border-gray-700 mt-12 pt-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Medora. All rights reserved.
        </div>

      </div>
    </footer>
  );
}