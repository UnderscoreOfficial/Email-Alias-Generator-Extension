import { Box, TextInput, Flex } from "@mantine/core";
import { useStorage } from "@plasmohq/storage/hook";
import Item from "./Item";
import { useState } from "react";
import type { Aliases } from "~utils/localstorage_types";

export default function ListAliases() {
  const [aliases] = useStorage<Aliases>("aliases", undefined);
  const [search, setSearch] = useState("");

  return (
    <Box className="flex flex-col gap-4 ml-4 mr-4">
      <TextInput
        size="md"
        placeholder="Search aliases"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      >
      </TextInput>
      <Flex className="flex-col gap-2">
        {aliases?.filter((i: string) => i.toLowerCase().includes(search.toLowerCase())).map((name: string) => <Item name={name} id={"aliases"} type={"Alias"} key={name}></Item>)}
      </Flex>
    </Box>
  );
}
