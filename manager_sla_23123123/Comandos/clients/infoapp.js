const { StringSelectMenuBuilder, EmbedBuilder, ActionRowBuilder, ApplicationCommandType, ApplicationCommandOptionType, ButtonBuilder, ComponentType, ModalBuilder, TextInputBuilder, AttachmentBuilder } = require("discord.js")
const { JsonDatabase, } = require("wio.db");
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

module.exports = {
    name: "infoapp",
    description:"Veja as informações de suas aplicações",
    type: ApplicationCommandType.ChatInput,  
    run: async(client, interaction) => {
      const auto = apps.all().filter(pd => pd.data.owner === interaction.user.id)
        if(auto.length <= 0) {
            return interaction.reply({content:"❌ | Você não tem acesso, compre um bot para podê usar este comando!", ephemeral:true});
        }
        let embed = new EmbedBuilder()
        .setTitle("Gerenciar suas Mensalidades")
        .setDescription(`Segue Abaixo suas mensalidades / serviços para alteração ou renovação.`);
        const select = new StringSelectMenuBuilder().setCustomId("renovar").setMaxValues(1).setPlaceholder("Renovação de Aplicação.");
        auto.map((but) => {
          const buteco = but.data
          select.addOptions(
              {
                  label: `${buteco.nome} - ${buteco.idapp}`,
                  description:`${buteco.produto}`,
                  value:`${buteco.idapp}`
              }
          )
          
    
            var timestamp = Math.floor(new Date(buteco.dataExpiracao).getTime() / 1000)
            embed.addFields(
                {
                    name:`📦 ${buteco.nome}`,
                    value:`<t:${timestamp}:f> - <t:${timestamp}:R>`
                }
            )

        })
        interaction.reply({
            embeds:[
                embed
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(select)
            ]
        }).then( async (msg) => {
            
        const user = interaction.user
        const interação = msg.createMessageComponentCollector({ componentType: ComponentType.StringSelect });
        interação.on("collect", async (interaction) => {
         if (user.id !== interaction.user.id) {
            interaction.deferUpdate()
           return;
         } 
         let produto;
         let nome;
         let vencimento;
         let ids;

         if(interaction.isStringSelectMenu() && interaction.customId === "renovar") {
            interaction.deferUpdate()
            ids = interaction.values[0]

            auto.map((but) => {
              const buteco = but.data
                if(buteco.idapp === ids) {
                    produto = buteco.produto;
                    nome = buteco.nome ;
                    vencimento = buteco.dataExpiracao 
                }
            })
            var timestamp = Math.floor(new Date(vencimento).getTime() / 1000)
                interaction.message.edit({
                    embeds:[
                        new EmbedBuilder()
                        .setTitle(`${interaction.guild.name} | Sistema de renovação`)
                        .addFields(
                            {
                                name:"📦 | Aplicação:",
                                value:`${nome}`
                            },
                            {
                                name:"✍ | Aplicação expira em.",
                                value:`<t:${timestamp}:f> (<t:${timestamp}:R>)`
                            }
                        )
                    ],
                    components:[
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId("7dias123")
                            .setLabel("7 Dias")
                            .setStyle(2)
                            .setEmoji("🕒"),
                            new ButtonBuilder()
                            .setCustomId("15dias123")
                            .setLabel("15 Dias")
                            .setStyle(2)
                            .setEmoji("🕒"),
                            new ButtonBuilder()
                            .setCustomId("30dias123")
                            .setLabel("30 Dias")
                            .setStyle(2)
                            .setEmoji("🕒"),
                        )
                    ]
                })
    
        }

        client.on("interactionCreate", async (interaction) => {


            if(interaction.isButton() && interaction.customId === "30dias123") {
                const moment = require("moment");
                moment.locale("pt-br");
                const min = moment().add(10, 'minutes');
                const time = Math.floor(min.valueOf() / 1000);
                const saldo = await db.get(`${produto}.preco.mensal.preco`)
                let avatar = `${interaction.user.avatarURL({ dynamic: false })}`;
          const acesstoken = api.get(`mp`);
          mercadopago.configurations.setAccessToken(acesstoken);
          var payment_data = {
            transaction_amount: Number(saldo),
            description: `Saldo - ${interaction.user.username}`,
            payment_method_id: 'pix',
            payer: {
              email: chave.get(`email`),
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

          mercadopago.payment.create(payment_data).then(function (data) {
            const buffer = Buffer.from(data.body.point_of_interaction.transaction_data.qr_code_base64, "base64");
            const attachment = new AttachmentBuilder(buffer, "payment.png");
            let row = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setLabel("Pix copia e cola")
                .setEmoji("<:PIX:1158901133692117022>")
                .setCustomId("cpc")
                .setStyle(1),
              new ButtonBuilder()
                .setLabel("Qr code")
                .setEmoji("<:9_qr:1141320238361747526>")
                .setCustomId("qrc")
                .setStyle(1),
              new ButtonBuilder()
                
                .setEmoji("<a:cancel:1136612240217346092>")
                .setCustomId("cancelaar")
                .setStyle(4),
            );

          const embed = new EmbedBuilder()
            .setTitle(`${interaction.guild.name}| Sistema de saldo`)
            .setDescription(`
\`\`\`
Pague com pix Para renovar sua mensalidade.
\`\`\`
💸 **| Valor:**
\`R$ ${saldo}\`
🕒 **| Pagamento expira em:**
<t:${time}:f> (<t:${time}:R>)
      `)
            .setTimestamp()
            .setFooter({text:"Após efetuar o pagamento, o tempo de renovação é de no maximo 1 minuto!",iconURL: interaction.user.avatarURL({ dynamic: true })});

          interaction.update({ embeds: [embed], components: [row] }).then(msg => {
            const checkPaymentStatus = setInterval(() => {
              axios.get(`https://api.mercadolibre.com/collections/notifications/${data.body.id}`, {
                headers: {
                  'Authorization': `Bearer ${acesstoken}`
                }
              }).then(async (doc) => {
                if (doc.data.collection.status === "approved") {
                  clearInterval(checkPaymentStatus);
                  msg.edit({
                    embeds:[],
                    components:[],
                    content:"Pagamento Aprovado, use /infoapps para ver o tempo"
                  })

const dataExpiracao = moment(vencimento);
const novaDataExpiracao = dataExpiracao.add(30, 'days');

const novaDataString = novaDataExpiracao.toISOString();
apps.set(`${ids}.dataExpiracao`, novaDataString);

        client.channels.cache.get(logs.get(`renov`)).send({
            embeds:[
                new EmbedBuilder()
                .setTitle(`${interaction.guild.name} | Sistema de Renovação`)
                .setDescription(`O Usuario: ${interaction.user} Adicionou 30 Dias e pagou ${saldo} na aplicação: ${ids}, Agora ele tem <t:${Math.floor(novaDataExpiracao / 1000)}:R>`)
            ]
        })
    
                }
              }).catch(err => {
                console.error(err);
              });
            }, 5000); 

            const timeout = setTimeout(() => {
              msg.edit({ embeds: [], components: [], content: `🕒 **| Tempo esgotado**` });
              clearInterval(checkPaymentStatus);
            }, 300000);

            const collectorFilter = (interaction) => interaction.user.id === interaction.user.id;
            const collector = msg.createMessageComponentCollector({ filter: collectorFilter });

            collector.on("collect", interaction => {
              if (interaction.customId === 'cpc') {
                interaction.reply({ content: `${data.body.point_of_interaction.transaction_data.qr_code}`, ephemeral: true });
              }
              if (interaction.customId === "qrc") {
                interaction.reply({ files: [attachment], ephemeral: true });
              }
              if (interaction.customId === 'cancelaar') {
                msg.delete();
                clearTimeout(timeout);
                clearInterval(checkPaymentStatus);
              }
            });
          });
        })


            }


            if(interaction.isButton() && interaction.customId === "15dias123") {
                const moment = require("moment");
                moment.locale("pt-br");
                const min = moment().add(10, 'minutes');
                const time = Math.floor(min.valueOf() / 1000);
                const saldo = await db.get(`${produto}.preco.quizena.preco`)
                let avatar = `${interaction.user.avatarURL({ dynamic: false })}`;
          const acesstoken = api.get(`mp`);
          mercadopago.configurations.setAccessToken(acesstoken);
          var payment_data = {
            transaction_amount: Number(saldo),
            description: `Saldo - ${interaction.user.username}`,
            payment_method_id: 'pix',
            payer: {
              email: chave.get(`email`),
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

          mercadopago.payment.create(payment_data).then(function (data) {
            const buffer = Buffer.from(data.body.point_of_interaction.transaction_data.qr_code_base64, "base64");
            const attachment = new AttachmentBuilder(buffer, "payment.png");
            let row = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setLabel("Pix copia e cola")
                .setEmoji("<:PIX:1158901133692117022>")
                .setCustomId("cpc")
                .setStyle(1),
              new ButtonBuilder()
                .setLabel("Qr code")
                .setEmoji("<:9_qr:1141320238361747526>")
                .setCustomId("qrc")
                .setStyle(1),
              new ButtonBuilder()
                
                .setEmoji("<a:cancel:1136612240217346092>")
                .setCustomId("cancelaar")
                .setStyle(4),
            );

          const embed = new EmbedBuilder()
            .setTitle(`${interaction.guild.name}| Sistema de saldo`)
            .setDescription(`
\`\`\`
Pague com pix Para renovar sua mensalidade.
\`\`\`
💸 **| Valor:**
\`R$ ${saldo}\`
🕒 **| Pagamento expira em:**
<t:${time}:f> (<t:${time}:R>)
      `)
            .setTimestamp()
            .setFooter({text:"Após efetuar o pagamento, o tempo de renovação é de no maximo 1 minuto!",iconURL: interaction.user.avatarURL({ dynamic: true })});

          interaction.update({ embeds: [embed], components: [row] }).then(msg => {
            const checkPaymentStatus = setInterval(() => {
              axios.get(`https://api.mercadolibre.com/collections/notifications/${data.body.id}`, {
                headers: {
                  'Authorization': `Bearer ${acesstoken}`
                }
              }).then(async (doc) => {
                if (doc.data.collection.status === "approved") {
                  clearInterval(checkPaymentStatus);
                  msg.edit({
                    embeds:[],
                    components:[],
                    content:"Pagamento Aprovado, use /infoapps para ver o tempo"
                  })


const dataExpiracao = moment(vencimento);
const novaDataExpiracao = dataExpiracao.add(15, 'days');

const novaDataString = novaDataExpiracao.toISOString();
apps.set(`${ids}.dataExpiracao`, novaDataString);


        client.channels.cache.get(logs.get(`renov`)).send({
            embeds:[
                new EmbedBuilder()
                .setTitle(`${interaction.guild.name} | Sistema de Renovação`)
                .setDescription(`O Usuario: ${interaction.user} Adicionou 15 Dias e pagou ${saldo} na aplicação ${ids}, Agora ele tem <t:${Math.floor(novaDataExpiracao / 1000)}:R>`)
            ]
        })
    
                }
              }).catch(err => {
                console.error(err);
              });
            }, 5000); 

            const timeout = setTimeout(() => {
              msg.edit({ embeds: [], components: [], content: `🕒 **| Tempo esgotado**` });
              clearInterval(checkPaymentStatus);
            }, 300000);

            const collectorFilter = (interaction) => interaction.user.id === interaction.user.id;
            const collector = msg.createMessageComponentCollector({ filter: collectorFilter });

            collector.on("collect", interaction => {
              if (interaction.customId === 'cpc') {
                interaction.reply({ content: `${data.body.point_of_interaction.transaction_data.qr_code}`, ephemeral: true });
              }
              if (interaction.customId === "qrc") {
                interaction.reply({ files: [attachment], ephemeral: true });
              }
              if (interaction.customId === 'cancelaar') {
                msg.delete();
                clearTimeout(timeout);
                clearInterval(checkPaymentStatus);
              }
            });
          });
        })


            }

            if(interaction.isButton() && interaction.customId === "7dias123") {
                const moment = require("moment");
                moment.locale("pt-br");
                const min = moment().add(10, 'minutes');
                const time = Math.floor(min.valueOf() / 1000);
                const saldo = await db.get(`${produto}.preco.semanal.preco`)
                let avatar = `${interaction.user.avatarURL({ dynamic: false })}`;
          const acesstoken = api.get(`mp`);
          mercadopago.configurations.setAccessToken(acesstoken);
          var payment_data = {
            transaction_amount: Number(saldo),
            description: `Saldo - ${interaction.user.username}`,
            payment_method_id: 'pix',
            payer: {
              email: chave.get(`email`),
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

          mercadopago.payment.create(payment_data).then(function (data) {
            const buffer = Buffer.from(data.body.point_of_interaction.transaction_data.qr_code_base64, "base64");
            const attachment = new AttachmentBuilder(buffer, "payment.png");
            let row = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setLabel("Pix copia e cola")
                .setEmoji("<:PIX:1158901133692117022>")
                .setCustomId("cpc")
                .setStyle(1),
              new ButtonBuilder()
                .setLabel("Qr code")
                .setEmoji("<:9_qr:1141320238361747526>")
                .setCustomId("qrc")
                .setStyle(1),
              new ButtonBuilder()
                
                .setEmoji("<a:cancel:1136612240217346092>")
                .setCustomId("cancelaar")
                .setStyle(4),
            );

          const embed = new EmbedBuilder()
            .setTitle(`${interaction.guild.name}| Sistema de saldo`)
            .setDescription(`
\`\`\`
Pague com pix Para renovar sua mensalidade.
\`\`\`
💸 **| Valor:**
\`R$ ${saldo}\`
🕒 **| Pagamento expira em:**
<t:${time}:f> (<t:${time}:R>)
      `)
            .setTimestamp()
            .setFooter({text:"Após efetuar o pagamento, o tempo de renovação é de no maximo 1 minuto!",iconURL: interaction.user.avatarURL({ dynamic: true })});

          interaction.update({ embeds: [embed], components: [row] }).then(msg => {
            const checkPaymentStatus = setInterval(() => {
              axios.get(`https://api.mercadolibre.com/collections/notifications/${data.body.id}`, {
                headers: {
                  'Authorization': `Bearer ${acesstoken}`
                }
              }).then(async (doc) => {
                if (doc.data.collection.status === "approved") {
                  clearInterval(checkPaymentStatus);
                  msg.edit({
                    embeds:[],
                    components:[],
                    content:"Pagamento Aprovado, use /infoapps para ver o tempo"
                  })


const dataExpiracao = moment(vencimento);
const novaDataExpiracao = dataExpiracao.add(7, 'days');

const novaDataString = novaDataExpiracao.toISOString();
apps.set(`${ids}.dataExpiracao`, novaDataString);

        client.channels.cache.get(logs.get(`renov`)).send({
            embeds:[
                new EmbedBuilder()
                .setTitle(`${interaction.guild.name} | Sistema de Renovação`)
                .setDescription(`O Usuario: ${interaction.user} Adicionou 7 Dias e pagou ${saldo} na aplicação: ${ids}, Agora ele tem <t:${Math.floor(novaDataExpiracao / 1000)}:R>`)
            ]
        })
    
                }
              }).catch(err => {
                console.error(err);
              });
            }, 5000); 

            const timeout = setTimeout(() => {
              msg.edit({ embeds: [], components: [], content: `🕒 **| Tempo esgotado**` });
              clearInterval(checkPaymentStatus);
            }, 300000);

            const collectorFilter = (interaction) => interaction.user.id === interaction.user.id;
            const collector = msg.createMessageComponentCollector({ filter: collectorFilter });

            collector.on("collect", interaction => {
              if (interaction.customId === 'cpc') {
                interaction.reply({ content: `${data.body.point_of_interaction.transaction_data.qr_code}`, ephemeral: true });
              }
              if (interaction.customId === "qrc") {
                interaction.reply({ files: [attachment], ephemeral: true });
              }
              if (interaction.customId === 'cancelaar') {
                msg.delete();
                clearTimeout(timeout);
                clearInterval(checkPaymentStatus);
              }
            });
          });
        })


            }
        })

        })
    })
          

    }}