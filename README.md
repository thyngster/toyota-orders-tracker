
# TOYOTA ORDERS ADVANCED TRACKER


# WHAT IT DOES

This Chrome extension allows you to see your order full details rather than the small set of data being shown on the current Toyota site.

 - VIN Number ( after the cart leaves the factory )
 - URN Number  ( after the cart leaves the factory )
 - Katashiki Number ( after the cart leaves the factory ) 
 - Car Brand
 - Car Model
 - Engine Details
 - Color Details
 - SSN
 - NMSC
 - Car Order Formalization Date ( when the order was set on Toyota Systems )
 - Current Order Status
 - Estimate Delivery Date 
 - Order isDamaged status
 - Current Dealer Details

Step Locations Details

 - Current/Past steps names
 - Steps locations Country
 - Location Latitud
 - Location Longiture
 - Location isVisited
 - Location Type ( Factory, Hub, Transit, Destination )
 - Location Code

This will allow to track your order more accurately than the official website, since you'll be able to see on which date your car arrived into an specific step and also what's the estimated time for the next step ( like when the car leaves a port, and when arrives (estimated) to the next location.

# How it works.

This extensions intercepts the XHR requests made by toyata.es in order to grab the current full data for your orders. 

After this, it will show a modal with all the info about your order.

In any case this data is sent to anywhere, it's only visible for the current logged user. 

You have access to the current code, feel free to peek at it, if you want to see how the data is managed.

# USAGE

-   Navigate to  `chrome://extensions`
-   Expand the Developer dropdown menu and click “Load Unpacked Extension”
-   Navigate to the local folder containing the extension’s code and click Ok
-   Assuming there are no errors, the extension should load into your browser

# ADVISE

I did this tool for my own usage, and when my car arrives, I won't be able to keep this updates. I'm sharing it as open source on Github in case anyone want to continue the work. 