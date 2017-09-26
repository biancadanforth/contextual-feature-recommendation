import React, { Component } from 'react';
import './Panel.css';
import { cfrRecipe } from './cfrRecipe.js';

const recipe = cfrRecipe.presentation.defaultComponent;

class Panel extends Component {

  render() {
    // convert relative to absolute URL for images
    const iconUrl = require(`${recipe.iconUrl}`);
    const rationaleUrl = require(`${recipe.rationaleUrl}`);
    return (
      <div className="Panel">
        <section>
          <img className="icon" src={ iconUrl } alt={ recipe.iconAltText } />
          <p>{ recipe.header }</p>
          <img className="rationale" src={ rationaleUrl } alt="Rationale" />
        </section>
        <section>
        </section>
        <section>
        </section>
      </div>
    );
  }
}

export default Panel;
