import { useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import './FAQ.css';

const FAQS = [
  {
    category: 'Booking',
    items: [
      {
        q: 'How do I book a vehicle?',
        a: 'Browse our fleet, click "View Details" on any vehicle, choose your pickup and return dates, then click "Book Now". You need to be logged in to complete a booking.',
      },
      {
        q: 'Can I cancel a booking?',
        a: 'Yes — you can cancel any Pending booking from your My Bookings page or the booking detail page. Approved or Active bookings must be cancelled by contacting support.',
      },
      {
        q: 'How far in advance can I book?',
        a: 'You can book up to 6 months in advance. We recommend booking early during peak seasons like holidays and long weekends.',
      },
      {
        q: 'Is there a minimum rental period?',
        a: 'The minimum rental period is 1 day. There is no maximum — long-term rentals are available at discounted rates, contact us for pricing.',
      },
    ],
  },
  {
    category: 'Payment',
    items: [
      {
        q: 'What payment methods are accepted?',
        a: 'We accept all major credit/debit cards, UPI, net banking, and popular wallets. Payment is collected at the time of booking confirmation.',
      },
      {
        q: 'Are there any hidden charges?',
        a: 'No. The price shown on the vehicle detail page is the final per-day rate. The total shown before you confirm is exactly what you pay.',
      },
      {
        q: 'Can I get a refund if I cancel?',
        a: 'Cancellations made more than 48 hours before pickup receive a full refund. Late cancellations may incur a fee. Check our Cancellation Policy for details.',
      },
    ],
  },
  {
    category: 'Vehicles',
    items: [
      {
        q: 'Are the vehicles insured?',
        a: 'Yes — all vehicles in our fleet are comprehensively insured. Basic coverage is included in the rental price. Additional coverage options are available at checkout.',
      },
      {
        q: 'What fuel policy applies?',
        a: 'Vehicles are provided with a full tank and should be returned full. If returned with less fuel, the difference is charged at local pump rates plus a small service fee.',
      },
      {
        q: 'Can I take the vehicle to another city?',
        a: 'Interstate travel is allowed for most vehicles with prior approval. Please mention this during booking or contact us before your trip.',
      },
      {
        q: 'What if the vehicle breaks down?',
        a: 'We provide 24/7 roadside assistance. Call our support line and we will arrange help or a replacement vehicle within 2 hours in most service areas.',
      },
    ],
  },
  {
    category: 'Account',
    items: [
      {
        q: 'I forgot my password. How do I reset it?',
        a: 'Click "Forgot password?" on the Login page, enter your email, and follow the reset link. The link expires after 1 hour.',
      },
      {
        q: 'How do I change my password?',
        a: 'Go to your Profile page, click the Security tab, and use the Change Password form. You will need your current password.',
      },
      {
        q: 'Can I leave a review for a vehicle?',
        a: 'Yes — after a booking is marked as Completed, a "Review" button appears in My Bookings. Your review and star rating will be shown on the vehicle page.',
      },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? 'open' : ''}`}>
      <button className="faq-question" onClick={() => setOpen(o => !o)}>
        <span>{q}</span>
        <span className="faq-chevron">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="faq-answer">{a}</div>}
    </div>
  );
}

function FAQ() {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', ...FAQS.map(f => f.category)];

  const shown = activeCategory === 'All'
    ? FAQS
    : FAQS.filter(f => f.category === activeCategory);

  return (
    <div className="faq-page">
      <Hero title="FAQ" subtitle="Answers to the most common questions" />

      <section className="faq-section">
        <div className="container">

          {/* Category filter */}
          <div className="faq-cats">
            {categories.map(c => (
              <button
                key={c}
                className={`faq-cat-btn ${activeCategory === c ? 'active' : ''}`}
                onClick={() => setActiveCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {/* FAQ groups */}
          <div className="faq-groups">
            {shown.map(group => (
              <div key={group.category} className="faq-group">
                <h3 className="faq-group-title">{group.category}</h3>
                <div className="faq-list">
                  {group.items.map(item => (
                    <FAQItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Still need help */}
          <div className="faq-cta">
            <h3>Still have questions?</h3>
            <p>Our support team is available Monday–Friday, 9 AM–6 PM.</p>
            <Link to="/contact" className="btn btn-primary">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default FAQ;
