import { useEffect } from "react";
import { useLocalStorageState } from "../hooks/useLocalStorageState";
import { FiSun } from "react-icons/fi";
import moon from "../assets/svg/moon.svg";

const ThemeSwitch = () => {
  const [isDarkMode, setIsDarkMode] = useLocalStorageState(
    window.matchMedia("(prefers-color-scheme:dark)").matches
    , "isDaskMode"
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode, setIsDarkMode]);

  function toggleDarkMode() {
    setIsDarkMode((isDark: boolean) => !isDark);
  }
  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      className="cursor-pointer w-12 h-8 place-center"
    >
      {isDarkMode ? (
        <div className="flex justify-center">
          <FiSun className="text-2xl text-white" />
        </div>
      ) : (
        <div className="text-center">
          <img src={moon} alt="moon" className="w-6" />
        </div>
      )}
    </button>
  );
};

export default ThemeSwitch;
