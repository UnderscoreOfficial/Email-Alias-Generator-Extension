import { Box, TextInput, Flex } from "@mantine/core"
import { useStorage } from "@plasmohq/storage/hook";
import Item from "./Item";
import { useState } from "react";

export default function ListAliases() {
  const [aliases] = useStorage("aliases", []);
  const [search, setSearch] = useState("");

  return (
    <Box>
      <TextInput
        className="m-4"
        size="md"
        placeholder="Search aliases"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      > 
      </TextInput>
      <Flex className="m-4 flex-col gap-2">
        {aliases?.filter((i) => i.toLowerCase().includes(search.toLowerCase())).map((name: string) => <Item name={name} id={"aliases"} type={"Alias"} key={name}></Item>)}
      </Flex>
    </Box>
  )
}
