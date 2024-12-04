from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import requests

app = Flask(__name__)

# SQLite Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///Blind_stick.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)

# ESP32 data model
class GPSData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    latitude = db.Column(db.String(50), nullable=False)
    longitude = db.Column(db.String(50), nullable=False)
    address = db.Column(db.Text, nullable=True)

# Create database tables
with app.app_context():
    db.create_all()

# Global variable to store the latest coordinates
coordinates = {"latitude": "", "longitude": ""}

@app.route('/')
def index():
    """
    Render the main page with the latest coordinates.
    """
    return render_template('index.html', coordinates=coordinates)

@app.route('/coordinates', methods=['POST'])
def receive_coordinates():
    try:
        data = request.get_json()
        latitude = data.get('latitude', '')
        longitude = data.get('longitude', '')

        # Convert coordinates to address using a geocoding API
        address = get_address_from_coordinates(latitude, longitude)

        # Save to database
        gps_data = GPSData(latitude=latitude, longitude=longitude, address=address)
        db.session.add(gps_data)
        db.session.commit()

        print(f"Received and saved: Latitude={latitude}, Longitude={longitude}, Address={address}")
        return jsonify({"message": "Coordinates received and saved successfully!"}), 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 400

def get_address_from_coordinates(lat, lon):
    try:
        # Use OpenStreetMap's Nominatim
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}"
        response = requests.get(url)
        data = response.json()
        return data.get('display_name', 'Unknown Address')
    except Exception as e:
        print(f"Geocoding error: {e}")
        return "Error converting coordinates to address"

@app.route('/map')
def map_view():
    gps_data = GPSData.query.all()
    return render_template('map.html', gps_data=gps_data)


# Store the latest message
latest_message = ""

@app.route('/send', methods=['POST'])
def send_message():
    global latest_message
    try:
        data = request.get_json()
        latest_message = data.get('message', '')
        print(f"Received message: {latest_message}")  # Log the message for debugging
        return jsonify({"message": "Message sent to ESP32"}), 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 400

@app.route('/latest-message', methods=['GET'])
def get_latest_message():
    # Endpoint for ESP32 to fetch the latest message
    return jsonify({"message": latest_message}), 200

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        name = request.form['name']
        age = request.form['age']
        email = request.form['email']
        password = request.form['password']

        # Add user to the database
        user = User(name=name, age=age, email=email, password=password)
        db.session.add(user)
        db.session.commit()

        return jsonify({"message": "User signed up successfully!"}), 201

    # Fetch user details and GPS data for rendering on the signup page
    users = User.query.all()
    gps_data = GPSData.query.all()
    return render_template('signup_with_map.html', users=users, gps_data=gps_data)

@app.route('/signup_with_map')
def signup_with_map():
    users = User.query.all()
    gps_data = GPSData.query.all()
    return render_template('signup_with_map.html', users=users, gps_data=gps_data)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
