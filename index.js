'use strict'

const secret = require('./_secret.json')

if (!secret.token) {
    console.log('Error: Specify token in json file _secret')
    process.exit(1)
}

const Botkit = require('botkit')
const os = require('os')

const controller = Botkit.slackbot({
    debug: true,
    stats_optout: true
})

const bot = controller.spawn({
    token: secret.token
}).startRTM()

controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', (bot, message) => {
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face',
    }, (err, res) => {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err)
        }
    })


    controller.storage.users.get(message.user, (err, user) => {
        if (user && user.name) {
            bot.reply(message, 'Hello ' + user.name + '!!')
            bot.reply(message, 'Would you like me to nag someone or follow up on your existing nags? (nag/list)')
        } else {
            bot.reply(message, 'Hello. Would you like me to nag someone or follow up on your existing nags? (nag/list)')
        }
    })
})

controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
    'direct_message,direct_mention,mention', (bot, message) => {

        let hostname = os.hostname()
        let uptime = formatUptime(process.uptime())

        bot.reply(message,
            ':robot_face: I am a bot named <@' + bot.identity.name +
             '>. I have been running for ' + uptime + ' on ' + hostname + '.')

    })

controller.hears(['nag'], 'direct_message,direct_mention,mention', (bot, message) => {
    bot.reply(message, 'Great! I can\'t wait to get started.')
    bot.startConversation(message, askUsersToNag)
})

const messages = {
    askUsersToNag: 'Who would you like me to nag? Tag them and separate by commas (i.e. @Superman,@Batman)',
    askMessageToNagAbout: 'What would you like me to nag them about?',
    askDeadline: 'Do you have a deadline? (DD/MM/YY | No)',
    recapOptions: 'Does this information look right to you? (Y/n)'
}

function askUsersToNag(response, convo) {
    convo.ask(messages.askUsersToNag, (response, convo) => {
        convo.say('Noted.');
        askMessageToNagAbout(response, convo);
        convo.next();
    });
}

function askMessageToNagAbout(response, convo) {
    convo.ask(messages.askMessageToNagAbout, function(response, convo) {
        convo.say('Noted.')
        askDeadline(response, convo);
        convo.next();
    });
}

function askDeadline(response, convo) {
    convo.ask(messages.askDeadline, (response, convo) => {
        let dateResponse = convo.extractResponse(messages.askDeadline)
        if (dateResponse.match(bot.utterances.no) || validDate(dateResponse)) {
            recapOptions(response, convo)
        } else {
            askDeadline(response, convo)
        }
        convo.next()
    })
}

function validDate(date) {
    return false
}

function recapOptions(response, convo) {
    let values = convo.extractResponses()

    // Values are extracted with the questions as keys
    convo.say('I should nag: ' + values[messages.askUsersToNag])
    convo.say('I should ask them about: ' + values[messages.askMessageToNagAbout])
    if (values[messages.askDeadline].toLowerCase() == 'no') {
        convo.say('There is no deadline')
    } else {
        convo.say('The deadline is: ' + values[messages.askDeadline])
    }
    convo.ask(messages.recapOptions, (response, convo) => {
        convo.say('Alright! For now, please remind them yourself. I haven\'t learned to initiate nagging yet.')
        convo.say('I\'m sure I\'ll learn soon enough. Thanks for trying me out!')
        convo.next()
    })
}

function formatUptime(uptime) {
    var unit = 'second'
    if (uptime > 60) {
        uptime = uptime / 60
        unit = 'minute'
    }
    if (uptime > 60) {
        uptime = uptime / 60
        unit = 'hour'
    }
    if (uptime != 1) {
        unit = unit + 's'
    }

    uptime = uptime + ' ' + unit
    return uptime
}
