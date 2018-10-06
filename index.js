const { CommandoClient: Fridge } = require("discord.js-commando")
const path = require("path")
const fs = require("fs")
const YTDL = require("ytdl-core");
global.ytdl = YTDL;
global.Enmap = require('enmap');
global.List = require('list-array')
global.RichEmbed = require("discord.js").RichEmbed
global.roundNumber = (num, scale) => {
  if(!("" + num).includes("e")) {
    return +(Math.round(num + "e+" + scale)  + "e-" + scale);
  } else {
    var arr = ("" + num).split("e");
    var sig = ""
    if(+arr[1] + scale > 0) {
      sig = "+";
    }
    return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
  }
}

// ======== REQUIRED 
const http = require('http');
const express = require('express');
const app = express();
app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

const client = new Fridge({
  commandPrefix: "!",
  unknownCommandResponse: false,
  owner: '280399026749440000',
  invite: "https://discord.gg/RYBxgTm",
  disableEveryone: true,
});

client.registry
    .registerDefaultTypes()
    .registerDefaultGroups()
    .registerGroups([
        ["server", "Server"],
        ["games", "Games"],
        ["admin", "Administration"],
        ["owner", "Owner Only"],
        ["audio", "Audio & Music"],
        ["util", "Utilities"],
        ["level", "Levelling System"],
        ["fun", "Fun"],
        ["polls", "Polls"]
    ])
    .registerCommandsIn(path.join(__dirname, 'commands'));

fs.readdir('./events/', (err, files) => {
  if (err) console.error(err);
  console.log(`Loading a total of ${files.length} events.`);
  files.forEach(file => {
    const eventName = file.split(".")[0];
    const event = require(`./events/${file}`);
    client.on(eventName, event.bind(null, client));
    delete require.cache[require.resolve(`./events/${file}`)];
    client.emit("eventLoaded", eventName)
  });
});

client.on("eventLoaded", eventName => {
  console.log(`[Load] Loaded ${eventName} event`)
})

client.actions

var { Utilities } = require("./classes/Utilities");
client.utils = new Utilities()

client.on('error', console.error);

client.audio = {};
client.audio.active = new Map();
client.audio.play = async (client, active, data) => {
  var mario = client.emojis.get("486608176356261889")
  var note = client.emojis.get("486620721930436609")
  let embed = client.util.embed()
    .setTitle("Music Queue")
    .setDescription(`${note} Now Playing: **${data.queue[0].songTitle}** \nDuration: \`[${data.queue[0].length}]\``)
    .addField(mario + " Requester", data.queue[0].requester)
  const playing = client.channels.get(data.queue[0].announceChannel).send(embed);

	const stream = YTDL(data.queue[0].url, { filter: 'audioonly' })
						.on('error', err => {
							console.error('Error occurred when streaming video:', err);
							playing.then(msg => msg.edit(`:x: Couldn't play ${data.queue[0].songTitle}. What a drag!`));
							client.audio.finish(client, active, this);
						});
	data.dispatcher = await data.connection.playStream(stream)
						.on('error', err => {
							console.log('Error occurred in stream dispatcher:', err);
							client.channels.get(data.queue[0].announceChannel).send(`An error occurred while playing the song: \`${err}\``);
							client.audio.finish(client, active, this)
						});
	data.dispatcher.guildID = data.guildID;

	data.dispatcher.once('end', function() {
		client.audio.finish(client, active, this);
	});
}
client.audio.finish = (client, active, dispatcher) => {
  var fetched = active.get(dispatcher.guildID);
  if (!fetched) {
    return;
  }
		fetched.queue.shift();
		if(fetched.queue.length > 0) {
			active.set(dispatcher.guildID, fetched);
			client.audio.play(client, active, fetched);
		} else {
			active.delete(dispatcher.guildID);

			var vc = client.guilds.get(dispatcher.guildID).me.voiceChannel;
			if (vc) vc.leave();
		}
}

client.login(process.env.TOKEN)