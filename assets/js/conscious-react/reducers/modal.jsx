import { noop } from '../constants'

const InitialState = {
  show: false,
  setup_step: 'new',
}

const schoolMessage = (school) => {
  const pre = 'After some time, with the help of magnetic center, a man may find a school. '
  switch(school) {
    case 'Fakir':
      return pre + "You're a great Fakir."
    case 'Yogi':
      return pre + "You've got to be Yogi-ing."
    case 'Monk':
      return pre + "You're all Monk-y business."
    case 'Sly':
      return pre + "You even got a 'Sly' grin."
    case 'Balanced':
      return pre + "Part of a well-balanced life."
  }
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
    case 'FOUND_SCHOOL':
      return {
        show: true,
        title: 'Found School',
        body: schoolMessage(action.school_type),
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
