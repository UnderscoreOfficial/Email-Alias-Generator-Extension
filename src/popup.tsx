import Home from "~components/Home"
import "@mantine/core/styles.css"
import { MantineProvider, createTheme, ScrollArea, RemoveScroll, type MantineThemeOverride } from "@mantine/core"
import { Notifications } from "@mantine/notifications"
import '@mantine/notifications/styles.css';
import "~style.css"
import { useEffect } from "react"
import { useStorage } from "@plasmohq/storage/hook"

const theme: MantineThemeOverride = createTheme({
  primaryColor: "grape",
  autoContrast: true,
  luminanceThreshold: 0.4,
  fontFamily: "Radio Canada Big",
})


export default function IndexPopup() { 
  const [url, setUrl] = useStorage("url", "");

  async function currentUrl() : Promise<string> {
    try {
      const [tab] = await browser.tabs.query({active: true, currentWindow: true});
      return tab.url;
    } catch(e) {
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      return tab.url;
    }
  }

  useEffect(() => {
    currentUrl().then((url) => {
      setUrl(url); 
    })
  })

  return (
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <Notifications zIndex={1000} />
        <div style={{height: 600, width: 400}} className="">
          <RemoveScroll>
            <Home></Home>
          </RemoveScroll>
        </div>
      </MantineProvider>
  )
}
