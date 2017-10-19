import React, { Component } from 'react';
import '../css/Panel.css';
import { cfrRecipe } from '../cfrRecipe.js';
import Button from './Button.jsx';
import ButtonWithDropdown from './ButtonWithDropdown.jsx';

const dC = cfrRecipe.presentation.defaultComponent;
const pC = cfrRecipe.presentation.panelComponent;

class Panel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      actionButtonClicked: false,
      declineButtonClicked: false,
      dontShowAgainButtonClicked: false,
      learnMoreLinkClicked: false,
    };
  }

  render() {
    // convert relative to absolute URL for images
    const iconUrl = require(`${ dC.iconUrl }`);
    const rationaleUrl = require(`${ dC.rationaleIconUrl }`);
    const ratingUrl = require(`${ dC.ratingUrl }`);

    return (
      <div className="Panel">
        <div className="section-grid-wrapper">
          <section className="section-top">
            <img className="icon" src={ iconUrl } alt={ dC.iconAltText } />
            <p>{ dC.header }</p>
            <img 
              className="rationale"
              src={ rationaleUrl }
              alt="Rationale"
              title={ dC.rationale }
            />
            </section>
          <section className="section-middle">
            <img className="hero" src={ pC.heroUrl } alt={ pC.heroAltText } />
            <div>
              <p className="summary">{ dC.summary }
                <a href={ dC.learnMoreUrl } target="_blank">{ dC.learnMore }</a>
              </p>
            {/*TODO bdanforth: make a ratings component/widget ? */}
              <img className="rating" src={ ratingUrl } alt={ dC.ratingAltText } />
              <p className="users">{ pC.userCount }</p>
            </div>
          </section>
        </div>
        <section className="section-bottom">
          <ButtonWithDropdown label= { pC.declineAction } dropdownOptions= { pC.dropdownOptions } />
          <Button label= { dC.action } />
        </section>
      </div>
    );
  }
}

export default Panel;
