import { Tabs, ScrollArea, useMantineColorScheme } from "@mantine/core";
import Settings from "./Settings";
import ListAliases from "./List-Aliases";
import CreateAlias from "./Create-Alias";
import { useStorage } from "@plasmohq/storage/hook";
import { useEffect, useRef, useState } from "react";
import type { DefaultTab, DisableStoringAliases } from "~utils/localstorage_types";

export default function Home() {
  const default_tab = useRef(localStorage.getItem("default_tab"));
  const [old_default_tab] = useStorage<DefaultTab>("default_tab", undefined);
  const [active_tab, setActiveTab] = useState<string>("");
  const { colorScheme } = useMantineColorScheme();
  const [disable_storing_aliases] = useStorage<DisableStoringAliases>("disable_storing_aliases", false);
  const is_mobile = /Mobile/.test(navigator.userAgent);

  useEffect(() => {
    if (default_tab.current && active_tab.length < 1) {
      setActiveTab(default_tab.current);
    } else if (default_tab.current === null) {
      // migrate old default_tab
      if (old_default_tab) {
        if (old_default_tab == "create") {
          localStorage.setItem("default_tab", "create");
          setActiveTab("create");
        } else {
          localStorage.setItem("default_tab", "aliases");
          setActiveTab("aliases");
        }
      } else {
        // new install default logic
        localStorage.setItem("default_tab", "aliases");
        setActiveTab("aliases");
      }
    }
  }, [default_tab]);

  return (
    <Tabs value={active_tab || ""} onChange={(value) => {
      setActiveTab(value || "");
      if (is_mobile) {
        window.scrollTo(0, 0);
      }
    }}>
      <Tabs.List className={`fixed top-0 left-0 right-0 z-50 ${colorScheme == "light" ? "bg-white" : "bg-gray-primary"}`}>
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
      <Tabs.Panel value="settings" className="flex justify-center items-center">
        {is_mobile ?
          <div className="w-full mt-12 mb-64">
            <Settings />
          </div> :
          <ScrollArea type="scroll" scrollHideDelay={750} className="h-[536px] w-full top-12 absolute">
            <Settings />
          </ScrollArea>
        }
      </Tabs.Panel>
      <Tabs.Panel value="aliases" className="flex justify-center items-center">
        {is_mobile ?
          <div className="max-w-[400px] w-full mt-16 h-full mb-[1.3rem]">
            <ListAliases />
          </div> :
          <ScrollArea type="scroll" scrollHideDelay={750} className="h-[536px] w-full top-12 absolute">
            <div className="w-[400px] mt-4">
              <ListAliases />
            </div>
          </ScrollArea>
        }
      </Tabs.Panel>
      <Tabs.Panel value="create" className="flex justify-center items-center">
        {is_mobile ?
          <div className="mt-10 mb-96">
            <CreateAlias setActiveTab={setActiveTab} active_tab={active_tab} />
          </div> :
          <ScrollArea type="scroll" scrollHideDelay={750} className="h-[536px] w-full top-12 absolute">
            <CreateAlias setActiveTab={setActiveTab} active_tab={active_tab} />
          </ScrollArea>
        }
      </Tabs.Panel>
    </Tabs >
  );
}
