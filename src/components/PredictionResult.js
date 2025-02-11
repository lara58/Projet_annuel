import React from 'react';

const PredictionResult = ({ prediction, error }) => {
  return (
    <div>
      {error ? (
        <p style={{ color: 'red' }}>Erreur de prédiction</p>
      ) : (
        <h3>Chiffre prédit: {prediction}</h3>
      )}
    </div>
  );
};

export default PredictionResult;
