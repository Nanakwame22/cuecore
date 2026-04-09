import NavBar from '@/pages/home/components/NavBar';
import TickerBar from '@/pages/home/components/TickerBar';
import LandingFooter from '@/pages/home/components/LandingFooter';
import PlatformHero from './components/PlatformHero';
import PlatformSignalAnatomy from './components/PlatformSignalAnatomy';
import PlatformDashboardPreview from './components/PlatformDashboardPreview';
import PlatformDataSources from './components/PlatformDataSources';
import PlatformCapabilities from './components/PlatformCapabilities';
import PlatformIntegrations from './components/PlatformIntegrations';
import PlatformCTA from './components/PlatformCTA';

const PlatformPage = () => (
  <div className="min-h-screen bg-[#080a0e]">
    <NavBar />
    <div className="pt-16">
      <TickerBar />
      <PlatformHero />
      <PlatformSignalAnatomy />
      <PlatformDashboardPreview />
      <PlatformDataSources />
      <PlatformCapabilities />
      <PlatformIntegrations />
      <PlatformCTA />
      <LandingFooter />
    </div>
  </div>
);

export default PlatformPage;
