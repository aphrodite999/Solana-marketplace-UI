import React, { createContext, useState } from "react";
import { FullscreenModal } from "../components/FullscreenModal";

interface IFullscreenModalContextProvider {
  children: React.ReactNode;
}

interface IFullscreenModalContext {
  isModalOpen: boolean;
  openFullscreenModal: (props: OpenFullscreenModalProps) => void;
  closeFullscreenModal: () => void;
}

export interface OpenFullscreenModalProps {
  label?: string;
  title: string;
  modalContent: React.ReactNode;
  onExitCallback?: () => void;
  buttonCallback?: () => void;
  buttonText?: string;
}

const FullscreenModalContext = createContext({} as IFullscreenModalContext);

export function FullscreenModalContextProvider({ children }: IFullscreenModalContextProvider) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [label, setLabel] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [modalContent, setModalContent] = useState<React.ReactNode>("");
  const [onExitCallback, setOnExitCallback] = useState<(() => void) | undefined>(undefined);
  const [buttonCallback, setButtonCallback] = useState<(() => void) | undefined>(undefined);
  const [buttonText, setButtonText] = useState<string | undefined>(undefined);

  const openFullscreenModal = ({
    modalContent,
    label,
    title,
    onExitCallback,
    buttonCallback,
    buttonText,
  }: OpenFullscreenModalProps) => {
    console.log(onExitCallback);

    setIsModalOpen(true);
    label && setLabel(label);
    setTitle(title);
    setModalContent(modalContent);
    onExitCallback ? setOnExitCallback(onExitCallback) : setOnExitCallback(undefined);
    buttonCallback ? setButtonCallback(buttonCallback) : setButtonCallback(undefined);
    buttonText && setButtonText(buttonText);
  };

  const closeFullscreenModal = () => {
    console.log(onExitCallback);
    console.log("closeFullscreenModal...");
    onExitCallback && onExitCallback();

    setIsModalOpen(false);
    setLabel("");
    setTitle("");
    setModalContent("");
    setOnExitCallback(() => {});
    setButtonCallback(() => {});
    setButtonText("");
  };

  return (
    <FullscreenModalContext.Provider
      value={{ isModalOpen: isModalOpen, openFullscreenModal, closeFullscreenModal }}
    >
      <>
        {children}
        {isModalOpen && modalContent && (
          <FullscreenModal
            modalContent={modalContent}
            label={label}
            title={title}
            buttonCallback={buttonCallback}
            buttonText={buttonText}
          />
        )}
      </>
    </FullscreenModalContext.Provider>
  );
}

export default FullscreenModalContext;
