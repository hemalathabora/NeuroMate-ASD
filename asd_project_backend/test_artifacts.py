from utils import load_artifacts

art = load_artifacts()
print("Artifacts Loaded:")
for k, v in art.items():
    print(k, "->", type(v))
