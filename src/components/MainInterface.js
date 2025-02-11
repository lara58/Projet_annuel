import React, { useState } from "react";
import axios from "axios";
import DrawingCanvas from "./DrawingCanvas";
import PredictionResult from "./PredictionResult";

const MainInterface = () => {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(false);

  // Fonction pour gérer la sauvegarde et l'envoi de l'image
  const handleSave = (dataURL) => {
    setError(false);
    axios
      .post("http://localhost:8000/api/predict/", { image: dataURL })
      .then((response) => {
        setPrediction(response.data.digit);
      })
      .catch((err) => {
        console.error("Erreur de prédiction:", err);
        setError(true);
      });
  };

  return (
    <div>
      <DrawingCanvas onSave={handleSave} />
      <PredictionResult prediction={prediction} error={error} />
    </div>
  );
};

export default MainInterface;
