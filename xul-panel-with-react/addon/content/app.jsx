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

class App extends React.Component {
  constructor(props) {
    super(props);
    console.log("constructor of App");
  }

  render() {
    console.log("render of App");
    // never actually puts this in the HTML file
    // though the Parse error is just an eslint issue --
    //if I include import at the top as in CFR it goes away,
    //and the import works in CFR, and Webpack doesn't yell at me when its transpiling
    return (
      <div>
        Hi
      </div>
    );
  }
}

function load(data) {
  console.log("calling load in app.jsx");
  const document = content.document; // eslint-disable-line no-global-assign, no-native-reassign
  
  // even attempts using normal JS methods to inject content into the document fail
  // 'content' Frame Script global var is a "dead object"
  console.log("content.document", document);
  const dummyEle = document.createElement("p");
  dummyEle.innerText = "Hi";
  const appEle = document.getElementById("app");
  appEle.appendChild(dummyEle);
  console.log("appEle", appEle);

  // ReactDOM.render(
  //   React.createElement(App),
  //   document.getElementById("app"),
  // );
}

self.port.on("FocusedCFR::load", (data) => {
  console.log('received FocusedCFR load event');
  content.addEventListener("load", () => load(data));
});

//self.port.emit("panel-ready");
