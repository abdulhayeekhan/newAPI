const db = require('../../confige')
exports.getShipments = async ({ startDate, endDate, clientCompanyId, createdBy, companyName,trackingNo,pageNo,pageSize,refrenceNo }) =>{
    try{
        let query = `SELECT sh.*,co.*,com.companyName,inv.invoiceId as invoiceID FROM shipment as sh INNER JOIN consignee as co ON co.id = sh.consigneeId INNER JOIN company as com ON com.id = sh.clientCompanyId INNER JOIN invoice as inv ON inv.id = sh.invoiceNo WHERE 1=1`;
        const params = [];
    
        // Add filters dynamically
        if (startDate) {
            query += ` AND sh.createdAt >= ?`;
            params.push(startDate);
        }
        if (endDate) {
            query += ` AND sh.createdAt <= ?`;
            params.push(endDate);
        }
        if (clientCompanyId) {
            query += ` AND sh.clientCompanyId = ?`;
            params.push(clientCompanyId);
        }
        if (createdBy) {
            query += ` AND sh.createdBy = ?`;
            params.push(createdBy);
        }
        if (companyName) {
            query += ` AND co.companyName LIKE ?`;
            params.push(`%${companyName}%`); // Use `LIKE` for partial matches
        }
        if(trackingNo){
            query += ` AND sh.trackingNo = ?`;
            params.push(trackingNo);
        }
        if(refrenceNo){
            query += ` AND sh.customerReference = ?`;
            params.push(refrenceNo);
        }
    
        //query += ` ORDER BY sh.id DESC`;

        let countQuery = `
        SELECT COUNT(*) as totalCount
        FROM shipment as sh
        INNER JOIN consignee as co ON co.id = sh.consigneeId
        INNER JOIN company as com ON com.id = sh.clientCompanyId
        INNER JOIN invoice as inv ON inv.id = sh.invoiceNo
        WHERE 1=1
        `;
        const newparams = [];
        if (clientCompanyId) {
            countQuery += ` AND sh.clientCompanyId = ?`;
            newparams.push(clientCompanyId);
        }
        if (startDate) {
            countQuery += ` AND sh.createdAt >= ?`;
            newparams.push(startDate);
        }
        if (endDate) {
            countQuery += ` AND sh.createdAt <= ?`;
            newparams.push(endDate);
        }
        if(refrenceNo){
            countQuery += ` AND sh.customerReference = ?`;
            newparams.push(refrenceNo);
        }
        
        const totalCountResult = await db(countQuery, newparams);
        const totalCount = totalCountResult[0]?.totalCount || 0;

        const totalPages = Math.ceil(totalCount / pageSize);

        // Add pagination to the main query
        const offset = (pageNo - 1) * pageSize; // Calculate the offset based on pageNo and pageSize
        query += ` ORDER BY sh.id DESC LIMIT ? OFFSET ?`;
        params.push(pageSize, offset);

        const result = await db(query, params);
        // console.log('params',params)
        // const result = await db(query,params);
        // // return result;

        return {
            data: result,
            totalCount: totalCount,
            pageNo: pageNo,
            pageSize: pageSize,
            totalPages: totalPages,
        };
    }catch(error){
        return error
    }   
}