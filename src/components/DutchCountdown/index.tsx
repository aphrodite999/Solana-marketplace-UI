import { ShieldCheckIcon } from "@heroicons/react/solid"
import { useHistory } from "react-router-dom"
import {
  Tooltip,
  TooltipArrow,
  TooltipReference,
  useTooltipState,
} from "reakit/Tooltip"
import BonfidaImage from "../../assets/logo/bonfida.png"
import BonfidaImageTwo from "../../assets/logo/bonfida2.png"
import {
  DomainNameAndAuction,
  useDomainListing,
} from "../../contexts/domainListings"
import * as ROUTES from "../../constants/routes"
import { useEffect, useState } from "react"
import FidaIcon from "../../assets/logo/fida-icon.png"
import { useWallet } from "../../contexts"
import { getDomainFloorPrice } from "../../utils/getDomianFloorPrice"
import { AuctionData } from "@bonfida/name-auctioning"
import { Connection } from "@solana/web3.js"

interface DutchCountdownProps {
  timeLeft: number;
}

export const DutchCountdown : React.FC<DutchCountdownProps> = ({ timeLeft }) => {
  const tooltipVerified = useTooltipState()
  const [isTimerStarted, setIsTimerStarted] = useState(false)
  const [timeLeftOnCounter, setTimeLeftOnCounter] = useState<number>(timeLeft)


  useEffect(() => {
    setTimeout(() => {
      setTimeLeftOnCounter(timeLeftOnCounter - 1)
}, 1000);
  },)


  const countDown = () => {
    if (timeLeft) {
      const days = Math.floor(timeLeftOnCounter / 24 / 60 / 60)
      const hoursLeft = Math.floor(timeLeftOnCounter - days * 86400)
      const hours = Math.floor(timeLeftOnCounter / 3600)
      const minutesLeft = Math.floor(timeLeftOnCounter - hours * 3600)
      const minutes = Math.floor(timeLeftOnCounter / 60)
      const remainingSeconds = Math.floor(timeLeftOnCounter % 60)
      return { days, hours, minutes, remainingSeconds }
    }
  }

  const time = countDown()

  const timeContainerClass =
    "justify-between shadow-xl bg-transparent opacity-70 rounded-lg border-2 border-color-main-gray-medium hover:bg-color-main-gray-medium flex rounded-md m-1 w-10 h-10 p-2"


  return (
    <div className="flex">
      <div className={timeContainerClass}>
        <p className="m-auto">{time?.days}</p>
      </div>{" "}
      <div className={timeContainerClass}>
        <p className="m-auto">{time?.hours}</p>
      </div>{" "}
      <div className={timeContainerClass}>
        <p className="m-auto">{time?.minutes}</p>
      </div>{" "}
      <div className={timeContainerClass}>
        <p className="m-auto"> {time?.remainingSeconds}</p>
      </div>
    </div>
  )
}
