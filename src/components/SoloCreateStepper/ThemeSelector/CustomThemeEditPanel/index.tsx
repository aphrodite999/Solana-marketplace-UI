import { useContext, useEffect, useState } from "react";
import CustomThemeContext from "../../../../contexts/custom-theme";
import { CustomThemeColorButton } from "../CustomThemeColorButton";
import { ThemeSkeleton } from "../ThemeSkeleton";
import { toSentenceCase } from "../../../../utils/strings";
import { hasEnoughContrast } from "../../../../utils";
import { InformationCircleIcon } from "@heroicons/react/outline";
import { ExclamationIcon } from "@heroicons/react/solid";
import { ThemeRadioInput } from "../ThemeRadioInput";

export const CustomThemeEditPanel: React.FC = () => {
  const { customTheme, setCustomTheme } = useContext(CustomThemeContext);
  const [currentColorSelected, setCurrentColorSelected] = useState<string>("");
  const [contrastValidatedList, setContrastValidatedList] = useState<any>({
    headerForeground: false,
    textPrimary: false,
    textSecondary: false,
    icons: false,
    footerForeground: false,
  });
  const [hasInvalidColors, setHasInvalidColors] = useState<boolean>(false);

  const updateCustomThemeColor = (key: string, value: string) => {
    const newThemeValues: any = { ...customTheme };
    newThemeValues[key] = value;

    setCustomTheme(newThemeValues);
  };

  // Contrast validation
  useEffect(() => {
    const isHeaderForegroundValid = hasEnoughContrast(
      customTheme.headerForeground,
      customTheme.headerBackground
    );
    const isTextPrimaryValid = hasEnoughContrast(
      customTheme.textPrimary,
      customTheme.backgroundPrimary
    );
    const isTextSecondaryValid = hasEnoughContrast(
      customTheme.textSecondary,
      customTheme.backgroundPrimary
    );
    const isIconsValid = hasEnoughContrast(customTheme.icons, customTheme.backgroundPrimary);
    const isFooterForegroundValid = hasEnoughContrast(
      customTheme.footerForeground,
      customTheme.footerBackground
    );

    if (
      isHeaderForegroundValid &&
      isTextPrimaryValid &&
      isTextSecondaryValid &&
      isIconsValid &&
      isFooterForegroundValid
    )
      setHasInvalidColors(false);
    else setHasInvalidColors(true);

    setContrastValidatedList({
      headerForeground: isHeaderForegroundValid,
      textPrimary: isTextPrimaryValid,
      textSecondary: isTextSecondaryValid,
      icons: isIconsValid,
      footerForeground: isFooterForegroundValid,
    });
  }, [customTheme]);

  return (
    <main className="relative overflow-auto md:grid md:grid-cols-2 my-8 md:gap-6">
      <section className="w-full flex flex-col">
        <ThemeSkeleton theme={customTheme} />
        <div className="my-5 rounded-md bg-black bg-opacity-10 p-3">
          <div className="flex-col">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <InformationCircleIcon className="w-4 h-4" />
              Currently editing
            </span>
            <h1 className="text-lg text-white font-semibold">
              {currentColorSelected
                ? toSentenceCase(currentColorSelected)
                : "Select an attribute to edit"}
            </h1>
          </div>
        </div>
        {hasInvalidColors && (
          <div className="rounded-md bg-red-500 bg-opacity-10 p-3">
            <div className="flex-col">
              <span className="text-sm text-red-500 flex items-center gap-1">
                <ExclamationIcon className="w-4 h-4 text-red-500" />
                Low contrast on the following colors
              </span>
              <div className="flex-col  gap-2">
                {Object.keys(contrastValidatedList).map((attr: string, index: number) => {
                  if (!contrastValidatedList[attr]) {
                    return (
                      <h1
                        key={index}
                        className="text-lg text-white font-semibold whitespace-nowrap"
                      >
                        · {toSentenceCase(attr)}
                      </h1>
                    );
                  }
                })}
              </div>
            </div>
          </div>
        )}
      </section>
      <section className="w-full gap-2 flex flex-col">
        {Object.keys(customTheme).map((attrKey: string, index: number) => {
          if (attrKey === "name" || attrKey === "key") return;

          return (
            <CustomThemeColorButton
              key={index}
              attr={attrKey}
              //@ts-ignore
              currentColor={customTheme[attrKey]}
              updateColorCallback={updateCustomThemeColor}
              currentColorSelected={currentColorSelected}
              setCurrentColorSelected={setCurrentColorSelected}
              isColorValid={
                contrastValidatedList.hasOwnProperty(attrKey)
                  ? contrastValidatedList[attrKey]
                  : true
              }
            />
          );
        })}
        {/* This is a placeholder in the case a color is being editing this eliminates CLS */}
        {currentColorSelected !== "" && (
          <div className="w-full cursor-pointer flex flex-row items-center justify-between p-3 gap-10 opacity-0 pointer-events-none">
            <span className="font-normal text-gray-400 whitespace-nowrap transition text-sm group-hover:text-white pointer-events-none flex items-center">
              PLACEHOLDER
            </span>
            <span className="w-12 h-7 rounded-sm border border-gray-700  pointer-events-none"></span>
          </div>
        )}
      </section>
    </main>
  );
};
