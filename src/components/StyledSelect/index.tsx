import Select from "react-select";

interface StyledSelectProps {
  placeholder?: string;
  options: any;
  onChange: any;
  placeholderPrefix?: string;
  isMulti?: boolean;
  isClearable?: boolean;
  isLoading?: boolean;
  value?: any;
  menuIsOpen?: boolean;
  styles?: any;
  menuPortalTarget?: any;
  controlShouldRenderValue?: boolean;
  className?: string;
}

export const StyledSelect: React.FC<StyledSelectProps> = ({
  placeholder,
  options,
  onChange,
  placeholderPrefix,
  isMulti = false,
  isClearable = false,
  isLoading = false,
  value,
  menuIsOpen,
  styles,
  menuPortalTarget,
  controlShouldRenderValue,
  className,
}) => {
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

  const selectStyles = { ...reactSelectCustomStyles, ...styles };
  return (
    <Select
      styles={selectStyles}
      placeholder={placeholder}
      options={options}
      onChange={onChange}
      isMulti={isMulti}
      isClearable={isClearable}
      isLoading={isLoading}
      value={value}
      menuIsOpen={menuIsOpen}
      autoFocus={false}
      controlShouldRenderValue={controlShouldRenderValue}
      className={className}
    />
  );
};
