
import BannerPrincipal from "@/components/banner";
import EventsRecapsTabs from "@/components/events-recaps";
import NewspaperStrip from "@/components/newspaper";
import TestimonialsSection from "@/components/TestimonialsSection";
import UniversityCarousel from "@/components/universities";

export default function Home() {
  return (
    <main>
        <BannerPrincipal/>
        <EventsRecapsTabs/>
        <UniversityCarousel/>
        <TestimonialsSection/>
        <NewspaperStrip/>
        

    </main>
           
  );
}
