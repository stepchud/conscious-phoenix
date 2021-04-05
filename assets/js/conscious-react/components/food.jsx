import React from 'react'
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
            astral={astral && (foodChips > i)}
            mental={mental && (foodChips > 8 + i)} />
      ) }
      { !astral && (foodChips > 0) && times(foodChips, (i) =>
        <Note key={i} noteId={`food-chip-${i}`} type="spacer" astral={true} />
      ) }
      { !mental && (foodChips > 8) && times((foodChips - 8), (i) =>
        <Note key={i} noteId={`food-chip-${i}`} type="spacer" mental={true} />
      ) }
    </>
  )
}

const AirOctave = ({
  air,
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
            astral={astral && (airChips > i)}
            mental={mental && (airChips > 6 + i)} />
      ) }
      { !astral && (airChips > 0) && times(airChips, (i) =>
        <Note key={i} noteId={`air-chip-${i}`} type="spacer" astral={true} />
      ) }
      { !mental && (airChips > 6) && times((airChips - 6), (i) =>
        <Note key={i} noteId={`air-chip-${i}`} type="spacer" mental={true} />
      ) }
    </>
  )
}

const ImpressionOctave = ({
  impressions,
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
            astral={astral && (impChips > i)}
            mental={mental && (impChips > 4 + i)} />
      ) }
      { !astral && (impChips > 0) && times(impChips, (i) =>
        <Note key={i} noteId={`imp-chip-${i}`} type="spacer" astral={true} />
      ) }
      { !mental && (impChips > 4) && times((impChips - 4), (i) =>
        <Note key={i} noteId={`imp-chip-${i}`} type="spacer" mental={true} />
      ) }
    </>
  )
}

const FoodDiagram = ({
  current,
}) => {
  const { food, air, impressions, astral, mental } = current
  let bodyLabel
  if (mental) {
    bodyLabel = ' - Mental Body'
  } else if (astral) {
    bodyLabel = ' - Astral Body'
  }

  return (
    <div className="section fd">
      <h3>Food{bodyLabel}</h3>
      <FoodOctave food={food} astral={astral} mental={mental} />
      <AirOctave air={air} astral={astral} mental={mental} />
      <ImpressionOctave impressions={impressions} astral={astral} mental={mental} />
    </div>
  )
}
export default FoodDiagram
