import React, { useState, useEffect } from "react"
import AliceCarousel from "react-alice-carousel"
import "react-alice-carousel/lib/alice-carousel.css"
import { CollectionCard } from "../CollectionCard"
import { Collection } from "../../types"
import {
  ArrowCircleLeftIcon,
  ArrowCircleRightIcon,
  InformationCircleIcon,
} from "@heroicons/react/outline"
import {
  useTooltipState,
  Tooltip,
  TooltipArrow,
  TooltipReference,
} from "reakit/Tooltip"
import { useCollections } from "../../contexts/collections"
import { UNVERIFEYED_COLLECTION_OPTION } from "../../constants/collections"
import { LoadingWidget } from "../../components/loadingWidget"

interface ResultsUsersProps {
  keyword: string | null
}

export const ResultsUsers: React.FC<ResultsUsersProps> = ({ keyword }) => {
  const [isResultsLoading, setIsResultsLoading] = useState<boolean>(false)
  const { collections, isLoading: isCollectionsLoading } = useCollections()
  const collectionResults = collections.filter((collection) =>
    collection.name.toLowerCase().includes(`${keyword?.toLowerCase()}`)
  )

  return (
    <div className="grid grid-cols-1 pt-5 sm:pt-3 mb-5 max-w-7xl mx-auto sm:px-0 lg:px-8 mt-10">
      {isCollectionsLoading && (
        <div className="flex-1 justify-center pt-20">
          <div className="w-48 mx-auto">
            <LoadingWidget />
          </div>
        </div>
      )}
      {collectionResults && collectionResults.length > 0 ? (
        <div className="max-w-7xl px-0 sm:px-4 lg:px-0 mx-6 sm:mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-8 mb-2 md:mb-4">
          {collectionResults.map((collection: Collection, index: number) => (
            <CollectionCard collection={collection} />
          ))}
        </div>
      ) : !isCollectionsLoading ? (
        <div className="text-sm text-center opacity-70 my-20">
          Sorry, Your Search did not match any results.
        </div>
      ) : (
        <div className="text-sm text-center opacity-70 my-20">
          An Error has occured!
        </div>
      )}
    </div>
  )
}
