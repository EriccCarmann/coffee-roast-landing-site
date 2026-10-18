import Providers from '../components/Providers';
import Hero from '../components/Hero';
import About from '../components/About';
import Products from '../components/Products';
import Subscription from '../components/Subscription';
import Delivery from '../components/Delivery';
import OrderSection from '../components/OrderSection';
import Footer from '../components/Footer';

// The home page (route "/"). This file is a Server Component: it only assembles
// the sections. Each section is a client component and brings its own interactivity.
export default function Page() {
  return (
    <Providers>
      <main>
        <Hero />
        <About />
        <Products />
        <Subscription />
        <Delivery />
        <OrderSection />
      </main>
      <Footer />
    </Providers>
  );
}
