const { RichEmbed } = require('discord.js')

module.exports = class Embed extends RichEmbed {
  constructor(...args) {
    super(args)
    //this.setPrivateFooter(ownership)
    this.setTimestamp(new Date())
  }
  
  setPrivateFooter(t) {
    return super.setFooter(t)
  }
  
  /*
  setFooter(text) {
    //return super.setFooter(`${text} • ${ownership}`)
  }
  */
  
  addInline(title, desc) {
    return super.addField(title, desc, true)
  }
}