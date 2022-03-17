import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Page } from "../../components/Page";
import { useEffect, useState } from "react";
import { GET_LAUNCH_CALENDER } from "../../constants/urls";
import { LoadingWidget } from "../../components/loadingWidget";
import dayjs from "dayjs";
import { Tooltip } from "@material-ui/core";
import { Modal } from "../../components/Modal";
import { CurrencyDollarIcon, GlobeAltIcon, TicketIcon } from "@heroicons/react/solid";
import { ReactComponent as DiscordLogo } from "../../assets/logo/discord.svg";
import { ReactComponent as TwitterLogo } from "../../assets/logo/twitter.svg";
import { ClockIcon } from "@heroicons/react/solid";

type PreMintItemType = {
  banner_public_url: string;
  collection_id: string;
  description: string;
  discord: string;
  mint_price: number;
  mint_time: number;
  name: string;
  supply: number;
  thumbnail_public_url: string;
  twitter: string;
  website: string;
};
export const MintCalendar = () => {
  const [mintEvents, setMintEvents] = useState<PreMintItemType[]>();
  const [selectedEvent, setSelectedEvent] = useState<PreMintItemType>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const response = await (await fetch(GET_LAUNCH_CALENDER)).json();
      setMintEvents(response?.collection_list);
    })();
  }, []);

  const dates = mintEvents?.map((mint) => {
    return {
      title: mint.name,
      date: dayjs.unix(mint.mint_time).format("YYYY-MM-DDTHH:mm"),
    };
  });

  const toolTipBody = (mint: PreMintItemType) => {
    return (
      <div className="flex flex-col bg-gray-900 rounded-md overflow-hidden">
        <img src={mint.thumbnail_public_url} className="h-72 w-72" />
        <hr className="border-0 m-0 h-1 de-animated-underline" />
        <span className="text-lg mx-2 mt-2">{mint.name}</span>
        <span className="text-md mx-2">
          Minting at {dayjs.unix(mint.mint_time).format("HH:mm")} on{" "}
          {dayjs.unix(mint.mint_time).format("DD-MM-YYYY")}
        </span>
        <span className="text-md m-2">{mint.description}</span>
      </div>
    );
  };

  const openEvent = (mint: PreMintItemType) => {
    setSelectedEvent(mint);
    setIsModalOpen(true);
  };

  const calendarItem = (e: any) => {
    const mint = mintEvents?.find((mint) => mint.name === e?.event.title);
    return mint ? (
      <Tooltip
        onClick={() => openEvent(mint)}
        classes={{ tooltip: "pt-0 bg-transparent" }}
        title={toolTipBody(mint)}
        arrow
      >
        <div className="flex overflow-hidden bg-gray-900 w-full p-2">
          <img
            className="max-h-10 max-w-10 shrink my-auto rounded-md"
            src={mint.thumbnail_public_url}
          />

          <div className="flex flex-col m-auto ml-2 bg-gray-900">
            <p>{mint?.name}</p>
            <div className="flex">
              <ClockIcon width="12" color="white" className="my-auto mr-1" />
              <span className="my-auto text-xs">{dayjs.unix(mint?.mint_time).format("HH:mm")}</span>
            </div>
          </div>
        </div>
      </Tooltip>
    ) : null;
  };

  return (
    <Page className="h-screen-no-nav">
      <>
        {mintEvents ? (
          <FullCalendar
            slotEventOverlap={false}
            eventClassNames={"bg-gray-transparent  border-none cursor-pointer whitespace-normal"}
            headerToolbar={{
              left: "dayGridMonth,timeGridWeek",
              right: "prev,next",
              center: "title",
            }}
            eventContent={(e) => calendarItem(e)}
            events={dates}
            plugins={[dayGridPlugin, timeGridPlugin]}
            initialView="dayGridMonth"
          />
        ) : (
          <LoadingWidget />
        )}
        {selectedEvent && (
          <Modal isOpen={isModalOpen} onCloseClick={() => setIsModalOpen(false)}>
            <div className="flex flex-col bg-gray-900 pt-4 rounded-md overflow-hidden">
              <div className="flex flex-col px-4 mx-auto md:px-10">
                <span className="text-3xl mx-auto my-2 px-5">{selectedEvent.name}</span>

                <div className="rounded-md mx-auto my-4 h-72 w-72 overflow-hidden">
                  <img src={selectedEvent.thumbnail_public_url} className="h-72 w-72" />
                </div>
                <div className="flex mx-auto">
                  {selectedEvent.discord && (
                    <a className="m-3" href={selectedEvent.discord} target="_blank">
                      <DiscordLogo className="h-6 w-6 hover:text-blue-800" />
                    </a>
                  )}
                  {selectedEvent.twitter && (
                    <a className="m-3" href={selectedEvent.twitter} target="_blank">
                      <TwitterLogo className="h-6 w-6 hover:text-blue-800" />
                    </a>
                  )}
                  {selectedEvent.website && (
                    <a className="m-3" href={selectedEvent.website} target="_blank">
                      <GlobeAltIcon className="h-6 w-6 hover:fill-current hover:text-blue-800" />
                    </a>
                  )}
                </div>
              </div>
              <hr className="border-0 m-0 h-1 de-animated-underline" />
              <div className="flex flex-col py-4 pb-10 px-10">
                <div className="flex">
                  <TicketIcon width="20" color="white" className="mr-0 m-1" />
                  <p className="text-base text-white-300 m-1">{selectedEvent?.supply || "-"}</p>
                  <CurrencyDollarIcon width="20" color="white" className="m-1" />
                  <p className="text-base text-white-300 m-1">{selectedEvent?.mint_price || "-"} SOL</p>
                </div>
                <span className="text-xs mx-2">
                  Minting at {dayjs.unix(selectedEvent.mint_time).format("HH:mm")} on{" "}
                  {dayjs.unix(selectedEvent.mint_time).format("DD-MM-YYYY")}
                </span>
                <span className="text-md m-2">{selectedEvent.description}</span>
              </div>
            </div>
          </Modal>
        )}
      </>
    </Page>
  );
};
