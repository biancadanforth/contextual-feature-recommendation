const notificationBar = {

  init() {
    this.addListeners();
  },

  addListeners() {
    window.addEventListener('load', () => {
      this.createNotificationBar();
      this.closeIconEle.addEventListener('click', () => {
        this.closeNotificationBar();
      });
      this.buttonShowDropdownMenuEle.addEventListener('click', () => {
        this.toggleDropdownMenu();
      });
    });
  },

  createNotificationBar() {
    this.getElements();
    this.addDropdownMenuElements();
    this.addContent();
  },

  closeNotificationBar() {
    this.notificationBarEle.classList.add('hidden');
  },

  toggleDropdownMenu() {
    this.dropdownMenuEle.classList.toggle('hidden');
  },

  getElements() {
    this.notificationBarEle = document.getElementById('notification-bar');
    this.imgEle = document.getElementById('icon');
    this.messageEle = document.getElementById('message');
    this.linkEle = document.getElementById('link');
    this.buttonAcceptEle = document.getElementById('button-accept');
    this.buttonRejectEle = document.getElementById('button-reject');
    this.buttonShowDropdownMenuEle = document.getElementById('button-show-dropdown-menu');
    this.dropdownMenuEle = document.getElementById('dropdown-menu');
    this.closeIconEle = document.getElementById('close-icon');
  },

  addDropdownMenuElements() {
    recipe.dropdownItemLabels.forEach(() => {
      const menuItem = document.createElement('li');
      menuItem.classList.add('dropdown-item');
      this.dropdownMenuEle.appendChild(menuItem);
    });
  },

  addContent() {
    this.addImageContent();
    this.addButtonContent();
    this.addMessageContent();
    this.addLinkContent();
    this.addDropdownMenuContent();
  },

  addImageContent() {
    this.imgEle.src = recipe.imgUrl;
    this.imgEle.alt = recipe.imgAltText;
  },

  addButtonContent() {
    this.buttonAcceptEle.textContent = recipe.buttonAcceptLabel;
    this.buttonRejectEle.textContent = recipe.buttonRejectLabel;
  },

  addMessageContent() {
    this.messageEle.textContent = recipe.message;
  },

  addLinkContent() {
    this.linkEle.textContent = recipe.linkText;
    this.linkEle.href = recipe.linkUrl;
  },

  addDropdownMenuContent() {
    const numDropdownMenuItems = recipe.dropdownItemLabels.length;
    const dropdownMenuItemEles = this.dropdownMenuEle.children;
    for (let i = 0; i < numDropdownMenuItems; i++) {
      dropdownMenuItemEles[i].textContent = recipe.dropdownItemLabels[i];
    }
  }
};

notificationBar.init();