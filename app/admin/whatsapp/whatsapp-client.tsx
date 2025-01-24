'use client';
import React, { useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '@lib/fetchers';
import { format } from 'date-fns';
import ReplyModal from '@components/admin/modals/messagesReplyModal';

const conversationsApiUrl = '/api/admin/whatsapp';

export default function ConversationsPage() {
  const [modalConversation, setModalConversation] = useState(null); // Track the active modal
  const [expandedConversations, setExpandedConversations] = useState({}); // Track expanded conversations
  const { data, error, isLoading, mutate } = useSWR(conversationsApiUrl, fetcher, { keepPreviousData: false });

  const conversationsData = data?.messages || [];
  const BUSINESS_NUMBER = data?.whatsappNumber;

  const formatDate = (isoDate) => {
    try {
      return format(new Date(isoDate), 'PPP p');
    } catch {
      return 'Invalid Date';
    }
  };

  const toggleConversation = (conversationId) => {
    setExpandedConversations((prev) => ({
      ...prev,
      [conversationId]: !prev[conversationId],
    }));
  };

  const handleReply = (conversation) => {
    setModalConversation(conversation);
  };

  const handleSendReply = async (conversationId, message) => {
    try {
      const response = await fetch(conversationsApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const responseData = await response.json();
      console.log('Message sent successfully:', responseData);

      // Optionally refresh conversations data
      mutate();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setModalConversation(null); // Close the modal
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-100 mb-4">Conversations</h1>
      {isLoading ? (
        <p className="text-gray-200">Loading conversations...</p>
      ) : error ? (
        <p className="text-red-600">Error loading data: {error.message}</p>
      ) : (
        <table className="min-w-full table-auto border-collapse border border-gray-700">
          <thead>
            <tr className="bg-gray-800">
              <th className="px-4 py-2 text-left text-gray-300">Name</th>
              <th className="px-4 py-2 text-left text-gray-300">Last Updated</th>
              <th className="px-4 py-2 text-left text-gray-300">Recent Messages</th>
              <th className="px-4 py-2 text-left text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {conversationsData.map((conversation) => (
              <React.Fragment key={conversation.conversation_id}>
                <tr className="bg-gray-800 cursor-pointer" onClick={() => toggleConversation(conversation.conversation_id)}>
                  <td className="px-4 py-2 text-gray-200">{conversation.name}</td>
                  <td className="px-4 py-2 text-gray-200">{formatDate(conversation.last_updated)}</td>
                  <td className="px-4 py-2 text-gray-200">
                    {conversation.messages?.[0]?.text || 'No messages'}
                  </td>
                  <td className="px-4 py-2 text-gray-200">
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent toggling the conversation
                        handleReply(conversation);
                      }}
                    >
                      Reply
                    </button>
                  </td>
                </tr>
                {expandedConversations[conversation.conversation_id] && (
                  <tr className="bg-gray-700">
                    <td colSpan={4}>
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-200 mb-2">Messages:</h3>
                        <div className="space-y-2">
                          {conversation.messages
                            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                            .map((message, index) => (
                              <div key={index} className="bg-gray-800 p-2 rounded text-gray-200">
                                <p className="text-sm">
                                  <strong>{message.from === BUSINESS_NUMBER ? 'You' : 'Them'}:</strong> {message.text || 'No content'}
                                </p>
                                <p className="text-xs text-gray-400">{formatDate(message.timestamp)}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}

      {/* Include ReplyModal */}
      <ReplyModal
        conversation={modalConversation}
        whatsappNumber={BUSINESS_NUMBER}
        onClose={() => setModalConversation(null)}
        onSend={handleSendReply}
      />
    </div>
  );
}