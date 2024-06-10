const { StringSelectMenuBuilder, EmbedBuilder, ActionRowBuilder, ApplicationCommandType, ApplicationCommandOptionType, ButtonBuilder, ComponentType, ModalBuilder, TextInputBuilder } = require(`discord.js`)
const { JsonDatabase, } = require(`wio.db`);
const auto = new JsonDatabase({ databasePath:`./jsons/autocomplete.json` });
const db = new JsonDatabase({ databasePath:`./jsons/produtos.json` });
const perms = new JsonDatabase({ databasePath:`./jsons/perms.json` });
const fs = require(`fs`)
const JSZip = require('jszip');
const { SquareCloudAPI } = require('@squarecloud/api');


module.exports = {
    name: `configpainel`,
    description:`Veja todos os seus produtos registrados`,
    type: ApplicationCommandType.ChatInput, 
    options: [
        {
          name:`configpainel`,
          description:`Veja todos os seus produtos registrados`,
          type:ApplicationCommandOptionType.String,
          required: true,
          autocomplete: true,
        },
      ],
      async autocomplete(interaction) {
        const value = interaction.options.getFocused().toLowerCase();
        let choices = db.all().filter(pd => pd.data.nomeproduto)
    
        const filtered = choices.filter(choice => choice.data.nomeproduto.toLowerCase().includes(value)).slice(0, 25);
    
        if(!interaction) return;
         if(choices.length === 0){ 
            await interaction.respond([
                { name: `Crie um BOT!`, value: `a29183912asd92384XASDASDSADASDSADASDASD12398212222` }
            ])
        } else if(filtered.length === 0) {
            await interaction.respond([
                { name: `Não Achei Nenhum BOT`, value: `a29183912asd92384XASDASDSADASDSADASDASD1239821` }
            ]);
        } else {
            await interaction.respond(
                filtered.map(choice => ({ name: choice.data.nomeproduto, value: choice.data.nomeproduto}))
            );
        }
    },  
      run: async(client,interaction) => {
        if(interaction.user.id !== perms.get(`${interaction.user.id}_id`)) {
            return interaction.reply({content:`Você não tem permissão para usar este comando.`, ephemeral:true})
        }
          const id = interaction.options.getString(`configpainel`)
          if(id === `a29183912asd92384XASDASDSADASDSADASDASD1239821`) {
              interaction.reply({
                  embeds:[
                      new EmbedBuilder()
                      .setDescription(`❌ | Não Achei Nenhum produto com este nome!`)
                      .setColor(`Red`)
                  ],
                  ephemeral:true
              })
              return;
          }
          if(id === `a29183912asd92384XASDASDSADASDSADASDASD12398212222`) {
              interaction.reply({
                  embeds:[
                      new EmbedBuilder()
                      .setDescription(`❌ | Você não criou nenhum BOT!`)
                      .setColor(`Red`)
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
                      .setColor(`Red`)
                  ],
                  ephemeral:true
              })
              return;
          }
  
       const msg1 = await interaction.reply({
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
        
    }}
    