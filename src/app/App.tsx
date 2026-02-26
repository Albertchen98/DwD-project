import { HeroSection } from './components/HeroSection';
import { AuthorsSection } from './components/AuthorsSection';
import { TeaserSection } from './components/TeaserSection';
import { AbstractSection } from './components/AbstractSection';
import { MethodSection } from './components/MethodSection';
import { ResultsSection } from './components/ResultsSection';
import { DownloadSection } from './components/DownloadSection';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';

export default function App() {
  return (
    <div className="size-full bg-slate-950">
      <Navbar />
      <HeroSection />
      <AuthorsSection />
      <TeaserSection />
      <AbstractSection />
      <MethodSection />
      <ResultsSection />
      <DownloadSection />
      <Footer />
    </div>
  );
}
