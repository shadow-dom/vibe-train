import { useEffect, useCallback } from "react";
import confetti from "canvas-confetti";

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  pointsEarned: number | null;
  nextLessonTitle?: string;
  onNextLesson?: () => void;
}

export function SuccessModal({ open, onClose, pointsEarned, nextLessonTitle, onNextLesson }: SuccessModalProps) {
  const fireConfetti = useCallback(() => {
    const duration = 1500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ["#22c55e", "#3b82f6", "#a855f7", "#eab308", "#ef4444"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ["#22c55e", "#3b82f6", "#a855f7", "#eab308", "#ef4444"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    // Initial big burst
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.6 },
      colors: ["#22c55e", "#3b82f6", "#a855f7", "#eab308", "#ef4444"],
    });

    requestAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (open) fireConfetti();
  }, [open, fireConfetti]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div
        className="relative bg-card border rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-scale-in text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-5xl mb-4 animate-bounce-in">&#127881;</div>
        <h2 className="text-2xl font-bold mb-2">Lesson Complete!</h2>
        {pointsEarned !== null && pointsEarned > 0 && (
          <div className="text-lg text-green-500 font-semibold mb-4 animate-points-in">
            +{pointsEarned} points
          </div>
        )}
        {pointsEarned === 0 && (
          <p className="text-sm text-muted-foreground mb-4">Solution was viewed — no points awarded</p>
        )}
        <div className="flex flex-col gap-2 mt-4">
          {nextLessonTitle && onNextLesson && (
            <button
              onClick={onNextLesson}
              className="px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
            >
              Next: {nextLessonTitle}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            {nextLessonTitle ? "Stay here" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
