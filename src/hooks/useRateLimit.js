import { useState, useEffect } from "react";

/**
 * Hook para evitar múltiplos envios seguidos de um formulário.
 * Ele salva no localStorage o último envio para inibir bots que recarregam a página.
 * 
 * @param {string} actionKey - Chave única da ação (ex: 'contact_form_last_submit')
 * @param {number} cooldownSeconds - Segundos que a trava deve durar
 */
export function useRateLimit(actionKey, cooldownSeconds = 15) {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const checkRateLimit = () => {
      const lastSubmit = localStorage.getItem(actionKey);
      if (lastSubmit) {
        const timePassed = (Date.now() - parseInt(lastSubmit, 10)) / 1000;
        if (timePassed < cooldownSeconds) {
          setIsRateLimited(true);
          setTimeLeft(Math.ceil(cooldownSeconds - timePassed));
        } else {
          setIsRateLimited(false);
          setTimeLeft(0);
        }
      }
    };

    checkRateLimit();
    const interval = setInterval(checkRateLimit, 1000);
    return () => clearInterval(interval);
  }, [actionKey, cooldownSeconds]);

  const registerSubmit = () => {
    localStorage.setItem(actionKey, Date.now().toString());
    setIsRateLimited(true);
    setTimeLeft(cooldownSeconds);
  };

  return { isRateLimited, timeLeft, registerSubmit };
}
