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
let timer1;
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, } = require("discord.js")

module.exports = {
    name:"interactionCreate",
    run:async(interaction, client) => {

        if (timer1) {
            clearTimeout(timer1);
        }
 if(interaction.isButton()) {
        const id = interaction.customId
        const epd = db.get(`${id}`)
        if(epd) {
            if (interaction.guild.channels.cache.find(c => c.topic === `carrinho - ${interaction.user.id}`)) {
                const channel = interaction.guild.channels.cache.find(c => c.topic === `carrinho - ${interaction.user.id}`);
                return interaction.reply({
                  content: `Você já tem um carrinho criado!`,
                  ephemeral: true,
                  components: [
                    new Discord.ActionRowBuilder().addComponents(
                      new Discord.ButtonBuilder()
                        .setStyle(5)
                        .setLabel('🛒・Ir para carrinho')
                        .setURL(`https://discord.com/channels/${channel.guild.id}/${channel.id}`)
                    )
                  ]
                });
              }        
            
            const msg = await interaction.reply({content:"Aguarde um momento, estou criando seu carrinho..", ephemeral:true})
            interaction.guild.channels.create({
                name:`🛒・carrinho-${interaction.user.username}`,
                parent: logs.get(`categoria`),
                type: Discord.ChannelType.GuildText,
                topic: `carrinho - ${interaction.user.id}`,
                permissionOverwrites: [
                    {
                        id:interaction.user.id,
                        allow:["ViewChannel"],
                        deny:["SendMessages"]
                    },
                    {
                        id:interaction.guild.id,
                        deny:["ViewChannel", "SendMessages"]
                    } // tÔ só procurando o baguio rlx
                ],
            }).then(async (channel) => {
                const channelid = channel.id
                timer1 = setTimeout(() => {
                    interaction.user.send({
                        embeds:[
                            new EmbedBuilder()
                            .setTitle(`${interaction.guild.name} | Sistema de Inatividade`)
                            .setDescription(`Ola ${interaction.user}, seu carrinho foi cancelado por inatividade`)
                        ],
                        components:[
                            new Discord.ActionRowBuilder()
                            .addComponents(
                                new Discord.ButtonBuilder()
                                .setCustomId("mensagemautomatica123")
                                .setLabel("Mensagem Automatica")
                                .setStyle(2)
                                .setDisabled(true)
                            )
                        ]
                    });
    
    
                    
                    interaction.guild.channels.cache.get(logs.get(`vendas`)).send({
                        embeds:[
                            new Discord.EmbedBuilder()
                            .setTitle(`${interaction.guild.name} | Sistema de Logs`)
                            .addFields(
                                { name: '👥 | Usuário:', value: `${interaction.user.username} - \`${interaction.user.id}\`` },
                                { name: '📝 | Carrinho Fechado:', value: `Produto: ${epd.nomeproduto} - \`${data_id}\`` },
                                { name: '🕒 | Data / Horário do Fechamento:',  value: `<t:${Math.floor(new Date() / 1000)}:f> (<t:${~~(new Date() / 1000)}:R>)` },
                                { name: '❔ | Motivo:',  value: `Inatividade` },
                            )
                        ]
                    })
                    channel.delete()
    
    
                }, 60000);

                msg.edit({
                    content:"",
                    embeds:[
                        new Discord.EmbedBuilder()
                        .setDescription(`✅**|${interaction.user}, seu CARRINHO foi aberto [CLIQUE AQUI](${channel.url}) para encontra-lo.**`)
                    ],
                    components:[ // aff o jeito é fazer sem usar collect, e isso é mó trampo
                        new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                            .setLabel("Ir para o Carrinho")
                            .setStyle(5)
                            .setEmoji("🛒")
                            .setURL(channel.url)
                        )
                    ]
                })

                const row = new Discord.ActionRowBuilder()
                if(epd.preco.mensal.onoff === true){
                    row.addComponents(
                        new Discord.ButtonBuilder()
                        .setEmoji("📅")
                        .setLabel("30 Dias")
                        .setStyle(1)
                        .setCustomId("30diascarrinho")
                    )
                }
                if(epd.preco.quizena.onoff === true){
                    row.addComponents(
                        new Discord.ButtonBuilder()
                        .setEmoji("📅")
                        .setLabel("15 Dias")
                        .setStyle(1)
                        .setCustomId("15diascarrinho")
                    )
                }
                if(epd.preco.semanal.onoff === true){
                    row.addComponents(
                        new Discord.ButtonBuilder()
                        .setEmoji("📅")
                        .setLabel("7 Dias")
                        .setStyle(1)
                        .setCustomId("7diascarrinho")
                    )
                }
                row.addComponents(
                    new Discord.ButtonBuilder()
                    .setCustomId("cancelar")
                    .setEmoji("<:nao:1116869877848883210>")
                    .setLabel("Cancelar")
                    .setStyle(4)
                )
                var data_id = Math.floor(Math.random() * 999999999999999);
                await channel.send({
                    content:`# CARRINHO - ${data_id}`
                })
                let temp;

                const user = interaction.user
                await channel.send({
                    content:`${interaction.user}`,
                    embeds:[
                        new Discord.EmbedBuilder()
                        .setTitle(`${interaction.guild.name} | Sistema de Compras`)
                        .setDescription(`👋| Olá ${interaction.user} \n\n- **Selecione uma das opções:**\n\n${db.get(`${id}.preco.mensal.onoff`) === true ? `> Mensal (30 dias) R$${db.get(`${id}.preco.mensal.preco`)}` : " "} \n ${db.get(`${id}.preco.quizena.onoff`) === true ? `> Quinzena (15 dias) R$${db.get(`${id}.preco.quizena.preco`)}` : " "} \n ${db.get(`${id}.preco.semanal.onoff`) === true ? `> Semanal (7 dias) R$${db.get(`${id}.preco.semanal.preco`)}` : " "}`)
                    ],
                    components:[
                        row
                    ]
                }).then((msg) => {
                    
                    

                let quantidade = 1
                let Dias = 0
                let preco = 0
                let tipo = ""
                let useraprov = ""
                
                let timer;
                
                const interação = msg.createMessageComponentCollector({ componentType: Discord.ComponentType.Button});
                interação.on("collect", async (interaction) => {
                    if (user.id !== interaction.user.id) {
                        interaction.deferUpdate() 
                       return;
                     } 
                     clearTimeout(timer1)
            
                     
                    let intervalId;
                    intervalId = setInterval(() => {
                        if(db1.get(`carrinho_${channel.id}.status`) === "Processando") {
                            if (timer) {
                                clearTimeout(timer);
                            }
                            const usuariosa = interaction.member 
                            usuariosa.roles.add(logs.get(`cargo_client`)).catch((err) => {console.log(`Usuario Já tem Cargo..`); })
                            db1.set(`carrinho_${channel.id}.status`, "Aprovado")
                            clearInterval(intervalId);
                            channel.bulkDelete(50).then(async() => {
                                await channel.send({
                                    content:`✅ | Pagamento Aprovado \n🆔 | ID da Compra: ${data_id} \n🪐 | Produto: ${id} x${quantidade} - (${Dias * quantidade} Dias)\n💵 | Valor: R$${Number(Number(preco) * Number(quantidade)).toFixed(2)}`
                                }).then(() => {
                                channel.send({
                                    content:`${interaction.user}`,

                                    embeds:[
                                        new Discord.EmbedBuilder()
                                        .setTitle(`🎉 ${interaction.guild.name} | Pagamento Aprovado 🎉`)
                                        .setDescription(`**💥 | O Pagamento foi aprovado, irei precisar de algumas informações para enviar o seu bot, são elas:** \n\n> - Nome que você irá querer na aplicação; \n> - Id que será setado como dono do bot; \n> - Token do Bot, \n\n **OBS: ⚠ | Mantenha o token do bot seguro. Não compartilhe com ninguém!** \n\n**Siga o tutorial disponivel nos botões abaixo, qualquer dúvida estamos a disposição!**`)
                                    ],
                                    components:[
                                        new Discord.ActionRowBuilder()
                                        .addComponents(
                                            new Discord.ButtonBuilder()
                                            .setLabel("Enviar Bot")
                                            .setStyle(3)
                                            .setCustomId(`${Dias * quantidade}_${id}_uparbot`),
                                            new Discord.ButtonBuilder()
                                            .setLabel("Portal Desenvolvedor")
                                            .setEmoji("<:review:1178761503877378069>")
                                            .setStyle(5)
                                            .setURL("https://discord.com/developers/applications/"),
                                            new Discord.ButtonBuilder()
                                            .setLabel("Video Tutorial")
                                            .setStyle(5)
                                            .setEmoji("<:bot:989614012020953218>")
                                            .setDisabled(false)
                                            .setURL("https://youtu.be/YW_rTEGKivU"),
                                        )
                                    ]
                                })
                                })
                            })

                        }
                    }, 15000);


                    let tipos;

                        
                    if(interaction.customId === "7diascarrinho") {
                        if (timer) {
                            clearTimeout(timer);
                        }
                        timer = setTimeout(() => {
                            interaction.user.send({
                                embeds:[
                                    new EmbedBuilder()
                                    .setTitle(`${interaction.guild.name} | Sistema de Inatividade`)
                                    .setDescription(`Ola ${interaction.user}, seu carrinho foi cancelado por inatividade`)
                                ],
                                components:[
                                    new Discord.ActionRowBuilder()
                                    .addComponents(
                                        new Discord.ButtonBuilder()
                                        .setCustomId("mensagemautomatica123")
                                        .setLabel("Mensagem Automatica")
                                        .setStyle(2)
                                        .setDisabled(true)
                                    )
                                ]
                            });
                            interaction.channel.delete()
                            
                            interaction.guild.channels.cache.get(logs.get(`vendas`)).send({
                                embeds:[
                                    new Discord.EmbedBuilder()
                                    .setTitle(`${interaction.guild.name} | Sistema de Logs`)
                                    .addFields(
                                        { name: '👥 | Usuário:', value: `${interaction.user.username} - \`${interaction.user.id}\`` },
                                        { name: '📝 | Carrinho Fechado:', value: `Produto: ${epd.nomeproduto} - \`${data_id}\`` },
                                        { name: '🕒 | Data / Horário do Fechamento:',  value: `<t:${Math.floor(new Date() / 1000)}:f> (<t:${~~(new Date() / 1000)}:R>)` },
                                        { name: '❔ | Motivo:',  value: `Inatividade` },
                                    )
                                ]
                            })
            
            
                        }, 60000);
                        tipo = "Semanal"
                        tipos = "semanal"
                        
                        preco = epd.preco.semanal.preco
                        Dias = 7
                        db1.set(`carrinho_${interaction.channel.id}`, {
                            quantia: quantidade,
                            userid: interaction.user.id,
                            id:data_id,
                            produto:id,
                            status:"Aguardando..."
                        })
                        interaction.update({
                            embeds:[
                                new Discord.EmbedBuilder()
                                .setTitle(`${interaction.guild.name} | Sistema de Compras`)
                                .setDescription(`📦 | Produto: **${id}** ${tipo} x${quantidade} - (${Dias * quantidade} Dias)\n\n💰 | Valor: R$${Number(preco) * Number(quantidade)}`)
                            ],
                            components:[
                                new Discord.ActionRowBuilder()
                                .addComponents(
                                    new Discord.ButtonBuilder()
                                    .setCustomId("adicionarcarrinho")
                                    .setLabel("+")
                                    .setStyle(2),
                                    new Discord.ButtonBuilder()
                                    .setCustomId("comprar")
                                    .setLabel("Comprar")
                                    .setStyle(3)
                                    .setEmoji("<a:1150938888479703081:1155318227736469555>"),
                                    new Discord.ButtonBuilder()
                                    .setCustomId("removercarrinho")
                                    .setLabel("-")
                                    .setStyle(2),
                                    new Discord.ButtonBuilder()
                                    .setCustomId("cancelar")
                                    .setLabel("Cancelar")
                                    .setStyle(4)
                                    .setEmoji("<a:1150939352503963768:1155318230345322507>")
                                )
                            ]
                        })
                        interaction.guild.channels.cache.get(logs.get(`vendas`)).send({
                            embeds:[
                                new Discord.EmbedBuilder()
                                .setTitle(`${interaction.guild.name} | Sistema de Logs`)
                                .addFields(
                                    { name: '👥 | Usuário:', value: `${interaction.user.username} - \`${interaction.user.id}\`` },
                                    { name: '📝 | Criou um Carrinho:', value: `Produto: ${epd.nomeproduto} - \`${data_id}\`` },
                                    { name: '🕒 | Data / Horário da Compra:',  value: `<t:${Math.floor(new Date() / 1000)}:f> (<t:${~~(new Date() / 1000)}:R>)` }
                                )
                            ]
                        })
                     }

                        
                     if(interaction.customId === "15diascarrinho") {
                        if (timer) {
                            clearTimeout(timer);
                        }
                        timer = setTimeout(() => {
                            interaction.user.send({
                                embeds:[
                                    new EmbedBuilder()
                                    .setTitle(`${interaction.guild.name} | Sistema de Inatividade`)
                                    .setDescription(`Ola ${interaction.user}, seu carrinho foi cancelado por inatividade`)
                                ],
                                components:[
                                    new Discord.ActionRowBuilder()
                                    .addComponents(
                                        new Discord.ButtonBuilder()
                                        .setCustomId("mensagemautomatica123")
                                        .setLabel("Mensagem Automatica")
                                        .setStyle(2)
                                        .setDisabled(true)
                                    )
                                ]
                            });
            
            
                            
                            interaction.channel.delete()
                            interaction.guild.channels.cache.get(logs.get(`vendas`)).send({
                                embeds:[
                                    new Discord.EmbedBuilder()
                                    .setTitle(`${interaction.guild.name} | Sistema de Logs`)
                                    .addFields(
                                        { name: '👥 | Usuário:', value: `${interaction.user.username} - \`${interaction.user.id}\`` },
                                        { name: '📝 | Carrinho Fechado:', value: `Produto: ${epd.nomeproduto} - \`${data_id}\`` },
                                        { name: '🕒 | Data / Horário do Fechamento:',  value: `<t:${Math.floor(new Date() / 1000)}:f> (<t:${~~(new Date() / 1000)}:R>)` },
                                        { name: '❔ | Motivo:',  value: `Inatividade` },
                                    )
                                ]
                            })
            
            
                        }, 60000);
                        
                        
                        tipo = "Quinzena"
                        tipos = "quizena"
                        
                        preco = epd.preco.quizena.preco
                        Dias = 15
                        db1.set(`carrinho_${interaction.channel.id}`, {
                            quantia: quantidade,
                            userid: interaction.user.id,
                            id:data_id,
                            produto:id,
                            status:"Aguardando..."
                        })
                        interaction.update({
                            embeds:[
                                new Discord.EmbedBuilder()
                                .setTitle(`${interaction.guild.name} | Sistema de Compras`)
                                .setDescription(`📦 | Produto: **${id}** ${tipo} x${quantidade} - (${Dias * quantidade} Dias)\n\n💰 | Valor: R$${Number(preco) * Number(quantidade)}`)
                            ],
                            components:[
                                new Discord.ActionRowBuilder()
                                .addComponents(
                                    new Discord.ButtonBuilder()
                                    .setCustomId("adicionarcarrinho")
                                    .setLabel("+")
                                    .setStyle(2),
                                    new Discord.ButtonBuilder()
                                    .setCustomId("comprar")
                                    .setLabel("Comprar")
                                    .setStyle(3)
                                    .setEmoji("<a:1150938888479703081:1155318227736469555>"),
                                    new Discord.ButtonBuilder()
                                    .setCustomId("removercarrinho")
                                    .setLabel("-")
                                    .setStyle(2),
                                    new Discord.ButtonBuilder()
                                    .setCustomId("cancelar")
                                    .setLabel("Cancelar")
                                    .setStyle(4)
                                    .setEmoji("<a:1150939352503963768:1155318230345322507>")
                                )
                            ]
                        })
                        interaction.guild.channels.cache.get(logs.get(`vendas`)).send({
                            embeds:[
                                new Discord.EmbedBuilder()
                                .setTitle(`${interaction.guild.name} | Sistema de Logs`)
                                .addFields(
                                    { name: '👥 | Usuário:', value: `${interaction.user.username} - \`${interaction.user.id}\`` },
                                    { name: '📝 | Criou um Carrinho:', value: `Produto: ${epd.nomeproduto} - \`${data_id}\`` },
                                    { name: '🕒 | Data / Horário da Compra:',  value: `<t:${Math.floor(new Date() / 1000)}:f> (<t:${~~(new Date() / 1000)}:R>)` }
                                )
                            ]
                        })
                     }

                        
                     if(interaction.customId === "30diascarrinho") {
                        if (timer) {
                            clearTimeout(timer);
                        }
                        timer = setTimeout(() => {

                            interaction.user.send({
                                embeds:[
                                    new EmbedBuilder()
                                    .setTitle(`${interaction.guild.name} | Sistema de Inatividade`)
                                    .setDescription(`Ola ${interaction.user}, seu carrinho foi cancelado por inatividade`)
                                ],
                                components:[
                                    new Discord.ActionRowBuilder()
                                    .addComponents(
                                        new Discord.ButtonBuilder()
                                        .setCustomId("mensagemautomatica123")
                                        .setLabel("Mensagem Automatica")
                                        .setStyle(2)
                                        .setDisabled(true)
                                    )
                                ]
                            });
            
            
                            
                            interaction.channel.delete()
                            interaction.guild.channels.cache.get(logs.get(`vendas`)).send({
                                embeds:[
                                    new Discord.EmbedBuilder()
                                    .setTitle(`${interaction.guild.name} | Sistema de Logs`)
                                    .addFields(
                                        { name: '👥 | Usuário:', value: `${interaction.user.username} - \`${interaction.user.id}\`` },
                                        { name: '📝 | Carrinho Fechado:', value: `Produto: ${epd.nomeproduto} - \`${data_id}\`` },
                                        { name: '🕒 | Data / Horário do Fechamento:',  value: `<t:${Math.floor(new Date() / 1000)}:f> (<t:${~~(new Date() / 1000)}:R>)` },
                                        { name: '❔ | Motivo:',  value: `Inatividade` },
                                    )
                                ]
                            })
            
            
                        }, 60000);
                        
                        
                        tipo = "Mensal"
                        
                        tipos = "mensal"
                        preco = epd.preco.mensal.preco
                        Dias = 30
                        
                        db1.set(`carrinho_${interaction.channel.id}`, {
                            quantia: quantidade,
                            userid: interaction.user.id,
                            id:data_id,
                            produto:id,
                            status:"Aguardando..."
                        })
                        interaction.update({
                            embeds:[
                                new Discord.EmbedBuilder()
                                .setTitle(`${interaction.guild.name} | Sistema de Compras`)
                                .setDescription(`📦 | Produto: **${id}** ${tipo} x${quantidade} - (${Dias * quantidade} Dias)\n\n💰 | Valor: R$${Number(preco) * Number(quantidade)}`)
                            ],
                            components:[
                                new Discord.ActionRowBuilder()
                                .addComponents(
                                    new Discord.ButtonBuilder()
                                    .setCustomId("adicionarcarrinho")
                                    .setLabel("+")
                                    .setStyle(2),
                                    new Discord.ButtonBuilder()
                                    .setCustomId("comprar")
                                    .setLabel("Comprar")
                                    .setStyle(3)
                                    .setEmoji("<a:1150938888479703081:1155318227736469555>"),
                                    new Discord.ButtonBuilder()
                                    .setCustomId("removercarrinho")
                                    .setLabel("-")
                                    .setStyle(2),
                                    new Discord.ButtonBuilder()
                                    .setCustomId("cancelar")
                                    .setLabel("Cancelar")
                                    .setStyle(4)
                                    .setEmoji("<a:1150939352503963768:1155318230345322507>")
                                )
                            ]
                        })
                        interaction.guild.channels.cache.get(logs.get(`vendas`)).send({
                            embeds:[
                                new Discord.EmbedBuilder()
                                .setTitle(`${interaction.guild.name} | Sistema de Logs`)
                                .addFields(
                                    { name: '👥 | Usuário:', value: `${interaction.user.username} - \`${interaction.user.id}\`` },
                                    { name: '📝 | Criou um Carrinho:', value: `Produto: ${epd.nomeproduto} - \`${data_id}\`` },
                                    { name: '🕒 | Data / Horário da Compra:',  value: `<t:${Math.floor(new Date() / 1000)}:f> (<t:${~~(new Date() / 1000)}:R>)` }
                                )
                            ]
                        })
                     }
            
                     if(preco > 0) {
                        const moment = require("moment");
                     moment.locale("pt-br");
                     const min = moment().add(10, 'minutes');
                     const time = Math.floor(min.valueOf() / 1000);
                     const saldo = Number(Number(preco) * Number(quantidade)).toFixed(2)
                     let avatar = `${interaction.user.avatarURL({ dynamic: false })}`;
               const acesstoken = await api.get(`mp`);
               mercadopago.configurations.setAccessToken(acesstoken);
               var payment_data = {
                 transaction_amount: Number(saldo),
                 description: `Saldo - ${interaction.user.username}`,
                 payment_method_id: 'pix',
                 payer: {
                   email: pix.get(`email`),
                   first_name: 'Paula',
                   last_name: 'Guimaraes',
                   identification: {
                     type: 'CPF',
                     number: '07944777984'
                   },
                   address: {
                     zip_code: '06233200',
                     street_name: 'Av. das NaÃƒÂ§oes Unidas',
                     street_number: '3003',
                     neighborhood: 'Bonfim',
                     city: 'Osasco',
                     federal_unit: 'SP'
                   }
                 },
                 notification_url: `${avatar}`,
               };
                 if(interaction.customId === "comprar") {
                    if (timer) {
                        clearTimeout(timer);
                    }
                    timer = setTimeout(() => {
                        interaction.user.send({
                            embeds:[
                                new EmbedBuilder()
                                .setTitle(`${interaction.guild.name} | Sistema de Inatividade`)
                                .setDescription(`Ola ${interaction.user}, seu carrinho foi cancelado por inatividade`)
                            ],
                            components:[
                                new Discord.ActionRowBuilder()
                                .addComponents(
                                    new Discord.ButtonBuilder()
                                    .setCustomId("mensagemautomatica123")
                                    .setLabel("Mensagem Automatica")
                                    .setStyle(2)
                                    .setDisabled(true)
                                )
                            ]
                        });
        
        
                        
                        interaction.channel.delete()
                        interaction.guild.channels.cache.get(logs.get(`vendas`)).send({
                            embeds:[
                                new Discord.EmbedBuilder()
                                .setTitle(`${interaction.guild.name} | Sistema de Logs`)
                                .addFields(
                                    { name: '👥 | Usuário:', value: `${interaction.user.username} - \`${interaction.user.id}\`` },
                                    { name: '📝 | Carrinho Fechado:', value: `Produto: ${epd.nomeproduto} - \`${data_id}\`` },
                                    { name: '🕒 | Data / Horário do Fechamento:',  value: `<t:${Math.floor(new Date() / 1000)}:f> (<t:${~~(new Date() / 1000)}:R>)` },
                                    { name: '❔ | Motivo:',  value: `Inatividade` },
                                )
                            ]
                        })
        
        
                    }, 60000);
                    
                    const moment = require("moment");
                    moment.locale("pt-br");
                    const min = moment().add(10, 'minutes');
                    const time = Math.floor(min.valueOf() / 1000);
                    
                    interaction.update({
                        embeds:[
                            new Discord.EmbedBuilder()
                            .setTitle(`${interaction.guild.name} | Sistema de Compra`)
                            .setDescription(`\`\`\`Pague com pix para comprar seu BOT \`\`\``)
                            .addFields(
                                {
                                    name:"🌎 | Produto:",
                                    value:`${id}`
                                },
                                {
                                    name:"💸 | Valor",
                                    value:`R$${Number(Number(preco) * Number(quantidade)).toFixed(2)}`
                                },
                                {
                                    name:"Pagamento expira em:",
                                    value:`<t:${time}:f> (<t:${time}:R>)`
                                }
                            )
                        ],
                        components:[
                            new Discord.ActionRowBuilder()
                            .addComponents(
                                new Discord.ButtonBuilder()
                                .setCustomId("pixcarrinho")
                                .setLabel("Pix")
                                .setStyle(1)
                                .setEmoji("<:PIX:1135113811548966942>"),
                                new Discord.ButtonBuilder()
                                .setCustomId("cancelar")
                                .setLabel("Cancelar")
                                .setStyle(4)
                                .setEmoji("<a:1150939352503963768:1155318230345322507>")
                            )
                        ]
                    })
                 }
                 await mercadopago.payment.create(payment_data).then(function (data) {
                    const buffer = Buffer.from(data.body.point_of_interaction.transaction_data.qr_code_base64, "base64");
                    const attachment = new Discord.AttachmentBuilder(buffer, "payment.png");
                    const checkPaymentStatus = setInterval(() => {
                        axios.get(`https://api.mercadolibre.com/collections/notifications/${data.body.id}`, {
                          headers: {
                            'Authorization': `Bearer ${acesstoken}`
                          }
                        } ).then(async (doc) => {
                            
                          if(doc.data.collection.status) {

                            if(doc.data.collection.status !== "cancelled") {
                                

                                const tutu = db1.get(`carrinho_${channelid}`);
                                if(!tutu) {
                                    clearInterval(checkPaymentStatus);   
                                    return; 
                                }
                              if(tutu.status === "Aguardando...") {
                                if (doc.data.collection.status === "approved") {
                                    clearInterval(checkPaymentStatus);   
                                    await db1.set(`carrinho_${channelid}.status`, "Processando")
        
                                }
                              } else {clearInterval(checkPaymentStatus);   }


                              } else {
                                if (timer) {
                                    clearTimeout(timer);
                                }
                                interaction.user.send({
                                    embeds:[
                                        new EmbedBuilder()
                                        .setTitle(`${interaction.guild.name} | Sistema de Inatividade`)
                                        .setDescription(`Ola ${interaction.user}, seu carrinho foi cancelado por inatividade`)
                                    ],
                                    components:[
                                        new Discord.ActionRowBuilder()
                                        .addComponents(
                                            new Discord.ButtonBuilder()
                                            .setCustomId("mensagemautomatica123")
                                            .setLabel("Mensagem Automatica")
                                            .setStyle(2)
                                            .setDisabled(true)
                                        )
                                    ]
                                });
                
                
                                
                            interaction.channel.delete()
                                interaction.guild.channels.cache.get(logs.get(`vendas`)).send({
                                    embeds:[
                                        new Discord.EmbedBuilder()
                                        .setTitle(`${interaction.guild.name} | Sistema de Logs`)
                                        .addFields(
                                            { name: '👥 | Usuário:', value: `${interaction.user.username} - \`${interaction.user.id}\`` },
                                            { name: '📝 | Carrinho Fechado:', value: `Produto: ${epd.nomeproduto} - \`${data_id}\`` },
                                            { name: '🕒 | Data / Horário do Fechamento:',  value: `<t:${Math.floor(new Date() / 1000)}:f> (<t:${~~(new Date() / 1000)}:R>)` },
                                            { name: '❔ | Motivo:',  value: `Inatividade` },
                                        )
                                    ]
                                })
                                clearInterval(checkPaymentStatus);  
                              }
                          } else {
                            clearInterval(checkPaymentStatus);  
                          }
                         })
                    }, 60000);
                    
                 if(interaction.customId === "pixcarrinho") {
                    if (timer) {
                        clearTimeout(timer);
                    }
                    interaction.update({
                        components:[
                            new Discord.ActionRowBuilder()
                            .addComponents(
                                new Discord.ButtonBuilder()
                                .setCustomId("pix")
                                .setLabel("Pix Copiar e colar")
                                .setEmoji("<:PIX:1135113811548966942>")
                                .setStyle(1),
                                new Discord.ButtonBuilder()
                                .setCustomId("qrcode")
                                .setLabel("Qr Code")
                                .setEmoji("<:PIX:1135113811548966942>")
                                .setStyle(1),
                                new Discord.ButtonBuilder()
                                .setCustomId("cancelar123")
                                .setLabel("Cancelar")
                                .setStyle(4)
                                .setEmoji("<a:1150939352503963768:1155318230345322507>")
                            )
                        ]
                    })
                 }
                 if(interaction.customId === "qrcode") {
                    if (timer) {
                        clearTimeout(timer);
                    }
                    interaction.reply({ files: [attachment], ephemeral: true });
                    interaction.channel.edit({
                        permissionOverwrites:[
                            {
                                id: interaction.guild.id,
                                deny:["ViewChannel", "SendMessages"]
                            },
                            {
                                id: interaction.user.id,
                                allow:["ViewChannel", "SendMessages"]
                            },
                        ]
                    })
                 }
                 if(interaction.customId === "pix") {
                    if (timer) {
                        clearTimeout(timer);
                    }
                    interaction.reply({ content: `${data.body.point_of_interaction.transaction_data.qr_code}`, ephemeral: true });
                    interaction.channel.edit({
                        permissionOverwrites:[
                            {
                                id: interaction.guild.id,
                                deny:["ViewChannel", "SendMessages"]
                            },
                            {
                                id: interaction.user.id,
                                allow:["ViewChannel", "SendMessages"]
                            },
                        ]
                    })
                 }
                 if(interaction.customId === "cancelar123") {
                    if (timer) {
                        clearTimeout(timer);
                    }
                    clearInterval(checkPaymentStatus);
                    
                    
                    interaction.guild.channels.cache.get(logs.get(`vendas`)).send({
                        embeds:[
                            new Discord.EmbedBuilder()
                            .setTitle(`${interaction.guild.name} | Sistema de Logs`)
                            .addFields(
                                { name: '👥 | Usuário:', value: `${interaction.user.username} - \`${interaction.user.id}\`` },
                                { name: '📝 | Encerrou um Carrinho:', value: `Produto: ${epd.nomeproduto} - \`${data_id}\`` },
                                { name: '📝 | Motivo:', value: `\`Cancelada pelo usuário.\`` },
                                { name: '🕒 | Data / Horário do fechamento:',  value: `<t:${Math.floor(new Date() / 1000)}:f> (<t:${~~(new Date() / 1000)}:R>)` }
                            )
                        ]
                    });
                    channel.delete();
                    db1.delete(`carrinho_${channelid}`);

                 }
                 })
                     }

                 if(interaction.customId === "cancelar") {

                    if (timer) {
                            clearTimeout(timer);
                        }
                    
                    interaction.guild.channels.cache.get(logs.get(`vendas`)).send({
                        embeds:[
                            new Discord.EmbedBuilder()
                            .setTitle(`${interaction.guild.name} | Sistema de Logs`)
                            .addFields(
                                { name: '👥 | Usuário:', value: `${interaction.user.username} - \`${interaction.user.id}\`` },
                                { name: '📝 | Encerrou um Carrinho:', value: `Produto: ${epd.nomeproduto} - \`${data_id}\`` },
                                { name: '📝 | Motivo:', value: `\`Cancelada pelo usuário.\`` },
                                { name: '🕒 | Data / Horário do fechamento:',  value: `<t:${Math.floor(new Date() / 1000)}:f> (<t:${~~(new Date() / 1000)}:R>)` }
                            )
                        ]
                    });
                    channel.delete();
                    db1.delete(`carrinho_${interaction.channel.id}`);

                 }
                 if(interaction.customId === "adicionarcarrinho") {
                    quantidade++;
                    
                    if (timer) {
                        clearTimeout(timer);
                    }
                    timer = setTimeout(() => {
                        interaction.user.send({
                            embeds:[
                                new EmbedBuilder()
                                .setTitle(`${interaction.guild.name} | Sistema de Inatividade`)
                                .setDescription(`Ola ${interaction.user}, seu carrinho foi cancelado por inatividade`)
                            ],
                            components:[
                                new Discord.ActionRowBuilder()
                                .addComponents(
                                    new Discord.ButtonBuilder()
                                    .setCustomId("mensagemautomatica123")
                                    .setLabel("Mensagem Automatica")
                                    .setStyle(2)
                                    .setDisabled(true)
                                )
                            ]
                        });
        
        
                        
                        interaction.channel.delete()
                        interaction.guild.channels.cache.get(logs.get(`vendas`)).send({
                            embeds:[
                                new Discord.EmbedBuilder()
                                .setTitle(`${interaction.guild.name} | Sistema de Logs`)
                                .addFields(
                                    { name: '👥 | Usuário:', value: `${interaction.user.username} - \`${interaction.user.id}\`` },
                                    { name: '📝 | Carrinho Fechado:', value: `Produto: ${epd.nomeproduto} - \`${data_id}\`` },
                                    { name: '🕒 | Data / Horário do Fechamento:',  value: `<t:${Math.floor(new Date() / 1000)}:f> (<t:${~~(new Date() / 1000)}:R>)` },
                                    { name: '❔ | Motivo:',  value: `Inatividade` },
                                )
                            ]
                        })
        
        
                    }, 60000);

            
            
                    db1.add(`carrinho_${interaction.channel.id}.quantia`, 1);
                    interaction.update({
                        embeds:[
                            new Discord.EmbedBuilder()
                            .setTitle(`${interaction.guild.name} | Sistema de Compras`)
                            .setDescription(`📦 | Produto: **${id}** ${tipo} x${quantidade} - (${Dias * quantidade} Dias)\n\n💰 | Valor: R$${Number(Number(preco) * Number(quantidade)).toFixed(2)}`)
                        ],
                        components:[
                            new Discord.ActionRowBuilder()
                            .addComponents(
                                new Discord.ButtonBuilder()
                                .setCustomId("adicionarcarrinho")
                                .setLabel("+")
                                .setStyle(2),
                                new Discord.ButtonBuilder()
                                .setCustomId("comprar")
                                .setLabel("Comprar")
                                .setStyle(3)
                                .setEmoji("<a:1150938888479703081:1155318227736469555>"),
                                new Discord.ButtonBuilder()
                                .setCustomId("removercarrinho")
                                .setLabel("-")
                                .setStyle(2),
                                new Discord.ButtonBuilder()
                                .setCustomId("cancelar")
                                .setLabel("Cancelar")
                                .setStyle(4)
                                .setEmoji("<a:1150939352503963768:1155318230345322507>")
                            )
                        ]
                    })
                   
                 }
                 if(interaction.customId === "removercarrinho") {
                    if (timer) {
                        clearTimeout(timer);
                    }
                    timer = setTimeout(() => {
                        interaction.user.send({
                            embeds:[
                                new EmbedBuilder()
                                .setTitle(`${interaction.guild.name} | Sistema de Inatividade`)
                                .setDescription(`Ola ${interaction.user}, seu carrinho foi cancelado por inatividade`)
                            ],
                            components:[
                                new Discord.ActionRowBuilder()
                                .addComponents(
                                    new Discord.ButtonBuilder()
                                    .setCustomId("mensagemautomatica123")
                                    .setLabel("Mensagem Automatica")
                                    .setStyle(2)
                                    .setDisabled(true)
                                )
                            ]
                        });
        
        
                        
                        interaction.channel.delete()
                        interaction.guild.channels.cache.get(logs.get(`vendas`)).send({
                            embeds:[
                                new Discord.EmbedBuilder()
                                .setTitle(`${interaction.guild.name} | Sistema de Logs`)
                                .addFields(
                                    { name: '👥 | Usuário:', value: `${interaction.user.username} - \`${interaction.user.id}\`` },
                                    { name: '📝 | Carrinho Fechado:', value: `Produto: ${epd.nomeproduto} - \`${data_id}\`` },
                                    { name: '🕒 | Data / Horário do Fechamento:',  value: `<t:${Math.floor(new Date() / 1000)}:f> (<t:${~~(new Date() / 1000)}:R>)` },
                                    { name: '❔ | Motivo:',  value: `Inatividade` },
                                )
                            ]
                        })
        
        
                    }, 60000);   
    
                    if(quantidade < 2) {
                        interaction.reply({
                            embeds:[
                                new Discord.EmbedBuilder()
                                .setDescription(`❌ | Você só pode colocar de 1 pra cima`)
                            ],
                            ephemeral:true
                        })
                        return;
                    }
                    quantidade--;
                    db1.set(`carrinho_${channelid}.quantia`, quantidade)
                    interaction.update({
                        embeds:[
                            new Discord.EmbedBuilder()
                            .setTitle(`${interaction.guild.name} | Sistema de Compras`)
                            .setDescription(`📦 | Produto: **${id}** ${tipo} x${quantidade} - (${Dias * quantidade} Dias)\n\n💰 | Valor: R$${Number(Number(preco) * Number(quantidade)).toFixed(2)}`)
                        ],
                        components:[
                            new Discord.ActionRowBuilder()
                            .addComponents(
                                new Discord.ButtonBuilder()
                                .setCustomId("adicionarcarrinho")
                                .setLabel("+")
                                .setStyle(2),
                                new Discord.ButtonBuilder()
                                .setCustomId("comprar")
                                .setLabel("Comprar")
                                .setStyle(3)
                                .setEmoji("<a:1150938888479703081:1155318227736469555>"),
                                new Discord.ButtonBuilder()
                                .setCustomId("removercarrinho")
                                .setLabel("-")
                                .setStyle(2),
                                new Discord.ButtonBuilder()
                                .setCustomId("cancelar")
                                .setLabel("Cancelar")
                                .setStyle(4)
                                .setEmoji("<a:1150939352503963768:1155318230345322507>")
                            )
                        ]
                    })
                   
                 }
                
                })
            })
            })
        }
    }

    }
}