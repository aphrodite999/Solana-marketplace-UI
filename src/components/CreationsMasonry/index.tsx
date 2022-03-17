import { useHistory } from "react-router-dom";
import { useState, useEffect } from "react";
import * as ROUTES from "../../constants/routes";
// @ts-ignore-next-line
import { IKImage } from "imagekitio-react";
import { getImagePath, IMAGE_KIT_ENDPOINT_URL, isImageInCache } from "../../constants/images";
import Masonry from "react-masonry-css";
import {PlusCircleIcon,MinusCircleIcon} from "@heroicons/react/solid"
import { LoadingWidget } from "../../components/loadingWidget"

export interface CreationsMasonryProps {
  arrayDisplay: any;
  edit?: boolean;
  theme?:any;
  arrayEdit?:any;
  cancelEdit:() => void;
  saveChanges: (items:any) => void;
  isLoading?:boolean;
  isOwner?:boolean;
}

export const CreationsMasonry: React.FC<CreationsMasonryProps> = ({ arrayDisplay, edit,theme,arrayEdit,cancelEdit,saveChanges,isLoading,isOwner }) => {
  const history = useHistory();
  const [items,setItems] = useState<any>([]);
  const [isItemsLoading, setIsItemsLoading] = useState<boolean>(true)

  const addAllInWallet = () => {
    let mintList = arrayEdit.map((nft:any)=> nft.mint)
    setItems(mintList);

  }

  const addItem = (itemMint:string) => {
    if(!items?.includes(itemMint))
    {
      setItems([...items,itemMint])
    }
  }

  const removeAll = () => {
    setItems([]);
  }

  const removeItem = (itemMint:string) => {
    let mintList = items.filter((item:string)=> item != itemMint)
    setItems(mintList);
  }

  const save = () => {
    saveChanges(items);
    setItems([])
  }

  const cancel = () => {
    cancelEdit();
  }

  const itemsToDisplay = edit? arrayEdit : arrayDisplay;
  const masonryItems = itemsToDisplay?.map(function (item:any, index:number) {
    const goToNFT = (e: any) => {
      if (Boolean(e.ctrlKey || e.metaKey || e.button === 1)) {
        window.open(
          `${window.location.origin}${ROUTES.SOLO_ITEM}/${item.mint}`
        );
      } else {
        history.push(`${ROUTES.SOLO_ITEM}/${item.mint}`);
      }
    };


    return (
      <div
        className={edit ? "mt-1 relative p-4 animate-wiggle":"mt-1 hover:opacity-60 cursor-pointer relative" }
        key={index}
        onClick={!edit ? goToNFT:undefined}
        >
        {" "}
        <img
          src={item?.metadata ? item.metadata?.image : item?.image}
          className={edit? "w-full blur-lg ":"w-full"}
          onLoadStart = {(e:any)=>{setIsItemsLoading(true)}}
          onLoad = {(e:any)=>{setIsItemsLoading(false)}}
        />
      {edit &&
        <button
        className="absolute -right-2 -top-2"
        >

        {!items.includes(item?.mint) ?
          <span className="text-green-500">
          <PlusCircleIcon
            className="w-10 h-10 hover:opacity-60 "
            onClick={(e:any)=>addItem(item?.mint)}/>
            </span>:
            <span className="text-red-500">
          <MinusCircleIcon
              className="w-10 h-10 hover:opacity-60 "
              onClick={(e:any)=>removeItem(item?.mint)}/>
              </span>}
        </button>}
      </div>
    );
  });

  useEffect(() => {
    setItems(arrayDisplay.map((nft:any)=>nft.mint))
  }, [arrayDisplay])

  useEffect(() => {
    if (itemsToDisplay?.length < 1) {
      setIsItemsLoading(false)
    }
  }, [])



  return (
    <div>
    {itemsToDisplay?.length > 0 && edit && !isLoading && <div className="w-full">
    <div className="flex justify-between">
    <div>
      <button
        className="btn-prof btn-gray m-2"
        onClick={addAllInWallet}>
            Add All
        </button>
      <button
            className="btn-prof btn-gray m-2"
            onClick={removeAll}>
            Remove All
        </button>
    </div>
    <div>
    <button
      className="btn-prof btn-gray m-2"
      onClick={cancel}
      >
        Cancel
      </button>
      <button
        className="btn-prof m-2"
        onClick={save}
        >
          Save Changes
        </button>
    </div>
    </div>
    </div>}
    {itemsToDisplay?.length > 0 && !isLoading && <div>
    <Masonry
      breakpointCols={3}
      className="my-masonry-grid"
      columnClassName="my-masonry-grid_column"
    >
    {masonryItems}
      {/**creations?.map(function (item, index) {
        return (
          <div className="mt-1" key={index}>
            {" "}
            <IKImage
              urlEndpoint={IMAGE_KIT_ENDPOINT_URL}
              path={item?.image}
              alt="digital eyes cant find"
            />
          </div>
        );
      })*/}
    </Masonry>

      </div>}
      {itemsToDisplay?.length == 0 && !isLoading && !isItemsLoading && <div className="w-full text-center">
      <span
      className="text-sm text-center w-full"
      style={{ color: theme.textSecondary }}>
      {isOwner ? "Nothing to see here. Edit your profile to display your NFTs": "Nothing to see here"}
      </span>
      </div>}

      { isLoading && <div className="w-full flex justify-center">
      <div
      className="w-48 h-48">
      <LoadingWidget/>
      </div>
      </div>}
      { isItemsLoading && <div className="w-full flex justify-center">
      <div
      className="w-48 h-48">
      <LoadingWidget/>
      </div>
      </div>}
      </div>

  );
};
