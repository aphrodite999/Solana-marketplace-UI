import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useConnection, useWallet, WalletAdapter } from "../../contexts"
import {
  DomainNameAndAuction,
  useDomainListing,
} from "../../contexts/domainListings"
import { shortenAddress, toPublicKey } from "../../utils"
import BonfidaImage from "../../assets/logo/bonfida.png"
import BonfidaImageTwo from "../../assets/logo/bonfida2.png"
import { Page } from "../Page"
import { LoadingWidget } from "../loadingWidget"
import { getDomainList } from "../../utils/getDomainList"
import { SOL_SCAN_BASE_URL } from "../../constants/urls"
import dayjs from "dayjs"
import * as ROUTES from "../../constants/routes"
import FidaIcon from "../../assets/logo/fida-icon.png"
import { DomainName, getUserDomains } from "../../utils/name-service"
import { PublicKey } from "@solana/web3.js"
import { Modal } from "../Modal"
import { getUtcEpoch } from "../../utils/getUtcEpoch"
import { toast } from "react-toastify"
import { Notification } from "../Notification"
import { NotificationModal } from "../NotificationModal"
import { getDomainFloorPrice } from "../../utils/getDomianFloorPrice"
import {
  AuctionData,
  AUCTION_ID,
  getBidderPotKey,
  getDomainKey,
  NameAuction,
} from "@bonfida/name-auctioning"
import { Divider } from "../Divider"
import { StyledSelect } from "../StyledSelect"

