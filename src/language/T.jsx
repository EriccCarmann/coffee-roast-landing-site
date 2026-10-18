import Rich from './Rich.jsx';
import { useLang } from './LangContext.jsx';

// <T k="hero.title" /> renders the translated text (with <em>/<strong>/<a>/<br> markup if present).
export default function T({ k, vars }) {
  const { t } = useLang();
  return <Rich html={t(k, vars)} />;
}
