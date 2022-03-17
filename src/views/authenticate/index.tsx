import React from "react";
import { Page } from "../../components/Page";
import { SoloWalletSigner } from "../../components/SoloWalletSigner";

export const AuthenticateView = () => {

  return (
    <Page title="Authenticate | DigitalEyes">
      <SoloWalletSigner
      />
    </Page>
  );
};
