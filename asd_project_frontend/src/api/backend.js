// src/api/backend.js

const BASE_URL = "http://127.0.0.1:8000";

// ----------------------------
// START SESSION
// ----------------------------
export async function startSession() {
  try {
    const res = await fetch(`${BASE_URL}/start_session`, {
      method: "POST",
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Start session error:", error);
    return null;
  }
}

// ----------------------------
// SEND ANSWER
// ----------------------------
export async function sendAnswer(session_id, answer) {
  try {
    const res = await fetch(`${BASE_URL}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id, answer }),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Send answer error:", error);
    return null;
  }
}

// ----------------------------
// GET FINAL RESULT
// ----------------------------
export async function getFinal(session_id) {
  try {
    const res = await fetch(`${BASE_URL}/predict_final`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id }),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Final result error:", error);
    return null;
  }
}

// ----------------------------
// DOWNLOAD PDF
// ----------------------------
export async function downloadPDF(session_id) {
  try {
    const res = await fetch(`${BASE_URL}/generate-report-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id }),
    });

    // backend returns a binary PDF stream
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `ASD_Report_${session_id}.pdf`;
    a.click();
    a.remove();

  } catch (error) {
    console.error("PDF download error:", error);
  }
}
