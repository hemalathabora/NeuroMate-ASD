import pandas as pd
import numpy as np
import pickle
import os

from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier

# =============================
# SETTINGS
# =============================

MODEL_DIR = "saved_models"
os.makedirs(MODEL_DIR, exist_ok=True)

# Option-B features (12)
FEATURES = [
    "social", "communication", "hyperactivity",
    "repetitive", "sensory", "learning",
    "age", "gender", "country", "ethnicity",
    "jaundice", "relation", "used_app_before"
]

TARGET = "class_asd"   # cleaned column name

# =============================
# LOAD ORIGINAL CSV
# =============================
df = pd.read_csv("train.csv")

# Clean column names (lowercase, replace special chars)
df.columns = df.columns.str.lower().str.replace("/", "_").str.replace(" ", "_")

# Rename incorrect columns
rename_map = {
    "contry_of_res": "country",
    "class_asd": "class_asd",   # already OK after cleaning
    "gender": "gender",
    "age": "age",
    "ethnicity": "ethnicity",
    "relation": "relation",
    "jaundice": "jaundice",
    "used_app_before": "used_app_before",
}

df = df.rename(columns=rename_map)

# Ensure target column exists
if "class_asd" not in df.columns:
    raise Exception("ERROR: 'class_asd' column not found. Check your CSV.")

# =============================
# CREATE CATEGORY SCORES FROM A1–A6
# =============================
df["social"]        = df["a1_score"]
df["communication"] = df["a2_score"]
df["hyperactivity"] = df["a3_score"]
df["repetitive"]    = df["a4_score"]
df["sensory"]       = df["a5_score"]
df["learning"]      = df["a6_score"]

# =============================
# SELECT Option-B FEATURES
# =============================
X = df[FEATURES]
y = df["class_asd"]

# =============================
# ENCODE CATEGORICAL FEATURES
# =============================
cat_cols = ["gender", "country", "ethnicity", "relation", "jaundice", "used_app_before"]

encoders = {}

for col in cat_cols:
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col].astype(str))
    encoders[col] = le

# =============================
# IMPUTER + SCALER
# =============================
imputer = SimpleImputer(strategy="most_frequent")
X_imputed = imputer.fit_transform(X)

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_imputed)

# =============================
# TRAIN CLASSICAL MODEL
# =============================
clf = RandomForestClassifier(n_estimators=250, random_state=42)
clf.fit(X_scaled, y)

# =============================
# SAVE ARTIFACTS
# =============================
with open(os.path.join(MODEL_DIR, "encoders.pkl"), "wb") as f:
    pickle.dump(encoders, f)

with open(os.path.join(MODEL_DIR, "imputer.pkl"), "wb") as f:
    pickle.dump(imputer, f)

with open(os.path.join(MODEL_DIR, "scaler.pkl"), "wb") as f:
    pickle.dump(scaler, f)

with open(os.path.join(MODEL_DIR, "best_model.pkl"), "wb") as f:
    pickle.dump(clf, f)

with open(os.path.join(MODEL_DIR, "feature_order.pkl"), "wb") as f:
    pickle.dump(FEATURES, f)

print("================================================")
print(" Training Completed Successfully! ")
print("================================================")
print("Saved: encoders.pkl, imputer.pkl, scaler.pkl, best_model.pkl, feature_order.pkl")
