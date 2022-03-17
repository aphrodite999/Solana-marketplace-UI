import { useHistory } from "react-router-dom";
import { Fragment, useState, useEffect } from "react";
import * as ROUTES from "../../constants/routes";
// @ts-ignore-next-line
import { IKImage } from "imagekitio-react";
import { getImagePath, IMAGE_KIT_ENDPOINT_URL, isImageInCache } from "../../constants/images";
import { ActiveArtist } from "../../types";
import { Menu, Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/outline";
import { CHECK_IS_FOLLOWING, FOLLOW_TOGGLE_URL } from "../../constants/urls";
import { useWallet as useWallet0 } from "../../contexts/wallet";
import { LoadingWidget } from "../loadingWidget";
import { authApiRequest } from "../../utils";

export interface ModalUserActionsProps {
  user: ActiveArtist;
  onClose:()=> void;
}

export const ModalUserActions: React.FC<ModalUserActionsProps> = ({ user,onClose }) => {
  const history = useHistory();
  const [ followed, setFollowed ] = useState<boolean>(false);
  const wallet = useWallet0();
  const publicKey = wallet.publicKey;
  const [imageCacheFailed, setImageCacheFailed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

const checkFollowing = async () => {
  setIsLoading(true);
  if(wallet?.publicKey){
    const followedStatus = await fetch(
      `${CHECK_IS_FOLLOWING}?follower=${wallet?.publicKey}&user=${user?.wallet_key}`
    ).then((res)=>{
      if (res.ok){
        return res.json();
      }else{
        setFollowed(false);
        return false;
      }
    })
    setFollowed(followedStatus.message);
  }
  setIsLoading(false);

}

const imageCacheFallback = (parentNode: any) => {
  setImageCacheFailed(true);
};
const handleVisitProfile = () =>{
  onClose();
  history.push(`${ROUTES.SOLOPROFILE}/${user?.username}`);
}

const followToggle = async (targetUserAddress:string) =>{
  if(wallet?.publicKey){
  await authApiRequest( FOLLOW_TOGGLE_URL, { "user":targetUserAddress },'POST','application/json',wallet);
  setTimeout(() => {
    checkFollowing()
  }, 400);
  }
}

useEffect(() => {
 if(publicKey?.toString()!=user?.wallet_key){
   checkFollowing();}
}, []);

    return (
      <div className="flex justify-between my-2">
      <div
      onClick={(e:any)=>{handleVisitProfile()}}
      >
      {user?.image && isImageInCache(user?.image) && !imageCacheFailed ? (
        <IKImage
          urlEndpoint={IMAGE_KIT_ENDPOINT_URL}
          path={user?.image}
          alt={user?.username + "image"}
          className="w-12 h-12 border-1 border-black rounded-full object-cover shadow-2xl inline cursor-pointer"
          onError={imageCacheFallback}
        />
      ) : (
        <img
          src={
            user?.image.length === 0
              ? "https://storage.googleapis.com/solo-creator-images-prod/defaultProfilePicture.jpeg"
              : user?.image
          }
          alt={user?.username + "image"}
          className="w-12 h-12 border-1 border-black rounded-full object-cover shadow-2xl inline cursor-pointer"
        />
      )}
      <p className="inline text-sm pl-5 cursor-pointer">{user.username}</p>
      </div>
      {!isLoading && <div>
      {publicKey?.toString() != user?.wallet_key &&
      <div>
      {!followed &&
        <button
        onClick={(e:any)=>{e.preventDefault();followToggle(user?.wallet_key)}}
        className="btn-prof ml-1 px-7">
      Follow
      </button>}
      {followed &&
      <button
        onClick={(e:any)=>{handleVisitProfile()}}
        className="btn-prof btn-gray ml-1 px-4">
      <span>  Visit Profile </span>
      </button>}
      </div>}
      </div>}
      </div>
    );
  }
