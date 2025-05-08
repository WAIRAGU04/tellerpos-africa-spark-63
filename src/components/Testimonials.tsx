
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Ochieng",
      position: "Owner",
      business: "Savanna Grocers",
      country: "Kenya",
      countryCode: "ke",
      quote: "TellerPOS has transformed how I manage my grocery store. The M-Pesa integration works flawlessly, and I've reduced checkout time by 40%. My customers love how fast we can serve them now!",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120&h=120"
    },
    {
      name: "Emmanuel Okonkwo",
      position: "General Manager",
      business: "Lagos Electronics",
      country: "Nigeria",
      countryCode: "ng",
      quote: "Since implementing TellerPOS, our inventory accuracy has improved from 76% to 98%. The system works perfectly during power outages, which is essential for our business in Lagos.",
      image: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&q=80&w=120&h=120"
    },
    {
      name: "Thabo Molefe",
      position: "Director",
      business: "Cape Town Fashion Boutique",
      country: "South Africa",
      countryCode: "za",
      quote: "The customer management features have helped us increase repeat purchases by 35%. Our staff picked up the system quickly, and the regional support team is always available when we need them.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120"
    },
    {
      name: "Fatima Al-Masri",
      position: "CEO",
      business: "Cairo Market Hub",
      country: "Egypt",
      countryCode: "eg",
      quote: "As we expanded to multiple locations, TellerPOS made it easy to manage all our stores from one dashboard. The Arabic language support was a deciding factor for our team.",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=120&h=120"
    },
    {
      name: "Kwame Darko",
      position: "Owner",
      business: "Accra Home Supplies",
      country: "Ghana",
      countryCode: "gh",
      quote: "The sales analytics have given me insights I never had before. I've been able to optimize my product mix and increase profits by 25% in just six months using TellerPOS.",
      image: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=120&h=120"
    },
    {
      name: "Tigist Bekele",
      position: "Operations Manager",
      business: "Addis Pharmacy Chain",
      country: "Ethiopia",
      countryCode: "et",
      quote: "Managing expiration dates for pharmaceuticals used to be a nightmare. TellerPOS has automated this process and saved us from thousands of dollars in expired inventory.",
      image: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&q=80&w=120&h=120"
    }
  ];
  
  const [current, setCurrent] = useState(0);
  
  const prev = () => {
    setCurrent(current === 0 ? testimonials.length - 1 : current - 1);
  };
  
  const next = () => {
    setCurrent(current === testimonials.length - 1 ? 0 : current + 1);
  };

  return (
    <section id="testimonials" className="py-20 bg-tellerpos-bg">
      <div className="container mx-auto px-4">
        <h2 className="section-title text-center">Success Stories Across Africa</h2>
        <p className="section-subtitle text-center">
          See how businesses like yours are achieving remarkable results with TellerPOS
        </p>
        
        <div className="relative mt-12 max-w-4xl mx-auto">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="min-w-full">
                  <div className="bg-tellerpos-dark-accent rounded-xl p-8 md:p-10">
                    <div className="flex flex-col md:flex-row items-center md:items-start">
                      <div className="mb-6 md:mb-0 md:mr-8">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                            <img 
                              src={testimonial.image} 
                              alt={testimonial.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <img 
                            src={`https://flagcdn.com/32x24/${testimonial.countryCode}.png`}
                            alt={testimonial.country}
                            className="absolute bottom-3 -right-2 w-8 h-6 rounded shadow-sm"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <blockquote className="italic text-lg text-gray-300 mb-6">
                          "{testimonial.quote}"
                        </blockquote>
                        
                        <div>
                          <p className="font-semibold text-white">{testimonial.name}</p>
                          <p className="text-tellerpos">{testimonial.position}, {testimonial.business}</p>
                          <p className="text-gray-400">{testimonial.country}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 flex justify-center gap-4">
            <button 
              onClick={prev}
              className="bg-tellerpos-dark-accent hover:bg-tellerpos-dark hover:text-white p-2 rounded-full"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    current === index ? 'bg-tellerpos w-4' : 'bg-gray-600'
                  }`}
                ></button>
              ))}
            </div>
            <button 
              onClick={next}
              className="bg-tellerpos-dark-accent hover:bg-tellerpos-dark hover:text-white p-2 rounded-full"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
