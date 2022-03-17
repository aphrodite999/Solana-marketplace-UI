import { SoloCollectionActionsProps } from "./interfaces/props";
import { StyledSelect } from "../StyledSelect";
import { AdjustmentsIcon } from "@heroicons/react/solid";

export const SoloCollectionActions = ({
  isCollectionWithOffers,
  filtersFromMetadata,
  toggleActiveFilters,
  sorting,
  setSorting,
  isLoading,
  count,
}: SoloCollectionActionsProps) => {

  const sortOptions = [
    { value: "tallyVotesCount=desc", label: "Most Popular" },
    { value: "tallyVotesCount=asc", label: "Least Popular" },
    { value: "addEpoch=desc", label: "Recently Listed" },
    { value: "price=asc", label: "Price - Low to High" },
    { value: "price=desc", label: "Price - High to Low" },
  ];

  const getSortBySelectedOption = () =>
    sortOptions.find((sortOption:any) => sortOption.value === sorting) ||
    (sortOptions[0] as {
      value: string;
      label: string;
    });

    const darkTheme = {
      menu: (provided: any) => ({
        ...provided,
        boxShadow: "0px 4px 20px 0px #0000001A",
        borderRadius: "6px",
        marginTop:"5px",
        padding:"10px",
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
      })
    };

  return (
    <>
    {( !!count && count > 0 ) && (<div className="flex justify-between items-center mt-8 mb-5 w-full">
      <span className="flex-1">
        {!isLoading && !!filtersFromMetadata && filtersFromMetadata?.length > 0 && (
          <button
            className="text-sm w-full py-2 text-white text-left flex items-center"
            onClick={toggleActiveFilters}
          >
            <AdjustmentsIcon className="w-4 mr-4"/> Advanced filters
          </button>
        )}
      </span>

      <div className="flex-0 md:flex-1 text-center font-light text-sm text-gray-500 mt-0">
        <div>{count} {count > 1 || count === 0 ? "listings" : "listing"}</div>
      </div>


      <div className="flex-1 text-sm max-w-md">
        <div style={{ maxWidth: '250px', marginLeft: 'auto'}}>
          {isCollectionWithOffers && (
            <StyledSelect
              options={sortOptions}
              isLoading={isLoading}
              onChange={(option: any) => {
                if (option) {
                  setSorting(option?.value);
                }
              }}
              placeholder="Sort by..."
              placeholderPrefix="Sorting by"
              value={getSortBySelectedOption()}
              styles={darkTheme}
            />
          )}
        </div>
      </div>
    </div>)}
    {!count && (<div className="flex items-center mb-2 w-full">
      <div className="items-center flex-1 text-sm max-w-4xl ">
        <div style={{ maxWidth: '250px', marginLeft: 'auto'}}>
          {isCollectionWithOffers && (
            <StyledSelect
              options={sortOptions}
              isLoading={isLoading}
              onChange={(option: any) => {
                if (option) {
                  setSorting(option?.value);
                }
              }}
              placeholder="Sort by..."
              placeholderPrefix="Sorting by"
              value={getSortBySelectedOption()}
              styles={darkTheme}
            />
          )}
        </div>
      </div>
    </div>)}
    </>

  );
};

export default SoloCollectionActions;
