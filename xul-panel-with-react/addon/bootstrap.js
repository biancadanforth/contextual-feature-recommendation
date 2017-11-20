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

const POPUP_ID = "custom-popup-example";
let POPUP_SHOW_TIMER;

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

  const recommendationConfig = await loadRecommendationConfig(browserWindow);

  this.Feature = new Feature({ POPUP_ID, recommendationConfig });
  this.WindowWatcher = new WindowWatcher(this.Feature);

  await this.WindowWatcher.startup();

  // Add timer to show popup
  // Note: Showing the popup should not require a timer;
  // listen for the right event on Firefox startup. See Issue #6
  POPUP_SHOW_TIMER = browserWindow.setTimeout(() => {
    this.Feature.showPopup(browserWindow);
    // If timer expires, don't clear it on clean up
    // (timerID could be reassigned?)
    CleanupManager.removeCleanupHandler({
      name: "clearPopupShowTimer",
      function: () => {
        browserWindow.clearTimeout(POPUP_SHOW_TIMER);
        POPUP_SHOW_TIMER = null;
      },
    });
  }, 500);
  // Reset timer on shutdown if it hasn't yet expired
  CleanupManager.addCleanupHandler({
    name: "clearPopupShowTimer",
    function: () => {
      browserWindow.clearTimeout(POPUP_SHOW_TIMER);
      POPUP_SHOW_TIMER = null;
    },
  });
}

async function shutdown() {
  // TODO bdanforth: add a note in some obvious place and create issue (reference here)
  // idea: List all handlers (what module they come from, or functions passed into CleanupManager have module names in them)
  // pass NAMED functions to set, they will show up if you console.log set. so on debug for QA they can check that cleanup exists
  await CleanupManager.cleanup();
}

function uninstall() {}


async function loadRecommendationConfig(browserWindow) {
  const recommendationConfigURL = `resource://${STUDY_NAME}-lib/RecommendationConfig.json`;
  try {
    const response = await browserWindow.fetch(recommendationConfigURL);
    return await response.json();
  } catch (error) {
    return error.message;
  }
}
