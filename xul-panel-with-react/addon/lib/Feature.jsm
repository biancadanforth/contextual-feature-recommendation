/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";
/* global CleanupManager */

const EXPORTED_SYMBOLS = ["Feature"];

// Firefox modules
const { utils: Cu, interfaces: Ci } = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/Console.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

// Study-specific modules
const STUDY_NAME = "custom-popup-example-addon";
XPCOMUtils.defineLazyModuleGetter(this, "CleanupManager",
  `resource://${STUDY_NAME}-lib/CleanupManager.jsm`);

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
const PANEL_CSS_URI = Services.io.newURI(
  `resource://${STUDY_NAME}-skin/Feature.css`
);

const windowsWithInjectedCss = new WeakSet();
let anyWindowsWithInjectedCss = false;

// Add cleanup handler for CSS injected into windows by Feature
CleanupManager.addCleanupHandler(() => {
  if (anyWindowsWithInjectedCss) {
    const windowEnumerator = Services.wm.getEnumerator("navigator:browser");
    while (windowEnumerator.hasMoreElements()) {
      const domWindow = windowEnumerator.getNext();
      if (windowsWithInjectedCss.has(domWindow)) {
        const utils = domWindow.QueryInterface(Ci.nsIInterfaceRequestor)
          .getInterface(Ci.nsIDOMWindowUtils);
        utils.removeSheet(PANEL_CSS_URI, domWindow.AGENT_SHEET);
        windowsWithInjectedCss.delete(domWindow);
      }
    }
  }
});


class Feature {
  constructor(config) {
    this.popupID = config.POPUP_ID;
    this.recommendationConfig = config.recommendationConfig;
    this.setPopupArguments();
  }

  async getPopupSet(domWindow) {
    const doc = domWindow.document;
    const popupSet = doc.getElementById("mainPopupSet");
    if (!popupSet) {
      return new Promise(resolve => {
        // don't need to remove this listener; window load only ever occurs once
        // this event gets garbage collected when the window is unloaded
        doc.addEventListener("load", () => {
          resolve(doc.getElementById("mainPopupSet"));
        });
      });
    }

    return popupSet;
  }

  // Insert custom XUL content into panel, including <browser> element
  async addPopupContent(domWindow) {
    const popupSet = await this.getPopupSet(domWindow);
    // create <popupnotification>
    const popupContent = domWindow.document
      .createElementNS(XUL_NS, "popupnotification");
    popupContent.hidden = true;
    popupContent.id = `${this.popupID}-notification`;
    // create <popupnotificationcontent> for <popupnotification>
    const popupnotificationcontentEle = domWindow.document
      .createElementNS(XUL_NS, "popupnotificationcontent");
    popupnotificationcontentEle.setAttribute("class", `${this.popupID}-content`);
    popupnotificationcontentEle.setAttribute("orient", "vertical");
    popupnotificationcontentEle.setAttribute("style", "margin:0");
    // create <tooltip> for <popupnotificationcontent>
    const tooltipEle = domWindow.document.createElementNS(XUL_NS, "tooltip");
    tooltipEle.setAttribute("id", `${this.popupID}-tooltip`);
    tooltipEle.setAttribute("orient", "vertical");
    // create <label> for <tooltip>
    const labelEle = domWindow.document.createElementNS(XUL_NS, "label");
    const dC = this.recommendationConfig.presentation.defaultComponent;
    labelEle.setAttribute("value", `${dC.rationale}`);
    // create <browser> for <popupnotification>
    const embeddedBrowser = domWindow.document.createElementNS(XUL_NS, "browser");
    embeddedBrowser.setAttribute("id", `${this.popupID}-browser`);
    embeddedBrowser.setAttribute("src", `resource://${STUDY_NAME}-content/panel.html`);
    embeddedBrowser.setAttribute("disableglobalhistory", "true");
    embeddedBrowser.setAttribute("type", "content");
    embeddedBrowser.setAttribute("flex", "1");
    embeddedBrowser.setAttribute("tooltip", `${this.popupID}-tooltip`);
    // attach elements to each other and the parent XUL document
    tooltipEle.appendChild(labelEle);
    popupnotificationcontentEle.appendChild(tooltipEle);
    popupnotificationcontentEle.appendChild(embeddedBrowser);
    popupContent.appendChild(popupnotificationcontentEle);
    popupSet.appendChild(popupContent);
    this.addBrowserContent(domWindow);
    this.addXulStylesheet(domWindow);
  }

