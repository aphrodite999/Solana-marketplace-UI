import { SpeakerphoneIcon, XIcon } from "@heroicons/react/outline";

export default function Disclaimer({ closeDisclaimer }: any) {

  return (
    <div className="fixed bottom-8 inset-x-0 pb-2 sm:pb-5 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="p-2 bg-indigo-600 rounded-md shadow-lg sm:p-3">
          <div className="flex items-center justify-between flex-wrap">
            <div className="w-0 flex-1 flex items-center">
              <span className="flex p-3">
                <SpeakerphoneIcon
                  className="h-6 w-6 text-white"
                  aria-hidden="true"
                />
              </span>
              <p className="ml-3 font-base text-white">
                <span>
                Please note that this is our Beta launch - kindly use at your own discretion.
                NFTs with the "Verifeyed" label are authenticated against a mint hash list submitted by collections via our creator portal, while NFTs labelled as "Unverifeyed" belong to collections that are either pending verification or has not met our verification requirements.
                As an open marketplace, DigitalEyes welcomes almost all collections and does not endorse or curate any projects, including projects that are listed, verified, marketed, advertised, or launched on our Launchpad.
                Unfortunately, while almost everyone is welcome, there will always be scammers too. Buyers are advised to conduct their due diligence at all times - if it seems too good to be true, it probably is.
                </span>
              </p>
            </div>

            <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-2">
              <button
                type="button"
                onClick={() => {
                  closeDisclaimer();
                }}
                className="-mr-1 flex p-2 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <span className="sr-only">Dismiss</span>
                <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
