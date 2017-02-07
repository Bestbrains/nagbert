'use strict'

const secret = require(__dirname + '/_secret.json')
const info = require(__dirname + '/_info.json')

const uuid = require('uuid/v4')

if (!secret.token) {
    console.log('Error: Specify token in json file _secret')
    process.exit(1)
}

const Botkit = require('botkit')
const os = require('os')
const moment = require('moment')

const controller = Botkit.slackbot({
    debug: true,
    stats_optout: true,
    json_file_store: __dirname + '/topics'
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
             '>. I have been running for ' + uptime + ' on ' + hostname + ' as build number ' + info.build + '.')

    })

controller.hears(['list'], 'direct_message,direct_mention,mention', (bot, message) => {
    bot.reply(message, 'Alright, let me search through this stack of papers...')
    bot.createConversation(message, (response, convo) => {
        getUserData(message.user).then((userData) => {
            convo.activate()

            let topicCount = userData.topics.length
            let activeTopicCount = getActiveTopics(userData.topics).length
            convo.say('Whew, you\'re one tough cookie. I found ' + topicCount + ' nag topics. However, only ' + activeTopicCount + ' of them are active.')
            let prettyPrintedTopics = prettyPrintTopics(userData.topics)
            convo.say(prettyPrintedTopics)
            convo.next()
        })
    })
})

controller.hears(['teamstatus'], 'direct_message,direct_mention,mention', (bot, message) => {
    bot.reply(message, 'Uhhh.. Are you sure? It\'s kind of a secret.\nAlright, let me search through this stack of papers...')
    bot.createConversation(message, (response, convo) => {
        getTeamData(message.team).then((teamData) => {
            convo.activate()

            let topicCount = teamData.topics.length
            let activeTopicCount = getActiveTopics(teamData.topics).length
            convo.say('Whew, you guys are ACTIVE. I found ' + topicCount + ' nag topics. However, only ' + activeTopicCount + ' of them are active.')
            let prettyPrintedTopics = prettyPrintTopics(teamData.topics)
            convo.say(prettyPrintedTopics)
            convo.next()
        })
    })
})

controller.hears(['nag'], 'direct_message,direct_mention,mention', (bot, message) => {
    bot.reply(message, 'Great! I can\'t wait to get started. Let me just get a pen...')
    bot.createConversation(message, (response, convo) => {
        Promise.all([getUserData(message.user), getTeamData(message.team)])
        .then((values) => {
            convo.setVar('userData', values[0] || { id: message.user, topics: []})
            convo.setVar('teamData', values[1] || { id: message.team, topics: []})
            convo.activate()
        }).catch((err) => {
            // bot.reply(message, 'Sorry, I couldn\'t find a pen. Try again later.')
            // Super nasty, but jfs (the json file system underneath the botkit data store)
            // does not report whether data could not be found because it doesn't exist, or an error happened on the file system
            // Just assume for now that errors mean (no data)

            convo.setVar('userData', { id: message.user, topics: []})
            convo.setVar('teamData', { id: message.team, topics: []})
            convo.activate()
        })

        askUsersToNag(response, convo)
    })

})

const messages = {
    askUsersToNag: 'Who would you like me to nag? Tag them here (i.e. @Superman @Batman)',
    askMessageToNagAbout: 'What would you like me to nag them about?',
    askDeadline: 'Do you have a deadline? (DD/MM/YYYY | No)',
    recapOptions: 'Does this information look right to you? (Yes/no)'
}

function askUsersToNag(response, convo) {
    convo.ask(messages.askUsersToNag, (response, convo) => {
        let users = convo.extractResponse(messages.askUsersToNag)

        if (!validUserSequence(users)) {
            convo.say('Are you sure you tagged the users?')
            convo.repeat()
        } else {
            convo.say('Will nag: ' + humanReadableUserList(users));

            askMessageToNagAbout(response, convo);
        }
        convo.next()
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
            convo.say('Please ensure the date is valid and set in the future. Today is: ' + humanReadableDate(getToday()))
            askDeadline(response, convo)
        }
        convo.next()
    })
}

