import { useEffect, useRef, useState } from "react";
import { DownloadIcon, XIcon } from "@heroicons/react/outline";
import { ProfileLink } from "./ProfileLink";
import { toast } from "react-toastify";
import { Notification } from "../../Notification";

import "./styles.css";

interface ProfileImagesUploaderProps {
  profileBanner: string;
  profileImage: string;
  setProfileBanner: (image: string) => void;
  setProfileImage: (image: string) => void;
  setHasProfileBannerChanged: (value: boolean) => void;
  setHasProfileImageChanged: (value: boolean) => void;
  username: string;
  description: string;
  discord?: string;
  twitter?: string;
  instagram?: string;
  website?: string;
}

export const ProfileImagesUploader: React.FC<ProfileImagesUploaderProps> = ({
  profileBanner,
  profileImage,
  setProfileBanner,
  setProfileImage,
  setHasProfileBannerChanged,
  setHasProfileImageChanged,
  username,
  description,
  discord,
  twitter,
  instagram,
  website,
}) => {
  const [isDraggingOverBanner, setIsDraggingOverBanner] = useState<boolean>(false);
  const [isDraggingOverProfile, setIsDraggingOverProfile] = useState<boolean>(false);
  const [displayedImage, setDisplayedImage] = useState<string>("");
  const [displayedBanner, setDisplayedBanner] = useState<string>("");
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  function isValidType(fileType: string, fileSize: number): boolean {
    const acceptedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

    const isAcceptedType = acceptedTypes.includes(fileType);
    const isAcceptedSize = fileSize <= 10485760;

    if (!isAcceptedType) {
      toast.error(
        <Notification
          title="Error uploading file"
          description={`Only JPEG, PNG or GIF file types are accepted`}
        />
      );
    }

    if (!isAcceptedSize) {
      console.log(fileSize);
      toast.error(
        <Notification title="Error uploading file" description={`Maximum file size is 10MB`} />
      );
    }

    return isAcceptedSize && isAcceptedType;
  }

  function onBannerLoad(event: any) {
    const file = event?.target?.files[0] || event.target.file;

    if (file) {
      const isValid = isValidType(file.type, file.size);

      if (!isValid) return;
    }

    setHasProfileBannerChanged(true);
    setProfileBanner(file);
  }

  function onPfpLoad(event: any) {
    const file = event?.target?.files[0] || event.target.file;

    if (file) {
      const isValid = isValidType(file.type, file.size);

      if (!isValid) return;
    }

    setHasProfileImageChanged(true);
    setProfileImage(file);
  }

  const removeBanner = () => {
    setHasProfileBannerChanged(true);
    setProfileBanner("");
  };

  const removeImage = () => {
    setHasProfileImageChanged(true);
    setProfileImage("");
  };

  useEffect(() => {
    const isBannerUrl = typeof profileBanner === "string";
    const isImageUrl = typeof profileImage === "string";

    if (profileBanner && !isBannerUrl) {
      const reader = new FileReader();
      reader.onload = () => {
        setDisplayedBanner(reader.result as string);
      };
      reader.readAsDataURL(profileBanner as unknown as File);
    }

    if (profileBanner && isImageUrl) {
      setDisplayedBanner(profileBanner);
    }

    if (profileImage && !isImageUrl) {
      const reader = new FileReader();
      reader.onload = () => {
        setDisplayedImage(reader.result as string);
      };
      reader.readAsDataURL(profileImage as unknown as File);
    }

    if (profileImage && isImageUrl) {
      setDisplayedImage(profileImage);
    }

    if (!profileImage) {
      setDisplayedImage("");
    }

    if (!profileBanner) {
      setDisplayedBanner("");
    }
  }, [profileBanner, profileImage]);

  return (
    <section className="w-full my-10 bg-gray-700 bg-opacity-5 rounded-md stepper-profile-container">
      <div
        className={`group relative w-full flex items-center justify-center pt-12 pb-36 rounded-md object-cover object-center
        ${!displayedBanner && " outlined-container stepper-draggable-container"}
        ${isDraggingOverBanner && " outlined-container_hover"}`}
        onMouseEnter={() => setIsDraggingOverBanner(true)}
        onMouseLeave={() => setIsDraggingOverBanner(false)}
      >
        <input
          type="file"
          className={"stepper-draggable-input"}
          name="stepper-banner-input"
          ref={bannerInputRef}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();

            setIsDraggingOverBanner(true);
          }}
          onDragLeave={() => setIsDraggingOverBanner(false)}
          onDrop={onBannerLoad}
          onChange={onBannerLoad}
        />
        {displayedBanner ? (
          <img
            src={displayedBanner}
            className="stepper-banner-image rounded-md"
            alt="Profile banner"
          />
        ) : (
          <div className="flex flex-col gap-2 items-center">
            <DownloadIcon className="w-8 h-8 text-gray-600" />
            <span className="font-normal text-xs">
              <button
                onClick={() => bannerInputRef.current?.click()}
                className="font-semibold group-hover:underline"
              >
                choose a banner
              </button>{" "}
              or drag it here
            </span>
          </div>
        )}
      </div>
      <div
        className={`z-50 transform -translate-y-1/2 mx-auto group relative w-48 h-48 flex items-center justify-center p-12 rounded-full object-cover object-center
        ${!displayedImage && " outlined-container stepper-draggable-container"} 
        ${isDraggingOverProfile && " outlined-container_hover"}`}
        onMouseEnter={() => setIsDraggingOverProfile(true)}
        onMouseLeave={() => setIsDraggingOverProfile(false)}
      >
        <input
          type="file"
          className={"stepper-draggable-input"}
          name="stepper-profile-input"
          ref={profileInputRef}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();

            setIsDraggingOverProfile(true);
          }}
          onDragLeave={(e) => {
            setIsDraggingOverProfile(false);
          }}
          onDrop={onPfpLoad}
          onChange={onPfpLoad}
        />
        {displayedImage ? (
          <img
            src={displayedImage}
            className="stepper-banner-image rounded-full"
            alt="Profile image"
          />
        ) : (
          <div className="flex flex-col gap-2 items-center">
            <DownloadIcon className="w-8 h-8 text-gray-600" />
            <span className="font-light text-xs text-center">
              <button
                onClick={() => profileInputRef.current?.click()}
                className="font-semibold group-hover:underline"
              >
                choose a pfp
              </button>{" "}
              or drag it here
            </span>
          </div>
        )}
      </div>
      <div className="transform -translate-y-24 -mb-12">
        <div className="flex items-center justify-center gap-5 mt-4 mb-16">
          {displayedImage && (
            <button
              className="py-2 px-4 bg-red-800 bg-opacity-0 border border-gray-800 flex items-center justify-center rounded-md transition hover:border-red-500 hover:bg-opacity-80"
              onClick={removeImage}
            >
              <span className="text-white text-xs flex gap-2 items-center">
                <div className="relative object-center object-fill mr-2">
                  <img
                    src={displayedImage}
                    className="rounded-sm h-6 w-auto max-w-xs"
                    alt="Profile image"
                  />
                </div>
                <XIcon className="w-4 h-4 text-white" />
                remove
              </span>
            </button>
          )}
          {displayedBanner && (
            <button
              className="py-2 px-4 bg-red-800 bg-opacity-0 border border-gray-800 flex items-center justify-center rounded-md transition hover:border-red-500 hover:bg-opacity-80"
              onClick={removeBanner}
            >
              <span className="text-white text-xs flex gap-2 items-center">
                <div className="relative object-center object-fill mr-2">
                  <img
                    src={displayedBanner}
                    className="rounded-sm h-6 w-auto"
                    alt="Profile image"
                  />
                </div>
                <XIcon className="w-4 h-4 text-white" />
                remove
              </span>
            </button>
          )}
        </div>
        <h1 className="text-4xl text-white text-center font-semibold">{username}</h1>
        <p className="text-sm text-gray-500 text-center font-base max-w-prose mx-auto mb-10 mt-5 break-words">
          {description}
        </p>
        <div className="flex items-center justify-center gap-8 w-full my-10">
          {discord && <ProfileLink isClipboard username={discord} social={"discord"} />}
          {twitter && (
            <ProfileLink
              link={`https://twitter.com/${twitter}`}
              username={twitter}
              social={"twitter"}
            />
          )}
          {instagram && (
            <ProfileLink
              link={`https://www.instagram.com/${instagram.replace("@", "")}/`}
              username={instagram}
              social={"instagram"}
            />
          )}
          {website && <ProfileLink link={website} username={website} social={"website"} />}
        </div>
      </div>
    </section>
  );
};
