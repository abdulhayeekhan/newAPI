const express = require('express');
require('dotenv').config();

const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;


// Create a MySQL connection
//const db = require('./confige/index')


//routes
const countryRoutes = require('./routers/countries');
// const companyRoutes = require('./routers/company');
// const stateRouter = require('./routers/state');
const userRouter = require('./routers/account');
// const upsRouter = require('./routers/ups')
// const trackingRouter = require('./routers/ups')
// const shipmentRouter = require('./routers/shipment')
// const router = require('./routers/cities');
app.use(cors());

// Other middleware and routes
app.use(express.json());

app.use(bodyParser.json());

app.use("/api",(req,res) =>{
    try {
        // Your logic here
        res.status(200).json({ message: 'Success!' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


app.use('/country', countryRoutes);
// app.use('/company', companyRoutes);
// app.use('/state', stateRouter);
app.use('/account', userRouter);
// app.use('/ups', upsRouter);
// app.use('/shipment', shipmentRouter);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});