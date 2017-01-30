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

# Token

This service expects a _secret.json file with the following structure

    {
      "token": "xoxb-<numeric>-<alphanumeric>"
    }

The token is a slack bot user token created in the team you wish to apply this bot.

Service is for now intended to be deployed by you, somewhere you control.

# TODO

1. ~~Extract responses from conversation steps~~
2. ~~React according to responses~~
 1. ~~Extract date and validate~~
 2. ~~Extract user names from input & validate~~
3. ~~Repeat back the settings to the user starting the nag~~
4. Make confirm Y/n buttons
5. ~~Save a finalized nagging topic to team level json storage~~

6. Make a scheduled job with the nagging topics
7. Start conversation with nagees and notify the nagger who has been nagged
8. Make confirm y/n buttons for nagees to let nagbert know they've completed their task.

9. Make the "list current nag topics" function
    1. user
    2. team
    3. Pretty formatting of stuff like the owner etc.
