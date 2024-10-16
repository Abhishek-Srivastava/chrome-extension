from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback

# Initialize the Flask app
app = Flask(__name__)

# Enable CORS for the app
CORS(app)

# Define a POST route to handle the request
@app.route('/api/submit', methods=['POST'])
def submit_text():
    # Get the JSON payload from the request
    try:
        print(f"Request data: ", request.data) 
        data = request.get_json()

        # Extract the relevant fields
        document = data.get('document', 'No content')
        text_content = document.get('content', 'No content')
        # You can extract other form fields if needed

        # Log the received text content (for debugging)
        print(f"Received text content: {text_content}")

        # Respond with a success message
        response = {
            'status': 'success',
            'message': 'Text content received successfully!',
            'received_text': text_content
        }

        return jsonify(response), 200
    except Exception as e:
        print(traceback.format_exc())
        print(e)
        raise

# Start the Flask server
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
