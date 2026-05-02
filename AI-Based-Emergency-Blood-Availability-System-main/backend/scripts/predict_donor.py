import sys
import json
import joblib
import pandas as pd
import os

# Set base path to the directory of this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "ml_model", "blood_model.pkl")
META_PATH = os.path.join(BASE_DIR, "..", "ml_model", "blood_model_meta.json")

def load_meta():
    with open(META_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def predict():
    try:
        # Expecting JSON via stdin: {"Recency": 2, "Frequency": 10, "Monetary": 2500, "Time": 24}
        input_data = json.load(sys.stdin)
        
        meta = load_meta()
        feature_names = meta.get("feature_names", ["Recency", "Frequency", "Monetary", "Time"])
        pos_class = meta.get("positive_class", 1)
        
        # Load model
        model = joblib.load(MODEL_PATH)
        
        # Prepare input DataFrame
        row = {}
        for name in feature_names:
            row[name] = float(input_data.get(name, 0))
            
        df = pd.DataFrame([row])[feature_names]
        
        # Predict
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(df)[0]
            # Prob of positive class
            classes = list(getattr(model, "classes_", [0, 1]))
            if pos_class in classes:
                idx = classes.index(pos_class)
                probability = float(probs[idx])
            else:
                probability = float(probs[1]) if len(probs) > 1 else float(probs[0])
        else:
            pred = model.predict(df)[0]
            probability = 1.0 if int(pred) == int(pos_class) else 0.0
            
        result = {
            "success": True,
            "probability": round(probability, 4),
            "willRespond": bool(probability >= 0.5)
        }
        print(json.dumps(result))
        
    except Exception as e:
        import traceback
        sys.stderr.write(traceback.format_exc())
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    predict()
