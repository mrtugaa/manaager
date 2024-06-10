const { StringSelectMenuBuilder, EmbedBuilder, ActionRowBuilder, ApplicationCommandType, ApplicationCommandOptionType, ButtonBuilder, ComponentType, ModalBuilder, TextInputBuilder, ButtonStyle } = require("discord.js")
const { JsonDatabase, } = require("wio.db");
const auto = new JsonDatabase({ databasePath:"./jsons/autocomplete.json" });
const db = new JsonDatabase({ databasePath:"./jsons/produtos.json" });
const perms = new JsonDatabase({ databasePath:"./jsons/perms.json" });
const fs = require("fs")
const JSZip = require('jszip');


module.exports = {
    name: "enviarmensagem",
    description:"Veja todos os seus produtos registrados",
    type: ApplicationCommandType.ChatInput, 
    options: [
        {
          name:"configpainel",
          description:"Veja todos os seus produtos registrados",
          type:ApplicationCommandOptionType.String,
          required: true,
          autocomplete: true,
        },
      ],
      async autocomplete(interaction) {
        const value = interaction.options.getFocused().toLowerCase();
        let choices = db.all()
    
        const filtered = choices.filter(choice => choice.data.nomeproduto.toLowerCase().includes(value)).slice(0, 25);
    
        if(!interaction) return;
         if(choices.length === 0){ 
            await interaction.respond([
                { name: "Crie um BOT!", value: "a29183912asd92384XASDASDSADASDSADASDASD12398212222" }
            ])
        } else if(filtered.length === 0) {
            await interaction.respond([
                { name: "Não Achei Nenhum BOT", value: "a29183912asd92384XASDASDSADASDSADASDASD1239821" }
            ]);
        } else {
            await interaction.respond(
                filtered.map(choice => ({ name: choice.data.nomeproduto, value: choice.data.nomeproduto}))
            );
        }
    },  
    run: async(client,interaction) => { 
        if(interaction.user.id !== perms.get(`${interaction.user.id}_id`)) {
            return interaction.reply({content:"Você não tem permissão para usar este comando.", ephemeral:true})
        }
        const id = interaction.options.getString("configpainel")
        if(id === "a29183912asd92384XASDASDSADASDSADASDASD1239821") {
            interaction.reply({
                embeds:[
                    new EmbedBuilder()
                    .setDescription(`❌ | Não Achei Nenhum produto com este nome!`)
                    .setColor("Red")
                ],
                ephemeral:true
            })
            return;
        }
        if(id === "a29183912asd92384XASDASDSADASDSADASDASD12398212222") {
            interaction.reply({
                embeds:[
                    new EmbedBuilder()
                    .setDescription(`❌ | Você não criou nenhum BOT!`)
                    .setColor("Red")
                ],
                ephemeral:true
            })
            return;
        }
        if(id !== db.get(`${id}.nomeproduto`)) {
            interaction.reply({
                embeds:[
                    new EmbedBuilder()
                    .setDescription(`❌ | Não Achei Nenhum produto com este nome!`)
                    .setColor("Red")
                ],
                ephemeral:true
            })
            return;
        }

        const embed = new EmbedBuilder().setDescription(`${db.get(`${id}.preco.embed.desc`)}`).setTitle(`${db.get(`${id}.preco.embed.titulo`)}`).setColor(`${db.get(`${id}.preco.embed.cor`)}`)

        if(db.get(`${id}.preco.embed.banner`) !== null) {
            embed.setImage(`${db.get(`${id}.preco.embed.banner`)}`)
        }
        const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId(`${id}`)
            .setLabel("Realizar Compra")
            .setEmoji("<:Carrinho:1167176568964124853>")
            .setStyle(1)
        );

        if(db.get(`${id}.link`).startsWith("https://")) {
            row.addComponents(
                new ButtonBuilder()
                .setStyle(5)
                .setURL(db.get(`${id}.link`))
                .setLabel("Preview")
                .setEmoji("📽")
            )
        }
        interaction.channel.send({
            embeds:[
                embed
            ],
            components:[
                row
            ]
        }).then(() => {
            interaction.reply({
                content:`✔ ${interaction.user}, sua mensagem foi enviada no chat atual.`,
                ephemeral:true
            })
        }).catch(() => {
            interaction.channel.send({
                embeds:[
                    new EmbedBuilder().setDescription(`${db.get(`${id}.preco.embed.desc`)}`).setTitle(`${db.get(`${id}.preco.embed.titulo`)}`).setColor(`${db.get(`${id}.preco.embed.cor`)}`)
                ],
                components:[
                    row
                ]
            }).then(() => {
                interaction.reply({
                    content:`✔ ${interaction.user}, sua mensagem foi enviada no chat atual.`,
                    ephemeral:true
                })
            }).catch(() => {
                interaction.reply({
                    content:`❌ ${interaction.user}, Sua mensagem acabou não sendo enviada...`,
                    ephemeral:true
                })
            })
        })

    }}