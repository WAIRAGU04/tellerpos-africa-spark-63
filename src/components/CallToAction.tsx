
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '@/utils/authUtils';

const CallToAction = () => {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <section id="getstarted" className="py-24 px-4 bg-tellerpos-dark-accent">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Transform Your Business?</h2>
        <p className="text-lg text-gray-300 mb-10 max-w-3xl mx-auto">
          Join thousands of businesses across Africa that are growing faster with our comprehensive point of sale solution. Start your journey today.
        </p>
        <button 
          onClick={handleGetStarted}
          className="bg-white text-tellerpos font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-300"
        >
          {isAuthenticated() ? 'Go to Dashboard' : 'Get Started Now'}
        </button>
        <p className="mt-6 text-gray-400">No credit card required. Free plan available.</p>
      </div>
    </section>
  );
};

export default CallToAction;
