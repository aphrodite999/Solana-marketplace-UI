import {
  HeartIcon as HeartIconSolid,
  ShieldCheckIcon,
  ThumbUpIcon as ThumbUpSolid,
  ThumbDownIcon as ThumbDownSolid,
} from "@heroicons/react/solid";
import {
  HeartIcon as HeartIconOutline,
  ClipboardCopyIcon,
  EyeIcon,
  ThumbUpIcon,
  ThumbDownIcon,
} from "@heroicons/react/outline";

import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useHistory } from "react-router-dom";
// @ts-ignore
import { IKImage } from "imagekitio-react";
import { useContext, useState, useEffect } from "react";
import * as ROUTES from "../../constants/routes";
import { getImagePath, IMAGE_KIT_ENDPOINT_URL, isImageInCache } from "../../constants/images";
import { ActiveOffer } from "../../types";
import {
   getTraitValueByKey,
   isSolarian,
   handlerFavorites,
   itemIsFavorite,
   authApiRequest,
   shortenAddress
 } from "../../utils";
import { useTooltipState, Tooltip, TooltipArrow, TooltipReference } from "reakit/Tooltip";
import QuickViewContext from "../../contexts/quick-view";
import { REACT_TO_ENTITY } from "../../constants/urls";
import { useWallet as useWallet0 } from "../../contexts/wallet";
import { toast } from "react-toastify";

export interface SoloNftCardProps {
  offer?: any;
  onClick?: (e: any) => void;
}

