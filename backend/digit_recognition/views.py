
# filepath: /c:/Users/narim/Documents/digit-recognition-app/backend/digit_recognition/views.py
import base64
import io
import numpy as np
import pymongo
from datetime import datetime
from PIL import Image
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from digit_recognition.ml_model import predict_digit
import os
import scipy.ndimage
import cv2

@api_view(['POST'])
def predict_view(request):
    try:
        data = request.data
        img_base64 = data.get("image_base64")
        if not img_base64:
            return JsonResponse({"error": "Aucune image fournie"}, status=400)

        if ',' in img_base64:
            img_base64 = img_base64.split(',')[1]
        image_bytes = base64.b64decode(img_base64)

        pil_image = Image.open(io.BytesIO(image_bytes)).convert('L')
        pil_image = pil_image.resize((28, 28))
        img_array = np.array(pil_image)

        center_of_mass = scipy.ndimage.center_of_mass(img_array)
        shift_x = img_array.shape[1] / 2 - center_of_mass[1]
        shift_y = img_array.shape[0] / 2 - center_of_mass[0]
        translation_matrix = np.float32([[1, 0, shift_x], [0, 1, shift_y]])
        img_array = cv2.warpAffine(img_array, translation_matrix, (img_array.shape[1], img_array.shape[0]), borderMode=cv2.BORDER_CONSTANT, borderValue=(0))

        mean = np.mean(img_array)
        std = np.std(img_array)
        if std > 0:
            img_array = (img_array - mean) / std
        else:
            img_array = np.zeros_like(img_array)
            
        img_array = (img_array - np.min(img_array)) / (np.max(img_array) - np.min(img_array))   

        pil_image = Image.fromarray(np.uint8(img_array)).convert('L')

        img_array = img_array.reshape(1, 28, 28, 1)

        save_directory = "images"
        if not os.path.exists(save_directory):
            os.makedirs(save_directory)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"image_{timestamp}.png"
        filepath = os.path.join(save_directory, filename)

        pil_image.save(filepath)

        predicted_class, probability = predict_digit(img_array)

        client = pymongo.MongoClient("mongodb://localhost:27017/")
        db = client["mnist_db"]
        user_drawings = db["user_drawings"]
        record = {
            "image_base64": data["image_base64"],
            "predicted_class": predicted_class,
            "probability": probability,
            "timestamp": datetime.utcnow()
        }
        user_drawings.insert_one(record)

        return Response({"prediction": predicted_class, "probability": probability})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
