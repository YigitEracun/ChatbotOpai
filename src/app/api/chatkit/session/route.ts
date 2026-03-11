const openai = require('openai');

const chatkit = new openai.ChatKit({
    apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
    const { messages } = req.body;
    const response = await chatkit.session.create({
        messages,
        workflowId: 'wf_69b147b431a08190a9c42b7de229f0f40206f716a3fee578',
    });
    
    res.status(200).json(response);
};
