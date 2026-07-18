import { useEffect, useState } from "react";

function formatLockText(kickoffAt: string): string {
  const secondsUntilKickoff = Math.max(
    0,
    Math.ceil((new Date(kickoffAt).getTime() - Date.now()) / 1000),
  );
  const hours = Math.floor(secondsUntilKickoff / 3600);
  const minutes = Math.floor((secondsUntilKickoff % 3600) / 60);
  const seconds = secondsUntilKickoff % 60;

  if (hours > 0) return `Locks in ${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `Locks in ${minutes}m ${seconds}s`;
  return `Locks in ${seconds}s`;
}

/** Texte "Locks in Xh Ym Zs" jusqu'au coup d'envoi, rafraichi chaque seconde. */
export function useCountdown(kickoffAt: string): string {
  const [lockText, setLockText] = useState(() => formatLockText(kickoffAt));

  useEffect(() => {
    setLockText(formatLockText(kickoffAt));
    const id = setInterval(() => setLockText(formatLockText(kickoffAt)), 1_000);
    return () => clearInterval(id);
  }, [kickoffAt]);

  return lockText;
}
