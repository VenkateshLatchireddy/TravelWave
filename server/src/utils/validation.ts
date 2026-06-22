export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>{}]/g, '') // Remove potential script injection
    .slice(0, 1000); // Limit length
};

export const validateIndianDestination = (destination: string): boolean => {
  const indianDestinations = [
    'Delhi', 'New Delhi', 'Agra', 'Jaipur', 'Varanasi', 'Mumbai', 
    'Kolkata', 'Chennai', 'Bangalore', 'Hyderabad', 'Goa', 'Kerala',
    'Rajasthan', 'Uttar Pradesh', 'Himachal Pradesh', 'Uttarakhand',
    'Sikkim', 'Darjeeling', 'Shimla', 'Manali', 'Rishikesh', 'Pushkar',
    'Jodhpur', 'Udaipur', 'Amritsar', 'Chandigarh', 'Lucknow'
  ];
  
  const searchTerm = destination.toLowerCase();
  return indianDestinations.some(d => 
    searchTerm.includes(d.toLowerCase()) || 
    d.toLowerCase().includes(searchTerm)
  );
};

export const formatCurrencyINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calculateBudgetTotals = (budget: any): any => {
  const total = (budget.transport || 0) + 
                (budget.accommodation || 0) + 
                (budget.food || 0) + 
                (budget.activities || 0) + 
                (budget.miscellaneous || 0);
  
  return {
    ...budget,
    total,
    currency: 'INR',
  };
};