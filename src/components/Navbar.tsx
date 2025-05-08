
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-tellerpos-bg/95 backdrop-blur-sm shadow-md' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <a href="#" className="flex items-center">
                <span className="text-tellerpos font-bold text-2xl">Teller</span>
                <span className="text-white font-bold text-2xl">POS</span>
              </a>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <a href="#" className="nav-link font-medium">Home</a>
              <a href="#features" className="nav-link font-medium">Features</a>
              <a href="#pricing" className="nav-link font-medium">Pricing</a>
              <a href="#testimonials" className="nav-link font-medium">Testimonials</a>
              <a href="#about" className="nav-link font-medium">About Us</a>
              <a href="#contact" className="nav-link font-medium">Contact</a>
              <a href="#getstarted" className="btn-primary">Get Started</a>
            </div>
          </div>
          
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden bg-tellerpos-dark-accent">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 animate-fade-in">
            <a href="#" className="nav-link block px-3 py-2 rounded-md text-base font-medium">Home</a>
            <a href="#features" className="nav-link block px-3 py-2 rounded-md text-base font-medium">Features</a>
            <a href="#pricing" className="nav-link block px-3 py-2 rounded-md text-base font-medium">Pricing</a>
            <a href="#testimonials" className="nav-link block px-3 py-2 rounded-md text-base font-medium">Testimonials</a>
            <a href="#about" className="nav-link block px-3 py-2 rounded-md text-base font-medium">About Us</a>
            <a href="#contact" className="nav-link block px-3 py-2 rounded-md text-base font-medium">Contact</a>
            <a href="#getstarted" className="btn-primary block text-center mx-3 my-4">Get Started</a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
