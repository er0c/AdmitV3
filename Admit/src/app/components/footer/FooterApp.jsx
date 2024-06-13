import Link from 'next/link';
import { usePathname } from 'next/navigation';
/* eslint-disable @next/next/no-img-element */
import '../../css/footer.css';

function FooterApp() {
  const currentRoute = usePathname();
  
  return (
    <nav className="nav-footer">
      <ul className="nav-footer-items">
        <li className="nav-item-effect">
          <Link href="/Home" className={currentRoute === '/Home' ? 'active' : 'nav-link'}>
            <img src="/goal.png" alt="goal" />
          </Link>
        </li>
        <li className="nav-item-effect">
          <Link href="/CoachAdmit" className={currentRoute === '/CoachAdmit' ? 'active' : 'nav-link'}>
            <img src="/ai.png" alt="coach ai page" />
          </Link>
        </li>
        <li className="nav-item-effect">
          <div href="/streak" className={currentRoute === '/streak' ? 'active' : 'nav-link'}>
            <img src="/fire.png" alt="streak page" />
          </div>
        </li>
      </ul>
    </nav>
  );
}

export default FooterApp;
