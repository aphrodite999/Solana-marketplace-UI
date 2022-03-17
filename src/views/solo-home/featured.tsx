import React, { useState } from "react";
import AliceCarousel from "react-alice-carousel";
import "react-alice-carousel/lib/alice-carousel.css";
import { MinusIcon,FireIcon } from "@heroicons/react/outline";
import { Link } from "react-router-dom";
import { ReactComponent as VerifiedCircle } from "../../assets/icons/user-verified.svg";
import "./styles.css";


export const SoloHomeFeatured = () => {

  const cluster=[{
    user:"Gerwyn",
    banner:"https://www.arweave.net/gbtEHbC-_9FW3Qtuqcd08wzDUUTIqn17wzadVyGH9DE?ext=gif",
    pfp:"https://storage.googleapis.com/solo-creator-images-prod/8FUZ1ZAR069P17NZXECA",
    description:"Hey there, I'm a pixel mover and here to satisfy your eye."
  },{
    user:"ZSY",
    banner:"https://www.arweave.net/PptG73KsyO5BqD-h_Ad_n535tyDMSIk_nDYq693eKaw?ext=jpeg",
    pfp:"https://storage.googleapis.com/solo-creator-images-prod/18EMEP1BB59DQJLOVMLB",
    description:"ZSY Trolling the metaverse since 2020 All NFTracks will be 1:1 with exclusive rights."
  },{
    user:"Ds3",
    banner:"https://www.arweave.net/Rjgkr47qRnUmiOuIFOOp-g2YL0pkTehMS-SgSCoevCU?ext=png",
    pfp:"https://storage.googleapis.com/solo-creator-images-prod/O2ZDX3E9W96LNYKZ9FN9",
    description:"I play with all things blockchain/web3 related. Generative art is the first artistic medium that has resonated with me so please enjoy the fruits of my labor :)"
  }];

  const items = cluster.map((artist) => (
    <div className="overflow-hidden h-full w-full object-cover" style={{height:"600px"}}>
      <div className="bg-image-gradient object-cover h-full">
      <img src={artist.banner} className="z-0 w-screen object-cover h-screen opacity-50"/>
      </div>
      <div className="w-full flex justify-center">
      <div className="z-10 absolute top-16 md:top-36 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
        <p className="flex align-middle justify-center md:justify-start">
            <FireIcon width="20" color="orange" className="mr-1" />
            <span className="mt-1 text-gray-200">Featured Artist</span>
          </p>
          <h1 className="mt-2 text-3xl tracking-tight font-extrabold text-white sm:mt-3 sm:leading-none lg:mt-2 lg:text-5xl text-center md:text-left">
            {artist?.user}<VerifiedCircle className="inline mx-3  w-5 h-5" />
          </h1>

          <p className="mt-1 text-base text-gray-200 sm:mt-2 sm:text-md lg:text-lg w-96 text-center md:text-left">
            {artist?.description}
          </p>
          </div>
          <div className="flex content-center justify-center md:justify-start">
          <img
            src={artist?.pfp}
            className="w-44 h-44 md:w-64 md:h-64 border-1 border-black rounded-full object-cover shadow-2xl"
          />
          </div>
          <div className="flex justify-center md:justify-start">
          <Link to={"/solo-profile/" + artist?.user} className="btn">
            View Artist
          </Link></div>

        <div>

        </div>
      </div></div>
    </div>
  ));

  return (

    <div className="">
        <AliceCarousel
          mouseTracking={true}
          items={items}
          controlsStrategy="responsive"
          autoPlay={true}
          autoPlayInterval={5000}
          infinite={true}
          keyboardNavigation={true}
          disableButtonsControls

        />
      </div>
  );
};
