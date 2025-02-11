import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import * as tf from '@tensorflow/tfjs';

const DrawingCanvas = () => {
  const stageRef = useRef(null);
  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [captchaDigit, setCaptchaDigit] = useState(Math.floor(Math.random() * 10));
  const [prediction, setPrediction] = useState(null);
  const [isAccessGranted, setIsAccessGranted] = useState(false);
  const [model, setModel] = useState(null);

  useEffect(() => {
    const loadModel = async () => {
      const mnistModel = await tf.loadLayersModel('https://tfhub.dev/google/tfjs-model/mnist/1/default/1');
      setModel(mnistModel);
    };
    loadModel();
  }, []);

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

  const handleMouseUp = useCallback(async () => {
    setIsDrawing(false);
    const stage = stageRef.current;
    const dataURL = stage.toDataURL({ pixelRatio: 3 });
    const prediction = await predictDigit(dataURL);
    setPrediction(prediction);
    if (prediction === captchaDigit) {
      setIsAccessGranted(true);
      alert("Captcha réussi !");
    } else {
      alert("Erreur, veuillez réessayer.");
      setCaptchaDigit(Math.floor(Math.random() * 10));
      setPrediction(null);
    }
  }, [captchaDigit, model]);

  const clearCanvas = useCallback(() => {
    setLines([]);
    setPrediction(null);
  }, []);

  const predictDigit = async (dataURL) => {
    if (!model) return null;

    const img = new Image();
    img.src = dataURL;
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const tensor = tf.browser.fromPixels(img, 1)
      .resizeNearestNeighbor([28, 28])
      .mean(2)
      .toFloat()
      .expandDims(0)
      .expandDims(-1)
      .div(255.0);

    const prediction = model.predict(tensor).argMax(1).dataSync()[0];
    return prediction;
  };

  return (
    <div>
      {!isAccessGranted ? (
        <div style={{ textAlign: "center" }}>
          <h2>Dessinez un chiffre: {captchaDigit}</h2>
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
          {prediction !== null && <p>Prédiction: {prediction}</p>}
        </div>
      ) : (
        <div>
          <h2>Accès autorisé !</h2>
          <p>Bienvenue sur la page protégée.</p>
          {prediction !== null && <p>Chiffre prédit: {prediction}</p>}
        </div>
      )}
    </div>
  );
};

export default DrawingCanvas;