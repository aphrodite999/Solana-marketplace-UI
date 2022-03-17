import { IMAGE_KIT_ENDPOINT_URL } from "../../constants/images";
// @ts-ignore
import { IKImage } from "imagekitio-react";
import { ExclamationIcon } from "@heroicons/react/solid";
import { useTooltipState, Tooltip, TooltipArrow, TooltipReference } from "reakit/Tooltip";


export const UnverifeyedBadge: React.FC = () => {
  const tooltipUnverified = useTooltipState({ placement: "bottom-end" });

  return (
    <>
      <TooltipReference {...tooltipUnverified}>
      <div className="cursor-pointer border border-yellow-600 text-yellow-600 rounded-md px-3 py-2 mx-2">
        <ExclamationIcon className="w-6 h-6 sm:w-7 sm:h-5 mr-1 inline" />
        <span className="relative top-px text-sm inline">Unverifeyed</span>
        </div>
      </TooltipReference>
      <Tooltip {...tooltipUnverified}>
      <div className="bg-black text-white rounded-md p-2 max-w-xs">
      <p className="text-xs">This collection is either pending verification or has not met our verification requirements. Please buy at your own discretion. Please check our FAQ for more details. </p>
      </div>
      </Tooltip>
    </>
  );
};
