const express = require('express');
const axios = require('axios');
const path = require('path');
const os = require('os');
const {
  randomBytes,
} = require('node:crypto');

const app = express();
const port = 3010;

app.use((req, res, next) => {
    if (req.url.endsWith('.js') || req.url.endsWith('.css?v0.0.1')) {
        //res.cookie('myCookie', Date.now().toString());
    }
    next();
});

// app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../public'), {
   setHeaders: (res, path) => {
       if (path.endsWith('.css') || path.endsWith('.js')) {
           res.setHeader('Cache-Control', 'public, max-age=3600'); 
           // res.setHeader('Cache-Control', 'public, max-age=60, must-revalidate');
           // res.setHeader('Cache-Control', 'public, max-age=120, proxy-revalidate');
           // res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=20');
           // res.setHeader('Cache-Control', 'public, max-age=30, stale-if-error=20');
       }
   }
}));

async function getRandomPokemon() {
    const randomId = Math.floor(Math.random() * 898) + 1;
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
    const pokemon = response.data;
    
    return {
        name: pokemon.name,
        image: pokemon.sprites.front_default,
        abilities: pokemon.abilities.map(ability => ability.ability.name).join(', ')
    };
}

app.get('/static/images/pokemon.png', async (req, res) => {
    try {
        const pokemon = await getRandomPokemon();

        // res.cookie('myCookie', Date.now().toString());
        // res.setHeader('Cache-Control', 'public, max-age=20'); 
        
        const imageResponse = await axios.get(pokemon.image, { responseType: 'stream' });
        res.setHeader('Content-Type', 'image/png');
        imageResponse.data.pipe(res);
    } catch (error) {
        console.error("Failed to fetch Pokémon image:", error);
        res.status(500).send('Failed to fetch Pokémon image');
    }
});

app.get('/timeout/:number', async (req, res) => {
    const seconds = parseInt(req.params.number, 10);

    if (isNaN(seconds) || seconds < 0 || seconds > 600) {
        return res.status(400).send('Invalid timeout duration. Please provide a number between 0 and 600.');
    }

    await new Promise(resolve => setTimeout(resolve, seconds * 1000));
    res.redirect(302, "/timeout-response");
});

app.get('/api/test', (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=43561'); 
    res.status(200).send('I return 200 🐸');
});
app.get('/api/test-2', (req, res) => {
    res.setHeader('Cache-Control', 'private, max-age=100'); 
    res.status(200).send('I return 200 🐸🐸');
});
app.get('/api/test-3', (req, res) => {
    res.setHeader('Cache-Control', 'private, max-age=100'); 
    res.status(200).send('I return 200 🐸🐸🐸');
});

app.get('/redirect-301', (req, res) => {
    res.redirect(301, '/redirected-url');
}); 

app.get('/diagnose', (req, res) => {
    res.redirect(302, 'xianluye.html?shareName=vns1199.cc&proxyAccount=');
});

app.get('/slow', (req, res) => {
    console.log(`[${new Date().toISOString()}] /slow hit`);
    setTimeout(() => {
      res.send('Still alive...');
    }, 15000); 
});

