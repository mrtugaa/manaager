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


module.exports = {
    name:"ready",
    run: async(client) => {
        const intervalo = 120000

        async function verificarExpiracao() {
            const api1 = new SquareCloudAPI(api.get(`square`));
            const donos = db2.all()
        
            donos.map(async (dono) => {
                const dataExpiracao = new Date(dono.data.dataExpiracao);
                    const agora = new Date();
        
                    if (agora > dataExpiracao) {
                        const a = client.users.cache.get(dono.data.owner) 
                        if(a ) {
                            a.send(`Olá <@${dono.data.owner}> Você Acabou Perdendo o bot por não renovar!\n Id da aplicação: ${dono.ID} \n Nome da Aplicação: ${dono.data.nome}`);
                        }
                        try {
                            const application = await api1.applications.get(dono.ID);
                            await application.delete();
                        } catch {
                            console.log("Ocorreu um erro ao tentar excluir uma aplicação!");
                        }
                        db2.delete(dono.ID)
                    } else if (agora > new Date(dataExpiracao.getTime() - 2 * 24 * 60 * 60 * 1000)) {
                        var timestamp = Math.floor(new Date(dataExpiracao).getTime() / 1000)
                        if (!dono.data.notify) {
                            await db2.set(`${dono.ID}.notify`, true);
                            client.users.cache.get(dono.data.owner).send(`Olá <@${dono.data.owner}> Você vai acabar perdendo o bot por não renovar em <t:${timestamp}:f> (<t:${timestamp}:R>)\n Id da aplicação: ${dono.ID} \n Nome da Aplicação: ${dono.data.nome}`);
                        }
                    }
            });
        }
        setInterval(verificarExpiracao, intervalo);


    }
}