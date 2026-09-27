import  { useState, useRef, useEffect } from "react";
import {
  FaRobot,
  FaPaperPlane,
  FaUser,
  FaSpinner,
  FaUsers,
  FaCar,
  FaMoneyBillWave,
  FaExclamationCircle,
  FaShieldAlt,
  FaTimes,
} from "react-icons/fa";
import { askAIAssistant } from "../../../services/aiAssistantApi";

const suggestions = [
  {
    title: "Visitor Management",
    text: "What is visitor management?",
    icon: FaUsers,
  },
  {
    title: "Parking",
    text: "What is parking management?",
    icon: FaCar,
  },
  {
    title: "Billing & Accounts",
    text: "What is billing?",
    icon: FaMoneyBillWave,
  },
  {
    title: "Complaints",
    text: "How does complaint management work?",
    icon: FaExclamationCircle,
  },
  {
    title: "Roles & Permissions",
    text: "What are the different user roles?",
    icon: FaShieldAlt,
  },
];

const AIAssistantPage = () => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!query.trim() || loading) return;

    const userMessage = query.trim();

    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text: userMessage,
      },
    ]);

    setQuery("");
    setLoading(true);

    try {
      const response = await askAIAssistant(userMessage);

      const data = response?.data || response;

      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          text:
            data?.answer ||
            "Sorry, I could not find an answer in the Knowledge Base.",
          sources: data?.sources || [],
          language: data?.language || "en",
        },
      ]);
    } catch (error) {
      console.error("AI Assistant Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          text:
            error?.response?.data?.message ||
            error?.message ||
            "Something went wrong. Please try again.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (text) => {
    if (loading) return;

    setQuery(text);
  };

  const handleClearChat = () => {
    if (loading) return;
    setMessages([]);
  };

  return (
    <div className="h-full min-h-[calc(100vh-140px)] flex flex-col">

      {/* ================= HEADER ================= */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
            <FaRobot className="text-2xl" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              AI Assistant
            </h1>

            <p className="text-sm text-gray-500">
              Your MySocietySuite knowledge assistant
            </p>
          </div>

        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleClearChat}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
          >
            <FaTimes />
            Clear Chat
          </button>
        )}
      </div>

      {/* ================= CHAT CARD ================= */}
      <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">

        {/* ================= CHAT HEADER ================= */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">

          <div className="flex items-center gap-3">

            <div className="relative">

              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm">
                <FaRobot />
              </div>

              <span className="absolute -right-1 -bottom-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>

            </div>

            <div>
              <h2 className="font-semibold text-gray-800">
                MySociety AI
              </h2>

              <p className="text-xs text-gray-500">
                <span className="text-green-500">●</span>{" "}
                Knowledge Base Assistant
              </p>
            </div>

          </div>

          <div className="hidden sm:block text-xs text-gray-400">
            English • Hindi • Marathi
          </div>

        </div>

        {/* ================= MESSAGES ================= */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 bg-gray-50/50">

          {messages.length === 0 ? (

            /* ================= EMPTY STATE ================= */
            <div className="min-h-[480px] flex flex-col items-center justify-center text-center">

              <div className="w-20 h-20 rounded-3xl bg-orange-50 text-orange-500 flex items-center justify-center mb-5">
                <FaRobot className="text-4xl" />
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                How can I help you?
              </h2>

              <p className="text-gray-500 max-w-lg mb-8">
                Ask me about MySocietySuite modules, features,
                workflows, roles and permissions.
              </p>

              {/* Suggestion Cards */}
              <div className="w-full max-w-3xl">

                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Try asking
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

                  {suggestions.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestion(item.text)}
                        className="group text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-orange-300 hover:bg-orange-50/40 transition-all duration-200"
                      >

                        <div className="flex items-start gap-3">

                          <div className="w-9 h-9 shrink-0 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition">
                            <Icon className="text-sm" />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-700 group-hover:text-orange-600">
                              {item.title}
                            </p>

                            <p className="text-xs text-gray-400 mt-1">
                              Ask about this
                            </p>
                          </div>

                        </div>

                      </button>
                    );
                  })}

                </div>

              </div>

            </div>

          ) : (

            /* ================= CHAT MESSAGES ================= */
            <div className="max-w-4xl mx-auto space-y-5">

              {messages.map((message, index) => (

                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.type === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  {/* AI Icon */}
                  {message.type === "assistant" && (
                    <div className="w-9 h-9 shrink-0 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                      <FaRobot className="text-sm" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] ${
                      message.type === "user"
                        ? "order-first"
                        : ""
                    }`}
                  >

                    <div
                      className={`px-4 py-3 rounded-2xl text-sm leading-6 ${
                        message.type === "user"
                          ? "bg-orange-500 text-white rounded-br-md"
                          : message.error
                          ? "bg-red-50 text-red-600 border border-red-100 rounded-bl-md"
                          : "bg-white text-gray-700 border border-gray-200 rounded-bl-md shadow-sm"
                      }`}
                    >
                      {message.text}
                    </div>

                    {/* Sources */}
                    {message.type === "assistant" &&
                      message.sources?.length > 0 && (
                        <div className="mt-2">

                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                            Knowledge Base
                          </p>

                          <div className="flex flex-wrap gap-2">

                            {message.sources.map(
                              (source, sourceIndex) => (
                                <span
                                  key={sourceIndex}
                                  className="text-xs bg-orange-50 text-orange-600 px-2.5 py-1 rounded-lg"
                                >
                                  {source.title}
                                </span>
                              )
                            )}

                          </div>

                        </div>
                      )}

                    <p
                      className={`text-[10px] mt-1 ${
                        message.type === "user"
                          ? "text-right text-gray-400"
                          : "text-left text-gray-400"
                      }`}
                    >
                      {message.type === "user"
                        ? "You"
                        : "MySociety AI"}
                    </p>

                  </div>

                  {/* User Icon */}
                  {message.type === "user" && (
                    <div className="w-9 h-9 shrink-0 rounded-xl bg-gray-200 text-gray-600 flex items-center justify-center">
                      <FaUser className="text-sm" />
                    </div>
                  )}

                </div>

              ))}

              {/* Loading */}
              {loading && (
                <div className="flex items-start gap-3">

                  <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                    <FaRobot className="text-sm" />
                  </div>

                  <div className="bg-white border border-gray-200 shadow-sm rounded-2xl rounded-bl-md px-4 py-3">

                    <div className="flex items-center gap-2 text-gray-500 text-sm">

                      <FaSpinner className="animate-spin text-orange-500" />

                      <span>
                        MySociety AI is thinking...
                      </span>

                    </div>

                  </div>

                </div>
              )}

              <div ref={messagesEndRef} />

            </div>

          )}

        </div>

        {/* ================= INPUT ================= */}
        <div className="border-t border-gray-200 bg-white p-4">

          <form
            onSubmit={handleSubmit}
            className="max-w-4xl mx-auto"
          >

            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-2 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition">

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything about MySocietySuite..."
                disabled={loading}
                className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm text-gray-700 placeholder-gray-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();

                    if (!loading && query.trim()) {
                      handleSubmit(e);
                    }
                  }
                }}
              />

              <button
                type="submit"
                disabled={!query.trim() || loading}
                className="w-11 h-11 shrink-0 rounded-xl bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-sm"
              >

                {loading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaPaperPlane />
                )}

              </button>

            </div>

            <p className="text-center text-[10px] text-gray-400 mt-2">
              MySociety AI currently answers using the Knowledge Base.
            </p>

          </form>

        </div>

      </div>

    </div>
  );
};

export default AIAssistantPage;