import React from 'react'
import { times } from 'lodash'

const Note = ({
  type,
  chips=0,
  astral=false,
  mental=false,
}) => (
  <div className={`mental ${mental ? 'piece' : ''}`}>
    <div className={`astral ${astral ? 'piece' : ''}`}>
      <div className={`note ${type}`}>
        { times(chips, (i) => <span key={i} className="chip"></span>) }
      </div>
    </div>
  </div>
)

const FoodDiagram = ({
  current,
  enter
}) => {
  let bodyType
  const foodChips = current.food[8]
  const airChips = current.air[6]
  const impChips = current.impressions[4]
  if (current.mental) {
    bodyType = <h3>MENTAL</h3>
  } else if (current.astral) {
    bodyType = <h3>ASTRAL</h3>
  } else {
  }
  return (
    <div className="section fd">
      <h3>Food</h3>
      {bodyType}
      { current.food.slice(0,-1).map((note, i) =>
          <Note key={i}
            type="food"
            chips={note}
            astral={current.astral && (foodChips > i)}
            mental={current.mental && (foodChips > 8 + i)} />
      ) }
      { !current.astral && (foodChips > 0) && times(foodChips, (i) =>
        <Note key={i} type="spacer" astral={true} />
      ) }
      { !current.mental && (foodChips > 8) && times((foodChips - 8), (i) =>
        <Note key={i} type="spacer" mental={true} />
      ) }
      <br />
      { times(2, (i) => <Note key={i} type="spacer" />) }
      { current.air.slice(0,-1).map((note, i) =>
          <Note key={i}
            type="air"
            chips={note}
            astral={current.astral && (airChips > i)}
            mental={current.mental && (airChips > 6 + i)} />
      ) }
      { !current.astral && (airChips > 0) && times(airChips, (i) =>
        <Note key={i} type="spacer" astral={true} />
      ) }
      { !current.mental && (airChips > 6) && times((airChips - 6), (i) =>
        <Note key={i} type="spacer" mental={true} />
      ) }
      <br />
      { times(4, (i) => <Note key={i} type="spacer" />) }
      { current.impressions.slice(0,-1).map((note, i) =>
          <Note key={i}
            type="impression"
            chips={note}
            astral={current.astral && (impChips > i)}
            mental={current.mental && (impChips > 4 + i)} />
      ) }
      { !current.astral && (impChips > 0) && times(impChips, (i) =>
        <Note key={i} type="spacer" astral={true} />
      ) }
      { !current.mental && (impChips > 4) && times((impChips - 4), (i) =>
        <Note key={i} type="spacer" mental={true} />
      ) }
    </div>
  )
}
export default FoodDiagram
