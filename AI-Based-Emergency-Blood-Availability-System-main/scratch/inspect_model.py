import joblib
import os

MODEL_PATH = r"c:\Users\abhin\Downloads\Telegram Desktop\32_project\322026_project\AI-Based-BloodHub\backend\ml_model\blood_model.pkl"

if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)
        print(f"Model Type: {type(model)}")
        if hasattr(model, "estimators_"):
             print(f"Number of estimators: {len(model.estimators_)}")
    except Exception as e:
        print(f"Error loading model: {e}")
else:
    print("Model not found")
