import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import { Children, useCallback, useEffect, useState } from "react"
import { fetchMetadata } from "../../actions/metadata"
import { ConnectMessage } from "../../components/ConnectMessage"
import { LoadingWidget } from "../../components/loadingWidget"
import { NftCard } from "../../components/NftCard"
import { Page } from "../../components/Page"
import { RefreshIcon } from "@heroicons/react/outline"
import { kFormatter, shortenAddress } from "../../utils"

import {
  BASE_URL_COLLECTIONS_RETRIEVER,
  COLLECTIONS_RETRIEVER_QUERY_PARAM,
  BASE_URL_OFFERS_RETRIEVER,
} from "../../constants/urls"
import { useConnection, useConnectionConfig } from "../../contexts/connection"
import { useWallet } from "../../contexts/wallet"
import { useUserAccounts } from "../../hooks"
import { ActiveOffer, EscrowInfo } from "../../types"
import { getEscrowFromCollectionName } from "../../utils"
import { useTabState, Tab, TabList, TabPanel } from "reakit/Tab"
import { forceCheck } from "react-lazyload"
import { StyledSelect } from "../../components/StyledSelect"
import { getDomainList } from "../../utils/getDomainList"
import {
  DomainNameAndAuction,
  useDomainListing,
} from "../../contexts/domainListings"
import { DomainName } from "../../utils/name-service"
import { DomainCard } from "../../components/DomainCard"
import { SideBar } from "../../components/SideBar"
import "../../components/SideBar/style.css"


import {
  ProSidebar,
  Menu,
  MenuItem,
  SubMenu,
  SidebarHeader,
  SidebarFooter,
  SidebarContent
} from "react-pro-sidebar";
import 'font-awesome/css/font-awesome.min.css'
import useWindowDimensions from "../../utils/layout";




