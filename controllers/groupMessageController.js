import GroupMessage from "../models/groupMessageModel.js";

export const sendGroupMessage = async (req, res) => {
    try {
        const { senderId, groupId, message } = req.body;

        if (!senderId || !groupId || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newGroupMessage = new GroupMessage({
            senderId,
            groupId,
            message,
        });

        await newGroupMessage.save();

        res.status(201).json({
            success: true,
            message: 'Group message sent successfully',
            newGroupMessage
        });
    } catch (error) {
        console.error('Group message error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const getGroupMessages = async (req, res) => {
    console.log("Fetching group messages...")
    try {
        const { groupId } = req.params; // Assuming groupId is passed as a URL parameter

        if (!groupId) {
            return res.status(400).json({ error: 'Group ID is required' });
        }

        const messages = await GroupMessage.find({ groupId }).populate('senderId', 'firstName email ').sort('-timestamp');

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching group messages:', error);
        res.status(500).json({ error: 'Server error' });
    }
}
