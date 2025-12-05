import React, { useEffect, useState } from "react";
import { getFinal, downloadPDF } from "../api/backend";

export default function Result() {
  const [result, setResult] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const fetchData = async () => {
      const session_id = localStorage.getItem("session_id");
      const data = await getFinal(session_id);

      const formatted = {
        ASD_result: data?.final_label,
        total_yes: data?.total_yes,
        per_category_labels: data?.per_category_labels,
        guidance: data?.guidance,
        suggestions: generateSuggestions(data?.final_label),
      };

      setResult(formatted);
    };

    fetchData();
  }, []);

  const generateSuggestions = (label) => {
    switch (label) {
      case "No ASD":
        return [
          "Low risk — continue observation.",
          "Encourage social interaction.",
          "Re-screen if symptoms develop.",
        ];
      case "At Risk":
        return [
          "Monitor behaviours regularly.",
          "Encourage communication activities.",
          "Maintain structured routines.",
        ];
      case "Probable ASD":
        return [
          "Consider early intervention.",
          "Seek specialist consultation.",
          "Track behaviour across settings.",
        ];
      case "Likely ASD":
        return [
          "Immediate specialist evaluation recommended.",
          "Begin structured support programs.",
          "Plan long-term care and intervention.",
        ];
      default:
        return [];
    }
  };

  const getLevelPercent = (level) => {
    if (!level) return 20;
    const map = {
      normal: 20,
      mild: 40,
      moderate: 65,
      high: 85,
      severe: 95,
    };
    return map[level.toLowerCase()] || 20;
  };

  // ===========================
  // LOADING SKELETON
  // ===========================
  if (!result) {
    return (
      <div
        className="min-h-screen flex justify-center items-center px-4"
        style={{ background: "#f6faff" }}
      >
        <div className="bg-white p-6 rounded-2xl shadow-lg fade-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-200 rounded-xl animate-pulse" />
            <div>
              <div className="w-40 h-4 bg-blue-100 rounded-md mb-2" />
              <div className="w-20 h-4 bg-blue-50 rounded-md" />
            </div>
          </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .fade-card { animation: fadeIn .6s ease-out; }
        `}</style>
      </div>
    );
  }

  // ===========================
  // FINAL RESULT UI
  // ===========================
  return (
    <div
      className="min-h-screen flex justify-center px-4 py-10 fade-page"
      style={{ background: "#f6faff" }}
    >
      <div
        className={`rounded-2xl shadow-xl p-8 max-w-3xl w-full bg-white transition-all duration-500 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
        style={{ border: "1px solid #e3eeff" }}
      >
        {/* HEADER */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center"
              style={{
                width: 58,
                height: 58,
                borderRadius: 14,
                background: "#e3eeff",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2v6" stroke="#2563eb" strokeWidth="1.4" />
                <rect
                  x="6"
                  y="8"
                  width="12"
                  height="10"
                  rx="3"
                  stroke="#2563eb"
                  strokeWidth="1.2"
                />
                <circle cx="9.5" cy="12.5" r="1.2" fill="#2563eb" />
                <circle cx="14.5" cy="12.5" r="1.2" fill="#2563eb" />
              </svg>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-blue-700">
                Final Assessment
              </h2>
              <div className="text-sm text-gray-500">
                Results summary • NeuroMate
              </div>
            </div>
          </div>

          <button
            onClick={() => downloadPDF(localStorage.getItem("session_id"))}
            className="px-4 py-2 rounded-lg text-white font-semibold hover:scale-105 transition-all"
            style={{
              background: "linear-gradient(90deg,#3A7BD5,#00C6FB)",
              boxShadow: "0 6px 16px rgba(0,100,255,0.18)",
            }}
          >
            Download PDF
          </button>
        </header>

        {/* MAIN SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SUMMARY CARD */}
          <div
            className="p-5 rounded-xl fade-card"
            style={{
              background: "#f8fbff",
              border: "1px solid #d9e8ff",
            }}
          >
            <div className="text-sm text-blue-700">Overall Result</div>

            <div
              className="mt-2 text-2xl font-bold"
              style={{
                color:
                  result.ASD_result === "Likely ASD" ||
                  result.ASD_result === "Probable ASD"
                    ? "#dc2626"
                    : result.ASD_result === "At Risk"
                    ? "#d97706"
                    : "#15803d",
              }}
            >
              {result.ASD_result}
            </div>

            <div className="mt-4 text-sm text-blue-700">Total “Yes” Count</div>
            <div className="mt-1 text-xl font-semibold text-blue-900">
              {result.total_yes}
            </div>

            <div className="mt-6">
              <h4 className="text-sm text-blue-700 mb-2">Suggestions</h4>
              <div className="flex flex-wrap gap-2">
                {result.suggestions.map((s, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-sm text-white"
                    style={{
                      background: "linear-gradient(90deg,#3A7BD5,#00C6FB)",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* CATEGORY SCORES */}
          <div
            className="p-5 rounded-xl fade-card"
            style={{
              background: "#f8fbff",
              border: "1px solid #d9e8ff",
            }}
          >
            <h4 className="text-sm text-blue-700 mb-3">Category Breakdown</h4>

            <div className="space-y-4">
              {Object.entries(result.per_category_labels).map(([cat, level]) => (
                <div key={cat}>
                  <div className="flex justify-between text-sm">
                    <span className="capitalize text-blue-900">{cat}</span>
                    <span className="text-gray-600 font-medium">{level}</span>
                  </div>

                  <div
                    className="w-full h-3 bg-blue-100 rounded-full mt-1 overflow-hidden"
                  >
                    <div
                      className="h-full rounded-full bar-fill"
                      style={{
                        width: `${getLevelPercent(level)}%`,
                        background: "linear-gradient(90deg,#3A7BD5,#00C6FB)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-6 text-right text-sm text-gray-500">
          Report generated on {new Date().toLocaleString()}
        </footer>

        {/* ANIMATIONS */}
        <style>{`
          .fade-page { animation: fadeIn .5s ease; }
          @keyframes fadeIn {
            from { opacity: 0 }
            to { opacity: 1 }
          }

          .fade-card {
            animation: fadeCard .6s ease;
          }
          @keyframes fadeCard {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .bar-fill {
            animation: growBar .7s ease-out;
          }
          @keyframes growBar {
            from { width: 0% }
            to { width: 100% }
          }
        `}</style>
      </div>
    </div>
  );
}
