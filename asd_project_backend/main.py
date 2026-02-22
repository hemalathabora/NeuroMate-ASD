# main.py — ASD Adaptive Screening Backend (Final, Optimized, Category Skip PERFECT)
import uuid
import traceback
from typing import Dict, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from utils import load_artifacts
from pdf_utils import make_pdf_bytes

# ================================
# FASTAPI INIT
# ================================
app = FastAPI(title="NeuroMate – ASD Adaptive Screening API (Final Logic)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

artifacts = load_artifacts() or {}

# ================================
# QUESTIONS
# ================================
DEMOGRAPHIC_QUESTIONS = [
    "What is your name?",
    "How old are you?",
    "What is your gender?",
    "Which country/locality are you from?",
    "What is your ethnicity?",
    "What is your relation to the child? (Self/Parent/Guardian)",
    "Did you have jaundice during childhood? (yes/no)",
    "Have you used an ASD screening app before? (yes/no)",
]

QUESTIONS = {
    "social": [
        "Do you find it hard to maintain eye contact with people?",
        "Do you feel uncomfortable when people try to talk to you?",
        "Do you avoid social gatherings because they feel overwhelming?",
        "Do you struggle to form friendships or maintain relationships?",
        "Do you often feel disconnected even when surrounded by people?",
    ],
    "communication": [
        "Do you sometimes need extra time to respond during conversations?",
        "Do you find it difficult to understand jokes or sarcasm?",
        "Do you often repeat phrases or speak in a monotone tone?",
        "Do you struggle to express your emotions clearly to others?",
        "Do people frequently misunderstand your intentions or speech?",
    ],
    "hyperactivity": [
        "Do you feel restless or find it hard to sit still?",
        "Do you get distracted easily during simple tasks?",
        "Do you move your hands/legs frequently or fidget nonstop?",
        "Do you interrupt people often or act before thinking?",
        "Do you feel an uncontrollable urge to keep moving?",
    ],
    "repetitive": [
        "Do you enjoy having the same routine every day?",
        "Do small changes in plans upset you?",
        "Do you repeat certain body movements such as rocking or hand-flapping?",
        "Do you repeat words or actions in a fixed pattern?",
        "Do you feel anxious if routines are disrupted?",
    ],
    "sensory": [
        "Are you sensitive to loud sounds or noisy places?",
        "Do bright lights or certain colors bother you?",
        "Do some textures feel uncomfortable for you?",
        "Do you get overwhelmed by too much sensory input?",
        "Do sensory experiences cause physical pain or extreme stress?",
    ],
    "learning": [
        "Do you take longer than others to understand instructions?",
        "Do you struggle with planning or organizing tasks?",
        "Do you find it difficult to shift your focus to new tasks?",
        "Do you forget steps even after learning them several times?",
        "Do you completely shut down when given complex instructions?",
    ],
}

CATEGORIES = list(QUESTIONS.keys())
SESSIONS: Dict[str, Dict[str, Any]] = {}

# ================================
# CATEGORY SEVERITY LABELING
# ================================
def category_label(score):
    if score <= 1: return "Normal"
    if score == 2: return "Mild"
    if score == 3: return "Moderate"
    if score == 4: return "High"
    return "Severe"

# ================================
# FINAL DECISION LOGIC
# ================================
def compute_final_diagnosis(scores):
    total_yes = sum(scores.values())
    per_cat_labels = {c: category_label(v) for c, v in scores.items()}

    # Strong category signals first
    if any(v >= 5 for v in scores.values()):
        return "Likely ASD", "Strong signs — urgent professional evaluation recommended", per_cat_labels, total_yes
    if any(v == 4 for v in scores.values()):
        return "Probable ASD", "High signs — screening recommended soon", per_cat_labels, total_yes
    if any(v == 3 for v in scores.values()):
        return "At Risk", "Moderate symptoms — consult specialist if symptoms continue", per_cat_labels, total_yes
    if list(scores.values()).count(2) >= 2:
        return "At Risk", "Mild signs — keep monitoring", per_cat_labels, total_yes

    # Overall score ranges
    if total_yes <= 2:
        return "No ASD", "Low likelihood — continue normal observation", per_cat_labels, total_yes
    if total_yes <= 6:
        return "At Risk", "Some signs present — consider observation", per_cat_labels, total_yes
    if total_yes <= 12:
        return "Probable ASD", "Moderate concerns — consider evaluation", per_cat_labels, total_yes

    return "Likely ASD", "Strong indicators — specialist evaluation advised", per_cat_labels, total_yes

# ================================
# ROOT
# ================================
@app.get("/")
def root():
    return {"message": "NeuroMate ASD Screening API Running"}

# ================================
# START SESSION
# ================================
@app.post("/start_session")
def start_session():
    session_id = str(uuid.uuid4())
    SESSIONS[session_id] = {
        "phase": 0,
        "demo_index": 0,
        "demo_answers": {},
        "user": {},
        "category_index": 0,
        "question_index": 0,
        "scores": {c: 0 for c in CATEGORIES},
        "answers": [],
        "complete": False,
        "final": None,
    }
    return {"session_id": session_id, "next_question": DEMOGRAPHIC_QUESTIONS[0]}

# ================================
# ANSWER HANDLER (CATEGORY SKIP PERFECT)
# ================================
@app.post("/answer")
def answer(data: Dict[str, Any]):
    try:
        session_id = data.get("session_id")
        ans_raw = str(data.get("answer", "")).strip().lower()
        yes_words = {"yes", "y", "true", "often", "always", "frequently"}

        if not session_id or session_id not in SESSIONS:
            raise HTTPException(400, "Invalid session id")

        sess = SESSIONS[session_id]

        # ---------------------------
        # DEMOGRAPHIC QUESTIONS
        # ---------------------------
        if sess["phase"] == 0:
            idx = sess["demo_index"]
            question = DEMOGRAPHIC_QUESTIONS[idx]

            sess["demo_answers"][question] = ans_raw
            keys = ["name", "age", "gender", "country", "ethnicity", "relation", "jaundice", "used_app_before"]

            key = keys[idx]
            sess["user"][key] = int(ans_raw) if key == "age" else ans_raw

            sess["demo_index"] += 1
            if sess["demo_index"] >= len(DEMOGRAPHIC_QUESTIONS):
                sess["phase"] = 1
                return {"next_question": QUESTIONS[CATEGORIES[0]][0]}

            return {"next_question": DEMOGRAPHIC_QUESTIONS[sess["demo_index"]]}

        # ---------------------------
        # CATEGORY QUESTIONS
        # ---------------------------
        cat_i = sess["category_index"]
        q_i = sess["question_index"]
        category = CATEGORIES[cat_i]
        q_text = QUESTIONS[category][q_i]

        # Save response
        sess["answers"].append({
            "category": category,
            "question": q_text,
            "answer": ans_raw
        })

        # FIRST QUESTION = NO → SKIP ENTIRE CATEGORY
        if q_i == 0 and ans_raw not in yes_words:
            cat_i += 1
            q_i = 0

            if cat_i >= len(CATEGORIES):
                return finalize(sess, session_id)

            sess["category_index"] = cat_i
            sess["question_index"] = q_i
            return {"next_question": QUESTIONS[CATEGORIES[cat_i]][0]}

        # If YES → count score
        if ans_raw in yes_words:
            sess["scores"][category] += 1

        # Move inside the same category
        q_i += 1

        # End of category → next category
        if q_i >= len(QUESTIONS[category]):
            cat_i += 1
            q_i = 0

        # End of all categories → FINALIZE
        if cat_i >= len(CATEGORIES):
            return finalize(sess, session_id)

        sess["category_index"] = cat_i
        sess["question_index"] = q_i
        return {"next_question": QUESTIONS[CATEGORIES[cat_i]][q_i]}

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, f"Internal error: {str(e)}")


