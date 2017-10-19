import React from 'react';
import '../css/Button.css';

class Button extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  render() {
    /* TODO bdanforth: pass click event back up for telemetry */
    return (
      <button
        className="button primary-button"
        onClick={ () => this.props.buttonClicked() }
      >
        { this.props.label }
      </button>
    );
  }
}

export default Button;
