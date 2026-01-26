import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
    matches: ["<all_urls>"]
}

// Logic to inject the floating action button for email inputs
function injectButton(input: HTMLInputElement) {
    // Check if button already exists for this input
    if (input.dataset["eagHasButton"] === "true") return


    const iconUrl = chrome.runtime.getURL("assets/icon.png")

    const button = document.createElement("button")
    // button.textContent = "@"  // Removed text content
    button.type = "button"
    button.style.position = "absolute"
    button.style.cursor = "pointer"
    button.style.border = "none"
    button.style.background = "transparent" // Becomes transparent to show icon
    button.style.backgroundImage = `url("${iconUrl}")`
    button.style.backgroundSize = "contain"
    button.style.backgroundRepeat = "no-repeat"
    button.style.backgroundPosition = "center"
    // button.style.color = "white" // No longer needed
    // button.style.borderRadius = "50%" // Optional if icon is round
    button.style.width = "24px"
    button.style.height = "24px"
    // button.style.fontSize = "16px" // No longer needed
    // button.style.lineHeight = "1" // No longer needed
    button.style.zIndex = "10000"
    button.style.display = "block" // content-box, or flex

    // button.style.justifyContent = "center"
    // button.style.alignItems = "center"
    // button.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)"
    button.style.transition = "transform 0.1s, filter 0.1s"
    button.style.transformOrigin = "center"

    // Position it
    const updatePosition = () => {
        // Check if input is still in DOM
        if (!document.body.contains(input)) {
            button.remove()
            return
        }

        const rect = input.getBoundingClientRect()

        // Hide button if input is effectively invisible or very small
        if (rect.width === 0 || rect.height === 0 || getComputedStyle(input).visibility === "hidden") {
            button.style.display = "none"
            return
        } else {
            // Ensure it is visible if previously hidden
            button.style.display = "block"
        }

        const scrollTop = window.scrollY || document.documentElement.scrollTop
        const scrollLeft = window.scrollX || document.documentElement.scrollLeft

        // Center vertically in the input, place on the right side with some padding
        button.style.top = (rect.top + scrollTop + (rect.height - 24) / 2) + "px"
        button.style.left = (rect.left + scrollLeft + rect.width - 32) + "px"
    }

    // Initial position
    updatePosition()

    // ResizeObserver to detect size changes AND display:none which causes 0x0
    const resizeObserver = new ResizeObserver(() => {
        updatePosition()
    })
    resizeObserver.observe(input)

    // Update position on scroll/resize
    window.addEventListener("scroll", updatePosition, true)
    window.addEventListener("resize", updatePosition)

    button.onmouseenter = () => {
        button.style.transform = "scale(1.1)"
        button.style.filter = "brightness(0.8)"
    }
    button.onmouseleave = () => {
        button.style.transform = "scale(1)"
        button.style.filter = "brightness(1)"
    }

    button.onclick = (e) => {
        e.preventDefault()
        e.stopPropagation()

        // Request alias
        chrome.runtime.sendMessage({ action: "generate_alias" }, (response) => {
            if (response && response.alias) {
                insertAlias(input, response.alias)
            }
        })
    }

    document.body.appendChild(button)
    input.dataset["eagHasButton"] = "true"
}

function insertAlias(input: HTMLInputElement | HTMLTextAreaElement, alias: string) {
    // Ensure we can write to it
    if (input.readOnly || input.disabled) return

    // Replace the entire value
    // const start = input.selectionStart ?? input.value.length
    // const end = input.selectionEnd ?? input.value.length
    // const text = input.value

    // const before = text.substring(0, start)
    // const after = text.substring(end)

    // input.value = before + alias + after

    input.value = alias

    // Dispatch input events
    input.dispatchEvent(new Event("input", { bubbles: true }))
    input.dispatchEvent(new Event("change", { bubbles: true }))

    // Move cursor to end
    // const newPos = start + alias.length
    // input.setSelectionRange(newPos, newPos)
    input.focus()
}

// Runtime message listener for context menu interactions
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "insertAlias" && message.alias) {
        const element = document.activeElement as HTMLElement
        if (!element) return

        if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
            insertAlias(element as HTMLInputElement | HTMLTextAreaElement, message.alias)
        } else if (element.isContentEditable) {
            document.execCommand("insertText", false, message.alias)
        }
    }
})

// Observe DOM for matching inputs
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
            if (node instanceof HTMLElement) {
                if (node.tagName === "INPUT" && (node as HTMLInputElement).type === "email") {
                    injectButton(node as HTMLInputElement)
                }
                // Also check children
                const inputs = node.querySelectorAll('input[type="email"]')
                inputs.forEach(input => injectButton(input as HTMLInputElement))
            }
        }
    }
})

observer.observe(document.body, { childList: true, subtree: true })

// Initial scan
document.querySelectorAll('input[type="email"]').forEach(input => injectButton(input as HTMLInputElement))
