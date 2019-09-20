import React from 'react'

const LogLine = ({
  line=''
}) =>
 <div>{line}</div>
const Log = ({
  log
}) =>
  <div className='event-log'>
    { log.slice(-3).map((event, i) => <LogLine key={i} line={event} />) }
  </div>

export default Log
