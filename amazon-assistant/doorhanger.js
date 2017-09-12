const doorhanger = {

  init() {
    this.addListeners();
  },

  addListeners() {
    window.addEventListener('load', () => {
      this.createDoorhanger();
      this.closeIconEle.addEventListener('click', () => {
        this.closeDoorhanger();
      });
      this.secondaryButtonShowDropdownEle.addEventListener('click', () => {
        this.toggleDropdownMenu();
      });
    });
  },

  createDoorhanger() {
    this.getElements();
    this.addDropdownMenuElements();
    this.addContent();
  },

  closeDoorhanger() {
    this.doorhangerEle.classList.add('hidden');
  },

  toggleDropdownMenu() {
    this.dropdownMenuEle.classList.toggle('hidden');
  },

  getElements() {
    this.doorhangerEle = document.getElementById('doorhanger');
    this.iconEle = document.getElementById('icon');
    this.ratingLeftEle = document.getElementById('rating-left');
    this.messageEle = document.getElementById('message');
    this.linkMiddleEle = document.getElementById('link-middle');
    this.ratingMiddleEle = document.getElementById('rating-middle');
    this.primaryButtonEle = document.getElementById('primary-button');
    this.secondaryButtonEle = document.getElementById('secondary-button');
    this.secondaryButtonShowDropdownEle = document.getElementById('secondary-button-show-dropdown');
    this.dropdownMenuEle = document.getElementById('dropdown-menu');
    this.checkboxEle = document.getElementById('checkbox');
    this.ratingRightEle = document.getElementById('rating-right');
    this.additionalInfoEle = document.getElementById('additional-info');
    this.checkboxLabelEle = document.getElementById('checkbox-label');
    this.closeIconEle = document.getElementById('close-icon');
    this.linkRightEle = document.getElementById('link-right');
  },

  addDropdownMenuElements() {
    recipe.doorhanger.secondaryButton.dropdownOptions.forEach((item) => {
      const menuItem = document.createElement('li');
      menuItem.setAttribute('id', item.id);
      menuItem.classList.add('dropdown-item');
      this.dropdownMenuEle.appendChild(menuItem);
    });
  },

  addContent() {
    if (recipe.doorhanger.icon.url) {
      this.addImageContent();
    } else {
      this.iconEle.style.display = 'none';
    }

    if (recipe.doorhanger.starRating.url) {
      switch (recipe.doorhanger.starRating.location) {
        case 'left':
          this.addRatingLeftContent();
          break;
        case 'middle':
          this.addRatingMiddleContent();
          break;
        case 'right':
          this.addRatingRightContent();
          break;
        default:
          this.addRatingLeftContent();
          break;
      }
    } else {
      this.ratingLeftEle.style.display = 'none';
      this.ratingMiddleEle.style.display = 'none';
      this.ratingRightEle.style.display = 'none';
    }
    if (recipe.doorhanger.primaryButton.color) {
      this.primaryButtonEle.style.backgroundColor = recipe.doorhanger.primaryButton.color;
    }
    // TODO: pass icon url from recipe to CSS
    if (recipe.doorhanger.primaryButton.icon.url) {
      this.primaryButtonEle.classList.add("show-icon");
    } else {
      this.primaryButtonEle.classList.remove("show-icon");
    }
    if (recipe.doorhanger.primaryButton.label) {
      this.addPrimaryButtonContent();
    } else {
      this.primaryButtonEle.style.display = 'none';
    }
    if (recipe.doorhanger.secondaryButton.label) {
      this.addSecondaryButtonContent();
    } else {
      this.secondaryButtonEle.style.display = 'none';
      this.secondaryButtonShowDropdownEle.style.display = 'none';
    }
    if (recipe.doorhanger.message.text) {
      this.addMessageContent();
    } else {
      this.messageEle.style.display ='none';
    }
    if (recipe.doorhanger.link.text) {
      switch (recipe.doorhanger.link.location) {
        case 'middle':
          this.addLinkMiddleContent();
          break;
        case 'right':
          this.addLinkRightContent();
          break;
        default:
          // invalid value passed, defaulting to middle
          this.addLinkMiddleContent();
          break;
      }
    } else {
      this.linkMiddleEle.style.display = 'none';
      this.linkRightEle.style.display = 'none';
    }
    if (recipe.doorhanger.secondaryButton.dropdownOptions) {
      this.addDropdownMenuContent();
    } else {
      this.dropdownMenuEle.style.display = 'none';
    }
    if (recipe.doorhanger.checkbox.label) {
      this.addCheckboxContent();
    } else {
      this.checkboxEle.style.display = 'none';
      this.checkboxLabelEle.style.display = 'none';
    }
  },

  addImageContent() {
    this.iconEle.src = recipe.doorhanger.icon.url;
    this.iconEle.alt = recipe.doorhanger.icon.alt;
  },

  addRatingLeftContent() {
    this.ratingLeftEle.src = recipe.doorhanger.starRating.url;
  },

  addPrimaryButtonContent() {
    this.primaryButtonEle.textContent = recipe.doorhanger.primaryButton.label;
  },

  addSecondaryButtonContent() {
    this.secondaryButtonEle.textContent = recipe.doorhanger.secondaryButton.label;
  },

  addMessageContent() {
    if (recipe.doorhanger.message.link.text) {
      const messageParts = recipe.doorhanger.message.text.split(recipe.doorhanger.message.link.text);
      this.messageEle.innerHTML = `${messageParts[0]} <a href="${recipe.doorhanger.message.link.url}">${recipe.doorhanger.message.link.text}</a> ${messageParts[1]}`;
    } else {
      this.messageEle.textContent = recipe.doorhanger.message.text;
    }
  },

  addRatingMiddleContent() {
    this.ratingMiddleEle.src = recipe.doorhanger.starRating.url;
  },

  addLinkMiddleContent() {
    this.linkMiddleEle.textContent = recipe.doorhanger.link.text;
    this.linkMiddleEle.href = recipe.doorhanger.link.url;
  },

  addDropdownMenuContent() {
    const numDropdownMenuItems = recipe.doorhanger.secondaryButton.dropdownOptions.length;
    const dropdownMenuItemEles = this.dropdownMenuEle.children;
    for (let i = 0; i < numDropdownMenuItems; i++) {
      dropdownMenuItemEles[i].textContent = recipe.doorhanger.secondaryButton.dropdownOptions[i].label;
    }
  },

  addRatingRightContent() {
    this.ratingRightEle.src = recipe.doorhanger.starRating.url;
  },

  addCheckboxContent() {
    this.checkboxLabelEle.textContent = recipe.doorhanger.checkbox.label;
  },

  addLinkRightContent() {
    this.linkRightEle.textContent = recipe.doorhanger.link.text;
    this.linkRightEle.href = recipe.doorhanger.link.url;
  }
};

doorhanger.init();