import { useRef } from "react";
import SOLO_THEMES, { Theme } from "../../../../constants/solo-themes";

interface ThemeRadioInputProps {
  theme: string;
  themeSelected: Theme;
}

export const ThemeRadioInput: React.FC<ThemeRadioInputProps> = ({
  theme,
  themeSelected,
  ...rest
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    name,
    headerBackground,
    headerForeground,
    backgroundPrimary,
    backgroundSecondary,
    profileBorder,
    textPrimary,
    textSecondary,
    icons,
    footerBackground,
    footerForeground,
  } = SOLO_THEMES[theme];

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className={
        "w-full flex flex-col items-center cursor-pointer bg-gray-900 rounded-md transition border-2 border-gray-900 hover:border-blue-500 " +
        (themeSelected.key === theme ? "border-blue-500" : "")
      }
    >
      <div className="w-full flex px-4 py-2 items-center justify-start gap-2 pointer-events-none">
        <input
          ref={inputRef}
          type="radio"
          id={"radio-" + theme}
          name="theme"
          value={theme}
          onChange={() => {}}
          checked={themeSelected.key === theme}
          className="hidden"
          {...rest}
        />
        <label htmlFor={"radio-" + theme} className="flex items-center justify-between w-full">
          {name}
          <div className="flex h-7 rounded-md overflow-hidden">
            <div className="w-9 h-full" style={{ background: textPrimary }}></div>
            <div className="w-9 h-full" style={{ background: textSecondary }}></div>
            <div className="w-9 h-full" style={{ background: backgroundPrimary }}></div>
            <div className="w-9 h-full" style={{ background: icons }}></div>
          </div>
        </label>
      </div>
    </div>
  );
};
