import NavBar from './components/NavBar';
import TickerBar from './components/TickerBar';
import LandingHero from './components/LandingHero';
import LandingStats from './components/LandingStats';
import LandingFeatures from './components/LandingFeatures';
import LandingHowItWorks from './components/LandingHowItWorks';
import LandingLiveCues from './components/LandingLiveCues';
import LandingTestimonials from './components/LandingTestimonials';
import LandingFooter from './components/LandingFooter';

const HomePage = () => (
  <div className="min-h-screen bg-[#080a0e]">
    <NavBar />
    <div className="pt-16">
      <TickerBar />
      <LandingHero />
      <LandingStats />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingLiveCues />
      <LandingTestimonials />
      <LandingFooter />
    </div>
  </div>
);

export default HomePage;
