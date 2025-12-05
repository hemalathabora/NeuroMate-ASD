import pandas as pd
import numpy as np
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier

# ============================
# Load Data
# ============================
df = pd.read_csv("train.csv")

# ============================
# Create Adaptive Categories
# ============================
# Map A1–A10 into adaptive categories
social_cols = ["A1_Score", "A2_Score"]
communication_cols = ["A3_Score", "A4_Score"]
hyper_cols = ["A5_Score", "A6_Score"]
repetitive_cols = ["A7_Score"]
sensory_cols = ["A8_Score"]
learning_cols = ["A9_Score", "A10_Score"]

df["social"] = df[social_cols].sum(axis=1)
df["communication"] = df[communication_cols].sum(axis=1)
df["hyperactivity"] = df[hyper_cols].sum(axis=1)
df["repetitive"] = df[repetitive_cols].sum(axis=1)
df["sensory"] = df[sensory_cols].sum(axis=1)
df["learning"] = df[learning_cols].sum(axis=1)

# ============================
# Clean Demographics
# ============================
df = df.rename(columns={
    "contry_of_res": "country",
    "used_app_before": "used_app_before",
    "jaundice": "jaundice",
    "ethnicity": "ethnicity",
    "relation": "relation"
})

df = df[[
    "social", "communication", "hyperactivity", "repetitive", "sensory", "learning",
    "age", "gender", "country", "ethnicity", "jaundice", "relation",
    "Class/ASD"
]].copy()

df = df.dropna()

# ============================
# Encoding Categorical
# ============================
encoders = {}
cat_cols = ["gender", "country", "ethnicity", "jaundice", "relation"]

for col in cat_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col].astype(str))
    encoders[col] = le

# ============================
# Split & Train
# ============================
X = df.drop("Class/ASD", axis=1)
y = df["Class/ASD"]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42
)

model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

accuracy = model.score(X_test, y_test)
print("Adaptive Model Accuracy:", accuracy)

# ============================
# Save Artifacts
# ============================
os.makedirs("saved_models", exist_ok=True)

pickle.dump(model, open("saved_models/classical.pkl", "wb"))
pickle.dump(scaler, open("saved_models/scaler.pkl", "wb"))
pickle.dump(encoders, open("saved_models/encoders.pkl", "wb"))

feature_order = list(X.columns)
pickle.dump(feature_order, open("saved_models/feature_order.pkl", "wb"))

print("Adaptive model saved successfully!")
