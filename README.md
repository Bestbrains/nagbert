# Nagbert
Need to nag someone to take action on something over slack?

Let Nagbert do it. He'll regularly follow up, and let you know when everyone has taken action, leaving you free to do what you do best.

# Usage

Run command "npm run start" to run the bot

# Token

This service expects a _secret.json file with the following structure

    {
      "token": "xoxb-<numeric>-<alphanumeric>"
    }

The token is a slack bot user token created in the team you wish to apply this bot.

Service is for now intended to be deployed by you, somewhere you control.
