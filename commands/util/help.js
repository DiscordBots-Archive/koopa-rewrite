const { stripIndents, oneLine } = require('common-tags');
const { Command } = require('discord.js-commando');
const { disambiguation } = require('../../utils.js');

module.exports = class HelpCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'help',
			group: 'util',
			memberName: 'help',
			aliases: ['commands'],
			description: 'Displays a list of available commands, or detailed information for a specified command.',
			details: oneLine`
				The command may be part of a command name or a whole command name.
				If it isn't specified, all available commands will be listed.
			`,
			examples: ['help', 'help prefix'],
			guarded: true,
			args: [
				{
					key: 'command',
					prompt: 'Which command would you like to view the help for?',
					type: 'string',
					default: ''
				}
			],
		});
	}

	async run(msg, args) { // eslint-disable-line complexity
		var groups = this.client.registry.groups;
		const commands = this.client.registry.findCommands(args.command, false, msg);
		const showAll = args.command && args.command.toLowerCase() === 'all';
		if(args.command && !showAll) {
			if(commands.length === 1) {
				/*let help = stripIndents`
					${oneLine`
						__Command **${commands[0].name}**:__ ${commands[0].description}
						${commands[0].guildOnly ? ' (Usable only in servers)' : ''}
						${commands[0].nsfw ? ' (NSFW)' : ''}
					`}
					**Format:** ${msg.anyUsage(`${commands[0].name}${commands[0].format ? ` ${commands[0].format}` : ''}`)}
				`;*/
        let prefix = msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix
        let help = this.client.utils.embed()
          .setTitle(`Help for command ${`\`${commands[0].name}\``} (${commands[0].group.name})${commands[0].guildOnly ? ' (Usable only in servers)' : ''}${commands[0].nsfw ? ' (NSFW)' : ''}`)
          .addField("Usage", `${msg.anyUsage(`${commands[0].name}${commands[0].format ? ` ${commands[0].format}` : ''}`)}`)
          .setFooter(`(${commands[0].groupID}:${commands[0].memberName}) [${commands[0].groupID}]`)
        if (msg.guild) help.setThumbnail(msg.guild.iconURL)
        let desc = commands[0].description
				if(commands[0].aliases.length > 0) help.addField(`\nAliases`, `${commands[0].aliases.join(', ')}`);
				if(commands[0].details) desc += `\n\n${commands[0].details}`;
        if(commands[0].guilds) help.addField(`Restricted servers`, `${this.client.guilds.filter(g => commands[0].guilds.includes(g.id)).map(g => g.name).join(", ")}`, true);
				if(commands[0].examples) help.addField(`Examples`, `${commands[0].examples.map(e => `${prefix}${e}`).join('\n')}`);
        if(commands[0].throttling) help.addField(`Cooldown`, `You may use this command ${this.client.utils.plural(commands[0].throttling.usages, "time")} every ${commands[0].throttling.duration} seconds`);

        help.setDescription(desc)
        
				/* const messages = [];
				try {
					messages.push(await msg.direct(help));
					if(msg.channel.type !== 'dm') messages.push(await msg.reply('I\'ve sent you a DM with information.'));
				} catch(err) {
					messages.push(await msg.reply('I was unable to send you the help DM. You probably have DMs disabled.'));
				}
				return messages;*/
        return msg.embed(help);
			} else if(commands.length > 15) {
				return msg.reply('multiple commands found. Please be more specific.');
			} else if(commands.length > 1) {
				return msg.reply(disambiguation(commands, 'commands'));
			} else {
				return msg.reply(
					`Unable to identify command. Use ${msg.usage(
						null, msg.channel.type === 'dm' ? null : undefined, msg.channel.type === 'dm' ? null : undefined
					)} to view the list of all commands.`
				);
			}
		} else {
			const messages = [];
      const desc = stripIndents`
          ${oneLine`
						To run a command in ${msg.guild ? msg.guild.name : 'any server'},
						use ${Command.usage('command', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.
						For example, ${Command.usage('prefix', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.
					`}
					To run a command in DM, simply use ${Command.usage('command', null, null)} with no prefix.\n
					Use ${this.usage('<command>', null, null)} to view detailed information about a specific command.
					Use ${this.usage('all', null, null)} to view a list of *all* commands, not just available ones.\n
					`
      let e = this.client.utils.embed()
        .setTitle("Help")
        .setDescription(desc)
      // console.log(groups)
      groups = showAll ? groups : groups.filter(g => g.commands.some(c => c.isUsable(msg)));
      
      groups.forEach(grp => {
        e.addField(grp.name, `\n${(showAll ? grp.commands : grp.commands.filter(cmd => cmd.isUsable(msg)))
								.map(cmd => `**${cmd.name}:** ${cmd.description}${cmd.nsfw ? ' (NSFW)' : ''}`).join('\n')}\n`)
      });
      
      /* (showAll ? groups : groups.filter(grp => grp.commands.some(cmd => cmd.isUsable(msg))))
						.map(grp => stripIndents`
							__${grp.name}__
							${(showAll ? grp.commands : grp.commands.filter(cmd => cmd.isUsable(msg)))
								.map(cmd => `**${cmd.name}:** ${cmd.description}${cmd.nsfw ? ' (NSFW)' : ''}`).join('\n')
							}
						`).join('\n\n')
			try {
				if(msg.channel.type !== 'dm') messages.push(await msg.reply('I\'ve sent you a DM with information.'));
			} catch(err) {
				messages.push(await msg.reply('I was unable to send you the help DM. You probably have DMs disabled.'));
			}*/
      await msg.react("497875905419542572");
			return await msg.direct(e);
		}
	}
};