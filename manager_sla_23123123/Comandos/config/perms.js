const { StringSelectMenuBuilder, EmbedBuilder, ActionRowBuilder, ApplicationCommandType, ApplicationCommandOptionType, ButtonBuilder, ComponentType, ModalBuilder, TextInputBuilder } = require("discord.js")
const { JsonDatabase, } = require("wio.db");
const auto = new JsonDatabase({ databasePath:"./jsons/autocomplete.json" });
const perms = new JsonDatabase({ databasePath:"./jsons/perms.json" });
const db = new JsonDatabase({ databasePath:"./jsons/produtos.json" });
const config = new JsonDatabase({ databasePath:"./config.json" });
const fs = require("fs")
const JSZip = require('jszip');


module.exports = {
    name: "perms",
    description:"Gerencie as permissões!",
    type: ApplicationCommandType.ChatInput, 
    run: async(client,interaction) => {
        if(interaction.user.id !== config.get(`owner`)) {
            interaction.reply({
                embeds:[
                    new EmbedBuilder()
                    .setDescription(`❌ | Apenas o Dono do Bot pode usar está função!`)
                    .setColor("Red")
                ]
            })
            return;
        }

        let temp;
        function func() {
          interaction.reply({
            content:"",
            files:[],
            embeds:[
              new EmbedBuilder()
              .setDescription("")
            ]
          })
           
        }
        temp = setTimeout(func, 600000 )

        function reinciar() {
            clearTimeout(temp); 
            temp = setTimeout(func, 600000); 
        }


        const msg1 = await interaction.reply({
            embeds:[
                new EmbedBuilder()
                .setTitle(`💥 ${interaction.guild.name} | Gerenciar Permissões💥`)
                .setDescription(`Gerencie todos que tem permissão!`)
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId("addusersperms")
                    .setLabel("Adicionar Usuario")
                    .setStyle(3),
                    new ButtonBuilder()
                    .setCustomId("removeuserperms")
                    .setLabel("Remover Usuario")
                    .setStyle(4)
                )
            ]
        })
        
        const user = interaction.user
        const interação = msg1.createMessageComponentCollector({ componentType: ComponentType.Button });
        interação.on("collect", async (interaction) => {
         if (user.id !== interaction.user.id) {
            interaction.deferUpdate()
           return;
         }
         if(interaction.customId === "addusersperms") {
            interaction.deferUpdate()
            interaction.channel.send(`🔁 | Coloque o Id do usuario`).then(msg => {
                const filter = m => m.author.id === interaction.user.id;
                const collector = msg.channel.createMessageCollector({ filter, max: 1 });
                  collector.on("collect", message => {
                   message.delete()
                    const newt = message.content
                    const users = interaction.guild.members.cache.get(newt)
                    if(!users) {
                        return msg.edit({
                            content:"Coloque um Usuario Valido!"
                        }).then((editedMessage) => {
                            setTimeout(() => {
                              editedMessage.delete().catch(console.error);
                            }, 2500);
                          }); 
                    } else if(perms.get(`${newt}_id`) === newt){
                        return msg.edit({
                            content:"este usuario já tem permissão!"
                        }).then((editedMessage) => {
                            setTimeout(() => {
                              editedMessage.delete().catch(console.error);
                            }, 2500);
                          }); 
                    }
                    perms.set(`${newt}_id`, newt)
                    msg.edit(`✅ | Adicionado com sucesso!`).then((editedMessage) => {
                     setTimeout(() => {
                       editedMessage.delete().catch(console.error);
                     }, 2500);
                   }); 
                
                })
            })
        }


        if(interaction.customId === "removeuserperms") {
            interaction.deferUpdate()
            interaction.channel.send(`🔁 | Coloque o Id do usuario`).then(msg => {
                const filter = m => m.author.id === interaction.user.id;
                const collector = msg.channel.createMessageCollector({ filter, max: 1 });
                  collector.on("collect", message => {
                   message.delete()
                    const newt = message.content
                    const users = interaction.guild.members.cache.get(newt)
                    if(!users) {
                        return msg.edit({
                            content:"Coloque um Usuario Valido!"
                        }).then((editedMessage) => {
                            setTimeout(() => {
                              editedMessage.delete().catch(console.error);
                            }, 2500);
                          }); 
                    } else if(perms.get(`${newt}_id`) !== newt){
                        return msg.edit({
                            content:"este usuario não tem permissão!"
                        }).then((editedMessage) => {
                            setTimeout(() => {
                              editedMessage.delete().catch(console.error);
                            }, 2500);
                          }); 
                    }
                    perms.delete(`${newt}_id`)
                    msg.edit(`✅ | Removido com sucesso!`).then((editedMessage) => {
                     setTimeout(() => {
                       editedMessage.delete().catch(console.error);
                     }, 2500);
                   }); 
                
                })
            })
        }




        })

    }}