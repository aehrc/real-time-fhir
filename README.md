# Real Time FHIR

Real Time FHIR is a simulation architecture that transmits Electronic Health Record data from a data source to a FHIR endpoint in real-time.
This project uses a React-based dashboard for simulation control and a Python Flask-based backend for simulation processing. Currently, only NDJSON FHIR resource files are supported. 
</br>
</br>

## Getting Started with Real Time FHIR
1. <b>Ensure that you have NodeJS installed (Preferably NodeJS 17.x).</b></br> If not, check out this guide to install NodeJS on your machine: [How to install Node.js](https://nodejs.dev/learn/how-to-install-nodejs).</br> If you're on Ubuntu, here are some command to install NodeJS 17.x:
```
curl -fsSL https://deb.nodesource.com/setup_17.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. <b>Ensure that you have either [Yarn](https://yarnpkg.com) or [NPM](https://www.npmjs.com) installed.</b></br> If you don't have either, here are some commands to install the latest version of Yarn on Ubuntu:
```
curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | sudo tee /usr/sh
echo "deb [signed-by=/usr/share/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian stable main" | s
sudo apt-get update && sudo apt-get install yarn
```

3. <b>Clone this repo and</b> ```cd``` <b>into its folder.</b>

4. <b>Run the command ```yarn install``` or ```npm install``` to download node dependencies, depending on which package manager you have installed.</b>

5. ```cd``` <b>into the /api folder to set up a Python virtual environment and install Python dependencies. Before following the commands below, ensure you have Python3 and pip installed!)</b>
```
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

6. To start the app, run ```./run-api.sh``` and ```./run.sh``` in two different terminals.

</br>

## Configuring environment variables
Before usage, there are a few environment variables that requires configuration. Some are required to be configured while some are optional:
### General environment variables (```.env```)
<b>Required</b>

```ENDPOINT_URL``` - URL of simulation destination endpoint.
</br>
```REACT_APP_BACKEND_PORT``` - Port in which the Flask-based backend runs on. This value must be the same as <b>FLASK_RUN_PORT</b> in <b>Flask environment variables</b>.
</br>

<b>Optional</b>

```PORT``` - Port of which React runs on. If not specified, React will run on port 3000 by default.
</br>
```TOKEN_URL``` - Url of token endpoint to request client credentials access token. Do not specify if endpoint does not require authentication.
</br>
```CLIENT_ID``` - Client ID of endpoint.
</br>
```CLIENT_SECRET``` - Client Secret of endpoint.
</br>
```SCOPE``` - scope of access token.
</br>
</br>


### Flask environment variables (```api/.flaskenv```)
<b>Required</b>

```FLASK_APP``` - Main script for Flask app to be run on. By default, set value to <b>api.py</b>.
</br>
```FLASK_RUN_PORT``` - Port of which Flask runs on. This value must be the same as <b>REACT_APP_BACKEND_PORT</b> in <b>General environment variables</b>.
</br>


## Usage
