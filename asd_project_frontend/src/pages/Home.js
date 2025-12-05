import React, { useState, useEffect } from "react";
import { FaRobot, FaPlay, FaStar, FaBrain, FaHeartbeat } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/theme.css";
import { startSession } from "../api/backend";

const Home = () => {
  const navigate = useNavigate();
  const [displayedText, setDisplayedText] = useState("");
  const fullText = "Smart, Adaptive";
  const fullTextSecond = "Autism Screening";

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 80);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    try {
      const session = await startSession();
      if (session?.session_id) {
        localStorage.setItem("session_id", session.session_id);
        localStorage.setItem("next_question", session.next_question);
        navigate("/demographics");
      } else {
        alert("Unable to start session. Please check backend.");
      }
    } catch (err) {
      console.error(err);
      alert("Backend error — Start your FastAPI server!");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 sm:px-6"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #e9f3ff 100%)",
      }}
    >

      <div className="relative z-10 max-w-6xl w-full">
        <div
          className="rounded-3xl p-8 sm:p-12 shadow-xl transition-all duration-500"
          style={{
            background: "rgba(255,255,255,0.6)",
            border: "1px solid rgba(180,200,255,0.4)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            {/* LEFT SIDE */}
            <div className="flex flex-col space-y-6 animate-fadeInLeft">

              {/* Logo + small badge */}
              <div className="flex items-center gap-3 relative">
                <FaRobot
                  className="text-5xl"
                  style={{
                    background: "linear-gradient(90deg,#3A7BD5,#00C6FB)",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                />

                <span
                  className="text-xl font-bold"
                  style={{
                    background: "linear-gradient(90deg,#3A7BD5,#00C6FB)",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  NeuroMate
                </span>

                {/* Small badge icon */}
                <div className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md flex items-center gap-1 text-xs shadow-sm fade-in">
                  <FaHeartbeat />
                  AI Care
                </div>
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight min-h-[120px] text-gray-800">
                <span>{displayedText}</span>
                <span className="animate-blink" style={{ marginLeft: 6 }}>
                  |
                </span>
                <br />
                <span
                  className="inline-block"
                  style={{
                    background: "linear-gradient(90deg,#3A7BD5,#00C6FB)",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {fullTextSecond}
                </span>
              </h1>

              {/* Features */}
              <div className="space-y-3 pt-3">
                <div className="flex items-start gap-3 fade-item">
                  <FaStar className="text-blue-500 text-lg mt-1" />
                  <p className="text-gray-700 text-sm sm:text-base">
                    Adaptive AI-powered questioning system
                  </p>
                </div>

                <div className="flex items-start gap-3 fade-item">
                  <FaBrain className="text-cyan-500 text-lg mt-1" />
                  <p className="text-gray-700 text-sm sm:text-base">
                    Category-based analysis with clear severity scoring
                  </p>
                </div>

                <div className="flex items-start gap-3 fade-item">
                  <FaRobot className="text-blue-400 text-lg mt-1" />
                  <p className="text-gray-700 text-sm sm:text-base">
                    Hospital-grade PDF reports
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-base leading-relaxed pt-2">
                A modern, gentle and accurate AI-powered autism screening.
              </p>

              {/* CTA */}
              <button
                onClick={handleStart}
                className="group w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white rounded-xl transition-all hover:scale-105 active:scale-95 fade-in"
                style={{
                  background: "linear-gradient(90deg,#3A7BD5,#00C6FB)",
                  boxShadow: "0 8px 24px rgba(30,100,200,0.28)",
                }}
              >
                <div className="flex items-center justify-center gap-3">
                  <FaPlay className="text-base group-hover:rotate-90 transition-transform" />
                  <span>Start Screening</span>
                </div>
              </button>
            </div>

            {/* RIGHT SIDE IMAGE */}
            <div className="hidden lg:flex justify-center animate-fadeInRight">
              <div
                className="relative w-full max-w-sm h-96 rounded-3xl p-6 assistant-card"
                style={{
                  background: "rgba(255,255,255,0.6)",
                  border: "1px solid rgba(180,200,255,0.4)",
                  backdropFilter: "blur(14px)",
                }}
              >
                <img
                  src="https://play-lh.googleusercontent.com/kyqwKigFeMK--sLP227HkpbZuICH5FR9oh1UiND4ly_IdnySC1axnCzSu3yXkpWE2Jc"
                  alt="AI assistant avatar"
                  className="assistant-img"
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* SIMPLE ANIMATIONS */}
      <style>{`
        /* blink cursor */
        @keyframes blink {
          0%,50%,100% { opacity:1; }
          75% { opacity:0; }
        }
        .animate-blink { animation: blink 1s infinite; }

        /* fade in */
        .fade-in {
          animation: fadeIn .7s ease forwards;
          opacity: 0;
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }

        .fade-item {
          opacity: 0;
          animation: fadeItem .8s ease forwards;
        }
        @keyframes fadeItem {
          to { opacity: 1; transform: translateX(0); }
          from { opacity: 0; transform: translateX(-10px); }
        }

        /* assistant image smooth float */
        .assistant-card {
          overflow: hidden;
        }
        .assistant-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 16px;
          animation: softFloat 4s ease-in-out infinite;
          transition: transform .4s ease;
        }
        .assistant-card:hover .assistant-img {
          transform: scale(1.04);
        }

        @keyframes softFloat {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
};

export default Home;
