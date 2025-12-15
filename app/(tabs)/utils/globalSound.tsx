import { useEffect, useState } from "react";
import { soundManager } from "./soundManager";

export const globalSound = () => {
  const [isSoundPlaying, setIsSoundPlaying] = useState(
    soundManager.getIsPlaying()
  );

  useEffect(() => {
    const removeListener = soundManager.addListener((playing) => {
      setIsSoundPlaying(playing);
    });

    return removeListener;
  }, []);

  const toggleSound = async () => {
    try {
      await soundManager.toggle();
    } catch (error) {
      console.error("Error toggling sound:", error);
    }
  };

  return { isSoundPlaying, toggleSound };
};
