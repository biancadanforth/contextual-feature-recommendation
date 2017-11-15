/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Taken from: https://github.com/mozilla/normandy

"use strict";

const {utils: Cu} = Components;
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Console.jsm");

XPCOMUtils.defineLazyModuleGetter(
  this,
  "AsyncShutdown",
  "resource://gre/modules/AsyncShutdown.jsm"
);

this.EXPORTED_SYMBOLS = ["CleanupManager"];

class CleanupManagerClass {
  constructor() {
    this.handlers = new Set();
    this.cleanupPromise = null;
  }

  // @param { Object }
  // @param handler.name - name of the function to execute on cleanup
  // @param handler.function - function to execute on cleanup
  addCleanupHandler(handler) {
    this.handlers.add(handler);
  }

  // @param { Object }
  // @param handler.name - name of the function to execute on cleanup
  // @param handler.function - function to execute on cleanup
  removeCleanupHandler(handler) {
    this.handlers.delete(handler);
  }

  async cleanup() {
    if (this.cleanupPromise === null) {
      this.cleanupPromise = (async () => {
        console.log("List of cleanup operations: ");
        for (const handler of this.handlers) {
          try {
            console.log(handler.name);
            await handler.function();
          } catch (ex) {
            Cu.reportError(ex);
          }
        }
      })();

      // Block shutdown to ensure any cleanup tasks that write data are
      // finished.
      AsyncShutdown.profileBeforeChange.addBlocker(
        "Custom Popup Example Addon: Cleaning up",
        this.cleanupPromise,
      );
    }

    return this.cleanupPromise;
  }
}

this.CleanupManager = new CleanupManagerClass();
