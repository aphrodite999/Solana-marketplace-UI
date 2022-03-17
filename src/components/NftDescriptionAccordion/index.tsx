import { useHistory, Link } from "react-router-dom";
import { useState } from "react";
import {
  SearchIcon,
  ClipboardCopyIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/outline";
import * as ROUTES from "../../constants/routes";
import { useTooltipState, Tooltip, TooltipArrow, TooltipReference } from "reakit/Tooltip";
import { encodeFiltersToUrl } from "../../utils";
import { styled } from "@mui/material/styles";
import MuiAccordion, { AccordionProps } from "@mui/material/Accordion";
import MuiAccordionSummary, { AccordionSummaryProps } from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";

export interface NFTDescriptionAccordionProps {
  collectionDesc: string;
  mint: string;
}

const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters {...props} />)(
  ({ theme }) => ({
    backgroundColor: "transparent",
    borderRadius: 10,
    boxShadow: "none",
    padding: 0,
    marginTop: 5,
  })
);

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary {...props} />
))(({ theme }) => ({
  flexDirection: "row-reverse",
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({}));

const accorDescLS = localStorage.getItem("accorPanel1") == "panel1" ? false : "panel1";
const accorMintLS = localStorage.getItem("accorPanel2") == "panel2" ? false : "panel2";

export const NFTDescriptionAccordion: React.FC<NFTDescriptionAccordionProps> = ({
  collectionDesc,
  mint
}) => {
  const [expandedPanel1, setExpandedPanel1] = useState<string | false>(accorDescLS);
  const [expandedPanel2, setExpandedPanel2] = useState<string | false>(accorMintLS);
  const tooltipCopy = useTooltipState();
  const [copied, setCopied] = useState<boolean>(false);

  const copyLink = () => {
    setCopied(true);
    navigator.clipboard.writeText(`${mint}`);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleChange = (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    if (panel === "panel1") {
      setExpandedPanel1(newExpanded ? panel : false);
      localStorage.setItem("accorPanel1", expandedPanel1.toString());
    } else if (panel === "panel2") {
      setExpandedPanel2(newExpanded ? panel : false);
      localStorage.setItem("accorPanel2", expandedPanel2.toString());
    }
  };

  return (
    <div>
      {!!collectionDesc && (
        <>
          <Accordion expanded={expandedPanel1 === "panel1"} onChange={handleChange("panel1")}>
            <AccordionSummary aria-controls="pan2d-content" id="pan2d-header">
              <div className="flex justify-between items-center w-full">
                <div className="text-white text-lg uppercase text-left">About the Collection</div>
                <ChevronDownIcon
                  className={
                    expandedPanel1 === "panel1"
                      ? "w-5 justify-self-end self-center text-white transition-transform transform rotate-180"
                      : "w-5 justify-self-end self-center text-white transition-transform transform rotate-0"
                  }
                />
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <div className="pb-6 leading-loose col-span-2 text-sm text-left text-white opacity-50">
                {collectionDesc}
              </div>
            </AccordionDetails>
          </Accordion>
          <hr className="opacity-20" />
          <Accordion expanded={expandedPanel2 === "panel2"} onChange={handleChange("panel2")}>
            <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
              <div className="grid grid-cols-2 w-full">
                <div className="text-white text-lg uppercase text-left">mint id</div>
                <ChevronDownIcon
                  className={
                    expandedPanel2 === "panel2"
                      ? "w-5 justify-self-end self-center text-white transition-transform transform rotate-180"
                      : "w-5 justify-self-end self-center text-white transition-transform transform rotate-0"
                  }
                />
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <div className="flex items-center">
                <Link
                  to={{
                    pathname: `https://explorer.solana.com/address/${mint}`,
                  }}
                  className="text-blue-500 text-sm flex-auto text-left truncate ..."
                  target="_blank"
                  rel="noreferrer"
                >
                  {mint}
                </Link>
                <button
                  className="hover:text-white w-full justify-end flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    copyLink();
                  }}
                >
                  <TooltipReference {...tooltipCopy}>
                    <span className="text-white self-end">
                      <ClipboardCopyIcon className="h-5 w-5 ml-2" />
                    </span>
                  </TooltipReference>
                  <Tooltip {...tooltipCopy} style={{ background: "none" }}>
                    <div className="bg-black text-xs p-2 rounded-md">
                      <TooltipArrow {...tooltipCopy} />
                      {copied ? "Copied :)" : "Copy Link"}
                    </div>
                  </Tooltip>
                </button>
              </div>
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </div>
  );
};
