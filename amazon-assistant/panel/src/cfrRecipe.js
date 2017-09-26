export const cfrRecipe = {
  triggers:  {
    // what user behaviors trigger the UI presentation
  },
  presentation: {
    defaultComponent: {
      // what do all major UI elements, sidebar, notification bar, doorhanger use
      iconUrl: './addons.png',
      iconAltText: 'Addons logo',
      header: 'You might like the Amazon Assistant extension since you visit this site frequently.',
      summary: 'Instant product matches while you shop across the web.',
      action: 'Add to Firefox', // affirmative, primary action                
      learnMore: 'Learn more', // intermediate action, not completely affirmative
      rationaleUrl: './question-mark.svg',
      rationale: 'This is a sponsored suggestion. You are seeing this because you visit Amazon.com frequently.', // why am I seeing this? ??
      rating: '4' // # of stars, how do we include this widget ultimately?
  },
    panelComponent: {
      declineAction: 'Not Now',
      userCount: '398,277 users',
      hero: 'https://mobileapkworld.com/wp-content/uploads/2017/05/com.amazon.aa.png'
    },
  },
};