const { Command } = require('discord.js-commando');
const {promisify} = require("util");
const write = promisify(require("fs").writeFile);

module.exports = class RebootCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'reboot',
            group: 'owner',
            aliases: ["restart", "respawn"],
            memberName: 'reboot',
            description: 'Reboots the bot.',
            examples: ['reboot'],
        });
    }
  
    hasPermission(msg) {
      if (!this.client.isOwner(msg.author)) return 'only the bot owner(s) may use this command.';
      return true;
    }

    async run(message) {
      var m = await message.channel.send("Koopa is respawning...");
      await write('./reboot.json', `{"id": "${m.id}", "channel": "${m.channel.id}"}`).catch(console.error);
      process.exit();
    }
};