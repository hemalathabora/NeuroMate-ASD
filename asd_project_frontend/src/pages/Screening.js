import React, { useState, useEffect } from "react";
import { sendAnswer } from "../api/backend";
import { useNavigate } from "react-router-dom";
import { FaRobot } from "react-icons/fa";

export default function Screening() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState(localStorage.getItem("next_question") || "");
  const [loading, setLoading] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [displayedQuestion, setDisplayedQuestion] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // typing animation
  useEffect(() => {
    if (!question) return;
    let i = 0;
    setDisplayedQuestion("");

    const interval = setInterval(() => {
      if (i <= question.length) {
        setDisplayedQuestion(question.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 18);

    return () => clearInterval(interval);
  }, [question]);

  const answerHandler = async (ans) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    try {
      const session_id = localStorage.getItem("session_id");
      const data = await sendAnswer(session_id, ans);

      await new Promise((r) => setTimeout(r, 450));

      if (data?.final === true) {
        setQuestionIndex((prev) => prev + 1);
        setTimeout(() => navigate("/result"), 350);
        return;
      }

      if (data?.next_question) {
        setQuestionIndex((prev) => prev + 1);
        setQuestion(data.next_question);
        localStorage.setItem("next_question", data.next_question);
        return;
      }
    } catch (err) {
      console.error("Screening error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 fade-page"
      style={{
        background: "#f6faff",
      }}
    >
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden transition-all transform duration-500 ${
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        style={{
          background: "#ffffff",
          border: "1px solid #e3eeff",
        }}
      >
        {/* HEADER */}
        <div
          className="px-8 py-6 border-b flex items-center justify-between bg-white"
          style={{ borderColor: "#e3eeff" }}
        >
          <div className="flex items-center gap-4">
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "#e3eeff",
              }}
              className="flex items-center justify-center"
            >
              <FaRobot className="text-blue-600 text-2xl" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-blue-700">
                Screening Questions
              </h2>
              <div className="text-sm text-gray-500">
                NeuroMate Adaptive Assessment
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-500">Question</div>
            <div className="text-2xl font-bold text-blue-600">
              {questionIndex + 1}
            </div>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div
          className="h-1 bg-blue-100"
          style={{ background: "#e3eeff" }}
        >
          <div
            className="h-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.min((questionIndex / 30) * 100, 95)}%`,
              background: "linear-gradient(90deg,#3A7BD5,#00C6FB)",
            }}
          />
        </div>

        {/* QUESTION AREA */}
        <div className="px-8 py-10">
          <div className="mb-10 min-h-24 flex items-center">
            <div>
              <div className="text-sm uppercase tracking-wide mb-2 text-blue-500/80">
                Please answer honestly
              </div>

              <p className="text-3xl font-bold text-gray-800 leading-relaxed fade-question">
                {displayedQuestion}
                <span className="blink-cursor ml-1">|</span>
              </p>
            </div>
          </div>

          {/* YES / NO BUTTONS */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => answerHandler("yes")}
              disabled={loading}
              className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"
              }`}
              style={{
                background: "linear-gradient(90deg, #3A7BD5, #00C6FB)",
                color: "#fff",
                boxShadow: "0 6px 18px rgba(0,100,255,0.22)",
              }}
            >
              {loading ? "..." : "YES"}
            </button>

            <button
              onClick={() => answerHandler("no")}
              disabled={loading}
              className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"
              }`}
              style={{
                background: "linear-gradient(90deg,#ef4444,#dc2626)",
                color: "#fff",
                boxShadow: "0 6px 18px rgba(255,80,80,0.22)",
              }}
            >
              {loading ? "..." : "NO"}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            Answer based on your personal experience or observation.
          </div>
        </div>
      </div>

      {/* SIMPLE STYLES */}
      <style>{`
        .fade-page {
          animation: fadeIn .5s ease;
        }
        @keyframes fadeIn {
          from { opacity:0 }
          to { opacity:1 }
        }

        .fade-question {
          animation: questionFade .4s ease;
        }
        @keyframes questionFade {
          from { opacity:0; transform: translateY(6px); }
          to { opacity:1; transform: translateY(0); }
        }

        .blink-cursor {
          animation: blink 1s infinite;
          color: #2563eb;
        }
        @keyframes blink {
          0%,50%,100% { opacity:1; }
          75% { opacity:0; }
        }
      `}</style>
    </div>
  );
}
