import './Blog.css';

function Blog() {
  const blogs = [
    {
      id: 1,
      title: 'Top 5 Tips for Long-Distance Rentals',
      excerpt: 'Planning a long road trip? Learn essential tips to make your rental experience smooth, comfortable, and cost-effective.',
      date: 'Sept 15, 2026',
      category: 'Travel Tips'
    },
    {
      id: 2,
      title: 'Why Choose RentalHub for Your Next Trip?',
      excerpt: 'Discover what makes us the preferred choice for thousands of customers - from transparent pricing to premium vehicles.',
      date: 'Sept 10, 2026',
      category: 'About Us'
    },
    {
      id: 3,
      title: 'Seasonal Rental Discounts Available Now',
      excerpt: 'Get up to 30% off on selected vehicles this season. Check out our latest offers and start planning your journey today.',
      date: 'Sept 5, 2026',
      category: 'Offers'
    }
  ];

  return (
    <section className="blog-section">
      <div className="container">
        <div className="blog-header">
          <h2>Latest Updates</h2>
          <p>Stay informed with our latest news, tips, and offers</p>
        </div>
        <div className="blog-grid">
          {blogs.map((blog) => (
            <article key={blog.id} className="blog-card">
              <span className="blog-category">{blog.category}</span>
              <h3>{blog.title}</h3>
              <p>{blog.excerpt}</p>
              <div className="blog-footer">
                <small className="blog-date">{blog.date}</small>
                <a href="#" className="read-more">Read More →</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Blog;
