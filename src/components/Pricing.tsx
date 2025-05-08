
import { Check } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: "Basic",
      price: "KSh 1,000",
      period: "/month",
      description: "Perfect for small shops and startups",
      features: [
        "Single store location",
        "2 user accounts",
        "500 product limit",
        "Basic reporting",
        "Mobile money integration",
        "Email support",
        "Cloud backup (weekly)"
      ],
      highlighted: false
    },
    {
      name: "Standard",
      price: "KSh 2,500",
      period: "/month",
      description: "Ideal for growing businesses",
      features: [
        "Up to 2 store locations",
        "5 user accounts",
        "2,000 product limit",
        "Advanced reporting",
        "Mobile money integration",
        "Customer database",
        "Inventory management",
        "Email and chat support",
        "Cloud backup (daily)"
      ],
      highlighted: true
    },
    {
      name: "Premium",
      price: "KSh 4,500",
      period: "/month",
      description: "For established retail businesses",
      features: [
        "Up to 5 store locations",
        "10 user accounts",
        "Unlimited products",
        "Advanced reporting + analytics",
        "Mobile money integration",
        "Customer database and loyalty program",
        "Full inventory management",
        "24/7 priority support",
        "Cloud backup (real-time)",
        "Hardware support"
      ],
      highlighted: false
    }
  ];

  const implementationFees = [
    {
      type: "Remote Setup",
      price: "KSh 5,000",
      description: "Perfect for tech-savvy clients who need minimal assistance",
      includes: [
        "System configuration",
        "Basic product setup",
        "Remote training (2 hours)",
        "Email support"
      ]
    },
    {
      type: "Standard Implementation",
      price: "KSh 15,000",
      description: "Our most popular option for smooth onboarding",
      includes: [
        "System configuration",
        "Full product catalog setup",
        "Staff training (up to 5 hours)",
        "30 days of priority support"
      ]
    },
    {
      type: "Premium Onboarding",
      price: "KSh 30,000",
      description: "White-glove service for complex retail operations",
      includes: [
        "Custom system configuration",
        "Full product catalog setup",
        "On-site staff training",
        "Business process optimization",
        "90 days of VIP support"
      ]
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-tellerpos-dark-accent">
      <div className="container mx-auto px-4">
        <h2 className="section-title text-center">Affordable Pricing for Every Business Size</h2>
        <p className="section-subtitle text-center">
          Choose the plan that works best for your business needs and budget. All plans include core POS features.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`pricing-card ${plan.highlighted ? 'border-2 border-tellerpos relative' : ''}`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-tellerpos text-white text-xs font-semibold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-tellerpos mr-2 shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full py-3 rounded-md font-semibold transition-colors ${
                  plan.highlighted 
                    ? 'bg-tellerpos text-white hover:bg-tellerpos-dark' 
                    : 'bg-tellerpos-gray-dark text-white hover:bg-tellerpos-gray-dark/80'
                }`}>
                  Choose Plan
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-24">
          <h3 className="text-2xl font-bold text-white text-center mb-4">Implementation Fee Structure</h3>
          <p className="text-center text-gray-300 mb-12 max-w-3xl mx-auto">
            One-time setup fees to get your business running smoothly with TellerPOS
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {implementationFees.map((fee, index) => (
              <div key={index} className="bg-tellerpos-bg rounded-lg p-8">
                <h4 className="text-xl font-semibold text-white mb-2">{fee.type}</h4>
                <div className="mb-3">
                  <span className="text-3xl font-bold text-tellerpos">{fee.price}</span>
                  <span className="text-gray-400"> one-time</span>
                </div>
                <p className="text-gray-400 mb-6">{fee.description}</p>
                
                <ul className="space-y-3">
                  {fee.includes.map((item, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="h-5 w-5 text-tellerpos mr-2" />
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-400">
              Need custom pricing? <a href="#contact" className="text-tellerpos underline">Contact us</a> for enterprise solutions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
