# AI-Based Emergency Blood Availability System Documentation

## 1. Short Abstract
The **AI-Based Emergency Blood Availability System** (also known as **BloodHub**) is a comprehensive full-stack solution designed to bridge the critical gap between blood donors and patients during medical emergencies. By integrating machine learning models, the system moves beyond simple database searches to provide intelligent donor matching and request prioritization. It analyzes donor history using RFMT (Recency, Frequency, Monetary, Time) metrics to predict donation likelihood and evaluates patient clinical data (age, condition severity, units needed) to categorize blood requests into LOW, MEDIUM, or CRITICAL priority levels. The platform ensures rapid communication through automated alerts and geospatial sorting, ensuring that life-saving resources reach those in most urgent need first.

---

## 2. System and Hardware Requirements

### Software Requirements
- **Operating System:** Windows 10/11, macOS, or Linux (Ubuntu 20.04+ recommended).
- **Frontend Environment:** Node.js (v16.0 or higher) and npm/yarn.
- **Backend Environment:** 
  - Node.js/Express (Utility Layer)
  - Python 3.8+ (AI Inference Layer & Flask Backend)
- **Database:** MongoDB (for persistent storage) or local JSON storage (for lightweight deployment).
- **AI Libraries:** Scikit-learn, Joblib, NumPy, Pandas.
- **Authentication:** Firebase Authentication.
- **Version Control:** Git.

### Hardware Requirements
- **Processor:** Dual-core 2.4GHz or higher (Quad-core recommended for ML training).
- **Memory (RAM):** Minimum 8 GB (16 GB recommended for running multiple servers and ML models simultaneously).
- **Storage:** 500 MB of available disk space for application files (excluding database growth).
- **Internet:** Stable connection for Firebase Auth and potential remote API calls.

---

## 3. Methodology
The system follows a modular architectural methodology to ensure scalability and separation of concerns:

### A. Data Modeling & AI Analytics
1. **Donor Likelihood Model:** Implements the **RFMT Model** (Recency: months since last donation, Frequency: total number of donations, Monetary: total units donated, Time: months since first donation) to predict the probability of a donor responding to a request.
2. **Emergency Priority Model:** Utilizes a **Random Forest Classifier** trained on clinical parameters (Age, Severity, Urgency) to assign a priority status to incoming blood requests.

### B. Matching Algorithm
The system employs a **Geospatial Compatibility Algorithm**:
- **Blood Compatibility:** Filters donors based on medical compatibility rules (e.g., O- as universal donor).
- **Proximity Calculation:** Uses the **Haversine formula** to calculate the Great-circle distance between the requester's hospital and the donor's location, sorting results by proximity.

### C. System Architecture
- **Frontend:** React-based Single Page Application (SPA) with state management for real-time dashboards.
- **Backend Integration:** A hybrid approach using Node.js for utility services and Flask for AI/ML inference, connected via RESTful APIs.

---

## 4. Implementation Process

### Phase 1: Frontend Development
- Developed responsive UI components for donor registration and blood request forms.
- Integrated **Firebase Authentication** for secure user login and profile management.
- Built a requester dashboard to track the status of blood requests in real-time.

### Phase 2: Backend & Database Setup
- Configured **Express.js** and **Flask** servers to handle data routing.
- Implemented file-based (JSON) or MongoDB schemas to store donor demographics and request history.
- Created API endpoints for donor lookup, request submission, and health monitoring.

### Phase 3: AI Integration
- Exported trained Scikit-learn models as `.pkl` files using **Joblib**.
- Developed a **Python Bridge** within the backend to receive inputs from the web UI, run them through the ML model, and return predictions (Priority/Likelihood) in JSON format.

### Phase 4: Notification & Deployment
- Integrated **Nodemailer** for automated email alerts to donors when a "CRITICAL" match is found.
- Configured the development environment with a proxy to allow seamless communication between the React frontend and the Flask AI backend.
