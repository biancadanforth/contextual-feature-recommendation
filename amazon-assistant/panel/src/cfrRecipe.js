export const cfrRecipe = {
  triggers:  {
    // what user behaviors trigger the UI presentation
  },
  presentation: {
    defaultComponent: {
      // what do all major UI elements, sidebar, notification bar, doorhanger use
      iconUrl: './extensions-16.svg',
      iconAltText: 'Addons logo',
      header: 'You might like the Amazon Assistant extension since you visit this site frequently.',
      summary: 'Instant product matches while you shop across the web.',
      action: 'Add to Firefox', // affirmative, primary action
      actionUrl: '',                
      learnMore: 'Learn more', // intermediate action, not completely affirmative
      learnMoreUrl: '',
      rationaleIconUrl: './question-mark.svg',
      rationale: 'This is a sponsored suggestion. You are seeing this because you visit Amazon.com frequently.', // why am I seeing this? ??
      rating: '4', // # of stars, how do we include this widget ultimately?
      ratingUrl: './fourStars.png',
      ratingAltText: 'Addon rating'
  },
    panelComponent: {
      declineAction: 'Not Now',
      userCount: '398,277 users',
      heroUrl: 'https://addons.cdn.mozilla.net/user-media/addon_icons/337/337359-64.png?modified=1507252821',
      heroAltText: 'Amazon Assistant',
    },
  },
};