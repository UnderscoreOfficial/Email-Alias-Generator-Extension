import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
    matches: ["<all_urls>"]
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "insertAlias" && message.alias) {
        const element = document.activeElement as HTMLElement

        if (!element) return

        if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
            const input = element as HTMLInputElement | HTMLTextAreaElement
            // Ensure we can write to it
            if (input.readOnly || input.disabled) return

            const start = input.selectionStart ?? input.value.length
            const end = input.selectionEnd ?? input.value.length
            const text = input.value

            const before = text.substring(0, start)
            const after = text.substring(end)

            input.value = before + message.alias + after

            // Dispatch input events so frameworks (React, Vue, etc.) detect the change
            input.dispatchEvent(new Event("input", { bubbles: true }))
            input.dispatchEvent(new Event("change", { bubbles: true }))

            // Move cursor to end of inserted text
            const newPos = start + message.alias.length
            input.setSelectionRange(newPos, newPos)

        } else if (element.isContentEditable) {
            // For contenteditable divs, etc.
            document.execCommand("insertText", false, message.alias)
        }
    }
})
