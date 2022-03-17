import { History, LocationState } from "history";
import { Fragment,MutableRefObject, useContext, useEffect, useState } from "react";
import * as ROUTES from "../../constants/routes";
import { Collection } from "../../types";
import { StyledSelect } from "../StyledSelect";
import CreatableSelect from 'react-select/creatable';
import { BASE_URL_PROFILE_SEARCH } from "../../constants/urls";
import { classNames, mapObjectQueryParams, removeNullValuesFromObject } from "../../utils";
import { Link, useHistory, useLocation, useParams } from "react-router-dom";

export const SearchV2 = ({
  wallet,
  collections,
  topCollections,
  onClose,
  history,
  menuIsOpen,
  darkMode,
}: {
  wallet:any;
  collections: Collection[];
  topCollections: Collection[];
  onClose: (
    focusableElement?: HTMLElement | MutableRefObject<HTMLElement | null>
  ) => void;
  history: History<LocationState>;
  menuIsOpen?: boolean;
  darkMode?: boolean;
}) => {
  const darkTheme = {
    menu: (provided: any) => ({
      ...provided,
      boxShadow: "0px 4px 20px 0px #0000001A",
      borderRadius: "6px",
      marginTop:"35px",
      paddingLeft:"20px",
      paddingRight:"10px",

      paddingTop:"10px",
      paddingBottom:"10px",

      backgroundColor: "#171717",



    }),
    option: (provided: any, state: any) => ({
      ...provided,
      paddingLeft: "24px",
      backgroundColor: "#171717",
      borderRadius: "6px",
      color: "var(--color-main-secondary)",
      "&:hover": {
        backgroundColor: "#666666",
        color: "#000",
      },
    }),
    input: (provided: any, state: any) => ({
      ...provided,
      margin: "0",
      boxSizing: "border-box",
      paddingRight: "0",
      color: "#fff",
      cursor:"text"
    }),
    placeholder: (provided: any) => ({
      ...provided,
      paddingLeft: "0px",
      left: "36px",
      opacity: 0.5,
      position: "absolute",
      fontWeight: "300",
      color: "#fff",
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      padding: "0 36px",
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      display: "none",
    }),
    control: (provided: any) => ({
      ...provided,
      boxShadow: "none",
      backgroundColor: "transparent",
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23555'%3E%3Cpath fill-rule='evenodd' d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z' clip-rule='evenodd' /%3E%3C/svg%3E\")",
      backgroundSize: "22px",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "8px 8px",
      border: "none",
      "&:hover": {
        borderColor: "none",
      },
      color: "transparent",
    }),
  };
  const [ isLoadingOptions , setIsLoadingOptions] = useState<boolean>(false);
  const [ profileResults , setProfileResults ] = useState<any>("")
  //const [recentKeywords, setRecentKeywords] = useState<any>("");
  const search = useLocation().search;
  const searchActiveTab = new URLSearchParams(search).get('tab');

  useEffect(() => {


      let storedKeywords = wallet?.publicKey ? localStorage.getItem(`${wallet?.publicKey.toString()}sKeywords`) : localStorage.getItem('sKeywords');
    //  console.log(storedKeywords, wallet?.publicKey.toString());


  }, []);




  const setRecent=()=>{

  }



  const collectionDropdown: {
      label: string;
      options: { label: string; value: string }[];
    }[]=[];

  collectionDropdown.push(
      {
        label: 'Top Collections',
        options: topCollections.map((topCollection: Collection) => {
          return {
            value: `${ROUTES.COLLECTIONS}/${topCollection?.name}`,
            label: topCollection?.name?.toUpperCase(),
          }
        })
      },
      {
        label: 'All Collections',
        options: collections.map((collection: Collection) => {
          return {
            value: `${ROUTES.COLLECTIONS}/${collection?.name}`,
            label: collection?.name?.toUpperCase(),
          }
        })
      }
    );

  if(profileResults!=""){
    collectionDropdown.splice(0,0,{
      label: 'Users',
      options: profileResults
    })
  }

const handleInputChange =  (value:string) => {

  if(value!="" && value.length>2){
    setIsLoadingOptions(true);
    try {
    const results =  fetch(`${BASE_URL_PROFILE_SEARCH}/${encodeURIComponent(value)}/`)
    .then(res=>res.json())
    .then(data=>{
    const artistsMapped = data.artist_list.map((artist:any)=>{return {
        value: `${ROUTES.SOLOPROFILE}/${artist?.username}`,
        label: artist?.username,
      }});


    setProfileResults(artistsMapped);
    setIsLoadingOptions(false);
    })

  } catch (error) {
    console.log(error);
    setIsLoadingOptions(false)

  }
  setIsLoadingOptions(false);


}


  /**collectionDropdown.splice(0,1,
    {
      label: 'Users',
      options: [{
          value: `e`,
          label: e,

      }]
    })*/

  //  console.log(collectionDropdown);


}

const reactSelectCustomStyles = {
  cursor:"text",
  control: (provided: any) => ({
    ...provided,
    boxShadow: "none",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "0px",
    borderBottom: "0px",
    "&:hover": {
      borderColor: "none",
    },
    color: "var(--color-main-secondary)",
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    // textAlign: "right",
    //paddingLeft: "10px",
    fontWeight: state.isSelected ? "normal" : "300",
    backgroundColor: "transparent",
    color: "var(--color-main-secondary)",
    fontSize: "13px",
    "&:hover": {
      backgroundColor: "#666666",
      color: "#000",
    },
  }),
  singleValue: (provided: any) => ({
    ...provided,
    fontWeight: "300",
    color: "#ccc",
    fontSize: "13px"
  }),
  multiValue: (provided: any) => ({
    ...provided,
    backgroundColor: "hsl(0,0%,85%)",
  }),
  placeholder: (provided: any) => ({
    ...provided,
    backgroundColor: "transparent",
    opacity: 0.35,
    fontWeight: "300",
    color: "var(--color-main-secondary)",
    width: "100%",
    fontSize: "13px"
    // display: "flex",
    // justifyContent: "flex-start",
  }),
  valueContainer: (provided: any) => ({
    ...provided,
    // justifyContent: "flex-start",
  }),
  indicatorSeparator: (provided: any) => ({
    ...provided,
    display: "none",
  }),
  menu: (provided: any) => ({
    ...provided,
    marginTop:"10px",
    borderRadius: "5px",
    boxShadow: "0px 4px 20px 0px #0000001A",


  }),
  indicatorContainer: (provided: any) => ({
    ...provided,
    color: "var(--color-main-secondary)",

  }),
  menuPortal: (provided: any, state: any) => ({
    ...provided,
    zIndex: "20",
    position: "fixed",
    borderRadius: "5px",
    boxShadow: "0px 4px 20px 0px #0000001A",
  }),
  menuList: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: "#171717",
    borderWidth: "0px",
    borderRadius: "5px",
    borderColor: "#333",
    paddingRight:"15px",
    "::-webkit-scrollbar": {
              width: "9px",
            },
            "::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "::-webkit-scrollbar-thumb": {
              background: "#878787",
              borderRadius:"6px",
            },
            "::-webkit-scrollbar-thumb:hover": {
              background: "#555"
            }


  }),
};
const selectStyles = { ...reactSelectCustomStyles, ...darkTheme };


  return (
    <CreatableSelect
    styles={selectStyles}
    options={collectionDropdown}
    placeholder="Search"
    isClearable
    isLoading={isLoadingOptions}
    createOptionPosition="first"
    formatCreateLabel={(inputValue:string) => `Search with "${inputValue}"`}
    onInputChange={handleInputChange}
    onCreateOption={(searchString)=>history.push(`${ROUTES.SEARCH_RESULTS}?q=${encodeURIComponent(searchString)}${searchActiveTab!=null ? "&tab="+searchActiveTab:""}`)}
    noOptionsMessage={()=>"Start typing to Search..."}
    onChange={(option: any) => {
      if (option) {
        history.push(option.value);
        onClose();
      }
    }}
    />



  );
};
