import os
import pickle
import numpy as np
import pandas as pd

MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_models")


# -----------------------------
# SAFE PICKLE LOADER
# -----------------------------
def load_pickle(filename):
    path = os.path.join(MODEL_DIR, filename)
    with open(path, "rb") as f:
        return pickle.load(f)


# -----------------------------
# LOAD ARTIFACTS (scaler, imputer, classical model)
# -----------------------------
def load_artifacts():
    artifacts = {}

    try:
        artifacts["scaler"] = load_pickle("scaler.pkl")
    except:
        artifacts["scaler"] = None

    try:
        artifacts["imputer"] = load_pickle("imputer.pkl")
    except:
        artifacts["imputer"] = None

    # encoders are optional → but we DO NOT depend on them
    try:
        artifacts["encoders"] = load_pickle("encoders.pkl")
    except:
        artifacts["encoders"] = {}

    try:
        artifacts["feature_order"] = load_pickle("feature_order.pkl")
    except:
        artifacts["feature_order"] = []

    try:
        artifacts["classical"] = load_pickle("best_model.pkl")
    except:
        artifacts["classical"] = None

    return artifacts


# -----------------------------
# NORMALIZE ALL STRING VALUES
# -----------------------------
def normalize_value(val):
    if val is None:
        return "unknown"

    v = str(val).strip().lower()

    replacements = {
        "male": "m",
        "female": "f",
        "yes": "yes",
        "no": "no",
        "true": "yes",
        "false": "no",
        "1": "yes",
        "0": "no"
    }

    return replacements.get(v, v)


# -----------------------------
# SUPER SAFE FEATURE BUILDER
# -----------------------------
def build_feature_dataframe(req_dict, artifacts):
    feature_order = artifacts.get("feature_order", [])
    encoders = artifacts.get("encoders", {})

    row = {}

    # 1️⃣ Normalize all incoming values
    for col in feature_order:
        raw_val = req_dict.get(col, None)
        row[col] = normalize_value(raw_val)

    df = pd.DataFrame([row])

    # 2️⃣ Apply encoders only if valid
    for col, encoder in encoders.items():
        if col in df.columns:
            try:
                df[col] = df[col].apply(
                    lambda x: encoder.transform([x])[0] if x in encoder.classes_ else -1
                )
            except:
                df[col] = -1

    # 3️⃣ Convert remaining strings into numeric category codes
    for col in df.columns:
        if df[col].dtype == object:
            df[col] = df[col].astype("category").cat.codes

    return df
