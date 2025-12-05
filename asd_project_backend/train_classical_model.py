import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier
import pickle
import os

# Load your dataset
df = pd.read_csv("train.csv")

# ---------------------------
# 1. DROP UNUSED COLUMNS
# ---------------------------
df = df[[
    "A1_Score","A2_Score","A3_Score","A4_Score","A5_Score",
    "A6_Score","A7_Score","A8_Score","A9_Score","A10_Score",
    "age","gender","ethnicity","jaundice","relation",
    "used_app_before",
    "Class/ASD"
]]

# ---------------------------
# 2. Separate features/labels
# ---------------------------
X = df.drop("Class/ASD", axis=1)
y = df["Class/ASD"].astype(int)

# ---------------------------
# 3. Label Encoding
# ---------------------------
encoders = {}
cat_cols = X.select_dtypes(include="object").columns

for col in cat_cols:
    enc = LabelEncoder()
    X[col] = enc.fit_transform(X[col].astype(str))
    encoders[col] = enc

# ---------------------------
# 4. Imputer and Scaler
# ---------------------------
imputer = SimpleImputer(strategy="median")
X_imputed = imputer.fit_transform(X)

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_imputed)

# ---------------------------
# 5. Train Random Forest
# ---------------------------
model = RandomForestClassifier(
    n_estimators=300,
    max_depth=12,
    random_state=42
)
model.fit(X_scaled, y)

print("Training Accuracy:", model.score(X_scaled, y))

# ---------------------------
# 6. Save models
# ---------------------------
SAVE_DIR = "saved_models"
os.makedirs(SAVE_DIR, exist_ok=True)

pickle.dump(model, open(f"{SAVE_DIR}/best_model.pkl", "wb"))
pickle.dump(imputer, open(f"{SAVE_DIR}/imputer.pkl", "wb"))
pickle.dump(scaler, open(f"{SAVE_DIR}/scaler.pkl", "wb"))
pickle.dump(encoders, open(f"{SAVE_DIR}/encoders.pkl", "wb"))
pickle.dump(list(X.columns), open(f"{SAVE_DIR}/feature_order.pkl", "wb"))

print("Model saved successfully!")
