// @ts-ignore-next-line
import { IKImage } from "imagekitio-react";
import { Link } from "react-router-dom";
import { IMAGE_KIT_ENDPOINT_URL } from "../../constants/images";
import * as ROUTES from "../../constants/routes";
import { useCollections } from "../../contexts/collections";
import { Collection } from "../../types";
import { ThumbnailImage } from "../../components/ThumbnailImage";
import { Carousel } from "../../components//Carousel";
import { UNVERIFEYED_COLLECTION_OPTION } from "../../constants/collections";
import { CollectionCard } from "../../components/CollectionCard";
import { NftCard } from "../../components/NftCard";
import { ActiveOffer, EscrowInfo, ActiveArtist } from "../../types";
import { classNames, mapObjectQueryParams, removeNullValuesFromObject } from "../../utils";
import { LAMPORTS_PER_SOL } from "../../constants";
import { LoadingWidget } from "../../components/loadingWidget";

import {
  BASE_URL_SOLO_OFFERS_RETRIEVER,
  BASE_URL_SOLO_ARTISTS_RETRIEVER,
} from "../../constants/urls";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";

export interface OffersRetrievalResponse {
  next_cursor: string;
  offers: ActiveOffer[];
  count: number;
}

export const LatestSoloCreations = () => {
  const { collections } = useCollections();
  const [isLoading, setIsLoading] = useState(false);
  const [sorting, setSorting] = useState<string>("tallyVotesCount=desc");
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [activeOffers, setActiveOffers] = useState<ActiveOffer[]>([]);
  const [error, setError] = useState(false);

  const collectionsWithEpoch = collections.filter(
    (collection) => !!collection.publishedEpoch && collection.publishedEpoch > 0
  );


  //   const collectionArray= topCollections.map((collection)=>Object.entries(collection));
  //   console.log(typeof topCollections);
  let loadOffersController = useRef<AbortController>();

  const loadOffers = useCallback(
    async ({ isInitialLoad = false }: { isInitialLoad?: boolean }, sorting) => {
      if (isLoadingOffers) {
        return;
      }
      if (!!nextCursor || isInitialLoad) {
        if (isInitialLoad) {
          setActiveOffers([]);
        }
        setIsLoading(true);
        const apiUrl = `${BASE_URL_SOLO_OFFERS_RETRIEVER}?${sorting}&${mapObjectQueryParams(
          removeNullValuesFromObject({ cursor: isInitialLoad ? null : nextCursor })
        )}`;
        try {
          const signal = loadOffersController.current?.signal;
          const response = await fetch(apiUrl, { signal });
          const responseJson: OffersRetrievalResponse = await response.json();
          await parseOffersRetrievalResponse(responseJson, isInitialLoad);
        } catch (e) {
          setActiveOffers([]);
          setError(true);
          console.error(`Could not fetch solo offers`);
        }
        setIsLoading(false);
        setIsLoadingOffers(false);
      }
    },
    [nextCursor, activeOffers, isLoadingOffers]
  );

  const parseOffersRetrievalResponse = async (
    response: OffersRetrievalResponse,
    isInitialLoad: boolean
  ) => {
    setNextCursor(response.next_cursor);
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
                collectionName: "solo",
                contract: offer.contract,
                isVerifeyed: false,
                metadata: offer.metadata,
                lastPrice: offer.lastPrice,
                owner: offer.owner,
                solo: offer.solo,
                tags: offer.tags,
                artistImage: offer.soloImage,
                artistVerified: offer.soloVerified,
                artistUser: offer.soloUsername,
              } as ActiveOffer;
            }
            return false;
          })
        )
      ).filter(Boolean) as ActiveOffer[];

      const offers = (
        await Promise.all(
          accountsDecoded.map(async (offer) => {
            if (!!offer.metadata && Object.keys(offer?.metadata)?.length > 0) {
              return offer;
            }

            const metaDataResponse = await fetch(offer.uri as RequestInfo).catch((err) => {
              return null;
            });
            if (metaDataResponse) {
              offer.metadata = await metaDataResponse.json();
              return offer;
            }
            return false;
          })
        )
      ).filter(Boolean) as ActiveOffer[];

      if (!isInitialLoad) {
        setActiveOffers([...activeOffers, ...offers]);
      } else {
        setActiveOffers(offers);
      }
    } else {
      setActiveOffers([]);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      loadOffers({ isInitialLoad: true }, sorting);
    }
  }, []);

  return (isLoading? <div className="flex justify-center">
    <div className="w-48">
      <LoadingWidget />
    </div>
  </div>:

    activeOffers.length > 0 ? (
    <div className="relative max-w-7xl mx-auto px-8 mb-24">
      <div className="flex justify-between"><h2 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-10 text-white inline">
        Popular Creations
      </h2>
      <Link to="/solo-browse"><p className="inline underline text-sm mt-3 opacity-60">View all</p></Link>
      </div>
      <div className="max-w-7xl sm:mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8">
        {activeOffers.map((offer: ActiveOffer, index: number) => (
          index<5 && <NftCard
            key={index}
            offer={offer}
          />
        ))}
      </div>
    </div>
  ) : null)
};
