import React, { Component } from 'react';
import './Panel.css';
import { cfrRecipe } from './cfrRecipe.js';

const dC = cfrRecipe.presentation.defaultComponent;
const pC = cfrRecipe.presentation.panelComponent;

class Panel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpen: false,
    }
  }

  addDropdownItems() {
    const listItems = [];
    for (let i = 0; i < pC.dropdownOptions.length; i++) {
      listItems.push(
        <li
          key={ pC.dropdownOptions[i].id }
          className="dropdown-item">{ pC.dropdownOptions[i].label }
        </li>
      );
    }
    return listItems.length ? listItems : null;
  }

  render() {
    // convert relative to absolute URL for images
    const iconUrl = require(`${ dC.iconUrl }`);
    const rationaleUrl = require(`${ dC.rationaleIconUrl }`);
    const ratingUrl = require(`${ dC.ratingUrl }`);
    const dropdownItems = this.addDropdownItems();

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
              <img className="rating" src={ ratingUrl } alt={ dC.ratingAltText } />
              <p className="users">{ pC.userCount }</p>
            </div>
          </section>
        </div>
        <section className="section-bottom">
          <div className="secondary-button-wrapper">
            <button id="secondary-button" className="button secondary-button">{ pC.declineAction }</button>
            {/*You cannot have a <ul> element (i.e. block element) nested inside a <button> (i.e. inline element)*/}
            <div
              id="secondary-button-show-dropdown"
              className={ dropdownItems ? "button" : "button hidden" }
              onClick={ () => {
                this.setState({ dropdownOpen: !this.state.dropdownOpen })
              }}
            >
              <ul
                id="dropdown-menu"
                className={ (this.state.dropdownOpen && dropdownItems) ? "dropdown" : "dropdown hidden" }
              >
                { dropdownItems }
              </ul>
            </div>
          </div>
          <button className="button primary-button">{ dC.action }</button>
        </section>
      </div>
    );
  }
}

export default Panel;
