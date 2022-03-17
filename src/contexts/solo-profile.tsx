import { createContext, Dispatch, SetStateAction, useEffect, useState } from "react";
import { Theme } from "../constants/solo-themes";
import { hasEnoughContrast } from "../utils/themes";

interface ISoloProfileContextProvider {
  children: React.ReactNode;
}

interface ISoloProfileContext {
  isProfilePage: boolean;
  setIsProfilePage: Dispatch<SetStateAction<boolean>>;
  profileTheme: Theme;
  setProfileTheme: Dispatch<SetStateAction<Theme>>;
}

const SoloProfileContext = createContext({} as ISoloProfileContext);

export function SoloProfileContextProvider({ children }: ISoloProfileContextProvider) {
  const [isProfilePage, setIsProfilePage] = useState<boolean>(false);
  const [profileTheme, setProfileTheme] = useState<Theme>({} as Theme);
  const [hasBeenValidated, setHasBeenValidated] = useState(false);

  useEffect(() => {
    if (profileTheme.key !== "custom") return;
    if (hasBeenValidated) {
      setHasBeenValidated(false);
      return;
    }

    const isHeaderColorsContrastValid = hasEnoughContrast(
      profileTheme.headerBackground,
      profileTheme.headerForeground
    );

    const isFooterColorsContrastValid = hasEnoughContrast(
      profileTheme.footerBackground,
      profileTheme.footerForeground
    );

    if (isHeaderColorsContrastValid && isFooterColorsContrastValid) {
      return;
    }

    if (!isHeaderColorsContrastValid) {
      const isHeaderWhiteForegroundValid = hasEnoughContrast(
        profileTheme.headerBackground,
        "#FFFFFF"
      );

      setProfileTheme((previousTheme) => ({
        ...previousTheme,
        headerForeground: isHeaderWhiteForegroundValid ? "#FFFFFF" : "#000000",
      }));
    }

    if (!isFooterColorsContrastValid) {
      const isFooterWhiteForegroundValid = hasEnoughContrast(
        profileTheme.footerBackground,
        "#FFFFFF"
      );

      setProfileTheme((previousTheme) => ({
        ...previousTheme,
        footerForeground: isFooterWhiteForegroundValid ? "#FFFFFF" : "#000000",
      }));
    }

    setHasBeenValidated(true);
  }, [profileTheme]);

  return (
    <SoloProfileContext.Provider
      value={{ isProfilePage, setIsProfilePage, profileTheme, setProfileTheme }}
    >
      {children}
    </SoloProfileContext.Provider>
  );
}

export default SoloProfileContext;
