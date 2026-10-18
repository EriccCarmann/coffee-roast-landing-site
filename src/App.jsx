import { useState } from 'react';
import { LangProvider } from './language/LangContext.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Products from './components/Products.jsx';
import Subscription from './components/Subscription.jsx';
import Delivery from './components/Delivery.jsx';
import OrderForm from './components/OrderForm.jsx';
import Footer from './components/Footer.jsx';
import CoffeeBeans from './components/CoffeeBeans.jsx';
import { DEFAULT_ORDER } from './data/products.js';

export default function App() {
    const [order, setOrder] = useState(DEFAULT_ORDER);
    const [focusSignal, setFocusSignal] = useState(0);

    // The "leave a request" buttons (roasts, subscription) pick an option in the form and ask it to scroll into view and focus.
    const chooseOrder = (value) => {
        setOrder(value);
        setFocusSignal((n) => n + 1);
    };

    return (
        <LangProvider>
            <Hero />
            <CoffeeBeans variant="a" />
            <About />
            <Products onOrder={chooseOrder} />
            <CoffeeBeans variant="b" />
            <Subscription onOrder={chooseOrder} />
            <Delivery />
            <CoffeeBeans variant="c" />
            <OrderForm order={order} onOrderChange={setOrder} focusSignal={focusSignal} />
            <Footer />
        </LangProvider>
    );
}