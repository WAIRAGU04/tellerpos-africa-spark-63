import { useState } from 'react';
import BusinessRegistrationDialog from './business-registration/BusinessRegistrationDialog';

const CallToAction = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDialogOpen(true);
  };
  
  return (
    <section id="getstarted" className="py-20 bg-gradient-to-r from-tellerpos/80 to-tellerpos">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Transform Your Retail Business Today
          </h2>
          
          <p className="text-xl text-white/80 mb-10">
            Join thousands of successful African retailers using TellerPOS to grow their businesses and increase profits
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 shadow-lg">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-white text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    className="w-full bg-white/20 border border-white/30 rounded-md py-3 px-4 text-white placeholder:text-white/60"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-white text-sm font-medium mb-2">Business Email</label>
                  <input
                    type="email"
                    id="email"
                    className="w-full bg-white/20 border border-white/30 rounded-md py-3 px-4 text-white placeholder:text-white/60"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-white text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full bg-white/20 border border-white/30 rounded-md py-3 px-4 text-white placeholder:text-white/60"
                    placeholder="+254 700 000000"
                  />
                </div>
                
                <div>
                  <label htmlFor="country" className="block text-white text-sm font-medium mb-2">Country</label>
                  <select
                    id="country"
                    className="w-full bg-white/20 border border-white/30 rounded-md py-3 px-4 text-white"
                  >
                    <option value="">Select your country</option>
                    <option value="ke">Kenya</option>
                    <option value="ng">Nigeria</option>
                    <option value="za">South Africa</option>
                    <option value="eg">Egypt</option>
                    <option value="gh">Ghana</option>
                    <option value="et">Ethiopia</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block text-white text-sm font-medium mb-2">
                  How can we help your business?
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full bg-white/20 border border-white/30 rounded-md py-3 px-4 text-white placeholder:text-white/60"
                  placeholder="Tell us about your business and needs..."
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full bg-white text-tellerpos-bg hover:bg-white/90 font-semibold py-3 rounded-md transition-colors duration-300"
              >
                Request a Free Demo
              </button>
            </form>
            
            <div className="mt-6 flex items-center justify-center gap-6 text-white/80">
              <div className="flex items-center">
                <div className="w-5 h-5 rounded-full border border-white/80 flex items-center justify-center mr-2">
                  ✓
                </div>
                <span className="text-sm">No credit card required</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-5 h-5 rounded-full border border-white/80 flex items-center justify-center mr-2">
                  ✓
                </div>
                <span className="text-sm">Free 14-day trial</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-5 h-5 rounded-full border border-white/80 flex items-center justify-center mr-2">
                  ✓
                </div>
                <span className="text-sm">Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <BusinessRegistrationDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </section>
  );
};

export default CallToAction;
