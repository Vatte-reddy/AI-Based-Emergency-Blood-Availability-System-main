import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { User as UserIcon, LogOut, LayoutDashboard, HeartPulse, Stethoscope, ChevronDown } from "lucide-react";

function ProfileDropdown({ user, handleLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const closeMenu = () => setIsOpen(false);

  // Fallbacks
  const displayName = user?.name || "Guest";
  const email = user?.email || "";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="profile-wrapper" ref={dropdownRef}>
      <button className="profile-trigger-btn" onClick={() => setIsOpen(!isOpen)}>
        <div className="nav-profile-avatar">{initial}</div>
        <span className="profile-name">{displayName.split(" ")[0]}</span>
        <ChevronDown size={14} className={`profile-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="profile-dropdown-card">
          {/* Top Section - User Info */}
          <div className="profile-dropdown-header">
            <div className="profile-dropdown-avatar">{initial}</div>
            <div className="profile-dropdown-info">
              <span className="profile-dropdown-name">{displayName}</span>
              <span className="profile-dropdown-email">{email}</span>
            </div>
          </div>

          <div className="profile-dropdown-divider"></div>

          {/* Menu Options */}
          <div className="profile-dropdown-menu">
            <Link to="/dashboard" className="profile-menu-item" onClick={closeMenu}>
              <LayoutDashboard size={16} />
              Dashboard
            </Link>

            <Link to="/donate" className="profile-menu-item" onClick={closeMenu}>
              <HeartPulse size={16} />
              Donor Form
            </Link>
            <Link to="/request" className="profile-menu-item" onClick={closeMenu}>
              <Stethoscope size={16} />
              Request Form
            </Link>
          </div>

          <div className="profile-dropdown-divider"></div>

          {/* Logout Section */}
          <div className="profile-dropdown-footer">
            <button
              className="profile-menu-item logout-btn"
              onClick={() => {
                closeMenu();
                handleLogout();
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;
