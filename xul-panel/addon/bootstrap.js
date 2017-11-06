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

    // Inject into existing windows
    this.windowList = Services.wm.getEnumerator(null);
    while (this.windowList.hasMoreElements()) {
      await this.inject(this.windowList.getNext());
    }
  },

  async observe(subject, topic, data) {
    switch (topic) {
      case "xul-window-registered":
        await this.inject(getDOMWindow(subject));
        break;
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
        <description id="custom-popup-example-header">Foo bar</description>
        <description id="custom-popup-example-message">Bazz biff</description>
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
    // TODO bdanforth: Check if I need to remove the domWindow "load" listener from getPopupSet method
  },
};

function install() {}

async function startup() {
  await WindowWatcher.startup();

  const browserWindow = RecentWindow.getMostRecentBrowserWindow();

  showPopup(browserWindow);

  // browserWindow.setTimeout(() => showPopup(browserWindow), 500);
}

function showPopup(browserWindow) {
  browserWindow.PopupNotifications.show(
    browserWindow.gBrowser.selectedBrowser,
    "custom-popup-example",
    "",
    null,
    {
      label: "Do Something",
      accessKey: "D",
      callback: function() {
        alert("Doing something awesome!");
      },
    },
    null,
    {
      persistentWhileVisible: true,
      persistent: true,
      eventCallback: (state) => {
        console.log(browserWindow.document);
        console.log(state);
      },
    }
  );
}

function shutdown() {
  WindowWatcher.shutdown();
}

function uninstall() {}
