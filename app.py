from flask import Flask, request, jsonify, render_template
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

cmd="0"
@app.route('/cmd_in',methods=['POST']) 
def process_cmd():
    global cmd
    cmd = request.form.get('response', '').lower()    
    print(cmd)
    return jsonify({'feedback':'ok',})

@app.route('/cmd_out') #Add this route after the server url in esp code!
def send_cmd():
    return cmd

if __name__ == "__main__":
    app.run(debug=1)