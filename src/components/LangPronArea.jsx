import React, { useEffect, useState, useRef } from "react";

const LangPronArea = ({ generatedText }) => {
  const [rate, setRate] = useState(1);
  const [currentWordIndex, setCurrentWordIndex] = useState(null);

  const utterRef = useRef(null);
  const words = generatedText ? generatedText.split(" ") : [];

  // NEW → store refs for each word
  const wordRefs = useRef([]);

  // Build refs when text changes
  useEffect(() => {
    wordRefs.current = words.map(() => React.createRef());
  }, [generatedText]);

  // --- Speak only when Generate is clicked (text changes)
  useEffect(() => {
    if (!generatedText) return;

    speechSynthesis.cancel();
    setCurrentWordIndex(null);

    const utter = new SpeechSynthesisUtterance(generatedText);
    utter.lang = "hi-IN";
    utter.rate = rate;
    utter.pitch = 1;

    const voices = speechSynthesis.getVoices();
    const hindi = voices.find((v) => v.lang === "hi-IN");
    if (hindi) utter.voice = hindi;

    // Highlight each spoken word
    utter.onboundary = (event) => {
      if (event.name === "word") {
        const idx = getWordIndexFromChar(event.charIndex);
        setCurrentWordIndex(idx);
      }
    };

    utterRef.current = utter;
    speechSynthesis.speak(utter);
  }, [generatedText]);

  // Restart speech on rate change
  useEffect(() => {
    if (!utterRef.current) return;

    if (speechSynthesis.speaking || speechSynthesis.paused) {
      restartSpeech();
    }
  }, [rate]);

  useEffect(() => {
    return () => speechSynthesis.cancel();
  }, []);

  // Auto-scroll when highlighted word changes  
  useEffect(() => {
    if (currentWordIndex === null) return;
    const el = wordRefs.current[currentWordIndex]?.current;
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, [currentWordIndex]);

  const getWordIndexFromChar = (charIndex) => {
    let total = 0;
    for (let i = 0; i < words.length; i++) {
      total += words[i].length + 1;
      if (total > charIndex) return i;
    }
    return words.length - 1;
  };

  const restartSpeech = () => {
    if (!generatedText) return;

    speechSynthesis.cancel();
    setCurrentWordIndex(null);

    const utter = new SpeechSynthesisUtterance(generatedText);
    utter.lang = "hi-IN";
    utter.rate = rate;
    utter.pitch = 1;

    const voices = speechSynthesis.getVoices();
    const hindi = voices.find((v) => v.lang === "hi-IN");
    if (hindi) utter.voice = hindi;

    utter.onboundary = (event) => {
      if (event.name === "word") {
        const idx = getWordIndexFromChar(event.charIndex);
        setCurrentWordIndex(idx);
      }
    };

    utterRef.current = utter;
    speechSynthesis.speak(utter);
  };

  const pause = () => speechSynthesis.pause();
  const resume = () => speechSynthesis.resume();

  return (
    <div className="mt-6 flex flex-col justify-center items-center">

      {/* Readonly Highlight Box */}
      <div
        className="min-w-[calc(100%-20%)] max-w-[calc(100%-10%)]  h-40 p-3  border-2 border-gray-400 rounded-lg overflow-y-auto bg-white"
        style={{ whiteSpace: "normal" }}
      >
        {words.map((word, i) => (
          <span
            key={i}
            ref={wordRefs.current[i]}  // 👈 Attach ref to each word
            style={{
              backgroundColor: i === currentWordIndex ? "yellow" : "transparent",
              padding: "2px",
              borderRadius: "4px",
            }}
          >
            {word + " "}
          </span>
        ))}
      </div>

      {/* Speed Slider */}
      <div className="mt-4">
        <label>Speed: {rate}</label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={rate}
          onChange={(e) => setRate(parseFloat(e.target.value))}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-4">
        <button className="px-4 py-2 bg-yellow-500 text-white rounded" onClick={pause}>
          Pause
        </button>
        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={resume}>
          Resume
        </button>
        <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={restartSpeech}>
          Restart
        </button>
      </div>
    </div>
  );
};

export default LangPronArea;
