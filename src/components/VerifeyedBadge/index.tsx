import { IMAGE_KIT_ENDPOINT_URL } from "../../constants/images";
// @ts-ignore
import { IKImage } from "imagekitio-react";
import { ShieldCheckIcon } from "@heroicons/react/solid";
import { useTooltipState, Tooltip, TooltipArrow, TooltipReference } from "reakit/Tooltip";


export const VerifeyedBadge: React.FC = () => {
  const tooltipVerified = useTooltipState({ placement: "bottom-end" });

  return (
    <>
      <TooltipReference {...tooltipVerified}>
      <div className="cursor-pointer border border-blue-300 text-blue-300 rounded-md px-3 py-2 mx-2">
        <ShieldCheckIcon className="w-6 h-6 sm:w-7 sm:h-5 mr-1 inline" />
        <span className="relative top-px text-sm inline">Verifeyed</span>
        </div>
      </TooltipReference>
      <Tooltip {...tooltipVerified}>
      <div className="bg-black text-white rounded-md p-2 max-w-xs">
      <p className="text-xs">Verifeyed NFTs are authenticated against a mint hash list submitted by collections via our creator portal. While we may have some basic requirements for verification of collections, this does not mean that they have been endorsed or curated by DigitalEyes. Please check our FAQ for more details. </p>
      </div>
      </Tooltip>
    </>
  );
};
