const { StringSelectMenuBuilder, EmbedBuilder, ActionRowBuilder, ApplicationCommandType, ApplicationCommandOptionType, ButtonBuilder, ComponentType, ModalBuilder, TextInputBuilder } = require(`discord.js`)
const { JsonDatabase, } = require(`wio.db`);
const apps = new JsonDatabase({ databasePath:`./jsons/applications.json` });
const db = new JsonDatabase({ databasePath:`./jsons/produtos.json` });
const perms = new JsonDatabase({ databasePath:`./jsons/perms.json` });
const api = new JsonDatabase({ databasePath:`./jsons/apis.json` });
const fs = require(`fs`)
const JSZip = require('jszip');
const { SquareCloudAPI } = require('@squarecloud/api');


module.exports = {
    name: `apps`,
    description:`Veja todas as suas aplicações`,
    type: ApplicationCommandType.ChatInput, 
    run: async(client, interaction) => {
        const auto = apps.all().filter(pd => pd.data.owner === interaction.user.id)
        const teste123 = auto;
        
        if(!teste123) {
            return interaction.reply({content:`❌ | Você não tem acesso, compre um bot para podê usar este comando!`, ephemeral:true});
        }
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
        const msg = await interaction.reply({
            embeds:[
                new EmbedBuilder()
                .setAuthor({name: `${interaction.member.displayName} - (${interaction.user.id})`, iconURL: interaction.user.displayAvatarURL()})
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    select
                )
            ]
        }).then(async(msg) => {
            

        const user = interaction.user
        const interação = msg.createMessageComponentCollector({ componentType: ComponentType.StringSelect });
        let ids;
        let produto;
        let nome;
        let vencimento;

        interação.on(`collect`, async (interaction) => {
            const api1 = new SquareCloudAPI(api.get(`square`));
         if (user.id !== interaction.user.id) {
            interaction.deferUpdate()
           return;
         }
        
        
        })
        } ).catch((a) => {
            interaction.reply({
                embeds:[
                    new EmbedBuilder()
                    .setDescription(`❌ | Você está sem bot ativo...`)
                ],
                ephemeral:true
            })
            return;
        });


    }}
