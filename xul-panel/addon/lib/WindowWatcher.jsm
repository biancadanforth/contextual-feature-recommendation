"use strict";
/* global Feature */

const EXPORTED_SYMBOLS = ["WindowWatcher"];

// Firefox modules
const { utils: Cu, interfaces: Ci } = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Console.jsm");

// Study-specific modules
const STUDY_NAME = "custom-popup-example-addon";
XPCOMUtils.defineLazyModuleGetter(this, "Feature", `resource://${STUDY_NAME}-lib/Feature.jsm`);

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
  constructor(popupID) {
    this.popupID = popupID;
    this.Feature = new Feature(popupID);
  }

  async startup() {
    // Watch for newly-created windows
    Services.obs.addObserver(this, "xul-window-registered");

    // Inject into existing windows
    this.windowList = Services.wm.getEnumerator(null);
    while (this.windowList.hasMoreElements()) {
      await this.inject(this.windowList.getNext());
    }
  }

  async observe(subject, topic, data) {
    switch (topic) {
      case "xul-window-registered":
        await this.inject(getDOMWindow(subject));
        break;
    }
  }

  shutdown() {
    Services.obs.removeObserver(this, "xul-window-registered");

    // Clean up injected content
    while (this.windowList.hasMoreElements()) {
      this.uninject(this.windowList.getNext());
    }
  }

  async inject(domWindow) {
    if (domWindow.document.getElementById(this.popupID)) {
      throw new Error(`No such element by ID ${this.popupID} exists.`);
    }

    await this.Feature.addPopupContent(domWindow);
  }

  uninject(domWindow) {
    this.Feature.removePopupContent(domWindow);
  }
}
