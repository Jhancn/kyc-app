const axios = require('axios');
require('dotenv').config();

const sendMessage = async (message, chat_id, bot_api_token) => {
    let formattedMessage = `<b>${message}</b>`

    const baseURL = `https://api.telegram.org/bot${bot_api_token}/sendMessage`
    const url = `${baseURL}?chat_id=${chat_id}&text=${formattedMessage}&parse_mode=HTML`

    try {
        const response = await axios.get(url)
        if(response) console.log('Sent alert to telegram!')
    }catch(err) {
        console.log('Error in sending alert', err.message)
    }
}

module.exports = (message) => {
    let chatIds = Array(process.env.CHAT_ID_1)
    let bot_api_token = process.env.BOT_API_TOKEN

    chatIds.forEach(chat_id => {
        sendMessage(message, chat_id, bot_api_token)
    })
}