import { CurrencyDollarIcon, FireIcon } from "@heroicons/react/solid";
import { TicketIcon } from "@heroicons/react/outline";
import { useEffect, useState } from "react";
import { Collection } from "../../types";
import { Button } from "antd";
import { GET_FEATURED_COLLECTION } from "../../constants/urls";
import { Link } from "react-router-dom";

export const HomeFeatured = () => {
  const [collection, setCollection] = useState<Collection>();
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`${GET_FEATURED_COLLECTION}`);
        const collection = await response.json();
        if (collection?.featured_list) {
          setCollection(collection?.featured_list[0]);
        }
      } catch (err) {
        console.log(err);
      }
    })();
    return () => {
      setCollection(undefined);
    };
  }, []);
  const isLaunchpadProject = collection?.type_ === "launchpad";
  return collection ? (
    <div className="my-8">
      <div className="max-w-7xl mx-auto pb-6 px-4">
        <div className="lg:grid lg:grid-cols-12 lg:gap-6 items-center my-5">
          <div className="mt-10 lg:mt-0 px-4 lg:col-span-6 align-middle md:max-w-2xl md:mx-auto lg:order-2">
            <div className="sm:w-full sm:mx-auto sm:rounded-lg sm:overflow-hidden">
              <img alt={`Banner for ${collection?.name}`} src={collection?.banner_url} />
            </div>
          </div>
          <div className="py-16 xl:py-40 px-4 sm:px-6 md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center lg:order-1">
            <div>
              <p className="flex align-middle">
                <FireIcon width="20" color="orange" className="mr-1" />
                <span className="mt-1 text-gray-200">
                  Featured {`${isLaunchpadProject ? "Launch" : "Collection"}`}
                </span>
              </p>
              <h1 className="mt-4 text-3xl tracking-tight font-extrabold text-white sm:mt-5 sm:leading-none lg:mt-6 lg:text-5xl">
                {collection?.name}
              </h1>

              <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-md lg:text-lg">
                {collection?.description}
              </p>


  {/* ADDED FOR ANIMAL GANG LAUNCHPAD START */}
  
              {/* {(collection?.type_ === "preapproved" || isLaunchpadProject) && (
                <div className="flex items-center mt-4">
                        <div className="pr-2 text-xs">
                          <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-md lg:text-lg">
                            SUPPLY
                          </p>
                          <TicketIcon
                            width="20"
                            color="white"
                            className="ml-4"
                          />
                          <p className="text-base text-white-300 sm:mt-5 sm:text-md lg:text-lg">
                          {collection?.supply}
                          </p>
                        </div>
                        <div className="px-2 text-xs">
                          <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-md lg:text-lg">
                            PRICE
                          </p>
                          <CurrencyDollarIcon
                            width="20"
                            color="white"
                            className="ml-3"
                          />
                          <p className="text-base text-white-300 sm:mt-5 sm:text-md lg:text-lg">
                            {collection?.mint_price} SOL
                          </p>
                        </div>
                    </div>
              )} */}

{/* ADDED FOR ANIMAL GANG LAUNCHPAD END */}


              {(collection?.type_ === "preapproved" || isLaunchpadProject) && (
                <div className="flex items-end text-white mt-4">
                  <TicketIcon width="20" color="gray" className="mr-1 mb-1" />
                  <span className="mt-1 text-gray-500">
                    Public Mint:{" "}
                    <span className="text-xl text-gray-300 font-bold">
                      {new Date(((collection?.mint_time || 0) * 1000) as number)
                        ?.toUTCString()
                        ?.replace(/(.*)\D\d+/, "$1")
                        ?.replace("GMT", "UTC")}
                    </span>
                  </span>
                </div>
              )}

              <div className="flex space-x-2 mt-8 gap-2 text-sm text-white  uppercase tracking-wide font-semibold sm:mt-10">
                {collection?.type_ === "live" ? (
                  <Link to={"/collections/" + collection?.name} className="btn">
                    View Collection
                  </Link>
                ) : isLaunchpadProject ? (
                  <Link to={"/launchpad/" + collection?.name} className="btn">
                    DE Launchpad
                  </Link>
                ) : (
                  <Button
                    onClick={() => window.open(collection?.website, "_blank")}
                    className="btn"
                  >
                    Visit Website
                  </Button>
                )}
              </div>
              <div className="mt-5 w-full sm:mx-auto sm:max-w-lg lg:ml-0">
                <div className="flex flex-wrap items-start justify-between"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};
