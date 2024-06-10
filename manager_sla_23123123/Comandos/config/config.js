const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require("discord.js")
const { JsonDatabase, } = require("wio.db");
const perms = new JsonDatabase({ databasePath:"./jsons/perms.json" });
module.exports = {
    name:"config",
    description:"Configure diversos sistemas de seu BOT",
    type: ApplicationCommandType.ChatInput,
    run: async(client, interaction) => {
        if(interaction.user.id !== perms.get(`${interaction.user.id}_id`)) {
            return interaction.reply({content:"Você não tem permissão para usar este comando.", ephemeral:true})
        }
        await interaction.reply({
            embeds:[
                new EmbedBuilder()
                .setTitle(`⚙ ${interaction.guild.name} | Configuração ⚙`)
                .setDescription(`Selectione abaixo qual opção deseja alterar no seu bot. É importante que você preste atenção nas configurações atuais para garantir que suas alterações sejam feitas corretamente. 💥`)
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                    .addOptions(
                        {
                            label: `Configurações Basicas`,
                            description:`Configurações sobre sua aplicação`,
                            emoji:"🤖",
                            value:`config_basic`
                        },
                        {
                            label: `Configurações Avançadas`,
                            description:`Configurações sobre seu BOT MENSALIDADE`,
                            value:`config_advanced`,
                            emoji:`<:4323blurpleverifiedbotdeveloper:1178363017096876113>`
                        }
                    )
                    .setPlaceholder("Selecione abaixo qual opção deseja modificar no BOT")
                    .setCustomId("config_select")
                    .setMaxValues(1)
                )
            ]
        })   
        
    }
}