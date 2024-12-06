const axios = require('axios');
const path = require('path');
const fs = require('fs');

const uploadDocument = async (token) => {
  const version = 'v1';  // Replace with actual version parameter
  
  const textContent = `Tracking Number:
          Total: 
          SENDER: ESCM GMBH
          SENDER ADDRESS: Koln, Germany 50829
          SENDER PHONE: 0049-15202446893
          SENDER COUNTRY: Germany
          CONSIGNEE : 
          CONSIGNEE ADDRESS: 
          CONSIGNEE PHONE: 
          CONSIGNEE COUNTRY: 
          DETAILS: 
          `;

          const dirPath = path.join(__dirname, 'uploads');
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
          }
          const filePath = path.join(dirPath, `${token}.txt`);

          // Write it to a text file
          fs.writeFileSync(filePath, textContent);

          // Read the file
          const fileContent = fs.readFileSync(filePath);
          const base64File = fileContent.toString('base64');

  // try {
  //   const response = await axios.post(
  //     `https://wwwcie.ups.com/api/paperlessdocuments/${version}/upload`,
  //     {
  //       UploadRequest: {
  //         Request: {
  //           TransactionReference: {
  //             CustomerContext: '123654788995'
  //           }
  //         },
  //         UserCreatedForm: {
  //           UserCreatedFormFileName: 'TestFile.txt',
  //           UserCreatedFormFileFormat: 'txt',
  //           UserCreatedFormDocumentType: '013',
  //           UserCreatedFormFile: 'Tm90aWNlDQpJbiBhbGwgY29tbXVuaWNhdGlvbnMgd2l0aCBVUFMgY29uY2VybmluZyB0aGlzIGRvY3VtZW50LCBwbGVhc2UgcmVmZXIgdG8gdGhlIGRvY3VtZW50IGRhdGUgbG9jYXRlZCBvbiB0aGUgY292ZXIuDQpDb3B5cmlnaHQNClRoZSB1c2UsIGRpc2Nsb3N1cmUsIHJlcHJvZHVjdGlvbiwgbW9kaWZpY2F0aW9uLCB0cmFuc2Zlciwgb3IgdHJhbnNtaXR0YWwgb2YgdGhpcyB3b3JrIGZvciBhbnkgcHVycG9zZSBpbiBhbnkgZm9ybSBvciBieSBhbnkgbWVhbnMgd2l0aG91dCB0aGUgd3JpdHRlbiBwZXJtaXNzaW9uIG9mIFVuaXRlZCBQYXJjZWwgU2VydmljZSBpcyBzdHJpY3RseSBwcm9oaWJpdGVkLg0KwqkgQ29weXJpZ2h0IDIwMTYgVW5pdGVkIFBhcmNlbCBTZXJ2aWNlIG9mIEFtZXJpY2EsIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC4NClRyYWRlbWFya3MNClVQUyBPbkxpbmXCriBpcyBhIHJlZ2lzdGVyZWQgdHJhZGVtYXJrIG9mIFVuaXRlZCBQYXJjZWwgU2VydmljZSBvZiBBbWVyaWNhLCBJbmMuIEFsbCBvdGhlciB0cmFkZW1hcmtzIGFyZSB0aGUgcHJvcGVydHkgb2YgdGhlaXIgcmVzcGVjdGl2ZSBvd25lcnMuDQpTb21lIG9mIHRoZSBVUFMgY29ycG9yYXRlIGFwcGxpY2F0aW9ucyB1c2UgVS5TLiBjaXR5LCBzdGF0ZSwgYW5kIHBvc3RhbCBjb2RlIGluZm9ybWF0aW9uIG9idGFpbmVkIGJ5IFVuaXRlZCBQYXJjZWwgU2VydmljZSBvZiBBbWVyaWNhLCBJbmMuIHVuZGVyIGEgbm9uLWV4Y2x1c2l2ZSBsaWNlbnNlIGZyb20gdGhlIFVuaXRlZCBTdGF0ZXMgUG9zdGFsIFNlcnZpY2UuIA0K'
  //         }
  //       }
  //     },
  //     {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         transId: 'string',
  //         transactionSrc: 'testing',
  //         ShipperNumber: 'A70C63',
  //         Authorization: `Bearer ${token}`
  //       }
  //     }
  //   );

  //   // Send the response back to the client
  //   //res.status(200).json(response.data);
  //   return response.data
  // } catch (error) {
  //   return error
    
  // }
}

module.exports = {
  uploadDocument
};
