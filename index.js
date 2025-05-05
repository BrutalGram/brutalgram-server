const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
app.use(bodyParser.json());

app.post('/send-brutalgram', async (req, res) => {
  const { recipientEmail, rawMessage } = req.body;

  try {
    const response = await axios.post(
      `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`,
      new URLSearchParams({
        from: `The Brutalgram Team <noreply@${process.env.MAILGUN_DOMAIN}>`,
        to: recipientEmail,
        subject: "You've received a Brutalgram! (This will ruin your day, open at own risk!)",
        text: rawMessage,
        html: `<p>${rawMessage}</p>`,
        'h:Reply-To': 'dontreply@brutalgram.com',
        'h:List-Unsubscribe': '<mailto:unsubscribe@brutalgram.com>',
      }),
      {
        auth: {
          username: 'api',
          password: process.env.MAILGUN_API_KEY,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    console.log("Email successfully sent via Mailgun:", response.data);
    res.status(200).json({ message: 'Email sent!', id: response.data.id });
  } catch (error) {
    console.error('Mailgun Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.post('/generate-brutalgram', async (req, res) => {
  const { tone, context, recipientName } = req.body;

  try {
    const prompt = `Write a savage, emotionally charged letter in a ${tone} tone to someone named ${recipientName}. Use the following context to fuel the message: "${context}". This should be structured like a real letter — 3 to 4 paragraphs, brutally honest, smart, and slightly humorous. Sign off with something cold or ironic.`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo', 
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const brutalgramText = response.data.choices[0].message.content;

    console.log("Generated Brutalgram:\n", brutalgramText);

    res.status(200).json({ brutalgramText });
  } catch (err) {
    console.error('OpenAI Error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to generate Brutalgram' });
  }
});

const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.send('Brutalgram server is alive. Now go away.');
  });
  
app.listen(PORT, () => {
  console.log(`Brutalgram server listening on port ${PORT}`);
});
