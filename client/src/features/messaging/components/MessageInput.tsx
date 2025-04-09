import React, { useState, useRef } from 'react';
import { Paperclip, Send, Image as ImageIcon, Mic, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import TextareaAutosize from 'react-textarea-autosize';
import { useCreateMessage } from '@/api/query-hooks/useMessaging';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  conversationId: string;
  onSend?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ conversationId, onSend }) => {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createMessage = useCreateMessage();
  const isSubmitting = createMessage.isPending;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSubmitting) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSubmitting) return;
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    if (isSubmitting) return;
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if ((!message.trim() && files.length === 0) || isSubmitting) return;

    try {
      // TODO: Implement file upload logic here
      // For now, we'll just handle text messages
      await createMessage.mutateAsync({
        content: message,
        conversationId: conversationId,
        type: 'text'
      });

      setMessage('');
      setFiles([]);
      onSend?.();
    } catch (error) {
      console.error('Failed to send message:', error);
      // TODO: Add user-facing error handling (e.g., toast notification)
    }
  };

  const canSend = (message.trim() || files.length > 0) && !isSubmitting;

  return (
    <div className="border-t p-4 bg-background rounded-b-xl">
      {files.length > 0 && (
        <div className="flex gap-2 mb-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted-foreground/50 scrollbar-track-transparent">
          {files.map((file, index) => (
            <div key={index} className="relative group shrink-0">
              {file.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-20 h-20 object-cover rounded-lg border"
                />
              ) : (
                <div className="w-20 h-20 flex items-center justify-center bg-muted rounded-lg border">
                  <Paperclip className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <Button
                size="icon"
                variant="destructive"
                className={cn(
                  "absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer",
                  isSubmitting && "hidden"
                )}
                onClick={() => removeFile(index)}
                disabled={isSubmitting}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 cursor-pointer"
              disabled={isSubmitting}
            >
              <Paperclip className="w-5 h-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start">
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                className="justify-start h-9 px-2 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Image
              </Button>
              <Button
                variant="ghost"
                className="justify-start h-9 px-2 cursor-pointer"
                disabled
              >
                <Mic className="w-4 h-4 mr-2" />
                Audio (soon)
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
          disabled={isSubmitting}
        />

        <div className="flex-1 flex items-end bg-muted rounded-lg border has-[:focus]:border-primary transition-colors">
          <TextareaAutosize
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none focus:outline-none resize-none p-3 max-h-32 scrollbar-thin scrollbar-thumb-muted-foreground/50 scrollbar-track-transparent"
            maxRows={5}
            disabled={isSubmitting}
          />
        </div>

        <Button
          size="icon"
          className={cn(
            "shrink-0 bg-purpleaccent2 rounded-br-2xl hover:bg-[#dfd2f8] transition-colors duration-300 ease-in cursor-pointer items-center justify-center group w-12 h-12 ",
            isSubmitting || (!canSend && "opacity-50 cursor-not-allowed")
          )}
          onClick={handleSend}
          disabled={!canSend}
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin text-rgtpink" />
          ) : (
            <Send
              // color="#2D264B"
              className={cn(
                "w-5 h-5 text-rgtpink",
                !canSend && "text-muted-foreground/50 cursor-not-allowed"
              )}
            />
          )}
        </Button>
      </div>
    </div>
  );
}; 