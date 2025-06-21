import React from 'react';

function Track({ track, onAdd, isRemoval, onRemove }) {
//Handle on Add
  function handleAdd() {
  onAdd(track);
}
//Handle Remove
function handleRemove() {
  onRemove(track);
}

  return (
    <div>
      <h3>{track.name}</h3>
      <p>{track.artist} | {track.album}</p>
      <button onClick={isRemoval ? handleRemove : handleAdd}>
  {isRemoval ? "-" : "+"}
</button>
      
    </div>
  );
}

export default Track;
