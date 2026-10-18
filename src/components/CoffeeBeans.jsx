import { useState } from 'react';

// Decorative coffee beans (used 3 times, see App.jsx). Put your transparent PNG at
// public/images/coffee-beans.png (then `npm run build`). Until the file exists, a dashed placeholder is shown.
// Position, size and tilt of variants a / b / c are in styles/global.css (.beans--a ...).
export const BEANS_SRC = '/images/coffee_beans.png';

export default function CoffeeBeans({ variant = 'a' }) {
  const [missing, setMissing] = useState(false);
  return (
    <div className={`beans-slot beans-slot--${variant}`} aria-hidden="true">
      <div className={`beans beans--${variant}`}>
        {missing
          ? <div className="beans__placeholder">coffee-beans.png</div>
          : <img src={BEANS_SRC} alt="" draggable="false" onError={() => setMissing(true)} />}
      </div>
    </div>
  );
}
