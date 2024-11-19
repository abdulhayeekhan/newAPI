const db = require('../../confige')

exports.SaveLabel = async (saveLabel) =>{
    const { trackingId, graphicImage, createdBy} = saveLabel;
    try {
        const sql = `
                    INSERT INTO labels (trackingId, graphicImage, createdBy) 
                    VALUES (?, ?, ?)`;
                    // Use your db function to execute the query
        const result = await db(sql, [trackingId, graphicImage, createdBy]);
        const insertedInvoiceId = result.insertId;
        return {
            id:insertedInvoiceId,
            trackingId, 
            graphicImage, 
            createdBy
        }
    } catch (error) {
        return error
    }
}   