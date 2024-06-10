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
const Discord = require("discord.js");
const pix = new JsonDatabase({databasePath:"./config.json"});
const { StringSelectMenuBuilder, EmbedBuilder, ActionRowBuilder, ApplicationCommandType, ApplicationCommandOptionType, ButtonBuilder, ComponentType, ModalBuilder, TextInputBuilder } = require(`discord.js`)
module.exports = {
    name:"interactionCreate",
    run:async(interaction, client ) => {
                 
        if(interaction.isModalSubmit() && interaction.customId.endsWith("_uparbot_modal")) {
            const Dias = interaction.customId.split("_")[0]
            const id = interaction.customId.split("_")[1]
    const api1 = new SquareCloudAPI(await api.get(`square`));
            const nome = interaction.fields.getTextInputValue("nomeapp");
            const iddono = interaction.fields.getTextInputValue("idapp")
            const tokenbot = interaction.fields.getTextInputValue("tokenapp")
    const zip = new JSZip();
           const msg123 = await interaction.reply({
                content:"🔁 | Enviando Bot...",
                ephemeral:true
            })
            fs.readFile(`source/${id}.zip`, function(err, data) {
                if (err) throw err;
                JSZip.loadAsync(data).then(function (zip) {
                    
                    zip.file('token.json').async('string').then(function(content) {
                        
                        let config = JSON.parse(content);
                        config.token = `${tokenbot}`;  
                        config.owner = `${iddono}`
            
                        
                        zip.file('token.json', JSON.stringify(config));
    
                        let configFileName = zip.files['squarecloud.config'] ? 'squarecloud.config' : 'squarecloud.app';
                        zip.file(configFileName).async('string').then(function(configContent) {
                            configContent = configContent.replace(/^DISPLAY_NAME=.*$/m, 'DISPLAY_NAME=' + interaction.member.displayName);
                            zip.file(configFileName, configContent);
            
                        
                        zip.generateAsync({type:'nodebuffer'}).then(function(content) {
                            fs.writeFile(`source/client/${nome}.zip`, content, function(err) {
                                if (err) throw err;
                                
                                const dir = 'source/client';
                                const nome1 = `${nome}.zip`;
                                const filePath = path.join(dir, nome1);
    
                                try {
                                    const data = api1.applications.create(filePath).then((data) => {

										auto.push(`${iddono}_owner.butecos`, {
                                            nome: nome,
                                            dataExpiracao: new Date(Date.now() + Dias * 24 * 60 * 60 * 1000),
                                            idapp: data.id,
                                            produto:id,
                                            notify: false
                                        })
                                        db2.set(`${data.id}`, {
                                            nome:nome,
                                            dataExpiracao: new Date(Date.now() + Dias * 24 * 60 * 60 * 1000),
                                            idapp: data.id,
                                            produto:id,
                                            owner:iddono
                                        })
                                        
                                        msg123.edit({
                                            content:`✅ | Bot enviado, use /apps para gerenciá-lo\n⚠ | id da sua aplicação: ${data.id} \n💥| esse Canal será apagado em 15 segundos!`,
                                        })
    interaction.message.edit({
    components:[]
    })
                                        db1.delete(`carrinho_${interaction.channel.id}`)
										
                                        const attachment = new Discord.AttachmentBuilder(filePath, "arquivo.zip");
                                        client.channels.cache.get(logs.get(`logs_backup`)).send({
                                            embeds:[
                                                new Discord.EmbedBuilder()
                                                .setTitle(`${interaction.guild.name} | Sistema de Backup`)
                                            ],
                                            files:[attachment]
                                        }).then(() => {
                                            
                                        fs.unlink(filePath, function(err) {
                                            if (err) throw err;
                                            console.log('Arquivo zip excluído com sucesso!');
                                        });
                                        }).catch(() => {
                                            
                                        fs.unlink(filePath, function(err) {
                                            if (err) throw err;
                                            console.log('Arquivo zip excluído com sucesso!');
                                        });
                                        })
                                        const abcsd = auto.get(`${iddono}_owner`)
                                        if(!abcsd) {
                                            auto.set(`${iddono}_owner`, {
                                                butecos:[],
                                                owner:iddono
                                            })
                                        }
                                        
                                        
                                        setTimeout(() => {
                                           interaction.channel.delete() 
                                        }, 15000);
                                    }).catch((err) => {
                                        fs.unlink(`source/client/${nome1}`, function(err) {
                                            if (err) throw err;
                                            console.log('Arquivo zip excluído com sucesso!');
                                        });
                                        msg123.edit(`Ocorreu um erro para enviar, fale com o dono do bot e envie a print desta mensagem`)
                                        console.log(err)
                                    })
                                  } catch (err){
                                    fs.unlink(`source/client/${nome1}`, function(err) {
                                        if (err) throw err;
                                        console.log('Arquivo zip excluído com sucesso!');
                                    });
                                    msg123.edit({content:"Ocorreu um erro para fazer o upload verifique as logs"})
                                    console.log(err)
                                    
                                  }
                      
                                
            
                                
                                });
                            });
                        });
                    });
                });
            });
            
        }
        if(interaction.isButton() && interaction.customId.endsWith("_uparbot") ) {
            const Dias = interaction.customId.split("_")[0];
            const id = interaction.customId.split("_")[1];
           const modal = new Discord.ModalBuilder()
           .setTitle(`${interaction.guild.name} - Upar BOT`)
           .setCustomId(`${Dias}_${id}_uparbot_modal`);

           const nome = new Discord.TextInputBuilder()
           .setCustomId("nomeapp")
           .setLabel("Nome da Aplicação")
           .setStyle(1)
           .setRequired(true);
           

           const iddono = new Discord.TextInputBuilder()
           .setCustomId("idapp")
           .setLabel("ID QUE SERÁ SETADO COMO DONO DO BOT?")
           .setStyle(1)
           .setRequired(true);
           

           const tokenbot = new Discord.TextInputBuilder()
           .setCustomId("tokenapp")
           .setLabel("TOKEN DO BOT")
           .setStyle(1)
           .setRequired(true);
           
           modal.addComponents(new Discord.ActionRowBuilder().addComponents(nome))
           modal.addComponents(new Discord.ActionRowBuilder().addComponents(iddono))
           modal.addComponents(new Discord.ActionRowBuilder().addComponents(tokenbot))
           await interaction.showModal(modal)
       }
    
    }}