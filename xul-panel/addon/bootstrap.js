"use strict";

const { utils: Cu, interfaces: Ci } = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "RecentWindow", "resource:///modules/RecentWindow.jsm");

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

/**
 * Converts an nsISupports object (returned by window observers) that
 * implements a XUL Window into a ChromeWindow object.
 */
function getDOMWindow(subject) {
  return (
    subject
      .QueryInterface(Ci.nsIXULWindow)
      .docShell
      .QueryInterface(Ci.nsIInterfaceRequestor)
      .getInterface(Ci.nsIDOMWindow)
  );
}

const WindowWatcher = {
  async startup() {
    this.popupID = "custom-popup-example";
    // Watch for newly-created windows
    Services.obs.addObserver(this, "xul-window-registered");
    Services.obs.addObserver(this, "browser-delayed-startup-finished");

    // Inject into existing windows
    this.windowList = Services.wm.getEnumerator(null);
    while (this.windowList.hasMoreElements()) {
      await this.inject(this.windowList.getNext());
    }
  },

  async observe(subject, topic, data) {
    const browserWindow = RecentWindow.getMostRecentBrowserWindow();
    switch (topic) {
      case "xul-window-registered":
        await this.inject(getDOMWindow(subject));
        break;
      case "browser-delayed-startup-finished":
      // This is for opening the popup immediately on startup in the case the addon is already installed before Firefox launches (i.e. unbranded builds where I can permanently install an unsigned addon)
      // Per Matt N. if I am temporarily installing the addon on startup, this event may have already been fired before the addon is installed
      // However having this event here covers the case when I am restarting Firefox on an unbranded build with the addon already installed
      // TODO: Figure out why the event fires, but the popup only goes from "showing" to "removed"; it's never "shown"
        showPopup(browserWindow);
    }
  },

  shutdown() {
    Services.obs.removeObserver(this, "xul-window-registered");

    // Clean up injected content
    while (this.windowList.hasMoreElements()) {
      this.uninject(this.windowList.getNext());
    }
  },

  async addPopupContent(domWindow) {
    const popupSet = await this.getPopupSet(domWindow);
    const popupContent = domWindow.document.createElementNS(XUL_NS, "popupnotification");
    popupContent.hidden = true;
    popupContent.id = `${this.popupID}-notification`;
    popupContent.innerHTML = `
      <popupnotificationcontent class="custom-popup-example-content" orient="vertical">
        <browser
          id="custom-popup-example-browser"
          src="resource://custom-popup-example-addon-content/panel.html"
          type="content"
          disableglobalhistory="true"
          flex="1"
          width="100%"
          height="100%"
        >
        </browser>
      </popupnotificationcontent>
    `;
    popupSet.appendChild(popupContent);
  },

  async getPopupSet(domWindow) {
    const doc = domWindow.document;
    const popupSet = doc.getElementById("mainPopupSet");
    if (!popupSet) {
      return new Promise(resolve => {
        doc.addEventListener("load", () => {
          resolve(doc.getElementById("mainPopupSet"));
        });
      });
    }

    return popupSet;
  },

  removeUnwantedDefaultPanelElements(domWindow) {
    const eles = domWindow.document.getElementsByClassName(`${this.popupID}-icon`);
    console.log(eles);
  },

  async inject(domWindow) {
    if (domWindow.document.getElementById(this.popupID)) {
      throw new Error(`No such element by ID ${this.popupID} exists.`);
    }

    await this.addPopupContent(domWindow);
  },

  uninject(domWindow) {
    const popupContent = domWindow.document.querySelector("#mainPopupSet #custom-popup-example-notification");
    if (popupContent) {
      popupContent.remove();
    }
    // TODO bdanforth: Check if I need to remove the domWindow "load" listener from getPopupSet method
  },
};

function install() {}

async function startup(data, reason) {
  await WindowWatcher.startup();

  const browserWindow = RecentWindow.getMostRecentBrowserWindow();

  const ADDON_INSTALL = 5;
  const ADDON_STARTUP = 1;

  // TODO: bdanforth - currently the addon works with or without the if statement
  // using the reason code without a delay means the popup does not display on initial startup of Firefox
  // ADDON_STARTUP occurs if you have the addon already installed and are opening Firefox (an unbranded build in the case of an unsigned addon)
  // ADDON_INSTALL occurs on addon install!
  if (reason === ADDON_INSTALL || reason === ADDON_STARTUP) {
    browserWindow.setTimeout(() => showPopup(browserWindow), 500);
  }

  // showPopup(browserWindow);

  // WindowWatcher.removeUnwantedDefaultPanelElements(browserWindow);
}

function showPopup(browserWindow) {
  browserWindow.PopupNotifications.show(
    browserWindow.gBrowser.selectedBrowser,
    "custom-popup-example",
    "",
    null,
    {
      label: "Add to Firefox",
      accessKey: "A",
      callback: function() {
        alert("You clicked 'Add to Firefox'.");
      },
    },
    [
      {
        label: "Not Now",
        accessKey: "N",
        callback: function() {
          alert("You clicked 'Not Now'.");
        },
      },
      {
        label: "Never ask me again",
        accessKey: "e",
        callback: function() {
          alert("You clicked 'Never ask me again'.");
        },
      },
    ],
    {
      persistentWhileVisible: true,
      persistent: true,
      eventCallback: (state) => {
        console.log(browserWindow.document);
        console.log(state);
      },
      hideClose: true,
      popupIconClass: `${WindowWatcher.popupID}-icon`,
    }
  );
}

function shutdown() {
  WindowWatcher.shutdown();
}

function uninstall() {}
