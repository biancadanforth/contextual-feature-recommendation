"use strict";
/* global Feature, WindowWatcher */

// Firefox modules
const { utils: Cu } = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "RecentWindow", "resource:///modules/RecentWindow.jsm");

// Study-specific modules
const STUDY_NAME = "custom-popup-example-addon";
XPCOMUtils.defineLazyModuleGetter(this, "WindowWatcher", `resource://${STUDY_NAME}-lib/WindowWatcher.jsm`);
XPCOMUtils.defineLazyModuleGetter(this, "Feature", `resource://${STUDY_NAME}-lib/Feature.jsm`);

const popupID = "custom-popup-example";

function install() {}

async function startup() {
  this.WindowWatcher = new WindowWatcher(popupID);
  this.Feature = new Feature(popupID);

  await WindowWatcher.startup();

  const browserWindow = RecentWindow.getMostRecentBrowserWindow({
    private: false,
    allowPopups: false,
  });

  browserWindow.setTimeout(async () => {
    await Feature.showPopup(browserWindow);
  }, 500);
}

function shutdown() {
  WindowWatcher.shutdown();
}

function uninstall() {}
