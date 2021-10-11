import { toast } from 'react-toastify'

const toastLogEntry = (e) => e.toast && toast(e.entry)

const log = (
  state = [],
  action
) => {
  switch (action.type) {
    case 'LOG_EVENT':
      return [ action.event, ...state ]
    case 'JOIN_GAME':
      return [ ...action.state.log ]
    case 'UPDATE_GAME':
      // pop a toast for all new toast entries
      const new_entries = action.log.slice(state.length)
      new_entries.forEach(toastLogEntry)
      return [ ...action.log ]
    default: return state
  }
}

export default log
