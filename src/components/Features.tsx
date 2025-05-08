
import { Smartphone, Database, WifiOff, Users, ChartBar, User } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Smartphone size={36} className="text-tellerpos mb-4" />,
      title: "M-Pesa Integration",
      description: "Seamlessly accept mobile money payments across Africa with our integrated M-Pesa and other mobile payment solutions."
    },
    {
      icon: <Database size={36} className="text-tellerpos mb-4" />,
      title: "Inventory Management",
      description: "Track stock levels in real-time, set low stock alerts, and generate purchase orders automatically."
    },
    {
      icon: <WifiOff size={36} className="text-tellerpos mb-4" />,
      title: "Offline Functionality",
      description: "Continue selling even during internet outages with our robust offline mode and automatic synchronization."
    },
    {
      icon: <Users size={36} className="text-tellerpos mb-4" />,
      title: "Multi-User Support",
      description: "Set different permission levels for staff members and track all transactions by cashier."
    },
    {
      icon: <ChartBar size={36} className="text-tellerpos mb-4" />,
      title: "Sales Analytics",
      description: "Make data-driven decisions with powerful reporting tools and visual dashboards customized for your business."
    },
    {
      icon: <User size={36} className="text-tellerpos mb-4" />,
      title: "Customer Management",
      description: "Build customer loyalty with integrated profiles, purchase history, and targeted marketing campaigns."
    }
  ];

  return (
    <section id="features" className="py-20 bg-tellerpos-bg">
      <div className="container mx-auto px-4">
        <h2 className="section-title text-center">Powerful Features for African Retailers</h2>
        <p className="section-subtitle text-center">
          Our POS solution addresses the unique challenges faced by retailers across Africa with these powerful features.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card animate-fade-in"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              {feature.icon}
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
