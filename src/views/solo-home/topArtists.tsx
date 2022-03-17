// @ts-ignore-next-line
import { IKImage } from "imagekitio-react";
import { Link } from "react-router-dom";
import { IMAGE_KIT_ENDPOINT_URL } from "../../constants/images";
import * as ROUTES from "../../constants/routes";
import { useCollections } from "../../contexts/collections";
import { Collection } from "../../types";
import { classNames } from "../../utils";
import { ThumbnailImage } from "../../components/ThumbnailImage";
import { Carousel } from "../../components//Carousel";
import { UNVERIFEYED_COLLECTION_OPTION } from "../../constants/collections";
import { CollectionCard } from "../../components/CollectionCard";
import { ReactComponent as VerifiedCircle } from "../../assets/icons/user-verified.svg";

export const TopArtists = () => {
  const { collections } = useCollections();
  const collectionsWithEpoch = collections.filter(
    (collection) => !!collection.publishedEpoch && collection.publishedEpoch > 0
  );

  const topArtists = [{
    user:"Gerwyn",
    pfp:"https://storage.googleapis.com/solo-creator-images-prod/8FUZ1ZAR069P17NZXECA"},
    {
      user:"KZoster",
      pfp:"https://storage.googleapis.com/solo-creator-images-prod/P7RG944ABK88J5DV1OWZ"},
      {
        user:"wltrcrnl",
        pfp:"https://storage.googleapis.com/solo-creator-images-prod/PMYMCN01K174HWJS1ZD5"},
        {
          user:"DMT_Vision",
          pfp:"https://storage.googleapis.com/solo-creator-images-prod/T3IRQ2ZDSIRACL9VO9BN"},
          {
            user:"ARTEFACT",
            pfp:"https://storage.googleapis.com/solo-creator-images-prod/7GRY6UK7IL7IA03X3OX7"},];

  //   const collectionArray= topCollections.map((collection)=>Object.entries(collection));
  //   console.log(typeof topCollections);

  return topArtists.length > 0 ? (
    <div className="relative max-w-7xl mx-auto px-8 mb-24">
      <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-10 text-white">
        Top Verified Solo Creators
      </h2>
      <div className="max-w-7xl sm:mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8">
        {topArtists.map((artist) => (
          <Link to={"/solo-profile/" + artist?.user} className="hover:opacity-60">
          <div className="grid grid-cols-1 gap-2 justify-items-center">
          <div ><img
            src={artist?.pfp}
            className="w-32 h-32 border-1 border-black rounded-full object-cover shadow-2xl"
          /></div>
          <div>
          <p className="inline">{artist.user}</p>
          <VerifiedCircle className="inline mx-1  w-3 h-3 inline" />
          </div>
          </div>
          </Link>

        ))}
      </div>
    </div>
  ) : null;
};
