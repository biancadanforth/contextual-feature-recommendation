import React from 'react';
import './css/ButtonWithDropdown.css';
import DropdownMenu from './DropdownMenu.jsx';

class ButtonWithDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpen: false,
    }
  }

  addDropdownItems() {
    const listItems = [];
    for (let i = 0; i < this.props.dropdownOptions.length; i++) {
      listItems.push(
        <li
          key={ this.props.dropdownOptions[i].id }
          className="dropdown-item">{ this.props.dropdownOptions[i].label }
        </li>
      );
    }
    return listItems.length ? listItems : null;
  }

  render() {
    const dropdownItems = this.addDropdownItems();

    return (
      <div className="secondary-button-wrapper">
        <button id="secondary-button" className="button secondary-button">{ this.props.label }</button>
        {/* Note: You cannot have a <ul> element (i.e. block element) nested inside a <button> (i.e. inline element)*/}
        <div
          id="secondary-button-show-dropdown"
          className={ dropdownItems ? "button dropdown-icon-wrapper" : "button hidden dropdown-icon-wrapper" }
          onClick={ () => {
            this.setState({ dropdownOpen: !this.state.dropdownOpen })
            // TODO bdanforth: pass click event back up for telemetry
          }}
        >
          <DropdownMenu dropdownOpen={ this.state.dropdownOpen } dropdownItems={ dropdownItems } />
        </div>
      </div>
    );
  }
}

export default ButtonWithDropdown;
