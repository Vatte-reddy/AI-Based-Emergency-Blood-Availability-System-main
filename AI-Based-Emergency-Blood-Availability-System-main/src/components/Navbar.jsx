import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { Heart } from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";
import "../styles/Navbar.css";

function Navbar({ user }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="navbar-container">
      {/* LEFT - LOGO */}
      <div className="nav-left">
        <Link to="/" className="nav-logo">
          <Heart size={20} fill="white" />
          BloodHub
        </Link>
      </div>

      {/* CENTER - PILL NAVIGATION */}
      <div className="nav-center">
        <div className="nav-pill-container">
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`}
            end
          >
            Home
          </NavLink>
          <NavLink 
            to="/about" 
            className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`}
          >
            About
          </NavLink>
          <NavLink 
            to="/faq" 
            className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`}
          >
            FAQ
          </NavLink>
        </div>
      </div>

      {/* RIGHT - USER INFO OR LOGIN */}
      <div className="nav-right">
        {user ? (
          <ProfileDropdown user={user} handleLogout={handleLogout} />
        ) : (
          <div className="single-auth-container">
            <Link to="/auth" className="auth-single-btn">Login / Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;