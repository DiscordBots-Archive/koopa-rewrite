const { Command } = require('discord.js-commando');
const { getCourseP } = require('super-maker-api')
const val = /(([A-Z0-9]{4})-([A-Z0-9]{4})-([A-Z0-9]{4})-([A-Z0-9]{4}))/gi

module.exports = class MakerCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'maker',
            group: 'fun',
            memberName: 'maker',
            description: 'Searches levels on Mario Maker Bookmark',
            examples: ['maker 370D-0000-0253-A432', 'maker Castello aereo Infernale α/Ω'],
            args: [
                {
                    key: 'text',
                    label: 'level',
                    prompt: 'What level do you want to lookup?',
                    type: 'string',
                  /*
                    validate: text => {
                        if (val.test) return true;
                        return 'the level must be formated like XXXX-XXXX-XXXX-XXXX';
                    }
                  */
                }
            ]
        });    
    }
  
    async run(msg, {text}) {
      if (val.test(text)) return await this.handle(msg, text)
      
      var url = `https://api.makersofmario.com/level/?method=search&limit=5&text=${encodeURIComponent(text)}`;
		  const request = require("snekfetch").get;
	  	var search = await request(url)
      if (search.statusCode !== 200) return msg.say(`Unknown error (status code ${search.statusCode})`)
      var src = search.body
      var res = (src.data.results)
      if (res.length < 1) return msg.reply('no level matched your query `' + text + '`')
      
      var id = ''
      let embed = this.client.utils.embed()
          .setTitle("Level Search")
      
      let resp = '';
      for (var i in res) {
        if (isNaN(i)) continue;
        resp += `**${parseInt(i)+1}.** ${res[i].name} _by **${res[i].creator_ntd_name}**_\n`;
      }
      embed.setDescription(`\n**Choose a number between** \`1-${res.length}\` (in 30 seconds the command will be canceled)\n\n${resp}`);

      msg.embed(embed);

      const filter = response => response.author.id == msg.author.id && !isNaN(response.content) && parseInt(response.content) <= res.length && parseInt(response.content) > 0
      
			msg.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time']}).then((collected) => {
        var idx = parseInt(collected.first().content)-1
        
				id = res[idx].id

				this.handle(msg, id)
			}).catch(e => {
        console.error(e)
				msg.reply('command canceled!');
			});
    }
  
    async handle(msg, text) {
      var json = await getCourseP(text).catch(e => msg.say('Unknown error'))
      var tag = json.tag || this.client.getLocalized(this.userLanguage, 'NO_TAG')
      var embed = this.client.utils.embed()
			  .setTitle(json.course_title)
        .setDescription(text)
				.setImage(json.course_img_full)
				.setThumbnail(json.course_img)
				.setTimestamp(new Date())
				.setPrivateFooter(`Created by ${json.creator_name} on ${json.created_at}`, json.creator_img_url)
				.addInline('Difficulty', json.difficulty)
        .addInline('Game Style', json.game_style)
        .addInline('Clears', `${json.clears}/${json.attempts} (${json.clear_rate}%)`)
        .addInline('Stars', json.stars)
        .addInline('Tag', tag)
        .addInline('Players', json.unique_users)
        .addInline('World Record', `${json.world_record.time} by [${json.world_record.name}](${json.world_record.user_url})`)
        .addInline('First Clear', `By [${json.first_clear.name}](${json.first_clear.user_url})`)
      msg.embed(embed)
    }
};