import './RequestOffers.css';

function Offers() {
  const offers = [
    {
      id: 1,
      title: 'Budget Friendly',
      description: 'Affordable rental packages for your budget'
    },
    {
      id: 2,
      title: 'Premium Service',
      description: 'Luxury vehicles with premium features'
    },
    {
      id: 3,
      title: '24/7 Support',
      description: 'Round-the-clock customer support and assistance'
    }
  ];

  return (
    <section className="offers-section">
      <div className="container">
        <h2>Special Offers</h2>
        <div className="offers-container">
          {offers.map((offer) => (
            <div key={offer.id} className="offer-card">
              <h3>{offer.title}</h3>
              <p>{offer.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Offers;
