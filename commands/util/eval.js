const util = require('util');
const { Attachment } = require('discord.js');
const { Command } = require('discord.js-commando');

module.exports = class EvalCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'eval',
      aliases: ["ev", "js"],
			group: 'util',
			memberName: 'eval',
			description: 'Executes JavaScript code.',
			details: 'Only the bot owner(s) may use this command.',
			args: [
				{
					key: 'script',
					prompt: 'What code would you like to evaluate?',
					type: 'string'
				}
			]
		});

		this.lastResult = null;
	}
  
  hasPermission(msg) {
    if (!this.client.isOwner(msg.author)) return 'only the bot owner(s) may use this command.';
    return true;
  }

	async run(message, { script }) {
		let msg = message,
      guild = msg.guild,
      user = msg.author,
      client = this.client;
    var code = script;
    const prefix = msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix;
    if (script.length > 1016) code = "eval(\"Too long to be shown here\")"
    try {
      let evaled = eval(script);
      if (evaled instanceof Promise) evaled = await evaled;
      if (typeof evaled !== "string") evaled = util.inspect(evaled, { depth: 0 });
      const output = clean(evaled);
      if (output.length > 1016) {
        return message.channel.send(new Attachment(Buffer.from(output), "output.txt"));
      }
      const embed = client.utils.embed()
        .setColor(0x10ce66)
        .setDescription(`${message.author.username}, here are the results of the \`${prefix}eval\` command`)
        .setAuthor(message.author.username, message.author.avatarURL)
        .setTimestamp()
        .addField(":inbox_tray: **INPUT**", `\`\`\`js\n${code}\n\`\`\``)
        .addField(":outbox_tray: **OUTPUT**", `\`\`\`js\n${output}\n\`\`\``)
        .setFooter(`${prefix}eval`)
      return message.channel.send(/*"js", output*/{ embed });
    } catch (err) {
      const errorEmbed = client.utils.embed()
        .setColor("0xE20D0D")
        .setDescription(`${message.author.username}, the \`${prefix}eval\` command returned an error`)
        .setAuthor(message.author.username, message.author.avatarURL)
        .setTimestamp()
        .addField(":inbox_tray: **INPUT**", `\`\`\`js\n${code}\n\`\`\``)
        .addField(":outbox_tray: **OUTPUT**", `\`\`\`js\n${clean(err)}\n\`\`\``)
        .setFooter(`${prefix}eval`)
      return message.channel.send(errorEmbed)
    }
  }
}

const clean = text => {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
      return text;
}