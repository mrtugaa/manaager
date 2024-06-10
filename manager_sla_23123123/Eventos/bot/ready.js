const mercadopago = require("mercadopago")
const axios = require("axios")
const {JsonDatabase} = require("wio.db");
const api = new JsonDatabase({databasePath:"./jsons/apis.json"});
const logs = new JsonDatabase({databasePath:"./jsons/logs.json"});
const auto = new JsonDatabase({databasePath:"./jsons/autocomplete.json"});
const db = new JsonDatabase({databasePath:"./jsons/produtos.json"});
const perms = new JsonDatabase({ databasePath:"./jsons/perms.json" });
const db1 = new JsonDatabase({databasePath:"./jsons/carrinhos.json"});
const db2 = new JsonDatabase({databasePath:"./jsons/applications.json"});
const schedule = require('node-schedule');
const JSZip = require('jszip');
const path = require('path');
const fs = require("fs");
const { SquareCloudAPI } = require('@squarecloud/api');
const pix = new JsonDatabase({databasePath:"./config.json"});
const Discord = require("discord.js")

module.exports = {
    name: "ready",
    run: async (client) => {
        console.log(`櫨 Estou online em ${client.user.username}!`);
        console.log(`櫨 Tenho ${client.users.cache.size} amiguinhus`);
        console.log(`櫨 Estou em ${client.guilds.cache.size} servidores!`);
        
    }
};
