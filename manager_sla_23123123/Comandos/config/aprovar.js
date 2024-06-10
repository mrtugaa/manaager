const { StringSelectMenuBuilder, EmbedBuilder, ActionRowBuilder, ApplicationCommandType, ApplicationCommandOptionType, ButtonBuilder, ComponentType, ModalBuilder, TextInputBuilder, AttachmentBuilder } = require("discord.js")
const { JsonDatabase, } = require("wio.db");
const auto = new JsonDatabase({ databasePath:"./jsons/autocomplete.json" });
const apps = new JsonDatabase({ databasePath:"./jsons/applications.json" });
const logs = new JsonDatabase({ databasePath:"./jsons/logs.json" });
const db = new JsonDatabase({ databasePath:"./jsons/produtos.json" });
const perms = new JsonDatabase({ databasePath:"./jsons/perms.json" });
const api = new JsonDatabase({ databasePath:"./jsons/apis.json" });
const fs = require("fs")
const JSZip = require('jszip');
const mercadopago = require("mercadopago")
const axios = require("axios")
const { SquareCloudAPI } = require('@squarecloud/api');
const chave = new JsonDatabase({ databasePath:"./config.json"})
const db1 = new JsonDatabase({databasePath:"./jsons/carrinhos.json"});

module.exports = {
    name: "aprovar",
    description:"Aprove alguma compra!",
    type: ApplicationCommandType.ChatInput,  
    run: async(client, interaction) => {

        if(interaction.user.id !== perms.get(`${interaction.user.id}_id`)) {
            return interaction.reply({content:"Você não tem permissão para usar este comando.", ephemeral:true})
        }
        const asd = db1.get(`carrinho_${interaction.channel.id}`)
        if(!asd) {
            return interaction.reply({content:"Não Achei este Carrinho!", ephemeral:true})
        }
        await db1.set(`carrinho_${interaction.channel.id}.status`, "Processando")
        interaction.reply({
            content:"✅ | Carrinho Aprovado com sucesso",
            ephemeral:true
        })
    }}