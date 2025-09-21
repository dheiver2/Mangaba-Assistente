import React, { memo } from 'react';
import './LandingPage.css';
import './landing/LandingPage.css';
import LandingNavbar from './landing/LandingNavbar';
import HeroSection from './landing/HeroSection';
import FeaturesSection from './landing/FeaturesSection';
import DemoSection from './landing/DemoSection';
import PricingSection from './landing/PricingSection';
import FooterSection from './landing/FooterSection';
import BrazilianFlags from './BrazilianFlags';

const LandingPage = memo(() => {

  return (
    <div className="landing-page">
      <LandingNavbar />
      <BrazilianFlags />
      <HeroSection />
      <div id="features">
        <FeaturesSection />
      </div>
      <div id="demo">
        <DemoSection />
      </div>
      <div id="pricing">
        <PricingSection />
      </div>
      <div id="contact">
        <FooterSection />
      </div>
    </div>
  );
});

LandingPage.displayName = 'LandingPage';

export default LandingPage;