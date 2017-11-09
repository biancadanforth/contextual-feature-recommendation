"use strict";

const EXPORTED_SYMBOLS = ["Feature"];

// Firefox modules
const { utils: Cu, interfaces: Ci } = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/Console.jsm");

const STUDY_NAME = "custom-popup-example-addon";

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

class Feature {
  constructor(popupID) {
    this.popupID = popupID;
    this.recipeURL = `resource://${STUDY_NAME}-lib/Recipe.json`;
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
          disableglobalhistory="true"
          type="content"
          flex="1"
          width="100%"
          height="100%"
        >
        </browser>
      </popupnotificationcontent>
    `;
    popupSet.appendChild(popupContent);
  }

  addFrameScripts(domWindow) {
    const embeddedBrowser = domWindow.document.getElementById("custom-popup-example-browser");
    // TODO bdanforth: Look at osmose's pioneer study to see why we have to attach a random number at the end
    embeddedBrowser.messageManager.loadFrameScript(`resource://${STUDY_NAME}-vendor/React.js?${Math.random()}`, false);
    embeddedBrowser.messageManager.loadFrameScript(`resource://${STUDY_NAME}-vendor/ReactDOM.js?${Math.random()}`, false);
    embeddedBrowser.messageManager.loadFrameScript(`resource://${STUDY_NAME}-content/UI.js?${Math.random()}`, false);
    embeddedBrowser.messageManager.sendAsyncMessage("FocusedCFR::load");
  }

  removePopupContent(domWindow) {
    const popupContent = domWindow.document.querySelector("#mainPopupSet #custom-popup-example-notification");
    if (popupContent) {
      popupContent.remove();
    }
  }

  async loadRecipe(browserWindow) {
    try {
      const response = await browserWindow.fetch(this.recipeURL);
      return await response.json();
    } catch (error) {
      return error.message;
    }
  }

  async showPopup(browserWindow) {
    const recipe = await this.loadRecipe(browserWindow);
    const dC = recipe.presentation.defaultComponent;
    const pC = recipe.presentation.panelComponent;
    browserWindow.PopupNotifications.show(
      browserWindow.gBrowser.selectedBrowser,
      this.popupID,
      dC.header,
      null,
      {
        label: dC.action,
        accessKey: dC.action.charAt(0),
        callback: function() {
          console.log(`You clicked '${dC.action}'.`);
        },
      },
      [
        {
          label: pC.declineAction,
          accessKey: pC.declineAction.charAt(0),
          callback: function() {
            console.log(`You clicked '${dC.declineAction}'.`);
          },
        },
        {
          label: pC.dropdownOptions[0].label,
          accessKey: pC.dropdownOptions[0].label.charAt(0),
          callback: function() {
            console.log(`You clicked '${pC.dropdownOptions[0].label}'.`);
          },
        },
      ],
      {
        persistentWhileVisible: true,
        persistent: true,
        eventCallback: (state) => {
          console.log(`Panel ${state}.`);
        },
        hideClose: true,
        popupIconURL: `resource://${STUDY_NAME}-content/${dC.iconUrl}`,
      }
    );
  }
}
