const db = require('../../confige')

exports.AddConsignee = async (consigneeeData) =>{
    const { clientCompanyId, name, companyName, contactNo, email, countryCode, stateCode,postalCode, city, address } = consigneeeData;
    try {

        const checkSql = `
        SELECT * 
        FROM consignee 
        WHERE clientCompanyId = ? 
            AND (contactNo = ? OR email = ?)
        `;
        const existingRecords = await db(checkSql, [clientCompanyId, contactNo, email]);

        if (existingRecords.length > 0) {
        // If a record exists, return an error or a message
            const updateSql = `
                UPDATE consignee
                SET name = ?, companyName = ?, countryCode = ?, stateCode = ?,postalCode = ?, city = ?, address = ?
                WHERE id = ?
            `;
            await db(updateSql, [
                name,
                companyName,
                countryCode,
                stateCode,
                postalCode,
                city,
                address,
                existingRecords[0].id,
            ]);
            return { consigneeId: existingRecords[0].id };
        }

        const sql = `
            INSERT INTO consignee (clientCompanyId, name, companyName, contactNo, email, countryCode, stateCode,postalCode, city, address) 
            VALUES (?, ?, ?, ?, ?,?,?,?,?)`;
            const result = await db(sql, [clientCompanyId,  name, companyName, contactNo, email, countryCode, stateCode,postalCode, city, address]);
            const insertedconsigneeId = result.insertId;
        
        
        return { consigneeId: insertedconsigneeId };
    }catch(error){
        console.log(error)
        return error
    }
}