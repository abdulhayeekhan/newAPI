const db = require('../../confige')
exports.getShipments = async ({ startDate, endDate, clientCompanyId, createdBy, companyName,trackingNo }) =>{
    try{
        let query = `SELECT * FROM shipment as sh INNER JOIN consignee as co ON co.id = sh.consigneeId WHERE 1=1`;
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
    
        query += ` ORDER BY sh.id DESC`;
        console.log('params',params)
        const result = await db(query,params);
        return result;
    }catch(error){
        return error
    }   
}