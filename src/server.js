const express = require('express');
const axios = require('axios');
const path = require('path');
const os = require('os');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '../public')));

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

app.use(async (req, res, next) => {
    try {
        const pokemon = await getRandomPokemon();
        
        const requestHeaders = req.headers;
        const requestTime = new Date().toLocaleString();
        const clientIp = req.ip;
        const requestMethod = req.method;
        const requestUri = req.originalUrl;
        const serverName = os.hostname();
        const serverSoftware = req.get('X-Powered-By') || 'Node.js';
        
        const responseHeaders = res.getHeaders();
        const responseStatus = res.statusCode;

        res.send(`
            <html>
                <head>
                    <title>Random Pokémon: ${pokemon.name}</title>
                    <link rel="stylesheet" href="/style.css">
                    <script src="/script.js"></script>
                </head>
                <body class="text-slate-900 font-sans text-center">
                    <div class="container mx-auto">
                        <h1 class="text-4xl font-bold mt-10 text-slate-600">Random Pokémon: ${pokemon.name}</h1>
                        <div class="border border-2 border-slate-900/30 p-4 mx-auto w-max h-max mt-5">
                            <img src="${pokemon.image}" alt="${pokemon.name}">
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
                                return `<tr><td class="px-4 py-2 border border-slate-300">${key}</td><td class="px-4 py-2 border border-slate-300">${value}</td></tr>`;
                            }).join('')}
                        </table>

                        <h2 class="text-2xl font-semibold mt-10">Response Information</h2>
                        <p><strong>Response Status Code:</strong> ${responseStatus}</p>

                        <h3 class="mt-10 text-xl font-medium">Response Headers:</h3>
                        <table class="mt-5 table-auto w-full border-collapse border border-slate-300">
                            <tr class="bg-slate-200">
                                <th class="px-4 py-2 border border-slate-300">Header</th>
                                <th class="px-4 py-2 border border-slate-300">Value</th>
                            </tr>
                            ${Object.entries(responseHeaders).map(([key, value]) => {
                                return `<tr><td class="px-4 py-2 border border-slate-300">${key}</td><td class="px-4 py-2 border border-slate-300">${value}</td></tr>`;
                            }).join('')}
                        </table>
                    </div>
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