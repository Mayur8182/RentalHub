import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { vehicleAPI, bookingAPI, pricingAPI, couponAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import FavoriteButton from '../components/FavoriteButton';
import { VehicleDetailSkeleton } from '../components/Skeleton';
import LocationPicker from '../components/LocationPicker';
import './VehicleDetail.css';

function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [returnLocation, setReturnLocation] = useState('');
  const [sameLocation, setSameLocation] = useState(true);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [returnCoords, setReturnCoords] = useState(null);
  const [showPickupMap, setShowPickupMap] = useState(false);
  const [showReturnMap, setShowReturnMap] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Dynamic pricing
  const [pricing, setPricing] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  // Extras
  const EXTRAS = [
    { key: 'gps',              label: 'GPS Navigation', price: 200,  icon: '🗺️' },
    { key: 'childSeat',        label: 'Child Seat',     price: 150,  icon: '👶' },
    { key: 'insurance',        label: 'Insurance',      price: 500,  icon: '🛡️' },
    { key: 'additionalDriver', label: 'Extra Driver',   price: 300,  icon: '👤' },
  ];
  const [selectedExtras, setSelectedExtras] = useState({ gps: false, childSeat: false, insurance: false, additionalDriver: false });

  // Coupon
  const [couponCode,     setCouponCode]     = useState('');
  const [couponResult,   setCouponResult]   = useState(null);   // { discountAmount, finalAmount, coupon }
  const [couponError,    setCouponError]    = useState('');
  const [couponLoading,  setCouponLoading]  = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const response = await vehicleAPI.getById(id);
        setVehicle(response.data);
      } catch {
        setError('Vehicle not found');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id]);

  // ── Fetch dynamic pricing whenever dates change ─────────────────────────
  useEffect(() => {
    if (!startDate || !endDate || !vehicle) { setPricing(null); return; }
    const diff = new Date(endDate) - new Date(startDate);
    if (diff <= 0) { setPricing(null); return; }
    setPricingLoading(true);
    pricingAPI.calculate(vehicle._id, startDate, endDate)
      .then(r => setPricing(r.data))
      .catch(() => setPricing(null))
      .finally(() => setPricingLoading(false));
  }, [startDate, endDate, vehicle]);

  // ── Extras total ─────────────────────────────────────────────────────────
  const days = pricing?.days ?? 0;
  const extrasTotal = EXTRAS.reduce((sum, e) => sum + (selectedExtras[e.key] ? e.price * Math.max(1, days) : 0), 0);
  const baseTotal   = pricing?.finalTotal ?? 0;
  const discount    = couponResult?.discountAmount ?? 0;
  const grandTotal  = Math.max(0, baseTotal + extrasTotal - discount);

  // ── Apply coupon ──────────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError(''); setCouponLoading(true); setCouponResult(null);
    try {
      const res = await couponAPI.validate(couponCode.trim(), baseTotal + extrasTotal);
      setCouponResult(res.data);
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon');
    } finally { setCouponLoading(false); }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setBookingError('');

    const start = new Date(startDate);
    const end = new Date(endDate);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    if (start < todayDate) {
      setBookingError('Pickup date cannot be in the past.');
      return;
    }
    if (end <= start) {
      setBookingError('Return date must be after pickup date.');
      return;
    }

    try {
      setBookingLoading(true);
      await bookingAPI.create({
        vehicleId: vehicle._id,
        startDate,
        endDate,
        totalAmount: grandTotal,
        pickupLocation,
        returnLocation: sameLocation ? pickupLocation : returnLocation,
        extras: selectedExtras,
        extrasAmount: extrasTotal,
        weekendSurcharge: pricing?.weekendSurcharge ?? 0,
        discountAmount: discount,
        couponId: couponResult?.coupon?._id ?? null,
      });
      alert('Booking request submitted successfully!');
      navigate('/profile');
    } catch (err) {
      setBookingError(
        err.response?.data?.message || 'Failed to submit booking. Please try again.'
      );
      setBookingLoading(false);
    }
  };

  // ── Spec icon map ────────────────────────────────────────────────────────
  const specIcon = {
    seats:        '👥',
    transmission: '⚙️',
    fuel:         '⛽',
    year:         '📅',
    category:     '🏷️',
  };

  // ── Loading / error states ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="vd-page">
        <div className="container">
          <VehicleDetailSkeleton />
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="vd-state">
        <h2>Vehicle Not Found</h2>
        <p>{error}</p>
        <Link to="/fleet" className="btn btn-primary">Back to Fleet</Link>
      </div>
    );
  }

  return (
    <>
    <div className="vd-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="vd-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/fleet">Fleet</Link>
          <span>/</span>
          <span>{vehicle.name}</span>
        </nav>

        <div className="vd-layout">
          {/* ── LEFT COLUMN ─────────────────────────────────────── */}
          <div className="vd-left">

            {/* Image */}
            <div className="vd-image-wrap">
              <img
                src={vehicle.image}
                alt={vehicle.name}
                className="vd-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/800x450?text=Vehicle+Image';
                }}
              />
              <span className={`vd-availability-badge ${vehicle.availability ? 'available' : 'unavailable'}`}>
                {vehicle.availability ? '● Available' : '● Unavailable'}
              </span>
            </div>

            {/* Name + price */}
            <div className="vd-header">
              <div className="vd-name-row">
                <div>
                  <h1 className="vd-name">{vehicle.name}</h1>
                  <p className="vd-brand">{vehicle.brand}</p>
                </div>
                <FavoriteButton vehicle={vehicle} size="md" />
              </div>
              <div className="vd-price-block">
                <span className="vd-price">₹{vehicle.pricePerDay.toLocaleString('en-IN')}</span>
                <span className="vd-per-day">/ day</span>
              </div>
            </div>

            {/* Specs grid */}
            <div className="vd-specs-grid">
              {vehicle.category?.name && (
                <div className="vd-spec-item">
                  <span className="vd-spec-icon">{specIcon.category}</span>
                  <span className="vd-spec-label">Category</span>
                  <span className="vd-spec-value">{vehicle.category.name}</span>
                </div>
              )}
              {vehicle.seats && (
                <div className="vd-spec-item">
                  <span className="vd-spec-icon">{specIcon.seats}</span>
                  <span className="vd-spec-label">Seats</span>
                  <span className="vd-spec-value">{vehicle.seats}</span>
                </div>
              )}
              {vehicle.transmission && (
                <div className="vd-spec-item">
                  <span className="vd-spec-icon">{specIcon.transmission}</span>
                  <span className="vd-spec-label">Transmission</span>
                  <span className="vd-spec-value">{vehicle.transmission}</span>
                </div>
              )}
              {vehicle.fuel && (
                <div className="vd-spec-item">
                  <span className="vd-spec-icon">{specIcon.fuel}</span>
                  <span className="vd-spec-label">Fuel</span>
                  <span className="vd-spec-value">{vehicle.fuel}</span>
                </div>
              )}
              {vehicle.year && (
                <div className="vd-spec-item">
                  <span className="vd-spec-icon">{specIcon.year}</span>
                  <span className="vd-spec-label">Year</span>
                  <span className="vd-spec-value">{vehicle.year}</span>
                </div>
              )}
              {vehicle.location && (
                <div className="vd-spec-item">
                  <span className="vd-spec-icon">📍</span>
                  <span className="vd-spec-label">Location</span>
                  <span className="vd-spec-value">{vehicle.location}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="vd-section">
              <h2 className="vd-section-title">Description</h2>
              <p className="vd-description">{vehicle.description}</p>
            </div>

            {/* Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div className="vd-section">
                <h2 className="vd-section-title">Features</h2>
                <ul className="vd-features-list">
                  {vehicle.features.map((feature, i) => (
                    <li key={i} className="vd-feature-item">
                      <span className="vd-feature-check">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN — BOOKING PANEL ────────────────────── */}
          <div className="vd-right">
            <div className="vd-booking-card">
              <div className="vd-booking-header">
                <span className="vd-booking-price">
                  ₹{vehicle.pricePerDay.toLocaleString('en-IN')}
                </span>
                <span className="vd-booking-per-day">/ day</span>
              </div>

              {!user ? (
                /* Not logged in */
                <div className="vd-login-prompt">
                  <p>Please log in to book this vehicle.</p>
                  <div className="vd-login-buttons">
                    <Link to="/login" className="btn btn-primary">Login</Link>
                    <Link to="/register" className="btn btn-secondary">Register</Link>
                  </div>
                </div>
              ) : !vehicle.availability ? (
                /* Unavailable */
                <div className="vd-unavailable-msg">
                  <p>This vehicle is currently unavailable.</p>
                  <Link to="/fleet" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: '12px' }}>
                    Browse Other Vehicles
                  </Link>
                </div>
              ) : (
                /* Booking form */
                <form onSubmit={handleBook} className="vd-booking-form">
                  {bookingError && (
                    <div className="vd-booking-error">{bookingError}</div>
                  )}

                  <div className="vd-date-grid">
                    <div className="vd-date-field">
                      <label htmlFor="vd-start">Pickup Date</label>
                      <input
                        id="vd-start"
                        type="date"
                        className="form-control"
                        value={startDate}
                        min={today}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          if (endDate && e.target.value >= endDate) setEndDate('');
                        }}
                        required
                        disabled={bookingLoading}
                      />
                    </div>
                    <div className="vd-date-field">
                      <label htmlFor="vd-end">Return Date</label>
                      <input
                        id="vd-end"
                        type="date"
                        className="form-control"
                        value={endDate}
                        min={startDate || today}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        disabled={bookingLoading}
                      />
                    </div>
                  </div>

                  {/* Location fields */}
                  <div className="vd-date-field" style={{ gridColumn: 'span 2' }}>
                    <label htmlFor="vd-pickup">📍 Pickup Location</label>
                    <div className="vd-location-row">
                      <input
                        id="vd-pickup"
                        type="text"
                        className="form-control"
                        placeholder="Type or pick on map…"
                        value={pickupLocation}
                        onChange={e => setPickupLocation(e.target.value)}
                        required
                        disabled={bookingLoading}
                      />
                      <button
                        type="button"
                        className="vd-map-btn"
                        onClick={() => setShowPickupMap(true)}
                        title="Pick on map"
                        disabled={bookingLoading}
                      >
                        🗺️
                      </button>
                    </div>
                  </div>

                  <div className="vd-same-location-row">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', color: '#555' }}>
                      <input
                        type="checkbox"
                        checked={sameLocation}
                        onChange={e => setSameLocation(e.target.checked)}
                        style={{ width: 14, height: 14 }}
                      />
                      Return to same location
                    </label>
                  </div>

                  {!sameLocation && (
                    <div className="vd-date-field" style={{ gridColumn: 'span 2' }}>
                      <label htmlFor="vd-return-loc">🏁 Return Location</label>
                      <div className="vd-location-row">
                        <input
                          id="vd-return-loc"
                          type="text"
                          className="form-control"
                          placeholder="Type or pick on map…"
                          value={returnLocation}
                          onChange={e => setReturnLocation(e.target.value)}
                          required
                          disabled={bookingLoading}
                        />
                        <button
                          type="button"
                          className="vd-map-btn"
                          onClick={() => setShowReturnMap(true)}
                          title="Pick on map"
                          disabled={bookingLoading}
                        >
                          🗺️
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Extra Services ─────────────────────── */}
                  <div className="vd-extras-section">
                    <div className="vd-extras-title">🧰 Extra Services</div>
                    <div className="vd-extras-grid">
                      {EXTRAS.map(e => (
                        <label key={e.key} className={`vd-extra-item ${selectedExtras[e.key] ? 'active' : ''}`}>
                          <input
                            type="checkbox"
                            checked={selectedExtras[e.key]}
                            onChange={() => setSelectedExtras(prev => ({ ...prev, [e.key]: !prev[e.key] }))}
                            disabled={bookingLoading}
                          />
                          <span className="vd-extra-icon">{e.icon}</span>
                          <div className="vd-extra-info">
                            <span className="vd-extra-label">{e.label}</span>
                            <span className="vd-extra-price">₹{e.price}/day</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* ── Coupon ──────────────────────────────── */}
                  {days > 0 && (
                    <div className="vd-coupon-row">
                      <input
                        type="text"
                        className="form-control vd-coupon-input"
                        placeholder="Coupon code"
                        value={couponCode}
                        onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); setCouponError(''); }}
                        disabled={bookingLoading || couponLoading}
                      />
                      <button
                        type="button"
                        className="vd-coupon-btn"
                        onClick={handleApplyCoupon}
                        disabled={!couponCode.trim() || couponLoading || bookingLoading}
                      >
                        {couponLoading ? '…' : 'Apply'}
                      </button>
                    </div>
                  )}
                  {couponResult && (
                    <div className="vd-coupon-success">
                      🎉 <strong>{couponResult.coupon.code}</strong> applied — {couponResult.coupon.discountType === 'percentage' ? `${couponResult.coupon.discountValue}% off` : `₹${couponResult.coupon.discountValue} off`}
                    </div>
                  )}
                  {couponError && <div className="vd-coupon-error">{couponError}</div>}

                  {/* ── Live price breakdown ─────────────────── */}
                  <div className="vd-total-box">
                    {days > 0 ? (
                      pricingLoading ? (
                        <p className="vd-total-placeholder">Calculating price…</p>
                      ) : (
                        <>
                          <div className="vd-total-row">
                            <span>Base ({days} day{days !== 1 ? 's' : ''})</span>
                            <span>₹{(pricing?.baseTotal ?? days * vehicle.pricePerDay).toLocaleString('en-IN')}</span>
                          </div>
                          {pricing?.weekendSurcharge > 0 && (
                            <div className="vd-total-row vd-surcharge">
                              <span>Weekend/Holiday surcharge</span>
                              <span>+₹{pricing.weekendSurcharge.toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          {extrasTotal > 0 && (
                            <div className="vd-total-row">
                              <span>Extra services</span>
                              <span>+₹{extrasTotal.toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          {discount > 0 && (
                            <div className="vd-total-row vd-discount-row">
                              <span>Coupon discount</span>
                              <span>−₹{discount.toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          <div className="vd-total-row vd-total-final">
                            <span>Total</span>
                            <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                          </div>
                        </>
                      )
                    ) : (
                      <p className="vd-total-placeholder">Select dates to see total</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary vd-book-btn"
                    disabled={bookingLoading || days === 0}
                  >
                    {bookingLoading ? 'Submitting…' : `Book Now${days > 0 ? ` · ₹${grandTotal.toLocaleString('en-IN')}` : ''}`}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* ── Location picker modals ──────────────────────────────── */}
    {showPickupMap && (
      <LocationPicker
        label="Pickup Location"
        value={pickupLocation}
        onConfirm={(addr, lat, lng) => {
          setPickupLocation(addr);
          setPickupCoords(lat && lng ? { lat, lng } : null);
          setShowPickupMap(false);
        }}
        onClose={() => setShowPickupMap(false)}
      />
    )}
    {showReturnMap && (
      <LocationPicker
        label="Return Location"
        value={returnLocation}
        onConfirm={(addr, lat, lng) => {
          setReturnLocation(addr);
          setReturnCoords(lat && lng ? { lat, lng } : null);
          setShowReturnMap(false);
        }}
        onClose={() => setShowReturnMap(false)}
      />
    )}
    </>
  );
}

export default VehicleDetail;
