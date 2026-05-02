import React from "react";
import { 
  ArrowRight,
  Activity, 
  Users, 
  TrendingUp, 
  FileText, 
  ShieldCheck, 
  Grid,
  AlertCircle,
  Database,
  BarChart,
  UserPlus,
  Settings,
  Mail
} from "lucide-react";
import heroImg from "../assets/about_hero.png"; 
import "../styles/About.css";

function About() {
  return (
    <div className="about-wrapper">
      
      {/* 1. Hero Section */}
      <div className="about-hero">
        <div className="about-hero-text">
          <h1 className="about-hero-heading">
            Smart Blood<br />
            Management<br />
            System
          </h1>
          <p className="about-hero-subtext">
            Organizing blood requests and donor data efficiently using technology
          </p>
        </div>
        <div className="about-hero-image-wrapper">
          {/* Reusing existing hero image as placeholder */}
          <img src={heroImg} alt="Smart Blood Management" className="about-hero-img" />
        </div>
      </div>

      {/* 2. Intelligent Features */}
      <div className="features-section">
        <h2 className="features-title">Intelligent Features</h2>
        <div className="features-pill">
          <BarChart size={14} /> AI-powered insights
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Activity size={24} color="#1659e6" />
            </div>
            <h3 className="feature-card-title">Emergency Prioritization</h3>
            <p className="feature-card-desc">
              Automatically flags and prioritizes requests based on urgency and historical patterns.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Users size={24} color="#1659e6" />
            </div>
            <h3 className="feature-card-title">Donor Likelihood</h3>
            <p className="feature-card-desc">
              Predicts the probability of a successful donation based on past availability and behavior.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Mail size={24} color="#1659e6" />
            </div>
            <h3 className="feature-card-title">Instant Email Alerts</h3>
            <p className="feature-card-desc">
              Donors receive automated email notifications when matched, providing requester details for immediate coordination.
            </p>
          </div>
        </div>
      </div>

      {/* 3. The Problem vs Our Solution */}
      <div className="problem-solution-section">
        <div className="ps-col">
          <h2 className="ps-title">The Problem</h2>
          <div className="ps-list">
            <div className="ps-item">
              <AlertCircle className="ps-icon-problem" size={24} />
              Unorganized blood request tracking
            </div>
            <div className="ps-item">
              <Database className="ps-icon-problem" size={24} />
              Difficulty managing donor data securely and efficiently
            </div>
            <div className="ps-item">
              <Activity className="ps-icon-problem" size={24} />
              No clear prioritization for urgent cases
            </div>
          </div>
        </div>

        <div className="ps-col">
          <h2 className="ps-title">Our Solution</h2>
          <div className="ps-list">
            <div className="ps-item solution-item">
              <FileText className="ps-icon-solution" size={24} />
              Structured blood request management workflow
            </div>
            <div className="ps-item solution-item">
              <ShieldCheck className="ps-icon-solution" size={24} />
              Centralized and secure donor database
            </div>
            <div className="ps-item solution-item">
              <Grid className="ps-icon-solution" size={24} />
              Real-time dashboard for monitoring activity
            </div>
          </div>
        </div>
      </div>

      {/* 4. How It Works */}
      <div className="how-it-works-section">
        <h2 className="hiw-title">How It Works</h2>
        <p className="hiw-subtitle">A streamlined approach to blood management</p>
        
        <div className="hiw-grid">
          <div className="hiw-card">
            <div className="hiw-number">1</div>
            <div className="hiw-icon-wrapper">
              <UserPlus size={28} />
            </div>
            <h3 className="hiw-card-title">Login / Register</h3>
            <p className="hiw-card-desc">Secure access for verified users and administrators.</p>
          </div>

          <div className="hiw-card">
            <div className="hiw-number">2</div>
            <div className="hiw-icon-wrapper">
              <FileText size={28} />
            </div>
            <h3 className="hiw-card-title">Add or View Requests</h3>
            <p className="hiw-card-desc">Input new blood requirements or browse the active database.</p>
          </div>

          <div className="hiw-card">
            <div className="hiw-number">3</div>
            <div className="hiw-icon-wrapper">
              <Settings size={28} />
            </div>
            <h3 className="hiw-card-title">System Organizes</h3>
            <p className="hiw-card-desc">Data is intelligently categorized, prioritized, and matched.</p>
          </div>

          <div className="hiw-card">
            <div className="hiw-number">4</div>
            <div className="hiw-icon-wrapper">
              <Grid size={28} />
            </div>
            <h3 className="hiw-card-title">Dashboard Insights</h3>
            <p className="hiw-card-desc">Administrators act on categorized data through a comprehensive view.</p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default About;
