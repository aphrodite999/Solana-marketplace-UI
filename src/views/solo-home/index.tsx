import { useCallback, useEffect, useState } from "react"
import { Link, useHistory } from "react-router-dom"
import { LoadingWidget } from "../../components/loadingWidget"
import { NftCard } from "../../components/NftCard"
import { NftMiniCard } from "../../components/NftMiniCard"
import { NftModalBuyView } from "../../components/NftModalBuyView"
import { Page } from "../../components/Page"
import { TopCollections } from "../../components/TopCollections"
import { LAMPORTS_PER_SOL } from "../../constants"
import * as ROUTES from "../../constants/routes"
import {
  BASE_URL_OFFERS_RETRIEVER,
  OFFERS_RETRIEVER_QUERY_PARAM,
} from "../../constants/urls"
import { useCollections } from "../../contexts/collections"
import { useConnection, useConnectionConfig } from "../../contexts/connection"
import { ActiveOffer, Collection } from "../../types"
import { classNames, findCollection, getEscrowContract } from "../../utils"
import { IMAGE_KIT_ENDPOINT_URL, isImageInCache } from "../../constants/images"
// @ts-ignore
import { IKImage } from "imagekitio-react"
import { ReactComponent as DiscordLogo } from "../../assets/logo/discord.svg"
import { SoloHomeFeatured } from "./featured"
import { LatestSoloCreations } from "./latestSolo"
import { TopArtists } from "./topArtists"

export const SoloHomeView = () => {
  const { collections, isLoading: isCollectionsLoading } = useCollections()

  const connection = useConnection()
  const { endpoint } = useConnectionConfig()
  const history = useHistory()

  useEffect(() => {
    const controller = new AbortController()

    return () => {
      controller.abort()
    }
  }, [connection, endpoint, collections])

  return (
    <Page title="DigitalEyes | Solo">
      <div className="z-5 relative">
        {/**<div className="bg-max-w-7xl mx-auto pt-12 px-4 text-center">
          <h1 className="text-white text-3xl font-bold">
            Solana's First Open Marketplace for
            <br/> 1 of 1 Creators
          </h1>
        </div>*/}

        <SoloHomeFeatured />

        <div className="w-full flex justify-center z-10 py-10">
          <div className="rounded-md border-color-gray-500 py-10 bg-color-main-gray-medium opacity-80 w-full max-w-5xl mx-3 flex justify-center">
            <p className="px-12 py-5 inline">Want to create an NFT?</p>
            <button
              className="py-3 px-12 text-white opacity-100 rounded-lg bg-gradient-to-r from-solana-teal to-solana-magenta hover:text-gray-100 hover:opacity-80 text-lg inline"
              onClick={(_) => history.push(`/solo-art/create/0`)}
            >
              <span>Create</span>
            </button>
          </div>
        </div>

        <TopArtists />

        <LatestSoloCreations />
      </div>
    </Page>
  )
}
