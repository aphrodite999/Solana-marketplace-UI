import {
  ThumbUpIcon as ThumbUpSolid,
  ThumbDownIcon as ThumbDownSolid,
} from "@heroicons/react/solid";
import {
  ThumbUpIcon,
  ThumbDownIcon,
} from "@heroicons/react/outline";
import { useState, useEffect } from "react";
import { ActiveOffer } from "../../types";
import { authApiRequest } from "../../utils";
import { useTooltipState, Tooltip, TooltipArrow, TooltipReference } from "reakit/Tooltip";
import { REACT_TO_ENTITY } from "../../constants/urls";
import { useWallet as useWallet0 } from "../../contexts/wallet";
import { toast } from "react-toastify";

export interface VotingBarProps {
  offer?: any;
}

export const VotingBar: React.FC<VotingBarProps> = ({ offer }) => {
  const tooltipQuickView = useTooltipState();
  const [ voteCount, setVoteCount] = useState<number>(0);
  const [ reaction, setReaction ] = useState<number>();
  const wallet = useWallet0();

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

  useEffect(() => {
     if(reaction==null){
       getReactionInfo();
     }
   }
  );

  return (
    <div>
      {offer.price && (
        <div className="grid grid-cols-3 gap-4 justify-items-center">
        <div
          className="opacity-80 hover:opacity-100 cursor-pointer bg-gray-900 hover:bg-gray-600 rounded-lg w-full flex justify-center"
          onClick={handleThumbUp}>
          <div className="w-7 h-7 m-3">
          {reaction==2 && <ThumbUpSolid/>}
          {reaction==1 && <ThumbUpIcon/>}
          {reaction==0 && <ThumbUpIcon/>}
          </div>

          </div>
        <p
          className={voteCount==0 ? "text-lg opacity-0 w-10 text-center":"text-lg opacity-70 w-10 flex items-center justify-center"}
          >{voteCount}</p>
        <div
          className="opacity-80 hover:opacity-100 cursor-pointer bg-gray-900 hover:bg-gray-600 rounded-lg w-full flex justify-center"
          onClick={handleThumbDown}>
          <div className="w-7 h-7 m-3">

          {reaction==2 && <ThumbDownIcon/>}
          {reaction==1 && <ThumbDownSolid/>}
          {reaction==0 && <ThumbDownIcon/>}
            </div>
            </div>

      </div>)}
    </div>
  );
};
