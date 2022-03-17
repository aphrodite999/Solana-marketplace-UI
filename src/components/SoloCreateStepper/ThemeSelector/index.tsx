import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import SOLO_THEMES, { Theme } from "../../../constants/solo-themes";
import { PencilAltIcon } from "@heroicons/react/outline";
import { InformationCircleIcon } from "@heroicons/react/outline";
import FullscreenModalContext from "../../../contexts/fullscreen-modal";
import CustomThemeContext from "../../../contexts/custom-theme";
import { ThemeSkeleton } from "./ThemeSkeleton";
import { ThemeRadioInput } from "./ThemeRadioInput";
import { CustomThemeEditPanel } from "./CustomThemeEditPanel";

import "./styles.css";
interface ThemeSelectorProps {
  themeSelected: string;
  setThemeSelected: (theme: string) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  themeSelected,
  setThemeSelected,
}) => {
  const { customTheme } = useContext(CustomThemeContext);
  const [hasChangedCustomTheme, setHasChangedCustomTheme] = useState(false);
  const customInputRef = useRef<HTMLInputElement>(null);
  const { openFullscreenModal } = useContext(FullscreenModalContext);

  const currentTheme = JSON.parse(themeSelected);

  const handleThemeChange = (event: any) => {
    const themeKey = event?.target.value;

    if (themeKey === "custom") {
      const selectedThemeJSON = JSON.stringify(customTheme);
      setThemeSelected(selectedThemeJSON);

      return;
    }

    const selectedTheme = SOLO_THEMES[themeKey];
    const selectedThemeJSON = JSON.stringify(selectedTheme);

    setThemeSelected(selectedThemeJSON);
  };

  const handleEditColors = () => {
    openFullscreenModal({
      modalContent: <CustomThemeEditPanel />,
      title: "Choose your custom colors",
      label: "Custom Theme",
      onExitCallback: () => setHasChangedCustomTheme(true),
      buttonText: "close editing theme",
    });
  };

  useEffect(() => {
    if (hasChangedCustomTheme) {
      const selectedThemeJSON = JSON.stringify(customTheme);
      setThemeSelected(selectedThemeJSON);
    }
  }, [customTheme]);

  return (
    <div className="relative flex flex-row w-full my-10 gap-10 rounded-md">
      <div className="w-1/2">
        <ThemeSkeleton theme={currentTheme} />
        <div className="my-5 rounded-md bg-gray-800 bg-opacity-20 p-3">
          <div className="flex-col">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <InformationCircleIcon className="w-4 h-4" />
              Theme selected
            </span>
            <h1 className="text-2xl text-white font-semibold">{currentTheme.name}</h1>
          </div>
        </div>
      </div>
      <form
        onChange={handleThemeChange}
        className="flex flex-col justify-start items-center gap-2 w-1/2"
      >
        <div
          onClick={() => customInputRef.current?.click()}
          className={
            "w-full flex items-center justify-between cursor-pointer bg-gray-900 rounded-md transition border-2 border-gray-900 hover:border-blue-500 " +
            (currentTheme.key === "custom" ? "border-blue-500" : "")
          }
        >
          <div className="w-full flex px-4 py-2 items-center justify-start gap-2 pointer-events-none">
            <input
              ref={customInputRef}
              type="radio"
              id={"radio-custom"}
              name="theme"
              value="custom"
              onChange={() => {}}
              checked={currentTheme.key === "custom"}
              className="hidden"
            />
            <label htmlFor={"radio-custom"} className="flex w-full justify-between items-center">
              Custom theme
              <button
                type="button"
                className="flex bg-black bg-opacity-40 items-center gap-2 justify-center py-2 px-4 hover:bg-opacity-100 hover:bg-blue-600 rounded-md pointer-events-auto transition"
                onClick={handleEditColors}
              >
                <PencilAltIcon className="w-5 h-5 text-white transition group-hover:text-black" />
                <span className="text-sm">edit colors</span>
              </button>
            </label>
          </div>
        </div>
        <hr className="h-px w-3/4 border-gray-900 my-3" />
        {Object.keys(SOLO_THEMES).map((themeKey, index) => (
          <ThemeRadioInput key={index} theme={themeKey} themeSelected={currentTheme} />
        ))}
      </form>
    </div>
  );
};
