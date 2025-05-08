
const RegionalMap = () => {
  const regions = [
    {
      country: "Kenya",
      currency: "KES",
      paymentMethods: ["M-Pesa", "Airtel Money", "Bank Transfer"],
      languages: ["English", "Swahili"]
    },
    {
      country: "Nigeria",
      currency: "NGN",
      paymentMethods: ["Bank Transfer", "Paystack", "Flutterwave"],
      languages: ["English"]
    },
    {
      country: "South Africa",
      currency: "ZAR",
      paymentMethods: ["EFT", "SnapScan", "Zapper"],
      languages: ["English", "Afrikaans", "Zulu"]
    },
    {
      country: "Egypt",
      currency: "EGP",
      paymentMethods: ["Fawry", "Bank Card", "Cash"],
      languages: ["Arabic", "English"]
    },
    {
      country: "Ghana",
      currency: "GHS",
      paymentMethods: ["Mobile Money", "ExpressPay"],
      languages: ["English"]
    },
    {
      country: "Ethiopia",
      currency: "ETB",
      paymentMethods: ["CBE Birr", "HelloCash", "Bank Transfer"],
      languages: ["Amharic", "English"]
    },
    {
      country: "Tanzania",
      currency: "TZS",
      paymentMethods: ["Tigo Pesa", "M-Pesa", "Airtel Money"],
      languages: ["Swahili", "English"]
    },
    {
      country: "Rwanda",
      currency: "RWF",
      paymentMethods: ["MTN Mobile Money", "Airtel Money", "Bank Transfer"],
      languages: ["Kinyarwanda", "English", "French"]
    },
    {
      country: "Uganda",
      currency: "UGX",
      paymentMethods: ["MTN Mobile Money", "Airtel Money", "Pesapal"],
      languages: ["English", "Swahili"]
    },
    {
      country: "Côte d'Ivoire",
      currency: "XOF",
      paymentMethods: ["Orange Money", "MTN Mobile Money", "Moov Money"],
      languages: ["French"]
    }
  ];

  return (
    <section className="py-20 bg-tellerpos-dark-accent">
      <div className="container mx-auto px-4">
        <h2 className="section-title text-center">Regional Adaptation</h2>
        <p className="section-subtitle text-center">
          TellerPOS is designed to work seamlessly across different African regions with local payment methods and compliance features
        </p>
        
        <div className="mt-12 flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/2">
            <div className="bg-tellerpos-bg rounded-lg p-6 h-full">
              <h3 className="text-xl font-semibold text-white mb-6">Supported Regions</h3>
              <div className="relative">
                <svg viewBox="0 0 1000 1000" className="w-full h-auto">
                  {/* Simplified SVG Map of Africa with highlighted regions */}
                  <path d="M500,200 Q650,250 700,350 Q750,450 780,550 Q810,650 800,750 Q780,850 700,900 Q620,950 500,980 Q380,950 300,900 Q220,850 200,750 Q190,650 220,550 Q250,450 300,350 Q350,250 500,200" fill="#333" stroke="#555" strokeWidth="2" />
                  
                  {/* Kenya */}
                  <circle cx="600" cy="550" r="20" fill="#00cc66" className="pulse-circle" />
                  <text x="625" y="550" fill="white" fontSize="14">Kenya</text>
                  
                  {/* Nigeria */}
                  <circle cx="380" cy="520" r="20" fill="#00cc66" className="pulse-circle" />
                  <text x="330" y="520" fill="white" fontSize="14">Nigeria</text>
                  
                  {/* South Africa */}
                  <circle cx="550" cy="850" r="20" fill="#00cc66" className="pulse-circle" />
                  <text x="575" y="850" fill="white" fontSize="14">South Africa</text>
                  
                  {/* Egypt */}
                  <circle cx="550" cy="350" r="20" fill="#00cc66" className="pulse-circle" />
                  <text x="575" y="350" fill="white" fontSize="14">Egypt</text>
                  
                  {/* Ghana */}
                  <circle cx="350" cy="550" r="20" fill="#00cc66" className="pulse-circle" />
                  <text x="300" y="550" fill="white" fontSize="14">Ghana</text>
                  
                  {/* Ethiopia */}
                  <circle cx="650" cy="450" r="20" fill="#00cc66" className="pulse-circle" />
                  <text x="675" y="450" fill="white" fontSize="14">Ethiopia</text>
                  
                  {/* Tanzania */}
                  <circle cx="620" cy="620" r="20" fill="#00cc66" className="pulse-circle" />
                  <text x="645" y="620" fill="white" fontSize="14">Tanzania</text>
                  
                  {/* Rwanda */}
                  <circle cx="580" cy="600" r="20" fill="#00cc66" className="pulse-circle" />
                  <text x="605" y="600" fill="white" fontSize="14">Rwanda</text>
                  
                  {/* Uganda */}
                  <circle cx="580" cy="520" r="20" fill="#00cc66" className="pulse-circle" />
                  <text x="605" y="520" fill="white" fontSize="14">Uganda</text>
                  
                  {/* Côte d'Ivoire */}
                  <circle cx="300" cy="580" r="20" fill="#00cc66" className="pulse-circle" />
                  <text x="250" y="580" fill="white" fontSize="14">Côte d'Ivoire</text>
                </svg>
                
                <style>
                  {`
                    .pulse-circle {
                      animation: pulse 2s infinite;
                    }
                    @keyframes pulse {
                      0% { opacity: 1; r: 20; }
                      70% { opacity: 0.7; r: 25; }
                      100% { opacity: 1; r: 20; }
                    }
                  `}
                </style>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {regions.map((region, index) => (
                <div key={index} className="bg-tellerpos-bg rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <img 
                      src={`https://flagcdn.com/32x24/${region.country.slice(0, 2).toLowerCase()}.png`}
                      alt={region.country}
                      className="w-8 h-6 mr-3"
                    />
                    <h3 className="text-xl font-semibold text-white">{region.country}</h3>
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-sm text-gray-400">Currency</p>
                    <p className="text-white">{region.currency}</p>
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-sm text-gray-400">Payment Methods</p>
                    <p className="text-white">{region.paymentMethods.join(", ")}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Languages</p>
                    <p className="text-white">{region.languages.join(", ")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegionalMap;
