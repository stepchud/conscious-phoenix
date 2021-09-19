import React, { useState } from 'react'
import { times } from 'lodash'

const Note = ({
  type,
  noteId,
  chips=0,
  astral=false,
  mental=false,
}) => (
  <div id={noteId} className={`note ${type}`}>
    <div className={`astral ${astral ? 'piece' : ''}`}>
      <div className={`mental ${mental ? 'piece' : ''}`}>
        { times(chips, (i) => <span key={i} className="chip"></span>) }
      </div>
    </div>
  </div>
)

const FoodOctave = ({
  food,
  alive,
  astral,
  mental,
}) => {
  const foodChips = food[8]
  return (
    <>
      { food.slice(0,-1).map((note, i) =>
        <Note key={`food-${i}`}
          type="food"
          noteId={`food-note-${i}`}
          chips={note}
          astral={alive && astral && (foodChips > i)}
          mental={alive && mental && (foodChips > 8 + i)}
        />
      ) }
      { alive && !astral && (foodChips > 0) && times(foodChips, (i) =>
        <Note key={i} noteId={`food-chip-${i}`} type="spacer" astral={true} />
      ) }
      { alive && !mental && (foodChips > 8) && times((foodChips - 8), (i) =>
        <Note key={i} noteId={`food-chip-${i}`} type="spacer" mental={true} />
      ) }
      { !alive && !mental && (foodChips > 0) && times(foodChips, (i) =>
        <Note key={i} noteId={`food-chip-${i}`} type="spacer" mental={true} />
      ) }
    </>
  )
}

const AirOctave = ({
  air,
  alive,
  astral,
  mental,
}) => {
  const airChips = air[6]
  return (
    <>
      { air.slice(0,-1).map((note, i) =>
        <Note key={i}
          type="air"
          noteId={`air-note-${i}`}
          chips={note}
          astral={alive && astral && (airChips > i)}
          mental={alive && mental && (airChips > 6 + i)}
        />
      ) }
      { alive && !astral && (airChips > 0) && times(airChips, (i) =>
        <Note key={i} noteId={`air-chip-${i}`} type="spacer" astral={true} />
      ) }
      { alive && !mental && (airChips > 6) && times((airChips - 6), (i) =>
        <Note key={i} noteId={`air-chip-${i}`} type="spacer" mental={true} />
      ) }
      { !alive && !mental && (airChips > 0) && times(airChips, (i) =>
        <Note key={i} noteId={`air-chip-${i}`} type="spacer" mental={true} />
      ) }
    </>
  )
}

const ImpressionOctave = ({
  impressions,
  alive,
  astral,
  mental,
}) => {
  const impChips = impressions[4]
  return (
    <>
      { impressions.slice(0,-1).map((note, i) =>
        <Note key={i}
          type="impression"
          noteId={`imp-note-${i}`}
          chips={note}
          astral={alive && astral && (impChips > i)}
          mental={alive && mental && (impChips > 4 + i)}
        />
      ) }
      { alive && !astral && (impChips > 0) && times(impChips, (i) =>
        <Note key={i} noteId={`imp-chip-${i}`} type="spacer" astral={true} />
      ) }
      { alive && !mental && (impChips > 4) && times((impChips - 4), (i) =>
        <Note key={i} noteId={`imp-chip-${i}`} type="spacer" mental={true} />
      ) }
      { !alive && !mental && (impChips > 0) && times(impChips, (i) =>
        <Note key={i} noteId={`imp-chip-${i}`} type="spacer" mental={true} />
      ) }
    </>
  )
}

const FoodDiagram = ({
  current,
}) => {
  // collapsible
  const [ expanded, setExpanded ] = useState(false)
  const onToggle = () => setExpanded(!expanded)
  const cnBtn = expanded ? 'collapsible btn active' : 'collapsible btn'
  const cnContent = expanded ? 'collapsible content active' : 'collapsible content'

  const { astral, mental } = current
  let bodyLabel
  if (mental) {
    bodyLabel = ' - Mental Body'
  } else if (astral) {
    bodyLabel = ' - Astral Body'
  }

  return (
    <div className="fd">
      <button className={cnBtn} onClick={onToggle}>Food{bodyLabel}</button>
      <div className={cnContent}>
        <FoodOctave {...current} />
        <AirOctave {...current} />
        <ImpressionOctave {...current} />
      </div>
    </div>
  )
}
export default FoodDiagram
