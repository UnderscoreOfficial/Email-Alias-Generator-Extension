import {
  Box,
  Divider,
  Switch,
  Center,
  Select,
  TextInput,
  NumberInput,
  Collapse,
  ActionIcon,
  Flex,
  Tooltip,
  useMantineColorScheme,
} from "@mantine/core";

import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { useStorage } from "@plasmohq/storage/hook";
import Item from "./Item";
import { useState } from "react";

export default function Settings() {
  const [domain_collapse, setDomainCollapse] = useDisclosure(false);
  const [domains, setDomains] = useStorage("domains", []);
  const [domain_input, setDomainInput] = useState("");

  const [group_collapse, setGroupCollapse] = useDisclosure(false);
  const [groups, setGroups] = useStorage("groups");
  const [group_input, setGroupInput] = useState("");

  const { setColorScheme } = useMantineColorScheme();
  const [theme, setTheme] = useStorage("theme", false);

  const [default_tab, setDefaultTab] = useStorage("default_tab", "aliases");

  const [disable_storing_aliases, setDisableStoringAliases] = useStorage("disable_storing_aliases", false);

  const [separator, setSeparator] = useState("Group Separator");
  const [separators, setSeparators] = useStorage("separators", {
    "Group Separator": ".",
    "Domain Separator": "_",
    "Domain Inner Separator": ".",
    "Prefix Separator": "_",
    "Suffix Separator": "_",
    "Word Inner Separator": "_"
  });

  const [count, setCount] = useState("Character Count");
  const [counts, setCounts] = useStorage("counts", {
    "Character Count": 6,
    "Word Count": 3
  });

  function domainHandler() {
    const domain = domain_input.trim();
    if (domain.length) {
      if (domains) {
        if (domains.includes(domain)) {
          notifications.show({
            message: `Domain already exists!`,
            withBorder: true,
            color: "yellow",
            autoClose: 1000,
          });
          return;
        }
        setDomains([...domains, domain]);
      } else {
        setDomains([domain]);
      }
      setDomainInput("");
    }
    if (!domain_collapse || !domain.length) {
      setDomainCollapse.toggle();
    }
  }
  function groupHandler() {
    const group = group_input.trim();
    if (group.length) {
      if (groups) {
        if (groups.includes(group)) {
          notifications.show({
            message: `Group already exists!`,
            withBorder: true,
            color: "yellow",
            autoClose: 1000,
          });
          return;
        }
        setGroups([...groups, group]);
      } else {
        setGroups([group]);
      }
      setGroupInput("");
    }
    if (!group_collapse && !group.length) {
      setGroupCollapse.toggle();
    }
  }

  function changeTheme() {
    if (!theme) setTheme(false);
    setTheme(!theme);
    if (theme) {
      setColorScheme("dark");
    } else {
      setColorScheme("light");
    }
  }

  function changeDefaultTab() {
    if (!default_tab.length) setDefaultTab("aliases");
    if (default_tab == "create") {
      setDefaultTab("aliases");
    } else {
      setDefaultTab("create");
    }
  }

  function changeDisablingAliases() {
    if (!disable_storing_aliases) setDisableStoringAliases(false);
    setDisableStoringAliases(!disable_storing_aliases);
    setDefaultTab("create");
  }

  function setSeparatorSelect(value: string) {
    setSeparator(value);
  }

  function changeSeparator(value: React.ChangeEvent<HTMLInputElement>) {
    const temp_separators = { ...separators };
    temp_separators[separator] = value.target.value;
    setSeparators(temp_separators);
  }

  function setCountSelect(value: string) {
    setCount(value);
  }

  function changeCount(value: string | number) {
    const temp_counts = { ...counts };
    temp_counts[count] = Number(value);
    setCounts(temp_counts);
  }
  return (
    <Box>
      <section className="m-4 mb-3 mt-3 flex justify-between">
        <Center>Theme</Center>
        <Switch checked={theme} onChange={changeTheme} className="inline-block" size="xl" onLabel="Light" offLabel="Dark"></Switch>
      </section>
      <Divider className="ml-4 mr-4"></Divider>
      <section className="m-4 mb-3 mt-3 flex justify-between">
        <Center>Default Tab</Center>
        <Switch checked={default_tab == "create" || disable_storing_aliases ? true : false} disabled={disable_storing_aliases} onChange={changeDefaultTab} className="inline-block" size="xl" onLabel="Create" offLabel="Aliases"></Switch>
      </section>
      <Divider className="ml-4 mr-4"></Divider>
      <section className="m-4 mb-3 mt-3 flex justify-between">
        <Center>Disable Alias Storing</Center>
        <Switch checked={disable_storing_aliases} onChange={changeDisablingAliases} className="inline-block" size="xl" onLabel="Disabled" offLabel="Enabled"></Switch>
      </section>
      <Divider className="ml-4 mr-4"></Divider>
      <section className="m-4 flex justify-between">
        <Center>Separators</Center>
        <section className="w-7/12">
          <Select
            allowDeselect={false}
            className="mb-2"
            size="sm"
            value={separator}
            onChange={setSeparatorSelect}
            comboboxProps={{ position: "bottom", middlewares: { flip: false, shift: false } }}
            data={["Group Separator", "Domain Separator", "Domain Inner Separator", "Prefix Separator", "Suffix Separator", "Word Inner Separator"]}
          />
          <TextInput
            size="sm"
            value={separators[separator]}
            onChange={changeSeparator}
          />
        </section>
      </section>
      <Divider className="ml-4 mr-4"></Divider>
      <section className="m-4 flex justify-between">
        <Center>Counts</Center>
        <section className="w-7/12">
          <Select
            allowDeselect={false}
            className="mb-2"
            size="sm"
            value={count}
            onChange={setCountSelect}
            comboboxProps={{ position: "bottom", middlewares: { flip: false, shift: false } }}
            data={["Character Count", "Word Count"]}
          />
          <NumberInput
            size="sm"
            min={1}
            value={counts[count]}
            onChange={changeCount}
          />
        </section>
      </section>
      <Divider className="ml-4 mr-4"></Divider>
      <section className="m-4 flex justify-between">
        <Center>Domains</Center>
        <Center className="relative">
          <TextInput
            placeholder="Add new domain"
            size="sm"
            value={domain_input}
            onChange={(e) => setDomainInput(e.target.value)}
            onKeyDown={(e) => e.key == "Enter" ? domainHandler() : ""}
          />
          <Tooltip label="Add / Expand">
            <ActionIcon className="absolute right-1 purple-custom svg-bg" onClick={domainHandler}>
              <svg className="rounded" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M19 10h-14" /><path d="M5 6h14" /><path d="M14 14h-9" /><path d="M5 18h6" /><path d="M18 15v6" /><path d="M15 18h6" /></svg>
            </ActionIcon>
          </Tooltip>
        </Center>
      </section>
      <Collapse in={domain_collapse}>
        <Flex className="m-4" direction="column" gap="xs">
          {domains?.map((name: string) => <Item name={name} id={"domains"} type={"Domain"} key={name}></Item>)}
        </Flex>
      </Collapse>
      <Divider className="ml-4 mr-4"></Divider>
      <section className="m-4 flex justify-between">
        <Center>Groups</Center>
        <Center className="relative">
          <TextInput
            placeholder="Add new group"
            size="sm"
            value={group_input}
            onChange={(e) => setGroupInput(e.target.value)}
            onKeyDown={(e) => e.key == "Enter" ? groupHandler() : ""}
          />
          <Tooltip label="Add / Expand">
            <ActionIcon className="absolute right-1 purple-custom svg-bg" onClick={groupHandler}>
              <svg className="rounded" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M19 10h-14" /><path d="M5 6h14" /><path d="M14 14h-9" /><path d="M5 18h6" /><path d="M18 15v6" /><path d="M15 18h6" /></svg>
            </ActionIcon>
          </Tooltip>
        </Center>
      </section>
      <Collapse in={group_collapse}>
        <Flex className="m-4" direction="column" gap="xs">
          {groups?.map((name: string) => <Item name={name} id={"groups"} type={"Group"} key={name}></Item>)}
        </Flex>
      </Collapse>
      <Divider className="ml-4 mr-4"></Divider>
      <section className="m-4 mb-3 mt-3 flex justify-between">
        <Center>Version (0.1.2)</Center>
        <Center className="text-lg mr-2">
          Github
          <a href="https://github.com/UnderscoreOfficial/Email-Alias-Generator-Extension">
            <ActionIcon className="inline-block svg-bg purple-custom" size="xl" >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M15 9l-6 6" /><path d="M15 15v-6h-6" /></svg>
            </ActionIcon>
          </a>
        </Center>
      </section>
      <Divider className="ml-4 mr-4"></Divider>
    </Box>
  );
}
