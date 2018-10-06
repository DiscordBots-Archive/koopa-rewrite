const { Command } = require('discord.js-commando');
const https = require('https');

module.exports = class CatGirlCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'neko',
      aliases: ['catgirl'],
      group: 'fun',
      memberName: 'neko',
      description: "Who doesn't want a cute catgirl?",
      details: 'Courtesy of MoonlightCapital#0554',
      examples: ['neko']
    });
  }

  async run(message) {
    let ratelimited = false;

    if(ratelimited) return message.channel.send('API is being ratelimited, please try again later.');

    await message.channel.startTyping();

    https.get('https://nekos.moe/api/v1/random/image?count=1&nsfw=false', async resp => {
      let data = '';

      resp.on('data', chunk => {
        data += chunk;
      });

      let headers = resp.headers;

      if(resp.statusCode == 429) {
        ratelimited = true;
        setTimeout(()=> {
          ratelimited = false;
        }, headers['retry-after']);
        await message.channel.send('API is being ratelimited, please try again later.');
        return await message.channel.stopTyping();
      } 
      resp.on('end', async() => {

      if(ratelimited) return;
      let catgirl = 'https://nekos.moe/image/'+JSON.parse(data).images[0].id;

      const embed = this.client.utils.embed()
        .setTitle(message.member + ", here's your catgirl:")
        .setImage(catgirl);

      await message.channel.send({embed})
      await message.channel.stopTyping()

      });

    }).on("error", async err => {
      await this.sendErrMsg('An error occured while getting the image. Please try again later.');
    });
  }
};