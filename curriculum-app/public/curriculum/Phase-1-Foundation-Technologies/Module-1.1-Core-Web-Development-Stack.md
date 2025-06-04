# Module 1.1: Core Web Development Stack

## Overview
This module introduces you to modern JavaScript and React.js - the foundation technologies for building interactive property analysis applications. You'll learn ES6+ features, React fundamentals, and modern development tooling that powers sophisticated web applications.

---

## JavaScript/ES6+ Fundamentals

### Modern JavaScript Features

Modern JavaScript (ES6+) provides powerful features that make code more readable, maintainable, and efficient. Let's explore the features most relevant to property development applications.

#### Arrow Functions

Arrow functions provide a concise syntax and solve the `this` binding issue:

```javascript
// Traditional function
function calculatePropertyValue(price, sqm) {
    return price * sqm;
}

// Arrow function (concise)
const calculatePropertyValue = (price, sqm) => price * sqm;

// Arrow function with multiple statements
const analyseProperty = (property) => {
    const pricePerSqm = property.price / property.area;
    const marketValue = pricePerSqm * 1.1; // 10% above market
    return {
        pricePerSqm,
        marketValue,
        isAboveMarket: marketValue > property.price
    };
};

// Arrow functions in array methods (very common in React)
const properties = [
    { id: 1, price: 800000, area: 120, suburb: 'Bondi' },
    { id: 2, price: 1200000, area: 180, suburb: 'Surry Hills' },
    { id: 3, price: 950000, area: 140, suburb: 'Newtown' }
];

// Filter properties under $1M
const affordableProperties = properties.filter(property => property.price < 1000000);

// Calculate price per square metre for each property
const propertiesWithPricePerSqm = properties.map(property => ({
    ...property,
    pricePerSqm: Math.round(property.price / property.area)
}));

// Find most expensive property
const mostExpensive = properties.reduce((max, property) => 
    property.price > max.price ? property : max
);

console.log('Affordable Properties:', affordableProperties);
console.log('Properties with price/sqm:', propertiesWithPricePerSqm);
console.log('Most expensive:', mostExpensive);
```

#### Destructuring Assignment

Destructuring makes extracting data from objects and arrays much cleaner:

```javascript
// Object destructuring - perfect for property data
const property = {
    id: 1,
    address: '123 Beach Road, Bondi',
    price: 1200000,
    bedrooms: 3,
    bathrooms: 2,
    features: ['pool', 'garage', 'garden'],
    location: {
        suburb: 'Bondi',
        postcode: 2026,
        state: 'NSW'
    }
};

// Extract specific properties
const { price, bedrooms, bathrooms } = property;
console.log(`$${price.toLocaleString()} | ${bedrooms}BR ${bathrooms}BA`);

// Nested destructuring
const { location: { suburb, postcode } } = property;
console.log(`${suburb} ${postcode}`);

// Destructuring with default values
const { carSpaces = 0, pool = false } = property;

// Destructuring function parameters (very common in React)
const PropertyCard = ({ price, address, bedrooms, bathrooms }) => {
    return `
        <div class="property-card">
            <h3>${address}</h3>
            <p>$${price.toLocaleString()}</p>
            <p>${bedrooms}BR ${bathrooms}BA</p>
        </div>
    `;
};

// Array destructuring
const [firstProperty, secondProperty, ...otherProperties] = properties;
console.log('First property:', firstProperty);
console.log('Remaining properties:', otherProperties);

// Destructuring in array methods
properties.forEach(({ id, price, suburb }) => {
    console.log(`Property ${id} in ${suburb}: $${price.toLocaleString()}`);
});
```

#### Template Literals

Template literals make string interpolation much more readable:

