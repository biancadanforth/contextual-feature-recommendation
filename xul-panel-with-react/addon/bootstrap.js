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

function install() {
  // has not yet evaluated chrome.manifest
  // install function is not actually called during the ADDON_INSTALL reason (this occurs during the start-up method).
}

async function startup() {

  const browserWindow = RecentWindow.getMostRecentBrowserWindow({
    private: false,
    allowPopups: false,
  });

  const recipe = await loadRecipe(browserWindow);

  this.WindowWatcher = new WindowWatcher(popupID, recipe);
  this.Feature = new Feature(popupID, recipe);

  await WindowWatcher.startup();

  browserWindow.setTimeout(async () => {
    await Feature.showPopup(browserWindow);
  }, 500);
}

function shutdown() {
  WindowWatcher.shutdown();
}

function uninstall() {}


async function loadRecipe(browserWindow) {
  const recipeURL = `resource://${STUDY_NAME}-lib/Recipe.json`;
  try {
    const response = await browserWindow.fetch(recipeURL);
    return await response.json();
  } catch (error) {
    return error.message;
  }
}
