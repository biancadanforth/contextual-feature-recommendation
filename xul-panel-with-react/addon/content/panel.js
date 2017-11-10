let document;

"use strict";

/* global React ReactDOM require content addMessageListener sendAsyncMessage */

// TODO: Remove this and just use addMessageListener and sendAsyncMessage sans wrapper
const self = {
  port: {
    on(header, handle) {
      addMessageListener(header, {
        receiveMessage(message) {
          if (message.name === header)
            handle(message.data);
        },
      });
    },
    emit(header, data) {
      sendAsyncMessage(header, data);
    },
  },
};

const sanitizeHtml = (m) => { return m; }; // disabling the sanitization. not needed. only text from the code is sent.

function addCustomContent() {
  const appEle = content.document.getElementById("app");
  console.log(appEle);
  appEle.innerHTML = "hello";
}

self.port.on("FocusedCFR::load", (data) => {
  content.addEventListener("load", () => {
    document = content.document;
    const appEle = document.getElementById("app");
    console.log(appEle);
    addCustomContent();
  });
});
