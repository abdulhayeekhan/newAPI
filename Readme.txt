1: Create Shipment Tracking
--| URL: /localShipment/createClientAndShipment
  |___
      | Method: POST 
      | request body:
        {
            "FirstName": "Ali",
            "LastName": "Khan",
            "CNIC": "35202-1234567-8",
            "ContactNo": "03001234567",
            "Email": "ali@example.com",
            "PostalCode": "54000",
            "CityId": 1,
            "CreatedBy": 3,
            "ModifiedBy": 3,
            "Weight": 3.5,
            "WeightUnit": "Kg",
            "Description": "Electronics",
            "BookingCityId": 1,
            "IsForUK":0/1
        }

2: Update Multi Tracking Status
--| URL: /localShipment/UpdateShipmentStatus
  |___
      | Method: POST
        request body :
        {
            "shipmentIds": [3,4],
            "statusId": 3,
            "createdBy": 3
        }

3: Get TrackingId History
--| URL: /localShipment/tracking
  |___
      | Method: POST
        request body :
        {
            "trackingId": "THC8003957"
        }

4: GET TrackingList
--| URL: GET /tracking?pageNo=1&pageSize=10&createdBy=admin&trackingId=THC80039577&deliveryStatusId=1
  |___  
      | Method : GET
        params: pageNo, pageSize , createdBy, trackingId, deliveryStatusId
        

