"use strict";

// Firefox modules
const { utils: Cu } = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "RecentWindow", "resource:///modules/RecentWindow.jsm");

// Study-specific modules
const BASE = "custom-popup-example-addon";
XPCOMUtils.defineLazyModuleGetter(this, "WindowWatcher", `resource://${BASE}-lib/WindowWatcher.jsm`);

const popupID = "custom-popup-example";

function install() {}

async function startup() {
  await new WindowWatcher(popupID).startup();

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
