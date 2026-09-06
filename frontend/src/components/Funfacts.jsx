import './Funfacts.css';

function Funfacts() {
  const stats = [
    {
      id: 1,
      number: '500+',
      label: 'Vehicles',
      description: 'Premium vehicles available'
    },
    {
      id: 2,
      number: '10,000+',
      label: 'Happy Customers',
      description: 'Satisfied with our service'
    },
    {
      id: 3,
      number: '15+',
      label: 'Years of Service',
      description: 'Industry experience'
    },
    {
      id: 4,
      number: '98%',
      label: 'Satisfaction Rate',
      description: 'Customer approval rating'
    }
  ];

  return (
    <section className="funfacts">
      <div className="container">
        <div className="funfacts-header">
          <h2>Why Choose RentalHub</h2>
          <p>Trusted by thousands of customers across the country</p>
        </div>
        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.id} className="stat-card">
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-description">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Funfacts;
