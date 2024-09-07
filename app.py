from flask import Flask, render_template
from flask_pymongo import PyMongo
from datetime import datetime
from pytz import timezone, utc
import os

app = Flask(__name__, template_folder="templates")

db_name = 'OutageManager'
port = 27017
collection = 'alarm'
username = os.getenv('MONGO_USER')
password = os.getenv('MONGO_PASS')
hostmongodb = os.getenv('MONGODB_URI')

# Reemplazar los marcadores de posición en la cadena
hostmongodb = hostmongodb.replace('${MONGO_USER}', username)
hostmongodb = hostmongodb.replace('${MONGO_PASS}', password)

# Configuración de la conexión con MongoDB
app.config["MONGO_URI"] = hostmongodb # f'mongodb://{username}:{password}@{hostmongodb}:{port}/{db_name}'
mongo = PyMongo(app)


def format_datetime(dt):
    if isinstance(dt, datetime):
        return dt.strftime('%d-%m-%Y %H:%M:%S')
    return None

# Definir la zona horaria Local (Buenos Aires)
buenos_aires_tz = timezone('America/Argentina/Buenos_Aires')



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
        alarma['inicioOUM'] = alarma.get('inicioOUM').replace(tzinfo=utc).astimezone(buenos_aires_tz).strftime('%d-%m-%Y %H:%M:%S')
        alarma['alarmRaisedTime'] = alarma.get('alarmRaisedTime').replace(tzinfo=utc).astimezone(buenos_aires_tz).strftime('%d-%m-%Y %H:%M:%S')
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