# ================================
# FINALIZATION
# ================================
def finalize(sess, session_id):
    sess["complete"] = True
    final_label, guidance, per_cat_labels, total_yes = compute_final_diagnosis(sess["scores"])

    sess["final"] = {
        "ASD_result": final_label,
        "guidance": guidance,
        "total_yes": total_yes,
        "per_category_labels": per_cat_labels,
    }

    return {"final": True, **sess["final"]}

# ================================
# GET FINAL RESULT
# ================================
@app.post("/predict_final")
def predict_final(data: Dict[str, Any]):
    session_id = data.get("session_id")

    if not session_id or session_id not in SESSIONS:
        raise HTTPException(400, "Invalid session_id")

    sess = SESSIONS[session_id]
    if not sess["complete"]:
        raise HTTPException(400, "Screening not completed")

    return sess["final"]

# ================================
# PDF GENERATION
# ================================
@app.post("/generate-report-session")
def generate_pdf(data: Dict[str, Any]):
    session_id = data.get("session_id")

    if not session_id or session_id not in SESSIONS:
        raise HTTPException(400, "Invalid session id")

    sess = SESSIONS[session_id]

    if not sess["complete"]:
        raise HTTPException(400, "Screening not complete")

    pdf = make_pdf_bytes(
        sess["user"],
        sess["final"]["ASD_result"],
        0.0,
        extra={
            "scores": sess["scores"],
            "per_category_labels": sess["final"]["per_category_labels"],
            "total_yes": sess["final"]["total_yes"],
            "guidance": sess["final"]["guidance"],
            "demographics": sess["demo_answers"],
            "answers": sess["answers"],
        }
    )

    return StreamingResponse(
        iter([pdf]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=NeuroMate_Report_{session_id}.pdf"}
    )
