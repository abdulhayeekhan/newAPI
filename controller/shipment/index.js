const db = require('../../confige')

exports.CreateShipment = async (shipeData) =>{
    const { 
        trackingNo,
        invoiceNo,
        carrierCode,
        SenderId,
        weightUnit,
        weight,
        dimensionUnit,
        lenght,
        width,
        height,
        currency,
        total,
        customerReference,
        shipDate,
        createdBy,
        clientCompanyId,
        consigneeId 
    } = shipeData;
    try {
        const sql = `
            INSERT INTO shipment (trackingNo,invoiceNo,carrierCode, SenderId, weightUnit, weight, dimensionUnit, lenght, width, height, currency, total, customerReference, shipDate, createdBy, clientCompanyId, consigneeId) 
            VALUES (?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?)`;

            // Use your db function to execute the query
            const result = await db(sql, [trackingNo,invoiceNo,carrierCode, SenderId, weightUnit, weight, dimensionUnit, lenght, width, height, currency, total, customerReference, shipDate, createdBy, clientCompanyId, consigneeId]);
            const insertedId = result.insertId;
            return { 
                message:"Shipment Create and Label Generete Succfully" , 
                data:{
                    id:insertedId,
                    trackingNo,
                    invoiceNo,
                    carrierCode,
                    SenderId,
                    weightUnit,
                    weight,
                    dimensionUnit,
                    lenght,
                    width,
                    height,
                    currency,
                    total,
                    customerReference,
                    shipDate,
                    createdBy,
                    clientCompanyId,
                    consigneeId
                } 
            };
    }catch(error){
        return error
    }
}