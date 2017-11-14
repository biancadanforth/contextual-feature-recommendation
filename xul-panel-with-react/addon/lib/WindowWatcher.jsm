/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";
/* global CleanupManager */

const EXPORTED_SYMBOLS = ["WindowWatcher"];

// Firefox modules
const { utils: Cu, interfaces: Ci } = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Console.jsm");

// Study-specific modules
const STUDY_NAME = "custom-popup-example-addon";
XPCOMUtils.defineLazyModuleGetter(this, "CleanupManager",
  `resource://${STUDY_NAME}-lib/CleanupManager.jsm`);

/**
 * Converts an nsISupports object (returned by window observers) that
 * implements a XUL Window into a ChromeWindow object.
 */
function getDOMWindow(subject) {
  return (
    subject
      .QueryInterface(Ci.nsIXULWindow)
      .docShell
      .QueryInterface(Ci.nsIInterfaceRequestor)
      .getInterface(Ci.nsIDOMWindow)
  );
}

class WindowWatcher {
  constructor(Feature) {
    this.Feature = Feature;
  }

  async startup() {
    // Watch for newly-created windows
    Services.obs.addObserver(this, "xul-window-registered");
    CleanupManager.addCleanupHandler(() => {
      // Remove listener on shutdown
      Services.obs.removeObserver(this, "xul-window-registered");
    });

    // Inject into existing windows
    const windowList = Services.wm.getEnumerator("navigator:browser");
    while (windowList.hasMoreElements()) {
      await this.inject(windowList.getNext());
    }
    CleanupManager.addCleanupHandler(() => {
      // Clean up injected content on shutdown with updated window list
      const windowListCleanup = Services.wm
        .getEnumerator("navigator:browser");
      while (windowListCleanup.hasMoreElements()) {
        this.uninject(windowListCleanup.getNext());
      }
    });
  }

  async observe(subject, topic, data) {
    let xulWindow;
    switch (topic) {
      case "xul-window-registered":
        xulWindow = getDOMWindow(subject);
        await new Promise(resolve => {
          // don't need to remove this listener, as window load only 
          // ever occurs once this event gets garbage collected when
          // the window is unloaded  
          xulWindow.addEventListener("load", async () => {
            // don't inject popup into non-browser windows (ex: devtools)
            if (xulWindow.document.documentElement.getAttribute("windowtype")
              !== "navigator:browser") {
              return;
            }
            await this.inject(xulWindow);
          });
        });
        break;
    }
  }

  async inject(domWindow) {
    try {
      await this.Feature.addPopupContent(domWindow);
    } catch (error) {
      throw new Error(`Unable to inject content into window: ${error}`);
    }
  }

  uninject(domWindow) {
    this.Feature.removePopupContent(domWindow);
  }
}
