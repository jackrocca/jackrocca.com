import { useState, useEffect } from "react";

export const useScrolledPast = (threshold = 0) => {
  const [isScrolledPast, setIsScrolledPast] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolledPast(window.scrollY > threshold);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);
  return isScrolledPast;
};
