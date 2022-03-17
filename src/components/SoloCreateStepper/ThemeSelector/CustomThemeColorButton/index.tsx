import { Dispatch, useContext, useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { toSentenceCase } from "../../../../utils/strings";
import { ExclamationIcon } from "@heroicons/react/solid";
import CustomThemeContext from "../../../../contexts/custom-theme";
import { hasEnoughContrast } from "../../../../utils";
import { useTooltipState, Tooltip, TooltipArrow, TooltipReference } from "reakit/Tooltip";

interface CustomThemeColorButtonProps {
  attr: string;
  currentColor: string;
  updateColorCallback: (attr: string, color: string) => void;
  currentColorSelected: string;
  setCurrentColorSelected: (attr: string) => void;
  isColorValid: boolean;
}

export const CustomThemeColorButton: React.FC<CustomThemeColorButtonProps> = ({
  attr,
  currentColor,
  updateColorCallback,
  currentColorSelected,
  setCurrentColorSelected,
  isColorValid,
}) => {
  const [color, setColor] = useState<string>(currentColor);
  const pickerContainerRef = useRef(null);
  const tooltipWarning = useTooltipState();

  useEffect(() => {
    updateColorCallback(attr, color);
  }, [color]);

  return (
    <div
      className={`bg-black bg-opacity-30 flex flex-col justify-between bg-modal-traits-bg rounded-md transition overflow-hidden
      ${
        currentColorSelected === "" &&
        " opacity-100 pointer-events-auto group hover:bg-opacity-100 w-full"
      }
      ${
        currentColorSelected === attr && currentColorSelected !== ""
          ? " opacity-100 pointer-events-auto absolute top-0 z-20 bg-opacity-100 group"
          : " opacity-0 pointer-events-none"
      }`}
      onClick={(e: any) => {
        if (currentColorSelected === attr) return setCurrentColorSelected("");
        setCurrentColorSelected(attr);
      }}
      style={{
        width:
          currentColorSelected === attr && currentColorSelected !== "" ? "calc(50% - 0.75rem)" : "",
      }}
    >
      <div className="w-full cursor-pointer flex flex-row items-center justify-between p-3 gap-10">
        <div className="flex gap-2 items-center">
          <span className="font-normal whitespace-nowrap transition text-sm text-white">
            {toSentenceCase(attr)}
          </span>
          {!isColorValid && (
            <>
              <TooltipReference {...tooltipWarning}>
                <ExclamationIcon className="h-5  text-red-500 pointer-events-auto" />
              </TooltipReference>
              <Tooltip {...tooltipWarning} style={{ background: "none" }}>
                <div className="bg-black text-xs p-2 rounded-md">
                  Not enough contrast with background
                </div>
              </Tooltip>
            </>
          )}
        </div>
        <span
          className="w-14 h-7 border-2 border-gray-700 pointer-events-none rounded-md"
          style={{ backgroundColor: color }}
        ></span>
      </div>
      <div
        className={`w-full flex flex-col items-center gap-5 p-5 ${
          currentColorSelected === attr ? " flex" : " hidden"
        }`}
        ref={pickerContainerRef}
      >
        <HexColorPicker
          color={color}
          onChange={setColor}
          onClick={(e: any) => e.stopPropagation()}
          style={{ width: "100%" }}
        />
        <button
          className="w-full bg-blue-700 rounded-md py-2 hover:bg-blue-800 uppercase font-semibold text-sm"
          onClick={(e: any) => {
            e.stopPropagation();
            setCurrentColorSelected("");
          }}
        >
          Save color
        </button>
      </div>
    </div>
  );
};