export const SoloNftCard: React.FC<SoloNftCardProps> = ({ offer }) => {
  const [isFavorite, setIsFavorite] = useState<boolean>(itemIsFavorite(offer));
  const [cacheFailed, setCacheFailed] = useState<boolean>(false);
  const [artistImageCacheFailed, setArtistImageCacheFailed] = useState<boolean>(false);
  const tooltipQuickView = useTooltipState();
  const [copied, setCopied] = useState<boolean>(false);
  const history = useHistory();
  const { open } = useContext(QuickViewContext);
  const [ voteCount, setVoteCount] = useState<number>(0);
  const [ reaction, setReaction ] = useState<number>();
  const wallet = useWallet0();

  const cacheFallback = (parentNode: any) => {
    setCacheFailed(true);
  };

  const artistImageCacheFallback = (parentNode: any) => {
    setArtistImageCacheFailed(true);
  };
  const collectionPath = offer?.collectionName ? offer?.collectionName : "unverifeyed";

  // const copyLink = () => {
  //   setCopied(true);
  //   navigator.clipboard.writeText(
  //     `${window.location.origin}${ROUTES.ITEM}/${collectionPath}/${offer?.mint}?pk=${offer?.escrowPubkeyStr}`
  //   );
  //   setTimeout(() => {
  //     setCopied(false);
  //   }, 2000);
  // };
  console.log(offer);

  const goToNFT = (e: any) => {
    if (Boolean(e.ctrlKey || e.metaKey || e.button === 1)) {
      window.open(
        `${window.location.origin}${ROUTES.SOLO_ITEM}/${offer.mint}`
      );
    } else {
      history.push(`${ROUTES.SOLO_ITEM}/${offer.mint}`);
    }
  };

  const goToArtist = (e: any) => {
    if(offer?.artistUser){
      if (Boolean(e.ctrlKey || e.metaKey || e.button === 1)) {
      window.open(`${window.location.origin}${ROUTES.SOLOPROFILE}/${offer.artistUser}`);
    } else {
      history.push(`${ROUTES.SOLOPROFILE}/${offer.artistUser}`);
    }}
  };

  const handleThumbUp = async () =>{
    if(wallet?.publicKey){
    try {
      if(reaction!=2){
        if (reaction==1){
          setVoteCount(voteCount+2);}
          else if(reaction==0){
            setVoteCount(voteCount+1)
          };
        setReaction(2);
      }else{
        setVoteCount(voteCount-1);
        setReaction(0);
      }
      const url = REACT_TO_ENTITY+"?entity_id="+offer?.mint+"&entity_kind=offer&reaction=2";
      await authApiRequest( url, {},'POST','application/json',wallet);
      getReactionInfo();
    } catch (error) {
        setReaction(0);
        console.log(error);
      }}else{
        toast.info("Please connect to your Wallet/Account to Vote", {
          position: "bottom-left",
          autoClose: 5000,
        });
      }
  }

  const handleThumbDown = async () =>{
    if(wallet?.publicKey){
      try {
        if(reaction!=1){
          if (reaction==2){
            setVoteCount(voteCount-2);}
            else if(reaction==0){
              setVoteCount(voteCount-1)
            };
          setReaction(1);
        }else{
          setVoteCount(voteCount+1);
          setReaction(0);
}
      const url = REACT_TO_ENTITY+"?entity_id="+offer?.mint+"&entity_kind=offer&reaction=1";
      await authApiRequest( url, {}, 'POST', 'application/json', wallet);
      getReactionInfo();
    } catch (error) {
        setReaction(0);
        console.log(error);
    }}else{
      toast.info("Please connect to your Wallet/Account to Vote", {
        position: "bottom-left",
        autoClose: 5000,
      });
    }
  }

  const getReactionInfo = async () => {
    if (wallet?.publicKey) {
      const reactionStatus = await fetch(
        `${REACT_TO_ENTITY}?user_wallet_key=${wallet?.publicKey}&entity_id=${offer?.mint}&entity_kind=offer`
      ).then((res)=>{
        if (res.ok){
          return res.json();
        }else{
          console.log("Get like status failed");
          return "error";
        }
      }
    )

    const voteCount = await fetch(
      `${REACT_TO_ENTITY}/count?entity_id=${offer?.mint}&entity_kind=offer`
    ).then((res)=>{
      if (res.ok){
        return res.json();
      }else{
        console.log("Get like status failed");
        return "error";
      }
    })
    if (reactionStatus.reaction=="upvote"){
      setReaction(2);
    }else if(reactionStatus.reaction=="downvote"){
      setReaction(1);
    }else if(reactionStatus.reaction=="none"){
      console.log(reactionStatus.reaction);

      setReaction(0);
    }
    const totalVotes:number = parseInt(voteCount?.reaction_count.upvotes) - parseInt(voteCount?.reaction_count.downvotes);
    setVoteCount(totalVotes);
  }}

  const anonDisplay : string | undefined = offer.solo? `Anon${shortenAddress(offer?.collectionName.split("#")[2])}`:undefined;


  useEffect(() => {
     if(reaction==null){
       getReactionInfo();
     }
   }
  );

  return (
    <div>
    <div className="grid grid-cols-2 flex justify-between py-2 ">
    <div onClick={goToArtist}
    >
    {offer?.artistImage && isImageInCache(offer?.artistImage) && !artistImageCacheFailed ? (
        <IKImage
        urlEndpoint={IMAGE_KIT_ENDPOINT_URL}
        path={offer?.artistImage}
        alt={offer?.artistUser + "image"}
        className={offer?.artistUser ? "w-12 h-12 border-1 border-black rounded-full object-cover shadow-2xl inline cursor-pointer":
                                        "w-12 h-12 border-1 border-black rounded-full object-cover shadow-2xl inline"}
        onError={artistImageCacheFallback}
        />
        ) : (
        <img
        src={
          offer?.artistImage.length === 0
            ? "https://storage.googleapis.com/solo-creator-images-prod/defaultProfilePicture.jpeg"
            : offer?.artistImage
        }
        alt={offer?.artistUser + "image"}
        className={offer?.artistUser ? "w-12 h-12 border-1 border-black rounded-full object-cover shadow-2xl inline cursor-pointer":
                                        "w-12 h-12 border-1 border-black rounded-full object-cover shadow-2xl inline"}
        />
      )}
      {offer?.artistUser ?
              <div
                className="text-white text-lg text-left inline cursor-pointer ml-4"
              >
                {offer?.artistUser}
              </div>
            : <div
              className="text-white text-lg text-left inline opacity-60 ml-4"
            >
              {anonDisplay}
            </div>
          }

      </div>
      <div className="flex justify-end items-center ">
        <p className="text-xl">{offer?.price ? `◎${offer?.price}` : " "}</p>

      </div>
    </div>
      <li
        className="grid-cols-2 flex justify-between w-auto cursor-pointer overflow-hidden mx-0 pt-15 transition-all mt-2"
        onClick={goToNFT}
      >
        <div className="col-span-2 w-full">
          {offer?.metadata?.image && isImageInCache(offer.metadata.image) && !cacheFailed ? (
            <IKImage
              urlEndpoint={IMAGE_KIT_ENDPOINT_URL}
              path={getImagePath(offer.metadata?.image)}
              transformation={[
                {
                  height: 600,
                  dpr: "auto",
                },
              ]}
              lqip={{ active: true, quality: 5, blur: 20 }}
              alt={offer.metadata?.name}
              height="600"
              onError={cacheFallback}
              className="card-img w-auto mx-auto h-full object-center object-contain"
            />
          ) : (
            <img
              className="card-img w-auto h-full object-center object-contain"
              src={offer?.metadata?.image}
              alt={offer?.metadata?.name}
            />
          )}
        </div>
      </li>
      <div className="col-span-2 py-1 flex justify-end">
        <p className="text-white text-xs text-left inline">{offer?.metadata.name}</p>
      </div>
      <div className="col-span-2 py-1 flex justify-between items-center">
        <div
          className="w-5 h-5 mr-2 opacity-80 hover:opacity-100 cursor-pointer"
          onClick={handleThumbUp}>
          {reaction==2 && <ThumbUpSolid/>}
          {reaction==1 && <ThumbUpIcon/>}
          {reaction==0 && <ThumbUpIcon/>}

          </div>
        <p
          className={voteCount==0 ? "text-xs opacity-0 w-10 text-center":"text-xs opacity-70 w-10 text-center"}
          >{voteCount}</p>
        <div
          className="w-5 h-5 ml-2 opacity-80 hover:opacity-100 cursor-pointer"
          onClick={handleThumbDown}>
          {reaction==2 && <ThumbDownIcon/>}
          {reaction==1 && <ThumbDownSolid/>}
          {reaction==0 && <ThumbDownIcon/>}
            </div>

        <div className="flex-1">

        </div>
        <div className="flex justify-between gap-5 items-center">
          <TooltipReference {...tooltipQuickView}>
            <button
              className="hover:text-white p-1 group"
              onClick={() => {
                open(offer);
              }}
            >
              <EyeIcon className="h-4 w-4 group-hover:text-white transition 150 ease-in-out" />
            </button>
          </TooltipReference>
          <Tooltip {...tooltipQuickView} style={{ background: "none" }}>
            <div className="bg-black text-xs p-2 rounded-md">
              <TooltipArrow {...tooltipQuickView} />
              Quick Preview
            </div>
          </Tooltip>

          {/**<button
              onClick={(e) => {
                setIsFavorite(handlerFavorites(e, offer));
              }}
              className="inline-flex justify-end hover:text-white pl-2"
            >
              {isFavorite ? (
                <p className="inline-flex items-center text-xxs">
                  <HeartIconSolid className="text-red-400 h-5 w-5 mr-1 focus:outline-none" />
                </p>
              ) : (
                <p className="inline-flex items-center text-xxs">
                  <HeartIconOutline className="text-gray-400 h-5 w-5 mr-1 focus:outline-none hover:text-red-400" />
                </p>
              )}
            </button>*/}
        </div>
      </div>
    </div>
  );
};
