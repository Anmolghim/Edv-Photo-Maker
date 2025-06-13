try:
    import onnxruntime as ort
except ModuleNotFoundError:
    raise ImportError("The 'onnxruntime' module is missing. Install it using: pip install onnxruntime")

from flask import Flask, request, jsonify
from flask_cors import CORS
from rembg import remove
import io
from PIL import Image
import cv2
import base64
import numpy as np

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Flask server is running. Use the /process-image endpoint."

def detect_face_and_chin(image):
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = face_cascade.detectMultiScale(gray_image, scaleFactor=1.1, minNeighbors=5)

    if len(faces) > 0:
        (x, y, w, h) = max(faces, key=lambda rect: rect[2] * rect[3])
        chin_position = y + h
        return (x, y, w, h), chin_position
    else:
        return None, None

@app.route('/process-image', methods=['POST'])
def process_image():
    data = request.get_json()
    image_data = data.get('image')

    try:
        image = Image.open(io.BytesIO(base64.b64decode(image_data.split(',')[1])))
    except Exception as e:
        return jsonify({"error": "Invalid image format."}), 400

    input_cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    face_rect, chin_position = detect_face_and_chin(input_cv_image)

    if face_rect is None:
        return jsonify({"error": "No face detected in the image."}), 400

    try:
        remove_background = remove(np.array(image))
        remove_background = Image.fromarray(remove_background)

        white_bg = Image.new("RGBA", remove_background.size, (255, 255, 255))
        final_image = Image.alpha_composite(white_bg, remove_background).convert("RGB")

        chin_to_head = int(1.29 * 300)
        chin_to_bottom = int(1.18 * 300)

        final_width, final_height = final_image.size
        top_crop_position = max(0, chin_position - chin_to_head)
        bottom_crop_position = min(final_height, chin_position + chin_to_bottom)

        crop_height = bottom_crop_position - top_crop_position
        crop_width = final_width

        if crop_width != crop_height:
            side_padding = abs(crop_width - crop_height) // 2
            if crop_width > crop_height:
                crop_area = (side_padding, top_crop_position, crop_width - side_padding, bottom_crop_position)
            else:
                top_crop_position = max(0, top_crop_position - side_padding)
                bottom_crop_position = min(final_height, bottom_crop_position + side_padding)
                crop_area = (0, top_crop_position, final_width, bottom_crop_position)
        else:
            crop_area = (0, top_crop_position, final_width, bottom_crop_position)

        cropped_image = final_image.crop(crop_area)
        resized_image = cropped_image.resize((600, 600), Image.LANCZOS)

        def adjust_quality(target_image, min_size=54 * 1024, max_size=240 * 1024):
            quality = 85
            step = 5
            img_byte_arr = io.BytesIO()

            while True:
                img_byte_arr.truncate(0)
                img_byte_arr.seek(0)
                target_image.save(img_byte_arr, format='JPEG', quality=quality)
                size = img_byte_arr.tell()

                if size < min_size and quality < 100:
                    quality += step
                elif size > max_size and quality > 10:
                    quality -= step
                else:
                    break

            img_byte_arr.seek(0)
            return img_byte_arr

        img_byte_arr = adjust_quality(resized_image)

        processed_image_data = base64.b64encode(img_byte_arr.read()).decode('utf-8')
        processed_image_url = f"data:image/jpeg;base64,{processed_image_data}"

        return jsonify({"processed_image": processed_image_url})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
