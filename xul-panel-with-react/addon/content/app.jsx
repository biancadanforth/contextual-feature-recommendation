// content.onload = () => addCustomContent(data);
// import Cats from "./cats.jsx";
// import ButtonWithDropdown from "./ButtonWithDropdown.jsx";

"use strict";

/* global React ReactDOM require content addMessageListener sendAsyncMessage */

// TODO: Remove this and just use addMessageListener and sendAsyncMessage sans wrapper
// const self = {
//   port: {
//     on(header, handle) {
//       addMessageListener(header, {
//         receiveMessage(message) {
//           if (message.name === header)
//             handle(message.data);
//         },
//       });
//     },
//     emit(header, data) {
//       sendAsyncMessage(header, data);
//     },
//   },
// };

function loadContent() {
  console.log("successfully called this method from Feature.jsm");
}

const sanitizeHtml = (m) => { return m; }; // disabling the sanitization. not needed. only text from the code is sent.

class App extends React.Component {
  constructor(props) {
    super(props);
    console.log("constructor of App");
  }

  render() {
    console.log('rendering');
    return (
      <div>
        Hi
      </div>
    );
  }
}

window.addCustomContent = function() {
  console.log('hi');
  ReactDOM.render(
    React.createElement(App),
    document.getElementById("app"),
  );
}

console.log('end of UI.js');

// window.addEventListener("load", addCustomContent);

// self.port.on("FocusedCFR::load", (data) => {
  // content.addEventListener("load", () => {
  //   const appEle = content.document.getElementById("app");
  //   console.log(appEle);
  //   addCustomContent();
  // });
  // content.document.addEventListener("DOMContentLoaded", () => {
  //   console.log('DOMContentLoaded');
  //   const appEle = content.document.getElementById("app");
  //   console.log(appEle);
  //   addCustomContent();
  // });
// });

// self.port.emit("panel-ready");
