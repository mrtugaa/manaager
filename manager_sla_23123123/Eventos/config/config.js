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
const msg = {}

module.exports = {
    name:"interactionCreate",
    run:async(interaction, client ) => {
        if(interaction.isStringSelectMenu() && interaction.customId === "config_select") {
            const options = interaction.values[0]
            if(options === "config_basic"){
                msg[interaction.message.id] = interaction.user.id
                interaction.update({
                    components:[
                        new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.StringSelectMenuBuilder()
                            .addOptions(
                                {
                                    label:"Alterar Nome",
                                    description:"Altere o nome do BOT",
                                    value:"alt_nome",
                                    emoji:"🪪"
                                },
                                {
                                    label:"Alterar Avatar",
                                    description:"Altere o avatar do BOT",
                                    value:"alt_avatar",
                                    emoji:"🖼"
                                },
                                {
                                    label:"Configurar LOGS",
                                    description:"Configurações sobre as LOGS",
                                    value:"config_logs_select",
                                    emoji:"<:Termos001:1178362734199455804>"
                                },
                                {
                                    label:"Configurar Chaves API",
                                    description:"Configurações sobre suas CHAVES APIS",
                                    value:"config_api_select",
                                    emoji:"🤖"
                                },
                            )
                            .setCustomId("basic_select")
                            .setPlaceholder("Selecione abaixo qual Configurações Basicas deseja fazer")
                        ),
                        new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                            .setCustomId("voltar")
                            .setLabel("Voltar")
                            .setStyle(2)
                            .setEmoji("<:voltarkauan:1177188031179010119>")
                        )
                    ]
                })
            }
            if(options === "config_advanced") {
                msg[interaction.message.id] = interaction.user.id
            
                interaction.update({
                    components:[
                        
                        new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.StringSelectMenuBuilder()
                            .addOptions(
                                {
                                    label:"Criar Nova Venda",
                                    description:"Crie um novo BOT para anúnciar",
                                    emoji:"<:blue_botcr:998304667928891482>",
                                    value:"create_bot"
                                }
                            )
                            .setCustomId("criar_bot_select")
                            .setPlaceholder("Selecione abaixo qual Configurações avançadas deseja modificar")
                        ),
                        new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                            .setCustomId("voltar")
                            .setLabel("Voltar")
                            .setStyle(2)
                            .setEmoji("<:voltarkauan:1177188031179010119>")
                        )
                    ]
                })
            }
                
        }
        if(interaction.isStringSelectMenu() && interaction.customId === "criar_bot_select") {
            const modal = new Discord.ModalBuilder()
            .setCustomId("modal_criar_bot")
            .setTitle(`${interaction.user.displayName} - New Venda`);
    
            const text = new Discord.TextInputBuilder()
            .setLabel("Nome do produto (BOT)")
            .setPlaceholder("TICKET|WHITELIST|AUTOCONNECT (EXEMPLO)")
            .setRequired(true)
            .setStyle(1)
            .setCustomId("text");
    
            const text1 = new Discord.TextInputBuilder()
            .setCustomId("text1")
            .setStyle(1)
            .setLabel("Arquivo Principal")
            .setPlaceholder("Exemplo: index.js/ start.js / default.js")
            .setRequired(true)
    
            modal.addComponents(new Discord.ActionRowBuilder().addComponents(text))
            modal.addComponents(new Discord.ActionRowBuilder().addComponents(text1))
            await interaction.showModal(modal)
        }
    
    
    if(interaction.isModalSubmit() && interaction.customId === "modal_criar_bot") {
        const nome = interaction.fields.getTextInputValue("text");
        const principal = interaction.fields.getTextInputValue("text1");
        if(db.get(`${nome}.nomeproduto`) === nome) {
            return interaction.reply({content:`⚠ | Já existe este (PRODUTO/BOT)!\n **Caso Queira configura-lo use /configpainel ${nome}`, ephemeral:true})
        }
        const msg = await interaction.update({
            embeds:[
                new Discord.EmbedBuilder()
                .setDescription(`📦 ${interaction.user}, Para concluir a primeira etapa de configuração do seu novo produto, solicitamos que nos envie um arquivo compactado (.ZIP) Contendo seu BOT. Por favor!`)
            ],
            components:[]
        });
    
        
        const collector = interaction.channel.createMessageCollector({
            filter: m => m.attachments.first() && m.attachments.first().name.endsWith('.zip'),
            max: 1,
        });
        
    
        collector.on('collect', async (message) => {
            if(message.author.id !== interaction.user.id) return;
            const attachment = message.attachments.first();
            const zip = new JSZip();
            
            
            const data = await fetch(attachment.url).then(res => res.arrayBuffer());
            const zipFile = await zip.loadAsync(data);
    
            interaction.message.edit({
                embeds:[
                    new Discord.EmbedBuilder()
                    .setTitle(`⚙ ${interaction.guild.name} | Configurações Avançadas ⚙`)
                    .setDescription(`✔ Estamos Verificando os arquivos enviados.`)
                ],
                components:[]
            })
            message.delete()
            if (zipFile.files['package.json'] && (zipFile.files['squarecloud.config'] || zipFile.files['squarecloud.app'])) {
                const packageJson = JSON.parse(await zipFile.file('package.json').async('string'));
    
    
                packageJson.main = principal;
                
                zipFile.file('package.json', JSON.stringify(packageJson));
    
                let configFileName = zipFile.files['squarecloud.config'] ? 'squarecloud.config' : 'squarecloud.app';
                let configContent = await zipFile.file(configFileName).async('string');
                let lines = configContent.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].startsWith('MAIN=')) {
                        lines[i] = 'MAIN=' + principal;
                    } 
                }
                configContent = lines.join('\n');
                zipFile.file(configFileName, configContent);
    
                const dir = './source';
                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);
                }
                fs.writeFileSync(`${dir}/${nome}.zip`, await zipFile.generateAsync({type:"nodebuffer"}))
    
                db.set(`${nome}`, {
                    nomeproduto: nome,
                    preco: {
                        mensal: {
                            onoff: true,
                            preco: 10,
                        },
                        semanal: {
                            onoff:true,
                            preco: 5
                        },
                        quizena: {
                            onoff:true,
                            preco:8.50
                        },
                        embed: {
                            cor: "Default",
                            titulo: `${interaction.guild.name} | ${nome}`,
                            desc:`Para realizar a compra de seu PRODUTO clique abaixo em \`🛒 Realizar Compra\``,
                            banner:null
                        }
                    },
                    link:"remover"
                })
    
                interaction.message.edit({
                    embeds:[
                        new Discord.EmbedBuilder()
                        .setTitle(`⚙ ${interaction.guild.name} | Configurações Avançadas ⚙`)
                        .setDescription(`Gostaria de informar que o produto (BOT) de **${nome}** foi criado. Caso seja de seu interesse, por favor, prossiga com a configuração abaixo. \n\n Utilize o comando /configpainel (PRODUTO/BOT) para alterar outras opções.`)
                    ],
                    components:[
                        new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                            .setCustomId("voltar2")
                            .setLabel("Voltar")
                            .setStyle(2)
                            .setEmoji("<:voltarkauan:1177188031179010119>")
                        )
                    ]
                })
                
                
            } else {
                interaction.message.edit({
                    embeds:[
                        new Discord.EmbedBuilder()
                        .setTitle(`⚙ ${interaction.guild.name} | Configurações Avançadas ⚙`)
                        .setDescription(`Não Gostaria de informar que o produto (BOT) de **${nome}**, Verifique se o BOT tenha package.json ou squarecloud.app/squarecloud.config`)
                    ],
                    components:[
                        new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                            .setCustomId("voltar2")
                            .setLabel("Voltar")
                            .setStyle(2)
                            .setEmoji("<:voltarkauan:1177188031179010119>")
                        )
                    ]
                })
            }
        });
    }
    if(interaction.isButton() && interaction.customId === "voltar2") {
        interaction.update({
            components:[
                
                new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.StringSelectMenuBuilder()
                    .addOptions(
                        {
                            label:"Criar Nova Venda",
                            description:"Crie um novo BOT para anúnciar",
                            emoji:"<:blue_botcr:998304667928891482>",
                            value:"create_bot"
                        }
                    )
                    .setCustomId("criar_bot_select")
                    .setPlaceholder("Selecione abaixo qual Configurações avançadas deseja modificar")
                ),
                new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.ButtonBuilder()
                    .setCustomId("voltar")
                    .setLabel("Voltar")
                    .setStyle(2)
                    .setEmoji("<:voltarkauan:1177188031179010119>")
                )
            ]
        })
    }
    
        if(interaction.isButton() && interaction.customId === "voltar") {
            const a = msg[interaction.message.id];
            if(a !== interaction.user.id) {interaction.deferUpdate() 
                return;}
            interaction.update({
                embeds:[
                    new Discord.EmbedBuilder()
                    .setTitle(`⚙ ${interaction.guild.name} | Configuração ⚙`)
                    .setDescription(`Selectione abaixo qual opção deseja alterar no seu bot. É importante que você preste atenção nas configurações atuais para garantir que suas alterações sejam feitas corretamente. 💥`)
                ],
                components:[
                    new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.StringSelectMenuBuilder()
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
    
    
        if(interaction.isStringSelectMenu() && interaction.customId === "basic_select") {
            const options = interaction.values[0]
            const a = msg[interaction.message.id];
            if(a !== interaction.user.id) {interaction.deferUpdate() 
                return;}
            if(options === "alt_nome") {
                const user = interaction.guild.members.cache.get(client.user.id)
                const modal = new Discord.ModalBuilder()
                .setCustomId("alt_nome_modal")
                .setTitle("Alterar nome do BOT");
                const text = new Discord.TextInputBuilder()
                .setCustomId("text")
                .setLabel("Qual sera o novo nome do bot?")
                .setValue(`${user.displayName}`)
                .setStyle(1)
                .setPlaceholder("Coloque o nome que você deseja")
                .setRequired(true)
    
                modal.addComponents(new Discord.ActionRowBuilder().addComponents(text))
                await interaction.showModal(modal)
            }
            if(options === "alt_avatar") {
                const user = interaction.guild.members.cache.get(client.user.id)
                const modal = new Discord.ModalBuilder()
                .setCustomId("alt_vatar_modal")
                .setTitle("Alterar avatar do BOT");
                const text = new Discord.TextInputBuilder()
                .setCustomId("text")
                .setLabel("Qual sera o novo avatar do bot?")
                .setValue(`${user.displayAvatarURL()}`)
                .setStyle(1)
                .setPlaceholder("Coloque a url que você deseja")
                .setRequired(true)
    
                modal.addComponents(new Discord.ActionRowBuilder().addComponents(text))
                await interaction.showModal(modal)
            }
            if(options === "config_api_select") {
                const square = api.get(`square`)
                const mp = api.get(`mp`)
                
                interaction.update({
                    embeds:[
                        new Discord.EmbedBuilder()
                        .setDescription(`Atual ApiKey SquareCloud: ${square === null ? "`Não Definido`" : `||${square}||`} \n Atual Mercado Pago ApiKey: ${mp === null ? "`Não Definido`" : `||${mp}||`}`)
                    ],
                    components:[
                        new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.StringSelectMenuBuilder()
                            .addOptions(
                                {
                                    label:"Alterar Square API Key",
                                    emoji:"📦",
                                    value:"squareapi"
                                },
                                {
                                    label:"Alterar Mercado Pago Api",
                                    emoji:"📦",
                                    value:"mpapi"
                                }
                            )
                            .setCustomId("api_select_menu")
                            .setPlaceholder("Selecione abaixo")
                        ),
                        new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                            .setCustomId("voltar1")
                            .setLabel("Voltar")
                            .setStyle(2)
                            .setEmoji("<:voltarkauan:1177188031179010119>")
                        )
                    ]
                })
    
            }
            if(options === "config_logs_select") {
                const renov = interaction.guild.channels.cache.get(logs.get(`renov`))
                const vendas = interaction.guild.channels.cache.get(logs.get(`vendas`))
                const categoria = interaction.guild.channels.cache.get(logs.get(`categoria`))
                const backup = interaction.guild.channels.cache.get(logs.get(`logs_backup`))
                const cliente = interaction.guild.roles.cache.get(logs.get(`cargo_client`))
                interaction.update({
                    embeds:[
                        new Discord.EmbedBuilder()
                        .setDescription(`Atual canal de Renovações: ${renov ?? "`Não Definido`"} \nAtual canal de Vendas: ${vendas ?? "`Não Definido`"}\n Atual Categoria de Carrinhos: ${categoria ?? "`Não Definido`"} \n Atual Logs de Backups: ${backup ?? "`Não Definido`"} \n\n Cargo de Cliente: ${cliente ?? "`Não Definido`"}`)
                    ],
                    components:[
                        new Discord.ActionRowBuilder()
                        .addComponents(
                         new Discord.StringSelectMenuBuilder()
                         .addOptions(
                            {
                                label:"Canal de Renovação",
                                value:"renovec"
                            },
                            {
                                label:"Canal de Vendas",
                                value:"vendascrec"
                            },
                            {
                                label:"Categoria de Carrinho",
                                value:"caterec"
                            },
                            {
                                label:"Logs de Backup's",
                                value:"backuprec"
                            },
                            {
                                label:"Cargo de Cliente",
                                value:"rolescl"
                            }
                         )
                         .setCustomId("logs_select")
                         .setPlaceholder("Selecione Abaixo")
                         .setMaxValues(1)
                        ),
                        new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                            .setCustomId("voltar1")
                            .setLabel("Voltar")
                            .setStyle(2)
                            .setEmoji("<:voltarkauan:1177188031179010119>")
                        )
                    ]
                })
            }
        }
        if(interaction.isStringSelectMenu() && interaction.customId === "logs_select") {
            const options = interaction.values[0]
            const a = msg[interaction.message.id];
            if(a !== interaction.user.id) {interaction.deferUpdate() 
                return;}
            if(options === "renovec") {
                const modal = new Discord.ModalBuilder()
                .setCustomId("renovar_modal")
                .setTitle("Canal de Renovação");
    
                const text = new Discord.TextInputBuilder()
                .setCustomId("text")
                .setStyle(1)
                .setRequired(true)
                .setPlaceholder("Coloque o id do canal")
                .setLabel("Qual será o canal de Renovação?")
    
                modal.addComponents(
                    new Discord.ActionRowBuilder()
                    .addComponents(text)
                );
                await interaction.showModal(modal)
            }
            if(options === "vendascrec") {
    
                
                const modal = new Discord.ModalBuilder()
                .setCustomId("vendas_modal")
                .setTitle("Canal de Vendas");
    
                const text = new Discord.TextInputBuilder()
                .setCustomId("text")
                .setStyle(1)
                .setRequired(true)
                .setPlaceholder("Coloque o id do canal")
                .setLabel("Qual será o canal de Vendas?")
    
                modal.addComponents(
                    new Discord.ActionRowBuilder()
                    .addComponents(text)
                );
                await interaction.showModal(modal)
    
            }
            if(options === "caterec") {
                
                const modal = new Discord.ModalBuilder()
                .setCustomId("cat_modal")
                .setTitle("Categoria do Carrinho");
    
                const text = new Discord.TextInputBuilder()
                .setCustomId("text")
                .setStyle(1)
                .setRequired(true)
                .setPlaceholder("Coloque o id da categoria")
                .setLabel("Qual será a Categoria do carrinho?")
    
                modal.addComponents(
                    new Discord.ActionRowBuilder()
                    .addComponents(text)
                );
                await interaction.showModal(modal)
            }
            if(options === "backuprec") {
                
                const modal = new Discord.ModalBuilder()
                .setCustomId("backup_modal")
                .setTitle("Canal de Backup");
    
                const text = new Discord.TextInputBuilder()
                .setCustomId("text")
                .setStyle(1)
                .setRequired(true)
                .setPlaceholder("Coloque o id do canal")
                .setLabel("Qual será o Canal de Backup?")
    
                modal.addComponents(
                    new Discord.ActionRowBuilder()
                    .addComponents(text)
                );
                await interaction.showModal(modal)
            }
            if(options === "rolescl") {
                
                
                const modal = new Discord.ModalBuilder()
                .setCustomId("role_modal")
                .setTitle("Cargo de Cliente");
    
                const text = new Discord.TextInputBuilder()
                .setCustomId("text")
                .setStyle(1)
                .setRequired(true)
                .setPlaceholder("Coloque o id do cargo")
                .setLabel("Qual será o Cargo de Cliente?")
    
                modal.addComponents(
                    new Discord.ActionRowBuilder()
                    .addComponents(text)
                );
                await interaction.showModal(modal)
            }
    
        }
    
    
        if(interaction.isModalSubmit() && interaction.customId === "renovar_modal") {
            const text = interaction.fields.getTextInputValue("text")
            const channel = interaction.guild.channels.cache.get(text)
            if(!channel) {
                return interaction.reply({content:"❌ | Coloque o id de um Canal Valida!"})
            } 
            await logs.set(`renov`, text)
            const renov = interaction.guild.channels.cache.get(logs.get(`renov`))
            const vendas = interaction.guild.channels.cache.get(logs.get(`vendas`))
            const categoria = interaction.guild.channels.cache.get(logs.get(`categoria`))
            const backup = interaction.guild.channels.cache.get(logs.get(`logs_backup`))
            const cliente = interaction.guild.roles.cache.get(logs.get(`cargo_client`))
            interaction.update({
                embeds:[
                    new Discord.EmbedBuilder()
                    .setDescription(`Atual canal de Renovações: ${renov ?? "`Não Definido`"} \nAtual canal de Vendas: ${vendas ?? "`Não Definido`"}\n Atual Categoria de Carrinhos: ${categoria ?? "`Não Definido`"} \n Atual Logs de Backups: ${backup ?? "`Não Definido`"} \n\n Cargo de Cliente: ${cliente ?? "`Não Definido`"}`)
                ],
                components:[
                    new Discord.ActionRowBuilder()
                    .addComponents(
                     new Discord.StringSelectMenuBuilder()
                     .addOptions(
                        {
                            label:"Canal de Renovação",
                            value:"renovec"
                        },
                        {
                            label:"Canal de Vendas",
                            value:"vendascrec"
                        },
                        {
                            label:"Categoria de Carrinho",
                            value:"caterec"
                        },
                        {
                            label:"Logs de Backup's",
                            value:"backuprec"
                        },
                        {
                            label:"Cargo de Cliente",
                            value:"rolescl"
                        }
                     )
                     .setCustomId("logs_select")
                     .setPlaceholder("Selecione Abaixo")
                     .setMaxValues(1)
                    ),
                    new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                        .setCustomId("voltar1")
                        .setLabel("Voltar")
                        .setStyle(2)
                        .setEmoji("<:voltarkauan:1177188031179010119>")
                    )
                ]
            })
        }
    
    
    
        if(interaction.isModalSubmit() && interaction.customId === "vendas_modal") {
            const text = interaction.fields.getTextInputValue("text")
            const channel = interaction.guild.channels.cache.get(text)
            if(!channel) {
                return interaction.reply({content:"❌ | Coloque o id de um Canal Valida!"})
            } 
            await logs.set(`vendas`, text)
            const renov = interaction.guild.channels.cache.get(logs.get(`renov`))
            const vendas = interaction.guild.channels.cache.get(logs.get(`vendas`))
            const categoria = interaction.guild.channels.cache.get(logs.get(`categoria`))
            const backup = interaction.guild.channels.cache.get(logs.get(`logs_backup`))
            const cliente = interaction.guild.roles.cache.get(logs.get(`cargo_client`))
            interaction.update({
                embeds:[
                    new Discord.EmbedBuilder()
                    .setDescription(`Atual canal de Renovações: ${renov ?? "`Não Definido`"} \nAtual canal de Vendas: ${vendas ?? "`Não Definido`"}\n Atual Categoria de Carrinhos: ${categoria ?? "`Não Definido`"} \n Atual Logs de Backups: ${backup ?? "`Não Definido`"} \n\n Cargo de Cliente: ${cliente ?? "`Não Definido`"}`)
                ],
                components:[
                    new Discord.ActionRowBuilder()
                    .addComponents(
                     new Discord.StringSelectMenuBuilder()
                     .addOptions(
                        {
                            label:"Canal de Renovação",
                            value:"renovec"
                        },
                        {
                            label:"Canal de Vendas",
                            value:"vendascrec"
                        },
                        {
                            label:"Categoria de Carrinho",
                            value:"caterec"
                        },
                        {
                            label:"Logs de Backup's",
                            value:"backuprec"
                        },
                        {
                            label:"Cargo de Cliente",
                            value:"rolescl"
                        }
                     )
                     .setCustomId("logs_select")
                     .setPlaceholder("Selecione Abaixo")
                     .setMaxValues(1)
                    ),
                    new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                        .setCustomId("voltar1")
                        .setLabel("Voltar")
                        .setStyle(2)
                        .setEmoji("<:voltarkauan:1177188031179010119>")
                    )
                ]
            })
        }
    
    
        if(interaction.isModalSubmit() && interaction.customId === "cat_modal") {
            const text = interaction.fields.getTextInputValue("text")
            const channel = interaction.guild.channels.cache.get(text)
            if(!channel) {
                return interaction.reply({content:"❌ | Coloque o id de uma categoria Valida!"})
            } 
            await logs.set(`categoria`, text)
            const renov = interaction.guild.channels.cache.get(logs.get(`renov`))
            const vendas = interaction.guild.channels.cache.get(logs.get(`vendas`))
            const categoria = interaction.guild.channels.cache.get(logs.get(`categoria`))
            const backup = interaction.guild.channels.cache.get(logs.get(`logs_backup`))
            const cliente = interaction.guild.roles.cache.get(logs.get(`cargo_client`))
            interaction.update({
                embeds:[
                    new Discord.EmbedBuilder()
                    .setDescription(`Atual canal de Renovações: ${renov ?? "`Não Definido`"} \nAtual canal de Vendas: ${vendas ?? "`Não Definido`"}\n Atual Categoria de Carrinhos: ${categoria ?? "`Não Definido`"} \n Atual Logs de Backups: ${backup ?? "`Não Definido`"} \n\n Cargo de Cliente: ${cliente ?? "`Não Definido`"}`)
                ],
                components:[
                    new Discord.ActionRowBuilder()
                    .addComponents(
                     new Discord.StringSelectMenuBuilder()
                     .addOptions(
                        {
                            label:"Canal de Renovação",
                            value:"renovec"
                        },
                        {
                            label:"Canal de Vendas",
                            value:"vendascrec"
                        },
                        {
                            label:"Categoria de Carrinho",
                            value:"caterec"
                        },
                        {
                            label:"Logs de Backup's",
                            value:"backuprec"
                        },
                        {
                            label:"Cargo de Cliente",
                            value:"rolescl"
                        }
                     )
                     .setCustomId("logs_select")
                     .setPlaceholder("Selecione Abaixo")
                     .setMaxValues(1)
                    ),
                    new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                        .setCustomId("voltar1")
                        .setLabel("Voltar")
                        .setStyle(2)
                        .setEmoji("<:voltarkauan:1177188031179010119>")
                    )
                ]
            })
        }
    
    
    
        if(interaction.isModalSubmit() && interaction.customId === "backup_modal") {
            const text = interaction.fields.getTextInputValue("text")
            const channel = interaction.guild.channels.cache.get(text)
            if(!channel) {
                return interaction.reply({content:"❌ | Coloque o id de um Canal Valido!"})
            } 
            await logs.set(`logs_backup`, text)
            const renov = interaction.guild.channels.cache.get(logs.get(`renov`))
            const vendas = interaction.guild.channels.cache.get(logs.get(`vendas`))
            const categoria = interaction.guild.channels.cache.get(logs.get(`categoria`))
            const backup = interaction.guild.channels.cache.get(logs.get(`logs_backup`))
            const cliente = interaction.guild.roles.cache.get(logs.get(`cargo_client`))
            interaction.update({
                embeds:[
                    new Discord.EmbedBuilder()
                    .setDescription(`Atual canal de Renovações: ${renov ?? "`Não Definido`"} \nAtual canal de Vendas: ${vendas ?? "`Não Definido`"}\n Atual Categoria de Carrinhos: ${categoria ?? "`Não Definido`"} \n Atual Logs de Backups: ${backup ?? "`Não Definido`"} \n\n Cargo de Cliente: ${cliente ?? "`Não Definido`"}`)
                ],
                components:[
                    new Discord.ActionRowBuilder()
                    .addComponents(
                     new Discord.StringSelectMenuBuilder()
                     .addOptions(
                        {
                            label:"Canal de Renovação",
                            value:"renovec"
                        },
                        {
                            label:"Canal de Vendas",
                            value:"vendascrec"
                        },
                        {
                            label:"Categoria de Carrinho",
                            value:"caterec"
                        },
                        {
                            label:"Logs de Backup's",
                            value:"backuprec"
                        },
                        {
                            label:"Cargo de Cliente",
                            value:"rolescl"
                        }
                     )
                     .setCustomId("logs_select")
                     .setPlaceholder("Selecione Abaixo")
                     .setMaxValues(1)
                    ),
                    new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                        .setCustomId("voltar1")
                        .setLabel("Voltar")
                        .setStyle(2)
                        .setEmoji("<:voltarkauan:1177188031179010119>")
                    )
                ]
            })
        }
    
        if(interaction.isModalSubmit() && interaction.customId === "role_modal") {
            const text = interaction.fields.getTextInputValue("text")
            const role = interaction.guild.roles.cache.get(text)
            if(!role) {
                return interaction.reply({content:"❌ | Coloque o id de um cargo Valido!"})
            } 
            await logs.set(`cargo_client`, text)
            const renov = interaction.guild.channels.cache.get(logs.get(`renov`))
            const vendas = interaction.guild.channels.cache.get(logs.get(`vendas`))
            const categoria = interaction.guild.channels.cache.get(logs.get(`categoria`))
            const backup = interaction.guild.channels.cache.get(logs.get(`logs_backup`))
            const cliente = interaction.guild.roles.cache.get(logs.get(`cargo_client`))
            interaction.update({
                embeds:[
                    new Discord.EmbedBuilder()
                    .setDescription(`Atual canal de Renovações: ${renov ?? "`Não Definido`"} \nAtual canal de Vendas: ${vendas ?? "`Não Definido`"}\n Atual Categoria de Carrinhos: ${categoria ?? "`Não Definido`"} \n Atual Logs de Backups: ${backup ?? "`Não Definido`"} \n\n Cargo de Cliente: ${cliente ?? "`Não Definido`"}`)
                ],
                components:[
                    new Discord.ActionRowBuilder()
                    .addComponents(
                     new Discord.StringSelectMenuBuilder()
                     .addOptions(
                        {
                            label:"Canal de Renovação",
                            value:"renovec"
                        },
                        {
                            label:"Canal de Vendas",
                            value:"vendascrec"
                        },
                        {
                            label:"Categoria de Carrinho",
                            value:"caterec"
                        },
                        {
                            label:"Logs de Backup's",
                            value:"backuprec"
                        },
                        {
                            label:"Cargo de Cliente",
                            value:"rolescl"
                        }
                     )
                     .setCustomId("logs_select")
                     .setPlaceholder("Selecione Abaixo")
                     .setMaxValues(1)
                    ),
                    new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                        .setCustomId("voltar1")
                        .setLabel("Voltar")
                        .setStyle(2)
                        .setEmoji("<:voltarkauan:1177188031179010119>")
                    )
                ]
            })
        }
        
        if(interaction.isStringSelectMenu() && interaction.customId === "api_select_menu") {
            const options = interaction.values[0]
            const a = msg[interaction.message.id];
            if(a !== interaction.user.id) {interaction.deferUpdate() 
                return;}
            if(options === "squareapi"){
                const modal = new Discord.ModalBuilder()
                .setTitle("Api Key")
                .setCustomId("apikeysquare_modal");
    
                const text = new Discord.TextInputBuilder()
                .setLabel("Qual a sua apikey?")
                .setStyle(1)
                .setCustomId("text")
                .setRequired(true)
                modal.addComponents(new Discord.ActionRowBuilder().addComponents(text))
                await interaction.showModal(modal)
            }
            if(options === "mpapi") {
                const modal = new Discord.ModalBuilder()
                .setTitle("Api Key")
                .setCustomId("apikeymp_modal");
    
                const text = new Discord.TextInputBuilder()
                .setLabel("Qual a sua apikey?")
                .setStyle(1)
                .setCustomId("text")
                .setRequired(true)
                modal.addComponents(new Discord.ActionRowBuilder().addComponents(text))
                await interaction.showModal(modal)
            }
        }
        if(interaction.isModalSubmit() && interaction.customId === "apikeymp_modal") {
            
            const text = interaction.fields.getTextInputValue("text")
            await api.set(`mp`, `${text}`)
            const square = api.get(`square`)
            const mp = api.get(`mp`)
            
            interaction.update({
                embeds:[
                    new Discord.EmbedBuilder()
                    .setDescription(`Atual ApiKey SquareCloud: ${square === null ? "`Não Definido`" : `||${square}||`} \n Atual Mercado Pago ApiKey: ${mp === null ? "`Não Definido`" : `||${mp}||`}`)
                ],
                components:[
                    new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.StringSelectMenuBuilder()
                        .addOptions(
                            {
                                label:"Alterar Square API Key",
                                emoji:"📦",
                                value:"squareapi"
                            },
                            {
                                label:"Alterar Mercado Pago Api",
                                emoji:"📦",
                                value:"mpapi"
                            }
                        )
                        .setCustomId("api_select_menu")
                        .setPlaceholder("Selecione abaixo")
                    ),
                    new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                        .setCustomId("voltar1")
                        .setLabel("Voltar")
                        .setStyle(2)
                        .setEmoji("<:voltarkauan:1177188031179010119>")
                    )
                ]
            })
        }
        if(interaction.isModalSubmit() && interaction.customId === "apikeysquare_modal") {
            const text = interaction.fields.getTextInputValue("text")
            await api.set(`square`, `${text}`)
            const square = api.get(`square`)
            const mp = api.get(`mp`)
            
            interaction.update({
                embeds:[
                    new Discord.EmbedBuilder()
                    .setDescription(`Atual ApiKey SquareCloud: ${square === null ? "`Não Definido`" : `||${square}||`} \n Atual Mercado Pago ApiKey: ${mp === null ? "`Não Definido`" : `||${mp}||`}`)
                ],
                components:[
                    new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.StringSelectMenuBuilder()
                        .addOptions(
                            {
                                label:"Alterar Square API Key",
                                emoji:"📦",
                                value:"squareapi"
                            },
                            {
                                label:"Alterar Mercado Pago Api",
                                emoji:"📦",
                                value:"mpapi"
                            }
                        )
                        .setCustomId("api_select_menu")
                        .setPlaceholder("Selecione abaixo")
                    ),
                    new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                        .setCustomId("voltar1")
                        .setLabel("Voltar")
                        .setStyle(2)
                        .setEmoji("<:voltarkauan:1177188031179010119>")
                    )
                ]
            })
        }
    
        if(interaction.isModalSubmit() && interaction.customId === "alt_vatar_modal") {
            const text = interaction.fields.getTextInputValue("text")
            client.user.setAvatar(`${text}`).then(() => {
                interaction.reply({
                    embeds:[
                        new Discord.EmbedBuilder()
                        .setDescription(`✅ | Alterado com sucesso!`)
                    ],
                    ephemeral:true
                })
            }).catch(() => {
                interaction.reply({
                    embeds:[
                        new Discord.EmbedBuilder()
                        .setDescription(`❌ | Ocorreu um erro ao tentar alterar o avatar!`)
                    ],
                    ephemeral:true
                })
            })
        }
    
        if(interaction.isModalSubmit() && interaction.customId === "alt_nome_modal") {
            const text = interaction.fields.getTextInputValue("text")
            client.user.setUsername(`${text}`).then(() => {
                interaction.reply({
                    embeds:[
                        new Discord.EmbedBuilder()
                        .setDescription(`✅ | Alterado com sucesso!`)
                    ],
                    ephemeral:true
                })
            }).catch(() => {
                interaction.reply({
                    embeds:[
                        new Discord.EmbedBuilder()
                        .setDescription(`❌ | Ocorreu um erro ao tentar alterar o nome!`)
                    ],
                    ephemeral:true
                })
            })
        }
        
        if(interaction.isButton() && interaction.customId === "voltar1") {
            const a = msg[interaction.message.id];
            if(a !== interaction.user.id) {interaction.deferUpdate() 
                return;}
            interaction.update({
                embeds:[
                    new Discord.EmbedBuilder()
                    .setTitle(`⚙ ${interaction.guild.name} | Configuração ⚙`)
                    .setDescription(`Selectione abaixo qual opção deseja alterar no seu bot. É importante que você preste atenção nas configurações atuais para garantir que suas alterações sejam feitas corretamente. 💥`)
                ],
                components:[
                    new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.StringSelectMenuBuilder()
                        .addOptions(
                            {
                                label:"Alterar Nome",
                                description:"Altere o nome do BOT",
                                value:"alt_nome",
                                emoji:"🪪"
                            },
                            {
                                label:"Alterar Avatar",
                                description:"Altere o avatar do BOT",
                                value:"alt_avatar",
                                emoji:"🖼"
                            },
                            {
                                label:"Configurar LOGS",
                                description:"Configurações sobre as LOGS",
                                value:"config_logs_select",
                                emoji:"<:Termos001:1178362734199455804>"
                            },
                            {
                                label:"Configurar Chaves API",
                                description:"Configurações sobre suas CHAVES APIS",
                                value:"config_api_select",
                                emoji:"🤖"
                            },
                        )
                        .setCustomId("basic_select")
                        .setPlaceholder("Selecione abaixo qual Configurações Basicas deseja fazer")
                    ),
                    new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                        .setCustomId("voltar")
                        .setLabel("Voltar")
                        .setStyle(2)
                        .setEmoji("<:voltarkauan:1177188031179010119>")
                    )
                ]
            })
        }
    }
}