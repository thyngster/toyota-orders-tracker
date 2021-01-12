((() => {
    // This functions opens a full modal, with all the info
    function showTrack(id) {
        window.location = '#/publish/search'
        setTimeout(function() {
            $('[data-tab="pane-search"]').text('Toyota Tracker');
            $('[data-tab="pane-dealer"]').remove();
            $('section#searchcomponent').empty();
            var datos = `
            * Atención!! . Esta pantalla no pertenece a la página oficinal de Toyota.es .<br />
                <h2>Datos Pedido</h2>
                <table width="100%" border="1">
                <tr>
                <td width="30%"><strong>ID Pedido</strong></td>
                <td>${window._tyt[id].orderDetails.orderId}</td>
                </tr>
                <tr>
                <td width="30%"><strong>Fecha Formalización Pedido</strong></td>
                <td>${window._tyt[id].orderDate}</td>
                </tr>
                <tr>
                <td width="30%"><strong>Estado Pedido</strong></td>
                <td>${window._tyt[id].orderStatus}</td>
                </tr>
    
                <tr>
                <td width="30%"><strong>Pedido Finalizado</strong></td>
                <td>${window._tyt[id].isComplete}</td>
                </tr>
    
                <tr>
                <tr>
                <td width="30%"><strong>Está retrasado?</strong></td>
                <td>${window._tyt[id].currentStatus.isDelayed ? "Yes" : "No"}</td>
                </tr>
    
                <tr>
                <td width="30%"><strong>Código de daño</strong></td>
                <td>${window._tyt[id].currentStatus.damageCode === "" ? "Sin Daños" : window._tyt[id].currentStatus.damageCode}</td>
                </tr>
    
    
                <tr>
                <td width="30%"><strong>callOffStatus</strong></td>
                <td>${window._tyt[id].currentStatus.callOffStatus}</td>
                </tr>
    
                <tr>
                <td width="30%"><strong>Estado Actual</strong></td>
                <td>${window._tyt[id].currentStatus.currentStatus}</td>
                </tr>
    
                <tr>
                <td width="30%"><strong>Disponible Fecha de Entrega?</strong></td>
                <td>${window._tyt[id].etaToFinalDestination}</td>
                </tr>
    
                <td width="30%"><strong>Fecha de entrega estimada</strong></td>
                <td>${window._tyt[id].currentStatus.estimatedDeliveryToFinalDestination}</td>
                </tr>
    
                </table>
                <hr />
                <h2>Datos Vehículo</h2>
                <table width="100%" border="1">
    
                <tr>
                <td width="30%"><strong>Brand</strongg></td>
                <td>${window._tyt[id].orderDetails.brand}</td>
                </tr>
    
                <tr>
                <td width="30%"><strong>Modelo</strongg></td>
                <td>${window._tyt[id].orderDetails.vehicleModel}</td>
                </tr>
    
                <tr>
                <td width="30%"><strong>Codigo Modelo</strongg></td>
                <td>${window._tyt[id].orderDetails.modelCode}</td>
                </tr>
    
                <tr>
                <td width="30%"><strong>Motor</strongg></td>
                <td>${window._tyt[id].orderDetails.engine}</td>
                </tr>
    
                <tr>
                <td width="30%"><strong>Puertas</strongg></td>
                <td>${window._tyt[id].orderDetails.suffix}</td>
                </tr>
    
    
                <tr>
                <td width="30%"><strong>Transmision</strongg></td>
                <td>${window._tyt[id].orderDetails.transmission}</td>
                </tr>
    
    
                <tr>
                <td width="30%"><strong>Motor</strongg></td>
                <td>${window._tyt[id].orderDetails.engine}</td>
                </tr>
    
    
                <tr>
                <td width="30%"><strong>Color</strongg></td>
                <td>${window._tyt[id].orderDetails.vehicleExternalColor}</td>
                </tr>
    
                <tr>
                <td width="30%"><strong>VIN</strongg></td>
                <td>${window._tyt[id].vin}</td>
                </tr>
    
                <tr>
                <td width="30%"><strong>URN</strongg></td>
                <td>${window._tyt[id].urn}</td>
                </tr>
    
                <tr>
                <td width="30%"><strong>Katashiki</strongg></td>
                <td>${window._tyt[id].orderDetails.fullKatashiki} <a href="https://en.wikipedia.org/wiki/Toyota_model_codes">[+]</a></td>
                </tr>
    
    
                <tr>
                <td width="30%"><strong>SSN</strong></td>
                <td>${window._tyt[id].orderDetails.ssn}</td>
                </tr>
    
                <tr>
                <td width="30%"><strong>NMSC</strongg></td>
                <td>${window._tyt[id].orderDetails.nmsc}</td>
                </tr>
    
    
                </table>
    
                <hr />
                <h2>Datos Concesionario</h2>
                <table width="100%" border="1">
    
                <tr>
                <td width="30%"><strong>Nombre</strongg></td>
                <td>${window._tyt[id].dealerDetails.name}</td>
                </tr>
    
                <tr>
                <td width="30%"><strong>Direccion 1</strongg></td>
                <td>${window._tyt[id].dealerDetails.address1}</td>
                </tr>
    
                <tr>
                <td width="30%"><strong>Direccion 2</strongg></td>
                <td>${window._tyt[id].dealerDetails.address2}</td>
                </tr>
    
                <tr>
                <td width="30%"><strong>Pais</strongg></td>
                <td>${window._tyt[id].dealerDetails.countryCode}</td>
                </tr>
    
                <tr>
                <td width="30%"><strong>Dealer Code</strongg></td>
                <td>${window._tyt[id].dealerDetails.dealerCode}</td>
                </tr>
    
                <tr>
                <td width="30%"><strong>Email</strongg></td>
                <td>${window._tyt[id].dealerDetails.email}</td>
                </tr>
    
    
                <tr>
                <td width="30%"><strong>Telefono</strongg></td>
                <td>${window._tyt[id].dealerDetails.phone}</td>
                </tr>
                </table>
                `
                        var steps = `<hr /><h2>Pasos</h2><table border="1">
                <tr>
                <td>Código</td>
                <td>Nombre</td>
                <td>Tipo Localización</td>
                <td>Pais</td>
                <td>Llegada Estimada</td>
                <td>Salida Estimada</td>
                <td>Metodo transporte</td>
                <td>Lat</td>
                <td>Long</td>
                <td>Visitado</td>
                </tr>`
    
            Object.values(window._tyt[id].intermediateDeliveries).forEach(e=>{
                steps = steps + `
                    <tr>
                    <td>${e.locationCode}</td>
                    <td>${e.locationName}</td>
                    <td>${e.destinationType}</td>
                    <td>${e.countryCode}</td>
                    <td>${e.estimatedArrivalDate}</td>
                    <td>${e.leftLocationOn}</td>
                    <td>${e.transportMethod}</td>
                    <td>${e.locationLatitude}</td>
                    <td>${e.locationLongitude}</td>
                    <td>${e.isVisited}</td>
                    </tr>
        `
            }
            )
            steps = steps + '</table>'
            $('section#searchcomponent').html(datos + steps)
        }, 250)
    
    }
        
    window._tyt = {}
    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        var _url = url;
        this.addEventListener('load', function() {
            if(_url.match(/\/api\/orderTracker\/orders\/(.+)$/)){
                if(this.responseText){
                    var data = JSON.parse(this.responseText)[0];
                    if(!window._tyt[data.orderId]) window._tyt[data.orderId] = {
                        orderId: data.orderId,
                        isComplete: data.isComplete,
                        orderDate: data.associationDate,
                        orderStatus: data.status,
                        brand: data.brand,
                        type: data.type
                    }
                }
            }    
            if(_url.match(/\/api\/orderTracker\/user\/(.+)\/orderStatus\/(.+)/)){
                if(this.responseText){
                    var orderId = _url.match(/\/api\/orderTracker\/user\/(.+)\/orderStatus\/(.+)/)[2];
                    var orderStatusData = JSON.parse(this.responseText);
                    window._tyt[orderId] = Object.assign(window._tyt[orderId],orderStatusData);
                    $(document).on('click', '[data-test-id^="purchased-vehicle-tile"]', function(e) {
                        var orderId = String($(this).data('testId').split('-').reverse()[0]);
                        console.log(orderId)
                        setTimeout(function() {
                            showTrack(orderId)
                        }, 1000)
                    });
                    
                }                
            }
            
        });        
        origOpen.apply(this, arguments);
    };
}))();