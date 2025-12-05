import pickle
import os

path = "saved_models/encoders.pkl"

with open(path, "rb") as f:
    enc = pickle.load(f)

print("ENCODER KEYS:", enc.keys())
