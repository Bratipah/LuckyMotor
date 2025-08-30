import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturedPrizes } from "@/components/featured-prizes"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <Header />
      <HeroSection />
      <FeaturedPrizes />
    </main>
  )
}
