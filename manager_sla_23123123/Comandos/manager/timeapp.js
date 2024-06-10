const { ApplicationCommandType, EmbedBuilder, Embed, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder} = require("discord.js")
const axios = require('axios');
const { JsonDatabase } = require("wio.db")
const api = new JsonDatabase({ databasePath:"./jsons/apis.json" });
const auto = new JsonDatabase({ databasePath:"./jsons/autocomplete.json" });
const logs = new JsonDatabase({ databasePath:"./jsons/logs.json" });
const perms = new JsonDatabase({ databasePath:"./jsons/perms.json" });
const db = new JsonDatabase({ databasePath:"./jsons/applications.json" });



module.exports = {
    name:"timeapp",
    description:"[🤖] Gerencie o Tempo das aplicações",
    type:ApplicationCommandType.ChatInput,
    run: async (client, interaction) => {
        if(interaction.user.id !== perms.get(`${interaction.user.id}_id`)) {
            return interaction.reply({content:"Você não tem permissão para usar este comando.", ephemeral:true})
        }

        interaction.reply({
            embeds:[
                new EmbedBuilder()
                .setTitle(`${interaction.guild.name} | Adicionar/Remover Tempo de Aplicação`)
                .setDescription(`Olá ***${interaction.user.username}*** Seja Bem-Vindo(a) ao painel de Gerenciamento de tempo, escolha quais das opções abaixo você deseja fazer!`)
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_addtimeapp`)
                    .setLabel("Adicionar Tempo")
                    .setStyle(1),
                    new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_removetimeapp`)
                    .setLabel("Remover Tempo")
                    .setStyle(1),
                )
            ]
        })

    }
}