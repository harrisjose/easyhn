import { createRoot } from 'react-dom/client';
import { useSettings } from '@/src/settings/useSettings';
import { useApplyTheme } from '@/src/settings/useApplyTheme';
import { YCombinator, XLogoIcon, ExternalArrow } from '@/src/ui/components/icons';
import '@/assets/styles/theme.css';

const LINKS = [
  {
    href: 'https://news.ycombinator.com/news',
    label: 'Hacker News',
    sub: 'Open the front page',
    Icon: YCombinator,
  },
  {
    href: 'https://x.com/harrispjose',
    label: 'Made by @harrispjose',
    sub: 'Say hi on X',
    Icon: XLogoIcon,
  },
];

function Popup() {
  const { settings } = useSettings();
  useApplyTheme(settings);

  return (
    <div className="ehn-root ehn-popup">
      <div className="ehn-popup-head">
        <span className="ehn-logo-mark">
          <YCombinator />
        </span>
        <div>
          <div className="ehn-popup-title">easyhn</div>
          <div className="ehn-popup-tag">A clean, readable UI for Hacker News</div>
        </div>
      </div>
      <div className="ehn-popup-links">
        {LINKS.map(({ href, label, sub, Icon }) => (
          <a key={href} className="ehn-popup-link" href={href} target="_blank" rel="noopener">
            <span className="ehn-popup-link-icon">
              <Icon />
            </span>
            <span className="ehn-popup-link-text">
              <span className="ehn-popup-link-label">{label}</span>
              <span className="ehn-popup-link-sub">{sub}</span>
            </span>
            <ExternalArrow className="ehn-popup-link-arrow" />
          </a>
        ))}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<Popup />);