  addXulStylesheet(domWindow) {
    if (!windowsWithInjectedCss.has(domWindow)) {
      windowsWithInjectedCss.add(domWindow);
      const utils = domWindow.QueryInterface(Ci.nsIInterfaceRequestor)
        .getInterface(Ci.nsIDOMWindowUtils);
      utils.loadSheet(PANEL_CSS_URI, domWindow.AGENT_SHEET);
      anyWindowsWithInjectedCss = true;
    }
  }

  addBrowserContent(domWindow) {
    this.embeddedBrowser =
      domWindow.document.getElementById("custom-popup-example-browser");
    this.embeddedBrowser.addEventListener(
      "load",
      this.handleEmbeddedBrowserLoad.bind(this),
      // capture is required: event target is the HTML document <browser> loads
      { capture: true });
    // <browser> already gets removed on shutdown with WindowWatcher.uninject,
    // so no need to remove the "load" event listener
    // however for mozilla eslint rule "balanced listeners", will remove.
    CleanupManager.addCleanupHandler({
      name: "removeEmbeddedBrowserLoadListener",
      function: () => {
        this.embeddedBrowser.removeEventListener(
          "load",
          this.handleEmbeddedBrowserLoad.bind(this),
          { capture: true }
        );
      },
    });
  }

  handleEmbeddedBrowserLoad(embeddedBrowser) {
    // about:blank loads in a <browser> before the value of its src attribute,
    // so each embeddedBrowser actually loads twice.
    // Make sure we are only accessing our src page
    // accessing about:blank's contentWindow returns a dead object
    if (!this.embeddedBrowser.contentWindow) {
      return;
    }
    // enable messaging from page script to JSM
    Cu.exportFunction(
      this.sendMessageToChrome.bind(this),
      this.embeddedBrowser.contentWindow,
      { defineAs: "sendMessageToChrome"}
    );
    // call a method in the page script from the JSM
    this.embeddedBrowser.contentWindow.wrappedJSObject
      .addCustomContent(JSON.stringify(this.recommendationConfig));
  }

  // This is a method my page scripts can call to pass messages to the JSM
  sendMessageToChrome(message, data) {
    this.handleUIEvent(message, data);
  }

  // <browser> height must be set explicitly; base it off content dimensions
  resizeBrowser(dimensions) {
    this.embeddedBrowser.style.width = `${ dimensions.width }px`;
    this.embeddedBrowser.style.height = `${ dimensions.height }px`;
  }

  removePopupContent(domWindow) {
    const popupContent = domWindow.document
      .querySelector("#mainPopupSet #custom-popup-example-notification");
    if (popupContent) {
      popupContent.remove();
    }
  }

  handleUIEvent(message, data) {
    switch (message) {
      case "FocusedCFR::action":
        console.log(message);
        break;
      case "FocusedCFR::dismiss":
        console.log(message);
        break;
      case "FocusedCFR::close":
        console.log(message);
        break;
      case "FocusedCFR::openUrl":
        console.log(message, data);
        break;
      case "FocusedCFR::browserResize":
        this.resizeBrowser(JSON.parse(data));
        break;
      case "FocusedCFR::panelState":
        console.log(`Panel ${data}`);
        break;
      default:
        throw new Error("UI event is not recognized.");
        break;
    }
  }

  setPopupArguments() {
    const dC = this.recommendationConfig.presentation.defaultComponent;
    const pC = this.recommendationConfig.presentation.panelComponent;
    this.anchor = null;
    this.message = dC.header;
    this.mainAction = {
      label: dC.action,
      accessKey: dC.action.charAt(0),
      callback: () => {
        this.handleUIEvent("FocusedCFR::action");
      },
    };
    this.secondaryActions = [
      {
        label: pC.declineAction,
        accessKey: pC.declineAction.charAt(0),
        callback: () => {
          this.handleUIEvent("FocusedCFR::dismiss");
        },
      },
      {
        label: pC.dropdownOptions[0].label,
        accessKey: pC.dropdownOptions[0].label.charAt(0),
        callback: () => {
          this.handleUIEvent("FocusedCFR::close");
        },
      },
    ];
    this.options = {
      persistentWhileVisible: true,
      persistent: true,
      eventCallback: (state) => {
        this.handleUIEvent("FocusedCFR::panelState", state);
      },
      hideClose: true,
      popupIconURL: `resource://${STUDY_NAME}-content/img/${dC.iconUrl}`,
    };
  }

  showPopup(browserWindow) {
    browserWindow.PopupNotifications.show(
      browserWindow.gBrowser.selectedBrowser,
      this.popupID,
      this.message,
      this.anchor,
      this.mainAction,
      this.secondaryActions,
      this.options,
    );
  }
}
