import React, { useState, useEffect, useRef } from "react";
import { sendAnswer } from "../api/backend";
import { useNavigate } from "react-router-dom";
import { FaRobot } from "react-icons/fa";

export default function Demographics() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  // fetch question
  const initialQuestion =
    localStorage.getItem("next_question") ||
    "Welcome! Shall we begin your guided autism screening?";
  const session_id = localStorage.getItem("session_id");

  const [answer, setAnswer] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "bot-0",
      from: "bot",
      text: initialQuestion,
      time: new Date().toISOString(),
    },
  ]);

  const [botTyping, setBotTyping] = useState(false);

  // auto-scroll when message updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight + 200;
    }
  }, [messages, botTyping]);

  // detect demographic questions
  const isDemographicQuestion = (text) => {
    const t = text.toLowerCase();
    return (
      t.includes("your name") ||
      t.includes("how old") ||
      t.includes("gender") ||
      t.includes("country") ||
      t.includes("ethnicity") ||
      t.includes("relation") ||
      t.includes("jaundice") ||
      t.includes("used an asd")
    );
  };

  // send answer to backend
  const handleSend = async (userAnswer) => {
    const finalAnswer = userAnswer ?? answer.trim();
    if (!finalAnswer) return;

    setMessages((m) => [
      ...m,
      {
        id: `user-${Date.now()}`,
        from: "user",
        text: finalAnswer,
        time: new Date().toISOString(),
      },
    ]);

    setAnswer("");
    setBotTyping(true);

    try {
      const res = await sendAnswer(session_id, finalAnswer);

      await new Promise((r) => setTimeout(r, 700));

      if (res?.next_question && res?.next_question.includes("Do you")) {
        setMessages((m) => [
          ...m,
          {
            id: `bot-${Date.now()}`,
            from: "bot",
            text: res.next_question,
            time: new Date().toISOString(),
          },
        ]);

        localStorage.setItem("next_question", res.next_question);

        setTimeout(() => navigate("/screening"), 600);
        return;
      }

      if (res?.next_question) {
        localStorage.setItem("next_question", res.next_question);
        setMessages((m) => [
          ...m,
          {
            id: `bot-${Date.now()}`,
            from: "bot",
            text: res.next_question,
            time: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: `bot-${Date.now()}`,
          from: "bot",
          text: "Something went wrong. Please try again.",
          time: new Date().toISOString(),
        },
      ]);
    } finally {
      setBotTyping(false);
    }
  };

  const lastBotMessage = messages.filter((m) => m.from === "bot").slice(-1)[0];
  const lastQuestion = lastBotMessage?.text || "";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 fade-page"
      style={{
        background: "#f6faff",
      }}
    >
      <div
        className="w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden"
        style={{
          background: "#ffffff",
          border: "1px solid #e3eeff",
        }}
      >
        {/* HEADER */}
        <div
          className="p-5 border-b flex items-center gap-3 bg-white"
          style={{ borderColor: "#e3eeff" }}
        >
          <div className="bubble-icon">
            <FaRobot className="text-blue-600 text-2xl" />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-blue-700">NeuroMate AI</h2>
            <div className="text-xs text-gray-500">
              Your autism screening assistant
            </div>
          </div>
        </div>

        {/* CHAT AREA */}
        <div
          ref={scrollRef}
          className="p-6 h-[62vh] overflow-y-auto custom-scroll space-y-5"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.from === "user" ? "justify-end" : "justify-start"
              } items-end gap-3`}
            >
              {m.from === "bot" && (
                <div className="bubble-icon-small">
                  <FaRobot className="text-blue-600 text-lg" />
                </div>
              )}

              <div
                className="max-w-[75%] p-4 rounded-2xl fade-bubble"
                style={{
                  background:
                    m.from === "user"
                      ? "linear-gradient(90deg,#3A7BD5,#00C6FB)"
                      : "#eef4ff",
                  color: m.from === "user" ? "#fff" : "#1e3a5f",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                }}
              >
                <div className="text-sm">{m.text}</div>
              </div>
            </div>
          ))}

          {botTyping && (
            <div className="text-blue-500 text-sm animate-pulse">
              NeuroMate is typing...
            </div>
          )}
        </div>

        {/* INPUT SECTION */}
        <div
          className="p-4 bg-white"
          style={{
            borderTop: "1px solid #e3eeff",
          }}
        >
          {isDemographicQuestion(lastQuestion) ? (
            <div className="flex items-center gap-3">
              <input
                ref={inputRef}
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 p-3 rounded-xl shadow-sm"
                style={{
                  background: "#f0f6ff",
                  border: "1px solid #d6e5ff",
                  color: "#1e3a5f",
                }}
                placeholder="Type your answer..."
              />

              <button
                onClick={() => handleSend()}
                className="px-5 py-3 rounded-xl text-white text-sm font-medium transition-all"
                style={{
                  background: "linear-gradient(90deg,#3A7BD5,#00C6FB)",
                  boxShadow: "0 4px 12px rgba(0,100,200,0.25)",
                }}
              >
                Submit
              </button>
            </div>
          ) : (
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => handleSend("yes")}
                className="px-6 py-3 rounded-xl text-white font-semibold text-lg shadow transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(90deg,#22c55e,#16a34a)",
                }}
              >
                YES
              </button>

              <button
                onClick={() => handleSend("no")}
                className="px-6 py-3 rounded-xl text-white font-semibold text-lg shadow transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(90deg,#ef4444,#b91c1c)",
                }}
              >
                NO
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* Page fade */
        .fade-page { animation: fadeIn .5s ease; }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }

        /* Bubbles fade */
        .fade-bubble { animation: bubbleFade .4s ease; }
        @keyframes bubbleFade {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .bubble-icon {
          width: 44px;
          height: 44px;
          background: #e3eeff;
          border-radius: 12px;
          display:flex;align-items:center;justify-content:center;
        }

        .bubble-icon-small {
          width: 34px;
          height: 34px;
          background: #e7f0ff;
          border-radius: 10px;
          display:flex;align-items:center;justify-content:center;
        }

        /* scrollbar */
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #c6dafc;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
