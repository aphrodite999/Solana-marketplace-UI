import { createContext, Dispatch, SetStateAction, useState } from "react";
import SOLO_THEMES, { Theme } from "../constants/solo-themes";

interface ICustomThemeContextProvider {
  children: React.ReactNode;
}

interface ICreateThemeContext {
  customTheme: Theme;
  setCustomTheme: Dispatch<SetStateAction<Theme>>;
}

const CustomThemeContext = createContext({} as ICreateThemeContext);

export function CustomThemeContextProvider({ children }: ICustomThemeContextProvider) {
  const [customTheme, setCustomTheme] = useState<Theme>({
    name: "Digital Eyes",
    key: "custom",
    headerBackground: "#0E0E0E",
    headerForeground: "#FFFFFF",
    backgroundPrimary: "#0E0E0E",
    backgroundSecondary: "#242424",
    profileBorder: "#0E0E0E",
    textPrimary: "#FFFFFF",
    textSecondary: "#9F9F9F",
    icons: "#FFFFFF",
    footerBackground: "#181818",
    footerForeground: "#FFFFFF",
  });

  return (
    <CustomThemeContext.Provider value={{ customTheme, setCustomTheme }}>
      {children}
    </CustomThemeContext.Provider>
  );
}

export default CustomThemeContext;
