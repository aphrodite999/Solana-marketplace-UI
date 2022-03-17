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

interface DomainCardProps {
  domain: DomainNameAndAuction
  connection: Connection
}

export const DomainCard = ({ domain, connection }: DomainCardProps) => {
  const tooltipVerified = useTooltipState()
  const { wallet } = useWallet()
  const [isTimerStarted, setIsTimerStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number>()
  const [userIsWinner, setUserIsWinner] = useState(false)
  const { isUserWinner } = useDomainListing()

  const { push } = useHistory()

  const goToDomainItem = () => {
    push(
      `${ROUTES.DOMAIN_ITEM}/${
        domain.name ? domain.name : domain.auctionApiData?.domainName
      }`
    )
  }

  const inUsersWallet = wallet?.domainNames?.find((localDomain) =>
    localDomain?.name === domain?.name
      ? domain?.name
      : domain?.auctionApiData?.domainName
  )

  useEffect(() => {
    if (connection && wallet && domain && domain?.name) {
      ;(async () => {
        const isWinner = await isUserWinner(
          connection,
          wallet,
          domain
        )
        setUserIsWinner(isWinner)
      })()
    }
  }, [connection, domain, wallet])

  useEffect(() => {
    if (domain?.auctionData?.endedAt && !timeLeft) {
      const time =
        parseInt(domain?.auctionData?.endedAt?.toString() as string) -
        new Date().getTime() / 1000
      setTimeLeft(time)
    }
  }, [timeLeft, domain?.auctionData?.endedAt])

  let interval: any
  useEffect(() => {
    if (!isTimerStarted) {
      interval = setInterval(() => {
        setTimeLeft((time) => time && time - 1)
      }, 1000)
      setIsTimerStarted(true)
    }
  }, [isTimerStarted])

  useEffect(
    () => () => {
      clearInterval(interval)
    },
    []
  )

  const countDown = () => {
    if (timeLeft) {
      const days = Math.floor(timeLeft / 24 / 60 / 60)
      const hoursLeft = Math.floor(timeLeft - days * 86400)
      const hours = Math.floor(hoursLeft / 3600)
      const minutesLeft = Math.floor(hoursLeft - hours * 3600)
      const minutes = Math.floor(minutesLeft / 60)
      const remainingSeconds = Math.floor(timeLeft % 60)
      return `${days}:${hours}:${minutes}:${remainingSeconds}`
    }
  }

  const bidsList = domain?.auctionData?.bidState?.bids?.map((b: any) =>
    b.amount.toNumber()
  )

  const priceFloor = getDomainFloorPrice(domain?.auctionData as AuctionData)

  return (
    <li
      onClick={goToDomainItem}
      className="col-span-1 flex flex-col justify-between w-full bg-color-main-gray-medium cursor-pointer overflow-hidden mx-auto md:mx-0 rounded-lg transition-all hover:bg-gray-800"
    >
      <div className="relative flex bg-bonfida-navy aspect-w-16 aspect-h-16 rounded-lg">
        <img
          className="opacity-40 z-1 absolute translate-x-1/2"
          src={BonfidaImageTwo}
        />
        <img
          className="bottom-0 opacity-40 z-1 absolute translate-x-1/2"
          src={BonfidaImage}
        />
        <div className="flex p-1">
          <p className="text-2xl break-all z-2 px-2 text-center m-auto">
            {domain?.name ? domain.name : domain?.auctionApiData?.domainName}
          </p>
        </div>
      </div>

      <div className="flex flex-col flex-1 relative">
        <div className="flex flex-wrap justify-start p-2.5">
          <div className="flex-1">
            <p className="text-white text-sm font-bold text-left">
              Bonfida domain
            </p>
          </div>
          <div className="group">
            <TooltipReference {...tooltipVerified}>
              <span className="text-gray-400 w-5 h-5 self-start inline-block">
                <ShieldCheckIcon className="group-hover:text-solana-teal transition 150 ease-in-out" />
              </span>
            </TooltipReference>
            <Tooltip {...tooltipVerified} style={{ background: "none" }}>
              <div className="bg-black text-xs p-2 rounded-md">
                <TooltipArrow {...tooltipVerified} />
                Verifeyed
              </div>
            </Tooltip>
          </div>
        </div>
        <div className="flex flex-1 flex-wrap justify-start px-2.5">
          {timeLeft && timeLeft > 0 && (
            <div className="flex flex-col pb-2">
              {bidsList && bidsList?.length > 0 ? (
                <>
                  <p>Current bid: </p>
                  <div className="flex">
                    <img src={FidaIcon} className="my-auto mr-1 h-6 w-6" />
                    <p className="font-bold text-xl">
                      {Math.max(...bidsList) / Math.pow(10, 6)}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p className="mb-1">Min price: </p>
                  <div className="flex">
                    <img src={FidaIcon} className="my-auto mr-1 h-6 w-6" />
                    <p className="font-bold text-xl">
                      {(priceFloor * 1.05).toFixed(3)}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex mt-auto justify-between items-center text-gray-400 bg-color-main-gray-lighter">
          {timeLeft && timeLeft > 0 && userIsWinner && (
            <p className="text-xs m-auto p-3 text-gray-400">
              Your winning this auction
            </p>
          )}
          {timeLeft && timeLeft > 0 ? (
            <p className="text-xs m-auto p-3 text-gray-400">
              Ends in: {countDown()}
            </p>
          ) : !inUsersWallet &&
            (userIsWinner ||
              domain.domainOwner?.toString() ===
                wallet?.publicKey?.toString()) ? (
            <p className="text-xs m-auto p-3 text-gray-400">Unclaimed</p>
          ) : (
            !inUsersWallet && (
              <p className="text-xs m-auto p-3 text-gray-400">
                Auction has finished
              </p>
            )
          )}
        </div>
      </div>
    </li>
  )
}