export const DomainItem = () => {
  const { domainName }: { domainName: string } = useParams()
  const [resellListingDuration, setResellListingDuration] =
    useState("0000-00-00T00:00")
  const [resellListingBid, setResellListingBid] = useState(0)
  const [bidPrice, setBidPrice] = useState(0)
  const [domainSize, setDomainSize] =
    useState<{ value: number; label: string }>()
  const [resellListingMaxPrice, setResellListingMaxPrice] = useState(0)
  const [isListingModalOpen, setIsListingModalOpen] = useState(false)
  const [isBiddingModalOpen, setIsBiddingModalOpen] = useState(false)
  const [isClaimSizeModalOpen, setIsClaimSizeModalOpen] = useState(false)
  const [buyNowPrice, setBuyNowPrice] = useState<number>()
  const [canCancleBid, setCanCancleBid] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number>()
  const { wallet } = useWallet()
  const [domain, setDomain] = useState<DomainNameAndAuction>()
  const [sellerDomainNames, setSellerDomainNames] =
    useState<(DomainName | undefined)[]>()
  const [userIsWinner, setUserIsWinner] = useState(false)
  const [userHasBid, setUserHasBid] = useState(false)
  const {
    getAuctionInfo,
    resellUserDomain,
    bidOnDomain,
    claimDomain,
    reclaimDomain,
    cancelBidOnDomain,
    canCancelBid,
    isUserWinner,
    userHasBids,
    getBuyNowPrice,
  } = useDomainListing()
  const connection = useConnection()
  const [isTimerStarted, setIsTimerStarted] = useState(false)
  const [sendingTransactionText, setSendingTransactionText] = useState<{
    title: string
    description: string
  }>()

  useEffect(() => {
    if (domainName && connection && !domain) {
      ;(async () => {
        const response = await getAuctionInfo(connection, domainName)
        setDomain(response)
      })()
    }
  }, [domainName, connection, domain])

  useEffect(() => {
    ;(async () => {
      if (domain?.domainOwner && !sellerDomainNames) {
        const domains = await getUserDomains(
          connection,
          domain?.domainOwner as PublicKey
        )
        setSellerDomainNames(domains)
      }
    })()
  }, [domain?.domainOwner, connection])

  useEffect(() => {
    ;(async () => {
      if (domain?.name && connection) {
        const price = await getBuyNowPrice(connection, domain?.name, domain?.auctionData?.resource)
        setBuyNowPrice(price)
      }
    })()
  }, [domain?.name, connection])

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

  const refreshItem = async () => {
    const response = await getAuctionInfo(connection, domainName)
    setDomain(response)
  }

  const countDown = () => {
    if (timeLeft) {
      const days = Math.floor(timeLeft / 24 / 60 / 60)
      const hoursLeft = Math.floor(timeLeft - days * 86400)
      const hours = Math.floor(hoursLeft / 3600)
      const minutesLeft = Math.floor(hoursLeft - hours * 3600)
      const minutes = Math.floor(minutesLeft / 60)
      const remainingSeconds = Math.floor(timeLeft % 60)
      return { days, hours, minutes, remainingSeconds }
    }
  }

  const time = countDown()

  const bidsList = domain?.auctionData?.bidState?.bids?.map((b) =>
    b.amount.toNumber()
  )

  const priceFloor = getDomainFloorPrice(domain?.auctionData as AuctionData)

  const isInUserWallet = wallet?.domainNames?.find(
    (localDomain) => localDomain?.name === domain?.name
  )

  useEffect(() => {
    if (connection && wallet?.publicKey && domain) {
      ;(async () => {
        const response = await canCancelBid(connection, wallet, domain)
        setCanCancleBid(response)
      })()
    }
  }, [domain, connection, wallet?.publicKey])

  useEffect(() => {
    if (connection && wallet?.publicKey && domain?.name) {
      ;(async () => {
        const isWinner = await isUserWinner(
          connection,
          wallet,
          domain
        )
        const hasBid = await userHasBids(connection, wallet, domain)
        setUserIsWinner(
          isWinner &&
            domain?.domainOwner?.toString() !== wallet?.publicKey?.toString()
        )
        setUserHasBid(hasBid)
      })()
    }
  }, [connection, domain, wallet])

  const claim = async () => {
    if (connection && wallet?.publicKey && domain?.name && domain?.nameKey) {
      setSendingTransactionText({
        title: "Claiming your domain",
        description:
          "We are claiming your domain, please wait it shouldn't take long.",
      })
      await claimDomain(
        connection,
        wallet as WalletAdapter,
        domain?.nameKey,
        domain?.name,
        domainSize?.value
      )
      setIsClaimSizeModalOpen(false)
      setSendingTransactionText(undefined)
      refreshItem()
    } else {
      toast.error(
        <Notification
          title="Oops something went wrong"
          description="Please try again something went wrong."
        />
      )
    }
  }

  const reclaim = async () => {
    if (connection && wallet?.publicKey && domain?.name && domain?.nameKey) {
      setSendingTransactionText({
        title: "Claiming your domain",
        description:
          "We are claiming your domain, please wait it shouldn't take long.",
      })
      await reclaimDomain(
        connection,
        wallet as WalletAdapter,
        domain?.nameKey,
        domain?.name
      )
      setSendingTransactionText(undefined)
      refreshItem()
    } else {
      toast.error(
        <Notification
          title="Oops something went wrong"
          description="Please try again something went wrong."
        />
      )
    }
  }

  const handleClaimClick = () => {
    if (domain?.domainOwner?.toString() === wallet?.publicKey?.toString()) {
      reclaim()
    } else if (domain?.domainOwner) {
      claim()
    } else {
      setDomainSize({ value: 1000, label: "1kb" })
      setIsClaimSizeModalOpen(true)
    }
  }

  const sellDomain = async () => {
    const newDate = getUtcEpoch(resellListingDuration)
    const isFuture = newDate > dayjs().unix()

    if (wallet && isFuture && resellListingBid > 0 && domain) {
      setSendingTransactionText({
        title: "Proccessing your domain for auctions",
        description:
          "We are putting your domain up for auction, please wait it shouldn't take long.",
      })
      await resellUserDomain(
        connection,
        wallet,
        wallet?.publicKey as PublicKey,
        new Date(newDate * 1000),
        domain?.nameKey,
        domain?.name,
        resellListingBid,
        resellListingMaxPrice > 0 ? resellListingMaxPrice : undefined
      )
      setSendingTransactionText(undefined)
      setIsListingModalOpen(false)
      refreshItem()
    } else {
      toast.error(
        <Notification
          title="Please fill in all mandatory fields"
          description="Some of the fields entered are incorrect."
        />
      )
    }
  }

  const bidOnItem = async () => {
    const isMinBid =
      bidsList && bidsList?.length > 0
        ? bidPrice > (Math.max(...bidsList) / Math.pow(10, 6)) * 1.05
        : bidPrice > priceFloor * 1.05
    const isNearEnd = timeLeft && timeLeft <= 600
    if (wallet?.publicKey && isMinBid && domain) {
      setSendingTransactionText({
        title: "Placing your bid",
        description: `We're processing your bid for ${domain?.name}, please wait it shouldn't take long.`,
      })
      await bidOnDomain(
        connection,
        wallet,
        domain,
        bidPrice,
        isNearEnd as boolean
      )
      setSendingTransactionText(undefined)
      setIsBiddingModalOpen(false)
      refreshItem()
    } else {
      toast.error(
        <Notification
          title="Bid to low"
          description="Please make sure your bid is above the minimum bid price"
        />
      )
    }
  }

  const buyItemNow = async () => {
    const isNearEnd = timeLeft && timeLeft <= 600
    if (wallet?.publicKey && buyNowPrice && domain) {
      setSendingTransactionText({
        title: "Buying your domain.",
        description: `We're processing your purchase for ${domain?.name}, please wait it shouldn't take long.`,
      })
      await bidOnDomain(
        connection,
        wallet,
        domain,
        buyNowPrice,
        isNearEnd as boolean
      )
      setSendingTransactionText(undefined)
      setIsBiddingModalOpen(false)
      refreshItem()
    } else {
      toast.error(
        <Notification
          title="Oops something went wrong"
          description="Please try again something went wrong."
        />
      )
    }
  }

  const cancelBid = async () => {
    if (wallet?.publicKey && domain) {
      setSendingTransactionText({
        title: "Canceling your bid",
        description: `We're canceling your bid for ${domain?.name}, please wait it shouldn't take long.`,
      })
      await cancelBidOnDomain(connection, wallet, domain)
      setSendingTransactionText(undefined)
      refreshItem()
    } else {
      toast.error(
        <Notification
          title="Oops something went wrong"
          description="Please try again something went wrong."
        />
      )
    }
  }

  const timeContainerClass =
    "justify-between shadow-xl bg-transparent opacity-70 rounded-lg border-2 border-color-main-gray-medium hover:bg-color-main-gray-medium flex rounded-md m-1 w-10 h-10 p-2"

  return (
    <Page className="w-2/3 mx-auto">
      {domain ? (
        <div>
          <div className="flex flex-col text-center mt-16 mb-4">
            <Link
              to={`${ROUTES.COLLECTIONS}/Bonfida`}
              className="text-gray-400 text-base m-auto mb-2 hover:text-blue"
            >
              Bonfida
            </Link>
            <h1 className="h1">
              {isInUserWallet ? "List" : "Buy"} {domain.name}
            </h1>
            <a
              href={
                domain.domainOwner &&
                `${SOL_SCAN_BASE_URL}${domain.domainOwner}`
              }
              target="_blank"
              className="m-auto mt-2 text-gray-400 text-base hover:text-blue"
            >
              {sellerDomainNames
                ? getDomainList(sellerDomainNames)
                : domain.domainOwner &&
                  shortenAddress(domain?.domainOwner?.toString() as string)}
            </a>
          </div>
          <div className="flex flex-col py-10 md:flex-row">
            <div className="relative flex bg-bonfida-navy w-80 h-80 rounded-lg m-auto">
              <img
                className="opacity-40 z-1 absolute translate-x-1/2"
                src={BonfidaImageTwo}
              />
              <img
                className="bottom-0 opacity-40 z-1 absolute translate-x-1/2"
                src={BonfidaImage}
              />
              <div className="flex p-1 w-full">
                <p className="text-3xl z-2 m-auto">{domain?.name}</p>
              </div>
            </div>
            <div className="flex flex-col mt-4 mb-2 w-full md:mt-0 md:w-3/5 md:ml-4">
              <div className="my-4">
                {!isInUserWallet &&
                  domain.auctionData?.priceFloor &&
                  timeLeft &&
                  timeLeft > 0 &&
                  (bidsList && bidsList?.length > 0 ? (
                    <>
                      <p className="text-base text-gray-500 uppercase">
                        Current bid:
                      </p>
                      <div className="flex">
                        <img src={FidaIcon} className="my-auto mr-2 h-6 w-6" />
                        <p className="text-3xl my-auto font-bold text-white">
                          {Math.max(...bidsList) / Math.pow(10, 6)}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-base text-gray-500 uppercase">
                        Min price:
                      </p>
                      <div className="flex">
                        <img src={FidaIcon} className="my-auto mr-2 h-6 w-6" />
                        <p className="text-3xl my-auto font-bold text-white">
                          {(priceFloor * 1.05).toFixed(3)}
                        </p>
                      </div>
                    </>
                  ))}
              </div>
              <div className="flex flex-col">
                {wallet?.publicKey ? (
                  <>
                    <div className="mb-8 mr-2">
                      {!isInUserWallet ? (
                        timeLeft && timeLeft > 0 ? (
                          domain.domainOwner?.toString() !==
                            wallet?.publicKey?.toString() &&
                          !canCancleBid &&
                          (userIsWinner ? (
                            <p>You are the top bidder</p>
                          ) : (
                            !canCancleBid && (
                              <>
                                <button
                                  onClick={() => setIsBiddingModalOpen(true)}
                                  className="btn mr-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                  Make a bid
                                </button>
                                {buyNowPrice && (
                                  <button
                                    onClick={buyItemNow}
                                    className="btn focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                  >
                                    Buy now for {buyNowPrice}
                                  </button>
                                )}
                              </>
                            )
                          ))
                        ) : (
                          wallet?.publicKey &&
                          !isInUserWallet &&
                          ((userIsWinner && userHasBid) ||
                            domain.domainOwner?.toString() ===
                              wallet?.publicKey?.toString()) && (
                            <button
                              onClick={handleClaimClick}
                              className="btn focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                              Claim domain
                            </button>
                          )
                        )
                      ) : (
                        <button
                          onClick={() => setIsListingModalOpen(true)}
                          className="btn focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          List for sale
                        </button>
                      )}
                      {canCancleBid && (
                        <button
                          onClick={cancelBid}
                          className="btn focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Cancel bid
                        </button>
                      )}
                    </div>

                    {domain.domainOwner &&
                      domain.domainOwner?.toString() !==
                        wallet?.publicKey?.toString() && (
                        <div className="mb-8">
                          <Link to={`${ROUTES.INBOX}/${domain?.domainOwner}`}>
                            <button
                              type="button"
                              className="btn btn-gray focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                              Message owner
                            </button>
                          </Link>
                        </div>
                      )}
                  </>
                ) : (
                  <div className="mb-8 mr-2">
                    <button
                      onClick={() => wallet?.connect()}
                      className="btn focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      connect wallet
                    </button>
                  </div>
                )}
              </div>
              <hr className="rounded-lg border-0 m-0 h-1 de-animated-underline" />
              <div className="flex flex-col pt-4">
                {timeLeft && timeLeft > 0 ? (
                  <>
                    <p className="text-white text-lg uppercase text-left ml-1">
                      Time left
                    </p>
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
                  </>
                ) : (
                  !isInUserWallet && (
                    <div>
                      <p className="text-white text-lg uppercase text-left ml-1">
                        Auction has finished
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
          <Modal
            isOpen={isListingModalOpen}
            onCloseClick={() => setIsListingModalOpen(false)}
            className="w-2/3"
          >
            <div className="flex flex-col w-full h-full">
              <h1 className="h1 text-4xl text-center p-4">
                List {domain.name} for sale
              </h1>
              <div className="mx-auto text-center px-10">
                <div className="m-2">
                  <p className="text-xl m-2">End date</p>
                  <input
                    className="ant-input w-full p-4 bg-transparent border border-color-main-blue rounded-lg"
                    onChange={(e: any) =>
                      setResellListingDuration(e.target.value)
                    }
                    value={resellListingDuration}
                    type="datetime-local"
                  />
                </div>
                <div className="flex">
                  <div className="m-2">
                    <p className="text-xl m-2">Minimum bid (FIDA)</p>
                    <input
                      className="ant-input w-full p-4 bg-transparent border border-color-main-blue rounded-lg"
                      onChange={(e: any) => setResellListingBid(e.target.value)}
                      value={resellListingBid}
                      type="number"
                      min="0"
                    />
                  </div>
                  <div className="m-2">
                    <p className="text-xl m-2">Buy now price (optional)</p>
                    <input
                      className="ant-input w-full p-4 bg-transparent border border-color-main-blue rounded-lg"
                      onChange={(e: any) =>
                        setResellListingMaxPrice(e.target.value)
                      }
                      value={resellListingMaxPrice}
                      type="number"
                      min="0"
                    />
                  </div>
                </div>
              </div>
              <button onClick={() => sellDomain()} className="btn m-4 mx-auto">
                List domain
              </button>
            </div>
          </Modal>
          <Modal
            isOpen={isBiddingModalOpen}
            onCloseClick={() => setIsBiddingModalOpen(false)}
            className="w-2/3"
          >
            <div className="flex flex-col w-full h-full text-center">
              <h1 className="h1 text-4xl p-4">Bid on {domain.name}</h1>
              <Divider />
              <p className="m-4 px-16 text-gray-500">
                The price of a bid must be 5% higher than the current price. The
                minimum bid is anything above{" "}
                {(bidsList && bidsList.length > 0
                  ? (Math.max(...bidsList) / Math.pow(10, 6)) * 1.05
                  : priceFloor * 1.05
                ).toFixed(3)}
              </p>

              <div className="mx-auto px-10 mt-4">
                <div className="m-2">
                  <p className="text-xl m-2">Price of bid</p>
                  <input
                    className="ant-input w-full p-4 bg-transparent border border-color-main-blue rounded-lg"
                    onChange={(e: any) => setBidPrice(e.target.value)}
                    value={bidPrice}
                    type="number"
                    min="0"
                  />
                </div>
              </div>
              <button onClick={() => bidOnItem()} className="btn m-4 mx-auto">
                Place bid
              </button>
            </div>
          </Modal>
          <Modal
            isOpen={isClaimSizeModalOpen}
            onCloseClick={() => setIsClaimSizeModalOpen(false)}
            className="w-2/3"
          >
            <div className="flex flex-col w-full h-full text-center overflow">
              <h1 className="h1 text-4xl p-4">Claim {domain.name}</h1>
              <Divider />
              <p className="m-4 px-16 text-gray-500">
                Please select the storage size for your domain, we recommend the
                smaller size if you plan on using it for basic use.
              </p>

              <div className="mx-auto px-10 mt-4">
                <div className="m-2">
                  <p className="text-xl m-2">Select domain size</p>
                  <StyledSelect
                    value={domainSize}
                    onChange={(e: any) => setDomainSize(e)}
                    options={[
                      { value: 1000, label: "1kb" },
                      { value: 2000, label: "2kb" },
                      { value: 3000, label: "3kb" },
                      { value: 4000, label: "4kb" },
                      { value: 5000, label: "5kb" },
                      { value: 6000, label: "6kb" },
                      { value: 7000, label: "7kb" },
                      { value: 8000, label: "8kb" },
                      { value: 9000, label: "9kb" },
                      { value: 10000, label: "10kb" },
                    ]}
                  />
                </div>
              </div>
              <button onClick={() => claim()} className="btn m-4 mx-auto">
                Claim domain
              </button>
            </div>
          </Modal>
          {sendingTransactionText && (
            <NotificationModal
              isShow={!!sendingTransactionText}
              title={sendingTransactionText.title}
              description={sendingTransactionText.description}
            />
          )}
        </div>
      ) : (
        <LoadingWidget />
      )}
    </Page>
  )
}
