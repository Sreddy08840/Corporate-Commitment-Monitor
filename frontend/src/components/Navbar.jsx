import { NavLink } from 'react-router-dom';
import './Navbar.css';

/**
 * Top navigation with links to main pages.
 */
export function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink to="/" className="navbar__brand" end>
          Commitment Monitor
        </NavLink>
        <nav className="navbar__links" aria-label="Main">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `navbar__link${isActive ? ' navbar__link--active' : ''}`
            }
            end
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/companies/new"
            className={({ isActive }) =>
              `navbar__link${isActive ? ' navbar__link--active' : ''}`
            }
          >
            Add Company
          </NavLink>
          <NavLink
            to="/news/new"
            className={({ isActive }) =>
              `navbar__link${isActive ? ' navbar__link--active' : ''}`
            }
          >
            Add News
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
