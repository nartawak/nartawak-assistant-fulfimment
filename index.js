const express = require('express');
const bodyParser = require('body-parser');
const {dialogflow, SignIn} = require('actions-on-google');
const fetch = require('node-fetch');

// Create an app instance
const agent = dialogflow();

// Register handlers for Dialogflow intents

agent.intent('Welcome Intent', conv => {
  conv.ask('Salut');
  conv.ask(`C'est cadeau`);
  conv.ask(new Image({
    url: 'https://developers.google.com/web/fundamentals/accessibility/semantics-builtin/imgs/160204193356-01-cat-500.jpg',
    alt: 'A cat',
  }))
})

agent.intent('Sign In', conv => {
  console.log('XXXXX', conv);
  conv.ask(new SignIn('Nartawak API'));
});

function getPublicContent(conv) {
  return fetch('http://localhost:8080/api/public', {
    headers: {'Content-Type': 'application/json'},
  })
    .then(res => res.json())
    .then(json => {
      console.log(json)
      conv.ask(json.message);
    })
    .catch(e => {
      console.log('Error Public content', e)
      conv.ask('Une erreur est survenue !');
    });
}

function getSecuredContent(conv) {
  console.log('ACCESS', conv.user.access);
  return fetch('http://localhost:8080/api/secured', {
    headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + conv.user.access.token},
  })
    .then(res => res.json())
    .then(json => {
      console.log(json)
      conv.ask(json.message);
    })
    .catch(e => {
      console.log('Error Secured content', e)
      conv.ask('Une erreur est survenue !, vous devez surement vous authentifier');
    });
}

agent.intent('Get public content', getPublicContent);
agent.intent('Get secured content', getSecuredContent);

agent.intent('Default Fallback Intent', conv => {
  conv.ask(`I didn't understand. Can you tell me something else?`)
})

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 8081;

app.use(bodyParser.json(), agent);

/**
 * CORS configurations
 */
app.all('/*', (req, res, next) => {
  // CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  
  // Set custom headers for CORS
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
  if (req.method === 'OPTIONS') {
    res.status(200)
      .end();
  } else {
    next();
  }
});

// app.post('/fulfillment', agent);

app.listen(PORT, () => {
  console.log(`Running on port: ${PORT}`);
});
