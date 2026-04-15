import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import AboutSection from "@/components/AboutSection";
import StatsSection from "@/components/StatsSection";
import BenefitsSection from "@/components/BenefitsSection";
import GallerySection from "@/components/GallerySection";
import TestimonialsSection from "@/components/TestimonialsSection";
import EventDetailsSection from "@/components/EventDetailsSection";
import StallCategoriesSection from "@/components/StallCategoriesSection";
import BookingCTA from "@/components/BookingCTA";
import FAQSection from "@/components/FAQSection";
import SponsorsSection from "@/components/SponsorsSection";
import ContactFooter from "@/components/ContactFooter";
import ScrollToTop from "@/components/ScrollToTop";

const Index = () => (
  <div className="min-h-screen">
    <Navbar />
    <HeroBanner />
    <AboutSection />
    <StatsSection />
    <BenefitsSection />
    <GallerySection />
    <TestimonialsSection />
    <EventDetailsSection />
    <StallCategoriesSection />
    <BookingCTA />
    <FAQSection />
    <SponsorsSection />
    <ContactFooter />
    <ScrollToTop />
  </div>
);

export default Index;