```javascript
// Property description builder
const buildPropertyDescription = (property) => {
    const { address, price, bedrooms, bathrooms, area, features } = property;
    
    return `
        🏠 ${address}
        💰 $${price.toLocaleString()}
        🛏️  ${bedrooms} bedrooms | 🚿 ${bathrooms} bathrooms
        📐 ${area}m² (${Math.round(price / area)}/m²)
        ✨ Features: ${features.join(', ')}
        
        ${price > 1000000 ? '🔥 Premium Property' : '💰 Great Value'}
    `;
};

// Multi-line HTML templates (useful before learning React)
const createPropertyHTML = (property) => `
    <article class="property-listing">
        <img src="images/property-${property.id}.jpg" 
             alt="Property at ${property.address}" />
        <div class="property-content">
            <h2>${property.address}</h2>
            <p class="price">$${property.price.toLocaleString()}</p>
            <div class="property-details">
                <span>${property.bedrooms} bed</span>
                <span>${property.bathrooms} bath</span>
                <span>${property.area}m²</span>
            </div>
        </div>
    </article>
`;

// Tagged template literals for advanced use cases
const currency = (strings, ...values) => {
    return strings.reduce((result, string, i) => {
        const value = values[i];
        const formattedValue = typeof value === 'number' 
            ? `$${value.toLocaleString()}` 
            : value;
        return result + string + (formattedValue || '');
    }, '');
};

const propertyPrice = 1200000;
const message = currency`The property is priced at ${propertyPrice}`;
// Result: "The property is priced at $1,200,000"
```

#### Modules (Import/Export)

Modules help organise code into reusable pieces:

```javascript
// File: utils/propertyCalculations.js
export const calculatePricePerSqm = (price, area) => {
    return Math.round(price / area);
};

export const calculateStampDuty = (price, state = 'NSW') => {
    if (state === 'NSW') {
        if (price <= 14000) return 1.25 * price / 100;
        if (price <= 32000) return 175 + 1.5 * (price - 14000) / 100;
        if (price <= 85000) return 445 + 1.75 * (price - 32000) / 100;
        // ... more brackets
        return price * 0.055; // Simplified for example
    }
    // Add other states...
};

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD'
    }).format(amount);
};

export default {
    calculatePricePerSqm,
    calculateStampDuty,
    formatCurrency
};

// File: components/PropertyAnalyzer.js
import { 
    calculatePricePerSqm, 
    calculateStampDuty, 
    formatCurrency 
} from '../utils/propertyCalculations.js';

// Or import default export
import PropertyUtils from '../utils/propertyCalculations.js';

class PropertyAnalyzer {
    constructor(property) {
        this.property = property;
        this.analysis = this.analyze();
    }
    
    analyze() {
        const { price, area } = this.property;
        
        return {
            pricePerSqm: calculatePricePerSqm(price, area),
            stampDuty: calculateStampDuty(price),
            totalCost: price + calculateStampDuty(price),
            formattedPrice: formatCurrency(price)
        };
    }
    
    getReport() {
        const { pricePerSqm, stampDuty, totalCost } = this.analysis;
        
        return `
            Property Analysis Report
            ========================
            Price per m²: ${formatCurrency(pricePerSqm)}
            Stamp Duty: ${formatCurrency(stampDuty)}
            Total Cost: ${formatCurrency(totalCost)}
        `;
    }
}

export default PropertyAnalyzer;
```

### Asynchronous JavaScript

Modern web applications heavily rely on asynchronous operations for API calls and data fetching:

#### Promises and Async/Await

```javascript
// File: services/propertyService.js

// Using fetch API to get property data
const fetchProperties = async (suburb) => {
    try {
        const response = await fetch(`/api/properties?suburb=${suburb}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const properties = await response.json();
        return properties;
    } catch (error) {
        console.error('Error fetching properties:', error);
        throw error; // Re-throw to handle in calling code
    }
};

// Multiple concurrent requests
const fetchPropertyDetails = async (propertyId) => {
    try {
        const [property, images, inspections] = await Promise.all([
            fetch(`/api/properties/${propertyId}`).then(r => r.json()),
            fetch(`/api/properties/${propertyId}/images`).then(r => r.json()),
            fetch(`/api/properties/${propertyId}/inspections`).then(r => r.json())
        ]);
        
        return { property, images, inspections };
    } catch (error) {
        console.error('Error fetching property details:', error);
        throw error;
    }
};

// Property search with debouncing (wait for user to stop typing)
class PropertySearch {
    constructor() {
        this.searchTimeout = null;
        this.cache = new Map();
    }
    
