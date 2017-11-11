// content.onload = () => addCustomContent(data);
// import Cats from "./cats.jsx";
// import ButtonWithDropdown from "./ButtonWithDropdown.jsx";

"use strict";

/* global React ReactDOM require */

const sanitizeHtml = (m) => { return m; }; // disabling the sanitization. not needed. only text from the code is sent.

class App extends React.Component {
  constructor(props) {
    super(props);
    // store all events we want to track in this component in state for debugging using React devtools
    this.state = {
      actionButtonClicked: false,
      declineButtonClicked: false,
      dropdownItemClicked: false,
      learnMoreLinkClicked: false,
    };
    this.STUDY_NAME = "custom-popup-example-addon";
  }

  render() {
    // convert relative to absolute URL for images
    const iconUrl = `resource://${this.STUDY_NAME}-content/img/${dC.iconUrl}`;
    // const rationaleUrl = require.context("./img")(`${ dC.rationaleIconUrl }`);
    // const ratingUrl = require.context("./img")(`${ dC.ratingUrl }`);
    return (
      <div>
        Hi
        <img src={ iconUrl } />
      </div>
    );
  }
}

window.addCustomContent = function(recipeJSON) {
  this.recipe = JSON.parse(recipeJSON);
  this.dC = this.recipe.presentation.defaultComponent;
  this.pC = this.recipe.presentation.panelComponent;
  ReactDOM.render(
    React.createElement(App),
    document.getElementById("app"),
  );
  // can't put this outside of this method currently, because I inject panel.html and its page scripts into about:blank too,
  // but about:blank doesn't get addCustomContent called on it, because about:blank's 'window' object is a
  sendMessageToChrome("AHH");
}
