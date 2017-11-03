"use strict";

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "(EXPORTED_SYMBOLS|CustomPopup)" }]*/

const { utils: Cu } = Components;
Cu.import("resource://gre/modules/Console.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/PrivateBrowsingUtils.jsm");
const EXPORTED_SYMBOLS = this.EXPORTED_SYMBOLS = ["CustomPopup"];

var Ci = Components.interfaces;

// Enumerated values for the POPUP_NOTIFICATION_STATS telemetry histogram.
const TELEMETRY_STAT_ACTION_2 = 2;
const TELEMETRY_STAT_ACTION_LAST = 4;
const TELEMETRY_STAT_DISMISSAL_CLOSE_BUTTON = 7;

var gNotificationParents = new WeakMap;

XPCOMUtils.defineLazyModuleGetter(this, "RecentWindow",
  "resource:///modules/RecentWindow.jsm");
// window utilities
function getMostRecentBrowserWindow() {
  return RecentWindow.getMostRecentBrowserWindow({
    private: false,
    allowPopups: false,
  });
}

const win = getMostRecentBrowserWindow();

// Copied from https://dxr.mozilla.org/mozilla-central/source/toolkit/modules/PopupNotifications.jsm#74
class Notification {
  constructor(id, message, anchorID, mainAction, secondaryActions, browser, owner, options) {
    this.id = id;
    this.message = message;
    this.anchorID = anchorID;
    this.mainAction = mainAction;
    this.secondaryActions = secondaryActions || [];
    this.browser = browser;
    // should be win.PopupNotifications
    this.owner = owner;
    this.options = options || {};
    this._dismissed = false;
    // Will become a boolean when manually toggled by the user.
    this._checkboxChecked = null;
    this.wasDismissed = false;
    this.recordedTelemetryStats = new Set();
    this.isPrivate = PrivateBrowsingUtils.isWindowPrivate(this.browser.ownerGlobal);
    this.timeCreated = this.owner.window.performance.now();
  }
}

class CustomPopup {
  constructor(id, message, anchorID, mainAction, secondaryActions, browser, owner, options) {
    // Notification object
    this.n = new Notification(id, message, anchorID, mainAction, secondaryActions, browser, owner, options);
    this.popupNotificationElement = this.makePopupNotificationElement(this.n);
  }

