import { Paper, ActionIcon, CopyButton, Center, Tooltip, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useStorage, type RawKey } from "@plasmohq/storage/hook";
import type { SavedSettings } from "~utils/localstorage_types";

type Props = {
  name: string,
  id: RawKey,
  type: string,
}

export default function Item({ name, id, type }: Props) {
  const [data, setData] = useStorage(id);
  const [saved_settings, setSavedSettings] = useStorage<SavedSettings>("saved_settings", undefined);

  function updateSettings(name: string) {
    if (!saved_settings) return;
    let setting = "";
    switch (type) {
      case "Domain":
        setting = "base_domain";
        break;
      case "Group":
        setting = "group";
        break;
      default:
        return;
    }
    if (saved_settings[setting] == name) {
      const temp_settings = JSON.parse(JSON.stringify(saved_settings));
      temp_settings[setting] = "";
      setSavedSettings(temp_settings);
    }
  }

  function copyHandler(copy: () => void) {
    copy();
    notifications.show({
      message: `${type} was copied to the clipboard.`,
      withBorder: true,
      color: "grape",
      autoClose: 1000,
    });
  }

  function deleteHandler(name: string) {
    if (data) {
      setData(data.filter((v: string) => v != name));
      updateSettings(name);
    }
    notifications.show({
      message: `${type} was deleted.`,
      withBorder: true,
      color: "grape",
      autoClose: 1000,
    });
  }

  return (
    <Paper withBorder className="">
      <Center className="flex gap-2 justify-between p-2">
        <Text truncate="end">{name}</Text>
        <section className="flex gap-2">
          <CopyButton value={name}>
            {({ copy }) => (
              <Tooltip label="Copy">
                <ActionIcon onClick={() => copyHandler(copy)} aria-label="Copy" className="purple-custom svg-bg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" /><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" /></svg>
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
          <Tooltip label="Delete">
            <ActionIcon onClick={() => deleteHandler(name)} aria-label="Delete" className="purple-custom svg-bg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 12l6 0" /></svg>
            </ActionIcon>
          </Tooltip>
        </section>
      </Center>
    </Paper>
  );
}
