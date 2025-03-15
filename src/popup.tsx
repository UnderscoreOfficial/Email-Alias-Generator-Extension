import Home from "~components/Home";
import "@mantine/core/styles.css";
import { MantineProvider, createTheme, RemoveScroll, type MantineThemeOverride } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import '@mantine/notifications/styles.css';
import "~style.css";
import { useEffect, useState } from "react";
import { useStorage } from "@plasmohq/storage/hook";
import { notifications } from "@mantine/notifications";

const theme: MantineThemeOverride = createTheme({
  primaryColor: "grape",
  autoContrast: true,
  luminanceThreshold: 0.4,
  fontFamily: "Radio Canada Big",
});

export default function IndexPopup() {
  const [, setUrl] = useStorage("url", "");
  const [domains] = useStorage("domains", undefined);
  const [previous_domains_length, setPrevousDomainsLength] = useState(0);
  const [mouse_entered, setMouseEntered] = useState(false);
  const [domains_msg_sent, setDomainsMsgSent] = useState(false);


  function missingDomainsMsg() {
    if (domains && domains.length < 1 && !domains_msg_sent && previous_domains_length == 0) {
      notifications.show({
        id: "missing-domains",
        title: "Missing Domains!",
        message: `You have no domains added go to settings to add some.`,
        withBorder: true,
        color: "yellow",
        autoClose: false,
      });
      setDomainsMsgSent(true);
    }
  }

  // local storage seems to have a delay so previous attempts to fix popup showing from showing failed
  // this fix should make sure missing-domains warning only shows on opening the extension with no domains
  useEffect(() => {
    if (mouse_entered) {
      if (domains && domains.length > 0) {
        setPrevousDomainsLength(domains.length);
      }
      missingDomainsMsg();
    }
  }, [mouse_entered, domains]);

  async function currentUrl() {
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      return tab.url;
    } catch (e) {
      console.error(e);
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      return tab.url;
    }
  }

  useEffect(() => {
    currentUrl().then((url) => {
      setUrl(url);
    });
  }, []);

  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications zIndex={1000} />
      <div style={{ height: 600, width: 400 }} className="" onMouseEnter={() => setMouseEntered(true)}>
        <RemoveScroll>
          <Home></Home>
        </RemoveScroll>
      </div>
    </MantineProvider>
  );
}
