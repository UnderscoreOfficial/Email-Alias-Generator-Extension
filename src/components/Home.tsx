import { Tabs, ScrollArea, useMantineColorScheme } from "@mantine/core";
import Settings from "./Settings";
import ListAliases from "./List-Aliases";
import CreateAlias from "./Create-Alias";
import { useStorage } from "@plasmohq/storage/hook";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

export default function Home() {
  const [default_tab] = useStorage("default_tab", "");
  const [active_tab, setActiveTab] = useState(default_tab);
  const { colorScheme } = useMantineColorScheme();
  const [disable_storing_aliases] = useStorage("disable_storing_aliases", false);
  const [domains] = useStorage("domains", []);
  const [domains_msg_sent, setDomainsMsgSent] = useState(false);
  const [domains_msg_disabled, setDomainsMsgDisabled] = useStorage("domain_msg_disabled", false);

  function missingDomainsMsg() {
    console.log(domains_msg_disabled);
    if (!domains_msg_disabled && domains.length > 0) {
      setDomainsMsgDisabled(true);
    }

    if (!domains_msg_disabled && domains.length == 0 && !domains_msg_sent) {
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

  return (
    <Tabs value={active_tab || default_tab || "aliases"} onChange={setActiveTab} onMouseEnter={missingDomainsMsg} className="relative">
      <Tabs.List className={`fixed z-10 top-0 left-0 right-0 ${colorScheme == "light" ? "bg-white" : "bg-gray-primary"}`}>
        <Tabs.Tab className="w-1/3 tab-hover" value="settings" leftSection={
          <svg className="purple-custom" color="purple" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" /><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /></svg>}>
          Settings
        </Tabs.Tab>
        <Tabs.Tab className={`w-1/3 ${disable_storing_aliases ? "" : "tab-hover"}`} value="aliases" disabled={disable_storing_aliases} leftSection={
          <svg className="purple-custom" color="purple" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M9 6l11 0" /><path d="M9 12l11 0" /><path d="M9 18l11 0" /><path d="M5 6l0 .01" /><path d="M5 12l0 .01" /><path d="M5 18l0 .01" /></svg>}>
          Aliases
        </Tabs.Tab>
        <Tabs.Tab className="w-1/3 tab-hover" value="create" leftSection={
          <svg className="purple-custom" color="purple" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M9 12h6" /><path d="M12 9v6" /></svg>}>
          Create
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="settings" className="absolute top-12">
        <ScrollArea h={536} w={400} type="scroll" scrollHideDelay={750}>
          <div className="pb-1">
            <Settings></Settings>
          </div>
        </ScrollArea>
      </Tabs.Panel>
      <Tabs.Panel value="aliases" className="absolute top-12">
        <ScrollArea h={536} w={400} type="scroll" scrollHideDelay={750}>
          <div className="pb-1" style={{ width: 400 }}>
            <ListAliases></ListAliases>
          </div>
        </ScrollArea>
      </Tabs.Panel>
      <Tabs.Panel value="create" className="absolute top-12">
        <ScrollArea h={536} w={400} type="scroll" scrollHideDelay={750}>
          <div>
            <CreateAlias setActiveTab={setActiveTab}></CreateAlias>
          </div>
        </ScrollArea>
      </Tabs.Panel>
    </Tabs>
  );
}
