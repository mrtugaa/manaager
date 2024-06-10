const mercadopago = require(`mercadopago`)
const axios = require(`axios`)
const {JsonDatabase} = require(`wio.db`);
const api = new JsonDatabase({databasePath:`./jsons/apis.json`});
const logs = new JsonDatabase({databasePath:`./jsons/logs.json`});
const auto = new JsonDatabase({databasePath:`./jsons/autocomplete.json`});
const db = new JsonDatabase({databasePath:`./jsons/produtos.json`});
const perms = new JsonDatabase({ databasePath:`./jsons/perms.json` });
const db1 = new JsonDatabase({databasePath:`./jsons/carrinhos.json`});
const db2 = new JsonDatabase({databasePath:`./jsons/applications.json`});
const schedule = require('node-schedule');
const JSZip = require('jszip');
const path = require('path');
const fs = require(`fs`);
const { SquareCloudAPI } = require('@squarecloud/api');
const Discord = require(`discord.js`);
const pix = new JsonDatabase({databasePath:`./config.json`});
const { StringSelectMenuBuilder, EmbedBuilder, ActionRowBuilder, ApplicationCommandType, ApplicationCommandOptionType, ButtonBuilder, ComponentType, ModalBuilder, TextInputBuilder } = require(`discord.js`)
module.exports = {
    name:`interactionCreate`,
    run:async(interaction, client ) => {
        const customId = interaction.customId
        
    if(interaction.isButton() && interaction.customId.endsWith(`_alterar_banner_embed_product`)) {
        const id = customId.split(`_`)[0];
        const modal = new ModalBuilder()
        .setCustomId(`${id}_embed_banner_url_modal`)
        .setTitle(`Alterar banner`);
        const text = new TextInputBuilder()
        .setCustomId(`text`)
        .setLabel(`Qual será o novo banner?`)
        .setStyle(1)
        .setPlaceholder(`Coloque URL`)
        .setRequired(true)

        modal.addComponents(new ActionRowBuilder().addComponents(text))

        await interaction.showModal(modal)
    }

    if(interaction.isModalSubmit() && interaction.customId.endsWith(`embed_banner_url_modal`) ) {
        const text = interaction.fields.getTextInputValue(`text`);

        const id = customId.split(`_`)[0];

        await db.set(`${id}.preco.embed.banner`, text)

        interaction.reply({
            embeds:[ 
                new EmbedBuilder()
                .setDescription(`✅ | Alterado com sucesso!`)
            ],
            ephemeral:true
        })

    }



    
    if(interaction.isButton() && interaction.customId.endsWith(`_alterar_desc_embed_product`)) {
        const id = customId.split(`_`)[0];

        const modal = new ModalBuilder()
        .setCustomId(`${id}_embed_desc_modal`)
        .setTitle(`Alterar Descrição`);
        const text = new TextInputBuilder()
        .setCustomId(`text`)
        .setLabel(`Qual será a Nova Descrição?`)
        .setStyle(2)
        .setRequired(true)

        modal.addComponents(new ActionRowBuilder().addComponents(text))

        await interaction.showModal(modal)
    }

    if(interaction.isModalSubmit() && interaction.customId.endsWith(`_embed_desc_modal`)) {
        const id = customId.split(`_`)[0];

        const text = interaction.fields.getTextInputValue(`text`);

        await db.set(`${id}.preco.embed.desc`, text);


        interaction.reply({
            embeds:[ 
                new EmbedBuilder()
                .setDescription(`✅ | Alterado com sucesso!`)
            ],
            ephemeral:true
        })

    }



    
    if(interaction.isButton() && interaction.customId.endsWith(`alterar_titulo_embed_product`)) {
        const id = customId.split(`_`)[0];
        const modal = new ModalBuilder()
        .setCustomId(`${id}_embed_titulo_modal`)
        .setTitle(`Alterar Titulo`);
        const text = new TextInputBuilder()
        .setCustomId(`text`)
        .setLabel(`Qual será o novo titulo?`)
        .setStyle(1)
        .setRequired(true)

        modal.addComponents(new ActionRowBuilder().addComponents(text))

        await interaction.showModal(modal)
    }

    if(interaction.isModalSubmit() && interaction.customId.endsWith(`embed_titulo_modal`)) {
        const id = customId.split(`_`)[0];
        const text = interaction.fields.getTextInputValue(`text`)
        await db.set(`${id}.preco.embed.titulo`, text)

        interaction.reply({
            embeds:[ 
                new EmbedBuilder()
                .setDescription(`✅ | Alterado com sucesso!`)
            ],
            ephemeral:true
        })

    }


    if(interaction.isButton() && interaction.customId.endsWith(`alterar_cor_embed_product`)) {
        const id = customId.split(`_`)[0];
        const modal = new ModalBuilder()
        .setCustomId(`${id}_embed_color_hex_modal`)
        .setTitle(`Alterar Cor da Embed`);
        const text = new TextInputBuilder()
        .setCustomId(`text`)
        .setLabel(`Coloque a cor em hexadecimal!`)
        .setStyle(1)
        .setRequired(true)

        modal.addComponents(new ActionRowBuilder().addComponents(text))

        await interaction.showModal(modal)
    }
    if(interaction.isModalSubmit() && interaction.customId.endsWith(`embed_color_hex_modal`)) {
        const id = customId.split(`_`)[0];
        const text = interaction.fields.getTextInputValue(`text`)
        function isValidHexColor(hexColor) {
            return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hexColor);
        }

        if(!isValidHexColor(text)) {
            interaction.reply({
                embeds:[
                    new EmbedBuilder()
                    .setDescription(`❌ | Coloque um valor hexadecimal Verdadeiro!`)
                ],
                ephemeral:true
            })
            return;
        }
        await db.set(`${id}.preco.embed.cor`, text)

        interaction.reply({
            embeds:[ 
                new EmbedBuilder()
                .setDescription(`✅ | Alterado com sucesso!`)
            ],
            ephemeral:true
        })

    }

    if(interaction.isButton() && interaction.customId.endsWith(`ativ_des_semanal`)) {
        const id = customId.split(`_`)[0];
        if(await db.get(`${id}.preco.semanal.onoff`) === true) {

            await db.set(`${id}.preco.semanal.onoff`, false)

        } else {

            await db.set(`${id}.preco.semanal.onoff`, true)

        }
        interaction.update({
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${id}_alterarmensalidade30`)
                    .setLabel(`Alterar Mensalidade (30 DIAS)`)
                    .setStyle(2),
                    new ButtonBuilder()
                    .setCustomId(`${id}_alterarquinzena15`)
                    .setLabel(`Alterar Quinzena (15 DIAS)`)
                    .setStyle(2),
                    new ButtonBuilder()
                    .setCustomId(`${id}_alterarsemanal7`)
                    .setLabel(`Alterar Semanal (7 DIAS)`)
                    .setStyle(2),
                ),
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${id}_ativ_des_mensal`) 
                    .setLabel(`${db.get(`${id}.preco.mensal.onoff`) === true ? `Desativar Mensalidade (30 DIAS)` : `Ativar Mensalidade (30 DIAS)`}`)
                    .setStyle(2),
                    new ButtonBuilder()
                    .setCustomId(`${id}_ativ_des_quinzena`) 
                    .setLabel(`${db.get(`${id}.preco.quizena.onoff`) === true ? `Desativar Quinzena (15 DIAS)` : `Ativar Quinzena (15 DIAS)`}`)
                    .setStyle(2),
                    new ButtonBuilder()
                    .setCustomId(`${id}_ativ_des_semanal`) 
                    .setLabel(`${db.get(`${id}.preco.semanal.onoff`) === true ? `Desativar Semanal (7 DIAS)` : `Ativar Semanal (7 DIAS)`}`)
                    .setStyle(2),
                ),
                new ActionRowBuilder()
                .addComponents(
                new ButtonBuilder()
                .setCustomId(`${id}_volatasd`)
                .setLabel(`Voltar`)
                .setStyle(2)
                )
            ]
        })
    }

    


    if(interaction.isButton() && interaction.customId.endsWith(`ativ_des_quinzena`)) {
        const id = customId.split(`_`)[0];
        if(await db.get(`${id}.preco.quizena.onoff`) === true) {

            await db.set(`${id}.preco.quizena.onoff`, false)

        } else {

            await db.set(`${id}.preco.quizena.onoff`, true)

        }
        interaction.update({
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${id}_alterarmensalidade30`)
                    .setLabel(`Alterar Mensalidade (30 DIAS)`)
                    .setEmoji(`<:money:1095550948765610135>`)
                    .setStyle(2),
                    new ButtonBuilder()
                    .setCustomId(`${id}_alterarquinzena15`)
                    .setLabel(`Alterar Quinzena (15 DIAS)`)
                    .setEmoji(`<:money:1095550948765610135>`)
                    .setStyle(2),
                    new ButtonBuilder()
                    .setCustomId(`${id}_alterarsemanal7`)
                    .setLabel(`Alterar Semanal (7 DIAS)`)
                    .setEmoji(`<:money:1095550948765610135>`)
                    .setStyle(2),
                ),
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${id}_ativ_des_mensal`) 
                    .setLabel(`${db.get(`${id}.preco.mensal.onoff`) === true ? `Desativar Mensalidade (30 DIAS)` : `Ativar Mensalidade (30 DIAS)`}`)
                    .setEmoji(`<:7235bot:1178512292619505735>`)
                    .setStyle(2),
                    new ButtonBuilder()
                    .setCustomId(`${id}_ativ_des_quinzena`) 
                    .setLabel(`${db.get(`${id}.preco.quizena.onoff`) === true ? `Desativar Quinzena (15 DIAS)` : `Ativar Quinzena (15 DIAS)`}`)
                    .setEmoji(`<:7235bot:1178512292619505735>`)
                    .setStyle(2),
                    new ButtonBuilder()
                    .setCustomId(`${id}_ativ_des_semanal`) 
                    .setLabel(`${db.get(`${id}.preco.semanal.onoff`) === true ? `Desativar Semanal (7 DIAS)` : `Ativar Semanal (7 DIAS)`}`)
                    .setEmoji(`<:7235bot:1178512292619505735>`)
                    .setStyle(2),
                ),
                new ActionRowBuilder()
                .addComponents(
                new ButtonBuilder()
                .setCustomId(`${id}_volatasd`)
                .setLabel(`Voltar`)
                .setEmoji(`<:voltarkauan:1177188031179010119>`)
                .setStyle(2)
                )
            ]
        })
    }

    
    if(interaction.isButton() && interaction.customId.endsWith(`ativ_des_mensal`)) {
        const id = customId.split(`_`)[0];
        if(await db.get(`${id}.preco.mensal.onoff`) === true) {

            await db.set(`${id}.preco.mensal.onoff`, false)

        } else {

            await db.set(`${id}.preco.mensal.onoff`, true)

        }
        interaction.update({
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${id}_alterarmensalidade30`)
                    .setLabel(`Alterar Mensalidade (30 DIAS)`)
                    .setEmoji(`<:money:1095550948765610135>`)
                    .setStyle(2),
                    new ButtonBuilder()
                    .setCustomId(`${id}_alterarquinzena15`)
                    .setLabel(`Alterar Quinzena (15 DIAS)`)
                    .setEmoji(`<:money:1095550948765610135>`)
                    .setStyle(2),
                    new ButtonBuilder()
                    .setCustomId(`${id}_alterarsemanal7`)
                    .setLabel(`Alterar Semanal (7 DIAS)`)
                    .setEmoji(`<:money:1095550948765610135>`)
                    .setStyle(2),
                ),
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${id}_ativ_des_mensal`) 
                    .setLabel(`${db.get(`${id}.preco.mensal.onoff`) === true ? `Desativar Mensalidade (30 DIAS)` : `Ativar Mensalidade (30 DIAS)`}`)
                    .setEmoji(`<:7235bot:1178512292619505735>`)
                    .setStyle(2),
                    new ButtonBuilder()
                    .setCustomId(`${id}_ativ_des_quinzena`) 
                    .setLabel(`${db.get(`${id}.preco.quizena.onoff`) === true ? `Desativar Quinzena (15 DIAS)` : `Ativar Quinzena (15 DIAS)`}`)
                    .setEmoji(`<:7235bot:1178512292619505735>`)
                    .setStyle(2),
                    new ButtonBuilder()
                    .setCustomId(`${id}_ativ_des_semanal`) 
                    .setLabel(`${db.get(`${id}.preco.semanal.onoff`) === true ? `Desativar Semanal (7 DIAS)` : `Ativar Semanal (7 DIAS)`}`)
                    .setEmoji(`<:7235bot:1178512292619505735>`)
                    .setStyle(2),
                ),
                new ActionRowBuilder()
                .addComponents(
                new ButtonBuilder()
                .setCustomId(`${id}_volatasd`)
                .setLabel(`Voltar`)
                .setEmoji(`<:voltarkauan:1177188031179010119>`)
                .setStyle(2)
                )
            ]
        })
    }

    
    if(interaction.isButton() && interaction.customId.endsWith(`alterarsemanal7`)) {
        const id = customId.split(`_`)[0];
        const modal = new ModalBuilder()
        .setCustomId(`${id}_modalsemanal_7`)
        .setTitle(`${id} - valorsemanal`)

        const text = new TextInputBuilder()
        .setLabel(`Preço do Produto.`)
        .setRequired(true)
        .setStyle(1)
        .setPlaceholder(`Apenas numeros: exemplo: 0.10 / 1.10 / 2`)
        .setCustomId(`text`)

        modal.addComponents(new ActionRowBuilder().addComponents(text))
        await interaction.showModal(modal)
    }
    if(interaction.isModalSubmit() && interaction.customId.endsWith(`modalsemanal_7`)) {
        const id = customId.split(`_`)[0];
        const text = interaction.fields.getTextInputValue(`text`)
        if(isNaN(text)) {
            interaction.reply({
                embeds:[
                    new EmbedBuilder()
                    .setDescription(`❌ | Você Não colocou numeros!`)
                ],
                ephemeral:true
            })
            return;
        }
        let number = Number(text);
        number = Math.round(number * 100) / 100;
        await db.set(`${id}.preco.semanal.preco`, number)


        interaction.update({
            embeds:[
                new EmbedBuilder()
                .setTitle(`⚙ ${interaction.guild.name} | Configuração PREÇO (${id}) ⚙`)
                .setDescription(`✔ O produto **${id}** teve seu valor **valorsemanal** alterado para ${text}.`)
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${id}_alterarmensalidade30`)
                    .setLabel(`Alterar Mensalidade (30 DIAS)`)
                    .setEmoji(`<:money:1095550948765610135>`)
                    .setStyle(2),
                    new ButtonBuilder()
                    .setCustomId(`${id}_alterarquinzena15`)
                    .setLabel(`Alterar Quinzena (15 DIAS)`)
                    .setEmoji(`<:money:1095550948765610135>`)
                    .setStyle(2),
                    new ButtonBuilder()
                    .setCustomId(`${id}_alterarsemanal7`)
                    .setLabel(`Alterar Semanal (7 DIAS)`)
                    .setEmoji(`<:money:1095550948765610135>`)
                    .setStyle(2),
                ),
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${id}_ativ_des_mensal`) 
                    .setLabel(`${db.get(`${id}.preco.mensal.onoff`) === true ? `Desativar Mensalidade (30 DIAS)` : `Ativar Mensalidade (30 DIAS)`}`)
                    .setEmoji(`<:7235bot:1178512292619505735>`)
                    .setStyle(2),
                    new ButtonBuilder()
                    .setCustomId(`${id}_ativ_des_quinzena`) 
                    .setLabel(`${db.get(`${id}.preco.quizena.onoff`) === true ? `Desativar Quinzena (15 DIAS)` : `Ativar Quinzena (15 DIAS)`}`)
                    .setEmoji(`<:7235bot:1178512292619505735>`)
                    .setStyle(2),
                    new ButtonBuilder()
                    .setCustomId(`${id}_ativ_des_semanal`) 
                    .setLabel(`${db.get(`${id}.preco.semanal.onoff`) === true ? `Desativar Semanal (7 DIAS)` : `Ativar Semanal (7 DIAS)`}`)
                    .setEmoji(`<:7235bot:1178512292619505735>`)
                    .setStyle(2),
                ),
                new ActionRowBuilder()
                .addComponents(
                new ButtonBuilder()
                .setCustomId(`${id}_volatasd`)
                .setLabel(`Voltar`)
                .setEmoji(`<:voltarkauan:1177188031179010119>`)
                .setStyle(2)
                )
            ]
        })

    }
    if(interaction.isButton() && interaction.customId.endsWith(`alterarquinzena15`)) {
        const id = customId.split(`_`)[0];
        const modal = new ModalBuilder()
        .setCustomId(`${id}_modalquinzena_15`)
        .setTitle(`${id} - valorquinzena`)

        const text = new TextInputBuilder()
        .setLabel(`Preço do Produto.`)
        .setRequired(true)
        .setStyle(1)
        .setPlaceholder(`Apenas numeros: exemplo: 0.10 / 1.10 / 2`)
        .setCustomId(`text`)

        modal.addComponents(new ActionRowBuilder().addComponents(text))
        await interaction.showModal(modal)
    }

    
    if(interaction.isModalSubmit() && interaction.customId.endsWith(`modalquinzena_15`)) {
        const id = customId.split(`_`)[0];
        const text = interaction.fields.getTextInputValue(`text`)
        if(isNaN(text)) {
            interaction.reply({
                embeds:[
                    new EmbedBuilder()
                    .setDescription(`❌ | Você Não colocou numeros!`)
                ],
                ephemeral:true
            })
            return;
        }
        let number = Number(text);
        number = Math.round(number * 100) / 100;
        await db.set(`${id}.preco.quizena.preco`, number)

        interaction.update({
            embeds:[
                new EmbedBuilder()
                .setTitle(`⚙ ${interaction.guild.name} | Configuração PREÇO (${id}) ⚙`)
                .setDescription(`✔ O produto **${id}** teve seu valor **valorquinzena** alterado para ${text}.`)
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${id}_alterarmensalidade30`)
                    .setLabel(`Alterar Mensalidade (30 DIAS)`)
                    .setEmoji(`<:money:1095550948765610135>`)
                    .setStyle(2),
                    new ButtonBuilder()
                    .setCustomId(`${id}_alterarquinzena15`)
                    .setLabel(`Alterar Quinzena (15 DIAS)`)
                    .setEmoji(`<:money:1095550948765610135>`)
                    .setStyle(2),
                    new ButtonBuilder()
                    .setCustomId(`${id}_alterarsemanal7`)
                    .setLabel(`Alterar Semanal (7 DIAS)`)
                    .setEmoji(`<:money:1095550948765610135>`)
                    .setStyle(2),
                ),
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${id}_ativ_des_mensal`) 
                    .setLabel(`${db.get(`${id}.preco.mensal.onoff`) === true ? `Desativar Mensalidade (30 DIAS)` : `Ativar Mensalidade (30 DIAS)`}`)
                    .setEmoji(`<:7235bot:1178512292619505735>`)
                    .setStyle(2),
                    new ButtonBuilder()
                    .setCustomId(`${id}_ativ_des_quinzena`) 
                    .setLabel(`${db.get(`${id}.preco.quizena.onoff`) === true ? `Desativar Quinzena (15 DIAS)` : `Ativar Quinzena (15 DIAS)`}`)
                    .setEmoji(`<:7235bot:1178512292619505735>`)
                    .setStyle(2),
                    new ButtonBuilder()
                    .setCustomId(`${id}_ativ_des_semanal`) 
                    .setLabel(`${db.get(`${id}.preco.semanal.onoff`) === true ? `Desativar Semanal (7 DIAS)` : `Ativar Semanal (7 DIAS)`}`)
                    .setEmoji(`<:7235bot:1178512292619505735>`)
                    .setStyle(2),
                ),
                new ActionRowBuilder()
                .addComponents(
                new ButtonBuilder()
                .setCustomId(`${id}_volatasd`)
                .setLabel(`Voltar`)
                .setEmoji(`<:voltarkauan:1177188031179010119>`)
                .setStyle(2)
                )
            ]
        })

    }
    if(interaction.isStringSelectMenu() && interaction.customId.endsWith("_configpainel_select")) {
        const options = interaction.values[0]
        const id = customId.split(`_`)[0];
        if(options === `${id}_alterar_arquivo_produto_select`) {
              interaction.update({
                embeds:[
                    new EmbedBuilder()
                    .setTitle(`⚙ ${interaction.guild.name} | Configuração Arquivo (${id}) ⚙`)
                    .setDescription(`💥 Envie abaixo o NOVO arquivo que deseja entregar na hora do aprovamento do pagamento.`)
                ],
                components:[]
              })
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
            new EmbedBuilder()
            .setTitle(`⚙ ${interaction.guild.name} | Configurações Avançadas ⚙`)
            .setDescription(`✔ Estamos Verificando os arquivos enviados.`)
        ],
        components:[]
    })
    message.delete()
    if (zipFile.files['package.json'] && (zipFile.files['squarecloud.config'] || zipFile.files['squarecloud.app'])) {
        const packageJson = JSON.parse(await zipFile.file('package.json').async('string'));

        
        zipFile.file('package.json', JSON.stringify(packageJson));

        
        const dir = './source';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        fs.writeFileSync(`${dir}/${id}.zip`, await zipFile.generateAsync({type:`nodebuffer`}))

        interaction.message.edit({
            embeds:[
                new EmbedBuilder()
                .setTitle(`⚙ ${interaction.guild.name} | Configurações Avançadas ⚙`)
                .setDescription(`Gostaria de informar que o produto **${id}** teve seu arquivo de entrega alterado.`)
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${id}_volatasd`)
                    .setLabel(`Voltar`)
                    .setEmoji(`<:voltarkauan:1177188031179010119>`)
                    .setStyle(2)
                )
            ]
        })
        
        
    } else {
        interaction.message.edit({
            embeds:[
                new Discord.EmbedBuilder()
                .setTitle(`⚙ ${interaction.guild.name} | Configurações Avançadas ⚙`)
                .setDescription(`Não Gostaria de informar que o produto (BOT) de **${id}** Está com algum problema. Verifique se o BOT tenha package.json ou squarecloud.app/squarecloud.config`)
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${id}_voltar2`)
                    .setLabel(`Voltar`)
                    .setStyle(2)
                    .setEmoji(`<:voltarkauan:1177188031179010119>`)
                )
            ]
        })
    }
});
        }
        if(options === `${id}_alterar_preço_venda_select`) {
            interaction.update({
                embeds:[
                    new EmbedBuilder()
                    .setTitle(`⚙ ${interaction.guild.name} | Configuração PREÇO (${id}) ⚙`)
                    .setDescription(`💥 Selecione abaixo qual o button para escolher o valor de (MENSALIDADE / QUINZENA / SEMANAL).`)
                ],
                components:[
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId(`${id}_alterarmensalidade30`)
                        .setLabel(`Alterar Mensalidade (30 DIAS)`)
                        .setEmoji(`<:money:1095550948765610135>`)
                        .setStyle(2),
                        new ButtonBuilder()
                        .setCustomId(`${id}_alterarquinzena15`)
                        .setLabel(`Alterar Quinzena (15 DIAS)`)
                        .setEmoji(`<:money:1095550948765610135>`)
                        .setStyle(2),
                        new ButtonBuilder()
                        .setCustomId(`${id}_alterarsemanal7`)
                        .setLabel(`Alterar Semanal (7 DIAS)`)
                        .setEmoji(`<:money:1095550948765610135>`)
                        .setStyle(2),
                    ),
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId(`${id}_ativ_des_mensal`) 
                        .setLabel(`${db.get(`${id}.preco.mensal.onoff`) === true ? `Desativar Mensalidade (30 DIAS)` : `Ativar Mensalidade (30 DIAS)`}`)
                        .setEmoji(`<:7235bot:1178512292619505735>`)
                        .setStyle(2),
                        new ButtonBuilder()
                        .setCustomId(`${id}_ativ_des_quinzena`) 
                        .setLabel(`${db.get(`${id}.preco.quizena.onoff`) === true ? `Desativar Quinzena (15 DIAS)` : `Ativar Quinzena (15 DIAS)`}`)
                        .setEmoji(`<:7235bot:1178512292619505735>`)
                        .setStyle(2),
                        new ButtonBuilder()
                        .setCustomId(`${id}_ativ_des_semanal`) 
                        .setLabel(`${db.get(`${id}.preco.semanal.onoff`) === true ? `Desativar Semanal (7 DIAS)` : `Ativar Semanal (7 DIAS)`}`)
                        .setEmoji(`<:7235bot:1178512292619505735>`)
                        .setStyle(2),
                    ),
                    new ActionRowBuilder()
                    .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${id}_volatasd`)
                    .setLabel(`Voltar`)
                    .setEmoji(`<:voltarkauan:1177188031179010119>`)
                    .setStyle(2)
                    )
                ]
            })
        }
        if(options === `${id}_alterar_embed_select`) {
            interaction.update({
                embeds:[
                    new EmbedBuilder()
                    .setTitle(`⚙ ${interaction.guild.name} | Configuração EMBED (${id}) ⚙`)
                    .setDescription(`💥 Selecione abaixo qual opção do EMBED deseja alterar do seu produto.`)
                ],
                components:[
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId(`${id}_alterar_cor_embed_product`)
                        .setStyle(2)
                        .setLabel(`Alterar Cor`)
                        .setEmoji(`<:Caixa334lunnarsss:1127234012008697926>`),
                        new ButtonBuilder()
                        .setCustomId(`${id}_alterar_titulo_embed_product`)
                        .setStyle(2)
                        .setLabel(`Alterar Titulo`)
                        .setEmoji(`<:Caixa334lunnarsss:1127234012008697926>`),
                        new ButtonBuilder()
                        .setCustomId(`${id}_alterar_desc_embed_product`)
                        .setStyle(2)
                        .setLabel(`Alterar Descrição`)
                        .setEmoji(`<:Caixa334lunnarsss:1127234012008697926>`),
                        new ButtonBuilder()
                        .setCustomId(`${id}_alterar_banner_embed_product`)
                        .setStyle(2)
                        .setLabel(`Alterar Banner`)
                        .setEmoji(`<:Caixa334lunnarsss:1127234012008697926>`),
                    ),
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId(`${id}_alterar_preview_product`)
                        .setStyle(2)
                        .setLabel(`Alterar Preview`)
                        .setEmoji(`<:Caixa334lunnarsss:1127234012008697926>`),
                    new ButtonBuilder()
                    .setCustomId(`${id}_volatasd`)
                    .setLabel(`Voltar`)
                    .setEmoji(`<:voltarkauan:1177188031179010119>`)
                    .setStyle(2)
                    )

                ]
            })
        }
        if(options === `${id}_delete_product_select`) {
            fs.unlink(`source/${id}.zip`, (err) => {
                if (err) {
                  interaction.reply({
                    embeds:[
                        new EmbedBuilder()
                        .setDescription(`❌ | Ocorreu um erro ao tentar excluir o produto`)
                    ]
                  })
                } else {

                  interaction.message.delete()
                  db.delete(`${id}`)
                  let dados = auto.get(`produtos`)
                  dados = dados.filter(produto => produto !== `${id}`)
                  auto.set(`produto`, dados);

                }
              });
        }
     }


     if(interaction.isButton() && interaction.customId.endsWith("_alterar_preview_product")) {
        const id = customId.split(`_`)[0];
        const modal = new ModalBuilder()
        .setCustomId(`${id}_preview`)
        .setTitle("💢 - Alterar Preview do [PRODUTO]");
        const text = new TextInputBuilder()
        .setCustomId("text")
        .setStyle(1)
        .setLabel("Coloque a URL do preview!")
        .setPlaceholder(`Digite: "remover" para podê retirar`);

        modal.addComponents(new ActionRowBuilder().addComponents(text));
        return interaction.showModal(modal);
     }

     if(interaction.isModalSubmit() && interaction.customId.endsWith("_preview")) {
        const id = customId.split(`_`)[0];
        const text = interaction.fields.getTextInputValue(`text`)
        if(text === "remover"){
            interaction.reply({
                content:`O Botão de preview foi removido com sucesso!`,
                ephemeral:true,
            });
            return;
        }
        try {
            interaction.reply({
                content:`Seu Novo botão de preview:`,
                components:[
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setStyle(5)
                        .setURL(text)
                        .setLabel("PREVIEW")
                    )
                ],
                ephemeral:true
            }).then(() => {
                db.set(`${id}.link`, text);
            })
        } catch {
            interaction.reply({
                content:`Coloque um Link valido!`,
                ephemeral:true
            })
        }
     }

    if(interaction.isButton() && interaction.customId.endsWith(`alterarmensalidade30`)) {
        const id = customId.split(`_`)[0];
        const modal = new ModalBuilder()
        .setCustomId(`${id}_modalmensalidade_30`)
        .setTitle(`${id} - valormensal`)

        const text = new TextInputBuilder()
        .setLabel(`Preço do Produto.`)
        .setRequired(true)
        .setStyle(1)
        .setPlaceholder(`Apenas numeros: exemplo: 0.10 / 1.10 / 2`)
        .setCustomId(`text`)

        modal.addComponents(new ActionRowBuilder().addComponents(text))
        await interaction.showModal(modal)
    }

    
    if(interaction.isModalSubmit() && interaction.customId.endsWith(`modalmensalidade_30`)) {
        const id = customId.split(`_`)[0];
        const text = interaction.fields.getTextInputValue(`text`)
        if(isNaN(text)) {
            interaction.reply({
                embeds:[
                    new EmbedBuilder()
                    .setDescription(`❌ | Você Não colocou numeros!`)
                ],
                ephemeral:true
            })
            return;
        }
        let number = Number(text);
        number = Math.round(number * 100) / 100;
        await db.set(`${id}.preco.mensal.preco`, number)

        interaction.update({
            embeds:[
                new EmbedBuilder()
                .setTitle(`⚙ ${interaction.guild.name} | Configuração PREÇO (${id}) ⚙`)
                .setDescription(`✔ O produto **${id}** teve seu valor **valormensal** alterado para ${text}.`)
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${id}_alterarmensalidade30`)
                    .setLabel(`Alterar Mensalidade (30 DIAS)`)
                    .setEmoji(`<:money:1095550948765610135>`)
                    .setStyle(2),
                    new ButtonBuilder()
                    .setCustomId(`${id}_alterarquinzena15`)
                    .setLabel(`Alterar Quinzena (15 DIAS)`)
                    .setEmoji(`<:money:1095550948765610135>`)
                    .setStyle(2),
                    new ButtonBuilder()
                    .setCustomId(`${id}_alterarsemanal7`)
                    .setLabel(`Alterar Semanal (7 DIAS)`)
                    .setEmoji(`<:money:1095550948765610135>`)
                    .setStyle(2),
                ),
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${id}_ativ_des_mensal`) 
                    .setLabel(`${db.get(`${id}.preco.mensal.onoff`) === true ? `Desativar Mensalidade (30 DIAS)` : `Ativar Mensalidade (30 DIAS)`}`)
                    .setEmoji(`<:7235bot:1178512292619505735>`)
                    .setStyle(2),
                    new ButtonBuilder()
                    .setCustomId(`${id}_ativ_des_quinzena`) 
                    .setLabel(`${db.get(`${id}.preco.quizena.onoff`) === true ? `Desativar Quinzena (15 DIAS)` : `Ativar Quinzena (15 DIAS)`}`)
                    .setEmoji(`<:7235bot:1178512292619505735>`)
                    .setStyle(2),
                    new ButtonBuilder()
                    .setCustomId(`${id}_ativ_des_semanal`) 
                    .setLabel(`${db.get(`${id}.preco.semanal.onoff`) === true ? `Desativar Semanal (7 DIAS)` : `Ativar Semanal (7 DIAS)`}`)
                    .setEmoji(`<:7235bot:1178512292619505735>`)
                    .setStyle(2),
                ),
                new ActionRowBuilder()
                .addComponents(
                new ButtonBuilder()
                .setCustomId(`${id}_volatasd`)
                .setLabel(`Voltar`)
                .setEmoji(`<:voltarkauan:1177188031179010119>`)
                .setStyle(2)
                )
            ]
        })

    }

    
    if(interaction.isButton() && interaction.customId.endsWith(`volatasd`)) {
        const id = customId.split(`_`)[0];
        interaction.update({
            embeds:[
                new EmbedBuilder()
                .setTitle(`⚙ ${interaction.guild.name} | Configuração painel (${id}) ⚙`)
                .setDescription(`Selecione abaixo qual opção deseja alterar no seu painel. É importante que você preste atenção nas configurações atuais para garantir que suas alterações sejam feitas corretamente. 💥`)
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                    .addOptions(
                        {
                            label:`Alterar Arquivo Produto`,
                            description:`Altere o arquivo do produto`,
                            value:`${id}_alterar_arquivo_produto_select`,
                            emoji:`⬆`
                        },
                        {
                            label:`Alterar Preço Produto`,
                            description:`Altere o preço da venda`,
                            value:`${id}_alterar_preço_venda_select`,
                            emoji:`⬆`
                        },
                        {
                            label:`Configurar EMBED (OPCIONAL)`,
                            description:`Alterar Todas opções do embed de vendas`,
                            value:`${id}_alterar_embed_select`,
                            emoji:`<:4323blurpleverifiedbotdeveloper:1178363017096876113>`
                        },
                        {
                            label:`Deletar Produto`,
                            description:`Delete este produto`,
                            value:`${id}_delete_product_select`,
                            emoji:`<:a_negativo_cupula:1178452417080205454>`
                        },

                    )
                    .setCustomId(`${id}_configpainel_select`)
                    .setPlaceholder(`Selecione abaixo qual Configurações Avançadas deseja alterar`)
                    .setMaxValues(1)
                )
            ]
        })
    }
    }}