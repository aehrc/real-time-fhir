# Real Time FHIR

Real Time FHIR is a simulation architecture that transmits Electronic Health Record data from a data source to a FHIR endpoint in real-time.
This project uses a React-based dashboard for simulation control and a Python Flask-based backend for simulation processing. Currently, only NDJSON FHIR resource files are supported. 
</br>
</br>

# Getting Started with Real Time FHIR
## Installation Instructions
1. **Ensure that you have NodeJS installed (Preferably NodeJS 17.x).**</br> If not, check out this guide to install NodeJS on your machine: [How to install Node.js](https://nodejs.dev/learn/how-to-install-nodejs).</br> If you're on Ubuntu, here are some command to install NodeJS 17.x:
```
curl -fsSL https://deb.nodesource.com/setup_17.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Ensure that you have either [Yarn](https://yarnpkg.com) or [NPM](https://www.npmjs.com) installed.**</br> If you don't have either, here are some commands to install the latest version of Yarn on Ubuntu:
```
curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | sudo tee /usr/sh
echo "deb [signed-by=/usr/share/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian stable main" | s
sudo apt-get update && sudo apt-get install yarn
```

3. **Clone this repo and ```cd``` into its folder.**

4. **Run the command ```yarn install``` or ```npm install``` to download node dependencies, depending on which package manager you have installed.**

5. **```cd``` into the /api folder to set up a Python virtual environment and install Python dependencies. Before following the commands below, ensure you have Python3 and pip installed!)**
```
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

6. **To start the app, run ```./run-api.sh``` and ```./run.sh``` in two different terminals.**

</br>

## Configuring environment variables
Before usage, there are a few environment variables that requires configuration. Some are required to be configured while some are optional:
### General environment variables (```.env```)
**Required**

```ENDPOINT_URL``` - URL of simulation destination endpoint.
</br>
```REACT_APP_BACKEND_PORT``` - Port in which the Flask-based backend runs on. This value must be the same as <b>FLASK_RUN_PORT</b> in <b>Flask environment variables</b>.
</br>

**Optional**

```PORT``` - Port of which React runs on. If not specified, React will run on port 3000 by default.
</br>
```TOKEN_URL``` - URL of token endpoint to request client credentials access token. Do not specify if endpoint does not require authentication.
</br>
```CLIENT_ID``` - Client ID of endpoint.
</br>
```CLIENT_SECRET``` - Client Secret of endpoint.
</br>
```SCOPE``` - Scope of access token.
</br>

</br>

### Flask environment variables (```api/.flaskenv```)
**Required**

```FLASK_APP``` - Main script for Flask app to be run on. By default, set value to **api.py**.
</br>
```FLASK_RUN_PORT``` - Port of which Flask runs on. This value must be the same as **REACT_APP_BACKEND_PORT** in **General environment variables**.
</br>

</br>

# Usage
### Simulator
![image](https://user-images.githubusercontent.com/52597778/154633222-6115750e-fab9-4818-a6f0-1f89df650804.png)
**There are three components in the simulation interface:**
1. Input fields allows specification of resource type and duration as parameters of the simulation. By default, resource type and duration will be set to DiagnosticReport and 60 seconds respectively.
2. Simulation attributes displays both static and actively-changing simulation details such as timeline duration, time elapsed, events sent, upcoming events etc.
3. Event table displays events that has been successfully received by the endpoint.

</br>

**Simulation steps:**
1. Ensure that connection to the set endpoint is successful by viewing the pop-up notification on the bottom left whenever you refresh the page.
1. Before starting the simulation, set the resource type and duration input fields to your desired values.
2. Click on the ```Start Simulation``` button to start the simulation.
3. To stop the simulation midway, click on the "Stop Simulation" button. Otherwise, the simulation will stop once all events are sent to the endpoint.
4. To start a new simulation, click on the "Reset Simulation" button to reset all values.

</br>

### Resource
![image](https://user-images.githubusercontent.com/52597778/154867818-23e1c64d-924e-418a-9633-4b1e84f20323.png)
To fetch a resource, specify the resource type and additional parameters (optional) in the input fields, then click on the "Fetch Resource" button. Resource entries will be displayed in the resource table below.

### Using your own FHIR resource files
1. Remove all the files in ```api/input``` before adding your own files.
2. Add your NDJSON FHIR resource files (and JSON files for FHIR references, if there are any) to ```api/input```. 
3. If necessary, add additional resources types to ```src/components/assets/resources-synthea.json``` if they are not present already.

</br>

Note: In a simulation, Real Time FHIR will bundle a resource together with all its references. In the case where a reference cannot be found, an error will occur and the simulation will fail.





