import joblib, os

MODEL_DIR = "saved_models"

enc = joblib.load(os.path.join(MODEL_DIR, "encoders.pkl"))
feat = joblib.load(os.path.join(MODEL_DIR, "feature_order.pkl"))

print("Encoders loaded:", enc.keys())
print("Feature order length:", len(feat))
print("Feature order:", feat)
