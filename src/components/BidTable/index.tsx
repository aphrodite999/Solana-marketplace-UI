
import * as React from 'react';
import { useState } from 'react';
import { RefreshIcon } from "@heroicons/react/outline";
// import SearchIcon from '@material-ui/icons/Search';
// import InputBase from '@material-ui/core/InputBase';
// import { DropdownMenu, MenuItem } from 'react-bootstrap-dropdown-menu';
import Dropdown from 'react-bootstrap/Dropdown'
import InputGroup from 'react-bootstrap/InputGroup'
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.min.css';




const BidStateTable = () => {

  const [isLoading, setIsLoading] = useState(false)

  const refreshWalletItems = async () => {
    setIsLoading(true)
    setIsLoading(false)
  }

  const [keyword, setKeyword] = useState('');

  function setSearchWord(text: any) {
    setKeyword(text);
  }

  function changeKeyword(e: any): void {
    setSearchWord(e.target.value)
    console.log(e.target.value)
  }

  return (
    <div className="page-setting">
      <div className="flex">
        <button
          className="py-2 font-medium text-white uppercase hover:text-gray-500 hover:border-gray-500 sm:text-sm flex items-center space-x-2"
          onClick={() => refreshWalletItems()}
        >
          <RefreshIcon
            className={isLoading ? "w-5 h-5 animate-spin" : "w-5 h-5"}
            aria-hidden="true"
          />
        </button>
        <div className="search">
          <div className="searchIcon">
            <i className = "fa fa-search"></i>
          </div>
          <input
            placeholder="Search…"
            className={"inputRoot, inputInput, search-custom"}
            onChange={changeKeyword}
          />
        </div>
      </div>
      <div className="filters flex" style = {{marginLeft: 30}}>
        <div className="mx-1">
          <Dropdown style = {{color: "#818181", backgroundColor: "#171717!important", fontSize: "12px"}}>
            <Dropdown.Toggle>
              Transaction Type
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
              <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
              <Dropdown.Item href="#/action-4">Separated link</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="mx-1">
          <Dropdown style = {{color: "#818181", backgroundColor: "#171717!important", fontSize: "12px"}}>
            <Dropdown.Toggle>
              Sort by Collection
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
              <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
              <Dropdown.Item href="#/action-4">Separated link</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="mx-1">
          <Dropdown style = {{color: "#818181", backgroundColor: "#171717!important", fontSize: "12px"}}>
            <Dropdown.Toggle>
              Group Action
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
              <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
              <Dropdown.Item href="#/action-4">Separated link</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default BidStateTable;