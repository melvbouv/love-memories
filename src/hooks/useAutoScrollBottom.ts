import { useEffect } from "react";

export function useAutoScrollBottom(trigger: any) {
  useEffect(() => {
    // attend la fin du paint
    requestAnimationFrame(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    });
  }, [trigger]);
}