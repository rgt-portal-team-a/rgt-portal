import React, { useState, useRef } from 'react';
import { Paperclip, Send, Image as ImageIcon, Mic, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import TextareaAutosize from 'react-textarea-autosize';
import { useCreateMessage } from '@/api/query-hooks/useMessaging';

interface MessageInputProps {
  conversationId: number;
  onSend?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ conversationId, onSend }) => {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createMessage = useCreateMessage();

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!message.trim() && files.length === 0) return;

    try {
      // TODO: Implement file upload logic here
      // For now, we'll just handle text messages
      await createMessage.mutateAsync({
        content: message,
        conversationId,
        type: 'TEXT'
      });

      setMessage('');
      setFiles([]);
      onSend?.();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="border-t p-4 bg-background rounded-b-xl">
      {files.length > 0 && (
        <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              {file.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              ) : (
                <div className="w-20 h-20 flex items-center justify-center bg-muted rounded-lg">
                  <Paperclip className="w-8 h-8 opacity-50" />
                </div>
              )}
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Paperclip className="w-5 h-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" align="start">
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Image
              </Button>
              <Button variant="ghost" className="justify-start">
                <Mic className="w-4 h-4 mr-2" />
                Audio
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
        />

        <div className="flex-1 flex items-end bg-muted rounded-lg">
          <TextareaAutosize
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none focus:outline-none resize-none p-3 max-h-32"
            maxRows={5}
          />
        </div>

        <Button
          size="icon"
          className="shrink-0"
          onClick={handleSend}
          disabled={!message.trim() && files.length === 0}
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}; 