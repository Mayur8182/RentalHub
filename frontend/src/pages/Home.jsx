import Banner from '../components/Banner';
import Request from '../components/Request';
import Offers from '../components/Offers';
import Funfacts from '../components/Funfacts';
import Blog from '../components/Blog';

function Home() {
  return (
    <div className="home">
      <Banner />
      <Request />
      <Offers />
      <Funfacts />
      <Blog />
    </div>
  );
}

export default Home;
