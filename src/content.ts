import type { PlasmoCSConfig } from "plasmo";

import { Storage } from "@plasmohq/storage";

import type { DisableContextPopupIcon } from "~utils/localstorage_types";

const storage = new Storage();

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
};

// Logic to inject the floating action button for email inputs
async function injectButton(input: HTMLInputElement) {
  const disable_context_popup_icon = await storage.get<DisableContextPopupIcon>(
    "disable_context_popup_icon"
  );
  if (disable_context_popup_icon) return;
  // Check if button already exists for this input
  if (input.dataset["eagHasButton"] === "true") return;

  const iconUrl = chrome.runtime.getURL("assets/icon.png");

  const img = new Image();
  img.src = iconUrl;

  const button = document.createElement("button");
  button.type = "button";
  button.style.position = "absolute";
  button.style.cursor = "pointer";
  button.style.border = "none";
  button.style.background = "transparent"; // Becomes transparent to show icon
  // button.style.backgroundImage = `url("${iconUrl}")`;
  button.style.backgroundSize = "contain";
  button.style.backgroundRepeat = "no-repeat";
  button.style.backgroundPosition = "center";
  button.style.width = "24px";
  button.style.height = "24px";
  button.style.zIndex = "10000";
  button.style.display = "block"; // content-box, or flex
  button.style.transition =
    "transform 0.1s, filter 0.1s, opacity 0.3s, visibility 0.3s";
  button.style.transformOrigin = "center";
  button.style.opacity = "0";
  button.style.visibility = "hidden";
  button.style.pointerEvents = "none";

  img.onload = () => {
    button.style.backgroundImage = `url("${iconUrl}")`;
  };

  const fadeIn = () => {
    button.style.opacity = "1";
    button.style.visibility = "visible";
    button.style.pointerEvents = "auto";
  };

  const fadeOut = () => {
    button.style.opacity = "0";
    button.style.visibility = "hidden";
    button.style.pointerEvents = "none";
  };

  const checkVisibility = () => {
    if (document.hidden || !document.hasFocus()) {
      fadeOut();
    } else {
      fadeIn();
    }
  };
  checkVisibility();

  document.addEventListener("visibilitychange", checkVisibility);
  window.addEventListener("focus", checkVisibility);
  window.addEventListener("blur", checkVisibility);

  // Position it
  const updatePosition = () => {
    // Check if input is still in DOM
    if (!document.body.contains(input)) {
      button.remove();
      document.removeEventListener("visibilitychange", checkVisibility);
      window.removeEventListener("focus", checkVisibility);
      window.removeEventListener("blur", checkVisibility);
      return;
    }

    const rect = input.getBoundingClientRect();

    // Hide via opacity instead of display
    if (
      rect.width === 0 ||
      rect.height === 0 ||
      getComputedStyle(input).visibility === "hidden"
    ) {
      button.style.opacity = "0";
      button.style.visibility = "hidden";
      button.style.pointerEvents = "none";
      return;
    } else {
      // Only restore visibility if window has focus
      if (document.hasFocus()) {
        button.style.opacity = "1";
        button.style.visibility = "visible";
        button.style.pointerEvents = "auto";
      }
    }

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    // Center vertically in the input, place on the right side with some padding
    button.style.top = rect.top + scrollTop + (rect.height - 24) / 2 + "px";
    button.style.left = rect.left + scrollLeft + rect.width - 32 + "px";
  };

  // Initial position
  updatePosition();

  // ResizeObserver to detect size changes AND display:none which causes 0x0
  const resizeObserver = new ResizeObserver(() => {
    updatePosition();
  });
  resizeObserver.observe(input);

  // Update position on scroll/resize
  window.addEventListener("scroll", updatePosition, true);
  window.addEventListener("resize", updatePosition);

  button.onmouseenter = () => {
    button.style.transform = "scale(1.1)";
    button.style.filter = "brightness(0.8)";
  };
  button.onmouseleave = () => {
    button.style.transform = "scale(1)";
    button.style.filter = "brightness(1)";
  };

  button.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Request alias
    chrome.runtime.sendMessage({ action: "generate_alias" }, (response) => {
      if (response && response.alias) {
        insertAlias(input, response.alias);
      }
    });
  };

  document.body.appendChild(button);
  input.dataset["eagHasButton"] = "true";
}

function insertAlias(
  input: HTMLInputElement | HTMLTextAreaElement,
  alias: string
) {
  // Ensure we can write to it
  if (input.readOnly || input.disabled) return;
  input.value = alias;

  // Dispatch input events
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));

  // Move cursor to end
  input.focus();
  navigator.clipboard.writeText(alias);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "insertAllAliases" && message.alias) {
    for (let inputs of email_inputs) {
      if (inputs.tagName === "INPUT" || inputs.tagName === "TEXTAREA") {
        insertAlias(
          inputs as HTMLInputElement | HTMLTextAreaElement,
          message.alias
        );
      } else if (inputs.isContentEditable) {
        document.execCommand("insertText", false, message.alias);
      }
    }
  }
});

// Runtime message listener for context menu interactions
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "insertAlias" && message.alias) {
    const element = document.activeElement as HTMLElement;
    if (!element) return;
    if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
      insertAlias(
        element as HTMLInputElement | HTMLTextAreaElement,
        message.alias
      );
    } else if (element.isContentEditable) {
      document.execCommand("insertText", false, message.alias);
    }
  }
});

const EMAIL_INPUT_SELECTOR = 'input[type="email"], input[name="email"]';

const email_inputs = new Set<HTMLInputElement>();

function findAndInjectButtons(root: Document | HTMLElement) {
  root.querySelectorAll(EMAIL_INPUT_SELECTOR).forEach((input) => {
    const html_input = input as HTMLInputElement;
    email_inputs.add(html_input);
    injectButton(input as HTMLInputElement);
  });
}

// Observe DOM for matching inputs
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node instanceof HTMLElement) {
        // Check if the node itself matches
        if (node.matches?.(EMAIL_INPUT_SELECTOR)) {
          injectButton(node as HTMLInputElement);
        }
        // Check children only if node has descendants
        if (node.children.length > 0) {
          findAndInjectButtons(node);
        }
      }
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial scan
findAndInjectButtons(document);
