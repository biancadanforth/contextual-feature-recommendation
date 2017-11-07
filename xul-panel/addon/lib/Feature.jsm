"use strict";

const EXPORTED_SYMBOLS = ["Feature"];

const { utils: Cu, interfaces: Ci } = Components;
Cu.import("resource://gre/modules/Services.jsm");

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

class Feature {
  constructor(popupID) {
    this.popupID = popupID;
  }

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
  }

  async addPopupContent(domWindow) {
    const popupSet = await this.getPopupSet(domWindow);
    const popupContent = domWindow.document.createElementNS(XUL_NS, "popupnotification");
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
  }

  removePopupContent(domWindow) {
    const popupContent = domWindow.document.querySelector("#mainPopupSet #custom-popup-example-notification");
    if (popupContent) {
      popupContent.remove();
    }
  }

  showPopup(browserWindow) {
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
}
