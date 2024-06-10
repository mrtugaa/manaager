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


module.exports = {
    name:"interactionCreate",
    run:async(interaction, client) => {
        let produto;
        let nome;
        let vencimento;
        const id = interaction.customId;
        if(interaction.isButton() && interaction.customId.endsWith("_outrasapp")) {
            const ids = id.split("_")[0];
			if(interaction.user.id !== await db2.get(`${ids}.owner`)) return interaction.deferUpdate()
            const api1 = new SquareCloudAPI(api.get(`square`));
            const application = await api1.applications.get(ids);
            interaction.reply({
                components:[
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId(`${ids}_alterarnomeapp`)
                        .setLabel(`Alterar Nome da Aplicação`)
                        .setStyle(3)
                        .setEmoji(`✏`),
                        new ButtonBuilder()
                        .setCustomId(`${ids}_alterartokenapp`)
                        .setLabel(`Alterar token da Aplicação`)
                        .setStyle(2)
                        .setEmoji(`🛠`),
                        new ButtonBuilder()
                        .setCustomId(`${ids}_transferirposseapp`)
                        .setLabel(`Alterar Posse da Aplicação`)
                        .setStyle(4),
                        new ButtonBuilder()
                        .setCustomId(`${ids}_deletapp`)
                        .setLabel(`Deletar Aplicação`)
                        .setStyle(4),

                    )
                ],
                ephemeral:true
            })
        }
        if(interaction.isButton() && interaction.customId.endsWith("_deletapp")) {
            const ids = id.split("_")[0];
			if(interaction.user.id !== await db2.get(`${ids}.owner`)) return interaction.deferUpdate()
			const auto = db2.all().filter(pd => pd.data.owner === interaction.user.id);
			auto.map((but) => {
                const buteco = but.data
                if(buteco.idapp === ids) {
                    produto = buteco.produto;
                    nome = buteco.nome ;
                    vencimento = buteco.dataExpiracao 
                }
            })
            const modal = new ModalBuilder()
            .setCustomId(`${ids}_deleteapp_modal`)
            .setTitle(`Deletar Aplicação`);
            const text = new TextInputBuilder()
            .setCustomId(`text`)
            .setStyle(1)
            .setLabel(`Coloque: ${nome} Para Deletar`)
            .setPlaceholder(`Coloque do jeito que está!`);

            modal.addComponents(new ActionRowBuilder().addComponents(text));
            await interaction.showModal(modal);
        }
        if(interaction.isModalSubmit() && interaction.customId.endsWith("_deleteapp_modal")) {
            const ids = id.split("_")[0];
			if(interaction.user.id !== await db2.get(`${ids}.owner`)) return interaction.deferUpdate()
            const api1 = new SquareCloudAPI(api.get(`square`));
            const application = await api1.applications.get(ids);
            const text = interaction.fields.getTextInputValue(`text`);
			const auto = db2.all().filter(pd => pd.data.owner === interaction.user.id);
			auto.map((but) => {
                const buteco = but.data
                if(buteco.idapp === ids) {
                    produto = buteco.produto;
                    nome = buteco.nome ;
                    vencimento = buteco.dataExpiracao 
                }
            });
            if(text !== nome) {
                interaction.reply({
                    content:`❌ | Coloque o ${nome} da mesma forma!`,
                    ephemeral:true
                })
            }
            const userId = interaction.user.id;
            const application123 = await api1.applications.get(ids)
            
            interaction.update({
                embeds:[],
                content:`Aplicativo Deletado com sucesso!`,
                components:[]
            })
            db2.delete(`${ids}`)
            await application123.delete()
         
        }
        if(interaction.isButton() && interaction.customId.endsWith("_transferirposseapp")) {
			const ids = id.split("_")[0];
			if(interaction.user.id !== await db2.get(`${ids}.owner`)) return interaction.deferUpdate()
			const auto = db2.all().filter(pd => pd.data.owner === interaction.user.id);
			auto.map((but) => {
                const buteco = but.data
                if(buteco.idapp === ids) {
                    produto = buteco.produto;
                    nome = buteco.nome ;
                    vencimento = buteco.dataExpiracao 
                }
            })
            const modal = new ModalBuilder()
            .setCustomId(`${ids}_transferirposseapp_modal`)
            .setTitle(`${nome} - Transferir Posse`);

            const text = new TextInputBuilder()
            .setCustomId(`text`)
            .setLabel(`Qual é o id do usuario?`)
            .setStyle(1)
            .setPlaceholder(`LOGO APÓS DE VOCÊ PASSAR A POSSE NÃO TERÁ ACESSO AO BOT!`)
            .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            await interaction.showModal(modal);
        }
        if(interaction.isModalSubmit() && interaction.customId.endsWith("_transferirposseapp_modal")) {
			const ids = id.split("_")[0];
			if(interaction.user.id !== await db2.get(`${ids}.owner`)) return interaction.deferUpdate()
            const text = interaction.fields.getTextInputValue(`text`)
            const users = interaction.guild.members.cache.get(text)
            if(!users) {
                interaction.reply({
                    content:`Eu não achei este usuario, certifique que ele esteja nesse servidor!!`,
                    ephemeral:true
                });
                return;
            }
const auto = db2.all().filter(pd => pd.data.owner === interaction.user.id);
			auto.map((but) => {
                const buteco = but.data
                if(buteco.idapp === ids) {
                    produto = buteco.produto;
                    nome = buteco.nome ;
                    vencimento = buteco.dataExpiracao 
                }
            })
            const userId = interaction.user.id;
            db2.set(`${ids}.owner`, text)
            
            interaction.update({
                embeds:[],
                components:[],
                content:`a posse foi transferida com sucesso!`
            })

        }
        if(interaction.isButton() && interaction.customId.endsWith("_alterartokenapp")) {
			const ids = id.split("_")[0];
			if(interaction.user.id !== await db2.get(`${ids}.owner`)) return interaction.deferUpdate()
            const modal = new ModalBuilder()
            .setCustomId(`${ids}_alterartokenapp_modal`)
            .setTitle(`Alterar Token do Bot`);
            const text = new TextInputBuilder()
            .setCustomId(`text`)
            .setLabel(`Coloque Token Bot`)
            .setStyle(1)
            .setRequired(true)
            .setPlaceholder(`Coloque o Token Certo!`);

            modal.addComponents(new ActionRowBuilder().addComponents(text))
            await interaction.showModal(modal)
        }
        if (interaction.isModalSubmit() && interaction.customId.endsWith("_alterartokenapp_modal")) {
            const ids = id.split("_")[0]
            const api1 = new SquareCloudAPI(api.get(`square`));
            const application = await api1.applications.get(ids);
            const msgas = await interaction.reply({
                content:`Aguarde um momento...`,
                ephemeral:true
            })
            const token = interaction.fields.getTextInputValue(`text`);
            const data = JSON.stringify({ token: token, owner: interaction.user.id });
            let produto;
            let nome;
            let vencimento;

            const auto = db2.all().filter(pd => pd.data.owner === interaction.user.id)
            const select = new StringSelectMenuBuilder().setCustomId(`appsconfig`).setPlaceholder(`Selecione a Aplicação.`);
            auto.map((but) => {
                const buteco = but.data
                select.addOptions(
                    {
                        label: `${buteco.nome} - ${buteco.idapp}`,
                        description:`${buteco.produto}`,
                        value:`${buteco.idapp}`
                    }
                )
                
            })
            auto.map((but) => {
                const buteco = but.data
                if(buteco.idapp === ids) {
                    produto = buteco.produto;
                    nome = buteco.nome ;
                    vencimento = buteco.dataExpiracao 
                }
            })
            fs.writeFile(`source/client/${ids}.json`, data,async  (err) => {
                if (err) throw err;
                try{
                    const application123 = await api1.applications.get(ids)
                application123.commit(`source/client/${ids}.json`, 'token.json', true).then(async () => {
                    let produto;
                    let nome;
                    let vencimento;
                    auto.map((but) => {
                        const buteco = but.data
                        if(buteco.idapp === ids) {
                            produto = buteco.produto;
                            nome = buteco.nome ;
                            vencimento = buteco.dataExpiracao 
                        }
                    })
                    var timestamp = Math.floor(new Date(vencimento).getTime() / 1000)
                        const status = await  application123.getStatus()
                        interaction.message.edit({
                            embeds:[
                                new EmbedBuilder()
                                .setTitle(`${nome} | Aplicação`)
                                .addFields(
                                    {
                                        name:`💻 | Cpu`,
                                        value:`\`${status.usage.cpu}\``,
                                        inline:true
                                    },
                                    {
                                        name:`🧠 | Memória Ram`,
                                        value:`\`${status.usage.ram}\``,
                                        inline:true
                                    },
                                    {
                                        name:`💾 | SSD`,
                                        value:`\`${status.usage.storage}\``,
                                        inline:true
                                    },
                                    {
                                        name:`🌐 | Network (Total)`,
                                        value:`\`${status.usage.network.total}\``,
                                        inline:true
                                    },
                                    {
                                        name:`🌐 | Network(now)`,
                                        value:`\`${status.usage.network.now}\``,
                                        inline:true
                                    },
                                    {
                                        name:`📨 | Requests`,
                                        value:`\`${status.requests}\``,
                                        inline:true
                                    },
                                )
                                .addFields(
                                    {
                                        name:`${status.status === `running` ? `🟢 | Status` : `🔴 | Status`}`,
                                        value:`${status.status === `running` ? `\`Em execução\`` : `\`Está Parado\``}`,
                                        inline:true
                                    },
                                    {
                                        name:`⏰ | UpTime`,
                                        value:`${status.uptimeTimestamp === undefined ? `Bot está Desligado.` : `<t:${Math.floor(status.uptimeTimestamp / 1000)}:R>`}`,
                                        inline:true
                                    },
                                    {
                                        name:`🕒 | Expira em:`,
                                        value:`<t:${timestamp}:f> (<t:${timestamp}:R>) `
                                    }
                                )
                            ],
                            components:[
                                new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                    .setCustomId(`${ids}_ligarapp`)
                                    .setLabel(`Ligar`)
                                    .setStyle(1)
                                    .setDisabled(status.status === `running` ? true : false)
                                    .setEmoji(`⬆`),
                                    new ButtonBuilder()
                                    .setCustomId(`${ids}_desligarapp`)
                                    .setLabel(`Desligar`)
                                    .setDisabled(status.status === `running` ? false : true )
                                    .setStyle(4)
                                    .setEmoji(`⬇`),
                                    new ButtonBuilder()
                                    .setCustomId(`${ids}_reiniciarapp`)
                                    .setLabel(`Reiniciar`)
                                    .setStyle(2)
                                    .setEmoji(`🔁`),
                                    new ButtonBuilder()
                                    .setCustomId(`${ids}_outrasapp`)
                                    .setLabel(`Outras Configurações`)
                                    .setStyle(2)
                                    .setEmoji(`⚙`),
                                ),
                                new ActionRowBuilder()
                                .addComponents(select)
                            ]
                        }).then(() => {
                            
                fs.unlink(`source/client/${ids}.json`, (err) => {
                    if (err) throw err;
                    console.log('Token excluído com sucesso!');
                });
                        })
                        msgas.edit(`Agora Sim!`)
                }).catch(() => {
                    msgas.edit(`Coloque um token certo!`)
                })

                } catch (err){
                    console.log(`Ocorreu um Erro: ${err}`)
                    msgas.edit(`Ocorreu um erro ao tentar trocar o seu token...`)
                }
            });
        }
        if(interaction.isButton() && interaction.customId.endsWith("_alterarnomeapp")) {
			const ids = id.split("_")[0];
			if(interaction.user.id !== await db2.get(`${ids}.owner`)) return interaction.deferUpdate()

            const modal = new ModalBuilder()
            .setCustomId(`${ids}_alterarnomeapp_modal`)
            .setTitle(`Alterar Nome da Aplicação`);

            const text = new TextInputBuilder()
            .setCustomId(`text`)
            .setLabel(`Qual será o novo nome?`)
            .setStyle(1)
            .setPlaceholder(`Coloque o nome que ira ser trocado!`)
            .setRequired(true);
             
            modal.addComponents(new ActionRowBuilder().addComponents(text))
            await interaction.showModal(modal)
        }

        if(interaction.isModalSubmit() && interaction.customId.endsWith("_alterarnomeapp_modal")) {
            const ids = id.split("_")[0];
			if(interaction.user.id !== await db2.get(`${ids}.owner`)) return interaction.deferUpdate()
            const text = interaction.fields.getTextInputValue(`text`);
            const msg1 = await interaction.reply({
                content:`Aguarde um Momento!`,
                ephemeral:true
            })

            const auto = db2.all().filter(pd => pd.data.owner === interaction.user.id)
            const select = new StringSelectMenuBuilder().setCustomId(`appsconfig`).setPlaceholder(`Selecione a Aplicação.`);
            auto.map((but) => {
                const buteco = but.data
                select.addOptions(
                    {
                        label: `${buteco.nome} - ${buteco.idapp}`,
                        description:`${buteco.produto}`,
                        value:`${buteco.idapp}`
                    }
                )
                
            })
            auto.map((but) => {
                const buteco = but.data
                if(buteco.idapp === ids) {
                    produto = buteco.produto;
                    nome = buteco.nome ;
                    vencimento = buteco.dataExpiracao 
                }
            })
            const idToModify = ids
            db2.set(`${idToModify}.nome`, `${text}`)
            const api1 = new SquareCloudAPI(api.get(`square`));
            const application = await api1.applications.get(ids);
            let produto;
            let nome;
            let vencimento;

            auto.map((but) => {
                const buteco = but.data
                if(buteco.idapp === ids) {
                    produto = buteco.produto;
                    nome = buteco.nome ;
                    vencimento = buteco.dataExpiracao 
                }
            })
            var timestamp = Math.floor(new Date(vencimento).getTime() / 1000)
                const status = await application.getStatus()
                interaction.message.edit({
                    embeds:[
                        new EmbedBuilder()
                        .setTitle(`${nome} | Aplicação`)
                        .addFields(
                            {
                                name:`💻 | Cpu`,
                                value:`\`${status.usage.cpu}\``,
                                inline:true
                            },
                            {
                                name:`🧠 | Memória Ram`,
                                value:`\`${status.usage.ram}\``,
                                inline:true
                            },
                            {
                                name:`💾 | SSD`,
                                value:`\`${status.usage.storage}\``,
                                inline:true
                            },
                            {
                                name:`🌐 | Network (Total)`,
                                value:`\`${status.usage.network.total}\``,
                                inline:true
                            },
                            {
                                name:`🌐 | Network(now)`,
                                value:`\`${status.usage.network.now}\``,
                                inline:true
                            },
                            {
                                name:`📨 | Requests`,
                                value:`\`${status.requests}\``,
                                inline:true
                            },
                        )
                        .addFields(
                            {
                                name:`${status.status === `running` ? `🟢 | Status` : `🔴 | Status`}`,
                                value:`${status.status === `running` ? `\`Em execução\`` : `\`Está Parado\``}`,
                                inline:true
                            },
                            {
                                name:`⏰ | UpTime`,
                                value:`${status.uptimeTimestamp === undefined ? `Bot está Desligado.` : `<t:${Math.floor(status.uptimeTimestamp / 1000)}:R>`}`,
                                inline:true
                            },
                            {
                                name:`🕒 | Expira em:`,
                                value:`<t:${timestamp}:f> (<t:${timestamp}:R>) `
                            }
                        )
                    ],
                    components:[
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId(`${ids}_ligarapp`)
                            .setLabel(`Ligar`)
                            .setStyle(1)
                            .setDisabled(status.status === `running` ? true : false)
                            .setEmoji(`⬆`),
                            new ButtonBuilder()
                            .setCustomId(`${ids}_desligarapp`)
                            .setLabel(`Desligar`)
                            .setDisabled(status.status === `running` ? false : true )
                            .setStyle(4)
                            .setEmoji(`⬇`),
                            new ButtonBuilder()
                            .setCustomId(`${ids}_reiniciarapp`)
                            .setLabel(`Reiniciar`)
                            .setStyle(2)
                            .setEmoji(`🔁`),
                            new ButtonBuilder()
                            .setCustomId(`${ids}_outrasapp`)
                            .setLabel(`Outras Configurações`)
                            .setStyle(2)
                            .setEmoji(`⚙`),
                        ),
                        new ActionRowBuilder()
                        .addComponents(select)
                    ]
                })
        }

        if(interaction.isButton() && interaction.customId.endsWith("_ligarapp")){
			const ids = id.split("_")[0];
			if(interaction.user.id !== await db2.get(`${ids}.owner`)) return interaction.deferUpdate()
        const msgs = await interaction.reply({
            content:`Aguarde um Momento!`,
            ephemeral:true
        })
            
            const api1 = new SquareCloudAPI(api.get(`square`));
            const application = await api1.applications.get(ids);
             await application.start()
            const auto = db2.all().filter(pd => pd.data.owner === interaction.user.id)
            const select = new StringSelectMenuBuilder().setCustomId(`appsconfig`).setPlaceholder(`Selecione a Aplicação.`);
            auto.map((but) => {
                const buteco = but.data
                select.addOptions(
                    {
                        label: `${buteco.nome} - ${buteco.idapp}`,
                        description:`${buteco.produto}`,
                        value:`${buteco.idapp}`
                    }
                )
                
            });
            auto.map((but) => {
                const buteco = but.data
                if(buteco.idapp === ids) {
                    produto = buteco.produto;
                    nome = buteco.nome ;
                    vencimento = buteco.dataExpiracao 
                }
            })
        var timestamp = Math.floor(new Date(vencimento).getTime() / 1000)
        const status = await application.getStatus()
        try {
            interaction.message.edit({
            embeds:[
                new EmbedBuilder()
                .setTitle(`${nome} | Aplicação`)
                .addFields(
                    {
                        name:`💻 | Cpu`,
                        value:`\`${status.usage.cpu}\``,
                        inline:true
                    },
                    {
                        name:`🧠 | Memória Ram`,
                        value:`\`${status.usage.ram}\``,
                        inline:true
                    },
                    {
                        name:`💾 | SSD`,
                        value:`\`${status.usage.storage}\``,
                        inline:true
                    },
                    {
                        name:`🌐 | Network (Total)`,
                        value:`\`${status.usage.network.total}\``,
                        inline:true
                    },
                    {
                        name:`🌐 | Network(now)`,
                        value:`\`${status.usage.network.now}\``,
                        inline:true
                    },
                    {
                        name:`📨 | Requests`,
                        value:`\`${status.requests}\``,
                        inline:true
                    },
                )
                .addFields(
                    {
                        name:`${status.status === `running` ? `🟢 | Status` : `🔴 | Status`}`,
                        value:`${status.status === `running` ? `\`Em execução\`` : `\`Está Parado\``}`,
                        inline:true
                    },
                    {
                        name:`⏰ | UpTime`,
                        value:`${status.uptimeTimestamp === undefined ? `Bot está Desligado.` : `<t:${Math.floor(status.uptimeTimestamp / 1000)}:R>`}`,
                        inline:true
                    },
                    {
                        name:`🕒 | Expira em:`,
                        value:`<t:${timestamp}:f> (<t:${timestamp}:R>) `
                    }
                )
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${ids}_ligarapp`)
                    .setLabel(`Ligar`)
                    .setStyle(1)
                    .setDisabled(status.status === `running` ? true : false)
                    .setEmoji(`⬆`),
                    new ButtonBuilder()
                    .setCustomId(`${ids}_desligarapp`)
                    .setLabel(`Desligar`)
                    .setDisabled(status.status === `running` ? false : true )
                    .setStyle(4)
                    .setEmoji(`⬇`),
                    new ButtonBuilder()
                    .setCustomId(`${ids}_reiniciarapp`)
                    .setLabel(`Reiniciar`)
                    .setStyle(2)
                    .setEmoji(`🔁`),
                    new ButtonBuilder()
                    .setCustomId(`${ids}_outrasapp`)
                    .setLabel(`Outras Configurações`)
                    .setStyle(2)
                    .setEmoji(`⚙`),
                ),
                new ActionRowBuilder()
                .addComponents(select)
            ]
        });
        msgs.edit({
            content:`As opções carregadas com sucesso!`
        })
    }catch (err){
            console.log(err)
            interaction.followUp({
                content:`Ocorre um erro...`,
                ephemeral:true
            })
        }
        }


        if(interaction.isButton() && interaction.customId.endsWith("_desligarapp")){
            const ids = id.split("_")[0];
			if(interaction.user.id !== await db2.get(`${ids}.owner`)) return interaction.deferUpdate()
        const msgs = await interaction.reply({
            content:`Aguarde um Momento!`,
            ephemeral:true
        })
            const api1 = new SquareCloudAPI(api.get(`square`));
            const application = await api1.applications.get(ids);
             await application.stop()
             const auto = db2.all().filter(pd => pd.data.owner === interaction.user.id)
             const select = new StringSelectMenuBuilder().setCustomId(`appsconfig`).setPlaceholder(`Selecione a Aplicação.`);
             auto.map((but) => {
                 const buteco = but.data
                 select.addOptions(
                     {
                         label: `${buteco.nome} - ${buteco.idapp}`,
                         description:`${buteco.produto}`,
                         value:`${buteco.idapp}`
                     }
                 )
                 
             });
             auto.map((but) => {
                const buteco = but.data
                if(buteco.idapp === ids) {
                    produto = buteco.produto;
                    nome = buteco.nome ;
                    vencimento = buteco.dataExpiracao 
                }
            })
        var timestamp = Math.floor(new Date(vencimento).getTime() / 1000)
        const status = await application.getStatus()
        try{
            interaction.message.edit({
            embeds:[
                new EmbedBuilder()
                .setTitle(`${nome} | Aplicação`)
                .addFields(
                    {
                        name:`💻 | Cpu`,
                        value:`\`${status.usage.cpu}\``,
                        inline:true
                    },
                    {
                        name:`🧠 | Memória Ram`,
                        value:`\`${status.usage.ram}\``,
                        inline:true
                    },
                    {
                        name:`💾 | SSD`,
                        value:`\`${status.usage.storage}\``,
                        inline:true
                    },
                    {
                        name:`🌐 | Network (Total)`,
                        value:`\`${status.usage.network.total}\``,
                        inline:true
                    },
                    {
                        name:`🌐 | Network(now)`,
                        value:`\`${status.usage.network.now}\``,
                        inline:true
                    },
                    {
                        name:`📨 | Requests`,
                        value:`\`${status.requests}\``,
                        inline:true
                    },
                )
                .addFields(
                    {
                        name:`${status.status === `running` ? `🟢 | Status` : `🔴 | Status`}`,
                        value:`${status.status === `running` ? `\`Em execução\`` : `\`Está Parado\``}`,
                        inline:true
                    },
                    {
                        name:`⏰ | UpTime`,
                        value:`${status.uptimeTimestamp === undefined ? `Bot está Desligado.` : `<t:${Math.floor(status.uptimeTimestamp / 1000)}:R>`}`,
                        inline:true
                    },
                    {
                        name:`🕒 | Expira em:`,
                        value:`<t:${timestamp}:f> (<t:${timestamp}:R>) `
                    }
                )
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${ids}_ligarapp`)
                    .setLabel(`Ligar`)
                    .setStyle(1)
                    .setDisabled(status.status === `running` ? true : false)
                    .setEmoji(`⬆`),
                    new ButtonBuilder()
                    .setCustomId(`${ids}_desligarapp`)
                    .setLabel(`Desligar`)
                    .setDisabled(status.status === `running` ? false : true )
                    .setStyle(4)
                    .setEmoji(`⬇`),
                    new ButtonBuilder()
                    .setCustomId(`${ids}_reiniciarapp`)
                    .setLabel(`Reiniciar`)
                    .setStyle(2)
                    .setEmoji(`🔁`),
                    new ButtonBuilder()
                    .setCustomId(`${ids}_outrasapp`)
                    .setLabel(`Outras Configurações`)
                    .setStyle(2)
                    .setEmoji(`⚙`),
                ),
                new ActionRowBuilder()
                .addComponents(select)
            ]
        });
        msgs.edit({
            content:`Opções carregadas com sucesso!`,
            ephemeral:true
        })
    
    }catch(err){
            console.log(err)
            interaction.followUp({
                content:`Ocorre um erro...`,
                ephemeral:true
            })
        }

        }


        if(interaction.isButton() && interaction.customId.endsWith("_reiniciarapp")){
            const ids = id.split("_")[0];
			if(interaction.user.id !== await db2.get(`${ids}.owner`)) return interaction.deferUpdate()
            const msgs = await interaction.reply({
                content:`Aguarde um Momento!`,
                ephemeral:true
            });

            try{
                
                const auto = db2.all().filter(pd => pd.data.owner === interaction.user.id)
            const select = new StringSelectMenuBuilder().setCustomId(`appsconfig`).setPlaceholder(`Selecione a Aplicação.`);
            auto.map((but) => {
                const buteco = but.data
                select.addOptions(
                    {
                        label: `${buteco.nome} - ${buteco.idapp}`,
                        description:`${buteco.produto}`,
                        value:`${buteco.idapp}`
                    }
                )
                
            })
            auto.map((but) => {
                const buteco = but.data
                if(buteco.idapp === ids) {
                    produto = buteco.produto;
                    nome = buteco.nome ;
                    vencimento = buteco.dataExpiracao 
                }
            })


                const api1 = new SquareCloudAPI(api.get(`square`));
                const application = await api1.applications.get(ids);
             await application.restart()
        var timestamp = Math.floor(new Date(vencimento).getTime() / 1000)
        const status = await application.getStatus()
        interaction.message.edit({
            embeds:[
                new EmbedBuilder()
                .setTitle(`${nome} | Aplicação`)
                .addFields(
                    {
                        name:`💻 | Cpu`,
                        value:`\`${status.usage.cpu}\``,
                        inline:true
                    },
                    {
                        name:`🧠 | Memória Ram`,
                        value:`\`${status.usage.ram}\``,
                        inline:true
                    },
                    {
                        name:`💾 | SSD`,
                        value:`\`${status.usage.storage}\``,
                        inline:true
                    },
                    {
                        name:`🌐 | Network (Total)`,
                        value:`\`${status.usage.network.total}\``,
                        inline:true
                    },
                    {
                        name:`🌐 | Network(now)`,
                        value:`\`${status.usage.network.now}\``,
                        inline:true
                    },
                    {
                        name:`📨 | Requests`,
                        value:`\`${status.requests}\``,
                        inline:true
                    },
                )
                .addFields(
                    {
                        name:`${status.status === `running` ? `🟢 | Status` : `🔴 | Status`}`,
                        value:`${status.status === `running` ? `\`Em execução\`` : `\`Está Parado\``}`,
                        inline:true
                    },
                    {
                        name:`⏰ | UpTime`,
                        value:`${status.uptimeTimestamp === undefined ? `Bot está Desligado.` : `<t:${Math.floor(status.uptimeTimestamp / 1000)}:R>`}`,
                        inline:true
                    },
                    {
                        name:`🕒 | Expira em:`,
                        value:`<t:${timestamp}:f> (<t:${timestamp}:R>) `
                    }
                )
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${ids}_ligarapp`)
                    .setLabel(`Ligar`)
                    .setStyle(1)
                    .setDisabled(status.status === `running` ? true : false)
                    .setEmoji(`⬆`),
                    new ButtonBuilder()
                    .setCustomId(`${ids}_desligarapp`)
                    .setLabel(`Desligar`)
                    .setDisabled(status.status === `running` ? false : true )
                    .setStyle(4)
                    .setEmoji(`⬇`),
                    new ButtonBuilder()
                    .setCustomId(`${ids}_reiniciarapp`)
                    .setLabel(`Reiniciar`)
                    .setStyle(2)
                    .setEmoji(`🔁`),
                    new ButtonBuilder()
                    .setCustomId(`${ids}_outrasapp`)
                    .setLabel(`Outras Configurações`)
                    .setStyle(2)
                    .setEmoji(`⚙`),
                ),
                new ActionRowBuilder()
                .addComponents(select)
            ]
        });
        msgs.edit({
            content:`Opções carregadas com sucesso!`
        })
            } catch(err){
                console.log(err)
                interaction.followUp({
                    content:`Ocorre um erro...`,
                    ephemeral:true
                })
            }
        }

        if(interaction.isStringSelectMenu() && interaction.customId === `appsconfig`) {
            const msgs = await interaction.reply({
                content:`Aguarde um Momento!`,
                ephemeral:true
            })
            ids = interaction.values[0];
            const auto = db2.all().filter(pd => pd.data.owner === interaction.user.id)
            const api1 = new SquareCloudAPI(api.get(`square`));
            const application = await api1.applications.get(ids);

            auto.map((but) => {
                const buteco = but.data
                if(buteco.idapp === ids) {
                    produto = buteco.produto;
                    nome = buteco.nome ;
                    vencimento = buteco.dataExpiracao 
                }
            });
            const select = new StringSelectMenuBuilder().setCustomId(`appsconfig`).setPlaceholder(`Selecione a Aplicação.`);
            auto.map((but) => {
                const buteco = but.data
                select.addOptions(
                    {
                        label: `${buteco.nome} - ${buteco.idapp}`,
                        description:`${buteco.produto}`,
                        value:`${buteco.idapp}`
                    }
                )
                
            })
            var timestamp = Math.floor(new Date(vencimento).getTime() / 1000)
                const status = await application.getStatus()
                interaction.message.edit({
                    embeds:[
                        new EmbedBuilder()
                        .setTitle(`${nome} | Aplicação`)
                        .addFields(
                            {
                                name:`💻 | Cpu`,
                                value:`\`${status.usage.cpu}\``,
                                inline:true
                            },
                            {
                                name:`🧠 | Memória Ram`,
                                value:`\`${status.usage.ram}\``,
                                inline:true
                            },
                            {
                                name:`💾 | SSD`,
                                value:`\`${status.usage.storage}\``,
                                inline:true
                            },
                            {
                                name:`🌐 | Network (Total)`,
                                value:`\`${status.usage.network.total}\``,
                                inline:true
                            },
                            {
                                name:`🌐 | Network(now)`,
                                value:`\`${status.usage.network.now}\``,
                                inline:true
                            },
                            {
                                name:`📨 | Requests`,
                                value:`\`${status.requests}\``,
                                inline:true
                            },
                        )
                        .addFields(
                            {
                                name:`${status.status === `running` ? `🟢 | Status` : `🔴 | Status`}`,
                                value:`${status.status === `running` ? `\`Em execução\`` : `\`Está Parado\``}`,
                                inline:true
                            },
                            {
                                name:`⏰ | UpTime`,
                                value:`${status.uptimeTimestamp === undefined ? `Bot está Desligado.` : `<t:${Math.floor(status.uptimeTimestamp / 1000)}:R>`}`,
                                inline:true
                            },
                            {
                                name:`🕒 | Expira em:`,
                                value:`<t:${timestamp}:f> (<t:${timestamp}:R>) `
                            }
                        )
                    ],
                    components:[
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId(`${ids}_ligarapp`)
                            .setLabel(`Ligar`)
                            .setStyle(1)
                            .setDisabled(status.status === `running` ? true : false)
                            .setEmoji(`⬆`),
                            new ButtonBuilder()
                            .setCustomId(`${ids}_desligarapp`)
                            .setLabel(`Desligar`)
                            .setDisabled(status.status === `running` ? false : true )
                            .setStyle(4)
                            .setEmoji(`⬇`),
                            new ButtonBuilder()
                            .setCustomId(`${ids}_reiniciarapp`)
                            .setLabel(`Reiniciar`)
                            .setStyle(2)
                            .setEmoji(`🔁`),
                            new ButtonBuilder()
                            .setCustomId(`${ids}_outrasapp`)
                            .setLabel(`Outras Configurações`)
                            .setStyle(2)
                            .setEmoji(`⚙`),
                        ),
                        new ActionRowBuilder()
                        .addComponents(select)
                    ]
                });
                msgs.edit({
                    content:`Opções Carregadas com sucesso!`,
                })
    
        }
    }}