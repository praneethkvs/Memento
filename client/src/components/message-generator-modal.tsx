import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sparkles, Copy, RotateCcw, Loader2 } from "lucide-react";
import { Event } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface MessageGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
}

interface GeneratedMessage {
  id: number;
  message: string;
  tone: string;
  length: string;
}

export function MessageGeneratorModal({ open, onOpenChange, event }: MessageGeneratorModalProps) {
  const [tone, setTone] = useState<string>("cheerful");
  const [length, setLength] = useState<string>("medium");
  const [generatedMessage, setGeneratedMessage] = useState<GeneratedMessage | null>(null);
  const { toast } = useToast();

  // Fetch existing message for the event
  const { data: existingMessage, isLoading: isLoadingMessage } = useQuery<GeneratedMessage>({
    queryKey: [`/api/events/${event?.id}/message`],
    queryFn: async () => {
      if (!event) return null;
      
      const response = await fetch(`/api/events/${event.id}/message`, {
        credentials: "include",
      });
      
      console.log(`Fetching message for event ${event.id}, status: ${response.status}`);
      
      if (response.status === 404) {
        console.log("No message found for this event");
        return null; // No message exists yet
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch message: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Message fetch result:", result);
      return result;
    },
    enabled: !!event && open,
    retry: false, // Don't retry if no message exists (404)
  });

  // Update the displayed message when existing message is loaded
  useEffect(() => {
    console.log("Existing message:", existingMessage);
    if (existingMessage) {
      setGeneratedMessage(existingMessage);
      setTone(existingMessage.tone);
      setLength(existingMessage.length);
    } else {
      setGeneratedMessage(null);
    }
  }, [existingMessage]);

  const queryClient = useQueryClient();

  // Generate message mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!event) throw new Error("No event selected");
      
      const response = await fetch(`/api/events/${event.id}/generate-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tone, length }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate message");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedMessage(data);
      // Invalidate the query to refetch the latest message
      queryClient.invalidateQueries({ queryKey: ["/api/events", event?.id, "message"] });
      toast({
        title: "Message Generated",
        description: "Your personalized message has been created!",
      });
    },
    onError: (error) => {
      console.error("Generation error:", error);
      toast({
        title: "Generation Failed", 
        description: "Unable to generate message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Generate Message for {event.personName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cheerful">Cheerful</SelectItem>
                  <SelectItem value="heartfelt">Heartfelt</SelectItem>
                  <SelectItem value="funny">Funny</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="length">Length</Label>
              <Select value={length} onValueChange={setLength}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <Button 
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Message
              </>
            )}
          </Button>

          {/* Generated Message Display */}
          {generatedMessage && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {generatedMessage.message}
                </p>
              </div>

              {/* Message Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generatedMessage.message)}
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>

              <div className="text-xs text-gray-500 text-center">
                Generated with {generatedMessage.tone} tone • {generatedMessage.length} length
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}