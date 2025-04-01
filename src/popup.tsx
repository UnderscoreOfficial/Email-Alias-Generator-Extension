import Home from "~components/Home";
import "@mantine/core/styles.css";
import { MantineProvider, createTheme, RemoveScroll, type MantineThemeOverride, ScrollArea, TextInput } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import '@mantine/notifications/styles.css';
import "~style.css";
import { useEffect, useState } from "react";
import { useStorage } from "@plasmohq/storage/hook";
import { notifications } from "@mantine/notifications";
import type { Aliases, Domains, ReverseAliasOrder, Url } from "~utils/localstorage_types";

const theme: MantineThemeOverride = createTheme({
  primaryColor: "grape",
  autoContrast: true,
  luminanceThreshold: 0.4,
  fontFamily: "Radio Canada Big",
});

export default function IndexPopup() {
  const [, setUrl] = useStorage<Url>("url", undefined);
  const [domains] = useStorage<Domains>("domains", undefined);
  const [previous_domains_length, setPrevousDomainsLength] = useState(0);
  const [mouse_entered, setMouseEntered] = useState(false);
  const [domains_msg_sent, setDomainsMsgSent] = useState(false);
  const [reverse_alias_order, setReverseAliasOrder] = useStorage<ReverseAliasOrder>("reverse_alias_order", undefined);
  const [aliases, setAliases] = useStorage<Aliases>("aliases", undefined);

  const is_mobile = /Mobile/.test(navigator.userAgent);

  // migrate old aliases list to the new default order
  // hopefully no false positives tested it quite a bit.
  useEffect(() => {
    if (reverse_alias_order === undefined && Array.isArray(aliases) && aliases.length > 0) {
      setAliases(aliases.reverse());
      setReverseAliasOrder(false);
    }
  }, [reverse_alias_order, aliases]);

  function missingDomainsMsg() {
    if (domains && domains.length > 0) {
      setPrevousDomainsLength(domains.length);
    }
    if (domains && domains.length < 1 || !domains) {
      if (!domains_msg_sent && previous_domains_length == 0) {
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
  }

  // local storage seems to have a delay so previous attempts to fix popup showing from showing failed
  // this fix should make sure missing-domains warning only shows on opening the extension with no domains
  useEffect(() => {
    if (mouse_entered) {
      missingDomainsMsg();
    }
  }, [mouse_entered, domains]);

  async function currentUrl() {
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      return tab?.url;
    } catch (e) {
      console.error(e);
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      return tab?.url;
    }
  }

  useEffect(() => {
    if (is_mobile) {
      const body = document.querySelector("body");
      body?.classList.remove("desktop");
      body?.classList.add("mobile");
    }

    currentUrl().then((url) => {
      setUrl(url);
    });
  }, []);

  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <div onMouseEnter={() => setMouseEntered(true)} className="">
        {is_mobile ?
          <div className="w-full">
            <Home />
            <Notifications zIndex={10} />
          </div>
          :
          <RemoveScroll className="w-[400px] h-[600px] overflow-hidden">
            <Home />
            <Notifications zIndex={10} />
          </RemoveScroll>
        }
      </div>
    </MantineProvider>
  );
}
