const { ApplicationCommandType, EmbedBuilder, Embed, ApplicationCommandOptionType} = require("discord.js")
const axios = require('axios');
const { JsonDatabase } = require("wio.db")
const api = new JsonDatabase({ databasePath:"./jsons/apis.json" });
const auto = new JsonDatabase({ databasePath:"./jsons/autocomplete.json" });
const db = new JsonDatabase({ databasePath:"./jsons/applications.json" });
const logs = new JsonDatabase({ databasePath:"./jsons/logs.json" });
const perms = new JsonDatabase({ databasePath:"./jsons/perms.json" });

module.exports = {
  name: "deleteapp", 
  description: "delete alguma aplicação",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
        name: "id",
        description: "Qual é o id da aplicação?",
        type: ApplicationCommandOptionType.String,
        required: true,
        autocomplete: true,
      },
    ],
    async autocomplete(interaction) {
      const value = interaction.options.getFocused().toLowerCase();
      let choices = db.all().filter(pd => pd.data.nome)
  
      const filtered = choices.filter(choice => choice.data.nome.toLowerCase().includes(value)).slice(0, 25);
  
      if(!interaction) return;
       if(choices.length === 0){ 
          await interaction.respond([
              { name: "Não existe nenhuma aplicação!", value: "a29183912asd92384XASDASDSADASDSADASDASD12398212222" }
          ])
      } else if(filtered.length === 0) {
          await interaction.respond([
              { name: "Não Achei Nenhuma aplicação!", value: "a29183912asd92384XASDASDSADASDSADASDASD1239821" }
          ]);
      } else {
          await interaction.respond(
              filtered.map(choice => ({ name: `Nome: ${choice.data.nome} | ID: ${choice.data.idapp}`, value: choice.data.idapp}))
          );
      }
  },  
  run: async (client, interaction) => {
    const id = interaction.options.getString("id")
        if(interaction.user.id !== perms.get(`${interaction.user.id}_id`)) {
            return interaction.reply({content:"Você não tem permissão para usar este comando.", ephemeral:true})
        }
    if(id === "a29183912asd92384XASDASDSADASDSADASDASD12398212222") {
      interaction.reply({
        content:`Não existe nenhuma aplicação!`,
        ephemeral:true
      })
      return;
    }
    if(id === "a29183912asd92384XASDASDSADASDSADASDASD1239821") {
      interaction.reply({
        content:`Não Achei Nenhuma aplicação!`,
        ephemeral:true
      })
      return;
    }
     const msg = await interaction.reply({content:"estamos excluindo sua aplicação aguarde", ephemeral:true})
  
    try { 
        const response = await axios.delete(
            `https://api.squarecloud.app/v2/apps/${id}/delete`,
            {
              headers: {
                'Authorization': api.get(`square`)
              }
            }
          );
          db.delete(`${id}`)
          msg.edit({content:" Sua aplicação foi excluida com sucesso"})

    } catch {
        msg.edit({content:"Não existe nenhuma aplicação!"})
        db.delete(`${id}`)
    }

}}