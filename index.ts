import TelegramBot from 'node-telegram-bot-api'
import { saveMemo, saveUrl } from './request'

const TOKEN = process.env.TELEGRAM_TOKEN || ''
const port = parseInt(process.env.PORT || '443', 10)
const options = {
  webHook: {
    // Port to which you should bind is assigned to $PORT variable
    // See: https://devcenter.heroku.com/articles/dynos#local-environment-variables
    port,
    // you do NOT need to set up certificates since Heroku provides
    // the SSL certs already (https://<app-name>.herokuapp.com)
    // Also no need to pass IP because on Heroku you need to bind to 0.0.0.0
  },
}
// Heroku routes from port :443 to $PORT
// Add URL of your app to env variable or enable Dyno Metadata
// to get this automatically
// See: https://devcenter.heroku.com/articles/dyno-metadata
const url = process.env.APP_URL || 'https://<app-name>.herokuapp.com:443'
const bot = new TelegramBot(TOKEN, options)

// This informs the Telegram servers of the new webhook.
// Note: we do not need to pass in the cert, as it already provided
bot.setWebHook(`${url}/bot${TOKEN}`)

// Just to ping!
bot.on('message', async function onMessage(msg) {
  console.log('msg :>>%j ', msg)
  if (msg.caption_entities) {
    await Promise.all(
      msg.caption_entities.map(async (entity) => {
        if (entity.type === 'text_link' || entity.type === 'url') {
          const title = msg.caption
          const { url } = entity
          await saveUrl({ content: url!, title })
          bot.sendMessage(msg.chat.id, '链接保存成功啦')
        }
      }),
    )
  }
  if (msg.entities) {
    await Promise.all(
      msg.entities.map(async (entity) => {
        if (entity.type === 'text_link' || entity.type === 'url') {
          const title = msg.text
          const { url } = entity
          await saveUrl({ content: url!, title })
          bot.sendMessage(msg.chat.id, '链接保存成功啦')
        }
      }),
    )
  }
  if (msg.text) {
    await saveMemo({ content: msg.text })
    bot.sendMessage(msg.chat.id, '速记保存成功啦')
  }
})
