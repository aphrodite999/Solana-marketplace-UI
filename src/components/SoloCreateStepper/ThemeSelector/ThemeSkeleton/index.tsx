import { Theme } from "../../../../constants/solo-themes";

interface ThemeSkeletonProps {
  theme: Theme;
}

export const ThemeSkeleton: React.FC<ThemeSkeletonProps> = ({ theme }) => {
  return (
    <svg
      width="267"
      height="240"
      viewBox="0 0 267 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto rounded-lg overflow-hidden"
    >
      <g id="Frame 12">
        <rect width="1420" height="2100" transform="translate(-428 -1015)" fill="#0B0B0B" />
        <g id="ThemeSkeleton">
          <path
            id="main-background"
            d="M0 5C0 2.23857 2.23858 0 5 0H262C264.761 0 267 2.23858 267 5V235C267 237.761 264.761 240 262 240H5C2.23857 240 0 237.761 0 235V5Z"
            className="transition"
            fill={theme.backgroundPrimary}
          />
          <path
            id="banner"
            d="M25 20.315H242.49V78.65C242.49 81.4114 240.251 83.65 237.49 83.65H30C27.2386 83.65 25 81.4114 25 78.65V20.315Z"
            className="transition"
            fill={theme.backgroundSecondary}
          />
          <path
            id="image"
            d="M133.87 105.27C147.335 105.27 158.24 94.3261 158.24 80.8405C158.24 67.3548 147.335 56.4109 133.87 56.4109C120.404 56.4109 109.5 67.3548 109.5 80.8405C109.5 94.3261 120.404 105.27 133.87 105.27Z"
            fill={theme.backgroundSecondary}
            className="transition"
            stroke={theme.profileBorder}
            strokeWidth="5"
          />
          <rect
            id="username"
            x="108"
            y="115.915"
            width="50.19"
            className="transition"
            fill={theme.textPrimary}
            height="5.975"
            rx="2.9875"
          />
          <g id="description">
            <rect
              id="Rectangle 16"
              x="87"
              y="127.865"
              width="93.21"
              height="2.39"
              rx="1.195"
              className="transition"
              fill={theme.textSecondary}
            />
            <rect
              id="Rectangle 17"
              x="100.316"
              y="132.645"
              width="66.5786"
              height="2.39"
              rx="1.195"
              className="transition"
              fill={theme.textSecondary}
            />
          </g>
          <g id="links">
            <rect
              id="discord"
              x="115"
              y="145.79"
              width="8.23223"
              height="8.25473"
              rx="2"
              className="transition"
              fill={theme.icons}
            />
            <rect
              id="twitter"
              x="124.604"
              y="145.79"
              width="8.23223"
              height="8.25473"
              rx="2"
              className="transition"
              fill={theme.icons}
            />
            <rect
              id="instagram"
              x="134.209"
              y="145.79"
              width="8.23223"
              height="8.25473"
              rx="2"
              className="transition"
              fill={theme.icons}
            />
            <rect
              id="website"
              x="143.813"
              y="145.79"
              width="8.23223"
              height="8.25473"
              rx="2"
              className="transition"
              fill={theme.icons}
            />
          </g>
          <g id="divider-bottom">
            <rect x="25" y="171" width="218" height="2" rx="1" fill="#C4C4C4" />
            <rect x="25" y="171" width="218" height="2" rx="1" fill="url(#paint0_linear_0_1)" />
          </g>
          <g id="pieces">
            <rect
              id="Rectangle 62"
              x="25"
              y="178.874"
              width="41.9231"
              height="49.1099"
              rx="5"
              className="transition"
              fill={theme.backgroundSecondary}
            />
            <rect
              id="Rectangle 63"
              x="72.9121"
              y="178.874"
              width="85.044"
              height="23.956"
              rx="5"
              className="transition"
              fill={theme.backgroundSecondary}
            />
            <rect
              id="Rectangle 64"
              x="72.9121"
              y="208.819"
              width="85.044"
              height="23.956"
              rx="5"
              className="transition"
              fill={theme.backgroundSecondary}
            />
            <rect
              id="Rectangle 65"
              x="163.945"
              y="178.874"
              width="79.055"
              height="49.1099"
              rx="5"
              className="transition"
              fill={theme.backgroundSecondary}
            />
          </g>
          <g id="footer">
            <path
              id="background"
              d="M0 235C0 237.761 2.23858 240 5 240H262C264.761 240 267 237.761 267 235V222C267 219.239 264.761 217 262 217H5C2.23857 217 0 219.239 0 222V235Z"
              className="transition"
              fill={theme.footerBackground}
            />
            <rect
              id="description_2"
              x="192"
              y="226"
              width="51"
              height="4"
              rx="2"
              className="transition"
              fill={theme.footerForeground}
            />
            <rect
              id="logo"
              x="25"
              y="226"
              width="26.29"
              height="3.585"
              rx="1.7925"
              className="transition"
              fill={theme.footerForeground}
            />
          </g>
          <g id="divider-top">
            <rect y="18" width="267" height="2" fill="#C4C4C4" />
            <rect y="18" width="267" height="2" fill="url(#paint1_linear_0_1)" />
          </g>
          <g id="appbar">
            <path
              id="appbar-background"
              d="M0 5C0 2.23858 2.23858 0 5 0H262C264.761 0 267 2.23858 267 5V18H0V5Z"
              className="transition"
              fill={theme.headerBackground}
            />
            <rect
              id="logo_2"
              x="25.095"
              y="8.36501"
              width="26.29"
              height="3.585"
              rx="1.7925"
              className="transition"
              fill={theme.headerForeground}
            />
            <g id="menu-items">
              <rect
                id="Rectangle 19"
                x="217.49"
                y="8.36501"
                width="25.095"
                height="3.585"
                rx="1.7925"
                className="transition"
                fill={theme.headerForeground}
              />
              <rect
                id="Rectangle 25"
                x="186.42"
                y="8.36501"
                width="25.095"
                height="3.585"
                rx="1.7925"
                className="transition"
                fill={theme.headerForeground}
              />
              <rect
                id="Rectangle 26"
                x="155.35"
                y="8.36501"
                width="25.095"
                height="3.585"
                rx="1.7925"
                className="transition"
                fill={theme.headerForeground}
              />
            </g>
          </g>
        </g>
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_0_1"
          x1="25"
          y1="172"
          x2="243"
          y2="172"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#27B788" />
          <stop offset="1" stopColor="#A42CBC" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_0_1"
          x1="0"
          y1="19"
          x2="267"
          y2="18.9997"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#27B788" />
          <stop offset="1" stopColor="#A42CBC" />
        </linearGradient>
      </defs>
    </svg>
  );
};
