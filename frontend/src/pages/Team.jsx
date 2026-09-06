import Hero from '../components/Hero';
import './Team.css';

function Team() {
  const team = [
    {
      id: 1,
      name: 'Mayurbhai Bharvad',
      role: 'Lead Developer',
      image: '👨‍💼',
      bio: 'Full-stack developer with expertise in MERN stack'
    },
    {
      id: 2,
      name: 'Sagar Jasani',
      role: 'CEO & Mentor',
      image: '👔',
      bio: 'Industry expert guiding the project development'
    },
    {
      id: 3,
      name: 'UI/UX Designer',
      role: 'Designer',
      image: '🎨',
      bio: 'Creating beautiful and user-friendly interfaces'
    },
    {
      id: 4,
      name: 'Backend Engineer',
      role: 'Backend Developer',
      image: '⚙️',
      bio: 'Building robust APIs and database systems'
    }
  ];

  return (
    <div className="team-page">
      <Hero title="Meet Our Team" subtitle="Dedicated professionals building RentalHub" />
      <section className="team-section">
        <div className="container">
          <h2>Our Team</h2>
          <div className="team-grid">
            {team.map((member) => (
              <div key={member.id} className="team-card">
                <div className="team-image">{member.image}</div>
                <h3>{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-bio">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Team;
