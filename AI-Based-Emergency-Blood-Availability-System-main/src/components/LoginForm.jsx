import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

function LoginForm({
  email, setEmail,
  password, setPassword,
  onSubmit, onGoogle, loading, error, success, switchTab
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [passInputType, setPassInputType] = useState("text");
  
  // States to control readOnly attribute to prevent autofill
  const [emailReadOnly, setEmailReadOnly] = useState(true);
  const [passReadOnly, setPassReadOnly] = useState(true);

  return (
    <form className="auth-form-centered" onSubmit={onSubmit} autoComplete="off">
      {/* Honeypot fields to trick browser autofill */}
      <div style={{ position: "absolute", opacity: 0, height: 0, overflow: "hidden", pointerEvents: "none" }}>
        <input type="text" name="fake_user_name_prevent_autofill" tabIndex="-1" />
        <input type="password" name="fake_password_prevent_autofill" tabIndex="-1" />
      </div>

      <div className="form-group">
        <label className="ui-label">Email Address</label>
        <div className="input-wrapper-ui">
          <Mail size={18} className="input-icon-ui" />
          <input
            type="text"
            name="user_email_field"
            placeholder="name@gmail.com"
            value={email || ""}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setEmailReadOnly(false)}
            onMouseDown={() => setEmailReadOnly(false)}
            readOnly={emailReadOnly}
            required
            autoComplete="off"
            className="input-field-ui"
          />
        </div>
      </div>

      <div className="form-group">
        <div className="password-label-row">
          <label className="ui-label">Password</label>
          <a href="#" className="forgot-password-link">Forgot password?</a>
        </div>
        <div className="input-wrapper-ui">
          <Lock size={18} className="input-icon-ui" />
          <input
            type={showPassword ? "text" : passInputType}
            name="user_password_field"
            placeholder="Enter your password"
            value={password || ""}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => {
              setPassInputType("password");
              setPassReadOnly(false);
            }}
            onMouseDown={() => {
              setPassInputType("password");
              setPassReadOnly(false);
            }}
            readOnly={passReadOnly}
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

      {error && <div className="error-message-ui">{error}</div>}
      {success && <div className="success-message-ui">{success}</div>}

      <button type="submit" className="auth-submit-btn-ui" disabled={loading}>
        {loading ? <div className="loading-spinner"></div> : (
          <>
            Continue <ArrowRight size={18} style={{ marginLeft: "8px" }}/>
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
        Don't have an account? <span className="join-link" onClick={switchTab}>Join Now</span>
      </div>
    </form>
  );
}

export default LoginForm;
