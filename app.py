from flask import Flask, render_template
from flask_pymongo import PyMongo
from datetime import datetime
import os

app = Flask(__name__, template_folder=r'C:\OneDriveTeco\OneDrive - Telecom Argentina SA\CV-Inventario y Monitoreo de Red\python\top10')

# Configuración de la conexión con MongoDB
app.config["MONGO_URI"] = "mongodb://omusr:omusr2022@ulmongorouapp1.hor.corp.cloudteco.com.ar:27017/OutageManager"
mongo = PyMongo(app)

def format_datetime(dt):
    if isinstance(dt, datetime):
        return dt.strftime('%d-%m-%Y %H:%M:%S')
    return None

@app.route('/')
def index():
    # Consulta MongoDB con proyección y filtros específicos
    cursor = mongo.db.alarm.find(
        {"alarmState": {"$in": ['RAISED', 'UPDATED', 'RETRY']}},
        {
            "_id": 0,
            "alarmId": 1,
            "alarmType": 1,
            "alarmState": 1,
            "clients": 1,
            "TypeNetworkElement": "$networkElement.type",
            "networkElementId": 1,
            "timeResolution": 1,
            "inicioOUM": "$omArrivalTimestamp",
            "alarmRaisedTime": 1
        }
    ).sort("clients", -1).limit(10)
    
    alarmas = []
    for alarma in cursor:
        alarma['inicioOUM'] = format_datetime(alarma.get('inicioOUM'))
        alarma['alarmRaisedTime'] = format_datetime(alarma.get('alarmRaisedTime'))
        alarmas.append(alarma)
    
    # Fecha de última actualización
    fecha_actualizacion = datetime.now().strftime('%d-%m-%Y %H:%M:%S')

    
  # Pasamos los resultados y la fecha de actualización a la plantilla HTML
    return render_template('viewTop10.html', alarmas=alarmas, fecha_actualizacion=fecha_actualizacion)

#if __name__ == '__main__':
#    app.run(debug=True)

if __name__ == '__main__':
    port = os.environ.get('FLASK_PORT') or 8080
    port = int(port)

    app.run(port=port,host='0.0.0.0')    

