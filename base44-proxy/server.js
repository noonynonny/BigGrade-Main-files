import express from 'express';
import cors from 'cors';
import axios from 'axios';
import 'dotenv/config';

const app = express();
const PORT = 3001; // The proxy server will run on port 3001

// 1. Configuration
// Note: We use process.env.VITE_... to match the names used in the frontend's .env file
const BASE44_API_KEY = process.env.VITE_BASE44_API_KEY;
const BASE44_APP_ID = process.env.VITE_BASE44_APP_ID;
const BASE44_URL = 'https://app.base44.com/api/apps/';

// Check for required environment variables
if (!BASE44_API_KEY || !BASE44_APP_ID) {
    console.error("FATAL: VITE_BASE44_API_KEY and VITE_BASE44_APP_ID must be set in the .env file.");
    process.exit(1);
}

// 2. Middleware
// Allow BigGrade (running on port 3000 by default for react-scripts) to talk to this proxy
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));
app.use(express.json()); // To parse JSON bodies

// 3. The Proxy Endpoint
app.all('/base44/*', async (req, res) => {
    // Extract the target endpoint from the request URL
    const targetEndpoint = req.params[0]; 
    const targetUrl = `${BASE44_URL}${BASE44_APP_ID}/${targetEndpoint}`;

    console.log(`[PROXY] Forwarding ${req.method} request to: ${targetUrl}`);

    try {
        const response = await axios({
            method: req.method,
            url: targetUrl,
            headers: {
                'api_key': BASE44_API_KEY, // Inject the API key
                'Content-Type': 'application/json',
            },
            data: req.body,
            params: req.query,
            validateStatus: status => true, 
        });

        // Send the response back to the BigGrade frontend
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error("[PROXY ERROR]", error.message);
        res.status(error.response?.status || 500).json({
            error: 'Proxy failed to connect to Base44 API',
            details: error.message
        });
    }
});

// 4. Start the server
app.listen(PORT, () => {
    console.log(`Base44 Proxy Server running on http://localhost:${PORT}`);
    console.log(`Targeting Base44 App ID: ${BASE44_APP_ID}`);
});
