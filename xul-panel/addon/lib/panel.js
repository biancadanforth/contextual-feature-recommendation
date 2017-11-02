/*
Resources:
  PopupNotifications.show() in DXR: https://dxr.mozilla.org/mozilla-central/source/toolkit/modules/PopupNotifications.jsm#455
  Description of PopupNotifications.show() parameters: https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/PopupNotifications.jsm#Notification_actions
  BoredPanda notification in source code: http://searchfox.org/mozilla-central/source/browser/modules/PermissionUI.jsm#360
*/
PopupNotifications.show(
  gBrowser.selectedBrowser,
  "sample-popup",
  "",
  null, /* anchor ID */
  {
    label: "Add to Firefox",
    accessKey: "A",
    callback: function() {
      alert("You clicked 'Add to Firefox'.");
    },
  },
  [
    {
      label: "Not Now",
      accessKey: "N",
      callback: function() {
        alert("You clicked 'Not Now'.");
      },
    },
    {
      label: "Don't show sponsored suggestions again",
      accessKey: "D",
      callback: function() {
        alert("You clicked 'Don't show sponsored suggestions again'.");
      },
    },
  ],
  {
    timeout: Date.now() + 3000,
    persistWhileVisible: true,
    persistent: true,
    eventCallback: (state) => {
      console.log(state);
    },
    hideClose: true,
  }
);