const staticLastModified = new Date('2024-01-02T12:00:00Z');
app.get('/api/not-modified', (req, res) => {
    res.setHeader('Last-Modified', staticLastModified.toUTCString());
    // res.setHeader('Cache-Control', 'public, max-age=20, must-revalidate');

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Not Modified</title>
        </head>
        <body 
        style="display: flex; height: 100vh; justify-content: center; 
        align-items: center; background: #111; color: crimson;">
        <div style="max-width: 400px; height: 200px;">  
            <h3 style="text-align: center; margin-bottom: -5px;">Hello from /api/not-modified v8</h3>
            <hr>
            <h5 style="text-align: center; margin-top: -5px;">This content does not change.</h5>

            <h1 style="text-align: center; margin-top: -5px;">304</h1>
        </div>    
        </body>
        </html>
    `);
});

app.get('/api/pokemon', (req, res) => {
    const auth = req.headers['authorization'];

    if (!auth) {
        return res.status(401).json({ error: 'Unauthorized: Authorization header is required.' });
    }

    res.json({ success: true, message: 'Authorization header is present.' });
});

  
app.use(async (req, res, next) => {
    try {
        const pokemon = await getRandomPokemon();
        
        const requestHeaders = req.headers;
        const requestTime = new Date().toLocaleString();
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        const requestMethod = req.method;
        const requestUri = req.originalUrl;
        const serverName = os.hostname();
        const serverSoftware = req.get('X-Powered-By') || 'Node.js';
        
        const responseHeaders = res.getHeaders();
        const responseStatus = res.statusCode;

        // res.cookie('myCookie', Date.now().toString());
        res.setHeader('Cache-Control', 'public'); 

        res.send(`
            <html>
                <head>
                    <title>Random Pokémon: ${pokemon.name}</title>
                    <link rel="stylesheet" href="/style.css">
                    <script src="/script.js"></script>
                    <style>
                        .api-section { margin: 20px 0; padding: 10px; border: 1px solid #ccc; border-radius: 10px; }
                        .api-button { margin: 5px; padding: 10px 10px; background:rgb(107, 202, 249); color: white; border: none; border-radius: 5px; cursor: pointer; }
                        .api-button:hover { background:rgb(52, 201, 242); }
                        .api-response { margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 3px; }
                        .loading { color: #666; font-style: italic; }
                    </style>
                </head>
                <body class="text-slate-900 font-sans text-center">
                    <div class="container mx-auto">
                        <h1 class="text-4xl font-bold mt-10 text-slate-600">Random Pokémon: ${pokemon.name}</h1>
                        <div class="border border-2 border-slate-900/30 p-4 mx-auto w-max h-max mt-5">
                            <!-- Use the static image path for the Pokémon image -->
                            <img src="/static/images/pokemon.png" alt="${pokemon.name}">
                        </div>
                        <p class="mt-5 text-lg"><strong>Abilities:</strong> ${pokemon.abilities}</p>
                        <a href="/" class="text-blue-500 hover:text-blue-700 mt-5 inline-block text-lg">Get Another Pokémon</a>

                        <h2 class="text-2xl font-semibold mt-10">Request Information</h2>
                        <p class="mt-3"><strong>Current Server Time:</strong> ${requestTime}</p>
                        <p><strong>Client IP Address:</strong> ${clientIp}</p>
                        <p><strong>Request Method:</strong> ${requestMethod}</p>
                        <p><strong>Request URI:</strong> ${requestUri}</p>
                        <p><strong>Server Name:</strong> ${serverName}</p>
                        <p><strong>Server Software:</strong> ${serverSoftware}</p>

                        <h3 class="mt-10 text-xl font-medium">Request Headers:</h3>
                        <table class="mt-5 table-auto w-full border-collapse border border-slate-300">
                            <tr class="bg-slate-200">
                                <th class="px-4 py-2 border border-slate-300">Header</th>
                                <th class="px-4 py-2 border border-slate-300">Value</th>
                            </tr>
                            ${Object.entries(requestHeaders).map(([key, value]) => {
                                return `<tr><td class="px-4 py-2 border border-slate-300 min-w-64">${key}</td><td class="px-4 py-2 border border-slate-300 text-wrap">${value}</td></tr>`;
                            }).join('')}
                        </table>

                        <h2 class="text-2xl font-semibold mt-10">Response Information</h2>
                        <p><strong>Response Status Code:</strong> ${responseStatus}</p>

                        <h3 class="mt-10 text-xl font-medium">Response Headers:</h3>
                        <table class="mt-5 table-auto w-full border-collapse border border-slate-300 mb-8">
                            <tr class="bg-slate-200">
                                <th class="px-4 py-2 border border-slate-300">Header</th>
                                <th class="px-4 py-2 border border-slate-300">Value</th>
                            </tr>
                            ${Object.entries(responseHeaders).map(([key, value]) => {
                                return `<tr><td class="px-4 py-2 border border-slate-300">${key}</td><td class="px-4 py-2 border border-slate-300">${value}</td></tr>`;
                            }).join('')}
                        </table>

                        <div class="api-section">
                            <h2 class="text-2xl font-semibold mb-5">API Testing</h2>
                            <div>
                                <button class="api-button" onclick="testApi('/api/test')">Test API 1 (200)</button>
                                <button class="api-button" onclick="testApi('/api/test-2')">Test API 2 (200)</button>
                                <button class="api-button" onclick="testApi('/api/test-3')">Test API 3 (200)</button>
                            </div>
                            <div id="api-response" class="api-response" style="display: none;"></div>
                        </div>
                    </div>

                    <script>
                        async function testApi(url, options = {}) {
                            const responseDiv = document.getElementById('api-response');
                            responseDiv.style.display = 'block';
                            responseDiv.innerHTML = '<div class="loading">Loading...</div>';
                            
                            try {
                                const startTime = Date.now();
                                const response = await fetch(url, {
                                    method: 'GET',
                                    ...options
                                });
                                const endTime = Date.now();
                                const responseTime = endTime - startTime;
                                
                                let responseText;
                                try {
                                    responseText = await response.text();
                                } catch (e) {
                                    responseText = 'Unable to read response body';
                                }
                                
                                const responseInfo = {
                                    url: url,
                                    status: response.status,
                                    statusText: response.statusText,
                                    responseTime: responseTime + 'ms',
                                    headers: Object.fromEntries(response.headers.entries()),
                                    body: responseText
                                };
                                
                                responseDiv.innerHTML = \`<strong>API Call Result:</strong>
URL: \${responseInfo.url}
Status: \${responseInfo.status} \${responseInfo.statusText}
Response Time: \${responseInfo.responseTime}
Headers: \${JSON.stringify(responseInfo.headers, null, 2)}\`;
                                
                            } catch (error) {
                                responseDiv.innerHTML = \`<strong>Error:</strong> \${error.message}\`;
                            }
                        }

                        async function autoCallApis() {
                            const apis = ['/api/test', '/api/test-2', '/api/test-3'];
                            const responseDiv = document.getElementById('api-response');
                            responseDiv.style.display = 'block';
                            responseDiv.innerHTML = '<div class="loading">Auto-loading APIs...</div>';
                            
                            let allResults = [];
                            
                            for (const api of apis) {
                                try {
                                    const startTime = Date.now();
                                    const response = await fetch(api);
                                    const endTime = Date.now();
                                    const responseTime = endTime - startTime;
                                    
                                    let responseText;
                                    try {
                                        responseText = await response.text();
                                    } catch (e) {
                                        responseText = 'Unable to read response body';
                                    }
                                    
                                    allResults.push({
                                        url: api,
                                        status: response.status,
                                        statusText: response.statusText,
                                        responseTime: responseTime + 'ms',
                                        body: responseText
                                    });
                                } catch (error) {
                                    allResults.push({
                                        url: api,
                                        error: error.message
                                    });
                                }
                            }
                            
                            const resultsHtml = allResults.map(result => {
                                if (result.error) {
                                    return \`<div style="flex: 1; height: 60px; margin: 2px 0; padding: 2px; border-left: 4px solid #ef4444; background: #fef2f2;">
                                        <strong>\${result.url}:</strong> <span style="color: #ef4444;">Error - \${result.error}</span>
                                    </div>\`;
                                } else {
                                    const statusColor = result.status >= 200 && result.status < 300 ? '#10b981' : result.status >= 400 ? '#ef4444' : '#f59e0b';
                                    return \`<div style="flex: 1; height: 60px; margin: 2px 0; padding: 2px; border-left: 4px solid \${statusColor}; background: \${statusColor === '#10b981' ? '#f0fdf4' : statusColor === '#ef4444' ? '#fef2f2' : '#fffbeb'};">
                                        <p>\${result.url}:</p> <p style="color: \${statusColor}; font-weight: bold; font-size: 1.1em;">\${result.status} \${result.statusText}</span> <span style="color: #6b7280;">(\${result.responseTime})</p>
                                    </div>\`;
                                }
                            }).join('');
                            
                            responseDiv.innerHTML = \`<strong>Auto-loaded API Results:</strong>
                            <br><br><div style="width: 100%; display: flex; flex-direction: row; gap: 2px;">\${resultsHtml}</div>\`;
                        }

                        document.addEventListener('DOMContentLoaded', autoCallApis);
                    </script>
                </body>
            </html>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to fetch Pokémon data');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
