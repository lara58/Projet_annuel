import React, { useRef, useState, useCallback } from 'react';
import { Stage, Layer, Line } from 'react-konva';

const DrawingCanvas = ({ onSave }) => {
  const stageRef = useRef(null);
  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleMouseDown = useCallback((e) => {
    setIsDrawing(true);
    const pos = stageRef.current.getPointerPosition();
    if (pos) {
      setLines((prevLines) => [...prevLines, { points: [pos.x, pos.y] }]);
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDrawing) return;
    const stage = stageRef.current;
    const point = stage.getPointerPosition();
    if (point) {
      setLines((prevLines) => {
        const lastLine = prevLines[prevLines.length - 1];
        const updatedLine = {
          ...lastLine,
          points: lastLine.points.concat([point.x, point.y]),
        };
        return [...prevLines.slice(0, -1), updatedLine];
      });
    }
  }, [isDrawing]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    const stage = stageRef.current;
    const dataURL = stage.toDataURL({ pixelRatio: 3 });
    onSave(dataURL);
  }, [onSave]);

  const clearCanvas = useCallback(() => {
    setLines([]);
  }, []);

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