    // Debounced search function
    async search(query, delay = 300) {
        return new Promise((resolve, reject) => {
            // Clear previous timeout
            clearTimeout(this.searchTimeout);
            
            this.searchTimeout = setTimeout(async () => {
                try {
                    // Check cache first
                    if (this.cache.has(query)) {
                        resolve(this.cache.get(query));
                        return;
                    }
                    
                    const results = await this.performSearch(query);
                    this.cache.set(query, results);
                    resolve(results);
                } catch (error) {
                    reject(error);
                }
            }, delay);
        });
    }
    
    async performSearch(query) {
        const response = await fetch('/api/properties/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query })
        });
        
        return response.json();
    }
}

// Usage example
const propertySearch = new PropertySearch();

// In an event handler (like input change)
const handleSearchInput = async (event) => {
    const query = event.target.value;
    
    if (query.length < 2) return;
    
    try {
        const results = await propertySearch.search(query);
        displaySearchResults(results);
    } catch (error) {
        showErrorMessage('Search failed. Please try again.');
    }
};
```

#### Real-world Property API Integration

```javascript
// File: services/realEstateAPI.js

class RealEstateAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.realestate.com.au/v1';
        this.rateLimitDelay = 1000; // 1 second between requests
        this.lastRequestTime = 0;
    }
    
    // Rate limiting wrapper
    async makeRequest(endpoint, options = {}) {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (timeSinceLastRequest < this.rateLimitDelay) {
            await this.delay(this.rateLimitDelay - timeSinceLastRequest);
        }
        
        this.lastRequestTime = Date.now();
        
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        return response.json();
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Get properties by suburb
    async getPropertiesBySuburb(suburb, filters = {}) {
        const queryParams = new URLSearchParams({
            suburb: suburb,
            ...filters
        });
        
        return this.makeRequest(`/properties?${queryParams}`);
    }
    
    // Get property details
    async getPropertyById(id) {
        return this.makeRequest(`/properties/${id}`);
    }
    
    // Get market data
    async getMarketData(suburb) {
        return this.makeRequest(`/market/suburb/${suburb}`);
    }
    
    // Batch property requests
    async getMultipleProperties(propertyIds) {
        const batchSize = 10; // API might have batch limits
        const batches = [];
        
        for (let i = 0; i < propertyIds.length; i += batchSize) {
            const batch = propertyIds.slice(i, i + batchSize);
            batches.push(batch);
        }
        
        const results = [];
        
        for (const batch of batches) {
            const batchPromises = batch.map(id => this.getPropertyById(id));
            const batchResults = await Promise.allSettled(batchPromises);
            
            results.push(...batchResults.map((result, index) => ({
                id: batch[index],
                success: result.status === 'fulfilled',
                data: result.status === 'fulfilled' ? result.value : null,
                error: result.status === 'rejected' ? result.reason : null
            })));
        }
        
        return results;
    }
}

// Usage
const api = new RealEstateAPI('your-api-key');

// Example: Property search with error handling
const searchProperties = async (searchCriteria) => {
    const loadingElement = document.getElementById('loading');
    const resultsElement = document.getElementById('results');
    const errorElement = document.getElementById('error');
    
    try {
        loadingElement.style.display = 'block';
        errorElement.style.display = 'none';
        
        const properties = await api.getPropertiesBySuburb(
            searchCriteria.suburb,
            {
                minPrice: searchCriteria.minPrice,
                maxPrice: searchCriteria.maxPrice,
                propertyType: searchCriteria.type
            }
        );
        
        displayProperties(properties);
        
    } catch (error) {
        console.error('Property search failed:', error);
        errorElement.textContent = 'Failed to load properties. Please try again.';
        errorElement.style.display = 'block';
    } finally {
        loadingElement.style.display = 'none';
    }
};
```

---

## React.js Ecosystem

### React Fundamentals

React revolutionises how we build user interfaces by introducing a component-based architecture. Let's start with the basics:

#### Your First React Component

```jsx
// File: components/PropertyCard.jsx
import React from 'react';

