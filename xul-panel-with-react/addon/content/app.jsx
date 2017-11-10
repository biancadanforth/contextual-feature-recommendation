// content.onload = () => addCustomContent(data);
// import Cats from "./cats.jsx";
// import ButtonWithDropdown from "./ButtonWithDropdown.jsx";

"use strict";

/* global React ReactDOM require */

const sanitizeHtml = (m) => { return m; }; // disabling the sanitization. not needed. only text from the code is sent.

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        Hi
      </div>
    );
  }
}

window.addCustomContent = function() {
  ReactDOM.render(
    React.createElement(App),
    document.getElementById("app"),
  );
  // can't put this outside of this method currently, because I inject panel.html and its page scripts into about:blank too,
  // but about:blank doesn't get addCustomContent called on it, because about:blank's 'window' object is a dead object.
  sendMessageToChrome("AHH");
}
