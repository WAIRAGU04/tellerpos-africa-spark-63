
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BusinessRegistrationDialog from "./business-registration/BusinessRegistrationDialog";

const Hero = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  return (
    <section className="min-h-screen flex items-center pt-16 bg-gradient-to-b from-tellerpos-bg to-tellerpos-dark-accent">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2 animate-fade-in-right">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Transform Your 
              <span className="text-tellerpos"> African Retail </span>
              Business
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-xl">
              Simplify operations, increase sales, and grow your retail business with our powerful point-of-sale solution designed specifically for African markets.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="#" 
                className="btn-primary text-center"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/signup");
                }}
              >
                Start Free Trial
              </a>
              <a href="#demo" className="btn-secondary text-center">
                Book Demo
              </a>
            </div>
          </div>
          
          <div className="md:w-1/2 mt-12 md:mt-0 animate-fade-in-left">
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-tellerpos to-tellerpos-light rounded-2xl blur opacity-30"></div>
              <img 
                src="https://images.unsplash.com/photo-1617919162188-aebe34840be7?auto=format&fit=crop&q=80&w=800&h=600" 
                alt="TellerPOS in action in an African retail store" 
                className="relative z-10 rounded-2xl shadow-2xl w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
