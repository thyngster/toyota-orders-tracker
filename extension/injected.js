((() => {
    // This functions opens a full modal, with all the info
    function showTrack(id) {
        window.location = '#/publish/search'
        setTimeout(function() {
            $('[data-tab="pane-search"]').text('Toyota Tracker');
            $('[data-tab="pane-dealer"]').remove();
            $('section#searchcomponent').empty();
            var currentdate = new Date(); 
            var ahora = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();

            var datos = `
                <p style="color:red"><strong>¡Atención! Esta pantalla no pertenece a la página oficial de Toyota.es.</strong></p><br />
                <h2>Datos Pedido a fecha ${ahora}</h2>
                <table width="100%" border="1">
                    <colgroup>
                        <col style="background-color:LightGray" width="15%">
                        <col style="background-color:white" width="85%">
                    </colgroup>
                    <tr>
                        <td>ID Pedido</td>
                        <td>${window._tyt[id].orderDetails.orderId}</td>
                    </tr>
                    <tr>
                        <td>Fecha Formalización</td>
                        <td>${window._tyt[id].orderDate}</td>
                    </tr>
                </table>
                    
                <hr />

                <table width="100%" border="1">
                    <colgroup>
                        <col style="background-color:LightGray" width="15%">
                        <col style="background-color:white" width="35%">
                        <col style="background-color:LightGray" width="15%">
                        <col style="background-color:white" width="35%"> 
                    </colgroup>
                    <tr>
                        <td>Estado Pedido</td>
                        <td>${window._tyt[id].orderStatus}</td>
                        <td>Pedido Finalizado</td>
                        <td>${window._tyt[id].isComplete}</td>
                    </tr>
        
                    <tr>
                        <td>¿Está retrasado?</td>
                        <td>${window._tyt[id].currentStatus.isDelayed ? "Yes" : "No"}</td>
                        <td>Código de daño</td>
                        <td>${window._tyt[id].currentStatus.damageCode === "" ? "Sin Daños" : window._tyt[id].currentStatus.damageCode}</td>
                    </tr>

                    <tr>
                        <td>callOffStatus</td>
                        <td>${window._tyt[id].currentStatus.callOffStatus}</td>
                        <td>Estado Actual</td>
                        <td>${window._tyt[id].currentStatus.currentStatus}</td>
                    </tr>
        
                    <tr>
                        <td>¿Disponible Fecha de Entrega?</td>
                        <td>${window._tyt[id].etaToFinalDestination}</td> 
                        <td>Fecha de entrega estimada</td>
                        <td>${window._tyt[id].currentStatus.estimatedDeliveryToFinalDestination}</td>
                    </tr>    
                </table>
                    
                <hr />

                <h2>Datos del Vehículo</h2>

                <table width="100%" border="1">
                    <colgroup>
                        <col style="background-color:LightGray" width="15%">
                        <col style="background-color:white" width="35%">
                        <col style="background-color:LightGray" width="15%">
                        <col style="background-color:white" width="35%"> 
                    </colgroup>
                    <tr>
                        <td>Brand</td>
                        <td>${window._tyt[id].orderDetails.brand}</td>
                        <td>Modelo</td>
                        <td>${window._tyt[id].orderDetails.vehicleModel}</td>
                    </tr>
        
                    <tr>
                        <td>Codigo Modelo</td>
                        <td>${window._tyt[id].orderDetails.modelCode}</td>
                        <td>Motor</td>
                        <td>${window._tyt[id].orderDetails.engine}</td>
                    </tr>
        
                    <tr>
                        <td>Puertas</td>
                        <td>${window._tyt[id].orderDetails.suffix}</td>
                        <td>Transmision</td>
                        <td>${window._tyt[id].orderDetails.transmission}</td>
                    </tr>

                    <tr>
                        <td>Motor</td>
                        <td>${window._tyt[id].orderDetails.engine}</td>
                        <td>Color</td>
                        <td>${window._tyt[id].orderDetails.vehicleExternalColor} <a href=${window._tyt[id].orderDetails.imageUrl} target="_blank">[+]</a></td>
                    </tr>
        
                    <tr>
                        <td>VIN</td>
                        <td>${window._tyt[id].vin}</td>
                        <td>URN</td>
                        <td>${window._tyt[id].urn}</td>
                    </tr>
        
                    <tr>
                        <td>Katashiki</td>
                        <td>${window._tyt[id].orderDetails.fullKatashiki} <a href="https://en.wikipedia.org/wiki/Toyota_model_codes" target="_blank">[+]</a></td>
                        <td>SSN</td>
                        <td>${window._tyt[id].orderDetails.ssn}</td>
                    </tr>
        
                    <tr>
                        <td>NMSC</td>
                        <td>${window._tyt[id].orderDetails.nmsc}</td>
                    </tr>
                </table>
        
                <hr />
                
                <h2>Datos Concesionario</h2>
                
                <table width="100%" border="1">   
                    <colgroup>
                        <col style="background-color:LightGray" width="15%">
                        <col style="background-color:white" width="35%">
                        <col style="background-color:LightGray" width="15%">
                        <col style="background-color:white" width="35%"> 
                    </colgroup>

                    <tr>
                        <td>Nombre</td>
                        <td colspan="3">${window._tyt[id].dealerDetails.name}</td>
                    </tr>

                    <tr>
                        <td>Direccion 1</td>
                        <td>${window._tyt[id].dealerDetails.address1}</td>
                        <td>Direccion 2</td>
                        <td>${window._tyt[id].dealerDetails.address2}</td>
                    </tr>

                    <tr>
                        <td>Pais</td>
                        <td>${window._tyt[id].dealerDetails.countryCode}</td>
                        <td>Dealer Code</td>
                        <td>${window._tyt[id].dealerDetails.dealerCode}</td>
                    </tr>

                    <tr>
                        <td>Email</td>
                        <td>${window._tyt[id].dealerDetails.email}</td>
                        <td>Telefono</td>
                        <td>${window._tyt[id].dealerDetails.phone}</td>
                    </tr>
                </table>
                                    
                <hr />
            `

            if (window._tyt[id].intermediateDeliveries == null) {
                var steps = `<hr /><h2>El pedido aún no tiene pasos.</h2><table border="1">`
            } else {
                var steps = `<hr /><h2>Pasos del Pedido</h2><table border="1">
                    <tr style="background-color:LightGray; font-size:1.3rem">
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
                    </tr>
                `
                
                Object.values(window._tyt[id].intermediateDeliveries).forEach(e=>{
                    steps = steps + `<tr style="font-size:1.3rem">
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
                    </tr>`
                    }
                )
            }
            steps = steps + '</table>'
            $('#orDashboard').html(datos + steps)
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
