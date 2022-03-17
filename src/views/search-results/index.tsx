import { useState, useEffect, useRef, useCallback } from "react"
import { Link, useHistory, useLocation, useParams } from "react-router-dom"
import { LoadingWidget } from "../../components/loadingWidget"
import { ResultsCollections } from "../../components/ResultsCollections"

import { NftCard } from "../../components/NftCard"

import { Page } from "../../components/Page"

import * as ROUTES from "../../constants/routes"

import { useConnection } from "../../contexts/connection"
import { ActiveOffer, ActiveArtist } from "../../types"

import { useTabState, Tab, TabList, TabPanel } from "reakit/Tab"
import {
  BASE_URL_PROFILE_SEARCH,
  BASE_URL_NFT_SEARCH,
} from "../../constants/urls"

import { LAMPORTS_PER_SOL } from "../../constants"
import useDidMountEffect from "../../utils/use-did-mount-effect"

import {
  DomainNameAndAuction,
  useDomainListing,
} from "../../contexts/domainListings"
import { DomainCard } from "../../components/DomainCard"

export interface OffersRetrievalResponse {
  next_cursor: string
  offers: ActiveOffer[]
  count: number
}

export interface UsersRetrievalResponse {
  next_cursor: string
  artist_list: ActiveArtist[]
  count: number
}

