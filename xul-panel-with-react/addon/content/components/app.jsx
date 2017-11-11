// import Cats from "./cats.jsx";
// import ButtonWithDropdown from "./ButtonWithDropdown.jsx";

"use strict";

/* global React ReactDOM require */

const sanitizeHtml = (m) => { return m; }; // disabling the sanitization. not needed. only text from the code is sent.

class Panel extends React.Component {
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

  // get width and height of panel after it's loaded (note: render occurs BEFORE load)
  // dims are not final until load
  handleLoad() {
    const dimensions = this.getPanelDimensions();
    sendMessageToChrome("CFR::BrowserResize", JSON.stringify(dimensions));
  }

  getPanelDimensions() {
    const panel = ReactDOM.findDOMNode(this);
    // get the DOMRect object of panel element, not JSON-able
    const dimensions = panel.getBoundingClientRect();
    return { width: dimensions.width, height: dimensions.height };
  }

  render() {
    // convert relative to absolute URL for images
    const rationaleUrl = `resource://${this.STUDY_NAME}-content/img/${dC.rationaleUrl}`;
    const ratingUrl = `resource://${this.STUDY_NAME}-content/img/${dC.ratingUrl}`;
    const heroUrl = `resource://${this.STUDY_NAME}-content/img/${pC.heroUrl}`;

    return (
      <div className="Panel" onLoad={ this.handleLoad.bind(this) }>
        <section className="section-middle">
          <img className="hero" src={ heroUrl } alt={ pC.heroAltText } />
          <div>
            <p className="summary">{ dC.summary }
              <a
                href={ dC.learnMoreUrl }
                onClick={ () => {
                  this.setState({ learnMoreLinkClicked: true });
                  console.log("self.port.emit('FocusedCFR::openUrl')", `url: ${dC.learnMoreUrl}` );
                }}
              >
                { dC.learnMore }
              </a>
            </p>
          {/*TODO bdanforth: make a ratings component/widget ? */}
            <img className="rating" src={ ratingUrl } alt={ dC.ratingAltText } />
            <p className="users">{ pC.userCount }</p>
          </div>
        </section>
      </div>
    );
  }
}

window.addCustomContent = function(recipeJSON) {
  this.recipe = JSON.parse(recipeJSON);
  this.dC = this.recipe.presentation.defaultComponent;
  this.pC = this.recipe.presentation.panelComponent;
  ReactDOM.render(
    React.createElement(Panel),
    document.getElementById("panel"),
  );
}
