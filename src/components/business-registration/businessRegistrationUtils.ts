
export const businessCategories = [
  "Retail Store",
  "Wholesale",
  "Salon & Barbershop",
  "Spa & Beauty",
  "Car Wash",
  "Mini Mart",
  "Supermarket",
  "Hotel & Hospitality",
  "Restaurant & Cafe",
  "Kids & Toys Shop",
  "Gift Shop",
  "Electronics Store",
  "Clothing & Apparel",
  "Pharmacy & Healthcare",
  "Hardware Store",
  "Bookshop & Stationery",
  "Mobile Phone Shop",
  "Furniture Store",
  "Agricultural Supplies",
  "Butchery & Meat Shop",
  "Other"
];

export const africanCountries = [
  "Kenya",
  "Nigeria",
  "South Africa",
  "Egypt",
  "Ghana",
  "Ethiopia",
  "Tanzania",
  "Rwanda",
  "Uganda",
  "Côte d'Ivoire",
  "Angola",
  "Botswana",
  "Cameroon",
  "Democratic Republic of Congo",
  "Malawi",
  "Mali",
  "Morocco",
  "Mozambique",
  "Namibia",
  "Senegal",
  "Zambia",
  "Zimbabwe",
  "Other"
];

export interface BusinessFormData {
  businessName: string;
  businessCategory: string;
  country: string;
}

export const validateBusinessForm = (formData: BusinessFormData): { isValid: boolean; errorMessage?: string } => {
  if (!formData.businessName.trim()) {
    return { isValid: false, errorMessage: "Please enter a business name" };
  }
  if (!formData.businessCategory) {
    return { isValid: false, errorMessage: "Please select a business category" };
  }
  if (!formData.country) {
    return { isValid: false, errorMessage: "Please select your country" };
  }
  
  return { isValid: true };
};