export const SearchResultsView = () => {
  const connection = useConnection()
  const history = useHistory()
  const { getActiveAuctionListByName } = useDomainListing()

  const search = useLocation().search
  const keyword = new URLSearchParams(search).get("q")
  const activeTab = new URLSearchParams(search).get("tab")

  const tab = useTabState({
    selectedId: activeTab === null ? "nfts" : activeTab,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [domains, setDomains] = useState<DomainNameAndAuction[]>()
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [isLoadingOffers, setIsLoadingOffers] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [activeOffers, setActiveOffers] = useState<ActiveOffer[]>([])
  const [activeUsers, setActiveUsers] = useState<ActiveArtist[]>([])

  useEffect(() => {
    setIsLoading(true)
  }, [])

  useEffect(() => {
    loadOffersController.current = new AbortController()
    loadUsersController.current = new AbortController()

    return () => {
      loadOffersController.current?.abort()
      loadUsersController.current?.abort()
    }
  }, [])

  let loadOffersController = useRef<AbortController>()
  let loadUsersController = useRef<AbortController>()

  const loadOffers = useCallback(
    async ({ isInitialLoad = false }: { isInitialLoad?: boolean }, keyword) => {
      if (isLoadingOffers) {
        return
      }
      if (!!nextCursor || isInitialLoad) {
        if (isInitialLoad) {
          setActiveOffers([])
        }
        setIsLoading(true)
        const apiUrl = `${BASE_URL_NFT_SEARCH}/${encodeURIComponent(keyword)}/`
        try {
          const signal = loadOffersController.current?.signal
          const response = await fetch(apiUrl, { signal })
          const responseJson: OffersRetrievalResponse = await response.json()
          await parseOffersRetrievalResponse(responseJson, isInitialLoad)
        } catch (e) {
          setActiveOffers([])
          console.error(`Could not fetch offers`)
        }
        setIsLoading(false)
        setIsLoadingOffers(false)
      }
    },
    [nextCursor, activeOffers, isLoadingOffers]
  )

  const loadUsers = useCallback(
    async ({ isInitialLoad = false }: { isInitialLoad?: boolean }, keyword) => {
      if (isLoadingUsers) {
        return
      }
      if (!!nextCursor || isInitialLoad) {
        if (isInitialLoad) {
          setActiveUsers([])
        }
        setIsLoading(true)
        const apiUrl = `${BASE_URL_PROFILE_SEARCH}/${encodeURIComponent(
          keyword
        )}/`
        try {
          const signal = loadUsersController.current?.signal
          const response = await fetch(apiUrl, { signal })
          const responseJson: UsersRetrievalResponse = await response.json()
          await parseUsersRetrievalResponse(responseJson, isInitialLoad)
        } catch (e) {
          setActiveUsers([])

          console.error(`Could not fetch offers`)
        }
        setIsLoading(false)
        setIsLoadingUsers(false)
      }
    },
    [nextCursor, activeUsers, isLoadingUsers]
  )

  const parseOffersRetrievalResponse = async (
    response: OffersRetrievalResponse,
    isInitialLoad: boolean
  ) => {
    setNextCursor(response.next_cursor)
    if (isInitialLoad) {
    }
    if (response?.offers?.length > 0) {
      const accountsDecoded = (
        await Promise.all(
          response?.offers.map(async (offer: any) => {
            if (!!offer && offer.price > 0) {
              return {
                mint: offer.mint,
                price: offer.price / LAMPORTS_PER_SOL,
                escrowPubkeyStr: offer.contract,
                uri: offer.uri,
                collectionName: offer.collection,
                contract: offer.contract,
                isVerifeyed: offer.verifeyed,
                metadata: offer.metadata,
                lastPrice: offer.lastPrice,
                owner: offer.owner,
                solo: offer.solo,
                tags: offer.tags,
                artistImage: offer.soloImage,
                artistVerified: offer.soloVerified,
                artistUser: offer.soloUsername,
              } as ActiveOffer
            }
            return false
          })
        )
      ).filter(Boolean) as ActiveOffer[]

      const offers = (
        await Promise.all(
          accountsDecoded.map(async (offer) => {
            if (!!offer.metadata && Object.keys(offer?.metadata)?.length > 0) {
              return offer
            }

            const metaDataResponse = await fetch(
              offer.uri as RequestInfo
            ).catch((err) => {
              return null
            })
            if (metaDataResponse) {
              offer.metadata = await metaDataResponse.json()
              return offer
            }
            return false
          })
        )
      ).filter(Boolean) as ActiveOffer[]

      if (!isInitialLoad) {
        setActiveOffers([...activeOffers, ...offers])
      } else {
        setActiveOffers(offers)
      }
    } else {
      setActiveOffers([])
    }
  }

  const parseUsersRetrievalResponse = async (
    response: UsersRetrievalResponse,
    isInitialLoad: boolean
  ) => {
    setNextCursor(response.next_cursor)
    if (isInitialLoad) {
    }
    if (response?.artist_list?.length > 0) {
      const users = (
        await Promise.all(
          response?.artist_list.map(async (user: any) => {
            if (!!user) {
              return {
                banner: user.banner,
                created_at: user.created_at,
                description: user.description,
                discord: user.discord,
                image: user.image,
                instagram: user.instagram,
                mints_list: user.mints_list,
                theme: user.theme,
                twitter: user.twitter,
                updated_at: user.updated_at,
                user_id: user.user_id,
                username: user.username,
                verified: user.verified,
                wallet_key: user.wallet_key,
                website: user.website,
              } as ActiveArtist
            }
            return false
          })
        )
      ).filter(Boolean) as ActiveArtist[]

      if (!isInitialLoad) {
        setActiveUsers([...activeUsers, ...users])
        setIsLoading(false)
      } else {
        setActiveUsers(users)
        setIsLoading(false)
      }
    } else {
      setActiveUsers([])
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoading) {
      loadOffers({ isInitialLoad: true }, keyword)
      loadUsers({ isInitialLoad: true }, keyword)
    }
  }, [])

  const handleScroll = useCallback(() => {
    if (
      Math.ceil(window.innerHeight + window.scrollY) >=
      document.documentElement.scrollHeight
    ) {
      if (!isLoading) {
        loadOffers({ isInitialLoad: false }, keyword)
        loadUsers({ isInitialLoad: false }, keyword)
      }
    }
  }, [loadOffers, loadUsers])

  useDidMountEffect(() => {
    if (!isLoading) {
      loadOffers({ isInitialLoad: true }, keyword)
      loadUsers({ isInitialLoad: true }, keyword)
    }
  }, [keyword])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, {
      passive: true,
    })
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll])

  const setURLWithTab = async (tab: string) => {
    if (tab === "nfts") {
      await loadOffers({ isInitialLoad: true }, keyword)
    } else if (tab === "users") {
      await loadOffers({ isInitialLoad: true }, keyword)
    } else if (tab === "domains") {
      const filterKeyword = keyword?.replace(".sol", "")
      console.log(filterKeyword)
      setIsLoading(true)
      setDomains(
        await getActiveAuctionListByName(connection, filterKeyword as string)
      )
      setIsLoading(false)
    }

    history.push(
      `${ROUTES.SEARCH_RESULTS}?q=${encodeURIComponent(
        keyword as string
      )}&tab=${tab}`
    )
  }

  return (
    <Page title="DigitalEyes | Search Results">
      <div className="z-5 relative">
        <div className="bg-max-w-7xl mx-auto pt-12 px-4 text-center">
          <h1 className="text-white text-3xl font-bold">
            Search Results for "{keyword}"
          </h1>
        </div>

        <div id="search-nav" className="flex justify-center mt-5">
          <TabList
            {...tab}
            aria-label="Search Tabs"
            className="px-5 text-sm md:text-lg"
          >
            {/**<Tab {...tab} className="px-5">
              <p>Top</p>
            </Tab>*/}
            <Tab
              {...tab}
              id="nfts"
              className="px-5"
              onClick={(e) => setURLWithTab("nfts")}
            >
              <p>NFTs</p>
            </Tab>
            <Tab
              {...tab}
              id="collec"
              className="px-5"
              onClick={(e) => setURLWithTab("collec")}
            >
              <p>Collections</p>
            </Tab>
            <Tab
              {...tab}
              id="users"
              className="px-5"
              onClick={(e) => setURLWithTab("users")}
            >
              <p>Users</p>
            </Tab>
            <Tab
              {...tab}
              id="domains"
              className="px-5"
              onClick={(e) => setURLWithTab("domains")}
            >
              <p>Domains</p>
            </Tab>
          </TabList>
        </div>
        <div className="flex justify-center">
          <TabPanel {...tab}>
            <div className="grid grid-cols-1 pt-5 sm:pt-3 mb-5 max-w-7xl mx-auto sm:px-0 lg:px-8 mt-10">
              {!isLoading ? (
                activeOffers && activeOffers.length > 0 ? (
                  <div className="max-w-7xl px-0 sm:px-4 lg:px-0 mx-6 sm:mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-8 mb-2 md:mb-4">
                    {activeOffers.map((offer: ActiveOffer, index: number) => (
                      <NftCard
                        key={index}
                        offer={offer}
                        // onClick={(e) => handleClick(offer)}
                      />
                    ))}
                  </div>
                ) : (
                  !isLoading && (
                    <div className="text-sm text-center opacity-70 my-20">
                      Sorry, Your Search did not match any results.
                    </div>
                  )
                )
              ) : (
                <div className="flex-1 justify-center pt-20">
                  <div className="w-48 mx-auto">
                    <LoadingWidget />
                  </div>
                </div>
              )}
            </div>
          </TabPanel>

          <TabPanel {...tab}>
            <ResultsCollections keyword={keyword} />
          </TabPanel>

          <TabPanel {...tab}>
            <div className="grid grid-cols-1 pt-5 sm:pt-3 mb-5 max-w-7xl mx-auto sm:px-0 lg:px-8 mt-10">
              {isLoading && (
                <div className="flex-1 justify-center pt-20">
                  <div className="w-48 mx-auto">
                    <LoadingWidget />
                  </div>
                </div>
              )}
              {activeUsers && activeUsers.length > 0 ? (
                <div className="max-w-7xl px-0 sm:px-4 lg:px-0 mx-6 sm:mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 lg:gap-8 mb-2 md:mb-4">
                  {!isLoading ? (
                    activeUsers.map((user: ActiveArtist, index: number) => (
                      <Link
                        to={"/solo-profile/" + user?.username}
                        className="hover:opacity-60"
                      >
                        <div className="grid grid-cols-1 gap-2 justify-items-center">
                          <div>
                            <img
                              src={user?.image}
                              className="w-24 h-24 border-1 border-black rounded-full object-cover shadow-2xl"
                            />
                          </div>
                          <div>
                            <p className="inline text-sm">{user.username}</p>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="flex-1 justify-center pt-20">
                      <div className="w-48 mx-auto">
                        <LoadingWidget />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-center opacity-70 my-20">
                  Sorry, Your Search did not match any results.
                </div>
              )}
            </div>
          </TabPanel>

          <TabPanel {...tab}>
            <div className="grid grid-cols-1 pt-5 sm:pt-3 mb-5 max-w-7xl mx-auto sm:px-0 lg:px-8 mt-10">
              {!isLoading ? (
                domains && domains.length > 0 ? (
                  <div className="max-w-7xl px-0 sm:px-4 lg:px-0 mx-6 sm:mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-8 mb-2 md:mb-4">
                    {domains.map((domain) => (
                      <DomainCard
                        connection={connection}
                        key={domain.auctionData?.resource.toString()}
                        domain={domain}
                      />
                    ))}
                  </div>
                ) : (
                  !isLoading && (
                    <div className="text-sm text-center opacity-70 my-20">
                      Sorry, Your Search did not match any results.
                    </div>
                  )
                )
              ) : (
                <div className="flex-1 justify-center pt-20">
                  <div className="w-48 mx-auto">
                    <LoadingWidget />
                  </div>
                </div>
              )}
            </div>
          </TabPanel>
        </div>
      </div>
    </Page>
  )
}
