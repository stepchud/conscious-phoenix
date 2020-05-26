import { noop } from '../constants'

const InitialState = {
  show: false,
  setup_step: 'new',
}

const modal = (
  state = InitialState,
  action
) => {
  switch (action.type) {
    case 'SHOW_MODAL':
      return {
        ...action,
        show: true,
      }
    case 'HIDE_MODAL':
      return {
        ...state,
        show: false,
      }
    case 'UPDATE_MODAL':
      return {
        ...state,
        [action.field]: action.value,
      }
    case 'UPDATE_GAME':
      return {
        ...state,
        ...action.modal,
      }
    case 'FOUND_SCHOOL':
      return {
        show: true,
        title: 'Found School',
        body: 'After some time, with the help of magnetic center, a man may find a school.',
        onClick: noop,
      }
    case 'ATTAIN_STEWARD':
      return {
        show: true,
        title: 'April Fools!',
        body: 'You have attained Steward.',
        onClick: noop,
      }
    case 'ATTAIN_MASTER':
      return {
        show: true,
        title: 'Impartiality!',
        body: 'You have attained Master',
        onClick: noop,
      }
    case 'MENTAL_BODY':
      return {
        show: true,
        title: 'Mental Body',
        body: 'I am Immortal within the limits of the Sun',
        onClick: noop,
      }
    case 'ASTRAL_BODY':
      return {
        show: true,
        title: "Astral Body",
        body: 'I have crystallized the body Kesdjan',
        onClick: noop,
      }
    default:
      return state
  }
}

export default modal
