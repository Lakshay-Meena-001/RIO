import { useCallback, useEffect, useRef, useState } from "react";
import {
  FiMic,
  FiMicOff,
  FiVolume2,
  FiVolumeX,
  FiVideo,
  FiVideoOff,
} from "react-icons/fi";

/**
 * Optional, browser-native interviewer controls. This component never records
 * or persists audio/video. Camera is preview-only; speech recognition inserts
 * text into the existing answer draft.
 */
export default function InterviewAgentPanel({
  question,
  onTranscript,
  language = "en-US",
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const speakTimerRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [notice, setNotice] = useState("");
  const [transcript, setTranscript] = useState("");

  const speakQuestion = useCallback(() => {
    if (!voiceOn || !question) return;

    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      setNotice("Text-to-speech is not supported in this browser.");
      return;
    }

    window.clearTimeout(speakTimerRef.current);
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(question);
    utterance.lang = language;
    utterance.rate = 0.95;

    window.speechSynthesis.speak(utterance);
  }, [question, voiceOn, language]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  }, []);

  const toggleCamera = async () => {
    if (cameraOn) {
      stopCamera();
      return;
    }
    try {
      if (!navigator.mediaDevices?.getUserMedia)
        throw new Error("Camera preview is not supported by this browser.");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
      setNotice("");
    } catch (error) {
      setNotice(error?.message || "Camera permission was not granted.");
    }
  };

  const stopRecognition = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* already stopped */
    }
    recognitionRef.current = null;
    setMicOn(false);
  }, []);

  const toggleMic = () => {
    if (micOn) {
      stopRecognition();
      return;
    }
    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setNotice(
        "Speech-to-text is not supported in this browser. You can type your answer normally.",
      );
      return;
    }
    const recognition = new Recognition();
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const text = event.results[i][0]?.transcript || "";
        if (event.results[i].isFinal) finalText += text;
        else interimText += text;
      }
      const text = [finalText, interimText].filter(Boolean).join(" ").trim();
      setTranscript(text);
      if (finalText.trim()) onTranscript?.(finalText.trim());
    };
    recognition.onerror = (event) => {
      setNotice(
        event.error === "not-allowed"
          ? "Microphone permission was denied. You can still type."
          : "Speech recognition stopped. You can retry or type your answer.",
      );
      stopRecognition();
    };
    recognition.onend = () => setMicOn(false);
    try {
      recognitionRef.current = recognition;
      recognition.start();
      setMicOn(true);
      setNotice("");
    } catch {
      setNotice(
        "Could not start speech recognition. Please type your answer instead.",
      );
      stopRecognition();
    }
  };

  useEffect(() => {
    window.clearTimeout(speakTimerRef.current);
    window.speechSynthesis?.cancel();

    if (!voiceOn || !question) return undefined;

    speakTimerRef.current = window.setTimeout(() => {
      speakQuestion();
    }, 2000);

    return () => {
      window.clearTimeout(speakTimerRef.current);
      window.speechSynthesis?.cancel();
    };
  }, [question, voiceOn, speakQuestion]);

  useEffect(
    () => () => {
      stopRecognition();
      stopCamera();
      window.clearTimeout(speakTimerRef.current);
      window.speechSynthesis?.cancel();
    },
    [stopCamera, stopRecognition],
  );

  return (
    <section className="mb-4 rounded-2xl border border-white/[0.08] bg-[#111315] p-3">
      <div className="mb-3 flex items-center justify-between px-1">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
            AI interviewer
          </p>
        </div>
        <span
          className="h-2 w-2 rounded-full bg-emerald-400"
          aria-label="Agent ready"
        />
      </div>
      <div className="relative mb-3 flex aspect-[16/10] items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#252933] via-[#15171d] to-[#0d0f12]">
        <div className="flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] shadow-[0_0_55px_rgba(255,255,255,0.08)]">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-[42%] bg-[#d6d9df]">
              <span className="absolute left-3 top-5 h-1 w-1 rounded-full bg-[#252933]" />
              <span className="absolute right-3 top-5 h-1 w-1 rounded-full bg-[#252933]" />
              <span className="absolute bottom-3 h-1 w-4 rounded-full bg-[#777e8b]" />
            </div>
          </div>
          <p className="mt-3 text-[10px] text-white/50">RIO Interview Agent</p>
        </div>
      </div>
      <div className="relative mb-3 aspect-[16/9] overflow-hidden rounded-xl border border-white/10 bg-black/40">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`h-full w-full object-cover ${cameraOn ? "block" : "hidden"}`}
        />
        {!cameraOn && (
          <div className="flex h-full items-center justify-center text-center text-[10px] text-white/40">
            Camera is off
            <br />
            Preview only — not recorded
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button
          type="button"
          onClick={toggleCamera}
          className="flex flex-col items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2 text-[9px] text-white/70 hover:bg-white/[0.08]"
        >
          {cameraOn ? <FiVideoOff size={15} /> : <FiVideo size={15} />}
          {cameraOn ? "Camera off" : "Camera on"}
        </button>
        <button
          type="button"
          onClick={toggleMic}
          className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-[9px] ${micOn ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]"}`}
        >
          {micOn ? <FiMic size={15} /> : <FiMicOff size={15} />}
          {micOn ? "Listening" : "Answer by voice"}
        </button>
        <button
          type="button"
          onClick={() => setVoiceOn((value) => !value)}
          className="flex flex-col items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2 text-[9px] text-white/70 hover:bg-white/[0.08]"
        >
          {voiceOn ? <FiVolume2 size={15} /> : <FiVolumeX size={15} />}
          {voiceOn ? "Voice on" : "Voice off"}
        </button>
        <button
          type="button"
          onClick={speakQuestion}
          disabled={!voiceOn || !question}
          className="flex flex-col items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2 text-[9px] text-white/70 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FiVolume2 size={15} />
          Speak Again
        </button>
      </div>
      {transcript && (
        <p className="mt-3 rounded-lg bg-white/[0.035] p-2 text-[10px] leading-5 text-white/55">
          Recognized: {transcript}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="mt-3 rounded-lg border border-amber-200/10 bg-amber-200/[0.04] p-2 text-[10px] leading-5 text-amber-100/80"
        >
          {notice}
        </p>
      )}
      <p className="mt-3 text-[9px] leading-4 text-white/35">
        Voice recognition depends on browser support and permissions. If
        unavailable, use the answer box as usual.
      </p>
    </section>
  );
}
