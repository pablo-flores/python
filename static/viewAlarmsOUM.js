
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



$(document).ready(function() {
    $('#loading').show();
    $('#alarmTable').hide();

    // Llamada AJAX para obtener los datos
    $.ajax({
        url: '/get_alarmas',
        method: 'GET',
        success: function(response) {

            let tableBody = '';
            response.alarmas.forEach(function(alarma) {
                // Reemplazar "UPDATED" o "RETRY" por "RAISED" en alarma.alarmState
                //let alarmState = alarma.alarmState;
                let alarmState = alarma.alarmState.trim();

                if (alarmState === 'UPDATED' || alarmState === 'RETRY') {
                    alarmState = 'RAISED';
                } 

                tableBody += `
                <tr>
                    <td class="tooltip-cell">
                        ${alarma.alarmId || ''}
                        <span class="tooltip-text">                           
                            <div class="tooltip-row">
                                <span class="tooltip-title">Sistema Origen:</span>
                                <span class="tooltip-value">${alarma.sourceSystemId}</span>
                            </div>
                            <div class="tooltip-row">
                                <span class="tooltip-title">alarmRaisedTime:</span>
                                <span class="tooltip-value">${alarma.alarmRaisedTime}</span>
                            </div>
                            <div class="tooltip-row">
                                <span class="tooltip-title">alarmReportingTime:</span>
                                <span class="tooltip-value">${alarma.alarmReportingTime}</span>
                            </div>
                            <div class="tooltip-row">
                                <span class="tooltip-title">siaArrivalTime:</span>
                                <span class="tooltip-value">${alarma.inicioOUM}</span>
                            </div>
                            <div class="tooltip-row">
                                <span class="tooltip-title">alarmClearedTime:</span>
                                <span class="tooltip-value">${alarma.alarmClearedTime}</span>
                            </div>
                        </span>
                    </td>

                    <td>${alarma.origenId || ''}</td>
                    <td>${alarmState || ''}</td> <!-- Use modified alarmState here -->                   
                    <td style="text-align: center;padding: 2px 2px;width: 1%;">${alarma.alarmRaisedTime || ''}</td> <!-- Centrar contenido del TD -->                            
                    <td style="text-align: center;padding: 2px 2px;width: 1%;">${alarma.alarmClearedTime || ''}</td> <!-- Centrar contenido del TD -->
                    <td>${alarma.alarmType}</td>
                    <td style="text-align: center;padding: 2px 2px;width: 1%;">${alarma.inicioOUM}</td> <!-- Centrar contenido del TD -->
                    <td>${alarma.TypeNetworkElement}</td>
                    <td>${alarma.networkElementId}</td>
                    <td style="text-align: right;padding: 2px 4px;width: 1%;">${alarma.clients}</td> <!-- Centrar contenido del TD -->
                    <td style="text-align: right;padding: 2px 8px;width: 1%;">${alarma.timeResolution}</td> <!-- Centrar contenido del TD -->
                </tr>`;
            });
            $('#alarmTable tbody').html(tableBody);

            //console.log('Estado:', alarmState);


            // Inicializar DataTable
            $('#alarmTable').DataTable({
                //"scrollX": true, // Habilita el desplazamiento horizontal
                "autoWidth": true, // Previene el ajuste automático del ancho de las columnas
                "paging": true,
                "searching": true,
                "ordering": true,
                "order": [],  // No aplica un ordenamiento inicial, toma los datos tal como llegan
                "pageLength": 15,  // Cambia la cantidad de registros mostrados a 15
                "lengthMenu": [ [10, 15, 25, 50, 100, 300, -1], [10, 15, 25, 50, 100, 300, "Todos"] ],
                "columnDefs": [
                    {
                        "targets": 9, // Índice de la columna 'Clients'
                        "type": "num" // Definir la columna como numérica
                    },
                    { 
                        "targets": 10, // Índice de la columna 'Time Resolution'
                        "type": "num" // Definir la columna como numérica
                    },
                    { targets: 2, searchable: true } // Habilitar búsqueda en la columna de estado
                ],
                
                "drawCallback": function() {

                 
                    // Re-inicializa los tooltips de las celdas
                    $('.tooltip-cell').each(function() {
                        var tooltip = $(this).find('.tooltip-text');
                        $(this).hover(function() {
                            tooltip.css('visibility', 'visible').css('opacity', '1');
                        }, function() {
                            tooltip.css('visibility', 'hidden').css('opacity', '0');
                        });
                    });

/*
                    // Re-inicializa los tooltips de los encabezados
                    $('.tooltip-header').each(function() {
                        var tooltip = $(this).find('.tooltip-text');
                        $(this).hover(function() {
                            tooltip.css('visibility', 'visible').css('opacity', '1');
                            
                            // Obtener la posición del tooltip
                            var tooltipRect = tooltip[0].getBoundingClientRect();
                            var windowWidth = $(window).width();

                            // Ajustar posición si el tooltip se sale de la pantalla por la derecha
                            if (tooltipRect.right > windowWidth) {
                                tooltip.css('left', 'auto').css('right', '0').css('transform', 'translateX(-5%)');
                            }

                            // Ajustar posición si el tooltip se sale de la pantalla por la izquierda
                            if (tooltipRect.left < 0) {
                                tooltip.css('left', '0').css('right', 'auto').css('transform', 'translateX(5%)');
                            }

                        }, function() {
                            tooltip.css('visibility', 'hidden').css('opacity', '0');
                            // Restaurar el estado original del tooltip
                            tooltip.css('left', '50%').css('right', 'auto').css('transform', 'translateX(-50%)');
                        });
                    });
                    */

                },

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
                "search": {
                    "caseInsensitive": true  
                }
            });

            $('#loading').hide();
            $('#alarmTable').show();

  
        },
        error: function() {
            alert('Error al cargar los datos');
        }
    });
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

/*******************************************************************************/
/*******************************************************************************/
/*******************************************************************************/
