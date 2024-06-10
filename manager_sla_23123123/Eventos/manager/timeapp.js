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
const Discord = require("discord.js");
const { StringSelectMenuBuilder, EmbedBuilder, ActionRowBuilder, ApplicationCommandType, ApplicationCommandOptionType, ButtonBuilder, ComponentType, ModalBuilder, TextInputBuilder } = require(`discord.js`)
const moment = require("moment");

module.exports = {
    name:"interactionCreate",
    run:async(interaction, client) => {
        const customId = interaction.customId;
        if(!customId) return;
        if(customId.endsWith("_addtimeapp")) {
            if(interaction.user.id !== customId.split("_")[0]) return interaction.deferUpdate();

            const modal = new ModalBuilder()
            .setCustomId(`addtime_modal`)
            .setTitle("➕ - Adicionar Tempo");

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setLabel("Coloque o ID da aplicação:")
            .setStyle(1)
            .setRequired(true);

            const text1 = new TextInputBuilder()
            .setCustomId("text1")
            .setLabel("Deseja Adicionar quanto tempo?")
            .setStyle(1)
            .setPlaceholder("1D, 1H, 1M, 1S")
            .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));
            modal.addComponents(new ActionRowBuilder().addComponents(text1));

            return interaction.showModal(modal);
        }
        if (customId === "addtime_modal") {
            const text = interaction.fields.getTextInputValue("text");
            const text1 = interaction.fields.getTextInputValue("text1");
            const app = await db2.get(`${text}`);
        
            if (!app) {
                return interaction.reply({ content: `${interaction.user} Não existe esta aplicação!`, ephemeral: true });
            }
        
            const tempadd = converterTempoParaMilissegundos(text1);
        
            const dataExpiracao = moment(app.dataExpiracao);
        
            const novaDataExpiracao = dataExpiracao.add(tempadd, 'milliseconds');
        
            db2.set(`${text}.dataExpiracao`, novaDataExpiracao.toISOString());
            console.log(novaDataExpiracao.toISOString())
        
            await interaction.reply({
                content: `Agora a aplicação ***${app.nome} (${text})*** tem no total: <t:${Math.floor(novaDataExpiracao.unix())}:f> (<t:${Math.floor(novaDataExpiracao.unix())}:R>)`,
                ephemeral: true
            });
        }
        
        

        
        if(customId.endsWith("_removetimeapp")) {
            if(interaction.user.id !== customId.split("_")[0]) return interaction.deferUpdate();

            const modal = new ModalBuilder()
            .setCustomId(`removetime_modal`)
            .setTitle("➕ - Remover Tempo");

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setLabel("Coloque o ID da aplicação:")
            .setStyle(1)
            .setRequired(true);

            const text1 = new TextInputBuilder()
            .setCustomId("text1")
            .setLabel("Deseja Remover quanto tempo?")
            .setStyle(1)
            .setPlaceholder("1D, 1H, 1M, 1S")
            .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));
            modal.addComponents(new ActionRowBuilder().addComponents(text1));

            return interaction.showModal(modal);
        }
        if (customId === "removetime_modal") {
            const text = interaction.fields.getTextInputValue("text");
            const text1 = interaction.fields.getTextInputValue("text1");
            const app = await db2.get(`${text}`);
        
            if (!app) {
                return interaction.reply({ content: `${interaction.user} Não existe esta aplicação!`, ephemeral: true });
            }
        
            const tempRemove = converterTempoParaMilissegundos(text1);
        
            const dataExpiracao = moment(app.dataExpiracao);
        
            const novaDataExpiracao = dataExpiracao.subtract(tempRemove, 'milliseconds');
        
            db2.set(`${text}.dataExpiracao`, novaDataExpiracao.toISOString());
            console.log(novaDataExpiracao.toISOString())
        
            await interaction.reply({
                content: `Agora a aplicação ***${app.nome} (${text})*** tem no total: <t:${Math.floor(novaDataExpiracao.unix())}:f> (<t:${Math.floor(novaDataExpiracao.unix())}:R>)`,
                ephemeral: true
            });
        }
        
        


    }}

    
    function converterTempoParaMilissegundos(tempo) {
        const regex = /(\d+)([DdHhMmSs])/g;
        let match;
        let totalMilissegundos = 0;
        while ((match = regex.exec(tempo)) !== null) {
            const valor = parseInt(match[1]);
            const unidade = match[2].toLowerCase();
            switch (unidade) {
                case 'd':
                    totalMilissegundos += valor * 24 * 60 * 60 * 1000;
                    break;
                case 'h':
                    totalMilissegundos += valor * 60 * 60 * 1000;
                    break;
                case 'm':
                    totalMilissegundos += valor * 60 * 1000;
                    break;
                case 's':
                    totalMilissegundos += valor * 1000;
                    break;
                default:
                    break;
            }
        }
        return totalMilissegundos;
    }