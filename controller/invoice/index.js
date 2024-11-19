const db = require('../../confige')
const crypto = require('crypto');

exports.GenerateInvoice = async (invoiceData) =>{
 
        const { trackingNo, total, senderId, consigneeId, createdBy, createdAt, details } = invoiceData;
        const invoiceId = crypto.randomBytes(5).toString('hex').slice(0, 10);
        //const connection = db
          
            // if (err) {
            //   connection.release();
            //   return res.status(500).send({ error: 'Transaction failed' });
            // }
            console.log('details',details)
            if (!Array.isArray(details) || details.length === 0) {
                throw new Error('Details must be a non-empty array');
              }
            // Insert into `invoice`
            try {
                const sql = `
                    INSERT INTO invoice (trackingNo, total, senderId, consigneeId,invoiceId, createdBy) 
                    VALUES (?, ?, ?, ?, ?,?)`;

                    // Use your db function to execute the query
                    const result = await db(sql, [trackingNo, total, senderId, consigneeId,invoiceId, createdBy]);
                    const insertedInvoiceId = result.insertId;  // Get the auto-generated invoiceId
             
                    //Now insert the invoice details into `invoicedetail`
                    // const detailsQuery = `
                    // INSERT INTO invoicedetail (invoiceId, description, Qty, unitPrice, HtsCode, totalPrice) 
                    // VALUES ?`;
                    // const detailValues = details.map(d => [
                    // insertedInvoiceId,  // Use the newly inserted invoiceId
                    // d.description,
                    // d.Qty,
                    // d.unitPrice,
                    // d.HtsCode,
                    // d.totalPrice
                    // ]);

                    // // // Insert the details into the database
                    // await db(detailsQuery, [detailValues]);

                    const detailsQuery = `
                        INSERT INTO invoicedetail (invoiceId, description, Qty, unitPrice, HtsCode, totalPrice)
                        VALUES ${details.map(() => '(?, ?, ?, ?, ?, ?)').join(', ')}
                        `;

                        const detailValues = details.flatMap(d => [
                        insertedInvoiceId,  // Use the newly inserted invoiceId
                        d.description,
                        d.Qty,
                        d.unitPrice,
                        d.HtsCode,
                        d.totalPrice,
                        ]);

                        console.log('Generated Query:', detailsQuery);
                        console.log('Detail Values:', detailValues);

                        await db(detailsQuery, detailValues);


                    // Return success response
                    //invoiceId: insertedInvoiceId
                    return { invoiceId: insertedInvoiceId };
                //return result
            } catch (error) {
                console.log(error)
                return error
            }
            

            //     const invoiceQuery = `
            //   INSERT INTO invoice (trackingNo, total, senderId, consigneeId, createdBy, createdAt) 
            //   VALUES (?, ?, ?, ?, ?, ?)`;
            // db.query(
            //   invoiceQuery,
            //   [trackingNo, total, senderId, consigneeId, createdBy, createdAt],
            //   (err, result) => {
            //     if (err) {
            //       return connection.rollback(() => {
            //         connection.release();
            //         res.status(500).send({ error: 'Failed to create invoice', details: err });
            //       });
            //     }
      
            //     const invoiceId = result.insertId;
      
            //     // Insert into `invoicedetail`
            //     const detailsQuery = `
            //       INSERT INTO invoicedetail (invoiceId, description, Qty, unitPrice, HtsCode, totalPrice) 
            //       VALUES ?`;
            //     const detailValues = details.map(d => [
            //       invoiceId,
            //       d.description,
            //       d.Qty,
            //       d.unitPrice,
            //       d.HtsCode,
            //       d.totalPrice
            //     ]);
      
            //     connection.query(detailsQuery, [detailValues], (err, result) => {
            //       if (err) {
            //         return connection.rollback(() => {
            //           connection.release();
            //           res.status(500).send({ error: 'Failed to create invoice details', details: err });
            //         });
            //       }
      
            //       connection.commit(err => {
            //         connection.release();
            //         if (err) return res.status(500).send({ error: 'Transaction commit failed' });
            //         res.status(201).send({ message: 'Invoice and details created', invoiceId });
            //       });
            //     });
            //   }
            // );
    
        
    
}