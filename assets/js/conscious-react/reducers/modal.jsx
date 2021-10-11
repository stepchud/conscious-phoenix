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

const schoolLogMessage = (school) => {
  switch(school) {
    case 'Fakir':
      return "Found a Fakir school."
    case 'Yogi':
      return "Found a Yogi school."
    case 'Monk':
      return "Found a Monk school."
    case 'Sly':
      return "Found a Sly school."
    case 'Balanced':
      return "Found a balanced school."
  }
}

const modal = (
  state = InitialState,
  action
) => {
  switch (action.type) {
    case 'SHOW_MODAL': {
      if (action.logEvent) {
        action.channel?.push('game:log_event', { pid: action.pid, event: action.logEvent })
      }
      return {
        ...action,
        show: true,
      }
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
    case 'FOUND_SCHOOL': {
      const message = schoolMessage(action.school_type)
      const event = schoolLogMessage(action.school_type)
      action.channel?.push('game:log_event', { pid: action.pid, event })
      return {
        show: true,
        title: 'Found School',
        body: message,
        onClick: noop,
      }
    }
    case 'ATTAIN_STEWARD': {
      const event = 'Attained Steward: April Fools'
      action.channel?.push('game:log_event', { pid: action.pid, event })
      return {
        show: true,
        title: 'April Fools!',
        body: 'You have attained Steward.',
        onClick: noop,
      }
    }
    case 'ATTAIN_MASTER': {
      const event = 'Attained Master: Impartiality'
      action.channel?.push('game:log_event', { pid: action.pid, event })
      return {
        show: true,
        title: 'Impartiality!',
        body: 'You have attained Master',
        onClick: noop,
      }
    }
    case 'MENTAL_BODY': {
      const event = 'Chrystallized a Mental Body'
      action.channel?.push('game:log_event', { pid: action.pid, event })
      return {
        show: true,
        title: 'Mental Body',
        body: 'I am Immortal within the limits of the Sun',
        onClick: noop,
      }
    }
    case 'ASTRAL_BODY': {
      const event = 'Chrystallized an Astral Body-kesdjan'
      action.channel?.push('game:log_event', { pid: action.pid, event })
      return {
        show: true,
        title: "Astral Body",
        body: 'I have crystallized the body Kesdjan',
        onClick: noop,
      }
    }
    case 'HASNAMUSS': {
      const event = 'Turned into a Hasnamuss, shameful'
      action.channel?.push('game:log_event', { pid: action.pid, event })
      return {
        show: true,
        title: "Hasnamuss!",
        body: 'Shame on you',
        onClick: noop,
      }
    }

    default:
      return state
  }
}

export default modal
