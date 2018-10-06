const Commando = require("discord.js-commando");
const { oneLine } = require('common-tags')
    , RichEmbed = require('./Embed.js')

class Utilities {
  constructor() {
    this.sendOkMsg = (msg, txt) => {
      return msg.channel.send(`:white_check_mark: | ${txt}`);
    }
    
    this.sendErrMsg = (msg, txt) => {
      return msg.channel.send(this.getErrStr(txt));
    }
	}
  
  getErrStr(txt) {
    return `:negative_squared_cross_mark: | ${txt}`
  }
  
  embed() {
    return new RichEmbed()
      .setColor(0x008080)
  }
  
  plural(num, item) {
    if (num == 1) return `${num} ${item}`
    
    var i = item;
    
    if (item.substr(-1) == "y")
      i = item.substr(0, item.length - 1) + "ies"
    else if (item.substr(-3) == "tch")
      i += "es"
    else i += "s"
    
    return `${num} ${i}`
  }
}

module.exports = {
  Utilities
}