
// filepath: /C:/Users/narim/Documents/digit-recognition-app/front/src/components/DrawingCanvas.js
import React, { useRef, useState, useCallback } from 'react';
import { Stage, Layer, Line } from 'react-konva';

const DrawingCanvas = () => {
  const stageRef = useRef(null);
  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [probability, setProbability] = useState(null); // Ajout
  const [imageDataURL, setImageDataURL] = useState(null);

  const handleMouseDown = useCallback(() => {
    setIsDrawing(true);
    const pos = stageRef.current?.getPointerPosition();
    if (pos) {
      setLines((prevLines) => [
        ...prevLines,
        { points: [pos.x, pos.y] },
      ]);
    }
  }, []);

  const handleMouseMove = useCallback(() => {
    if (!isDrawing) return;
    const stage = stageRef.current;
    const point = stage?.getPointerPosition();
    if (point) {
      setLines((prevLines) => {
        const lastLine = prevLines[prevLines.length - 1];
        if (!lastLine) return prevLines;
        const updatedLine = {
          ...lastLine,
          points: [...lastLine.points, point.x, point.y],
        };
        return [...prevLines.slice(0, -1), updatedLine];
      });
    }
  }, [isDrawing]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const handleSend = useCallback(async () => {
    if (stageRef.current) {
      const dataURL = stageRef.current.toDataURL({ pixelRatio: 3 });
      setImageDataURL(dataURL);

      try {
        const response = await fetch('http://127.0.0.1:8000/api/predict/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image_base64: dataURL }),
        });

        if (!response.ok) {
          throw new Error(`Erreur réseau: ${response.status}`);
        }

        const data = await response.json();
        setPrediction(data.prediction);
        setProbability(data.probability); // Ajout

      } catch (err) {
        console.error("Erreur lors de l'appel à l'API Django:", err);
        alert("Erreur, veuillez réessayer.");
      }
    }
  }, []);

  const clearCanvas = useCallback(() => {
    setLines([]);
    setPrediction(null);
    setProbability(null); // Ajout
    setImageDataURL(null);
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <div>
        <h2>Accès autorisé !</h2>
        <p>Bienvenue sur la page protégée.</p>
        {prediction !== null && (
          <>
            <p>Chiffre prédit: {prediction}</p>
            <p>Probabilité: {probability}</p> {/* Ajout */}
          </>
        )}
      </div>
      <Stage
        width={280}
        height={280}
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ border: '1px solid black', backgroundColor: 'black' }}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke="white"
              strokeWidth={10}
              lineCap="round"
              lineJoin="round"
            />
          ))}
        </Layer>
      </Stage>

      <div style={{ marginTop: 10 }}>
        <button onClick={clearCanvas}>Effacer</button>
        <button onClick={handleSend} style={{ marginLeft: 10 }}>Envoyer</button>
      </div>

      {imageDataURL && (
        <div>
          <p style={{ color: 'white' }}>Image envoyée au serveur:</p>
          <img src={imageDataURL} alt="Chiffre dessiné" width="140" height="140" />
        </div>
      )}
    </div>
  );
};

export default DrawingCanvas;
