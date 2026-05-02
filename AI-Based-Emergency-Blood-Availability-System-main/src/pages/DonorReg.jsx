import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Phone, MapPin, Droplet, ArrowRight, CheckCircle, Clock, CalendarDays, Activity, Navigation } from "lucide-react";
import "../styles/DonorReg.css";
import { apiUrl } from "../config/api";
import ToastNotification from "../components/ToastNotification";
import DonorList from "../components/DonorList";
import useGeolocation from "../hooks/useGeolocation";

function DonorReg({ setDonors, donors = [], user }) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bloodType: "",
    phone: "",
    city: "",
    state: "",
    age: "",
    gender: "",
    medicalHistory: "",
    availability: true,
    Recency: "",
    Frequency: "",
    Monetary: "",
    Time: ""
  });

  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { location: geoLoc, error: geoError, loading: geoLoading, fetchLocation } = useGeolocation();
  const [gpsRequested, setGpsRequested] = useState(false);

  const addToast = (message, type) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Re-added helper icons for the Detect Location button
  const CheckCircle = ({ size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
  );

  // Effect to handle ONE-TIME coordinate snap ONLY when fetchLocation is explicitly clicked
  React.useEffect(() => {
    if (gpsRequested && geoLoc && geoLoading === false) {
      setFormData((prev) => ({ 
        ...prev, 
        location: geoLoc.city || prev.location
      }));
      addToast("Location snapped from GPS!", "success");
      setGpsRequested(false); 
    }
  }, [geoLoc, geoLoading, gpsRequested]);
  
  React.useEffect(() => {
    if (geoError && gpsRequested) {
      addToast(geoError, "error");
      setGpsRequested(false);
    }
  }, [geoError, gpsRequested]);

  const validateStep1 = () => {
    if (!formData.name.trim() || formData.name.length < 3) {
      addToast("Please enter a valid full name.", "error"); return false;
    }
    if (!formData.age || formData.age < 18 || formData.age > 65) {
      addToast("Age must be between 18 and 65 years.", "error"); return false;
    }
    if (!formData.gender) {
      addToast("Please select your gender.", "error"); return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.bloodType) {
      addToast("Blood group is required.", "error"); return false;
    }
    if (!formData.phone || formData.phone.length !== 10) {
      addToast("Please enter a valid 10-digit phone number.", "error"); return false;
    }
    if (!formData.city.trim()) {
      addToast("City is required.", "error"); return false;
    }
    if ([formData.Recency, formData.Frequency, formData.Monetary, formData.Time].some((v) => v === "")) {
      addToast("Please complete your donation history.", "error"); return false;
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep !== 2 || !validateStep2()) return;

    setLoading(true);

    const donorPayload = {
      name: formData.name.trim(),
      email: user?.email || "",
      bloodGroup: formData.bloodType,
      phone: formData.phone,
      city: formData.city.trim(),
      state: formData.state.trim(),
      age: parseInt(formData.age),
      gender: formData.gender,
      medicalHistory: formData.medicalHistory || "None",
      availability: false,
      Recency: Number(formData.Recency || 0),
      Frequency: Number(formData.Frequency || 1),
      Monetary: Number(formData.Monetary || 250),
      Time: Number(formData.Time || 0)
    };

    try {
      const response = await fetch(apiUrl("/api/donors/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donorPayload),
      });

      if (!response.ok) {
        throw new Error(`Registration failed: ${response.statusText}`);
      }

      const result = await response.json();
      const newDonor = result.donor || result;
      
      if (typeof setDonors === "function") {
        setDonors((prev) => [newDonor, ...prev]);
      }

      const prob = result.likelihood ?? newDonor.responseProbability ?? 0;
      let likelihoodText = "Highly Likely to Donate";
      if (prob < 0.4) likelihoodText = "Less Likely to Donate";
      else if (prob < 0.7) likelihoodText = "Likely to Donate";
      
      addToast(`Successfully registered! Donor Likelihood: ${likelihoodText}`, "success");
      
      // Clear form on success
      setCurrentStep(1);
      setFormData({
        name: user?.name || "",
        bloodType: "",
        phone: "",
        city: "",
        state: "",
        age: "",
        gender: "",
        medicalHistory: "",
        availability: true,
        Recency: "",
        Frequency: "",
        Monetary: "",
        Time: ""
      });

    } catch (err) {
      console.error("Registration failed:", err);
      addToast(err.message || "Failed to connect to server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteDonor = async (id) => {
    try {
      const response = await fetch(apiUrl(`/api/donors/${id}`), {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete donor from server.");
      }

      if (typeof setDonors === "function") {
        setDonors((prev) => prev.filter(d => (d.id || d._id) !== id));
        addToast("Donor entry deleted permanently", "success");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      addToast("Failed to delete donor entry.", "error");
    }
  };

  return (
    <div className="donor-module-wrapper">
      <ToastNotification toasts={toasts} removeToast={removeToast} />
      
      <motion.div 
        className="donor-form-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="card-header">
          <h2>Donor Registration</h2>
          <p>Join the community and save lives today.</p>
        </div>

        <div className="progress-indicator">
          <div className={`progress-step ${currentStep === 1 ? "active" : ""} ${currentStep > 1 ? "completed" : ""}`}>
            <span className="step-num">{currentStep > 1 ? "✓" : "1"}</span>
            <span className="step-text">Personal</span>
          </div>
          <div className={`progress-line ${currentStep >= 2 ? "active" : ""}`}></div>
          <div className={`progress-step ${currentStep === 2 ? "active" : ""} ${currentStep > 2 ? "completed" : ""}`}>
            <span className="step-num">{currentStep > 2 ? "✓" : "2"}</span>
            <span className="step-text">Contact</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="clean-form">
          {currentStep === 1 && (
            <motion.div
              className="step-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="input-group">
                <label>Full Name</label>
                <div className="modern-input">
                  <User size={18} />
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="Enter full name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>

              <div className="input-split">
                <div className="input-group">
                  <label>Age</label>
                  <div className="modern-input">
                    <input 
                      type="number" 
                      name="age" 
                      placeholder="25" 
                      min="18" 
                      max="65" 
                      value={formData.age} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>
                
                <div className="input-group">
                  <label>Gender</label>
                  <div className="modern-input">
                    <select name="gender" value={formData.gender} onChange={handleChange} required>
                      <option value="" disabled>Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label>Medical History <span className="optional">(Optional)</span></label>
                <div className="modern-input textarea">
                  <textarea 
                    name="medicalHistory" 
                    placeholder="Any health conditions..." 
                    value={formData.medicalHistory} 
                    onChange={handleChange} 
                    rows={2} 
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              className="step-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="input-split">
                <div className="input-group">
                  <label>Blood Group</label>
                  <div className="modern-input">
                    <Droplet size={18} className="blood-icon"/>
                    <select name="bloodType" value={formData.bloodType} onChange={handleChange} required>
                      <option value="" disabled>Select Type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
                <div className="input-group">
                  <label>Phone Number</label>
                  <div className="modern-input">
                    <Phone size={18} />
                    <input 
                      type="tel" 
                      name="phone" 
                      placeholder="10-digit number" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10)})} 
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="input-split">
                <div className="input-group">
                  <label>Town / City</label>
                  <div className="modern-input">
                    <MapPin size={18} />
                    <input 
                      type="text" 
                      name="city" 
                      placeholder="e.g. Hyderabad" 
                      value={formData.city} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label>State</label>
                  <div className="modern-input">
                    <input 
                      type="text" 
                      name="state" 
                      placeholder="e.g. Telangana" 
                      value={formData.state} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="history-grid">
                <div className="input-group card-styled">
                  <label>Recency <span className="sub">(Months)</span></label>
                  <div className="modern-input">
                    <Clock size={16}/>
                    <input type="number" min="0" name="Recency" value={formData.Recency} onChange={handleChange} placeholder="0" required />
                  </div>
                </div>
                <div className="input-group card-styled">
                  <label>Frequency <span className="sub">(Total)</span></label>
                  <div className="modern-input">
                    <Activity size={16}/>
                    <input type="number" min="1" name="Frequency" value={formData.Frequency} onChange={handleChange} placeholder="1" required />
                  </div>
                </div>
                <div className="input-group card-styled">
                  <label>Monetary <span className="sub">(cc)</span></label>
                  <div className="modern-input">
                    <Droplet size={16}/>
                    <input type="number" min="1" name="Monetary" value={formData.Monetary} onChange={handleChange} placeholder="250" required />
                  </div>
                </div>
                <div className="input-group card-styled">
                  <label>Time <span className="sub">(First don.)</span></label>
                  <div className="modern-input">
                    <CalendarDays size={16}/>
                    <input type="number" min="0" name="Time" value={formData.Time} onChange={handleChange} placeholder="0" required />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="form-actions-row">
            {currentStep === 2 && (
              <button type="button" className="btn-secondary" onClick={prevStep}>
                Back
              </button>
            )}
            {currentStep === 1 ? (
              <button type="button" className="btn-primary" onClick={nextStep}>
                Continue <ArrowRight size={18}/>
              </button>
            ) : (
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? "Processing..." : "Register as Donor"}
              </button>
            )}
          </div>
        </form>
      </motion.div>

      <DonorList donors={donors} user={user} onDelete={deleteDonor} />
    </div>
  );
}

export default DonorReg;