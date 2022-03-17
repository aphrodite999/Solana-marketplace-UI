import { AuctionData } from "@bonfida/name-auctioning"
import { AdjustmentsIcon } from "@heroicons/react/outline"
import { entries } from "lodash"
import { useCallback, useEffect, useRef, useState } from "react"
import { useConnection } from "../../contexts"
import {
  DomainNameAndAuction,
  useDomainListing,
} from "../../contexts/domainListings"
import { Collection } from "../../types"
import { getDomainFloorPrice } from "../../utils/getDomianFloorPrice"
import CollectionActions from "../CollectionActions"
import CollectionFilters from "../CollectionFilters"
import { DomainCard } from "../DomainCard"
import { LoadingWidget } from "../loadingWidget"

interface DomainListProp {
  collection: Collection
}

export const DomainList = ({ collection }: DomainListProp) => {
  const { getActiveAuctionList, domainList } = useDomainListing()
  const [isLoading, setIsLoading] = useState(false)
  const [showActiveFilters, setShowActiveFilters] = useState(true)
  const [selectedFilters, setSelectedFilters] = useState<{
    [key: string]: string | null
  }>()
  const connection = useConnection()

  const observer = useRef<any>()

  const getMoreDomains = async () => {
    setIsLoading(true)
    await getActiveAuctionList(connection)
    setIsLoading(false)
  }

  const lastListItemRef = useCallback(
    (node) => {
      if (isLoading) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) getMoreDomains()
      })
      if (node) observer.current.observe(node)
    },
    [isLoading]
  )

  useEffect(() => {
    if (!domainList && connection) {
      getActiveAuctionList(connection)
    }
  }, [domainList, connection])

  const filters: {
    name: string
    values: string[]
  }[] = [
    { name: "Filters", values: ["Has offers"] },
    { name: "Order", values: ["Alphabetical"] },
  ]

  const addSelectedFilter = (
    filterName: string,
    selectedFilter: {
      value: any
      label: string
    }
  ) => {
    if (!!selectedFilter) {
      setSelectedFilters({
        ...selectedFilters,
        [filterName]: selectedFilter.value,
      })
    } else {
      setSelectedFilters({
        ...selectedFilters,
        [filterName]: null,
      })
    }
  }

  const toggleActiveFilters = () => {
    setShowActiveFilters(!showActiveFilters)
  }

  const resetFilters = () => {
    setSelectedFilters({})
  }

  return (
    <div className="flex flex-col max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
      {collection && (
        <>
          <div className="flex flex-col relative text-center my-12">
            <div className="flex mx-auto">
              <img
                className="rounded-md h-16 ml-4 my-3 mr-2"
                src={collection?.thumbnail}
              />
              <h1 className="h1 my-auto">{collection?.name}</h1>
            </div>
            <div className="flex justify-evenly flex-col w-full text-center">
              <p className="text-gray-400 mt-2 capitalize mx-auto w-5/6 text-sm leading-loose">
                {collection?.description}
              </p>
            </div>
          </div>

          <span className="flex-1 my-5">
            {!isLoading && (
              <button
                className="text-sm w-full py-2 text-white text-left flex items-center"
                onClick={toggleActiveFilters}
              >
                <AdjustmentsIcon className="w-4 mr-4" /> Advanced filters
              </button>
            )}
          </span>

          <div className="flex">
            <CollectionFilters
              showActiveFilters={showActiveFilters}
              filtersFromMetadata={filters}
              selectedFilters={selectedFilters}
              addSelectedFilter={addSelectedFilter}
              resetFilters={resetFilters}
              toggleActiveFilters={toggleActiveFilters}
            />

            <ul
              className={`${
                !!showActiveFilters
                  ? "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                  : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
              } flex-1 grid gap-4 md:gap-6 lg:gap-8 pb-6`}
            >
              {domainList
                ?.filter((domain) =>
                  selectedFilters?.Filters === "Has offers"
                    ? (domain?.auctionData?.bidState?.bids?.length as number) >
                      0
                    : domain
                )
                .sort((a, b) =>
                  selectedFilters?.Order === "Alphabetical"
                    ? a?.auctionApiData?.domainName ===
                      b?.auctionApiData?.domainName
                      ? 0
                      : (a?.auctionApiData?.domainName as string) <
                        (b?.auctionApiData?.domainName as string)
                      ? -1
                      : 1
                    : 0
                )
                .map((domain, idx) => {
                  const time =
                    parseInt(
                      domain?.auctionData?.endedAt?.toString() as string
                    ) -
                    new Date().getTime() / 1000

                  return (
                    time &&
                    time > 0 && (
                      <div
                        key={domain?.auctionApiData?.domainName}
                        ref={
                          domainList.length === idx + 1
                            ? lastListItemRef
                            : undefined
                        }
                      >
                        <DomainCard connection={connection} domain={domain} />
                      </div>
                    )
                  )
                })}
            </ul>
          </div>
        </>
      )}
      {(!domainList || isLoading || !collection) && (
        <div className="m-auto flex-1">
          <LoadingWidget />
        </div>
      )}
    </div>
  )
}
