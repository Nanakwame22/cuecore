
import { useState } from 'react';

export default function CTASection() {
  const [email, setEmail] = useState('');

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24 bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Heading */}
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to Transform
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {' '}
              Your Business?
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of companies already using TechFlow to accelerate their
            development and scale their operations.
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="flex items-center justify-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <i className="ri-check-line text-green-400 text-xl"></i>
              <span className="text-white font-medium">14-day free trial</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <i className="ri-check-line text-green-400 text-xl"></i>
              <span className="text-white font-medium">No credit card required</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <i className="ri-check-line text-green-400 text-xl"></i>
              <span className="text-white font-medium">Cancel anytime</span>
            </div>
          </div>

          {/* Email Signup */}
          <div className="max-w-lg mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your work email"
                className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 text-lg"
              />
              <button
                onClick={() => {
                  // Simple validation – avoid submitting empty or invalid email strings
                  if (!email) {
                    alert('Please enter a valid email address.');
                    return;
                  }
                  // Placeholder for real signup logic
                  console.log('Signup submitted for', email);
                }}
                className="group relative bg-transparent border border-gray-600 text-white px-8 py-4 rounded-xl text-base font-medium transition-all duration-300 hover:border-purple-400 hover:bg-purple-500/10 whitespace-nowrap cursor-pointer"
              >
                <span className="relative z-10">Start Free Trial</span>
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-3">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>

          {/* Alternative CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => scrollToSection('contact')}
              className="group relative bg-transparent border border-gray-600 text-white px-8 py-4 rounded-xl text-base font-medium transition-all duration-300 hover:border-purple-400 hover:bg-purple-500/10 whitespace-nowrap cursor-pointer"
            >
              <span className="relative z-10">Schedule Demo</span>
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="group relative bg-transparent border border-gray-600 text-white px-8 py-4 rounded-xl text-base font-medium transition-all duration-300 hover:border-purple-400 hover:bg-purple-500/10 whitespace-nowrap cursor-pointer"
            >
              <span className="relative z-10">Contact Sales</span>
            </button>
          </div>

          {/* Social Proof */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-gray-400 mb-4">Trusted by 50,000+ developers worldwide</p>
            <div className="flex justify-center items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <span className="text-gray-300 ml-3">+50K developers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
