"use client";

interface MicButtonProps {
  isListening: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export default function MicButton({
  isListening,
  onClick,
  disabled = false,
}: MicButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-20 h-20 min-w-[64px] min-h-[64px] rounded-full flex items-center justify-center text-4xl shadow-lg transition-colors active:scale-95 ${
        isListening
          ? "bg-red-500 animate-pulse-mic"
          : "bg-pink-400 hover:bg-pink-500"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      aria-label={isListening ? "Berhenti mendengar" : "Mulai bicara"}
    >
      &#127908;
    </button>
  );
}
