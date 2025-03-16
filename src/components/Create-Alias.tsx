import { Box, Flex, TextInput, Button, Select, Autocomplete, ActionIcon, Tooltip } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useStorage } from "@plasmohq/storage/hook";
import { useEffect, useState } from "react";
import { generateAlias } from "~utils/generatedAlias";

type Props = {
  setActiveTab(tab: string): void,
  active_tab: string
}

export default function CreateAlias({ setActiveTab, active_tab }: Props) {
  const [domains] = useStorage("domains");
  const [groups] = useStorage("groups");
  const [url] = useStorage("url");
  const [aliases, setAliases] = useStorage("aliases", []);
  const [reverse_alias_order] = useStorage("reverse_alias_order", false);
  const [saved_settings, setSavedSettings] = useStorage("saved_settings", {
    base_domain: "",
    random: "Random Characters",
    current_domain: "Base Domain",
    prefix: "",
    suffix: "",
    group: "",
  });

  const [separators] = useStorage("separators", {
    "Group Separator": ".",
    "Domain Separator": "_",
    "Domain Inner Separator": ".",
    "Prefix Separator": "_",
    "Suffix Separator": "_",
    "Word Inner Separator": "_"
  });
  const [counts] = useStorage("counts", {
    "Character Count": 6,
    "Word Count": 3
  });

  const [disable_storing_aliases] = useStorage("disable_storing_aliases", false);
  const [generated_alias, setAlias] = useState("");
  const [form_data, setFormData] = useState({});

  const form = useForm({
    mode: "uncontrolled",
    initialValues: { ...saved_settings },
  });

  function handleSubmit() {
    if (!disable_storing_aliases) {
      if (!aliases.includes(generated_alias)) {
        if (reverse_alias_order) {
          setAliases([...aliases, generated_alias]);
        } else {
          setAliases([generated_alias, ...aliases]);
        }
        setActiveTab("aliases");
      } else {
        notifications.show({
          message: `Alias already exists!`,
          withBorder: true,
          color: "yellow",
          autoClose: 1000,
        });
        return;
      }
    }
    navigator.clipboard.writeText(generated_alias);
    notifications.show({
      message: `Alias was copied to the clipboard.`,
      withBorder: true,
      color: "grape",
      autoClose: 1000,
    });
  }

  function aliasPreview(refresh: boolean) {
    const current_form = form.getValues();
    if (form_data !== current_form || refresh) {
      setFormData(current_form);
      const _alias = generateAlias({ ...current_form, separators: separators, counts: counts, url: url });
      setAlias(_alias);
    }
  }

  function loadSettings() {
    form.setValues(saved_settings);
    aliasPreview(false);
  }

  function saveSettings() {
    setSavedSettings(form.getValues());
    notifications.show({
      message: `Create settings are now saved.`,
      withBorder: true,
      color: "grape",
      autoClose: 1000,
    });
  }

  useEffect(() => {
    aliasPreview(true);
  }, [url]);

  useEffect(() => {
    if (active_tab == "" || active_tab == "create") {
      loadSettings();
    }
  }, [saved_settings, active_tab]);

  return (
    <Box>
      <form className="m-4" onSubmit={form.onSubmit(handleSubmit)} onChange={() => aliasPreview(false)} onClick={() => aliasPreview(false)}>
        <div className="mb-4">
          <Select
            size="sm"
            label="Base Domain"
            maxDropdownHeight={134}
            key={form.key("base_domain")}
            data={domains || []}
            searchable={domains && domains.length > 1}
            comboboxProps={{ position: "bottom", middlewares: { flip: false, shift: false } }}
            {...form.getInputProps("base_domain")}
          />
        </div>
        <div className="mb-4">
          <Select
            size="sm"
            label="Random"
            allowDeselect={false}
            key={form.key("random")}
            data={["Random Characters", "Random Words", "None"]}
            comboboxProps={{ position: "bottom", middlewares: { flip: false, shift: false } }}
            {...form.getInputProps("random")}
          />
        </div>
        <div className="mb-4">
          <Select
            size="sm"
            label="Current Domain"
            allowDeselect={false}
            key={form.key("current_domain")}
            data={["Base Domain", "Domain", "Full Domain", "None"]}
            comboboxProps={{ position: "bottom", middlewares: { flip: false, shift: false } }}
            {...form.getInputProps("current_domain")}
          />
        </div>
        <Box className="mb-4 flex justify-center gap-3">
          <TextInput
            className="w-1/2"
            size="sm"
            label="Prefix"
            key={form.key("prefix")}
            {...form.getInputProps("prefix")}
          />
          <TextInput
            className="w-1/2"
            size="sm"
            label="Suffix"
            key={form.key("suffix")}
            {...form.getInputProps("suffix")}
          />
        </Box>
        <Autocomplete
          className="mb-4"
          size="sm"
          label="Group"
          maxDropdownHeight={134}
          key={form.key("group")}
          data={groups || []}
          comboboxProps={{ position: "bottom", middlewares: { flip: false, shift: false } }}
          {...form.getInputProps("group")}
        />
        <section className="relative">
          <TextInput
            className="mb-8"
            size="sm"
            label="Generated Alias"
            value={generated_alias || ""}
            disabled
          />
          <Tooltip label="Refresh">
            <ActionIcon onClick={() => aliasPreview(true)} className="purple-custom svg-bg absolute right-1 top-7 z-10">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" /><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" /></svg>
            </ActionIcon>
          </Tooltip>
        </section>
        <Flex className="justify-evenly gap-2">
          <Button onClick={saveSettings} className="gray-button w-7/12" color="gray" type="button">Save Settings</Button>
          <Button disabled={generated_alias ? false : true} fullWidth className={generated_alias ? "purple-custom-bg" : "purple-custom-no-hover"} color="grape" type="submit">
            {disable_storing_aliases ? "Copy" : "Create"}
          </Button>
        </Flex>
      </form>
    </Box>
  );
} 
