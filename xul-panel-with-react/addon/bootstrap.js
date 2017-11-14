/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";
/* global Feature, WindowWatcher, CleanupManager */

// Firefox modules
const { utils: Cu } = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
XPCOMUtils.defineLazyModuleGetter(
  this,
  "RecentWindow",
  "resource:///modules/RecentWindow.jsm"
);

// Study-specific modules
const STUDY_NAME = "custom-popup-example-addon";
XPCOMUtils.defineLazyModuleGetter(this, "WindowWatcher",
  `resource://${STUDY_NAME}-lib/WindowWatcher.jsm`);
XPCOMUtils.defineLazyModuleGetter(this, "Feature",
  `resource://${STUDY_NAME}-lib/Feature.jsm`);
XPCOMUtils.defineLazyModuleGetter(this, "CleanupManager",
  `resource://${STUDY_NAME}-lib/CleanupManager.jsm`);

const popupID = "custom-popup-example";
let popupShowTimer;

function install() {
  // has not yet evaluated chrome.manifest
  // install function is not actually called during the ADDON_INSTALL
  // reason (this occurs during the start-up method).
}

async function startup() {

  const browserWindow = RecentWindow.getMostRecentBrowserWindow({
    private: false,
    allowPopups: false,
  });

  const recipe = await loadRecipe(browserWindow);

  this.Feature = new Feature(popupID, recipe);
  this.WindowWatcher = new WindowWatcher(this.Feature);

  await WindowWatcher.startup();

  // Add timer to show popup
  popupShowTimer = browserWindow.setTimeout(() => {
    Feature.showPopup(browserWindow);
    // If timer expires, don't clear it on clean up
    // (timerID could be reassigned?)
    CleanupManager.removeCleanupHandler(() => {
      browserWindow.clearTimeout(popupShowTimer);
      popupShowTimer = null;
    });
  }, 500);
  // Reset timer on shutdown if it hasn't yet expired
  CleanupManager.addCleanupHandler(() => {
    browserWindow.clearTimeout(popupShowTimer);
    popupShowTimer = null;
  });
}

async function shutdown() {
  await CleanupManager.cleanup();
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
