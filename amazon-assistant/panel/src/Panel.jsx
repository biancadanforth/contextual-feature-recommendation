import React from 'react';
import './css/Panel.css';
import cfrRecipe from './cfrRecipe.js';
import Button from './components/Button.jsx';
import ButtonWithDropdown from './components/ButtonWithDropdown.jsx';

const dC = cfrRecipe.presentation.defaultComponent;
const pC = cfrRecipe.presentation.panelComponent;

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
  }

  render() {
    // convert relative to absolute URL for images
    const iconUrl = require.context("./img")(`${ dC.iconUrl }`);
    const rationaleUrl = require.context("./img")(`${ dC.rationaleIconUrl }`);
    const ratingUrl = require.context("./img")(`${ dC.ratingUrl }`);

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
        <section className="section-bottom">
          <ButtonWithDropdown
            label= { pC.declineAction }
            dropdownOptions= { pC.dropdownOptions }
            buttonClicked= { () => {
              this.setState({ declineButtonClicked: true });
              console.log("self.port.emit('FocusedCFR::dismiss')");
            }}
            dropdownItemClicked= { (key) => {
              this.setState({ dropdownItemClicked: true });
              console.log("self.port.emit('FocusedCFR::close')", `id: ${key}`);
            }}
          />
          <Button
            label= { dC.action }
            buttonClicked= { () => {
              this.setState({ actionButtonClicked: true });
              console.log("self.port.emit('FocusedCFR::action')");
            }}
          />
        </section>
      </div>
    );
  }
}

export default Panel;
