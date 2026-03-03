import { useContext } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import { ThemeContext } from "../Context/ThemeProvider";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

const Layout = () => {
  const { toggleTheme, theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <div className={theme}>
      <header className="header-strip">
        <h1 className="site-title">JOB TRACKER</h1>

        <nav className="nav-links">
          <Link to="/">Dashboard</Link>
          {!isLoggedIn ? (
            <Link to="/login">Jobs</Link>
          ) : (
            <Link to={`/${localStorage.getItem("username")}/jobs`}>Jobs</Link>
          )}
          {!isLoggedIn ? (
            <Link to="/login">Login/Sign Up</Link>
          ) : (
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          )}

          {/* Theme Toggle Icon */}
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? (
              <MoonIcon className="theme-icon" />
            ) : (
              <SunIcon className="theme-icon" />
            )}
          </button>
        </nav>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;