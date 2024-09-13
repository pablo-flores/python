from flask import Flask, render_template, Response, jsonify
from datetime import datetime, timedelta
from flask_pymongo import PyMongo
from datetime import datetime
from pytz import timezone, utc
import pandas as pd
import os

app = Flask(__name__, template_folder="templates")

db_name = 'OutageManager'
port = 27017
collection = 'alarm'
username = os.getenv('MONGO_USER')
password = os.getenv('MONGO_PASS')
hostmongodb = os.getenv('MONGODB_URI')

# Obtén el valor de DAYS_CLEARED_AGO, si no existe, usa 4 como valor por defecto
days_configMap = int(os.getenv('DAYS_CLEARED_AGO', 4))

# Verificar las variables de entorno
if username and password and hostmongodb:
    hostmongodb = hostmongodb.replace('${MONGO_USER}', username).replace('${MONGO_PASS}', password)
else:
    print("Las variables de entorno MONGODB_URI o MONGO_USER o MONGO_PASS no están definidas.")

# Configuración de la conexión con MongoDB
app.config["MONGO_URI"] = hostmongodb
mongo = PyMongo(app)

# Definir la zona horaria Local (Buenos Aires)
buenos_aires_tz = timezone('America/Argentina/Buenos_Aires')
days_ago = datetime.now() - timedelta(days=days_configMap)#default 4

# Ruta principal que carga la página
@app.route('/')
def index():
    return render_template('viewTop10.html', days_configMap=days_configMap)

# Nueva ruta para obtener las alarmas en formato JSON
@app.route('/get_alarmas', methods=['GET'])
def get_alarmas():

# Calcula la fecha de hace 15 días desde hoy
    #days_ago = datetime.now() - timedelta(days=days_configMap)#default 4

    cursor = mongo.db.alarm.find(
        {
            "$or": [
                { 
                    "alarmState": { "$in": ['RAISED', 'UPDATED', 'RETRY'] },
                    "alarmRaisedTime": { "$gte": days_ago } 
                },
                {
                    "alarmState": "CLEARED",
                    "alarmClearedTime": { "$gte": days_ago }
                }
            ]
        },
        {
            "_id": 0,
            "alarmId": 1,
            "alarmType": 1,
            "alarmState": 1,
            "clients": 1,
            "TypeNetworkElement": "$networkElement.type",
            "networkElementId": 1,
            "timeResolution": 1,
            "sourceSystemId": 1,
            "origenId": 1,
            "inicioOUM": "$omArrivalTimestamp",
            "alarmRaisedTime": 1,
            "alarmClearedTime": 1
        }
    ).sort("_id", -1)


    alarmas = []
    for alarma in cursor:
        if alarma.get('inicioOUM'):
            alarma['inicioOUM'] = alarma.get('inicioOUM').replace(tzinfo=utc).astimezone(buenos_aires_tz).strftime('%Y-%m-%d %H:%M:%S')
        else:
            alarma['inicioOUM'] = '-'

        if alarma.get('alarmRaisedTime'):
            alarma['alarmRaisedTime'] = alarma.get('alarmRaisedTime').replace(tzinfo=utc).astimezone(buenos_aires_tz).strftime('%Y-%m-%d %H:%M:%S')
        else:
            alarma['alarmRaisedTime'] = '-'

        if alarma.get('alarmClearedTime'):
            alarma['alarmClearedTime'] = alarma.get('alarmClearedTime').replace(tzinfo=utc).astimezone(buenos_aires_tz).strftime('%Y-%m-%d %H:%M:%S')
        else:
            alarma['alarmClearedTime'] = '-'

        if not alarma.get('timeResolution'):
            alarma['timeResolution'] = '-'            

        alarmas.append(alarma)

    return jsonify({"alarmas": alarmas})

# Ruta para exportar los datos
@app.route('/export/<format>')
def export_data(format):
    cursor = mongo.db.alarm.find(
        {
            "$or": [
                { 
                    "alarmState": { "$in": ['RAISED', 'UPDATED', 'RETRY'] },
                    "alarmRaisedTime": { "$gte": days_ago } 
                },
                {
                    "alarmState": "CLEARED",
                    "alarmClearedTime": { "$gte": days_ago }
                }
            ]
        },
        {   "_id": 0,
            "alarmId": 1, "alarmState": 1, "alarmType": 1, 
            "inicioOUM": "$omArrivalTimestamp", "alarmRaisedTime": 1, "alarmClearedTime": 1,              
            "TypeNetworkElement": "$networkElement.type", "networkElementId": 1, "clients": 1,
            "timeResolution": 1, "sourceSystemId": 1, "origenId": 1            
        }
    ).sort("_id", -1)

    alarmas = list(cursor)
    df = pd.DataFrame(alarmas)

    # Reordenar las columnas
    df = df[['alarmId', 'alarmState', 'alarmType', 'inicioOUM', 'alarmRaisedTime', 'alarmClearedTime', 
             'TypeNetworkElement', 'networkElementId', 'clients', 'timeResolution', 'sourceSystemId', 'origenId']]

    fecha_actual = datetime.now().strftime('%Y%m%d%H%M%S')

    if format == 'csv':
        csv_data = df.to_csv(index=False)
        return Response(csv_data, mimetype="text/csv", headers={"Content-disposition": "attachment; filename=SIA_alarmas_"+fecha_actual+".csv"})
    elif format == 'excel':
        output = pd.ExcelWriter('/tmp/alarmas.xlsx', engine='xlsxwriter')
        df.to_excel(output, index=False)
        output.close()

        with open('/tmp/alarmas.xlsx', 'rb') as f:
            excel_data = f.read()
        return Response(excel_data, mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        headers={"Content-disposition": "attachment; filename=SIA_alarmas_"+fecha_actual+".xlsx"})
    else:
        return "Unsupported format. Please use 'csv' or 'excel'."

#if __name__ == '__main__':
#    port = os.environ.get('FLASK_PORT') or 8080
#    port = int(port)
#    app.run(port=port, host='0.0.0.0')

if __name__ == '__main__':
    port = os.environ.get('FLASK_PORT') or 8080
    app.run(port=int(port), host='0.0.0.0')
# se levanta con
# waitress-serve --listen=0.0.0.0:8081 app:app    