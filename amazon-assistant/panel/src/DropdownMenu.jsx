import React from 'react';
import './css/DropdownMenu.css';
import DropdownMenu from './DropdownMenu.jsx';

class ButtonWithDropdown extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    return (
      <ul
        id="dropdown-menu"
        className={ (this.props.dropdownOpen && this.props.dropdownItems) ? "dropdown" : "dropdown hidden" }
      >
        { this.props.dropdownItems }
      </ul>
    );
  }
}

export default ButtonWithDropdown;
