import React, { useState } from "react";
import { Heart, Smile, Check, ChevronDown } from "lucide-react";
import "../styles/Home.css";
import heroImg from "../assets/blueb2.jpg";
import Footer from "../components/Footer";

function Home({ user }) {
  const [openFaq, setOpenFaq] = useState(null);

  const getFirstName = () => {
    if (!user) return "";
    const name = user.name || user.email?.split("@")[0] || "Donor";
    return name.split(" ")[0]; // just grab first name
  };

  const name = getFirstName();

  return (
    <div className="home-wrapper">
      <div className="home-hero-card">
        <div className="home-hero-content">
          <div className="home-hero-text">
            <h1 className="hero-heading">
              {user ? `Hello ${name},` : "Every Drop"}
              <br />
              {user ? "Every Drop Counts" : "Counts"}
            </h1>
            <p className="hero-subtext">
              BloodHub is a smart platform for blood donation and<br />
              requests. It connects donors with patients in real-time,<br />
              ensuring quick and reliable access to blood during<br />
              emergencies.
              {user && (
                <span className="hero-thanks-text">
                  Thank you for being an active part of our community. Your engagement saves lives.
                </span>
              )}
            </p>
            <div style={{ marginTop: "32px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <button 
                onClick={() => window.location.href = "/donate"}
                className="hero-primary-btn"
              >
                Register as Donor
              </button>
              <button 
                onClick={() => window.location.href = "/request"}
                className="hero-secondary-btn"
              >
                Request Blood
              </button>
            </div>
          </div>
          <div className="home-hero-image-wrapper">
            <img src={heroImg} alt="Blood Donation" className="hero-img-styled" />
          </div>
        </div>
      </div>

      <div className="benefits-section" id="about">
        <h2 className="section-title">Benefits of Donating Blood</h2>
        <div className="benefits-container">
          <div className="benefits-col benefits-left">
            <Heart className="benefit-icon" color="#1659e6" size={28} />
            <h3 style={{ marginTop: '12px', marginBottom: '16px', color: '#1e293b', fontSize: '20px' }}>Health Boost</h3>
            <ul className="benefit-list">
              <li><Check size={16} color="#1659e6" /> Free health screening and blood tests before donating</li>
              <li><Check size={16} color="#1659e6" /> Reduces risk of heart disease by maintaining iron levels</li>
              <li><Check size={16} color="#1659e6" /> Stimulates production of new blood cells</li>
              <li><Check size={16} color="#1659e6" /> Burns calories and promotes overall health</li>
            </ul>
          </div>
          <div className="benefits-col benefits-right">
            <Smile className="benefit-icon" color="#1659e6" size={28} />
            <h3 style={{ marginTop: '12px', marginBottom: '16px', color: '#1e293b', fontSize: '20px' }}>Emotional Uplift</h3>
            <ul className="benefit-list">
              <li><Check size={16} color="#10b981" /> Feel-good knowing you've helped save lives</li>
              <li><Check size={16} color="#10b981" /> Boost mental wellbeing through altruistic action</li>
              <li><Check size={16} color="#10b981" /> Connect with a community of caring individuals</li>
              <li><Check size={16} color="#10b981" /> Create a positive impact on society</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Home;