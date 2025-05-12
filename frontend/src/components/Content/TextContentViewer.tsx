import React, { useEffect, useState } from "react";
import { Loader2, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TextContentViewerProps {
  blobId: string;
  fallbackContent?: string;
}

const TextContentViewer: React.FC<TextContentViewerProps> = ({
  blobId,
  fallbackContent = "",
}) => {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      if (!blobId) {
        setError("No blob ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const baseAggregatorUrl =
          "https://aggregator.walrus-testnet.walrus.space";
        const blobUrl = `${baseAggregatorUrl}/v1/blobs/${blobId}`;

        const response = await fetch(blobUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch content: ${response.statusText}`);
        }

        const textContent = await response.text();
        setContent(textContent);
      } catch (err) {
        console.error("Error fetching text content:", err);
        setError("Failed to load content");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [blobId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Loading content...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <FileText className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
        <p className="text-muted-foreground">
          {fallbackContent || "No content available"}
        </p>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <pre className="whitespace-pre-wrap font-mono text-sm p-4 overflow-auto">
          {content}
        </pre>
      </CardContent>
    </Card>
  );
};

export default TextContentViewer;
