export const cfrRecipe = {
  triggers:  {
    // what user behaviors trigger the UI presentation
  },
  presentation: {
    defaultComponent: {
      // what do all major UI elements, sidebar, notification bar, doorhanger use
      icon: './addons.png',
      header: '',
      summary: '',
      action: '', // affirmative, primary action                
      learnMore: '', // intermediate action, not completely affirmative
      rationale: '', // why am I seeing this? ??
      rating: ''
  },
    panelComponent: {
      declineAction: '',
      userCount: '',
      hero: ''
    },
  },
};