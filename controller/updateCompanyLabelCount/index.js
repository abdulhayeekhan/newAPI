const db = require('../../confige')

exports.UpdateCompanyLabelCount = async (companyId) =>{
    try {
        console.log('companyId:',companyId)
        const sql = "UPDATE company SET labelCount = labelCount - 1 WHERE id = ? AND labelCount > 0";
        const result = await db(sql, [companyId]);
        return result;
    } catch (error) {
        return error
    }
}