import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';
import './styles/hero.css';
import './styles/about.css';
import './styles/products.css';
import './styles/subscription.css';
import './styles/delivery.css';
import './styles/order.css';
import './styles/footer.css';

createRoot(document.getElementById('root')).render(<App />);
