import { useContext, useEffect, useRef } from "react";
import { XIcon } from "@heroicons/react/solid";
import FullscreenModalContext from "../../contexts/fullscreen-modal";

import "./styles.css";

export interface FullscreenModalProps {
  label?: string;
  title: string;
  modalContent: React.ReactNode;
  buttonCallback?: () => void;
  buttonText?: string;
}

export const FullscreenModal: React.FC<FullscreenModalProps> = ({
  label,
  title,
  modalContent,
  buttonCallback,
  buttonText,
}) => {
  const { closeFullscreenModal } = useContext(FullscreenModalContext);
  const modalRef = useRef<HTMLDivElement>(null);

  const closeModal = () => {
    const modal = modalRef.current;
    const animationDuration: number = 125;

    // animates the center modal out
    modal?.animate(
      [
        { opacity: 1, scale: 1 },
        { opacity: 0, scale: 0 },
      ],
      {
        duration: animationDuration,
        fill: "forwards",
        easing: "ease-in",
      }
    );

    // animates the modal container out
    modal?.parentElement?.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: animationDuration,
      fill: "forwards",
      easing: "ease-in",
    });

    setTimeout(closeFullscreenModal, animationDuration);
  };

  const shortcutsListener = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      closeModal();
    }
  };

  const ifOutsideModalExitQuickView = (event: MouseEvent) => {
    if (event.target === modalRef?.current?.parentElement) {
      closeModal();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", shortcutsListener);
    window.addEventListener("click", ifOutsideModalExitQuickView);

    return () => {
      window.removeEventListener("keydown", shortcutsListener);
      window.removeEventListener("click", ifOutsideModalExitQuickView);
    };
  }, []);

  return (
    <div className="quickview-modal-container fixed top-0 left-0 w-full h-full bg-modal-black flex items-center justify-center z-50 cursor-default">
      <div
        className="quickview-modal flex flex-col bg-modal-main-bg p-4 rounded-md w-full lg:max-w-3xl h-max max-width-80 max-height-80"
        ref={modalRef}
      >
        <header className="flex items-center justify-between gap-10">
          <div className="flex flex-col items-baseline justify-between">
            {label && <p className="text-gray-500 text-xs">{label}</p>}
            <h1 className="text-white font-bold whitespace-nowrap">{title}</h1>
          </div>
          <button
            onClick={closeModal}
            className="group flex items-center justify-center cursor-pointer pointer-events-auto origin-center"
          >
            <kbd className="text-sm text-white mr-2 hidden md:flex">ESC</kbd>
            <XIcon className="w-7 h-7 transition duration-125 ease-in-out rounded-sm group-hover:bg-gray-600" />
          </button>
        </header>
        {modalContent}
        <footer className="flex flex-wrap">
          <button
            className="flex-grow btn bg-blue-700 hover:bg-blue-800 transition ease-in-out"
            onClick={buttonCallback ? buttonCallback : closeModal}
          >
            {buttonText ? buttonText : "Close"}
          </button>
        </footer>
      </div>
    </div>
  );
};
