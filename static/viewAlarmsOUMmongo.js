
/*******************************************************************************/
  
document.addEventListener('keydown', function(event) {
    // Verifica si se ha presionado Ctrl + I
    if (event.ctrlKey && event.key === 'e') {
        // Prevenir la acción predeterminada
        event.preventDefault();

        // Dispara el evento de clic en el botón oculto
        document.getElementById('download-excel').click();
    }
});

/*******************************************************************************/

// Escucha el evento de clic del botón para realizar la acción de descargar Excel
document.getElementById('download-excel').addEventListener('click', function () {
    
    document.getElementById('loading-message').style.display = 'block';

  
    // Obtén una instancia de la tabla DataTable
    var table = $('#alarmTable').DataTable();

    // Desactivar la paginación para acceder a todas las filas
    table.page.len(-1).draw();

    // Inicializa un array para almacenar las filas
    var rows = [];
    
    // Selecciona todas las filas visibles en la tabla
    document.querySelectorAll("#alarmTable tr").forEach(function(row) {
        var rowData = Array.from(row.querySelectorAll("td, th")).map(function(col) {
            return col.innerText;
        });
        rows.push(rowData);
    });

    // Crea una hoja de trabajo (worksheet) con los datos
    var worksheet = XLSX.utils.aoa_to_sheet(rows);

    // Crea un libro de trabajo (workbook) y añade la hoja
    var workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Alarmas");

    // Genera el archivo Excel
    var excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Crear el Blob para el archivo Excel
    var excelFile = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    var downloadLink = document.createElement("a");
    downloadLink.download = 'SIA_alarmas_' + new Date().toISOString().slice(0, 19).replace(/:/g, "-") + '.xlsx';
    downloadLink.href = URL.createObjectURL(excelFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Restaurar la paginación original
    table.page.len(15).draw(); // Cambia el número 15 al valor de la paginación por defecto de tu tabla

    // Ocultar el mensaje de "Espere..." después de 5 segundos
    setTimeout(function() {
        document.getElementById('loading-message').style.display = 'none';
    }, 10000); // Puedes ajustar el tiempo si es necesario
    
    
});


/*******************************************************************************/

document.addEventListener('keydown', function(event) {
    // Verifica si se ha presionado Ctrl + P
    if (event.ctrlKey && event.key === 'I') {
        // Prevenir la acción predeterminada de imprimir
        event.preventDefault();

        // Dispara el evento de clic en el botón oculto
        document.getElementById('download-csv').click();
    }
});


// Escucha el evento de clic del botón para realizar la acción deseada
document.getElementById('download-csv').addEventListener('click', function () {

    document.getElementById('loading-message').style.display = 'block';

    // Obtén una instancia de la tabla DataTable
    var table = $('#alarmTable').DataTable();

    // Desactivar la paginación para acceder a todas las filas
    table.page.len(-1).draw();

    // Aquí puedes poner el código para descargar el archivo CSV
    console.log('Descargando CSV...');

    // Inicializa el array para almacenar las filas
    var csv = [];
    
    // Selecciona todas las filas visibles en la tabla
    var rows = document.querySelectorAll("#alarmTable tr");

    // Recorre cada fila y extrae los datos de cada celda
    rows.forEach(function(row) {
        var cols = row.querySelectorAll("td, th");
        var rowData = Array.from(cols).map(function(col) {
            return col.innerText;
        });
        csv.push(rowData.join(","));
    });

    // Crear el archivo CSV
    var csvFile = new Blob([csv.join("\n")], { type: "text/csv" });
    var downloadLink = document.createElement("a");
    downloadLink.download = 'SIA_alarmas_' + new Date().toISOString().slice(0, 19).replace(/:/g, "-") + '.csv';            
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Restaurar la paginación original
    table.page.len(15).draw(); // Cambia el número 15 al valor de la paginación por defecto de tu tabla

    // Ocultar el mensaje de "Espere..." después de 5 segundos
    setTimeout(function() {
        document.getElementById('loading-message').style.display = 'none';
    }, 10000); // Puedes ajustar el tiempo si es necesario
    
});


/*******************************************************************************/

$.fn.dataTable.ext.order['custom-num-sort'] = function(settings, colIdx) {
    return this.api().column(colIdx, { order: 'index' }).nodes().map(function(td) {
        // Extract the numerical value from the displayed content
        return parseFloat($(td).text().replace(/[^0-9.-]/g, '')) || 0;
    });
};

/*******************************************************************************/

function processStringForDisplay(data) {
    // Example processing: trim and concatenate with additional info
    return data ? data.trim() + ' (processed)' : '';
}


/*******************************************************************************/

$(document).ready(function() {
    $('#loading').show();
    $('#alarmTable').hide();

     // Initialize DataTable with server-side processing
    $('#alarmTable').DataTable({
        "serverSide": true,
        "ajax": {
            "url": "/get_alarmas",
            "type": "GET",
            "data": function(d) {
                d.page = Math.floor(d.start / d.length) + 1;
                d.limit = d.length;
                d.search = { "value": d.search.value }; // Include search term
            },
            "dataSrc": function (json) {
                console.log('Data received from server:', json.data); // Inspect data here
                return json.data;
            }
        },
        "columns": [
            { "data": "alarmId" },
            { "data": "origenId" },
            { "data": "alarmState" },
            { "data": "alarmType" },
            { "data": "alarmRaisedTime" },
            { "data": "alarmClearedTime" },
            { "data": "alarmReportingTime" },
            { "data": "inicioOUM" },
            { "data": "timeDifference" },
            { "data": "TypeNetworkElement" },
            { "data": "networkElementId" },
            { "data": "clients" },
            { "data": "timeResolution" }
        ],
        "autoWidth": true,
        "paging": true,
        "searching": true,
        "ordering": true,
        "order": [],  // No initial ordering
        "processing": true,
        "pageLength": 15,
        "lengthMenu": [ [10, 15, 25, 50, 100, 300, 100000], [10, 15, 25, 50, 100, 300, "Todos"] ],
        "columnDefs": [
            {
                "targets": 0, // Index of the 'alarmId' column
                "render": function(data, type, row) {
                    return `
                        <div class="tooltip-cell" style="text-align: left;">
                            ${data}
                            <span class="tooltip-text">                           
                                <div class="tooltip-row">
                                    <span class="tooltip-title">Origen:</span>
                                    <span class="tooltip-value">${(row.sourceSystemId || '').split('').join(' ')}</span>
                                </div>
                                <div class="tooltip-row">
                                    <span class="tooltip-title">Deteccion:</span>
                                    <span class="tooltip-value">${row.alarmRaisedTime || '-'}</span>
                                </div>
                                <div class="tooltip-row">
                                    <span class="tooltip-title">Reporte:</span>
                                    <span class="tooltip-value">${row.alarmReportingTime || '-'}</span>
                                </div>
                                <div class="tooltip-row">
                                    <span class="tooltip-title">Arribo Outage:</span>
                                    <span class="tooltip-value">${row.inicioOUM || '-'}</span>
                                </div>
                                <div class="tooltip-row">
                                    <span class="tooltip-title">Resuelto:</span>
                                    <span class="tooltip-value">${row.alarmClearedTime || '-'}</span>
                                </div>
                            </span>
                        </div>`;
                }
            },
            {
                "targets": 1, // 'origenId' column
                "render": function (data, type, row) {
                    return `<div style="text-align: left;">${data}</div>`;
                }
            },
//            {
//                "targets": 2, // 'alarmState' column
//                "render": function (data, type, row) {
//                    // Apply conversion for alarmState
//                    let alarmState = data;
//                    if (alarmState === 'UPDATED' || alarmState === 'RETRY') {
//                        alarmState = 'RAISED';
//                    }
//                    if (row.alarmClearedTime !== '-') {
//                        alarmState = 'CLEARED';
//                    }
//                    return `<td style="text-align: left;">${alarmState}</td>`;
//                }
//            },
            {
                "targets": 2, // Column index for sorting based on the displayed content
                "render": function(data, type, row) {

                    // Apply conversion for alarmState
                    let alarmState = data;
//                    if (alarmState === 'UPDATED' || alarmState === 'RETRY') {
//                        alarmState = 'RAISED';
//                    }
                    if (row.alarmClearedTime !== '-') {
                        alarmState = 'CLEARED';
                    }                    
            
                    if (type === 'display') {
                        return `<div style="text-align: left;">${alarmState}</div>`;
                    } else if (type === 'sort') {
                        return data;
                    }
                    
                    return alarmState;
                }
            },
            {
                "targets": 3, // 'alarmRaisedTime' column
                "render": function (data) {
                    return `<div style="text-align: center;">${data}</div>`;
                }
            },            
            {
                "targets": 4, // 'alarmRaisedTime' column
                "render": function (data) {
                    return `<div style="text-align: center;">${data}</div>`;
                }
            },
            {
                "targets": 5, // 'alarmClearedTime' column
                "render": function (data, type) {
                    if (type === 'display') {
                        return `<div style="text-align: center;">${data}</div>`;
                    }
                    return data; // Return plain data for sorting
                }
            },
            {
                "targets": 6, // 'alarmReportingTime' column
                "render": function (data) {
                    return `<div style="text-align: center;">${data}</div>`;
                }
            },
            {
                "targets": 7, // 'inicioOUM' column
                "render": function (data) {
                    return `<div style="text-align: center;">${data}</div>`;
                }
            },
            // Apply custom sorting to the column
            {
                "targets": 8,
                "type": "num",
                "render": function(data, type) {
                    if (type === 'display') {
                        return `<div style="text-align: right;">${data}</div>`;
                        
                    }
                    return data; // For sorting and other operations, return the raw data
                },
                "orderDataType": "custom-num-sort" // Use custom sorting logic
            },                      
            {
                "targets": 9, // 'TypeNetworkElement' column
                "render": function (data) {
                    return `<div style="text-align: left;">${data}</div>`;
                }
            },
            {
                "targets": 10, // 'networkElementId' column
                "render": function (data) {
                    return `<div style="text-align: left;">${data}</div>`;
                }
            },
            {
                "targets": 11, // 'clients' column
                "type": "num",
                "render": function (data) {
                    return `<div style="text-align: right;">${data}</div>`;
                }
            },
            {
                "targets": 12, // Index of the 'timeResolution' column
                "type": "num",
                "render": function(data, type, row) {
                    if (type === 'sort' || type === 'type') {
                        return parseFloat(data) || 0;
                    }
                    return data !== undefined ? `<div style="text-align: right;">${data}</div>` : '';
                }
            }            
        ],        
        "language": {
            "lengthMenu": "Mostrar _MENU_ entradas",
            "zeroRecords": "No se encontraron resultados",
            "info": "Mostrando _START_ a _END_ de _TOTAL_ entradas",
            "infoEmpty": "Mostrando 0 a 0 de 0 entradas",
            "infoFiltered": "(filtrado de _MAX_ entradas totales)",
            "search": "Buscar:",
            "paginate": {
                "first": "Primero",
                "last": "Último",
                "next": "Siguiente",
                "previous": "Anterior"
            },
            "loadingRecords": "Cargando...",
            "processing": "Procesando...",
            "emptyTable": "No hay datos disponibles en la tabla"
        },
        "drawCallback": function() {
            // Re-initialize tooltips after each draw
            $('#alarmTable tbody').on('mouseenter', '.tooltip-cell', function() {
                var tooltip = $(this).find('.tooltip-text');
                tooltip.css('visibility', 'visible').css('opacity', '1');
            });

            $('#alarmTable tbody').on('mouseleave', '.tooltip-cell', function() {
                var tooltip = $(this).find('.tooltip-text');
                tooltip.css('visibility', 'hidden').css('opacity', '0');
            });
        }

    });

    $('#loading').hide();
    $('#alarmTable').show();
});


/*******************************************************************************/

// Function to get local time
function updateLocalTime() {
    const now = new Date();
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    const formattedTime = now.toLocaleString('es-AR', options);
    document.getElementById('local-time').textContent = formattedTime;
}

updateLocalTime();

/*******************************************************************************/

// Captura los eventos de clic en los botones de exportación
document.querySelectorAll('.export-btn').forEach(function(button) {
    button.addEventListener('click', function(event) {
        // Muestra el mensaje de "Espere..."
        document.getElementById('loading-message').style.display = 'block';

        // Configurar la URL del archivo a descargar
        var exportUrl = button.getAttribute('data-export');

        // Descargar el archivo dentro del iframe
        var iframe = document.getElementById('download-frame');
        iframe.src = exportUrl;

        // Ocultar el mensaje de "Espere..." después de 5 segundos
        setTimeout(function() {
            document.getElementById('loading-message').style.display = 'none';
        }, 10000); // Puedes ajustar el tiempo si es necesario

        // Prevenir la redirección predeterminada
        event.preventDefault();
    });
});

/*******************************************************************************/

/*Ajustar Dinámicamente la Posición del Tooltip*/
$(document).ready(function() {
    // Ajuste del tooltip en hover
    $('.tooltip-cell').hover(function() {
        var tooltip = $(this).find('.tooltip-text');

        // Mostrar el tooltip para calcular su posición
        tooltip.css('visibility', 'visible').css('opacity', '1');

        // Obtener la posición y dimensiones del tooltip
        var tooltipRect = tooltip[0].getBoundingClientRect();
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();

        // Ajustar la posición si se sale de los límites de la pantalla
        var left = tooltipRect.left;
        var right = tooltipRect.right;
        var top = tooltipRect.top;

        // Ajustar si se sale por la izquierda
        if (left < 0) {
            tooltip.css('left', '0').css('right', 'auto');
        }

        // Ajustar si se sale por la derecha
        if (right > windowWidth) {
            tooltip.css('left', 'auto').css('right', '0');
        }

        // Ajustar si se sale por la parte superior
        if (top < 0) {
            tooltip.css('top', '100%').css('bottom', 'auto');
        }
    }, function() {
        // Ocultar el tooltip y restaurar su posición original
        var tooltip = $(this).find('.tooltip-text');
        tooltip.css('visibility', 'hidden').css('opacity', '0');
        tooltip.css('left', '').css('right', '').css('top', '').css('bottom', '');
    });
});

/*******************************************************************************/
/*
// Función para actualizar el tiempo local con la zona horaria de Buenos Aires
document.addEventListener('DOMContentLoaded', function () {
    // Set the initial local time
    updateLocalTime();

    // Update the progress bar every 5 seconds
    setInterval(updateProgressBar, 5000);
});

// Function to update the local time
function updateLocalTime() {
    const now = new Date();
    const options = {
        timeZone: 'America/Argentina/Buenos_Aires', // Set to the correct timezone
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    };
    const formattedTime = new Intl.DateTimeFormat('es-AR', options).format(now);
    document.getElementById('local-time').textContent = formattedTime;
    console.log('Local time updated:', formattedTime);
}

// Function to update the progress bar
function updateProgressBar() {
    const now = new Date();
    const localTimeElement = document.getElementById('local-time').textContent;

    console.log('Current time:', now);
    console.log('Local time element:', localTimeElement);
    
    // Remove the comma and split the date and time parts
    const [datePart, timePart] = localTimeElement.replace(',', '').split(' ');
    const [day, month, year] = datePart.split('/');
    const [hours, minutes, seconds] = timePart.split(':');

    console.log('Parsed date:', year, month, day);
    console.log('Parsed time:', hours, minutes, seconds);

    // Create a new date object with the parsed values
    const lastUpdate = new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}-03:00`); // Adjust to the correct timezone
    console.log('Last update time:', lastUpdate);

    if (isNaN(lastUpdate.getTime())) {
        console.error('Error: Invalid date parsed.');
        return; // Exit the function to avoid further errors
    }

    const elapsed = now - lastUpdate; // Time difference in milliseconds
    console.log('Elapsed time (ms):', elapsed);

    // Calculate the percentage (10 minutes = 600,000 ms)
    // Calculate the percentage (5 minutes = 300,000 ms)
    const percentage = Math.min((elapsed / 300000) * 100, 100); // Cap at 100%
    console.log('Progress percentage:', percentage);

    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = percentage + '%';

    // Change the color based on the elapsed time
    if (percentage < 20) {
        progressBar.style.backgroundColor = 'lightgreen';
        console.log('Progress bar color: green');
    } else if (percentage < 40) {
        progressBar.style.backgroundColor = 'green';
        console.log('Progress bar color: yellow');
    } else if (percentage < 60) {
        progressBar.style.backgroundColor = 'lightyellow';
        console.log('Progress bar color: yellow');
    } else if (percentage < 80) {
        progressBar.style.backgroundColor = 'lightorange';
        console.log('Progress bar color: yellow');
    } else if (percentage < 90) {
        progressBar.style.backgroundColor = 'orange';
        console.log('Progress bar color: yellow');                        
    } else {
        progressBar.style.backgroundColor = 'red';
        console.log('Progress bar color: red');
    }



}
*/

/*******************************************************************************/
document.addEventListener('DOMContentLoaded', function () {
    // Set the initial local time
    updateLocalTime();

    // Update the progress bar every 5 seconds
    setInterval(updateProgressBar, 10000);
});

// Function to update the local time
function updateLocalTime() {
    const now = new Date();
    const options = {
        timeZone: 'America/Argentina/Buenos_Aires',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    };
    const formattedTime = new Intl.DateTimeFormat('es-AR', options).format(now);
    document.getElementById('local-time').textContent = formattedTime;
    console.log('Local time updated:', formattedTime);
}


// Function to update the progress bar
function updateProgressBar() {
    const now = new Date();
    const localTimeElement = document.getElementById('local-time').textContent;

    console.log('Current time:', now);
    console.log('Local time element:', localTimeElement);

    // Remove the comma and split the date and time parts
    const [datePart, timePart] = localTimeElement.replace(',', '').split(' ');
    const [day, month, year] = datePart.split('/');
    const [hours, minutes, seconds] = timePart.split(':');

    console.log('Parsed date:', year, month, day);
    console.log('Parsed time:', hours, minutes, seconds);

    // Create a new date object with the parsed values
    const lastUpdate = new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}-03:00`);
    console.log('Last update time:', lastUpdate);

    if (isNaN(lastUpdate.getTime())) {
        console.error('Error: Invalid date parsed.');
        return; // Exit the function to avoid further errors
    }

    const elapsed = now - lastUpdate; // Time difference in milliseconds
    console.log('Elapsed time (ms):', elapsed);

    // Calculate the percentage (10 minutes = 600,000 ms)
    const percentage = Math.min((elapsed / 600000) * 100, 100); // Cap at 100%
    console.log('Progress percentage:', percentage);

    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = percentage + '%';

    // Check if the progress is full and change the button color
    const refreshButton = document.querySelector('.btn-modern');
    if (percentage >= 100) {
        refreshButton.style.backgroundColor = '#fe8d59';//'red'; // Change the button color to red
        document.getElementById('progress-container').style.display = 'none'; // Hide the progress bar
    } else {
        refreshButton.style.backgroundColor = '#5290d3'; // Reset to the original color
        document.getElementById('progress-container').style.display = 'block'; // Make sure the progress bar is visible
    }
}


document.querySelector('.btn-modern').addEventListener('click', function() {
    // Mostrar el contenedor de progreso
    document.getElementById('progress-container').style.display = 'block';

    // Reiniciar el ancho de la barra de progreso
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = '0%';

    // Restablecer el color del botón de "Refresh"
    this.style.backgroundColor = '#5290d3';

    // Actualizar la hora local
    updateLocalTime();
});


/*******************************************************************************/

document.getElementById('toggleButton').addEventListener('click', function() {
    var expandableDiv = document.getElementById('expandableDiv');
    
    // Verifica si el contenido es visible
    if (expandableDiv.style.display === 'none' || expandableDiv.style.display === '') {
        expandableDiv.style.display = 'block'; // Mostrar el contenido
    } else {
        expandableDiv.style.display = 'none'; // Ocultar el contenido
    }
});


/*******************************************************************************/
