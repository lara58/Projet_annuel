import React, { useRef, useState } from 'react';
import { Stage, Layer, Line } from 'react-konva';

const DrawingCanvas = ({ onSave }) => {
  const stageRef = useRef(null);
  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const pos = stageRef.current.getPointerPosition();
    setLines([...lines, { points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const stage = stageRef.current;
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    const stage = stageRef.current;
    const dataURL = stage.toDataURL({ pixelRatio: 3 });
    onSave(dataURL);
  };

  const clearCanvas = () => {
    setLines([]);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Dessinez un chiffre</h2>
      <Stage
        width={280}
        height={280}
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ border: '1px solid black' }}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke="black"
              strokeWidth={10}
              lineCap="round"
              lineJoin="round"
            />
          ))}
        </Layer>
      </Stage>
      <div style={{ marginTop: 10 }}>
        <button onClick={clearCanvas}>Effacer</button>
        <button onClick={handleMouseUp} style={{ marginLeft: 10 }}>
          Envoyer
        </button>
      </div>
    </div>
  );
};

export default DrawingCanvas;