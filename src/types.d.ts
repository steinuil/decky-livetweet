declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

interface Screenshot {
  nAppID: number;
  hHandle: number;
  nWidth: number;
  nHeight: number;
  nCreated: number;
  bSpoilers: boolean;
  bUploaded: boolean;
  ePrivacy: number;
  strCaption: string;
  strUrl: string;
  ucgHandle: string;
}

interface SteamClient {
  Screenshots: {
    GetAllAppsLocalScreenshots: () => Promise<Screenshot[]>;
  };
}

declare const SteamClient: SteamClient;
