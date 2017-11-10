// content.onload = () => addCustomContent(data);
// import Cats from "./cats.jsx";
// import ButtonWithDropdown from "./ButtonWithDropdown.jsx";

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

// class App extends React.Component {
//   constructor(props) {
//     super(props);
//     console.log("constructor of App");
//   }

//   render() {
//     console.log('rendering');
//     return (
//       <div>
//         Hi
//       </div>
//     );
//   }
// }

function addCustomContent() {
  const appEle = content.document.getElementById("app");
  console.log(appEle);
  appEle.innerHTML = "hello";
  // ReactDOM.render(
  //   React.createElement(App),
  //   content.document.getElementById("app"),
  // );
}

self.port.on("FocusedCFR::load", (data) => {
  content.addEventListener("load", () => {
    const appEle = content.document.getElementById("app");
    console.log(appEle);
    addCustomContent();
  });
  // content.document.addEventListener("DOMContentLoaded", () => {
  //   console.log('DOMContentLoaded');
  //   const appEle = content.document.getElementById("app");
  //   console.log(appEle);
  //   addCustomContent();
  // });
});

// self.port.emit("panel-ready");