  makePopupNotificationElement(n) {
    const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

    const doc = win.document;

    // Append "-notification" to the ID to try to avoid ID conflicts with other stuff
    // in the document.
    const popupnotificationID = n.id + "-notification";
    
    const popupnotification = doc.createElementNS(XUL_NS, "popupnotification");

    popupnotification.setAttribute("label", n.message);
    popupnotification.setAttribute("id", popupnotificationID);
    popupnotification.setAttribute("popupid", n.id);
    popupnotification.setAttribute("oncommand", "PopupNotifications._onCommand(event);");
    if (Services.prefs.getBoolPref("privacy.permissionPrompts.showCloseButton")) {
      popupnotification.setAttribute("closebuttoncommand", "PopupNotifications._onButtonEvent(event, 'secondarybuttoncommand');");
    } else {
      popupnotification.setAttribute("closebuttoncommand", `PopupNotifications._dismiss(event, ${TELEMETRY_STAT_DISMISSAL_CLOSE_BUTTON});`);
    }
    if (n.mainAction) {
      popupnotification.setAttribute("buttonlabel", n.mainAction.label);
      popupnotification.setAttribute("buttonaccesskey", n.mainAction.accessKey);
      popupnotification.setAttribute("buttonhighlight", !n.mainAction.disableHighlight);
      popupnotification.setAttribute("buttoncommand", "PopupNotifications._onButtonEvent(event, 'buttoncommand');");
      popupnotification.setAttribute("dropmarkerpopupshown", "PopupNotifications._onButtonEvent(event, 'dropmarkerpopupshown');");
      popupnotification.setAttribute("learnmoreclick", "PopupNotifications._onButtonEvent(event, 'learnmoreclick');");
      popupnotification.setAttribute("menucommand", "PopupNotifications._onMenuCommand(event);");
    } else {
      // Enable the default button to let the user close the popup if the close button is hidden
      popupnotification.setAttribute("buttoncommand", "PopupNotifications._onButtonEvent(event, 'buttoncommand');");
      popupnotification.setAttribute("buttonhighlight", "true");
      popupnotification.removeAttribute("buttonlabel");
      popupnotification.removeAttribute("buttonaccesskey");
      popupnotification.removeAttribute("dropmarkerpopupshown");
      popupnotification.removeAttribute("learnmoreclick");
      popupnotification.removeAttribute("menucommand");
    }

    if (n.options.popupIconClass) {
      const classes = "popup-notification-icon " + n.options.popupIconClass;
      popupnotification.setAttribute("iconclass", classes);
    }
    if (n.options.popupIconURL)
      popupnotification.setAttribute("icon", n.options.popupIconURL);

    if (n.options.learnMoreURL)
      popupnotification.setAttribute("learnmoreurl", n.options.learnMoreURL);
    else
      popupnotification.removeAttribute("learnmoreurl");

    if (n.options.displayURI) {
      let uri;
      try {
        if (n.options.displayURI instanceof Ci.nsIFileURL) {
          uri = n.options.displayURI.pathQueryRef;
        } else {
          uri = n.options.displayURI.hostPort;
        }
        popupnotification.setAttribute("origin", uri);
      } catch (e) {
        Cu.reportError(e);
        popupnotification.removeAttribute("origin");
      }
    } else
      popupnotification.removeAttribute("origin");

    if (n.options.hideClose)
      popupnotification.setAttribute("closebuttonhidden", "true");

    popupnotification.notification = n;

    if (n.mainAction && n.secondaryActions && n.secondaryActions.length > 0) {
      let telemetryStatId = TELEMETRY_STAT_ACTION_2;

      const secondaryAction = n.secondaryActions[0];
      popupnotification.setAttribute("secondarybuttonlabel", secondaryAction.label);
      popupnotification.setAttribute("secondarybuttonaccesskey", secondaryAction.accessKey);
      popupnotification.setAttribute("secondarybuttoncommand", "PopupNotifications._onButtonEvent(event, 'secondarybuttoncommand');");

      for (let i = 1; i < n.secondaryActions.length; i++) {
        const action = n.secondaryActions[i];
        const item = doc.createElementNS(XUL_NS, "menuitem");
        item.setAttribute("label", action.label);
        item.setAttribute("accesskey", action.accessKey);
        item.notification = n;
        item.action = action;

        popupnotification.appendChild(item);

        // We can only record a limited number of actions in telemetry. If
        // there are more, the latest are all recorded in the last bucket.
        item.action.telemetryStatId = telemetryStatId;
        if (telemetryStatId < TELEMETRY_STAT_ACTION_LAST) {
          telemetryStatId++;
        }
      }

      if (n.secondaryActions.length < 2) {
        popupnotification.setAttribute("dropmarkerhidden", "true");
      }
    } else {
      popupnotification.setAttribute("secondarybuttonhidden", "true");
      popupnotification.setAttribute("dropmarkerhidden", "true");
    }

    const checkbox = n.options.checkbox;
    if (checkbox && checkbox.label) {
      const checked = n._checkboxChecked != null ? n._checkboxChecked : !!checkbox.checked;

      popupnotification.setAttribute("checkboxhidden", "false");
      popupnotification.setAttribute("checkboxchecked", checked);
      popupnotification.setAttribute("checkboxlabel", checkbox.label);

      popupnotification.setAttribute("checkboxcommand", "PopupNotifications._onCheckboxCommand(event);");

      if (checked) {
        this._setNotificationUIState(popupnotification, checkbox.checkedState);
      } else {
        this._setNotificationUIState(popupnotification, checkbox.uncheckedState);
      }
    } else {
      popupnotification.setAttribute("checkboxhidden", "true");
      popupnotification.setAttribute("warninghidden", "true");
    }

    // The popupnotification may be hidden if we got it from the chrome
    // document rather than creating it ad hoc.
    popupnotification.hidden = false;

    return popupnotification;
  }
}
