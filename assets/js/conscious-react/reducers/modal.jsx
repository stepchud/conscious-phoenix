const InitialState = {
  show: false,
}

const noop = () => { }
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
        onClick: nnop,
      }
    case 'ATTAIN_STEWARD':
      return {
        show: true,
        title: 'April Fools!',
        body: 'You have attained Steward.',
        onClick: nnop,
      }
    case 'ATTAIN_MASTER':
      return {
        show: true,
        title: 'Impartiality!',
        body: 'You have attained Master',
        onClick: nnop,
      }
    case 'MENTAL_BODY':
      return {
        show: true,
        title: 'Mental Body',
        body: 'I am Immortal within the limits of the Sun'
        onClick: nnop,
      }
    case 'ASTRAL_BODY':
      return {
        show: true,
        title: "Astral Body",
        body: 'I have crystallized the body Kesdjan'
        onClick: nnop,
      }
    default:
      return state
  }
}

export default modal
