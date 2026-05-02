import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Globe, Share2, Users, Heart } from 'lucide-react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        
        {/* Left Section - Brand */}
        <div className="footer-brand">
          <div className="footer-logo">
            <Heart size={28} color="#1659e6" strokeWidth={2.5} />
            <span>BloodHub</span>
          </div>
          <p className="footer-tagline">
            India's most advanced blood donation platform, connecting donors with patients through intelligent matching and secure management.
          </p>
        </div>

        {/* Center Section 1 - Quick Links */}
        <div className="footer-nav-col">
          <h4 className="footer-title">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/donate">Donate Blood</Link></li>
            <li><Link to="/request">Request Blood</Link></li>
          </ul>
        </div>

        {/* Center Section 2 - Support */}
        <div className="footer-nav-col">
          <h4 className="footer-title">Support</h4>
          <ul className="footer-links">
            <li><Link to="/help">Help Center</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
          </ul>
        </div>

        {/* Right Section - Contact Details */}
        <div className="footer-contact">
          <h4 className="footer-title">Contact Us</h4>
          <ul className="contact-list">
            <li>
              <Mail size={16} className="contact-icon" />
              <span>Contact:&nbsp; <a href="mailto:bloodhubproject@gmail.com">bloodhubproject@gmail.com</a></span>
            </li>
            <li>
              <Phone size={16} className="contact-icon" />
              <a href="tel:+911800BLOOD">+91-1800-BLOOD</a>
            </li>
            <li>
              <MapPin size={16} className="contact-icon" />
              <span>Hyderabad, India</span>
            </li>
          </ul>

          <h5 className="social-title">Follow Us</h5>
          <div className="social-icons">
            <a href="#" className="social-icon"><Globe size={16} /></a>
            <a href="#" className="social-icon"><Share2 size={16} /></a>
            <a href="#" className="social-icon"><Users size={16} /></a>
          </div>
        </div>
      </div>

      <div className="footer-divider"></div>
      
      <div className="footer-bottom">
        <p>© 2026 BloodHub. All rights reserved.</p>
        <div className="footer-bottom-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/cookies">Cookie Policy</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;