export const WalletView = () => {
  const connection = useConnection()
  const { connected, wallet } = useWallet()
  const { getListedDomains, userHasBids, isUserWinner } = useDomainListing()
  const [listedBonfidaDomains, setListedBonfidaDomains] =
    useState<DomainNameAndAuction[]>()
  const { endpoint } = useConnectionConfig()
  const {
    listedMintsFromEscrow,
    mintsInWalletUnlisted,
    listedMintsFromDirectSell,
    listedMintsFromDutch,
  } = useUserAccounts()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUnlisted, setIsLoadingUnlisted] = useState(false)
  const [isLoadingListed, setIsLoadingListed] = useState(false)
  const [isLoadingEscrow, setIsLoadingEscrow] = useState(false)
  const [isLoadingDutch, setIsLoadingDutch] = useState(false)
  const [isLoadingDomains, setIsLoadingDomains] = useState(false)
  const [unlistedNfts, setUnlistedNfts] = useState<ActiveOffer[]>([])
  const [listedNftsEscrow, setListedNftsEscrow] = useState<ActiveOffer[]>([])
  const [listedNftsDutch, setListedNftsDutch] = useState<ActiveOffer[]>([])
  const [listedNfts, setListedNfts] = useState<ActiveOffer[]>([])
  const [unclaimedDomains, setUnclaimedDomains] =
    useState<(DomainNameAndAuction | undefined)[]>()
  const [activeDomainBids, setActiveDomainBids] =
    useState<(DomainNameAndAuction | undefined)[]>()
  const [collectionsInWallet, setCollectionsInWallet] = useState(
    () => new Set()
  )
  const [collectionFilter, setCollectionFilter] = useState("")
  const tab = useTabState()

  useEffect(() => {
    if (wallet?.publicKey && !listedBonfidaDomains) {
      ; (async () => {
        setIsLoadingDomains(true)
        const listedDomains = await getListedDomains(
          connection,
          wallet.publicKey as PublicKey
        )
        setListedBonfidaDomains(listedDomains as DomainName[])
        setIsLoadingDomains(false)
      })()
    }
  }, [wallet?.publicKey, listedBonfidaDomains])

  const getListedNftsEscrow = useCallback(async () => {
    setIsLoadingEscrow(true)
    const collectionsListedWallet: any = []
    const listedNftsFromWallet: (ActiveOffer | undefined)[] = await Promise.all(
      listedMintsFromEscrow.map(async (mint: string) => {
        let offerInfo
        try {
          const offerPromise = await fetch(
            `${BASE_URL_OFFERS_RETRIEVER}?${COLLECTIONS_RETRIEVER_QUERY_PARAM}=${mint}`
          )
          offerInfo = await offerPromise.json()
        } catch (error) {
          console.log("darn")
        }

        let collection = null
        try {
          const collectionPromise = await fetch(
            `${BASE_URL_COLLECTIONS_RETRIEVER}?${COLLECTIONS_RETRIEVER_QUERY_PARAM}=${mint}`
          )
          collection = JSON.parse(await collectionPromise.json())
        } catch (error) {
          // TODO: treat this error; perhaps show a error toastr
        }

        let contract = undefined
        if (collection) {
          contract = getEscrowFromCollectionName(endpoint, collection?.name)
          if (!collectionsListedWallet.includes(collection?.name)) {
            collectionsListedWallet.push(collection?.name)
          }
        }

        if (Object.keys(offerInfo).length > 0) {
          const activeOffer: ActiveOffer = {
            metadata: offerInfo.metadata,
            mint: mint,
            price: kFormatter((offerInfo.price as number) / LAMPORTS_PER_SOL),
            escrowPubkeyStr: offerInfo.pk,
            contract: offerInfo.contract,
            collectionName:
              !!collection && collection !== [] ? collection?.name : "",
            isListed: false,
            isVerifeyed:
              !!collection && collection !== [] ? collection?.name : "",
          }
          return activeOffer
        }
      })
    )
    // This filter is needed as fetchMetadata is null if a NFT has been listed; we want to remove this.
    const listedNftsFromWalletFiltered = listedNftsFromWallet.filter(
      Boolean
    ) as ActiveOffer[]
    // console.log( unlistedNftsFromWalletFiltered );
    setListedNftsEscrow(listedNftsFromWalletFiltered)
    setCollectionsInWallet(
      new Set([...collectionsInWallet, ...collectionsListedWallet])
    )
    setIsLoadingEscrow(false)
  }, [listedMintsFromEscrow])

  const getListedNfts = useCallback(async () => {
    setIsLoadingListed(true)
    const listedNftsFromDirect: (ActiveOffer | undefined)[] = await Promise.all(
      listedMintsFromDirectSell.map(async (mint: string) => {
        let offerInfo
        try {
          const offerPromise = await fetch(
            `${BASE_URL_OFFERS_RETRIEVER}?${COLLECTIONS_RETRIEVER_QUERY_PARAM}=${mint}`
          )
          offerInfo = await offerPromise.json()
        } catch (error) {
          console.log("something went wrong with offerPromise")
        }

        let collection = null
        try {
          const collectionPromise = await fetch(
            `${BASE_URL_COLLECTIONS_RETRIEVER}?${COLLECTIONS_RETRIEVER_QUERY_PARAM}=${mint}`
          )
          collection = JSON.parse(await collectionPromise.json())
        } catch (error) {
          // TODO: treat this error; perhaps show a error toastr
        }

        let contract = undefined
        if (collection) {
          contract = getEscrowFromCollectionName(endpoint, collection?.name)
        }

        if (Object.keys(offerInfo).length > 0) {
          const activeOffer: ActiveOffer = {
            metadata: offerInfo.metadata,
            mint: mint,
            price: kFormatter((offerInfo.price as number) / LAMPORTS_PER_SOL),
            escrowPubkeyStr: offerInfo.pk,
            contract: offerInfo.contract,
            owner: offerInfo.owner,
            collectionName: !!collection && collection !== [] ? collection?.name : "",
            isListed: false,
            isVerifeyed:
              !!collection && collection !== [] ? collection?.name : "",
          }
          return activeOffer
        }
      })
    )
    // This filter is needed as fetchMetadata is null if a NFT has been listed; we want to remove this.
    const listedNftsFromDirectFiltered = listedNftsFromDirect.filter(
      Boolean
    ) as ActiveOffer[]
    // console.log( unlistedNftsFromWalletFiltered );
    setListedNfts(listedNftsFromDirectFiltered)
    setIsLoadingListed(false)
  }, [listedMintsFromDirectSell])

  const getListedNftsDutch = useCallback(async () => {
    setIsLoadingDutch(true)
    const listedNftsFromDutch: (ActiveOffer | undefined)[] = await Promise.all(
      listedMintsFromDutch.map(async (mint: string) => {
        let offerInfo
        try {
          const offerPromise = await fetch(
            `${BASE_URL_OFFERS_RETRIEVER}?${COLLECTIONS_RETRIEVER_QUERY_PARAM}=${mint}`
          )
          offerInfo = await offerPromise.json()
        } catch (error) {
          console.log("something went wrong with offerPromise")
        }

        let collection = null
        try {
          const collectionPromise = await fetch(
            `${BASE_URL_COLLECTIONS_RETRIEVER}?${COLLECTIONS_RETRIEVER_QUERY_PARAM}=${mint}`
          )
          collection = JSON.parse(await collectionPromise.json())
        } catch (error) {
          // TODO: treat this error; perhaps show a error toastr
        }

        let contract = undefined
        if (collection) {
          contract = getEscrowFromCollectionName(endpoint, collection?.name)
        }

        if (Object.keys(offerInfo).length > 0) {
          const activeOffer: ActiveOffer = {
            metadata: offerInfo.metadata,
            mint: mint,
            price: kFormatter((offerInfo.price as number) / LAMPORTS_PER_SOL),
            escrowPubkeyStr: offerInfo.pk,
            contract: offerInfo.contract,
            owner: offerInfo.owner,
            collectionName: !!collection && collection !== [] ? collection?.name : "",
            isListed: false,
            isVerifeyed:
              !!collection && collection !== [] ? collection?.name : "",
          }
          return activeOffer
        }
      })
    )
    // This filter is needed as fetchMetadata is null if a NFT has been listed; we want to remove this.
    const listedNftsFromDutchFiltered = listedNftsFromDutch.filter(
      Boolean
    ) as ActiveOffer[]
    // console.log( unlistedNftsFromWalletFiltered );
    setListedNftsDutch(listedNftsFromDutchFiltered)
    setIsLoadingDutch(false)
  }, [listedMintsFromDutch])

  const getUnlistedNfts = useCallback(async () => {
    setIsLoadingUnlisted(true)
    const collectionsUnListedWallet: any = []
    const listedAccountsDecoded: (ActiveOffer | undefined)[] =
      await Promise.all(
        mintsInWalletUnlisted.map(async (mint: string) => {
          const offer = {} as ActiveOffer

          let collection = null
          try {
            const collectionPromise = await fetch(
              `${BASE_URL_COLLECTIONS_RETRIEVER}?${COLLECTIONS_RETRIEVER_QUERY_PARAM}=${mint.toString()}`
            )
            collection = JSON.parse(await collectionPromise.json())
          } catch (error) {
            // TODO: treat this error; perhaps show a error toastr
          }

          const contract = getEscrowFromCollectionName(endpoint, "")
          let metadata = null
          try {
            metadata = await fetchMetadata(
              connection,
              new PublicKey(mint),
              contract as EscrowInfo
            )
          } catch (error) {
            // TODO: treat this error; perhaps show a error toastr
          }

          if (!metadata) return

          offer.mint = mint.toString()
          offer.price = 0
          // offer.escrowPubkeyStr = account.pubkey.toString();
          offer.metadata = metadata
          offer.isListed = true
          offer.collectionName =
            !!collection && collection !== [] ? collection?.name : ""
          offer.isVerifeyed = !!collection && collection !== []
          if (offer.collectionName) {
            collectionsUnListedWallet.push(offer.collectionName)
          }
          return offer
        })
      )

    const listedAccountsDecodedFiltered = listedAccountsDecoded.filter(
      Boolean
    ) as ActiveOffer[]
    setUnlistedNfts(listedAccountsDecodedFiltered)
    setCollectionsInWallet(
      new Set([...collectionsInWallet, ...collectionsUnListedWallet])
    )
    setIsLoadingUnlisted(false)
  }, [mintsInWalletUnlisted])

  const refreshWalletItems = async () => {
    setIsLoading(true)
    await getListedNfts()
    await getListedNftsEscrow()
    await getUnlistedNfts()
    setIsLoading(false)
  }

  useEffect(() => {
    getUnlistedNfts()
  }, [mintsInWalletUnlisted])

  useEffect(() => {
    getListedNfts()
  }, [listedMintsFromDirectSell])

  useEffect(() => {
    getListedNftsEscrow()
  }, [listedMintsFromEscrow])

  useEffect(() => {
    getListedNftsDutch()
  }, [listedMintsFromDutch])

  useEffect(() => {
    forceCheck()
  }, [tab])

  const getUnclaimedDomains = async () => {
    if (!wallet || !listedBonfidaDomains) return
    const winningDomains = listedBonfidaDomains?.map(async (domain) => {
      if (domain?.domainOwner?.toString() !== wallet?.publicKey?.toString()) {
        const hasBid = await userHasBids(connection, wallet, domain)
        const isWinning = await isUserWinner(
          connection,
          wallet,
          domain
        )
        return hasBid && isWinning
      }
    })

    const hasWonDomainsList = await Promise.all(winningDomains)

    return listedBonfidaDomains?.map(async (domain, idx) => {
      const inUsersWallet = wallet?.domainNames?.find(
        (localDomain) => localDomain?.name === domain.name
      )

      const userIsWinner = hasWonDomainsList[idx]

      const time =
        parseInt(domain?.auctionData?.endedAt?.toString() as string) -
        new Date().getTime() / 1000

      if (!inUsersWallet && time < 0) {
        if (userIsWinner) {
          return domain
        } else if (
          domain.domainOwner?.toString() === wallet?.publicKey?.toString()
        ) {
          return domain
        } else {
          return undefined
        }
      }
    })
  }

  const userListedDomains = listedBonfidaDomains?.filter((domain) => {
    const time =
      parseInt(domain?.auctionData?.endedAt?.toString() as string) -
      new Date().getTime() / 1000

    if (
      domain?.domainOwner?.toString() === wallet?.publicKey?.toString() &&
      time > 0
    ) {
      return domain
    }
  })

  const userDomainBids = async () => {
    if (!wallet) return
    return listedBonfidaDomains?.map(async (domain) =>
      domain
        ? (await userHasBids(connection, wallet, domain))
          ? domain
          : undefined
        : undefined
    )
  }

  useEffect(() => {
    if (wallet?.publicKey && connection && listedBonfidaDomains) {
      ; (async () => {
        const domainsWithBids = await userDomainBids()

        if (domainsWithBids) {
          const domians = await Promise.all(domainsWithBids)
          setActiveDomainBids(domians.filter((domain) => domain))
        }
      })()
    }
  }, [listedBonfidaDomains, wallet?.publicKey, connection])

  useEffect(() => {
    if (wallet?.publicKey && connection && listedBonfidaDomains) {
      ; (async () => {
        const userUnclaimedDomains = await getUnclaimedDomains()

        if (userUnclaimedDomains) {
          const domains = await Promise.all(userUnclaimedDomains)
          setUnclaimedDomains(domains.filter((domain) => domain))
        }
      })()
    }
  }, [listedBonfidaDomains, wallet?.publicKey, connection])

  console.log(listedNftsDutch);



  const [menuCollapse, setMenuCollapse] = useState(true)

  //create a custom function that will change menucollapse state from false to true and true to false
  const menuIconClick = () => {
    //condition checking to change state from true to false and vice versa
    menuCollapse ? setMenuCollapse(false) : setMenuCollapse(true);
  };

  const { width } = useWindowDimensions();

  const check_width = (e: any) => {
    const width = window.innerWidth;
    console.log(menuCollapse);
    if (width > 768 && !menuCollapse) {
      console.log('>');
      setMenuCollapse(true);
    }
    if (width <= 768 && menuCollapse) {
      setMenuCollapse(false);
    }

  }

  useEffect(() => {
    window.addEventListener('resize', (e) => {
      check_width(e);
    })
  }, [])

  const Switch = (props: any) => {
    const { test, children } = props
    return children.find((child: any) => {
      return child.props.value === test
    })
  }

  const get_Status = (e : any) => {
    setIndex(e);
  }

  
  const [index, setIndex] = useState(0);

  const BaseDiv = (prop: any) =>
    <div>
      {prop.children}
    </div>

  return (
    <Page title="Your Wallet | DigitalEyes">
      <div className="d-flex">
        <SideBar /> 
        <div className="mx-auto pt-10 px-4 sm:px-6 lg:px-8" style={{ width: "100vw" }}>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {collectionsInWallet && (
              <div className="flex justify-between">
                <div className="w-60">
                  <button
                    className="w-full py-2 font-medium text-white uppercase hover:text-gray-500 hover:border-gray-500 sm:text-sm flex items-center space-x-2"
                    onClick={() => refreshWalletItems()}
                  >
                    <span>Refresh</span>{" "}
                    <RefreshIcon
                      className={isLoading ? "w-5 h-5 animate-spin" : "w-5 h-5"}
                      aria-hidden="true"
                    />
                  </button>
                </div>
                <div className="w-60">
                  <StyledSelect
                    options={Array.from(collectionsInWallet)
                      .sort()
                      .map((value: any) => {
                        return {
                          value,
                          label: value,
                        }
                      })}
                    isLoading={isLoadingUnlisted}
                    onChange={(option: any) => {
                      if (option) {
                        setCollectionFilter(option.value)
                      } else {
                        setCollectionFilter("")
                      }
                    }}
                    placeholder="Sort by Collection..."
                    placeholderPrefix="Sorting by"
                    isClearable={true}
                  />
                </div>
              </div>
            )}

            <Switch test={index}>
              <BaseDiv value={0}>
                <div className="pt-16 sm:pt-12 mb-10">
                  <div className="relative text-center">
                    {/* <p className="wallet-key text-gray-400 mt-2 capitalize mx-auto w-5/6 text-sm leading-loose">
                      {wallet?.domainNames
                        ? getDomainList(wallet?.domainNames)
                        : wallet?.publicKey
                        ? `${shortenAddress(wallet?.publicKey.toString())}`
                        : ""}
                    </p> */}
                  </div>
                </div>
                {connected ? (
                  <>
                    {isLoadingUnlisted || isLoadingDomains ? (
                      <div className="flex justify-center pt-20">
                        <div className="w-48">
                          <LoadingWidget />
                        </div>
                      </div>
                    ) : (
                      <>
                        {" "}
                        {unlistedNfts.length ||
                          wallet?.domainNames ||
                          unclaimedDomains ? (
                          <ul className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-1 grid gap-4 md:gap-6 lg:gap-8 pb-6">
                            {unlistedNfts.map((nft: ActiveOffer, index: any) => {
                              if (
                                collectionFilter &&
                                collectionFilter !== nft.collectionName
                              ) {
                                return
                              }
                              return <NftCard key={index} offer={nft} wallet={true} />
                            })}
                            {wallet?.domainNames?.map((domain) => (
                              <DomainCard
                                connection={connection}
                                key={domain?.name}
                                domain={domain as DomainName}
                              />
                            ))}
                            {unclaimedDomains?.map((domain) => (
                              <DomainCard
                                connection={connection}
                                key={domain?.name}
                                domain={domain as DomainName}
                              />
                            ))}
                          </ul>
                        ) : (
                          <h1 className="text-2xl font-bold text-center text-white sm:tracking-tight py-6">
                            You don't have any NFTs{" "}
                          </h1>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <ConnectMessage />
                )}
              </BaseDiv>
              <BaseDiv value={1}>
                <div className="pt-16 sm:pt-12 mb-10">
                  <div className="relative text-center">
                    {/* <p className="wallet-key text-gray-400 mt-2 capitalize mx-auto w-5/6 text-sm leading-loose">
                      {wallet?.domainNames
                        ? getDomainList(wallet?.domainNames)
                        : wallet?.publicKey
                          ? `${shortenAddress(wallet?.publicKey.toString())}`
                          : ""}
                    </p> */}
                  </div>
                </div>
                {connected ? (
                  <>
                    {isLoadingListed || isLoadingEscrow || isLoadingDomains ? (
                      <div className="flex justify-center pt-20">
                        <div className="w-48">
                          <LoadingWidget />
                        </div>
                      </div>
                    ) : (
                      <>
                        {listedNfts.length || userListedDomains ? (
                          <ul className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-1 grid gap-4 md:gap-6 lg:gap-8 pb-6">
                            {listedNfts?.map((nft: ActiveOffer, index: any) => {
                              if (
                                collectionFilter &&
                                collectionFilter !== nft.collectionName
                              )
                                return
                              return <NftCard key={index} offer={nft} wallet={true} />
                            })}
                            {userListedDomains?.map((domain) => (
                              <DomainCard
                                connection={connection}
                                key={domain?.name}
                                domain={domain as DomainName}
                              />
                            ))}
                          </ul>
                        ) : (
                          <>
                            <p className="text-base text-center text-white sm:tracking-tight pt-6">
                              You don't have any NFTs listed from your wallet.
                            </p>
                            <p className="text-base text-center text-white sm:tracking-tight pb-6">
                              If this seems like a mistake try refreshing below.
                            </p>
                            <p className="flex justify-center">
                              <button onClick={() => refreshWalletItems()}>
                                <span className="text-white inline-flex items-center">
                                  <RefreshIcon className="h-4 w-4 mr-1" /> Refresh
                                </span>
                              </button>
                            </p>
                          </>
                        )}

                        {listedNftsEscrow.length > 0 && (
                          <>
                            <h3 className="text-xl font-bold text-center text-white sm:tracking-tight py-6">
                              The following items are listed with escrow contracts
                              and will not appear in your wallet:
                            </h3>
                            <ul className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-1 grid gap-4 md:gap-6 lg:gap-8 pb-6">
                              {listedNftsEscrow.map(
                                (nft: ActiveOffer, index: any) => {
                                  if (
                                    collectionFilter &&
                                    collectionFilter !== nft.collectionName
                                  )
                                    return
                                  return <NftCard key={index} offer={nft} wallet={true} />
                                }
                              )}
                            </ul>
                          </>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <ConnectMessage />
                )}
              </BaseDiv>
              <BaseDiv value={2}>
                <div className="pt-16 sm:pt-12 mb-10">
                  <div className="relative text-center">
                    {/* <p className="wallet-key text-gray-400 mt-2 capitalize mx-auto w-5/6 text-sm leading-loose">
                      {wallet?.domainNames
                        ? getDomainList(wallet?.domainNames)
                        : wallet?.publicKey
                          ? `${shortenAddress(wallet?.publicKey.toString())}`
                          : ""}
                    </p> */}
                  </div>
                </div>
                {connected ? (
                  <>
                    {isLoadingDomains ? (
                      <div className="flex justify-center pt-20">
                        <div className="w-48">
                          <LoadingWidget />
                        </div>
                      </div>
                    ) : (
                      <>
                        {activeDomainBids ? (
                          <ul className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-1 grid gap-4 md:gap-6 lg:gap-8 pb-6">
                            {activeDomainBids.map((domain) => (
                              <DomainCard
                                connection={connection}
                                key={domain?.name}
                                domain={domain as DomainName}
                              />
                            ))}
                          </ul>
                        ) : (
                          <h1 className="text-2xl font-bold text-center text-white sm:tracking-tight py-6">
                            You don't have any bids{" "}
                          </h1>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <ConnectMessage />
                )}
              </BaseDiv>
              <BaseDiv value={3}>
                <div className="pt-16 sm:pt-12 mb-10">
                  <div className="relative text-center">
                    {/* <p className="wallet-key text-gray-400 mt-2 capitalize mx-auto w-5/6 text-sm leading-loose">
                      {wallet?.domainNames
                        ? getDomainList(wallet?.domainNames)
                        : wallet?.publicKey
                          ? `${shortenAddress(wallet?.publicKey.toString())}`
                          : ""}
                    </p> */}
                  </div>
                </div>
                {connected ? (
                  <>
                    {isLoadingDutch || isLoadingEscrow || isLoadingDomains ? (
                      <div className="flex justify-center pt-20">
                        <div className="w-48">
                          <LoadingWidget />
                        </div>
                      </div>
                    ) : (
                      <>
                        {listedNftsDutch.length || userListedDomains ? (
                          <ul className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-1 grid gap-4 md:gap-6 lg:gap-8 pb-6">
                            {listedNftsDutch?.map((nft: ActiveOffer, index: any) => {
                              if (
                                collectionFilter &&
                                collectionFilter !== nft.collectionName
                              )
                                return
                              return <NftCard key={index} offer={nft} wallet={true} />
                            })}
                            {userListedDomains?.map((domain) => (
                              <DomainCard
                                connection={connection}
                                key={domain?.name}
                                domain={domain as DomainName}
                              />
                            ))}
                          </ul>
                        ) : (
                          <>
                            <p className="text-base text-center text-white sm:tracking-tight pt-6">
                              You don't have any NFTs on auction in your wallet.
                            </p>
                            <p className="text-base text-center text-white sm:tracking-tight pb-6">
                              If this seems like a mistake try refreshing below.
                            </p>
                            <p className="flex justify-center">
                              <button onClick={() => refreshWalletItems()}>
                                <span className="text-white inline-flex items-center">
                                  <RefreshIcon className="h-4 w-4 mr-1" /> Refresh
                                </span>
                              </button>
                            </p>
                          </>
                        )}


                      </>
                    )}
                  </>
                ) : (
                  <ConnectMessage />
                )}
              </BaseDiv>
            </Switch>
          </div>
        </div>
      </div>
    </Page>
  )
}
