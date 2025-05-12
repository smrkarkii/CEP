import React, { useState, useEffect } from "react";
import { Loader2, Image as ImageIcon, ZoomIn, ZoomOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";

interface ImageContentViewerProps {
  blobId: string;
  alt?: string;
  allowFullscreen?: boolean;
}

const ImageContentViewer: React.FC<ImageContentViewerProps> = ({
  blobId,
  alt = "Content image",
  allowFullscreen = true,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchImageBlob = async () => {
      if (!blobId) {
        setHasError(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setHasError(false);

        const baseAggregatorUrl =
          "https://aggregator.walrus-testnet.walrus.space";
        const blobUrl = `${baseAggregatorUrl}/v1/blobs/${blobId}`;

        const response = await fetch(blobUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        const imageBlob = await response.blob();

        const reader = new FileReader();
        reader.onloadend = () => {
          setImageDataUrl(reader.result as string);
          setIsLoading(false);
        };
        reader.onerror = () => {
          setHasError(true);
          setIsLoading(false);
        };
        reader.readAsDataURL(imageBlob);
      } catch (err) {
        console.error("Error fetching or processing image:", err);
        setHasError(true);
        setIsLoading(false);
      }
    };

    fetchImageBlob();
  }, [blobId]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const ipfsUrl =
    blobId && !blobId.startsWith("http")
      ? `https://ipfs.io/ipfs/${blobId}`
      : null;

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className={`p-0 relative ${isLoading ? "min-h-40" : ""}`}>
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Loading image...</p>
            </div>
          )}

          {hasError ? (
            <div className="flex flex-col items-center justify-center py-12 bg-muted">
              <ImageIcon className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
              <p className="text-muted-foreground">Image could not be loaded</p>
              {ipfsUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => window.open(ipfsUrl, "_blank")}
                >
                  Try IPFS Link
                </Button>
              )}
            </div>
          ) : (
            <div className="h-[300px] w-[300px]">
              {imageDataUrl && (
                <img
                  src={imageDataUrl}
                  alt={alt}
                  className="w-full h-full object-fill"
                  onError={() => setHasError(true)}
                />
              )}
            </div>
          )}

          {!isLoading && !hasError && imageDataUrl && (
            <div className="absolute bottom-2 right-2 flex gap-1 p-1 bg-background/80 rounded-md shadow-sm">
              {allowFullscreen && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={toggleFullscreen}
                  title="View fullscreen"
                >
                  <ZoomIn size={16} />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fullscreen dialog */}
      {/* <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-screen-lg max-h-80 p-0 ">
          <div className="relative">
            {imageDataUrl && (
              <img
                src={imageDataUrl}
                alt={alt}
                className="w-full h-full object-contain"
              />
            )}

            <div className="absolute top-2 right-2 flex gap-1 p-1 bg-background/80 rounded-md shadow-sm">
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  title="Exit fullscreen"
                >
                  <ZoomOut size={16} />
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog> */}
    </>
  );
};

export default ImageContentViewer;
