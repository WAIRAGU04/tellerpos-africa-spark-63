
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Pricing from '@/components/Pricing';
import Testimonials from '@/components/Testimonials';
import RegionalMap from '@/components/RegionalMap';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-tellerpos-bg">
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <Testimonials />
      <RegionalMap />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Index;
