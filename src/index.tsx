import {
  ButtonItem,
  definePlugin,
  DialogBody,
  DialogBodyText,
  DialogButtonPrimary,
  DialogButtonSecondary,
  DialogFooter,
  DialogHeader,
  findModule,
  Focusable,
  ModalRoot,
  ModalRootProps,
  PanelSection,
  PanelSectionRow,
  ServerAPI,
  showModal,
  staticClasses,
  TextField,
} from "decky-frontend-lib";
import { createRef, useEffect, useMemo, useState, VFC } from "react";
import { FaTwitter, FaCheckCircle } from "react-icons/fa";

const thumbnailForScreenshot = (url: string) => {
  const i = url.lastIndexOf("/");
  return (
    "https://steamloopback.host/" +
    `${url.substring(0, i)}/thumbnails/${url.substring(i + 1)}`
  );
};

interface SelectScreenshotsModalProps {
  screenshots: Screenshot[];
  selectedScreenshotUrls: string[];
  toggleScreenshotUrl: (url: string) => void;
}

function SelectScreenshotsModal({
  screenshots,
  selectedScreenshotUrls: initialSelectedScreenshotUrls,
  toggleScreenshotUrl: realToggleScreenshotUrl,
  closeModal,
}: ModalRootProps & SelectScreenshotsModalProps) {
  // The state and logic has to be duplicated here because showModal works in a weird way.
  const [selectedScreenshotUrls, setSelectedScreenshotUrls] = useState(
    initialSelectedScreenshotUrls
  );

  const toggleScreenshotUrl = (url: string) => {
    realToggleScreenshotUrl(url);
    setSelectedScreenshotUrls((urls) =>
      urls.includes(url) ? urls.filter((u) => u !== url) : urls.concat([url])
    );
  };

  return (
    <ModalRoot onCancel={closeModal} bAllowFullSize>
      <Focusable
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "12px",
        }}
      >
        {screenshots
          .slice()
          .sort((a, b) => b.nCreated - a.nCreated)
          .map((s) => (
            <Focusable
              key={s.strUrl}
              onActivate={() => toggleScreenshotUrl(s.strUrl)}
              onOKActionDescription={
                selectedScreenshotUrls.includes(s.strUrl) ? "Remove" : "Select"
              }
              style={{ position: "relative" }}
            >
              <img
                src={"https://steamloopback.host/" + s.strUrl}
                style={{
                  display: "block",
                  maxWidth: "100%",
                }}
              />
              {selectedScreenshotUrls.includes(s.strUrl) && (
                <div
                  style={{ position: "absolute", top: "10px", right: "10px" }}
                >
                  <FaCheckCircle size={24} />
                </div>
              )}
            </Focusable>
          ))}
      </Focusable>
    </ModalRoot>
  );
}

const shareDialogClasses: Record<
  | "ShareScreenshotDialog"
  | "CaptionTextArea"
  | "RadioButtonGroup"
  | "CloudStorageMessage"
  | "VisibilityHeader"
  | "Spoiler"
  | "UploadingText"
  | "CaptionHeader",
  string
> = findModule(
  (mod) =>
    typeof mod === "object" &&
    mod?.ShareScreenshotDialog?.includes("sharescreenshotupload")
);

function UploadScreenshotDialog({ closeModal }: ModalRootProps) {
  const [tweetBody, setTweetBody] = useState("");
  const [screenshots, setScreenshots] = useState<Screenshot[] | null>(null);

  const [selectedScreenshotUrls, setSelectedScreenshotUrls] = useState<
    string[]
  >([]);

  // const textAreaRef = createRef<HTMLTextAreaElement>();

  useEffect(() => {
    let isCancelled = false;

    SteamClient.Screenshots.GetAllAppsLocalScreenshots().then((s) => {
      if (!isCancelled) setScreenshots(s);
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  const selectedScreenshots = useMemo(() => {
    if (!screenshots) return [];

    return selectedScreenshotUrls.map(
      (url) => screenshots.find((s) => s.strUrl === url)!
    );
  }, [selectedScreenshotUrls, screenshots]);

  const toggleScreenshotUrl = (url: string) =>
    setSelectedScreenshotUrls((urls) =>
      urls.includes(url) ? urls.filter((u) => u !== url) : urls.concat([url])
    );

  const submitEnabled =
    (selectedScreenshotUrls.length > 0 && selectedScreenshotUrls.length <= 4) ||
    tweetBody.length > 0;

  return (
    <ModalRoot onCancel={closeModal}>
      <DialogHeader>Share to Twitter</DialogHeader>
      <DialogBody>
        <DialogBodyText>
          <div
            className={shareDialogClasses.CaptionHeader}
            style={{ marginTop: 0, marginBottom: "8px" }}
          >
            Upload screenshots to Twitter from user @raxmur:
          </div>
          {/* <Focusable
            onActivate={() => textAreaRef.current?.focus()}
            style={{ marginBottom: "8px", marginTop: "8px" }}
          >
            <textarea
              ref={textAreaRef}
              placeholder="tweet text..."
              value={tweetBody}
              onChange={(ev) => setTweetBody(ev.target.value)}
              className={shareDialogClasses.CaptionTextArea}
              style={{ marginTop: 0 }}
            />
          </Focusable> */}
          <TextField
            placeholder="tweet text..."
            value={tweetBody}
            onChange={(ev) => setTweetBody(ev.target.value)}
            style={{ marginBottom: "8px" }}
          />
          <Focusable
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "10px",
            }}
          >
            {selectedScreenshots.map((s) => (
              <Focusable
                key={s.strUrl}
                onActivate={() =>
                  setSelectedScreenshotUrls((shots) =>
                    shots.filter((url) => s.strUrl !== url)
                  )
                }
                onOKActionDescription="Remove"
              >
                <img
                  src={thumbnailForScreenshot(s.strUrl)}
                  style={{
                    display: "block",
                    maxWidth: "100%",
                  }}
                />
              </Focusable>
            ))}
          </Focusable>
          <ButtonItem
            layout="inline"
            label={`${selectedScreenshotUrls.length} screenshots selected`}
            disabled={!screenshots}
            onClick={() =>
              showModal(
                <SelectScreenshotsModal
                  screenshots={screenshots || []}
                  selectedScreenshotUrls={selectedScreenshotUrls}
                  toggleScreenshotUrl={toggleScreenshotUrl}
                />
              )
            }
          >
            Select screenshots
          </ButtonItem>
        </DialogBodyText>
        <DialogFooter>
          <Focusable className="DialogTwoColLayout _DialogColLayout">
            <DialogButtonPrimary disabled={!submitEnabled}>
              Upload
            </DialogButtonPrimary>
            <DialogButtonSecondary onClick={closeModal}>
              Cancel
            </DialogButtonSecondary>
          </Focusable>
        </DialogFooter>
      </DialogBody>
    </ModalRoot>
  );
}

const Content: VFC<{ serverAPI: ServerAPI }> = () => {
  return (
    <div>
      <PanelSection title="Send tweet">
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            onClick={() => {
              showModal(<UploadScreenshotDialog />);
            }}
          >
            Tweet
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
      <PanelSection title="Account settings">
        <PanelSectionRow>
          <ButtonItem layout="below">Log in/out</ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout="below">API keys</ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    </div>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  return {
    title: <div className={staticClasses.Title}>Decky Twitter</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <FaTwitter />,
  };
});
