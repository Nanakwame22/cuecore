
export function FooterSection() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative py-20 bg-black/50 backdrop-blur-sm border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-12">
          {/* Logo Section */}
          <div className="relative">
            <h2 className="text-8xl md:text-9xl font-extralight text-white tracking-[0.3em] mb-8">XTRACT</h2>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-violet-400 to-transparent"></div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <button 
              onClick={() => scrollToSection('showcase')}
              className="text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer"
            >
              Solutions
            </button>
            <button 
              onClick={() => scrollToSection('products')}
              className="text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer"
            >
              Products
            </button>
            <button 
              onClick={() => scrollToSection('about')}
              className="text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer"
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection('projects')}
              className="text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer"
            >
              Projects
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer"
            >
              Contact
            </button>
          </div>

          {/* Social Media Icons */}
          <div className="flex items-center justify-center space-x-8">
            <a href="#" className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer">
              <i className="ri-linkedin-fill text-2xl"></i>
            </a>
            <a href="#" className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer">
              <i className="ri-dribbble-fill text-2xl"></i>
            </a>
            <a href="#" className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer">
              <i className="ri-behance-fill text-2xl"></i>
            </a>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
        </div>
      </div>
    </footer>
  );
}
