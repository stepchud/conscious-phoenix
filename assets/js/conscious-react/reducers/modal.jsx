const InitialState = {
  show: false,
}

const modal = (
  state = InitialState,
  action
) => {
  switch (action.type) {
    case 'SHOW_MODAL':
      return {
        show: true,
        ...action
      }
    case 'HIDE_MODAL':
      return {
        show: false
      }
    case 'UPDATE_MODAL':
      return {
        ...state,
        [action.field]: action.value
      }
    case 'UPDATE_GAME':
      return {
        ...action.game.modal
      }
    case 'FOUND_SCHOOL':
      return {
        show: true,
        title: 'Found School',
        body: 'After some time, with the help of magnetic center, a man may find a school.'
      }
    case 'ATTAIN_STEWARD':
      return {
        show: true,
        title: 'April Fools!',
        body: 'You have attained Steward.',
      }
    case 'ATTAIN_MASTER':
      return {
        show: true,
        title: 'Impartiality!',
        body: 'You have attained Master',
      }
    case 'MENTAL_BODY':
      return {
        show: true,
        title: 'Mental Body',
        body: 'I am Immortal within the limits of the Sun'
      }
    case 'ASTRAL_BODY':
      return {
        show: true,
        title: "Astral Body",
        body: 'I have crystallized the body Kesdjan'
      }
    default:
      return state
  }
}

export default modal
