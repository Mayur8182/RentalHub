import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vehicleAPI, categoryAPI } from '../utils/api';
import Hero from '../components/Hero';
import FavoriteButton from '../components/FavoriteButton';
import { VehicleCardSkeleton } from '../components/Skeleton';
import './Fleet.css';

function Fleet() {
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [vehicleAvailability, setVehicleAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const priceRangeOptions = [
    { id: 'under1000', label: 'Under ₹1,000', min: 0, max: 999 },
    { id: '1000-3000', label: '₹1,000 - ₹3,000', min: 1000, max: 3000 },
    { id: '3000-5000', label: '₹3,000 - ₹5,000', min: 3000, max: 5000 },
    { id: '5000plus', label: '₹5,000+', min: 5000, max: Infinity }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vehiclesRes, categoriesRes] = await Promise.all([
        vehicleAPI.getAll(),
        categoryAPI.getAll()
      ]);
      setVehicles(vehiclesRes.data);
      setCategories(categoriesRes.data || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load vehicles');
      setLoading(false);
    }
  };

  const handlePriceRangeToggle = (rangeId) => {
    setSelectedPriceRanges(prev => 
      prev.includes(rangeId) 
        ? prev.filter(id => id !== rangeId)
        : [...prev, rangeId]
    );
  };

  const checkAllAvailability = async () => {
    if (!pickupDate || !returnDate) {
      alert('Please select both pickup and return dates');
      return;
    }

    if (new Date(pickupDate) >= new Date(returnDate)) {
      alert('Return date must be after pickup date');
      return;
    }

    setCheckingAvailability(true);
    const availabilityResults = {};
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      // Check availability for each vehicle
      for (const vehicle of vehicles) {
        const response = await fetch(`${baseURL}/api/vehicles/check-availability`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vehicleId: vehicle._id,
            startDate: pickupDate,
            endDate: returnDate
          })
        });

        const data = await response.json();
        availabilityResults[vehicle._id] = data.available;
      }

      setVehicleAvailability(availabilityResults);
    } catch (err) {
      console.error('Error checking availability:', err);
      alert('Failed to check availability. Please try again.');
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Filter by category
  const categoryFilteredVehicles = selectedCategory === 'all' 
    ? vehicles 
    : vehicles.filter(vehicle => vehicle.category?._id === selectedCategory || vehicle.category === selectedCategory);

  // Filter by city
  const cityFilteredVehicles = selectedCity === 'all'
    ? categoryFilteredVehicles
    : categoryFilteredVehicles.filter(v => v.location?.toLowerCase() === selectedCity.toLowerCase());

  // Filter by search query
  const searchFilteredVehicles = cityFilteredVehicles.filter(vehicle => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const categoryName = vehicle.category?.name?.toLowerCase() || '';
    
    return (
      vehicle.name.toLowerCase().includes(query) ||
      vehicle.brand.toLowerCase().includes(query) ||
      (vehicle.location && vehicle.location.toLowerCase().includes(query)) ||
      categoryName.includes(query)
    );
  });

  // Filter by price range
  const priceFilteredVehicles = searchFilteredVehicles.filter(vehicle => {
    if (selectedPriceRanges.length === 0) return true;
    
    return selectedPriceRanges.some(rangeId => {
      const range = priceRangeOptions.find(r => r.id === rangeId);
      return vehicle.pricePerDay >= range.min && vehicle.pricePerDay <= range.max;
    });
  });

  // Filter by availability
  const availabilityFilteredVehicles = showAvailableOnly
    ? priceFilteredVehicles.filter(vehicle => vehicle.availability)
    : priceFilteredVehicles;

  // Sort vehicles
  const filteredVehicles = [...availabilityFilteredVehicles].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.pricePerDay - b.pricePerDay;
      case 'price-high':
        return b.pricePerDay - a.pricePerDay;
      case 'newest':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case 'popular':
        // For now, sort by name as popularity metric
        // In future, can use booking count or ratings
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="fleet-page">
      <Hero title="Our Fleet" subtitle="Choose from our wide range of vehicles" />
      <section className="fleet-section">
        <div className="container">
          <h2>Available Vehicles</h2>
          
          {/* Search Bar */}
          <div style={{ 
            marginBottom: '24px',
            maxWidth: '600px',
            margin: '0 auto 30px auto'
          }}>
            <div style={{ 
              display: 'flex', 
              gap: '8px',
              backgroundColor: '#FFF',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #E8E8E8',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <input
                type="text"
                placeholder="Search vehicles by name, brand, location, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
              <button
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#111',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#000'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#111'}
              >
                Search
              </button>
            </div>
            {searchQuery && (
              <div style={{ 
                marginTop: '8px', 
                fontSize: '14px', 
                color: '#666',
                textAlign: 'center'
              }}>
                {filteredVehicles.length} result{filteredVehicles.length !== 1 ? 's' : ''} found for "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    marginLeft: '12px',
                    padding: '4px 12px',
                    backgroundColor: '#E8E8E8',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Date-based Availability Checker */}
          <div style={{
            backgroundColor: '#FFF',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #E8E8E8',
            marginBottom: '30px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>
              Check Availability for Specific Dates
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: '1', minWidth: '200px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#555' }}>
                  Pickup Date
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #E8E8E8',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <div style={{ flex: '1', minWidth: '200px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#555' }}>
                  Return Date
                </label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  min={pickupDate || new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #E8E8E8',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <button
                onClick={checkAllAvailability}
                disabled={!pickupDate || !returnDate || checkingAvailability}
                style={{
                  padding: '10px 24px',
                  backgroundColor: (!pickupDate || !returnDate || checkingAvailability) ? '#CCC' : '#111',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: (!pickupDate || !returnDate || checkingAvailability) ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  minWidth: '150px'
                }}
              >
                {checkingAvailability ? 'Checking...' : 'Check Availability'}
              </button>
              {Object.keys(vehicleAvailability).length > 0 && (
                <button
                  onClick={() => {
                    setPickupDate('');
                    setReturnDate('');
                    setVehicleAvailability({});
                  }}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#E8E8E8',
                    color: '#111',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Clear Dates
                </button>
              )}
            </div>
            {Object.keys(vehicleAvailability).length > 0 && (
              <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
                ✓ Availability checked for {pickupDate} to {returnDate}
              </div>
            )}
          </div>
          
          {/* Category Filter */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            marginBottom: '20px', 
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                padding: '10px 24px',
                border: selectedCategory === 'all' ? '2px solid #111' : '1px solid #E8E8E8',
                background: selectedCategory === 'all' ? '#111' : '#FFF',
                color: selectedCategory === 'all' ? '#FFF' : '#111',
                cursor: 'pointer',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              All Vehicles
            </button>
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => setSelectedCategory(category._id)}
                style={{
                  padding: '10px 24px',
                  border: selectedCategory === category._id ? '2px solid #111' : '1px solid #E8E8E8',
                  background: selectedCategory === category._id ? '#111' : '#FFF',
                  color: selectedCategory === category._id ? '#FFF' : '#111',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* City / Location Filter */}
          {(() => {
            const cities = ['all', ...new Set(vehicles.map(v => v.location).filter(Boolean))].sort((a, b) => a === 'all' ? -1 : a.localeCompare(b));
            return (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#6B7280' }}>📍 City:</span>
                {cities.map(city => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    style={{
                      padding: '6px 16px',
                      border: selectedCity === city ? '2px solid #3B82F6' : '1px solid #E8E8E8',
                      background: selectedCity === city ? '#3B82F6' : '#FFF',
                      color: selectedCity === city ? '#FFF' : '#374151',
                      cursor: 'pointer',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {city === 'all' ? '🌍 All Cities' : city}
                  </button>
                ))}
              </div>
            );
          })()}

          {/* Sort Dropdown */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '20px',
            alignItems: 'center',
            gap: '12px'
          }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>
              Sort By:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '10px 16px',
                border: '1px solid #E8E8E8',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                backgroundColor: '#FFF',
                outline: 'none',
                minWidth: '200px'
              }}
            >
              <option value="default">Default</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {/* Price Range & Availability Filters */}
          <div style={{
            backgroundColor: '#FFF',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #E8E8E8',
            marginBottom: '30px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {/* Price Range Checkboxes */}
              <div style={{ flex: '1', minWidth: '250px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>
                  Price Range (per day)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {priceRangeOptions.map((range) => (
                    <label 
                      key={range.id}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPriceRanges.includes(range.id)}
                        onChange={() => handlePriceRangeToggle(range.id)}
                        style={{ 
                          cursor: 'pointer',
                          width: '18px',
                          height: '18px'
                        }}
                      />
                      <span>{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div style={{ flex: '1', minWidth: '200px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>
                  Availability
                </h3>
                <label 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={showAvailableOnly}
                    onChange={(e) => setShowAvailableOnly(e.target.checked)}
                    style={{ 
                      cursor: 'pointer',
                      width: '18px',
                      height: '18px'
                    }}
                  />
                  <span>Show Available Only</span>
                </label>
              </div>

              {/* Active Filters Summary */}
              {(selectedPriceRanges.length > 0 || showAvailableOnly) && (
                <div style={{ flex: '1', minWidth: '200px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>
                    Active Filters
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedPriceRanges([]);
                      setShowAvailableOnly(false);
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#E8E8E8',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'background-color 0.3s ease'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#D8D8D8'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#E8E8E8'}
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {loading && (
            <div className="fleet-grid">
              {[...Array(6)].map((_, i) => (
                <VehicleCardSkeleton key={i} />
              ))}
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#DC3545' }}>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && filteredVehicles.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>
                {searchQuery 
                  ? `No vehicles found matching "${searchQuery}"`
                  : 'No vehicles available in this category.'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    marginTop: '16px',
                    padding: '10px 24px',
                    backgroundColor: '#111',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

          {!loading && !error && filteredVehicles.length > 0 && (
            <div className="fleet-grid">
              {filteredVehicles.map((vehicle) => (
                <div key={vehicle._id} className="vehicle-card">
                  <div style={{ position: 'relative' }}>
                    <img
                      src={vehicle.image}
                      alt={vehicle.name}
                      className="vehicle-image"
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '4px 4px 0 0',
                        display: 'block'
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x200?text=Vehicle+Image';
                      }}
                    />
                    <FavoriteButton
                      vehicle={vehicle}
                      size="sm"
                      className="fleet-card-fav"
                    />
                  </div>
                  <div style={{ padding: '20px' }}>
                    <h3>{vehicle.name}</h3>
                    <p className="vehicle-type">{vehicle.brand}</p>
                    <p className="vehicle-capacity">
                      {vehicle.location || 'Multiple locations'}
                    </p>
                    <p className="vehicle-price">
                      ₹{vehicle.pricePerDay.toLocaleString('en-IN')}/day
                    </p>
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {/* Base Availability Status */}
                      <span 
                        style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: vehicle.availability ? '#28A745' : '#DC3545',
                          color: '#FFF'
                        }}
                      >
                        {vehicle.availability ? 'Available' : 'Unavailable'}
                      </span>
                      
                      {/* Date-based Availability Status */}
                      {Object.keys(vehicleAvailability).length > 0 && (
                        <span 
                          style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: vehicleAvailability[vehicle._id] ? '#007BFF' : '#FFC107',
                            color: vehicleAvailability[vehicle._id] ? '#FFF' : '#111'
                          }}
                        >
                          {vehicleAvailability[vehicle._id] 
                            ? '✓ Available for selected dates' 
                            : '✗ Booked for selected dates'}
                        </span>
                      )}
                    </div>
                    <Link 
                      to={`/vehicles/${vehicle._id}`} 
                      className="btn btn-primary"
                      style={{ width: '100%', textAlign: 'center', display: 'block' }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Fleet;
