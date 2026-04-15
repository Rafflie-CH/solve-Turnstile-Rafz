const axios = require('axios');

module.exports = async (req, res) => {
    const { apikey, sitekey, url } = req.query;

    if (!apikey || !sitekey || !url) {
        return res.status(400).json({ status: false, message: 'Parameter apikey, sitekey, dan url wajib diisi' });
    }

    try {
        const createResp = await axios.post('https://api.2captcha.com/createTask', {
            clientKey: apikey,
            task: {
                type: "TurnstileTaskProxyless",
                websiteURL: url,
                websiteKey: sitekey
            }
        });

        if (createResp.data.errorId !== 0) {
            return res.json({ status: false, message: createResp.data.errorDescription });
        }

        const taskId = createResp.data.taskId;

        const poll = async () => {
            const statusResp = await axios.post('https://api.2captcha.com/getTaskResult', {
                clientKey: apikey,
                taskId: taskId
            });

            if (statusResp.data.status === 'processing') {
                await new Promise(r => setTimeout(r, 5000));
                return poll();
            }
            return statusResp.data;
        };

        const result = await poll();
        res.status(200).json(result);
    } catch (e) {
        res.status(500).json({ status: false, message: e.message });
    }
};
