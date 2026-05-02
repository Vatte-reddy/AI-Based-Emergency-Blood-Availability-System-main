# BloodHub — AI-Based Emergency Blood Allocation

Full-stack project: **React** frontend, **Flask** REST API, **scikit-learn** priority model (`.pkl` via joblib), JSON file storage for donors and requests.

## Folder structure

```
AI-Based-BloodHub/
├── src/                      # React app (CRA)
│   ├── config/api.js         # API base URL helper
│   ├── pages/                # BloodRequest, Dashboard, DonorReg, …
│   └── ...
├── flask_backend/            # NEW — use this instead of Node for APIs
│   ├── app.py
│   ├── requirements.txt
│   ├── routes/
│   │   └── api_routes.py
│   ├── ml_model/
│   │   ├── model_loader.py   # loads joblib; trains default RF if no .pkl
│   │   ├── model_meta.json   # feature order + label names
│   │   └── train_colab_example.py
│   ├── utils/
│   │   ├── blood_compatibility.py
│   │   ├── distance.py
│   │   └── storage.py
│   └── data/                 # donors.json, requests.json (auto-created)
├── backend/                  # Legacy Express + Mongo (optional / old)
└── package.json              # proxy → http://localhost:5000
```

## Run locally

### 1. Flask API (port 5000)

```bash
cd flask_backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

You should see the server on `http://127.0.0.1:5000`. Open `http://127.0.0.1:5000/api/health`.

### 2. React app

```bash
# from project root
npm install
npm start
```

Create React App **proxy** in `package.json` forwards `/api/*` to port **5000**, so `fetch("/api/donors")` works in development.

**If you run the frontend without the proxy** (or use another port), set:

```env
REACT_APP_API_URL=http://localhost:5000
```

in `.env` at the project root.

### 3. Login / routes

Donor registration and blood request pages use **Firebase** auth (`ProtectedRoute`). Sign in, then use **Request** and **Donate**.

---

## REST API summary

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Health check |
| POST | `/api/predict-priority` | ML: LOW / MEDIUM / CRITICAL |
| GET/POST | `/api/find-donors` | Compatible + available donors, sorted by distance |
| POST | `/api/request-blood` | Save request + predict priority + recommend donors + simulated CRITICAL alert |
| GET | `/api/donors` | List donors (seeds demo data if empty) |
| POST | `/api/donors` | Register donor |
| GET | `/api/requests` | List saved requests |

---

## Example requests / responses

### POST `/api/predict-priority`

**Request body:**

```json
{
  "age": 42,
  "condition_severity": 5,
  "time_required_hours": 2,
  "units_needed": 2
}
```

**Response (example):**

```json
{
  "priority": "CRITICAL",
  "priority_code": 2,
  "probabilities": {
    "LOW": 0.02,
    "MEDIUM": 0.11,
    "CRITICAL": 0.87
  }
}
```

### GET `/api/find-donors?bloodGroup=O%2B&location=Delhi`

**Response (shape):**

```json
{
  "bloodGroup": "O+",
  "location": "Delhi",
  "count": 2,
  "donors": [
    {
      "name": "Riya Sharma",
      "bloodGroup": "O+",
      "phone": "9876500001",
      "location": "Delhi NCR",
      "availability": true,
      "distanceKm": 12.4,
      "compatibilityNote": "O+ can supply O+ need"
    }
  ]
}
```

### POST `/api/request-blood`

**Request body (minimal + ML fields):**

```json
{
  "patientName": "A. Kumar",
  "bloodGroup": "O+",
  "phone": "9876543210",
  "location": "Delhi",
  "urgency": "Urgent",
  "patientCondition": "trauma",
  "patientAge": 38,
  "conditionSeverity": 4,
  "timeRequiredHours": 4,
  "unitsNeeded": 2,
  "hospital": "City Hospital",
  "additionalNotes": "OT standby"
}
```

**Response (shape):**

```json
{
  "request": {
    "id": "...",
    "patientName": "A. Kumar",
    "predictedPriority": "CRITICAL",
    "alerts": { "critical": true, "message": "...", "simulated_channels": ["sms", "email", "dashboard_push"] },
    "status": "Pending",
    "createdAt": "..."
  },
  "prediction": { "priority": "CRITICAL", "priority_code": 2, "probabilities": { ... } },
  "recommendedDonors": [ { "name": "...", "distanceKm": 5.2, ... } ],
  "alerts": { "critical": true, ... }
}
```

---

## Bring your own Colab model

1. In Colab, train **sklearn** `RandomForestClassifier` or `LogisticRegression` with **numeric** features only (or use a `ColumnTransformer` saved inside a `Pipeline`).

2. **Feature order** must match `flask_backend/ml_model/model_meta.json`:

   - `age`
   - `condition_severity`
   - `time_required_hours`
   - `units_needed`

3. **Labels** must be encoded as integers `0, 1, 2` mapping to `LOW`, `MEDIUM`, `CRITICAL` (same order as `label_classes` in `model_meta.json`). If your encoding differs, update `model_meta.json` to match.

4. Export:

```python
import joblib
joblib.dump(model, "priority_model.pkl")
```

5. Download `priority_model.pkl` into `flask_backend/ml_model/` (replace the auto-generated file if present).

6. Restart Flask.

If the model expects different column names, either rename features in Flask before calling `predict`, or retrain with the names above.

---

## Legacy Node backend

The older **Express + MongoDB** app remains under `backend/`. This project’s **AI BloodHub** flow is implemented in **`flask_backend/`**. Use one stack at a time to avoid port conflicts (both default to 5000).

---

## Ideas for stronger academic / demo impact

- **Explainability:** SHAP or permutation importance for the priority model; show “top 3 reasons” in the UI.
- **Second model:** survival / wait-time regression (“expected time to fulfill”) trained on historical requests.
- **Fairness / ethics:** audit priority rules across age groups; document limitations (not for real clinical decisions).
- **Geocoding:** replace hash-based coordinates with OpenStreetMap / Google Geocoding API for real distances.
- **Queue optimization:** linear assignment (Hungarian algorithm) to globally match multiple requests to donors.
- **Time series:** forecast regional demand spikes (ARIMA / Prophet) for inventory alerts.
