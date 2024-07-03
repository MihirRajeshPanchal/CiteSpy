from functions import *

app = Flask(__name__)
CORS(app)

@app.route('/search', methods=['POST'])
def search_query():
    data = request.get_json()
    query = data['query']
    results = search(query)
    return jsonify(results), 200

@app.route('/', methods=['GET'])
def helloworld():
    data = {"response": f"{APP_NAME} Backend Running"}
    return jsonify(data), 200

if __name__ == '__main__':
    app.run(debug=True)