// Functional component (modern React approach)
const PropertyCard = ({ property }) => {
    const { id, address, price, bedrooms, bathrooms, area, image } = property;
    
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD',
            minimumFractionDigits: 0
        }).format(price);
    };
    
    const handleCardClick = () => {
        console.log(`Property ${id} clicked`);
        // Navigate to property details
    };
    
    return (
        <div className="property-card" onClick={handleCardClick}>
            <img 
                src={image || '/images/placeholder-property.jpg'} 
                alt={`Property at ${address}`}
                className="property-image"
            />
            
            <div className="property-content">
                <h3 className="property-address">{address}</h3>
                <p className="property-price">{formatPrice(price)}</p>
                
                <div className="property-details">
                    <span>{bedrooms} bed</span>
                    <span>{bathrooms} bath</span>
                    <span>{area}m²</span>
                </div>
                
                <p className="price-per-sqm">
                    {formatPrice(Math.round(price / area))}/m²
                </p>
            </div>
        </div>
    );
};

export default PropertyCard;
```

#### React Hooks - useState

`useState` manages component state:

```jsx
// File: components/PropertySearch.jsx
import React, { useState } from 'react';

const PropertySearch = ({ onSearch }) => {
    // State for form inputs
    const [searchCriteria, setSearchCriteria] = useState({
        suburb: '',
        minPrice: '',
        maxPrice: '',
        propertyType: 'any',
        bedrooms: 'any'
    });
    
    // State for UI
    const [isSearching, setIsSearching] = useState(false);
    const [errors, setErrors] = useState({});
    
    // Handle input changes
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        
        setSearchCriteria(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };
    
    // Validate form
    const validateForm = () => {
        const newErrors = {};
        
        if (!searchCriteria.suburb.trim()) {
            newErrors.suburb = 'Suburb is required';
        }
        
        if (searchCriteria.minPrice && searchCriteria.maxPrice) {
            if (parseInt(searchCriteria.minPrice) >= parseInt(searchCriteria.maxPrice)) {
                newErrors.maxPrice = 'Max price must be greater than min price';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSearching(true);
        
        try {
            await onSearch(searchCriteria);
        } catch (error) {
            console.error('Search failed:', error);
            setErrors({ general: 'Search failed. Please try again.' });
        } finally {
            setIsSearching(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="property-search-form">
            <div className="form-grid">
                <div className="form-group">
                    <label htmlFor="suburb">Suburb *</label>
                    <input
                        type="text"
                        id="suburb"
                        name="suburb"
                        value={searchCriteria.suburb}
                        onChange={handleInputChange}
                        placeholder="e.g. Bondi Beach"
                        className={errors.suburb ? 'error' : ''}
                    />
                    {errors.suburb && (
                        <span className="error-message">{errors.suburb}</span>
                    )}
                </div>
                
                <div className="form-group">
                    <label htmlFor="propertyType">Property Type</label>
                    <select
                        id="propertyType"
                        name="propertyType"
                        value={searchCriteria.propertyType}
                        onChange={handleInputChange}
                    >
                        <option value="any">Any Property Type</option>
                        <option value="house">House</option>
                        <option value="apartment">Apartment</option>
                        <option value="townhouse">Townhouse</option>
                        <option value="villa">Villa</option>
                    </select>
                </div>
                
                <div className="form-group">
                    <label htmlFor="minPrice">Min Price</label>
                    <input
                        type="number"
                        id="minPrice"
                        name="minPrice"
                        value={searchCriteria.minPrice}
                        onChange={handleInputChange}
                        placeholder="500000"
                        min="0"
                        step="50000"
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="maxPrice">Max Price</label>
                    <input
                        type="number"
                        id="maxPrice"
                        name="maxPrice"
                        value={searchCriteria.maxPrice}
                        onChange={handleInputChange}
                        placeholder="2000000"
                        min="0"
                        step="50000"
                        className={errors.maxPrice ? 'error' : ''}
                    />
                    {errors.maxPrice && (
                        <span className="error-message">{errors.maxPrice}</span>
                    )}
                </div>
                
                <div className="form-group">
                    <label htmlFor="bedrooms">Bedrooms</label>
                    <select
                        id="bedrooms"
                        name="bedrooms"
                        value={searchCriteria.bedrooms}
                        onChange={handleInputChange}
                    >
                        <option value="any">Any</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                        <option value="4">4+</option>
                        <option value="5">5+</option>
                    </select>
                </div>
            </div>
            
            {errors.general && (
                <div className="error-message general-error">
                    {errors.general}
                </div>
            )}
            
            <button 
                type="submit" 
                disabled={isSearching}
                className="search-button"
            >
                {isSearching ? 'Searching...' : 'Search Properties'}
            </button>
        </form>
    );
};

export default PropertySearch;
```

#### React Hooks - useEffect

`useEffect` handles side effects like data fetching:

```jsx
// File: components/PropertyDashboard.jsx
import React, { useState, useEffect } from 'react';
import PropertyCard from './PropertyCard';
import PropertySearch from './PropertySearch';

const PropertyDashboard = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchResults, setSearchResults] = useState(null);
    
    // Fetch initial properties when component mounts
    useEffect(() => {
        const fetchInitialProperties = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await fetch('/api/properties/featured');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch properties');
                }
                
                const data = await response.json();
                setProperties(data);
                
            } catch (err) {
                console.error('Error fetching properties:', err);
                setError('Failed to load properties. Please refresh the page.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchInitialProperties();
    }, []); // Empty dependency array means this runs once on mount
    
    // Handle search
    const handleSearch = async (searchCriteria) => {
        try {
            setLoading(true);
            setError(null);
            
            const queryParams = new URLSearchParams(searchCriteria);
            const response = await fetch(`/api/properties/search?${queryParams}`);
            
            if (!response.ok) {
                throw new Error('Search failed');
            }
            
            const results = await response.json();
            setSearchResults(results);
            
        } catch (err) {
            console.error('Search error:', err);
            setError('Search failed. Please try again.');
            throw err; // Re-throw for form to handle
        } finally {
            setLoading(false);
        }
    };
    
    // Clear search results
    const clearSearch = () => {
        setSearchResults(null);
    };
    
    const displayedProperties = searchResults || properties;
    
    return (
        <div className="property-dashboard">
            <header className="dashboard-header">
                <h1>Property Central</h1>
                <p>Find your perfect property</p>
            </header>
            
            <PropertySearch onSearch={handleSearch} />
            
            {searchResults && (
                <div className="search-results-header">
                    <p>{searchResults.length} properties found</p>
                    <button onClick={clearSearch} className="clear-search">
                        Clear Search
                    </button>
                </div>
            )}
            
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
            
            {loading ? (
                <div className="loading">
                    <p>Loading properties...</p>
                </div>
            ) : (
                <div className="properties-grid">
                    {displayedProperties.length > 0 ? (
                        displayedProperties.map(property => (
                            <PropertyCard 
                                key={property.id} 
                                property={property} 
                            />
                        ))
                    ) : (
                        <div className="no-properties">
                            <p>No properties found</p>
                            {searchResults && (
                                <button onClick={clearSearch}>
                                    View all properties
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PropertyDashboard;
```

#### Custom Hooks

Custom hooks let you reuse stateful logic:

```jsx
// File: hooks/usePropertyData.js
import { useState, useEffect } from 'react';

const usePropertyData = (propertyId) => {
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        if (!propertyId) {
            setLoading(false);
            return;
        }
        
        const fetchProperty = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await fetch(`/api/properties/${propertyId}`);
                
                if (!response.ok) {
                    throw new Error('Property not found');
                }
                
                const data = await response.json();
                setProperty(data);
                
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchProperty();
    }, [propertyId]);
    
    return { property, loading, error };
};

// File: hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

const useLocalStorage = (key, initialValue) => {
    // Get value from localStorage or use initial value
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });
    
    // Return a wrapped version of useState's setter function that persists the new value to localStorage
    const setValue = (value) => {
        try {
            // Allow value to be a function so we have the same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };
    
    return [storedValue, setValue];
};

// File: hooks/usePropertyFavorites.js
import { useLocalStorage } from './useLocalStorage';

const usePropertyFavorites = () => {
    const [favorites, setFavorites] = useLocalStorage('propertyFavorites', []);
    
    const addToFavorites = (propertyId) => {
        setFavorites(prev => {
            if (prev.includes(propertyId)) {
                return prev; // Already in favorites
            }
            return [...prev, propertyId];
        });
    };
    
    const removeFromFavorites = (propertyId) => {
        setFavorites(prev => prev.filter(id => id !== propertyId));
    };
    
    const toggleFavorite = (propertyId) => {
        if (favorites.includes(propertyId)) {
            removeFromFavorites(propertyId);
        } else {
            addToFavorites(propertyId);
        }
    };
    
    const isFavorite = (propertyId) => {
        return favorites.includes(propertyId);
    };
    
    return {
        favorites,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        isFavorite
    };
};

// Usage in component
// File: components/PropertyCard.jsx
import React from 'react';
import { usePropertyFavorites } from '../hooks/usePropertyFavorites';

const PropertyCard = ({ property }) => {
    const { toggleFavorite, isFavorite } = usePropertyFavorites();
    const isPropertyFavorite = isFavorite(property.id);
    
    const handleFavoriteClick = (event) => {
        event.stopPropagation(); // Prevent card click
        toggleFavorite(property.id);
    };
    
    return (
        <div className="property-card">
            {/* Property content */}
            
            <button 
                className={`favorite-button ${isPropertyFavorite ? 'active' : ''}`}
                onClick={handleFavoriteClick}
                aria-label={isPropertyFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
                {isPropertyFavorite ? '❤️' : '🤍'}
            </button>
        </div>
    );
};
```

---

## Modern JavaScript Tooling

### Node.js and NPM

Node.js enables JavaScript to run outside the browser, and NPM manages packages and dependencies.

#### Setting Up a Property Dashboard Project

```bash
# Check Node.js installation
node --version  # Should be v20+
npm --version   # Should be 10+

# Create new project directory
mkdir property-dashboard
cd property-dashboard

# Initialize NPM project
npm init -y

# Install React and development tools
npm install react react-dom

# Install development dependencies
npm install --save-dev vite @vitejs/plugin-react
npm install --save-dev eslint eslint-plugin-react eslint-plugin-react-hooks
npm install --save-dev prettier

# Install additional libraries for property features
npm install date-fns # Date manipulation
npm install chart.js react-chartjs-2 # Charts for market data
npm install leaflet react-leaflet # Maps for property locations
```

#### Package.json Configuration

```json
{
  "name": "property-dashboard",
  "version": "1.0.0",
  "description": "Interactive property analysis dashboard",
  "main": "index.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .js,.jsx",
    "lint:fix": "eslint src --ext .js,.jsx --fix",
    "format": "prettier --write src/**/*.{js,jsx,css}"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "date-fns": "^3.0.0",
    "chart.js": "^4.0.0",
    "react-chartjs-2": "^5.0.0",
    "leaflet": "^1.9.0",
    "react-leaflet": "^4.2.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "eslint": "^8.0.0",
    "eslint-plugin-react": "^7.0.0",
    "eslint-plugin-react-hooks": "^4.0.0",
    "prettier": "^3.0.0"
  },
  "keywords": ["property", "real-estate", "dashboard", "react"],
  "author": "Your Name",
  "license": "MIT"
}
```

#### Vite Configuration

```javascript
// File: vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@services': path.resolve(__dirname, './src/services')
    }
  },
  server: {
    port: 3000,
    open: true, // Automatically open browser
    proxy: {
      // Proxy API requests to development server
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          vendor: ['react', 'react-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
          maps: ['leaflet', 'react-leaflet']
        }
      }
    }
  }
});
```

#### Project Structure

```
property-dashboard/
├── public/
│   ├── index.html
│   └── images/
├── src/
│   ├── components/
│   │   ├── PropertyCard.jsx
│   │   ├── PropertySearch.jsx
│   │   ├── PropertyDashboard.jsx
│   │   └── common/
│   │       ├── Button.jsx
│   │       ├── Loading.jsx
│   │       └── ErrorMessage.jsx
│   ├── hooks/
│   │   ├── usePropertyData.js
│   │   ├── useLocalStorage.js
│   │   └── usePropertyFavorites.js
│   ├── services/
│   │   ├── propertyAPI.js
│   │   └── locationService.js
│   ├── utils/
│   │   ├── propertyCalculations.js
│   │   ├── formatters.js
│   │   └── validation.js
│   ├── styles/
│   │   ├── index.css
│   │   ├── components.css
│   │   └── utilities.css
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── vite.config.js
├── .eslintrc.js
├── .prettierrc
└── README.md
```

---

## Practice Exercise: Build Property Analysis Dashboard

### Project: Interactive Property Dashboard

Let's build a complete property analysis dashboard using all the concepts learned:

#### Step 1: Set Up the Project

```bash
# Create and initialize project
mkdir property-analysis-dashboard
cd property-analysis-dashboard
npm init -y

# Install dependencies
npm install react react-dom vite @vitejs/plugin-react
npm install date-fns chart.js react-chartjs-2

# Install development dependencies  
npm install --save-dev eslint eslint-plugin-react prettier
```

#### Step 2: Main Application Component

```jsx
// File: src/App.jsx
import React, { useState } from 'react';
import PropertyDashboard from './components/PropertyDashboard';
import PropertyDetails from './components/PropertyDetails';
import './styles/App.css';

function App() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'details'
  
  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
    setView('details');
  };
  
  const handleBackToDashboard = () => {
    setSelectedProperty(null);
    setView('dashboard');
  };
  
  return (
    <div className="app">
      <header className="app-header">
        <h1>Property Analysis Dashboard</h1>
        <nav>
          <button 
            onClick={handleBackToDashboard}
            className={view === 'dashboard' ? 'active' : ''}
          >
            Dashboard
          </button>
        </nav>
      </header>
      
      <main className="app-main">
        {view === 'dashboard' ? (
          <PropertyDashboard onPropertySelect={handlePropertySelect} />
        ) : (
          <PropertyDetails 
            property={selectedProperty} 
            onBack={handleBackToDashboard} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
```

#### Step 3: Property Analysis Component

```jsx
// File: src/components/PropertyAnalysis.jsx
import React, { useMemo } from 'react';
import { 
  calculatePricePerSqm, 
  calculateROI, 
  calculateStampDuty 
} from '../utils/propertyCalculations';

const PropertyAnalysis = ({ property }) => {
  const analysis = useMemo(() => {
    const pricePerSqm = calculatePricePerSqm(property.price, property.area);
    const stampDuty = calculateStampDuty(property.price);
    const totalCost = property.price + stampDuty;
    
    // Calculate potential rental yield (example calculation)
    const weeklyRent = property.estimatedRent || 0;
    const annualRent = weeklyRent * 52;
    const rentalYield = (annualRent / property.price) * 100;
    
    return {
      pricePerSqm,
      stampDuty,
      totalCost,
      annualRent,
      rentalYield
    };
  }, [property]);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };
  
  return (
    <div className="property-analysis">
      <h3>Financial Analysis</h3>
      
      <div className="analysis-grid">
        <div className="analysis-item">
          <label>Price per m²</label>
          <value>{formatCurrency(analysis.pricePerSqm)}</value>
        </div>
        
        <div className="analysis-item">
          <label>Stamp Duty (NSW)</label>
          <value>{formatCurrency(analysis.stampDuty)}</value>
        </div>
        
        <div className="analysis-item">
          <label>Total Cost</label>
          <value>{formatCurrency(analysis.totalCost)}</value>
        </div>
        
        <div className="analysis-item">
          <label>Annual Rental Income</label>
          <value>{formatCurrency(analysis.annualRent)}</value>
        </div>
        
        <div className="analysis-item">
          <label>Rental Yield</label>
          <value className={analysis.rentalYield > 4 ? 'good' : 'average'}>
            {formatPercentage(analysis.rentalYield)}
          </value>
        </div>
      </div>
      
      <div className="analysis-summary">
        <h4>Investment Summary</h4>
        <p>
          This property offers a rental yield of {formatPercentage(analysis.rentalYield)}, 
          which is {analysis.rentalYield > 5 ? 'excellent' : analysis.rentalYield > 4 ? 'good' : 'moderate'} 
          for the Sydney market.
        </p>
        
        <p>
          The price per square metre of {formatCurrency(analysis.pricePerSqm)} 
          {analysis.pricePerSqm > 10000 ? ' is above average for the area.' : ' represents good value.'}
        </p>
      </div>
    </div>
  );
};

export default PropertyAnalysis;
```

#### Step 4: Utility Functions

```javascript
// File: src/utils/propertyCalculations.js

export const calculatePricePerSqm = (price, area) => {
  if (!price || !area) return 0;
  return Math.round(price / area);
};

export const calculateStampDuty = (price, state = 'NSW') => {
  if (state === 'NSW') {
    if (price <= 14000) return Math.round(price * 0.0125);
    if (price <= 32000) return 175 + Math.round((price - 14000) * 0.015);
    if (price <= 85000) return 445 + Math.round((price - 32000) * 0.0175);
    if (price <= 300000) return 1372.5 + Math.round((price - 85000) * 0.035);
    if (price <= 1000000) return 8925 + Math.round((price - 300000) * 0.045);
    return 40425 + Math.round((price - 1000000) * 0.055);
  }
  // Add other states as needed
  return Math.round(price * 0.05); // Simplified fallback
};

export const calculateMortgagePayment = (principal, rate, years) => {
  const monthlyRate = rate / 100 / 12;
  const numPayments = years * 12;
  
  if (monthlyRate === 0) return principal / numPayments;
  
  const monthlyPayment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
    (Math.pow(1 + monthlyRate, numPayments) - 1);
    
  return Math.round(monthlyPayment);
};

export const calculateROI = (annualIncome, totalInvestment, annualExpenses = 0) => {
  const netIncome = annualIncome - annualExpenses;
  return ((netIncome / totalInvestment) * 100);
};

export const formatCurrency = (amount, currency = 'AUD') => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount);
};

export const formatNumber = (number) => {
  return new Intl.NumberFormat('en-AU').format(number);
};
```

#### Step 5: Testing Your Application

```bash
# Start development server
npm run dev

# Your application will open at http://localhost:3000
```

### Assessment Checklist

Test your application against these criteria:

#### **Functionality**
- [ ] Property cards display correctly with all information
- [ ] Search form works with validation
- [ ] Property details view shows comprehensive analysis
- [ ] Favorites functionality persists across sessions
- [ ] All calculations are accurate

#### **Code Quality**
- [ ] Components are properly structured and reusable
- [ ] State management is efficient and logical
- [ ] Error handling is implemented throughout
- [ ] Code is clean and well-commented
- [ ] Modern JavaScript features are used appropriately

#### **User Experience**
- [ ] Interface is intuitive and responsive
- [ ] Loading states provide feedback
- [ ] Error messages are helpful
- [ ] Navigation is smooth and logical
- [ ] Performance is acceptable with large datasets

---

## Summary

You've mastered the core web development stack including:

- ✅ **Modern JavaScript**: ES6+ features, async programming, and modules
- ✅ **React Fundamentals**: Components, hooks, state management, and effects
- ✅ **Development Tooling**: Node.js, NPM, Vite, and project organisation
- ✅ **Custom Hooks**: Reusable stateful logic and data management
- ✅ **Property Calculations**: Real-world financial analysis functionality

**Next Steps:**
You're ready for Module 1.2 where you'll learn modern styling with Tailwind CSS and component libraries.

---

## Additional Resources

- [React Documentation](https://react.dev/)
- [Modern JavaScript Tutorial](https://javascript.info/)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Hooks Guide](https://react.dev/reference/react)

**Navigation:**
- [← Previous: Phase 0 - Absolute Beginnings](../../Phase-0-Absolute-Beginnings/README.md)
- [Next: Module 1.2 - Styling and UI Framework →](Module-1.2-Styling-and-UI-Framework.md)
- [↑ Back to Phase 1 Overview](README.md)