function getToday() {
    return moment().startOf('day')
}

function validDate(date) {
    let deadline = parseDate(date)
    return deadline.isValid() && deadline.endOf('day').isAfter(getToday())
}
const dateFormats = ['DD/MM/YYYY', 'DD/MM/YY', 'DD-MM-YYYY', 'DD-MM-YY']
function parseDate(dateString) {
    return moment(dateString, dateFormats, true)
}

function humanReadableDate(dateString) {
    return parseDate(dateString).format('DD MMM YYYY')
}

function validUserSequence(users) {
    return getUsers(users) !== null
}

function getUsers(users) {
    let regex = /<@[\d\w]+>/g
    let matches = users.match(regex)

    return matches
}

function humanReadableUserList(users) {
    let userlist = getUsers(users)
    if (userlist === null) {
        return ''
    }
    return userlist.join(', ')
}

function getActiveTopics(topics) {
    if (topics.length === 0) {
        return []
    }
    return topics.filter((topic) => {
        return topic.deadline == null || parseDate(topic.deadline).endOf('day').isAfter(getToday)
    })
}

function prettyPrintTopics(topics) {
    let activeTopics = getActiveTopics(topics)
    if (activeTopics.length === 0) {
        return 'You have no active topics :-( How about starting one?'
    }
    return activeTopics.map((topic) => {
        let deadline = topic.deadline?
            humanReadableDate(parseDate(topic.deadline))
            : 'No deadline'

        return '*\t' + deadline + ': ' + topic.message + '\n\t - Involving: ' + topic.users.join(', ') + ' - Owned by: <@' + topic.owner + '>'
    }).join('\n ')
}

function recapOptions(response, convo) {
    let values = convo.extractResponses()

    // Values are extracted with the questions as keys
    convo.say('I should nag: ' + humanReadableUserList(values[messages.askUsersToNag]))
    convo.say('I should ask them about: ' + values[messages.askMessageToNagAbout])
    if (values[messages.askDeadline].match(bot.utterances.no)) {
        convo.say('There is no deadline')
    } else {
        convo.say('The deadline is: ' + humanReadableDate(values[messages.askDeadline]))
    }
    convo.ask(messages.recapOptions, (response, convo) => {
        let answer = convo.extractResponse(messages.recapOptions)
        if (answer.match(bot.utterances.no)) {
            convo.say('Alright. I won\'t start nagging just yet. Say \'nag\' to go through this process again with your changes.')
        } else if (answer.match(bot.utterances.yes)) {
            convo.say('Alright! For now, please remind them yourself. I haven\'t learned to initiate nagging yet.')
            convo.say('I\'m sure I\'ll learn soon enough. Thanks for trying me out!')
            saveTopic(response, convo)
        } else {
            convo.say('I\'m sorry, I didn\'t quite get that. Please speak in simpler terms.')
            convo.repeat()
        }
        convo.next()
    })
}

function saveTopic(response, convo) {
    let users = getUsers(convo.extractResponse(messages.askUsersToNag))
    let date = parseDate(convo.extractResponse(messages.askDeadline))
    let message = convo.extractResponse(messages.askMessageToNagAbout)
    let owner = convo.source_message.user
    let topic = {
        id: uuid(),
        message: message,
        owner: owner,
        deadline: date,
        users: users,
        respondedUsers: []
    }
    let userData = convo.vars.userData
    let teamData = convo.vars.teamData
    userData.topics.push(topic)
    teamData.topics.push(topic)
    controller.storage.users.save(userData, function ignored(err) {  });
    controller.storage.teams.save(teamData, function ignored(err) {  });
    convo.say('I\'ve now saved the topic for scheduling')
}

function getUserData(userId) {
    return new Promise((resolve, reject) => {
        controller.storage.users.get(userId, (err, user_data) => {
            if (err) {
                reject(err)
            } else resolve(user_data)
        })
    })
}

function getTeamData(teamId) {
    return new Promise((resolve, reject) => {
        controller.storage.teams.get(teamId, (err, user_data) => {
            if (err) {
                reject(err)
            } else resolve(user_data)
        })
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
