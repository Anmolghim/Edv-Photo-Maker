# Edv-Photo-Maker
📸 EDV Photo Maker Web App

A web-based tool that allows users to upload or capture a photo from their phone, crop it to perfection, and process it to meet the required specifications of official documents like EDV (Electronic Diversity Visa), passport, visa, and other government IDs.
✨ Features
    Upload or capture photos directly using your phone camera.
    Built-in cropping tool to perfectly center the face.
    Automatic background removal.
    Converts photo to match EDV and other document criteria.
    Supports multiple formats for saving.
    Easy-to-use and fast processing.

🖼️ EDV Photo Requirements
The processed photo aims to meet the US EDV (Diversity Visa Lottery) standards, such as:
    2x2 inch (51x51 mm) photo
    White or neutral background
    Head height: between 50%–69% of image height
    Eye height: between 56%–69% of image height
    No shadows, hats, or glasses
    Neutral facial expression

🛠️ Technologies Used
    Python
    Flask (Web server)
    flask_cors (Cross-origin requests)
    OpenCV (cv2) (Image processing)
    rembg (Background removal)
    Pillow (PIL) (Image handling)
    NumPy
    Base64 & io for in-memory file operations

⚙️ Installation & Setup
1. Clone the Repository

git clone [https://github.com/Anmolghim/Edv-Photo-Maker.git]
cd edv-photo-maker

2. Create a Python Virtual Environment
python3 -m venv venv

Activate the environment:
    On Linux/macOS:
source venv/bin/activate
On Windows:
    venv\Scripts\activate

3. Install Dependencies

pip install -r requirements.txt(flask,flask_cors,rembg,io,PIL,cv2,base64) like this dependency
If you haven't created a requirements.txt, you can generate one:
pip freeze > requirements.txt

4. Run the Server
python removeBackground.py

The server will start (usually at http://127.0.0.1:5000) and you can interact with the website.
🧪 Example Usage

    Open the web app on a phone or browser.

    Capture or upload a photo.

    Use the crop tool to align the face.

    Click Upload to process.

    Download the enhanced, background-removed EDV-compliant photo.

