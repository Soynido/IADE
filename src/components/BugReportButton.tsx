/**
 * Composant de rapport de bugs
 * Permet aux utilisateurs de signaler des problèmes sans inscription
 */

import { useState } from "react";
import { Bug, Send, CheckCircle } from "lucide-react";

export function BugReportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const sendBug = async () => {
    if (!message.trim()) return;

    setSending(true);
    
    try {
      await fetch("/api/reportBug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: Date.now(),
          screenResolution: `${window.screen.width}x${window.screen.height}`,
        }),
      });
      
      setSent(true);
      setMessage("");
      
      // Réinitialiser après 3 secondes
      setTimeout(() => {
        setSent(false);
        setIsOpen(false);
      }, 3000);
    } catch (error) {
      console.error("Erreur envoi bug:", error);
      alert("Erreur lors de l'envoi. Réessayez plus tard.");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white rounded-full p-3 shadow-lg hover:bg-red-600 transition-all hover:scale-110 z-50 flex items-center gap-2"
        title="Signaler un bug"
      >
        <Bug className="h-5 w-5" />
        <span className="hidden sm:inline text-sm font-medium">Signaler un bug</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 w-80 sm:w-96 z-50 animate-in slide-in-from-bottom-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bug className="h-5 w-5 text-red-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Signaler un problème
          </h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      {sent ? (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 py-4">
          <CheckCircle className="h-5 w-5" />
          <p className="font-medium">✅ Merci, bug envoyé !</p>
        </div>
      ) : (
        <>
          <textarea
            placeholder="Décris le bug ou ce qui ne marche pas...&#10;&#10;Exemple: 'Les questions ne s'affichent pas dans la section Pharmacologie'"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-3 mb-3 resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={sending}
          />
          
          <div className="flex gap-2">
            <button
              onClick={sendBug}
              disabled={!message.trim() || sending}
              className="flex-1 bg-red-500 text-white rounded-md px-4 py-2 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
            >
              {sending ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Envoyer
                </>
              )}
            </button>
            
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
          </div>
        </>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Vos informations de navigation seront incluses pour nous aider à corriger le bug.
      </p>
    </div>
  );
}

