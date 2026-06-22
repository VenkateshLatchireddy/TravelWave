"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateBudgetTotals = exports.formatCurrencyINR = exports.validateIndianDestination = exports.sanitizeInput = void 0;
const sanitizeInput = (input) => {
    return input
        .trim()
        .replace(/[<>{}]/g, '')
        .slice(0, 1000);
};
exports.sanitizeInput = sanitizeInput;
const validateIndianDestination = (destination) => {
    const indianDestinations = [
        'Delhi', 'New Delhi', 'Agra', 'Jaipur', 'Varanasi', 'Mumbai',
        'Kolkata', 'Chennai', 'Bangalore', 'Hyderabad', 'Goa', 'Kerala',
        'Rajasthan', 'Uttar Pradesh', 'Himachal Pradesh', 'Uttarakhand',
        'Sikkim', 'Darjeeling', 'Shimla', 'Manali', 'Rishikesh', 'Pushkar',
        'Jodhpur', 'Udaipur', 'Amritsar', 'Chandigarh', 'Lucknow'
    ];
    const searchTerm = destination.toLowerCase();
    return indianDestinations.some(d => searchTerm.includes(d.toLowerCase()) ||
        d.toLowerCase().includes(searchTerm));
};
exports.validateIndianDestination = validateIndianDestination;
const formatCurrencyINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};
exports.formatCurrencyINR = formatCurrencyINR;
const calculateBudgetTotals = (budget) => {
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
exports.calculateBudgetTotals = calculateBudgetTotals;
//# sourceMappingURL=validation.js.map