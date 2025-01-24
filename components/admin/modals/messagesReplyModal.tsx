import React, { useState } from 'react';

const ReplyModal = ({ conversation, whatsappNumber, onClose, onSend }) => {
  const [replyText, setReplyText] = useState('');
  const BUSINESS_NUMBER = whatsappNumber

  const handleSend = () => {
    if (replyText.trim()) {
      onSend(conversation.conversation_id, replyText);
      setReplyText(''); // Clear the input field after sending
    }
  };

  if (!conversation) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg shadow-lg w-96 max-h-[80vh] p-4 flex flex-col">
        <h2 className="text-lg font-bold text-white mb-4">
          Reply to {conversation.name}
        </h2>
        <div className="flex-grow overflow-auto mb-4">
          {conversation.messages
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            .map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.from === BUSINESS_NUMBER ? 'justify-end' : 'justify-start'
                } mb-2`}
              >
                <div
                  className={`p-2 rounded-lg max-w-xs ${
                    message.from === BUSINESS_NUMBER
                      ? 'bg-green-700 text-white'
                      : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
        </div>
        <div className="flex items-center">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="flex-grow bg-gray-900 text-gray-200 px-4 py-2 rounded-l outline-none"
            placeholder="Type your message..."
          />
          <button
            onClick={handleSend}
            className="bg-green-600 text-white px-4 py-2 rounded-r"
          >
            Send
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-4 bg-red-600 text-white px-3 py-1 rounded w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ReplyModal;
