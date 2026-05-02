import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight } from "lucide-react";

function SignupForm({
  name, setName,
  email, setEmail,
  password, setPassword,
  confirmPassword, setConfirmPassword,
  onSubmit, onGoogle, loading, error, success, switchTab
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [passInputType, setPassInputType] = useState("text");

  return (
    <form className="auth-form-centered" onSubmit={onSubmit} autoComplete="off">
      {/* Honeypot fields to trick browser autofill */}
      <div style={{ position: "absolute", opacity: 0, height: 0, overflow: "hidden", pointerEvents: "none" }}>
        <input type="text" name="fake_user_name_prevent_signup_autofill" tabIndex="-1" />
        <input type="password" name="fake_password_prevent_signup_autofill" tabIndex="-1" />
      </div>

      <div className="form-group">
        <label className="ui-label">Full Name</label>
        <div className="input-wrapper-ui">
          <User size={18} className="input-icon-ui" />
          <input
            type="text"
            name="user_display_name_field"
            placeholder="John Doe"
            value={name || ""}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="off"
            className="input-field-ui"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="ui-label">Email Address</label>
        <div className="input-wrapper-ui">
          <Mail size={18} className="input-icon-ui" />
          <input
            type="email"
            name="user_email_registration_field"
            placeholder="name@gmail.com"
            value={email || ""}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="off"
            className="input-field-ui"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="ui-label">Password</label>
        <div className="input-wrapper-ui">
          <Lock size={18} className="input-icon-ui" />
          <input
            type={showPassword ? "text" : passInputType}
            name="user_new_password_field"
            placeholder="Create a password"
            value={password || ""}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setPassInputType("password")}
            required
            autoComplete="new-password"
            className="input-field-ui"
          />
          <button
            type="button"
            className="password-toggle-ui"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="form-group">
        <label className="ui-label">Confirm Password</label>
        <div className="input-wrapper-ui">
          <Lock size={18} className="input-icon-ui" />
          <input
            type={showPassword ? "text" : passInputType}
            name="user_confirm_password_field"
            placeholder="Repeat password"
            value={confirmPassword || ""}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onFocus={() => setPassInputType("password")}
            required
            autoComplete="new-password"
            className="input-field-ui"
          />
        </div>
      </div>

      {error && <div className="error-message-ui">{error}</div>}
      {success && <div className="success-message-ui">{success}</div>}

      <button type="submit" className="auth-submit-btn-ui" disabled={loading}>
        {loading ? <div className="loading-spinner"></div> : (
          <>
            Create Account <ArrowRight size={18} style={{ marginLeft: "8px" }}/>
          </>
        )}
      </button>

      <div className="ui-separator">
        <span className="ui-separator-line"></span>
        <span className="ui-separator-text">OR</span>
        <span className="ui-separator-line"></span>
      </div>

      <button 
        type="button" 
        className="google-btn-ui" 
        onClick={onGoogle}
        disabled={loading}
      >
        <img 
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
          alt="G" 
          className="google-icon"
        />
        Continue with Google
      </button>

      <div className="join-now-row">
        Already have an account? <span className="join-link" onClick={switchTab}>Sign In</span>
      </div>
    </form>
  );
}

export default SignupForm;
