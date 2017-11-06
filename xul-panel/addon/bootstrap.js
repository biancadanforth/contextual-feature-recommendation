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
    }
  },

  shutdown() {
    Services.obs.removeObserver(this, "xul-window-registered");
    Services.obs.removeObserver(this, "browser-delayed-startup-finished");

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
      <popupnotificationcontent
        class="custom-popup-example-content"
        orient="vertical"
        style="margin:0"
      >
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
    // TODO bdanforth: Check if I need to remove the domWindow "load" listener from getPopupSet method (and how?)
  },
};

function install() {}

async function startup() {
  await WindowWatcher.startup();

  const browserWindow = RecentWindow.getMostRecentBrowserWindow();

  browserWindow.setTimeout(() => showPopup(browserWindow), 200);
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
        console.log("You clicked 'Add to Firefox'.");
      },
    },
    [
      {
        label: "Not Now",
        accessKey: "N",
        callback: function() {
          console.log("You clicked 'Not Now'.");
        },
      },
      {
        label: "Never ask me again",
        accessKey: "e",
        callback: function() {
          console.log("You clicked 'Never ask me again'.");
        },
      },
    ],
    {
      persistentWhileVisible: true,
      persistent: true,
      eventCallback: (state) => {
        console.log(state);
      },
      hideClose: true,
      popupIconURL: `resource://custom-popup-example-addon-content/extensions-16.svg`,
    }
  );
}

function shutdown() {
  WindowWatcher.shutdown();
}

function uninstall() {}
