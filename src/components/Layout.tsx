import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <main>
      <header className="site-header">
        <div className="brand-wrap">
          <Link to="/" className="brand">
            Tandskadekollen
          </Link>
          <small className="muted">Jamfor tandvardspriser, svarstid och tillganglighet pa ett stalle.</small>
        </div>

        <nav className="nav" aria-label="Huvudnavigation">
          <Link to="/">Sa funkar det</Link>
          <Link to="/compare">Jamfor kliniker</Link>
          <Link to="/clinic">For kliniker</Link>
        </nav>

        <div className="header-cta">
          <Link className="btn btn-primary" to="/request">
            Skapa forfragan
          </Link>
        </div>
      </header>

      <Outlet />

      <Link className="mobile-sticky-cta" to="/request">
        Skapa forfragan
      </Link>
    </main>
  );
}
