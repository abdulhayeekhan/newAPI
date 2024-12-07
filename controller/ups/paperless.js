const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// const upload = multer({ dest: 'uploads/' });

const uploadDocument = async (token) => {
  try {
  const filename = "filenamdrffe123654ddddd8596";
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



          const dirPath = path.join('/tmp', 'uploads');
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
          }
          const filePath = path.join(dirPath, `${filename}.txt`);

          // Write it to a text file
          fs.writeFileSync(filePath, textContent);

          // Read the file
          const fileContent = fs.readFileSync(filePath);
          const base64File = fileContent.toString('base64');
          //return {base64File:base64File,filePath:filePath};
  
          const paperless_res = await axios.post(
                        `https://onlinetools.ups.com/api/paperlessdocuments/v1/upload`,
                        {
                          UploadRequest: {
                            Request: {
                              TransactionReference: {
                                CustomerContext: '12365987456331'
                              }
                            },
                            UserCreatedForm: {
                              UserCreatedFormFileName: `${filename}.txt`,
                              UserCreatedFormFileFormat: 'txt',
                              UserCreatedFormDocumentType: '013',
                              UserCreatedFormFile: base64File
                            }
                          }
                        },
                        {
                          headers: {
                            'Content-Type': 'application/json',
                            transId: 'string',
                            transactionSrc: 'testing',
                            ShipperNumber: 'A70C63',
                            Authorization: `Bearer ${token}`
                          }
                        }
                      );
    // Send the response back to the client
    //res.status(200).json(response.data);
    return paperless_res?.data
  } catch (error) {
    return error
    
  }
}

module.exports = {
  uploadDocument
};
