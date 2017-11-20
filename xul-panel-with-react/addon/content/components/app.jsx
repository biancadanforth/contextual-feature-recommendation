/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Syntax to include other React components in future
// import Cats from "./cats.jsx";

"use strict";

/* global React ReactDOM */

class Panel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      learnMoreLinkClicked: false,
    };
    this.STUDY_NAME = "custom-popup-example-addon";
  }

  // get width and height of panel after it's loaded
  // (note: render occurs BEFORE load); dims are not final until load
  handleLoad() {
    const dimensions = this.getPanelDimensions();
    sendMessageToChrome(
      "FocusedCFR::browserResize",
      JSON.stringify(dimensions)
    );
  }

  getPanelDimensions() {
    const panel = ReactDOM.findDOMNode(this);
    // get the DOMRect object of panel element, not JSON-able
    const dimensions = panel.getBoundingClientRect();
    return { width: dimensions.width, height: dimensions.height };
  }

  render() {
    // Convert relative to absolute URL for images
    const urlPrefix = `resource://${this.STUDY_NAME}-content/img/`;
    const iconUrl = `${urlPrefix}${dC.iconUrl}`;
    const rationaleUrl = `${urlPrefix}${dC.rationaleIconUrl}`;
    const ratingUrl = `${urlPrefix}${dC.ratingUrl}`;
    const heroUrl = `${urlPrefix}${pC.heroUrl}`;

    // Bold the text to emphasize in the Header
    const header = dC.header;
    const headerEmphasis = dC.headerEmphasis;
    const headerComponents = header.split(headerEmphasis);

    return (
      <div className="Panel" onLoad={ this.handleLoad.bind(this) }>
        <section className="section-top">
          <img
            className="icon"
            src={ iconUrl }
            alt={ dC.iconAltText }
          />
          {/* Header */}
          <p>
            {headerComponents[0]}
            <strong>
              {headerEmphasis}
            </strong>
            {headerComponents[1]}
          </p>
          <img 
            className="rationale"
            src={ rationaleUrl }
            alt="Rationale"
          />
        </section>
        <section className="section-middle">
          <img
            className="hero"
            src={ heroUrl }
            alt={ pC.heroAltText }
          />
          <div>
            <p className="summary">{ dC.summary }
              <a
                target="_blank"
                href={ dC.learnMoreUrl }
                onClick={ () => {
                  this.setState({ learnMoreLinkClicked: true });
                  sendMessageToChrome(
                    "FocusedCFR::openUrl",
                    dC.learnMoreUrl
                  );
                }}
              >
                { dC.learnMore }
              </a>
            </p>
            <img
              className="rating"
              src={ ratingUrl }
              alt={ dC.ratingAltText }
            />
            <p className="users">{ pC.userCount }</p>
          </div>
        </section>
      </div>
    );
  }
}

// Have to explicitly attach this function to 'window',
// since webpack bundles and wraps all scripts in an IIFE
window.addCustomContent = function(recommendationConfigJSON) {
  this.recommendationConfig = JSON.parse(recommendationConfigJSON);
  this.dC = this.recommendationConfig.presentation.defaultComponent;
  this.pC = this.recommendationConfig.presentation.panelComponent;
  ReactDOM.render(
    React.createElement(Panel),
    document.getElementById("panel"),
  );
}
