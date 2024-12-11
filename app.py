from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash
import firebase_admin
from firebase_admin import credentials, db
from werkzeug.security import generate_password_hash, check_password_hash
from threading import Timer
import requests

# Initialize Flask app
app = Flask(__name__)
app.secret_key = "abcdefghijklmnopqrstuv123456789"  # Replace with a strong, unique key

# Initialize Firebase
cred = credentials.Certificate("blind-stick-app-9e9d4-firebase-adminsdk-8okyg-d5e5b84c02.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://blind-stick-app-9e9d4-default-rtdb.firebaseio.com'
})

# Global variable for latest message
latest_message = ""


# ======================
# ROUTES
# ======================

@app.route('/')
def index():
    """Homepage with signup and login options."""
    return render_template('index.html')


@app.route('/signup', methods=['POST'])
def signup():
    """Handles user signup."""
    try:
        # Retrieve form data
        name = request.form['name']
        mobile = request.form['mobile']
        email = request.form['email']
        password = request.form['password']

        # Hash the password for security
        hashed_password = generate_password_hash(password)

        # Check for existing user
        ref = db.reference('users')
        users = ref.get() or {}
        for key, value in users.items():
            if value.get('email') == email:
                flash("Email is already registered. Please log in.", "error")
                return redirect(url_for('index', show_login_popup='true'))

        # Prepare user data
        user_data = {
            'name': name,
            'mobile': mobile,
            'email': email,
            'password': hashed_password
        }

        # Push data to Firebase
        ref.push(user_data)

        # Redirect to home page with login popup
        flash("Registration successful! Please log in.", "success")
        return redirect(url_for('index', show_login_popup='true'))

    except Exception as e:
        print(f"Error during signup: {e}")
        flash("An error occurred during registration. Please try again.", "error")
        return redirect(url_for('index'))




@app.route('/login', methods=['POST'])
def login():
    """Handles user login."""
    try:
        email = request.form.get('email')
        password = request.form.get('password')

        if not email or not password:
            flash("Email and password are required.", "error")
            return redirect(url_for('index'))

        # Fetch user data from Firebase
        ref = db.reference('users')
        users = ref.get()

        # Verify credentials
        for user in users.values():
            if user.get('email') == email and check_password_hash(user.get('password'), password):
                session['user_name'] = user.get('name')
                flash(f"Welcome, {user.get('name')}!", "success")
                return redirect(url_for('message'))

        flash("Invalid email or password.", "error")
        return redirect(url_for('index'))

    except Exception as e:
        print(f"Login error: {e}")
        flash("An error occurred during login. Please try again.", "error")
        return redirect(url_for('index'))


@app.route('/message')
def message():
    try:
        # Fetch user name from session
        user_name = session.get('user_name', None)
        if not user_name:
            app.logger.warning("User not logged in. Redirecting to login page.")
            return redirect(url_for('index'))

       # Fetch the latest GPS data from Firebase
        ref = db.reference('gps_data')
        gps_data_list = ref.order_by_key().limit_to_last(1).get()  # Get the most recent entry
        gps_data = list(gps_data_list.values())[0] if gps_data_list else None

        if gps_data:
            latest_data = list(gps_data.values())[0]
            coordinates = {
                "latitude": latest_data.get('latitude', ' 17.781006'),
                "longitude": latest_data.get('longitude', '83.372903'),
                "address": latest_data.get('address', 'Gitam University, GITAM University Main Road, Rushikonda, Vadapalem - 530045, Andhra Pradesh, India')
            }
        else:
            coordinates = {"latitude": " 17.781006", "longitude": "83.372903", "address": "Gitam University, GITAM University Main Road, Rushikonda, Vadapalem - 530045, Andhra Pradesh, India"}

        # Debugging output
        app.logger.info(f"Displaying message page for user: {user_name}")

        return render_template('message.html', user_name=user_name, gps_data=coordinates)
    except Exception as e:
        app.logger.error(f"Error in message route: {e}")
        return render_template('message.html', error="Could not load data.")


@app.route('/coordinates', methods=['POST'])
def receive_coordinates():
    try:
        # Parse JSON data from the request
        data = request.get_json()

        # Default coordinates and address
        default_latitude = 17.781006
        default_longitude = 83.372903 
        default_address = "Gitam University, GITAM University Main Road, Rushikonda, Vadapalem - 530045, Andhra Pradesh, India"

        # Check if data is provided
        if not data or 'latitude' not in data or 'longitude' not in data:
            # Use default coordinates if no valid data is received
            latitude = default_latitude
            longitude = default_longitude
            address = default_address
        else:
            # Extract latitude and longitude from received data
            latitude = data.get('latitude', default_latitude)
            longitude = data.get('longitude', default_longitude)

            # Convert coordinates to address using geocoding API
            address = get_address_from_coordinates(latitude, longitude)

            # Fallback to default address if geocoding fails
            if address == "Error converting coordinates to address":
                address = default_address
        
        print(latitude, longitude,address)
        # Push GPS data to Firebase Realtime Database
        ref = db.reference('gps_data')
        gps_data = {
            'latitude': latitude,
            'longitude': longitude,
            'address': address
        }
        ref.push(gps_data)

        return jsonify({"message": "Coordinates received and saved successfully!", "gps_data": gps_data}), 200
    except Exception as e:
        app.logger.error(f"Error saving coordinates: {e}")
        return jsonify({"error": "Failed to save coordinates"}), 400


@app.route('/send', methods=['POST'])
def send_message():
    """Send a message to Firebase and schedule its deletion."""
    try:
        data = request.get_json()
        message = data.get('message', '')

        # Push message to Firebase
        ref = db.reference('messages')
        new_message_ref = ref.push({'message': message})

        # Schedule deletion after 10 seconds
        Timer(10.0, delete_message, args=(new_message_ref.key,)).start()

        return jsonify({"message": "Message sent to ESP32"}), 200

    except Exception as e:
        print(f"Error sending message: {e}")
        return jsonify({"error": str(e)}), 400


@app.route('/get-latest-message', methods=['GET'])
def get_latest_message():
    """Fetch the latest message."""
    try:
        ref = db.reference('messages')
        data = ref.order_by_key().limit_to_last(1).get()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/logout')
def logout():
    """Log the user out."""
    session.clear()
    flash("You have been logged out.", "info")
    return redirect(url_for('index'))


# ======================
# HELPER FUNCTIONS
# ======================

def get_address_from_coordinates(lat, lon):
    try:
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}"
        response = requests.get(url, timeout=10)  # Set a timeout for the request
        response.raise_for_status()  # Raise an exception for HTTP errors
        data = response.json()
        return data.get('display_name', 'Unknown Address')
    except Exception as e:
        print(f"Geocoding error: {e}")
        return "Error converting coordinates to address"


def delete_message(message_key):
    """Delete a message from Firebase after a delay."""
    try:
        ref = db.reference(f'messages/{message_key}')
        ref.delete()
        print(f"Message with key {message_key} deleted successfully.")
    except Exception as e:
        print(f"Error deleting message: {e}")


# ======================
# MAIN
# ======================
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
