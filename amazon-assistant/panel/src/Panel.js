import React, { Component } from 'react';
import './Panel.css';
import { cfrRecipe } from './cfrRecipe.js';

const recipe = cfrRecipe.presentation.defaultComponent;

class Panel extends Component {

  render() {
    const iconUrl = require(`${recipe.icon}`);
    return (
      <div className="Panel">
        <img src={iconUrl} alt="Addons logo" />
      </div>
    );
  }
}

export default Panel;
