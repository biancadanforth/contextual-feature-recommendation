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

class Feature {
  constructor(popupID, recipe) {
    this.popupID = popupID;
    this.recipe = recipe;
    this.setPopupArguments();
  }

  async getPopupSet(domWindow) {
    const doc = domWindow.document;
    const popupSet = doc.getElementById("mainPopupSet");
    if (!popupSet) {
      return new Promise(resolve => {
        // don't need to remove this listener;window load only ever occurs once
        // this event gets garbage collected when the window is unloaded
        doc.addEventListener("load", () => {
          resolve(doc.getElementById("mainPopupSet"));
        });
      });
    }

    return popupSet;
  }

  async addPopupContent(domWindow) {
    const popupSet = await this.getPopupSet(domWindow);
    const popupContent = domWindow.document
      .createElementNS(XUL_NS, "popupnotification");
    popupContent.hidden = true;
    popupContent.id = `${this.popupID}-notification`;
    // Insert custom XUL content into panel, including <browser> element
    popupContent.innerHTML = `
      <popupnotificationcontent
        class="custom-popup-example-content"
        orient="vertical"
        style="margin:0"
      >
        <browser
          id="custom-popup-example-browser"
          src="resource://custom-popup-example-addon-content/panel.html"
          disableglobalhistory="true"
          type="content"
          flex="1"
        >
        </browser>
      </popupnotificationcontent>
    `;
    popupSet.appendChild(popupContent);
    this.addBrowserContent(domWindow);
  }

  addBrowserContent(domWindow) {
    this.embeddedBrowser =
      domWindow.document.getElementById("custom-popup-example-browser");
    this.embeddedBrowser.addEventListener("load", () => {
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
        .addCustomContent(JSON.stringify(this.recipe));
    // capture is required: event target is the HTML document <browser> loads
    }, { capture: true });
    // <browser> already gets removed on shutdown with WindowWatcher.uninject,
    // so no need to remove the "load" event listener
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
    }
  }

  setPopupArguments() {
    const dC = this.recipe.presentation.defaultComponent;
    const pC = this.recipe.presentation.panelComponent;
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
