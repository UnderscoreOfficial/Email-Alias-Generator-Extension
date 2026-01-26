import { Storage } from "@plasmohq/storage"
import { generateAlias } from "~utils/generated_alias"
import { default_counts, default_separators } from "~utils/localstorage_types"
import type { Aliases, Counts, DefaultDomain, DisableStoringAliases, ReverseAliasOrder, SavedSettings, Separators } from "~utils/localstorage_types"

const storage = new Storage()


const generateAndSaveAlias = async (url: string | undefined): Promise<string | null> => {
    try {
        const saved_settings = await storage.get<SavedSettings>("saved_settings")
        const domains = await storage.get<string[]>("domains")
        const default_domain = await storage.get<DefaultDomain>("default_domain")

        const base_domain = saved_settings?.base_domain || default_domain || (domains?.[0] || "")

        // If no base domain is available, we can't generate a valid alias really, 
        // but generateAlias handles empty base_domain by returning empty string.

        const random = saved_settings?.random || ["Characters"]
        const current_domain = saved_settings?.current_domain || ["Domain", "Top Level Domain"]
        const prefix = saved_settings?.prefix || ""
        const suffix = saved_settings?.suffix || ""
        const group = saved_settings?.group || ""

        const separators = await storage.get<Separators>("separators") || default_separators
        const counts = await storage.get<Counts>("counts") || default_counts

        const alias = generateAlias({
            base_domain,
            random,
            current_domain,
            prefix,
            suffix,
            group,
            separators,
            counts,
            url: url
        })

        if (alias) {
            // Save to history if enabled
            const disable_storing_aliases = await storage.get<DisableStoringAliases>("disable_storing_aliases")
            if (!disable_storing_aliases) {
                const aliases = await storage.get<Aliases>("aliases") || []
                // Check if alias already exists to avoid duplicates
                if (!aliases.includes(alias)) {
                    const reverse_alias_order = await storage.get<ReverseAliasOrder>("reverse_alias_order")
                    let new_aliases: string[]
                    if (reverse_alias_order) {
                        new_aliases = [...aliases, alias]
                    } else {
                        new_aliases = [alias, ...aliases]
                    }
                    await storage.set("aliases", new_aliases)
                }
            }
            return alias
        }
    } catch (e) {
        console.error("EAG: Error generating alias", e)
    }
    return null
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "generate_alias") {
        // Generate alias based on sender tab URL
        generateAndSaveAlias(sender.tab?.url).then((alias) => {
            sendResponse({ alias })
        })
        return true // Keep channel open for async response
    }
})

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "fill-alias",
        title: "Enter generated alias",
        contexts: ["editable"]
    })
})

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "fill-alias" && tab?.id) {
        const alias = await generateAndSaveAlias(tab.url)
        if (alias) {
            chrome.tabs.sendMessage(tab.id, {
                action: "insertAlias",
                alias: alias
            }).catch(() => {
                // Ignore error if content script is not ready or tab is not compatible
            })
        }
    }
})
