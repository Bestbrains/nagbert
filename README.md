# Nagbert
[![Build Status](https://travis-ci.org/Bestbrains/nagbert.svg?branch=master)](https://travis-ci.org/Bestbrains/nagbert.svg?branch=master)

Need to nag someone to take action on something over slack?

Let Nagbert do it. He'll regularly follow up, and let you know when everyone has taken action, leaving you free to do what you do best.

# Usage

Run command "npm run start" to run the bot

## Commands

Nagbert responds to the following commands in slack:

*Hi* - Nagbert will introduce himself and display a list of commands
*nag* - Nagbert will initiate a conversation to begin a nagging topic
*Who are you* - Nagbert will provide some personal information.

# Token

This service expects a _secret.json file with the following structure

    {
      "token": "xoxb-<numeric>-<alphanumeric>"
    }

The token is a slack bot user token created in the team you wish to apply this bot.

Service is for now intended to be deployed by you, somewhere you control.

# TODO
* Make confirm Y/n buttons
* Make a scheduled job with the nagging topics
* Start conversation with nagees and notify the nagger who has been nagged
* Make confirm y/n buttons for nagees to let nagbert know they've completed their task.

* ~~Extract responses from conversation steps~~
* ~~React according to responses~~
 * ~~Extract date and validate~~
 * ~~Extract user names from input & validate~~
* ~~Repeat back the settings to the user starting the nag~~
* ~~Save a finalized nagging topic to team level json storage~~
* ~~Save a finalized nagging topic to team level json storage~~
* ~~Make the "list current nag topics" function~~
 * ~~user~~
 * ~~team~~
 * ~~Pretty formatting of stuff like the owner etc.~~
