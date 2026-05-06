import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, AlertCircle } from "lucide-react";
import api from "../services/api";

const toNumberList = (values = []) =>
  values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

const toIntegerList = (values = []) =>
  values
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isFinite(value));

const hasTelemetry = (telemetryData) =>
  Array.isArray(telemetryData?.driver1_speed) &&
  Array.isArray(telemetryData?.driver2_speed) &&
  telemetryData.driver1_speed.length > 0 &&
  telemetryData.driver2_speed.length > 0;

const buildTelemetryPayload = (telemetryData, selectedDrivers, userMessage) => ({
  driver1: selectedDrivers.driver1,
  driver2: selectedDrivers.driver2,
  // Race context
  race: selectedDrivers.grandPrix || "Unknown",
  year: selectedDrivers.year || new Date().getFullYear(),
  session: selectedDrivers.sessionType || "Unknown",
  // Telemetry arrays
  driver1Speed: toNumberList(telemetryData?.driver1_speed),
  driver2Speed: toNumberList(telemetryData?.driver2_speed),
  driver1Throttle: toNumberList(telemetryData?.driver1_throttle),
  driver2Throttle: toNumberList(telemetryData?.driver2_throttle),
  driver1Brake: toNumberList(telemetryData?.driver1_brake),
  driver2Brake: toNumberList(telemetryData?.driver2_brake),
  lapDelta: toNumberList(telemetryData?.delta),
  // Also keep legacy format for backward compatibility
  speedData: {
    [selectedDrivers.driver1]: toNumberList(telemetryData?.driver1_speed),
    [selectedDrivers.driver2]: toNumberList(telemetryData?.driver2_speed)
  },
  throttleData: {
    [selectedDrivers.driver1]: toNumberList(telemetryData?.driver1_throttle),
    [selectedDrivers.driver2]: toNumberList(telemetryData?.driver2_throttle)
  },
  brakeData: {
    [selectedDrivers.driver1]: toNumberList(telemetryData?.driver1_brake),
    [selectedDrivers.driver2]: toNumberList(telemetryData?.driver2_brake)
  },
  gearData: {
    [selectedDrivers.driver1]: toIntegerList(telemetryData?.driver1_gear),
    [selectedDrivers.driver2]: toIntegerList(telemetryData?.driver2_gear)
  },
  sectorDelta: toNumberList(telemetryData?.delta),
  userMessage
});

const TelemetryChatbot = ({ telemetryData, selectedDrivers }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const telemetryReady = hasTelemetry(telemetryData);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: Date.now(),
          sender: "bot",
          text: "Delta Analyst is ready. Ask a telemetry question after loading a driver comparison.",
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping || !telemetryReady) {
      if (!telemetryReady) {
        setError("Load telemetry before asking Delta Analyst.");
      }
      return;
    }

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    setError(null);

    try {
      const response = await api.post(
        "/ai/delta-analyst/chat",
        buildTelemetryPayload(telemetryData, selectedDrivers, userMessage.text)
      );

      const aiText = response.data?.data || response.data?.response;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: aiText || "Delta Analyst temporarily unavailable.",
          timestamp: new Date()
        }
      ]);
    } catch (err) {
      console.error("Delta Analyst API error:", err);
      setError("Failed to connect to Delta Analyst");
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "Delta Analyst temporarily unavailable.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="rounded-full bg-accentRed p-3 text-white shadow-lg shadow-red-900/30 transition-all duration-200 hover:bg-red-500"
            aria-label="Open Delta Analyst"
          >
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex h-[28rem] max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] flex-col rounded-xl2 border border-borderSoft bg-bgElevated shadow-2xl shadow-black/50 sm:w-96"
          >
            <div className="flex items-center justify-between border-b border-borderSoft p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accentRed/20">
                  <Bot className="h-4 w-4 text-accentRed" />
                </div>
                <div>
                  <p className="font-semibold text-whitePrimary">Delta Analyst</p>
                  <p className="text-xs text-whiteMuted">Live telemetry intelligence</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-whiteMuted transition-colors hover:text-whitePrimary"
                aria-label="Close Delta Analyst"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      message.sender === "user"
                        ? "bg-accentRed text-white"
                        : "bg-bgSecondary text-whitePrimary"
                    }`}
                  >
                    {message.text}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="rounded-lg bg-bgSecondary px-3 py-2">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-whiteMuted" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-whiteMuted [animation-delay:150ms]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-whiteMuted [animation-delay:300ms]" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-borderSoft p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={telemetryReady ? "Ask about telemetry data..." : "Load telemetry first"}
                  className="min-w-0 flex-1 rounded-lg border border-borderSoft bg-bgPrimary px-3 py-2 text-sm text-whitePrimary placeholder-whiteMuted focus:border-accentRed focus:outline-none"
                  disabled={isTyping || !telemetryReady}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping || !telemetryReady}
                  className="rounded-lg bg-accentRed p-2 text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-gray-700"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                <p className="text-center text-xs text-whiteMuted">
                  Powered by DeltaBox AI - Live telemetry intelligence
                </p>
                {error && (
                  <div className="flex items-center gap-1 text-xs text-red-400">
                    <AlertCircle className="h-3 w-3" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TelemetryChatbot;
